"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Настройки", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 shrink-0 items-center border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="text-lg">Luminary</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex h-8 items-center gap-2 rounded-lg px-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 border-t border-sidebar-border px-2 pt-2">
          <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">
            Папки и чаты
          </p>
          <p className="px-2 text-sm text-muted-foreground">
            Список появится здесь
          </p>
        </div>
      </ScrollArea>
    </aside>
  );
}
