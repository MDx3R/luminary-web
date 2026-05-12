"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
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
import { Button, buttonVariants } from "@/components/ui/button";
import { CreateFolderDialog } from "@/components/folder/CreateFolderDialog";
import { CreateChatDialog } from "@/components/chat/CreateChatDialog";
import { useNavigationStore } from "@/store/useNavigationStore";
import { useSourcesStore } from "@/store/useSourcesStore";
import { MessageSquarePlus, FolderPlus, ChevronsUpDown, Plus, Bot } from "lucide-react";
import { FoldersTree } from "./FoldersTree";
import { StandaloneChatsList } from "./StandaloneChatsList";
import { SourcesSectionContent } from "./SourcesSectionContent";
import { AssistantsSectionContent } from "./AssistantsSectionContent";
import { CreateAssistantModal } from "@/components/assistants/CreateAssistantModal";

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
          multiple
          value={expandedAccordionSections}
          onValueChange={handleAccordionChange}
          className="w-full border-0"
        >
          <AccordionItem value="folders" className="border-0">
            <AccordionTrigger className="py-2 px-3 text-xs font-medium hover:no-underline">
              Папки
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-1 pt-0 [&_a]:no-underline [&_a]:underline-offset-0">
              <FoldersTree />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="standalone" className="border-0">
            <AccordionTrigger className="py-2 px-3 text-xs font-medium hover:no-underline">
              Автономные чаты
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-1 pt-0 [&_a]:no-underline [&_a]:underline-offset-0">
              <StandaloneChatsList />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
    </div>
  );
}

export function NavigationPanel() {
  const activeSection = useNavigationStore((s) => s.activeSection);
  const collapseAllFolders = useNavigationStore((s) => s.collapseAllFolders);
  const setAddSourceModalOpen = useSourcesStore(
    (s) => s.setAddSourceModalOpen
  );
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [createChatOpen, setCreateChatOpen] = useState(false);
  const [createAssistantOpen, setCreateAssistantOpen] = useState(false);

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
      <CreateAssistantModal
        open={createAssistantOpen}
        onOpenChange={setCreateAssistantOpen}
      />
      <div className="flex h-11 shrink-0 items-center justify-center gap-1 border-b border-pane-border px-2">
        {activeSection === "files" && (
          <>
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
          </>
        )}
        {activeSection === "assistants" && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0"
                  onClick={() => setCreateAssistantOpen(true)}
                  aria-label="Новый ассистент"
                >
                  <Bot className="size-5" />
                </Button>
              }
            />
            <TooltipContent side="bottom" sideOffset={4}>
              Новый ассистент
            </TooltipContent>
          </Tooltip>
        )}
        {activeSection === "sources" && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0"
                  onClick={() => setAddSourceModalOpen(true)}
                  aria-label="Новый источник"
                >
                  <Plus className="size-5" />
                </Button>
              }
            />
            <TooltipContent side="bottom" sideOffset={4}>
              Новый источник
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      {activeSection === "files" && <FilesSectionContent />}
      {activeSection === "search" && (
        <div className="flex flex-1 flex-col gap-3 p-4">
          <p className="text-sm text-muted-foreground">
            Быстрый ввод вопроса — на дашборде в поле внизу экрана. Откроется новый
            автономный чат с вашим запросом.
          </p>
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full shrink-0 justify-center no-underline"
            )}
          >
            Открыть дашборд
          </Link>
        </div>
      )}
      {activeSection === "assistants" && <AssistantsSectionContent />}
      {activeSection === "sources" && <SourcesSectionContent />}
    </aside>
  );
}
