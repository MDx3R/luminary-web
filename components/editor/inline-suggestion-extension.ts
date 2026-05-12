import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { Node as PMNode } from "@tiptap/pm/model";
import { getInlineSuggestion } from "@/lib/editor/inline-suggestion";

const INLINE_SUGGESTION_DEBOUNCE_MS = 400;

interface InlineSuggestionState {
  suggestion: string | null;
  pos: number;
}

export const inlineSuggestionPluginKey = new PluginKey<InlineSuggestionState>(
  "inlineSuggestion"
);

function getTextBeforeCursor(doc: PMNode, cursorPos: number): string {
  return doc.textBetween(0, cursorPos, "\n");
}

function getTextAfterCursor(doc: PMNode, cursorPos: number): string {
  const end = doc.content.size;
  return doc.textBetween(cursorPos, end, "\n");
}

export const InlineSuggestionExtension = Extension.create<{
  folderId: string | null;
}>({
  name: "inlineSuggestion",

  addOptions() {
    return {
      folderId: null as string | null,
    };
  },

  addProseMirrorPlugins() {
    const editor = this.editor;
    const getConfiguredFolderId = () => this.options.folderId;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let inflightAbort: AbortController | null = null;

    function scheduleFetch() {
      if (debounceTimer) clearTimeout(debounceTimer);
      inflightAbort?.abort();
      debounceTimer = setTimeout(() => {
        debounceTimer = null;
        const { view } = editor;
        if (!view) return;
        const state = view.state;
        const { doc, selection } = state;
        const pos = selection.from;
        const textBeforeCursor = getTextBeforeCursor(doc, pos);
        const textAfterCursor = getTextAfterCursor(doc, pos);
        const requestFolderId = getConfiguredFolderId();
        inflightAbort = new AbortController();
        const signal = inflightAbort.signal;
        getInlineSuggestion(
          { textBeforeCursor, textAfterCursor },
          signal,
          requestFolderId ?? undefined
        )
          .then((suggestion) => {
            if (signal.aborted) return;
            if (suggestion == null) return;
            const v = editor.view;
            if (!v) return;
            if (getConfiguredFolderId() !== requestFolderId) return;
            const currentPos = v.state.selection.from;
            if (currentPos !== pos) return;
            const tr = v.state.tr.setMeta(inlineSuggestionPluginKey, {
              suggestion,
              pos,
            });
            v.dispatch(tr);
          })
          .catch(() => {});
      }, INLINE_SUGGESTION_DEBOUNCE_MS);
    }

    return [
      new Plugin({
        key: inlineSuggestionPluginKey,
        state: {
          init(): InlineSuggestionState {
            return { suggestion: null, pos: 0 };
          },
          apply(tr, value: InlineSuggestionState): InlineSuggestionState {
            const meta = tr.getMeta(inlineSuggestionPluginKey) as
              | InlineSuggestionState
              | undefined;
            if (meta) {
              if (tr.selection.from === meta.pos) {
                return { suggestion: meta.suggestion, pos: meta.pos };
              }
              return { suggestion: null, pos: 0 };
            }
            if (tr.selectionSet || tr.docChanged) {
              return { suggestion: null, pos: 0 };
            }
            return value;
          },
        },
        props: {
          decorations(state) {
            const pluginState = inlineSuggestionPluginKey.getState(state) as
              | InlineSuggestionState
              | undefined;
            if (!pluginState?.suggestion) return null;
            const { suggestion, pos } = pluginState;
            const size = state.doc.content.size;
            if (pos < 0 || pos > size) return null;
            const widget = Decoration.widget(pos, () => {
              const span = document.createElement("span");
              span.textContent = suggestion;
              span.className = "inline-suggestion-ghost";
              return span;
            });
            return DecorationSet.create(state.doc, [widget]);
          },
          handleKeyDown(view, event) {
            if (event.key === "Escape") {
              const pluginState = inlineSuggestionPluginKey.getState(
                view.state
              ) as InlineSuggestionState | undefined;
              if (!pluginState?.suggestion) return false;
              event.preventDefault();
              view.dispatch(
                view.state.tr.setMeta(inlineSuggestionPluginKey, {
                  suggestion: null,
                  pos: 0,
                })
              );
              return true;
            }
            if (event.key !== "Tab") return false;
            const pluginState = inlineSuggestionPluginKey.getState(
              view.state
            ) as InlineSuggestionState | undefined;
            if (!pluginState?.suggestion) return false;
            const { suggestion, pos } = pluginState;
            const size = view.state.doc.content.size;
            if (pos < 0 || pos > size) return false;
            event.preventDefault();
            view.dispatch(
              view.state.tr
                .insertText(suggestion, pos)
                .setMeta(inlineSuggestionPluginKey, { suggestion: null, pos: 0 })
            );
            return true;
          },
        },
        appendTransaction(transactions) {
          const shouldSchedule = transactions.some(
            (tr) => tr.docChanged || tr.selectionSet
          );
          if (shouldSchedule) scheduleFetch();
          return null;
        },
      }),
    ];
  },
});
