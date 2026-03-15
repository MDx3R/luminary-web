"use client";

import Link from "next/link";
import { FolderOpen, MessageCircle, Bot } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listFolders } from "@/lib/api/folders-api";
import { listChats } from "@/lib/api/chats-api";
import { queryKeys } from "@/lib/query-keys";
import { mockAssistants } from "@/lib/mocks";
import { cn } from "@/lib/utils";

const EMPTY_MESSAGE =
  "Твоя база знаний пуста. Создай папку и загрузи первый документ.";

function RecentWorkSection() {
  const { data: folders = [] } = useQuery({
    queryKey: queryKeys.folders,
    queryFn: listFolders,
  });
  const recentFolders = folders.slice(0, 4);

  if (recentFolders.length === 0) {
    return (
      <Card className="flex flex-col border-dashed">
        <CardContent className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <FolderOpen className="size-10 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">{EMPTY_MESSAGE}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Недавние папки</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2">
          {recentFolders.map((folder) => (
            <Link
              key={folder.id}
              href={`/folder/${folder.id}`}
              className={cn(
                "flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <span className="truncate font-medium">{folder.name}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function JumpBackSection() {
  const { data: chats = [] } = useQuery({
    queryKey: queryKeys.chats,
    queryFn: listChats,
  });
  const recentChats = chats.slice(0, 5);

  if (recentChats.length === 0) {
    return (
      <Card className="flex flex-col border-dashed">
        <CardContent className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <MessageCircle className="size-10 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            Нет недавних чатов
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Вернуться к чатам</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-1">
          {recentChats.map((chat) => (
            <li key={chat.id}>
              <Link
                href={`/chat/${chat.id}`}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <MessageCircle className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{chat.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function TopAssistantsSection() {
  if (mockAssistants.length === 0) {
    return (
      <Card className="flex flex-col border-dashed">
        <CardContent className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <Bot className="size-10 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            Нет избранных ассистентов
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Избранные ассистенты
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {mockAssistants.map((a) => (
            <button
              key={a.id}
              type="button"
              className={cn(
                "flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Bot className="size-4 shrink-0 text-muted-foreground" />
              <span>{a.name}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <div className="md:col-span-2">
        <RecentWorkSection />
      </div>
      <div>
        <JumpBackSection />
      </div>
      <div className="sm:col-span-full">
        <TopAssistantsSection />
      </div>
    </div>
  );
}
