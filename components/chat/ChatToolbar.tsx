"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getChat } from "@/lib/api/chats-api";
import { queryKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import { RenameChatDialog } from "./RenameChatDialog";

interface ChatToolbarProps {
  chatId: string;
}

export function ChatToolbar({ chatId }: ChatToolbarProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const { data: chat } = useQuery({
    queryKey: queryKeys.chat(chatId),
    queryFn: () => getChat(chatId),
    enabled: Boolean(chatId),
  });

  return (
    <>
      <div className="flex h-11 shrink-0 items-center justify-center gap-2 border-b border-border bg-background px-3">
        <span className="truncate text-sm font-medium text-muted-foreground">
          {chat?.name ?? "Чат"}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => setRenameOpen(true)}
          aria-label="Переименовать чат"
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
