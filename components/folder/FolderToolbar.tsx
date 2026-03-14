"use client";

import { FileDown, BookMarked, Check, Loader2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFolderStore } from "@/store/useFolderStore";
import type { SaveStatus } from "@/types/folder";

const saveStatusLabels: Record<SaveStatus, string> = {
  saved: "Сохранено",
  saving: "Сохранение…",
  unsaved: "Не сохранено",
};

function SaveStatusIcon({ status }: { status: SaveStatus }) {
  if (status === "saved")
    return <Check className="size-3.5 text-muted-foreground" />;
  if (status === "saving")
    return <Loader2 className="size-3.5 animate-spin text-muted-foreground" />;
  return <Circle className="size-3 text-muted-foreground" />;
}

export function FolderToolbar() {
  const currentFolder = useFolderStore((s) => s.currentFolder);
  const saveStatus = useFolderStore((s) => s.saveStatus);

  function handleExport() {
    // TODO: integrate export
  }

  function handleSources() {
    // TODO: open sources list
  }

  return (
    <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="truncate text-sm font-medium">
          {currentFolder?.name ?? "Без названия"}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <SaveStatusIcon status={saveStatus} />
          {saveStatusLabels[saveStatus]}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExport}
          aria-label="Экспорт"
        >
          <FileDown className="size-4" />
          Export
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSources}
          aria-label="Источники"
        >
          <BookMarked className="size-4" />
          Sources
        </Button>
      </div>
    </div>
  );
}
