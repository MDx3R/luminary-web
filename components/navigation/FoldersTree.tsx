"use client"

import Link from "next/link"
import {
  ChevronRight,
  Plus,
  MoreHorizontal,
  FolderOpen,
  MessageSquarePlus,
  FilePlus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNavigationStore } from "@/store/useNavigationStore"
import { useFolderStore } from "@/store/useFolderStore"
import { useSourcesStore } from "@/store/useSourcesStore"
import { mockFolders, getMockFolderChats } from "@/lib/mocks"
import type { Folder } from "@/types/folder"

function FolderRow({
  folder,
  isExpanded,
  onToggle,
  onAddChat,
  onAddSource,
}: {
  folder: Folder
  isExpanded: boolean
  onToggle: () => void
  onAddChat: () => void
  onAddSource: () => void
}) {
  const chats = getMockFolderChats(folder.id)
  const getSourcesByFolderId = useSourcesStore((s) => s.getSourcesByFolderId)
  const sourceCount = getSourcesByFolderId(folder.id).length

  return (
    <div className="group/folder flex flex-col">
      <div
        className={cn(
          "flex min-h-8 cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isExpanded && "bg-sidebar-accent/50"
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center gap-1.5 overflow-hidden text-left outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <ChevronRight
            className={cn("size-4 shrink-0 transition-transform", isExpanded && "rotate-90")}
          />
          <FolderOpen className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{folder.name}</span>
          {sourceCount > 0 && (
            <span className="ml-1 shrink-0 text-xs text-muted-foreground">
              {sourceCount}
            </span>
          )}
        </button>
        <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover/folder:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex size-6 shrink-0 items-center justify-center rounded hover:bg-sidebar-accent"
              aria-label="Добавить в папку"
              onClick={(e) => e.stopPropagation()}
            >
              <Plus className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right" sideOffset={4}>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  onAddChat()
                }}
              >
                <MessageSquarePlus className="size-3.5" />
                Добавить чат
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  onAddSource()
                }}
              >
                <FilePlus className="size-3.5" />
                Добавить источник
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex size-6 shrink-0 items-center justify-center rounded hover:bg-sidebar-accent"
              aria-label="Меню папки"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right" sideOffset={4}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Переименовать
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => e.preventDefault()}
              >
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {isExpanded && (
        <div className="ml-4 border-l border-sidebar-border pl-2">
          {chats.map((chat) => (
            <Link
              key={chat.id}
              href={`/folder/${folder.id}`}
              className="flex min-h-7 items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <span className="truncate">{chat.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function FoldersTree() {
  const expandedFolderIds = useNavigationStore((s) => s.expandedFolderIds)
  const toggleFolderExpanded = useNavigationStore((s) => s.toggleFolderExpanded)
  const setFolder = useFolderStore((s) => s.setFolder)
  const setAddSourceModalOpen = useSourcesStore((s) => s.setAddSourceModalOpen)

  function handleAddSource(folder: Folder) {
    setFolder(folder)
    setAddSourceModalOpen(true)
  }

  function handleAddChat(_folder: Folder) {
    // TODO: create new chat in folder and navigate
  }

  return (
    <div className="flex flex-col gap-0.5 py-1">
      {mockFolders.map((folder) => (
        <FolderRow
          key={folder.id}
          folder={folder}
          isExpanded={expandedFolderIds.includes(folder.id)}
          onToggle={() => toggleFolderExpanded(folder.id)}
          onAddChat={() => handleAddChat(folder)}
          onAddSource={() => handleAddSource(folder)}
        />
      ))}
    </div>
  )
}
