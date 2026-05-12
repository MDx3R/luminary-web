"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigationStore } from "@/store/useNavigationStore";
import { LogOutIcon, UserIcon, PanelLeftClose, PanelLeft } from "lucide-react";
import { HeaderContextTitle } from "@/components/shared/HeaderContextTitle";

type AuthMode = "login" | "register";

interface HeaderProps {
  onToggleNavPanel?: () => void;
}

export function Header({ onToggleNavPanel }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [authOpen, setAuthOpen] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState<AuthMode>("login");
  const sessionResolved = useAuthStore((s) => s.sessionResolved);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigationPanelCollapsed = useNavigationStore(
    (s) => s.navigationPanelCollapsed
  );

  useEffect(() => {
    const auth = searchParams.get("auth");
    if (auth === "login" || auth === "register") {
      const mode = auth as AuthMode;
      queueMicrotask(() => {
        setAuthDefaultMode(mode);
        setAuthOpen(true);
      });
      const path =
        pathname && pathname !== "/" ? pathname : "/dashboard";
      router.replace(path, { scroll: false });
    }
  }, [router, pathname, searchParams]);

  async function handleLogout() {
    await logout();
  }

  return (
    <header className="sticky top-0 z-40 grid h-11 w-full shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-sidebar-border bg-sidebar px-3">
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultMode={authDefaultMode}
      />
      <div className="flex min-w-0 items-center gap-1">
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
      </div>
      <div className="flex min-w-0 justify-center px-1">
        <HeaderContextTitle />
      </div>
      <div className="flex shrink-0 items-center justify-end gap-2">
        {!sessionResolved ? (
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
                  void handleLogout();
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
