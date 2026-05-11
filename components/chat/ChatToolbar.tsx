"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getChat } from "@/lib/api/chats-api";
import { queryKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import { RenameChatDialog } from "./RenameChatDialog";
import { useMinimumPending } from "@/hooks/useMinimumPending";
import { InlineSpinner } from "@/components/shared/InlineSpinner";

interface ChatToolbarProps {
  chatId: string;
}

export function ChatToolbar({ chatId }: ChatToolbarProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const { data: chat, isLoading } = useQuery({
    queryKey: queryKeys.chat(chatId),
    queryFn: () => getChat(chatId),
    enabled: Boolean(chatId),
  });
  const showTitleLoading = useMinimumPending(isLoading);

  return (
    <>
      <div className="flex h-11 shrink-0 items-center justify-center gap-2 border-b border-border bg-background px-3">
        <span className="flex min-w-0 items-center justify-center gap-2 truncate text-sm font-medium text-muted-foreground">
          {showTitleLoading ? (
            <>
              <InlineSpinner className="size-3.5 shrink-0" />
              <span className="truncate">Загрузка…</span>
            </>
          ) : (
            <span className="truncate">{chat?.name ?? "Чат"}</span>
          )}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => setRenameOpen(true)}
          aria-label="Переименовать чат"
          disabled={showTitleLoading}
        >
          <Pencil className="size-3.5" />
        </Button>
      </div>
      <RenameChatDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        chatId={chatId}
        chatName={chat?.name ?? "Чат"}
      />
    </>
  );
}
