"use client"

import Link from "next/link"
import { MessageSquarePlus, FolderPlus, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useNavigationStore } from "@/store/useNavigationStore"
import { FoldersTree } from "./FoldersTree"
import { StandaloneChatsList } from "./StandaloneChatsList"

function FilesSectionContent() {
  const collapseAllFolders = useNavigationStore((s) => s.collapseAllFolders)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-1 border-b border-sidebar-border px-2 py-1.5">
        <Link
          href="/dashboard"
          className="flex h-7 flex-1 items-center justify-start gap-1.5 rounded-md px-2 text-xs font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <MessageSquarePlus className="size-3.5" />
          Новый чат
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 flex-1 justify-start gap-1.5 px-2 text-xs"
          onClick={() => {}}
          aria-label="Новая папка"
        >
          <FolderPlus className="size-3.5" />
          Новая папка
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          className="size-7 shrink-0"
          onClick={collapseAllFolders}
          aria-label="Свернуть все папки"
        >
          <ChevronsUpDown className="size-3.5" />
        </Button>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <Accordion defaultValue={["folders", "standalone"]} className="w-full border-0">
          <AccordionItem value="folders" className="border-0">
            <AccordionTrigger className="py-2 px-2 text-xs font-medium hover:no-underline">
              Папки
            </AccordionTrigger>
            <AccordionContent className="pb-1 pt-0 [&_a]:no-underline [&_a]:underline-offset-0">
              <FoldersTree />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="standalone" className="border-0">
            <AccordionTrigger className="py-2 px-2 text-xs font-medium hover:no-underline">
              Автономные чаты
            </AccordionTrigger>
            <AccordionContent className="pb-1 pt-0 [&_a]:no-underline [&_a]:underline-offset-0">
              <StandaloneChatsList />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
    </div>
  )
}

function PlaceholderSection({ title }: { title: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground/80">Скоро будет доступно</p>
    </div>
  )
}

export function NavigationPanel() {
  const activeSection = useNavigationStore((s) => s.activeSection)

  return (
    <aside className="flex h-full w-full min-w-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {activeSection === "files" && <FilesSectionContent />}
      {activeSection === "search" && (
        <PlaceholderSection title="Поиск по базе знаний" />
      )}
      {activeSection === "assistants" && (
        <PlaceholderSection title="Библиотека ассистентов" />
      )}
      {activeSection === "sources" && (
        <PlaceholderSection title="Источники" />
      )}
    </aside>
  )
}
