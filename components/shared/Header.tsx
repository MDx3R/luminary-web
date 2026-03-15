"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { CreateFolderDialog } from "@/components/folder/CreateFolderDialog";
import { CreateChatDialog } from "@/components/chat/CreateChatDialog";
import { useAuthStore } from "@/store/useAuthStore";
import { useFolderStore } from "@/store/useFolderStore";
import { useNavigationStore } from "@/store/useNavigationStore";
import {
  LogOutIcon,
  UserIcon,
  PanelLeftClose,
  PanelLeft,
  MessageSquarePlus,
  FolderPlus,
  ChevronsUpDown,
  PanelRightClose,
  PanelRight,
} from "lucide-react";

type AuthMode = "login" | "register";

interface HeaderProps {
  onToggleNavPanel?: () => void;
  onToggleChatPanel?: () => void;
}

export function Header({ onToggleNavPanel, onToggleChatPanel }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [authOpen, setAuthOpen] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState<AuthMode>("login");
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [createChatOpen, setCreateChatOpen] = useState(false);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const loadSession = useAuthStore((s) => s.loadSession);
  const navigationPanelCollapsed = useNavigationStore(
    (s) => s.navigationPanelCollapsed
  );
  const collapseAllFolders = useNavigationStore((s) => s.collapseAllFolders);
  const chatPanelCollapsed = useNavigationStore((s) => s.chatPanelCollapsed);
  const folderHasChats = useFolderStore((s) => s.folderHasChats);

  const isFolderView = pathname?.startsWith("/folder/") ?? false;

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const auth = new URLSearchParams(window.location.search).get("auth");
    if (auth === "login" || auth === "register") {
      const mode = auth as AuthMode;
      queueMicrotask(() => {
        setAuthDefaultMode(mode);
        setAuthOpen(true);
      });
      router.replace("/", { scroll: false });
    }
  }, [router]);

  async function handleLogout() {
    await logout();
  }

  return (
    <header className="sticky top-0 z-40 flex h-11 w-full shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-3">
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultMode={authDefaultMode}
      />
      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
      />
      <CreateChatDialog
        open={createChatOpen}
        onOpenChange={setCreateChatOpen}
      />
      <div className="flex min-w-0 flex-1 items-center gap-1">
        {onToggleNavPanel && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0"
                  onClick={onToggleNavPanel}
                  aria-label={
                    navigationPanelCollapsed
                      ? "Показать панель"
                      : "Скрыть панель"
                  }
                >
                  {navigationPanelCollapsed ? (
                    <PanelLeft className="size-5" />
                  ) : (
                    <PanelLeftClose className="size-5" />
                  )}
                </Button>
              }
            />
            <TooltipContent side="bottom" sideOffset={4}>
              {navigationPanelCollapsed ? "Показать панель" : "Скрыть панель"}
            </TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0"
                onClick={() => setCreateChatOpen(true)}
                aria-label="Новый чат"
              >
                <MessageSquarePlus className="size-5" />
              </Button>
            }
          />
          <TooltipContent side="bottom" sideOffset={4}>
            Новый чат
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0"
                onClick={() => setCreateFolderOpen(true)}
                aria-label="Новая папка"
              >
                <FolderPlus className="size-5" />
              </Button>
            }
          />
          <TooltipContent side="bottom" sideOffset={4}>
            Новая папка
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0"
                onClick={collapseAllFolders}
                aria-label="Свернуть все папки"
              >
                <ChevronsUpDown className="size-5" />
              </Button>
            }
          />
          <TooltipContent side="bottom" sideOffset={4}>
            Свернуть все папки
          </TooltipContent>
        </Tooltip>
        {isFolderView && folderHasChats && onToggleChatPanel && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0"
                  onClick={onToggleChatPanel}
                  aria-label={
                    chatPanelCollapsed ? "Показать чат" : "Скрыть чат"
                  }
                >
                  {chatPanelCollapsed ? (
                    <PanelRight className="size-5" />
                  ) : (
                    <PanelRightClose className="size-5" />
                  )}
                </Button>
              }
            />
            <TooltipContent side="bottom" sideOffset={4}>
              {chatPanelCollapsed ? "Показать чат" : "Скрыть чат"}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {!isHydrated ? (
          <div
            className="h-8 w-20 rounded-lg bg-muted/50 animate-pulse"
            aria-hidden
          />
        ) : !isLoggedIn ? (
          <button
            type="button"
            className={buttonVariants({ variant: "default", size: "default" })}
            onClick={() => setAuthOpen(true)}
          >
            Войти
          </button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Меню пользователя"
            >
              <Avatar size="default" className="size-8">
                <AvatarFallback className="bg-muted text-muted-foreground">
                  <UserIcon className="size-4" />
                </AvatarFallback>
              </Avatar>
              <span className="max-w-32 truncate text-sm font-medium md:max-w-48">
                {user?.username ?? "…"}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                <LogOutIcon className="size-4" />
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
