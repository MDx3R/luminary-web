"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/useAuthStore";
import { LogOutIcon, UserIcon } from "lucide-react";

export function Header() {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const loadSession = useAuthStore((s) => s.loadSession);

  useEffect(() => {
    loadSession()
  }, [loadSession])

  async function handleLogout() {
    await logout()
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-end gap-2 border-b border-border bg-background px-4">
      {!isLoggedIn ? (
        <Link href="/login" className={buttonVariants({ variant: "default", size: "default" })}>
          Войти
        </Link>
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
