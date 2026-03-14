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
import { useNavigationStore } from "@/store/useNavigationStore";
import { mockMessages } from "@/lib/mocks";

const CHAT_PANEL_MIN = "25%";
const CHAT_PANEL_MAX = "35%";
const CHAT_PANEL_DEFAULT = "25%";

interface FolderViewProps {
  folderId: string;
}

export function FolderView({ folderId }: FolderViewProps) {
  const initFromFolderId = useFolderStore((s) => s.initFromFolderId);
  const initChat = useChatStore((s) => s.initChat);
  const chatPanelCollapsed = useNavigationStore((s) => s.chatPanelCollapsed);

  useEffect(() => {
    initFromFolderId(folderId);
    initChat(folderId, mockMessages);
  }, [folderId, initFromFolderId, initChat]);

  if (chatPanelCollapsed) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <EditorPanel />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <ResizablePanelGroup
        orientation="horizontal"
        className="h-full min-h-0 w-full flex-1"
      >
        <ResizablePanel defaultSize="65%" minSize="35%" className="min-h-0">
          <EditorPanel />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={CHAT_PANEL_DEFAULT}
          minSize={CHAT_PANEL_MIN}
          maxSize={CHAT_PANEL_MAX}
          className="min-h-0 h-full flex flex-col"
        >
          <div className="flex min-h-0 flex-1 flex-col">
            <ChatPanel chatId={folderId} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
