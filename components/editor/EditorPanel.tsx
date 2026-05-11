"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { toast } from "sonner";
import type { Editor } from "@tiptap/core";
import { FolderToolbar } from "@/components/folder/FolderToolbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TiptapEditor } from "./TiptapEditor";
import { EditorPillBar } from "./EditorPillBar";
import type { EditorBubbleMenuCallbacks } from "./EditorBubbleMenu";
import { useFolderStore } from "@/store/useFolderStore";
import { updateFolderEditor, streamFolderEditorInline } from "@/lib/api/folders-api";
import { ApiClientError } from "@/lib/api-client";
import { collectStreamedDeltaText } from "@/lib/stream-aggregate";
import { getMarkdownFromEditor } from "@/lib/editor/markdown-from-editor";

const AUTO_SAVE_DEBOUNCE_MS = 1500;

async function runFolderInlineStream(
  folderId: string,
  instruction: string,
  documentMarkdown: string,
  signal?: AbortSignal
): Promise<string> {
  return collectStreamedDeltaText(
    streamFolderEditorInline(
      folderId,
      {
        instruction,
        document_markdown: documentMarkdown,
      },
      signal
    )
  );
}

export function EditorPanel() {
  const [inlineBusy, setInlineBusy] = useState(false);
  const currentFolder = useFolderStore((s) => s.currentFolder);
  const setSaveStatus = useFolderStore((s) => s.setSaveStatus);
  const setFolder = useFolderStore((s) => s.setFolder);
  const setPendingEditorText = useFolderStore((s) => s.setPendingEditorText);
  const saveTrigger = useFolderStore((s) => s.saveTrigger);
  const folderId = currentFolder?.id ?? "";
  const initialContent = currentFolder?.editor?.text ?? "";

  const lastMarkdownRef = useRef(initialContent);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inlineStreamAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      inlineStreamAbortRef.current?.abort();
    };
  }, []);

  const saveContent = useCallback(async () => {
    if (!folderId) return;
    const text = lastMarkdownRef.current;
    setSaveStatus("saving");
    try {
      await updateFolderEditor(folderId, { text });
      setSaveStatus("saved");
      const folder = useFolderStore.getState().currentFolder;
      if (folder) {
        setFolder({
          ...folder,
          editor: { text, updated_at: new Date().toISOString() },
        });
      }
    } catch (err) {
      setSaveStatus("unsaved");
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Не удалось сохранить изменения.";
      toast.error(message);
    }
  }, [folderId, setSaveStatus, setFolder]);

  useEffect(() => {
    if (saveTrigger > 0) void saveContent();
  }, [saveTrigger, saveContent]);

  const onContentChange = useCallback(
    (markdown: string) => {
      lastMarkdownRef.current = markdown;
      setPendingEditorText(markdown);
      setSaveStatus("unsaved");
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        autoSaveTimerRef.current = null;
        void saveContent();
      }, AUTO_SAVE_DEBOUNCE_MS);
    },
    [setSaveStatus, setPendingEditorText, saveContent]
  );

  useEffect(() => {
    lastMarkdownRef.current = initialContent;
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [folderId, initialContent]);

  const getBubbleMenuCallbacks = useCallback(
    (editor: Editor): EditorBubbleMenuCallbacks => {
      const run = async (instruction: string) => {
        const fid = useFolderStore.getState().currentFolder?.id;
        if (!fid) {
          toast.error("Откройте папку с документом.");
          return;
        }
        const anchor = {
          from: editor.state.selection.from,
          to: editor.state.selection.to,
        };
        const documentMarkdown = getMarkdownFromEditor(editor);
        inlineStreamAbortRef.current?.abort();
        const ac = new AbortController();
        inlineStreamAbortRef.current = ac;
        const { signal } = ac;
        setInlineBusy(true);
        try {
          const result = await runFolderInlineStream(
            fid,
            instruction,
            documentMarkdown,
            signal
          );
          if (editor.isDestroyed || signal.aborted) return;
          const max = editor.state.doc.content.size;
          let from = Math.min(anchor.from, max);
          let to = Math.min(anchor.to, max);
          if (from > to) [from, to] = [to, from];
          const chain = editor.chain().focus();
          if (from !== to) {
            chain.deleteRange({ from, to }).insertContentAt(from, result).run();
          } else {
            chain.insertContentAt(from, result).run();
          }
        } catch (err) {
          if (signal.aborted) return;
          toast.error(
            err instanceof Error ? err.message : "Не удалось выполнить запрос."
          );
        } finally {
          setInlineBusy(false);
        }
      };

      return {
        onAskAI: (selectedText: string) => {
          void run(
            `Ответь или улучши следующий фрагмент (учитывай весь документ как контекст):\n\n${selectedText}`
          );
        },
        onSummarize: (selectedText: string) => {
          void run(`Сделай краткое резюме следующего фрагмента:\n\n${selectedText}`);
        },
        onFixGrammar: (selectedText: string) => {
          void run(
            `Исправь грамматику и стиль, сохрани смысл. Верни только исправленный текст этого фрагмента:\n\n${selectedText}`
          );
        },
        onAskWithComment: (selectedText: string, comment: string) => {
          void run(
            `Запрос пользователя: ${comment}\n\nФрагмент документа:\n\n${selectedText}`
          );
        },
      };
    },
    []
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <FolderToolbar />
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex justify-center px-4 py-4">
          <div className="w-full max-w-[720px] min-w-0">
            <TiptapEditor
              key={folderId || "empty"}
              initialContent={initialContent}
              onContentChange={onContentChange}
              getBubbleMenuCallbacks={getBubbleMenuCallbacks}
              bubbleInlineAiBusy={inlineBusy}
            />
          </div>
        </div>
      </ScrollArea>
      <EditorPillBar />
    </div>
  );
}
