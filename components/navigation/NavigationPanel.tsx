"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { CreateFolderDialog } from "@/components/folder/CreateFolderDialog";
import { CreateChatDialog } from "@/components/chat/CreateChatDialog";
import { useNavigationStore } from "@/store/useNavigationStore";
import { MessageSquarePlus, FolderPlus, ChevronsUpDown } from "lucide-react";
import { FoldersTree } from "./FoldersTree";
import { StandaloneChatsList } from "./StandaloneChatsList";
import { SourcesSectionContent } from "./SourcesSectionContent";

function FilesSectionContent() {
  const expandedAccordionSections = useNavigationStore(
    (s) => s.expandedAccordionSections
  );
  const setExpandedAccordionSections = useNavigationStore(
    (s) => s.setExpandedAccordionSections
  );

  const handleAccordionChange = (value: string | string[]) => {
    const arr = (Array.isArray(value) ? value : value ? [value] : []) as (
      | "folders"
      | "standalone"
    )[];
    setExpandedAccordionSections(arr);
  };

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
  );
}

function PlaceholderSection({ title }: { title: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground/80">
        Скоро будет доступно
      </p>
    </div>
  );
}

export function NavigationPanel() {
  const activeSection = useNavigationStore((s) => s.activeSection);
  const collapseAllFolders = useNavigationStore((s) => s.collapseAllFolders);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [createChatOpen, setCreateChatOpen] = useState(false);

  return (
    <aside className="flex h-full w-full min-w-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
      />
      <CreateChatDialog
        open={createChatOpen}
        onOpenChange={setCreateChatOpen}
      />
      <div className="flex h-11 shrink-0 items-center justify-center gap-1 border-b border-border px-2">
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
      </div>
      {activeSection === "files" && <FilesSectionContent />}
      {activeSection === "search" && (
        <PlaceholderSection title="Поиск по базе знаний" />
      )}
      {activeSection === "assistants" && (
        <PlaceholderSection title="Библиотека ассистентов" />
      )}
      {activeSection === "sources" && <SourcesSectionContent />}
    </aside>
  );
}
