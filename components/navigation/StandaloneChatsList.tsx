"use client";

import Link from "next/link";
import { FilePlus, MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { listChats } from "@/lib/api/chats-api";
import { queryKeys } from "@/lib/query-keys";
import { useSourcesStore } from "@/store/useSourcesStore";

export function StandaloneChatsList() {
  const openAttachModal = useSourcesStore((s) => s.openAttachModal);
  const { data: chats = [], isLoading } = useQuery({
    queryKey: queryKeys.chats,
    queryFn: listChats,
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
        </div>
      ))}
    </div>
  );
}
