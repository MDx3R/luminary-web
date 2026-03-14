"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useAuthStore } from "@/store/useAuthStore";
import { LogOutIcon, UserIcon } from "lucide-react";

type AuthMode = "login" | "register";

export function Header() {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState<AuthMode>("login");
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const loadSession = useAuthStore((s) => s.loadSession);

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
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-end gap-2 border-b border-border bg-background px-4">
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} defaultMode={authDefaultMode} />
      {!isHydrated ? (
        <div className="h-8 w-20 rounded-lg bg-muted/50 animate-pulse" aria-hidden />
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
                e.preventDefault()
                handleLogout()
              }}
            >
              <LogOutIcon className="size-4" />
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
