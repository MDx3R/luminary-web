"use client";

import { FolderToolbar } from "@/components/folder/FolderToolbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TiptapEditor } from "./TiptapEditor";
import { useFolderStore } from "@/store/useFolderStore";

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
  const folderId = currentFolder?.id ?? "";
  const initialContent = currentFolder?.editor?.text ?? "";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <FolderToolbar />
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex justify-center px-4 py-4">
          <div className="w-full max-w-[720px] min-w-0">
            <TiptapEditor
              key={folderId || "empty"}
              initialContent={initialContent}
              bubbleMenuCallbacks={bubbleMenuCallbacks}
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
