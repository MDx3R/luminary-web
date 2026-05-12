"use client";

import Link from "next/link";
import { FolderOpen, MessageCircle, Bot } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listFolders } from "@/lib/api/folders-api";
import { listChats } from "@/lib/api/chats-api";
import { listAssistants } from "@/lib/api/assistants-api";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { useMinimumPending } from "@/hooks/useMinimumPending";
import { InlineSpinner } from "@/components/shared/InlineSpinner";
import { useNavigationStore } from "@/store/useNavigationStore";
import { useAssistantsUiStore } from "@/store/useAssistantsUiStore";
import { useAuthStore } from "@/store/useAuthStore";

const EMPTY_MESSAGE =
  "Твоя база знаний пуста. Создай папку и загрузи первый документ.";

function RecentWorkSection() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const { data: folders = [], isLoading } = useQuery({
    queryKey: queryKeys.folders,
    queryFn: listFolders,
    enabled: isLoggedIn,
  });
  const showFoldersLoading = useMinimumPending(isLoading);
  const recentFolders = folders.slice(0, 4);

  if (showFoldersLoading) {
    return (
      <Card className="flex flex-col border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Недавние папки</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
          <InlineSpinner className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Загрузка папок…</p>
        </CardContent>
      </Card>
    );
  }

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
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const { data: chats = [], isLoading } = useQuery({
    queryKey: queryKeys.chats,
    queryFn: listChats,
    enabled: isLoggedIn,
  });
  const showChatsLoading = useMinimumPending(isLoading);
  const recentChats = chats.slice(0, 5);

  if (showChatsLoading) {
    return (
      <Card className="flex flex-col border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Вернуться к чатам</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
          <InlineSpinner className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Загрузка чатов…</p>
        </CardContent>
      </Card>
    );
  }

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
  const openAssistantEditor = useAssistantsUiStore((s) => s.openAssistantEditor);
  const setActiveSection = useNavigationStore((s) => s.setActiveSection);
  const navigationPanelCollapsed = useNavigationStore(
    (s) => s.navigationPanelCollapsed
  );
  const toggleNavigationCollapsed = useNavigationStore(
    (s) => s.toggleNavigationCollapsed
  );

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const { data: assistants = [], isLoading } = useQuery({
    queryKey: queryKeys.assistants,
    queryFn: listAssistants,
    enabled: isLoggedIn,
  });
  const showAssistantsLoading = useMinimumPending(isLoading);

  function openAssistantFromDashboard(assistantId: string) {
    openAssistantEditor(assistantId);
    setActiveSection("assistants");
    if (navigationPanelCollapsed) toggleNavigationCollapsed();
  }

  if (showAssistantsLoading) {
    return (
      <Card className="flex flex-col border-dashed">
        <CardContent className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
          <InlineSpinner className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Загрузка ассистентов…
          </p>
        </CardContent>
      </Card>
    );
  }

  if (assistants.length === 0) {
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
          {assistants.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => openAssistantFromDashboard(a.id)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-left text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground"
              )}
              aria-label={`Редактировать ассистента: ${a.name}`}
            >
              <Bot className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{a.name}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardGrid() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  if (!isLoggedIn) return null;

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
