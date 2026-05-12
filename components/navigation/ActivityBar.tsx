"use client"

import Link from "next/link"
import {
  LayoutDashboard,
  FileStack,
  Search,
  Library,
  Database,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useNavigationStore, type ActivitySection } from "@/store/useNavigationStore"

const TOP_SECTIONS: { id: ActivitySection; label: string; icon: typeof FileStack }[] = [
  { id: "files", label: "Файлы", icon: FileStack },
  { id: "search", label: "Вопрос с дашборда", icon: Search },
  { id: "assistants", label: "Библиотека ассистентов", icon: Library },
  { id: "sources", label: "Все источники", icon: Database },
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

  function handleSectionClick(id: ActivitySection) {
    const isActive = activeSection === id
    if (isActive && onToggleNavPanel) {
      onToggleNavPanel()
    } else {
      setActiveSection(id)
    }
  }

  return (
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
      </div>
    </aside>
  )
}
