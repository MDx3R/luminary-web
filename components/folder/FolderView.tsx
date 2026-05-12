"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useQuery } from "@tanstack/react-query";
import { EditorPanel } from "@/components/editor/EditorPanel";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { useFolderStore } from "@/store/useFolderStore";
import { useNavigationStore } from "@/store/useNavigationStore";
import { getFolder } from "@/lib/api/folders-api";
import { listMessages } from "@/lib/api/chats-api";
import { queryKeys } from "@/lib/query-keys";
import { useHydrateChatMessages } from "@/hooks/useHydrateChatMessages";
import { useMinimumPending } from "@/hooks/useMinimumPending";
import { ListLoadingRow } from "@/components/shared/ListLoadingRow";
import { CreateChatDialog } from "@/components/chat/CreateChatDialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PanelRight, PanelRightClose } from "lucide-react";

const CHAT_PANEL_MIN = "25%";
const CHAT_PANEL_MAX = "35%";

interface FolderViewProps {
  folderId: string;
}

export function FolderView({ folderId }: FolderViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [createChatOpen, setCreateChatOpen] = useState(false);
  const setFolder = useFolderStore((s) => s.setFolder);
  const clearFolder = useFolderStore((s) => s.clearFolder);
  const selectedChatId = useFolderStore((s) => s.selectedChatId);
  const setSelectedChatId = useFolderStore((s) => s.setSelectedChatId);
  const chatPanelCollapsed = useNavigationStore((s) => s.chatPanelCollapsed);
  const toggleChatPanelCollapsed = useNavigationStore(
    (s) => s.toggleChatPanelCollapsed
  );

  const chatFromUrl = searchParams.get("chat");

  const { data: folder, isLoading: folderLoading } = useQuery({
    queryKey: queryKeys.folder(folderId),
    queryFn: () => getFolder(folderId),
    enabled: Boolean(folderId),
  });
  const showFolderLoading = useMinimumPending(folderLoading);

  useEffect(() => {
    if (folder) setFolder(folder);
    return () => clearFolder();
  }, [folder, setFolder, clearFolder]);

  const folderChats = folder?.chats ?? [];
  const chatInFolder =
    Boolean(chatFromUrl) &&
    folderChats.some((c) => c.id === chatFromUrl);
  const validChatFromUrl = chatInFolder ? chatFromUrl : null;

  useEffect(() => {
    if (!folder || folderChats.length === 0 || !chatFromUrl) return;
    if (folderChats.some((c) => c.id === chatFromUrl)) return;
    const fallback = folderChats[0]!.id;
    router.replace(`/folder/${folderId}?chat=${fallback}`, { scroll: false });
  }, [folder, folderChats, chatFromUrl, folderId, router]);

  const effectiveChatId =
    validChatFromUrl ||
    selectedChatId ||
    (folderChats.length ? folderChats[0]!.id : null);

  useEffect(() => {
    if (effectiveChatId && effectiveChatId !== selectedChatId)
      setSelectedChatId(effectiveChatId);
  }, [effectiveChatId, selectedChatId, setSelectedChatId]);

  const { data: messages } = useQuery({
    queryKey: queryKeys.messages(effectiveChatId ?? ""),
    queryFn: () => listMessages(effectiveChatId!),
    enabled: Boolean(effectiveChatId),
  });

  useHydrateChatMessages(effectiveChatId, messages);

  // Синхронизация URL с активным чатом, чтобы закладки и «Назад» отражали выбранный чат
  useEffect(() => {
    if (
      folder &&
      (folder.chats?.length ?? 0) > 0 &&
      !chatFromUrl &&
      effectiveChatId
    ) {
      router.replace(`/folder/${folderId}?chat=${effectiveChatId}`, {
        scroll: false,
      });
    }
  }, [folder, folderId, chatFromUrl, effectiveChatId, router]);

  if (showFolderLoading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        <ListLoadingRow label="Загрузка папки…" className="text-sm" />
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">Папка не найдена</p>
      </div>
    );
  }

  const hasChats = (folder.chats?.length ?? 0) > 0;

  if (!hasChats) {
    return (
      <>
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-border bg-muted/25 px-4 py-3">
            <p className="mb-2 text-sm text-muted-foreground">
              В этой папке пока нет чатов. Создайте чат, чтобы обсуждать источники и
              переносить выводы в документ.
            </p>
            <Button
              type="button"
              size="sm"
              onClick={() => setCreateChatOpen(true)}
            >
              Новый чат в папке
            </Button>
          </div>
          <EditorPanel />
        </div>
        <CreateChatDialog
          open={createChatOpen}
          onOpenChange={setCreateChatOpen}
          folderId={folderId}
        />
      </>
    );
  }

  if (chatPanelCollapsed) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-end gap-2 border-b border-border bg-muted/15 px-2 py-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2 text-xs text-muted-foreground"
                  onClick={toggleChatPanelCollapsed}
                  aria-label="Показать чат папки"
                >
                  <PanelRight className="size-4 shrink-0" />
                  Показать чат
                </Button>
              }
            />
            <TooltipContent side="bottom" sideOffset={4}>
              Открыть панель чата справа
            </TooltipContent>
          </Tooltip>
        </div>
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
        <ResizablePanel defaultSize="70%" minSize="35%" className="min-h-0">
          <EditorPanel />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize="30%"
          minSize={CHAT_PANEL_MIN}
          maxSize={CHAT_PANEL_MAX}
          className="min-h-0 flex h-full flex-col"
        >
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 items-center justify-end border-b border-border bg-muted/15 px-1.5 py-0.5">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 text-muted-foreground"
                      onClick={toggleChatPanelCollapsed}
                      aria-label="Скрыть чат папки"
                    >
                      <PanelRightClose className="size-5" />
                    </Button>
                  }
                />
                <TooltipContent side="bottom" sideOffset={4}>
                  Скрыть чат
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="min-h-0 flex-1 flex flex-col">
              <ChatPanel
                chatId={effectiveChatId}
                assistantEmptyLabel="Ассистент папки"
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
