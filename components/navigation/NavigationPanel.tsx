"use client"

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
  const expandedAccordionSections = useNavigationStore(
    (s) => s.expandedAccordionSections
  )
  const setExpandedAccordionSections = useNavigationStore(
    (s) => s.setExpandedAccordionSections
  )

  const handleAccordionChange = (value: string | string[]) => {
    const arr = (
      Array.isArray(value) ? value : value ? [value] : []
    ) as ("folders" | "standalone")[]
    setExpandedAccordionSections(arr)
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ScrollArea className="flex-1 min-h-0">
        <Accordion
          value={expandedAccordionSections}
          onValueChange={handleAccordionChange}
          className="w-full border-0"
        >
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
