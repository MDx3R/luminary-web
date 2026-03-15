"use client"

import Link from "next/link"
import {
  LayoutDashboard,
  FileStack,
  Search,
  Library,
  Database,
  Settings,
  User,
  LogOutIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useNavigationStore, type ActivitySection } from "@/store/useNavigationStore"
import { useAuthStore } from "@/store/useAuthStore"
import { AuthDialog } from "@/components/auth/AuthDialog"
import { useState } from "react"

const TOP_SECTIONS: { id: ActivitySection; label: string; icon: typeof FileStack }[] = [
  { id: "files", label: "Файлы", icon: FileStack },
  { id: "search", label: "Поиск", icon: Search },
  { id: "assistants", label: "Библиотека ассистентов", icon: Library },
  { id: "sources", label: "Источники", icon: Database },
]

function ActivityBarButton({
  label,
  icon: Icon,
  isActive,
  onClick,
}: {
  label: string
  icon: typeof FileStack
  isActive: boolean
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-current={isActive ? "true" : undefined}
        className={cn(
          "relative flex size-14 w-full items-center justify-center rounded-none text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive && "text-sidebar-accent-foreground"
        )}
      >
        {isActive && (
          <span
            className="absolute left-0 top-1/2 h-8 w-0.5 -translate-y-1/2 rounded-r bg-primary"
            aria-hidden
          />
        )}
        <Icon className="size-5 shrink-0" />
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

interface ActivityBarProps {
  onToggleNavPanel?: () => void
}

export function ActivityBar({ onToggleNavPanel }: ActivityBarProps = {}) {
  const activeSection = useNavigationStore((s) => s.activeSection)
  const setActiveSection = useNavigationStore((s) => s.setActiveSection)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [authOpen, setAuthOpen] = useState(false)

  async function handleLogout() {
    await logout()
  }

  function handleSectionClick(id: ActivitySection) {
    const isActive = activeSection === id
    if (isActive && onToggleNavPanel) {
      onToggleNavPanel()
    } else {
      setActiveSection(id)
    }
  }

  return (
    <>
      <aside
        className="flex w-14 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/95 text-sidebar-foreground"
        aria-label="Панель активностей"
      >
        <nav className="flex flex-1 flex-col pt-2" aria-label="Разделы">
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  href="/dashboard"
                  aria-label="Дашборд"
                  className="flex size-14 w-full items-center justify-center rounded-none text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <LayoutDashboard className="size-5" />
                </Link>
              }
            />
            <TooltipContent side="right" sideOffset={8}>
              Дашборд
            </TooltipContent>
          </Tooltip>
          {TOP_SECTIONS.map(({ id, label, icon }) => (
            <ActivityBarButton
              key={id}
              label={label}
              icon={icon}
              isActive={activeSection === id}
              onClick={() => handleSectionClick(id)}
            />
          ))}
        </nav>

        <div className="flex flex-col border-t border-sidebar-border">
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  href="/settings"
                  aria-label="Настройки"
                  className="flex size-14 w-full items-center justify-center rounded-none text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <Settings className="size-5" />
                </Link>
              }
            />
            <TooltipContent side="right" sideOffset={8}>
              Настройки
            </TooltipContent>
          </Tooltip>

          {!isLoggedIn ? (
            <Tooltip>
              <TooltipTrigger
                type="button"
                onClick={() => setAuthOpen(true)}
                aria-label="Профиль пользователя"
                className="flex size-14 w-full items-center justify-center rounded-none text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <User className="size-5" />
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Войти
              </TooltipContent>
            </Tooltip>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex size-14 w-full items-center justify-center rounded-none text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                aria-label={user?.username ?? "Профиль пользователя"}
              >
                <Avatar size="default" className="size-8">
                  <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                    <User className="size-4" />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" sideOffset={8}>
                <DropdownMenuItem>
                  <Link href="/settings">Настройки</Link>
                </DropdownMenuItem>
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
        </div>
      </aside>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} defaultMode="login" />
    </>
  )
}
