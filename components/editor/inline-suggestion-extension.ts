import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"
import { getInlineSuggestion } from "@/lib/editor/inline-suggestion"

const INLINE_SUGGESTION_DEBOUNCE_MS = 400

interface InlineSuggestionState {
  suggestion: string | null
  pos: number
}

export const inlineSuggestionPluginKey = new PluginKey<InlineSuggestionState>(
  "inlineSuggestion"
)

function getTextBeforeCursor(
  doc: { textBetween: (from: number, to: number, blockSeparator?: string) => string },
  cursorPos: number
): string {
  return doc.textBetween(0, cursorPos, "\n")
}

export const InlineSuggestionExtension = Extension.create({
  name: "inlineSuggestion",

  addProseMirrorPlugins() {
    const editor = this.editor
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    function scheduleFetch(state: import("@tiptap/pm/state").EditorState) {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        debounceTimer = null
        const { doc, selection } = state
        const pos = selection.from
        const textBeforeCursor = getTextBeforeCursor(doc, pos)
        getInlineSuggestion({ textBeforeCursor })
          .then((suggestion) => {
            if (suggestion == null) return
            const { view } = editor
            if (!view) return
            const currentPos = view.state.selection.from
            if (currentPos !== pos) return
            const tr = view.state.tr.setMeta(inlineSuggestionPluginKey, {
              suggestion,
              pos,
            })
            view.dispatch(tr)
          })
          .catch(() => {})
      }, INLINE_SUGGESTION_DEBOUNCE_MS)
    }

    return [
      new Plugin({
        key: inlineSuggestionPluginKey,
        state: {
          init(): InlineSuggestionState {
            return { suggestion: null, pos: 0 }
          },
          apply(tr, value: InlineSuggestionState): InlineSuggestionState {
            const meta = tr.getMeta(inlineSuggestionPluginKey) as
              | InlineSuggestionState
              | undefined
            if (meta) {
              if (tr.selection.from === meta.pos) {
                return { suggestion: meta.suggestion, pos: meta.pos }
              }
              return { suggestion: null, pos: 0 }
            }
            if (tr.selectionSet || tr.docChanged) {
              return { suggestion: null, pos: 0 }
            }
            return value
          },
        },
        props: {
          decorations(state) {
            const pluginState = inlineSuggestionPluginKey.getState(state) as
              | InlineSuggestionState
              | undefined
            if (!pluginState?.suggestion) return null
            const { suggestion, pos } = pluginState
            const size = state.doc.content.size
            if (pos < 0 || pos > size) return null
            const widget = Decoration.widget(pos, () => {
              const span = document.createElement("span")
              span.textContent = suggestion
              span.className = "inline-suggestion-ghost"
              return span
            })
            return DecorationSet.create(state.doc, [widget])
          },
          handleKeyDown(view, event) {
            if (event.key !== "Tab") return false
            const pluginState = inlineSuggestionPluginKey.getState(
              view.state
            ) as InlineSuggestionState | undefined
            if (!pluginState?.suggestion) return false
            const { suggestion, pos } = pluginState
            const size = view.state.doc.content.size
            if (pos < 0 || pos > size) return false
            event.preventDefault()
            view.dispatch(
              view.state.tr
                .insertText(suggestion, pos)
                .setMeta(inlineSuggestionPluginKey, { suggestion: null, pos: 0 })
            )
            return true
          },
        },
        appendTransaction(transactions, _oldState, state) {
          const docChanged = transactions.some((tr) => tr.docChanged)
          if (docChanged || state.selection.from !== state.selection.to) {
            scheduleFetch(state)
          }
          return null
        },
      }),
    ]
  },
})
