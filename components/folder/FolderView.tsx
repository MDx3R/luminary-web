"use client";

import { useEffect } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { EditorPanel } from "@/components/editor/EditorPanel";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { useFolderStore } from "@/store/useFolderStore";
import { useChatStore } from "@/store/useChatStore";
import { mockMessages } from "@/lib/mocks";

interface FolderViewProps {
  folderId: string;
}

export function FolderView({ folderId }: FolderViewProps) {
  const initFromFolderId = useFolderStore((s) => s.initFromFolderId);
  const initChat = useChatStore((s) => s.initChat);

  useEffect(() => {
    initFromFolderId(folderId);
    initChat(folderId, mockMessages);
  }, [folderId, initFromFolderId, initChat]);

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-full min-h-0 w-full"
    >
      <ResizablePanel defaultSize={70} minSize={30} className="min-h-0">
        <EditorPanel />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={30} minSize={20} className="min-h-0">
        <div className="flex h-full min-h-0 flex-col">
          <ChatPanel chatId={folderId} />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
