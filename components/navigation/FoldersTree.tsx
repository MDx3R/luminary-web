"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronRight,
  FilePlus,
  FileText,
  MessageCircle,
  MoreHorizontal,
  FolderOpen,
  MessageSquarePlus,
  Trash2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigationStore } from "@/store/useNavigationStore";
import { useSourcesStore } from "@/store/useSourcesStore";
import { useFolderStore } from "@/store/useFolderStore";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { listFolders, getFolder, deleteFolder, removeChatFromFolder } from "@/lib/api/folders-api";
import { queryKeys } from "@/lib/query-keys";
import { CreateChatDialog } from "@/components/chat/CreateChatDialog";
import { RenameFolderDialog } from "@/components/folder/RenameFolderDialog";
import { RenameChatDialog } from "@/components/chat/RenameChatDialog";
import { ApiClientError } from "@/lib/api-client";
import type { FolderSummary } from "@/types/folder";

function FolderRow({
  folder,
  isExpanded,
  onToggle,
  onAddChat,
  onAddSource,
  onAddSourceToChat,
  onDeleteFolder,
  onRenameFolder,
  onRenameChatInFolder,
  onRemoveChatFromFolder,
}: {
  folder: FolderSummary;
  isExpanded: boolean;
  onToggle: () => void;
  onAddChat: () => void;
  onAddSource: () => void;
  onAddSourceToChat: (chatId: string) => void;
  onDeleteFolder: (folder: FolderSummary) => void;
  onRenameFolder: (folder: FolderSummary) => void;
  onRenameChatInFolder: (folderId: string, chatId: string, chatName: string) => void;
  onRemoveChatFromFolder: (folderId: string, chatId: string, chatName: string) => void;
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
              <DropdownMenuItem onClick={() => onRenameFolder(folder)}>
                Переименовать
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDeleteFolder(folder)}
              >
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {isExpanded && (
        <div className="ml-4 border-l border-sidebar-border pl-2">
          <div className="group/chat flex min-h-7 items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <Link
              href={`/folder/${folder.id}`}
              className="flex min-w-0 flex-1 items-center gap-2"
            >
              <FileText className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">Editor.md</span>
            </Link>
          </div>
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="group/chat flex min-h-7 items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Link
                href={`/folder/${folder.id}?chat=${chat.id}`}
                className="flex min-w-0 flex-1 items-center gap-2"
              >
                <MessageCircle className="size-3.5 shrink-0 text-muted-foreground" />
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
                <FilePlus className="size-3.5" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="inline-flex size-6 shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover/chat:opacity-100 hover:bg-sidebar-accent"
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreHorizontal className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="right" sideOffset={4}>
                  <DropdownMenuItem
                    onClick={() =>
                      onRenameChatInFolder(folder.id, chat.id, chat.name)
                    }
                  >
                    Переименовать
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() =>
                      onRemoveChatFromFolder(folder.id, chat.id, chat.name)
                    }
                  >
                    <Trash2 className="size-3.5" />
                    Убрать из папки
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function FoldersTree() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const expandedFolderIds = useNavigationStore((s) => s.expandedFolderIds);
  const toggleFolderExpanded = useNavigationStore(
    (s) => s.toggleFolderExpanded
  );
  const openAttachModal = useSourcesStore((s) => s.openAttachModal);
  const currentFolderId = useFolderStore((s) => s.currentFolder?.id);
  const clearFolder = useFolderStore((s) => s.clearFolder);
  const [createChatOpen, setCreateChatOpen] = useState(false);
  const [createChatFolderId, setCreateChatFolderId] = useState<string | null>(
    null
  );
  const [folderToDelete, setFolderToDelete] = useState<FolderSummary | null>(null);
  const [folderToRename, setFolderToRename] = useState<FolderSummary | null>(null);
  const [chatToRenameInFolder, setChatToRenameInFolder] = useState<{
    folderId: string;
    chatId: string;
    chatName: string;
  } | null>(null);
  const [chatToRemoveFromFolder, setChatToRemoveFromFolder] = useState<{
    folderId: string;
    chatId: string;
    chatName: string;
  } | null>(null);

  const { data: folders = [], isLoading } = useQuery({
    queryKey: queryKeys.folders,
    queryFn: listFolders,
  });

  const deleteFolderMutation = useMutation({
    mutationFn: (id: string) => deleteFolder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.folders });
      if (currentFolderId === id) {
        clearFolder();
        router.push("/");
      }
    },
    onError: (err) => {
      const msg =
        err instanceof ApiClientError ? err.message : "Не удалось удалить папку.";
      toast.error(msg);
    },
  });

  const removeChatFromFolderMutation = useMutation({
    mutationFn: ({ folderId, chatId }: { folderId: string; chatId: string }) =>
      removeChatFromFolder(folderId, chatId),
    onSuccess: (_, { folderId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.folder(folderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.folders });
    },
    onError: (err) => {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : "Не удалось убрать чат из папки.";
      toast.error(msg);
    },
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

  function handleDeleteFolder(folder: FolderSummary) {
    setFolderToDelete(folder);
  }

  function handleRenameFolder(folder: FolderSummary) {
    setFolderToRename(folder);
  }

  async function handleConfirmDeleteFolder() {
    if (!folderToDelete) return;
    await deleteFolderMutation.mutateAsync(folderToDelete.id);
  }

  function handleRenameChatInFolder(
    folderId: string,
    chatId: string,
    chatName: string
  ) {
    setChatToRenameInFolder({ folderId, chatId, chatName });
  }

  function handleRemoveChatFromFolder(
    folderId: string,
    chatId: string,
    chatName: string
  ) {
    setChatToRemoveFromFolder({ folderId, chatId, chatName });
  }

  async function handleConfirmRemoveChatFromFolder() {
    if (!chatToRemoveFromFolder) return;
    await removeChatFromFolderMutation.mutateAsync({
      folderId: chatToRemoveFromFolder.folderId,
      chatId: chatToRemoveFromFolder.chatId,
    });
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
            onDeleteFolder={handleDeleteFolder}
            onRenameFolder={handleRenameFolder}
            onRenameChatInFolder={handleRenameChatInFolder}
            onRemoveChatFromFolder={handleRemoveChatFromFolder}
          />
        ))}
      </div>
      <CreateChatDialog
        open={createChatOpen}
        onOpenChange={handleCreateChatOpenChange}
        folderId={createChatFolderId}
      />
      <RenameFolderDialog
        key={folderToRename ? `folder-${folderToRename.id}` : "folder-closed"}
        open={!!folderToRename}
        onOpenChange={(open) => !open && setFolderToRename(null)}
        folderId={folderToRename?.id ?? null}
        folderName={folderToRename?.name ?? ""}
        folderDescription={folderToRename?.description ?? null}
      />
      <RenameChatDialog
        key={chatToRenameInFolder ? `chat-${chatToRenameInFolder.chatId}` : "chat-closed"}
        open={!!chatToRenameInFolder}
        onOpenChange={(open) => !open && setChatToRenameInFolder(null)}
        chatId={chatToRenameInFolder?.chatId ?? null}
        chatName={chatToRenameInFolder?.chatName ?? ""}
        folderId={chatToRenameInFolder?.folderId ?? null}
      />
      <ConfirmDeleteDialog
        open={!!folderToDelete}
        onOpenChange={(open) => !open && setFolderToDelete(null)}
        title="Удалить папку?"
        description={
          folderToDelete
            ? `Папка «${folderToDelete.name}» и все связанные данные будут удалены.`
            : ""
        }
        onConfirm={handleConfirmDeleteFolder}
        isPending={deleteFolderMutation.isPending}
      />
      <ConfirmDeleteDialog
        open={!!chatToRemoveFromFolder}
        onOpenChange={(open) => !open && setChatToRemoveFromFolder(null)}
        title="Убрать чат из папки?"
        description={
          chatToRemoveFromFolder
            ? `Чат «${chatToRemoveFromFolder.chatName}» будет отвязан от папки.`
            : ""
        }
        confirmLabel="Убрать"
        onConfirm={handleConfirmRemoveChatFromFolder}
        isPending={removeChatFromFolderMutation.isPending}
      />
    </>
  );
}
