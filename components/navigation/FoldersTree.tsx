"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Plus,
  MoreHorizontal,
  FolderOpen,
  MessageSquarePlus,
  FilePlus,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigationStore } from "@/store/useNavigationStore";
import { useSourcesStore } from "@/store/useSourcesStore";
import { listFolders } from "@/lib/api/folders-api";
import { getFolder } from "@/lib/api/folders-api";
import { queryKeys } from "@/lib/query-keys";
import { CreateChatDialog } from "@/components/chat/CreateChatDialog";
import type { FolderSummary } from "@/types/folder";

function FolderRow({
  folder,
  isExpanded,
  onToggle,
  onAddChat,
  onAddSource,
  onAddSourceToChat,
}: {
  folder: FolderSummary;
  isExpanded: boolean;
  onToggle: () => void;
  onAddChat: () => void;
  onAddSource: () => void;
  onAddSourceToChat: (chatId: string) => void;
}) {
  const { data: folderDetails } = useQuery({
    queryKey: queryKeys.folder(folder.id),
    queryFn: () => getFolder(folder.id),
    enabled: isExpanded,
  });
  const chats = folderDetails?.chats ?? [];
  const sourceCount = folderDetails?.sources?.length ?? 0;

  return (
    <div className="group/folder flex flex-col">
      <div
        className={cn(
          "flex min-h-8 cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isExpanded && "bg-sidebar-accent/50"
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center gap-1.5 overflow-hidden text-left outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <ChevronRight
            className={cn(
              "size-4 shrink-0 transition-transform",
              isExpanded && "rotate-90"
            )}
          />
          <FolderOpen className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{folder.name}</span>
          {sourceCount > 0 && (
            <span className="ml-1 shrink-0 text-xs text-muted-foreground">
              {sourceCount}
            </span>
          )}
        </button>
        <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover/folder:opacity-100">
          <button
            type="button"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded hover:bg-sidebar-accent"
            aria-label="Добавить чат"
            onClick={(e) => {
              e.stopPropagation();
              onAddChat();
            }}
          >
            <MessageSquarePlus className="size-3.5" />
          </button>
          <button
            type="button"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded hover:bg-sidebar-accent"
            aria-label="Добавить источник"
            onClick={(e) => {
              e.stopPropagation();
              onAddSource();
            }}
          >
            <FilePlus className="size-3.5" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex size-6 shrink-0 items-center justify-center rounded hover:bg-sidebar-accent"
              aria-label="Меню папки"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right" sideOffset={4}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Переименовать
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => e.preventDefault()}
              >
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {isExpanded && (
        <div className="ml-4 border-l border-sidebar-border pl-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="group/chat flex min-h-7 items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Link
                href={`/folder/${folder.id}?chat=${chat.id}`}
                className="flex min-w-0 flex-1 items-center gap-2"
              >
                <span className="truncate">{chat.name}</span>
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onAddSourceToChat(chat.id);
                }}
                className="inline-flex size-6 shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover/chat:opacity-100 hover:bg-sidebar-accent"
                aria-label="Добавить источник в чат"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function FoldersTree() {
  const expandedFolderIds = useNavigationStore((s) => s.expandedFolderIds);
  const toggleFolderExpanded = useNavigationStore(
    (s) => s.toggleFolderExpanded
  );
  const openAttachModal = useSourcesStore((s) => s.openAttachModal);
  const [createChatOpen, setCreateChatOpen] = useState(false);
  const [createChatFolderId, setCreateChatFolderId] = useState<string | null>(
    null
  );

  const { data: folders = [], isLoading } = useQuery({
    queryKey: queryKeys.folders,
    queryFn: listFolders,
  });

  function handleAddSource(folder: FolderSummary) {
    openAttachModal({ type: "folder", id: folder.id });
  }

  function handleAddChat(folder: FolderSummary) {
    setCreateChatFolderId(folder.id);
    setCreateChatOpen(true);
  }

  function handleAddSourceToChat(chatId: string) {
    openAttachModal({ type: "chat", id: chatId });
  }

  function handleCreateChatOpenChange(open: boolean) {
    if (!open) setCreateChatFolderId(null);
    setCreateChatOpen(open);
  }

  if (isLoading) {
    return (
      <div className="py-2 px-2 text-xs text-muted-foreground">
        Загрузка папок…
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-0.5 py-1">
        {folders.map((folder) => (
          <FolderRow
            key={folder.id}
            folder={folder}
            isExpanded={expandedFolderIds.includes(folder.id)}
            onToggle={() => toggleFolderExpanded(folder.id)}
            onAddChat={() => handleAddChat(folder)}
            onAddSource={() => handleAddSource(folder)}
            onAddSourceToChat={handleAddSourceToChat}
          />
        ))}
      </div>
      <CreateChatDialog
        open={createChatOpen}
        onOpenChange={handleCreateChatOpenChange}
        folderId={createChatFolderId}
      />
    </>
  );
}
