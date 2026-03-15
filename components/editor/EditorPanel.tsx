"use client";

import { useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { FolderToolbar } from "@/components/folder/FolderToolbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TiptapEditor } from "./TiptapEditor";
import { EditorPillBar } from "./EditorPillBar";
import { useFolderStore } from "@/store/useFolderStore";
import { updateFolderEditor } from "@/lib/api/folders-api";
import { ApiClientError } from "@/lib/api-client";

const AUTO_SAVE_DEBOUNCE_MS = 1500;

function useBubbleMenuStubs() {
  return {
    onAskAI(selectedText: string) {
      console.log("Ask AI:", selectedText);
      // TODO: send to chat / API
    },
    onSummarize(selectedText: string) {
      console.log("Summarize:", selectedText);
      // TODO: call API
    },
    onFixGrammar(selectedText: string) {
      console.log("Fix Grammar:", selectedText);
      // TODO: call API
    },
    onAskWithComment(selectedText: string, comment: string) {
      console.log("Ask with comment:", { selectedText, comment });
      // TODO: send to chat / API with custom prompt
    },
  };
}

export function EditorPanel() {
  const bubbleMenuCallbacks = useBubbleMenuStubs();
  const currentFolder = useFolderStore((s) => s.currentFolder);
  const setSaveStatus = useFolderStore((s) => s.setSaveStatus);
  const setFolder = useFolderStore((s) => s.setFolder);
  const setPendingEditorText = useFolderStore((s) => s.setPendingEditorText);
  const saveTrigger = useFolderStore((s) => s.saveTrigger);
  const folderId = currentFolder?.id ?? "";
  const initialContent = currentFolder?.editor?.text ?? "";

  const lastMarkdownRef = useRef(initialContent);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
              bubbleMenuCallbacks={bubbleMenuCallbacks}
            />
          </div>
        </div>
      </ScrollArea>
      <EditorPillBar />
    </div>
  );
}
