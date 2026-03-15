"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { FilePlus, MessageCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { listChats, deleteChat } from "@/lib/api/chats-api";
import { queryKeys } from "@/lib/query-keys";
import { useSourcesStore } from "@/store/useSourcesStore";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { RenameChatDialog } from "@/components/chat/RenameChatDialog";
import { ApiClientError } from "@/lib/api-client";

export function StandaloneChatsList() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const openAttachModal = useSourcesStore((s) => s.openAttachModal);
  const [chatToDelete, setChatToDelete] = useState<{ id: string; name: string } | null>(null);
  const [chatToRename, setChatToRename] = useState<{ id: string; name: string } | null>(null);

  const { data: chats = [], isLoading } = useQuery({
    queryKey: queryKeys.chats,
    queryFn: listChats,
  });

  const deleteChatMutation = useMutation({
    mutationFn: (id: string) => deleteChat(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats });
      if (pathname === `/chat/${id}`) router.push("/");
      toast.success("Чат удалён");
    },
    onError: (err) => {
      const msg =
        err instanceof ApiClientError ? err.message : "Не удалось удалить чат.";
      toast.error(msg);
    },
  });

  if (isLoading) {
    return (
      <div className="px-2 py-2 text-xs text-muted-foreground">
        Загрузка чатов…
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <p className="px-2 py-2 text-xs text-muted-foreground">
        Нет автономных чатов
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-0.5 py-1">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={cn(
              "group/chat flex min-h-8 items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Link
              href={`/chat/${chat.id}`}
              className="flex min-w-0 flex-1 items-center gap-2"
            >
              <MessageCircle className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{chat.name}</span>
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                openAttachModal({ type: "chat", id: chat.id });
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
                    setChatToRename({ id: chat.id, name: chat.name })
                  }
                >
                  <Pencil className="size-3.5" />
                  Переименовать
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() =>
                    setChatToDelete({ id: chat.id, name: chat.name })
                  }
                >
                  <Trash2 className="size-3.5" />
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
      <ConfirmDeleteDialog
        open={!!chatToDelete}
        onOpenChange={(open) => !open && setChatToDelete(null)}
        title="Удалить чат?"
        description={
          chatToDelete
            ? `Чат «${chatToDelete.name}» будет удалён без возможности восстановления.`
            : ""
        }
        onConfirm={async () => {
          if (chatToDelete) await deleteChatMutation.mutateAsync(chatToDelete.id);
        }}
        isPending={deleteChatMutation.isPending}
      />
      <RenameChatDialog
        key={chatToRename?.id ?? "closed"}
        open={!!chatToRename}
        onOpenChange={(open) => !open && setChatToRename(null)}
        chatId={chatToRename?.id ?? null}
        chatName={chatToRename?.name ?? ""}
      />
    </>
  );
}
