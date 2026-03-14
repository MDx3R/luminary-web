"use client";

import { Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFolderStore } from "@/store/useFolderStore";
import { useSourcesStore } from "@/store/useSourcesStore";
import { SourceItem } from "./SourceItem";

export function SourcesPanel() {
  const currentFolder = useFolderStore((s) => s.currentFolder);
  const sourcesPanelOpen = useSourcesStore((s) => s.sourcesPanelOpen);
  const setSourcesPanelOpen = useSourcesStore((s) => s.setSourcesPanelOpen);
  const setAddSourceModalOpen = useSourcesStore((s) => s.setAddSourceModalOpen);
  const getSourcesByFolderId = useSourcesStore((s) => s.getSourcesByFolderId);

  const folderId = currentFolder?.id ?? null;
  const sources = folderId ? getSourcesByFolderId(folderId) : [];

  function handleAddSource() {
    setAddSourceModalOpen(true);
  }

  return (
    <Sheet open={sourcesPanelOpen} onOpenChange={setSourcesPanelOpen}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Источники</SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-3 overflow-hidden px-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddSource}
            className="w-full shrink-0"
          >
            <Plus className="size-4" />
            Add Source
          </Button>
          <ScrollArea className="flex-1 min-h-0">
            {sources.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Нет источников. Добавьте файл или ссылку.
              </p>
            ) : (
              <ul className="flex flex-col gap-2 pb-4">
                {sources.map((source) => (
                  <li key={source.id}>
                    <SourceItem source={source} />
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
