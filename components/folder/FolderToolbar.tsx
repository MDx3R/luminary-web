"use client";

import { FileDown, BookMarked, Check, Loader2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFolderStore } from "@/store/useFolderStore";
import { useSourcesStore } from "@/store/useSourcesStore";
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
  const pendingEditorText = useFolderStore((s) => s.pendingEditorText);
  const setSourcesPanelOpen = useSourcesStore((s) => s.setSourcesPanelOpen);

  const exportContent = pendingEditorText ?? currentFolder?.editor?.text ?? "";

  function handleExport() {
    if (!exportContent) return;
    const text = exportContent;
    const name = (currentFolder?.name ?? "export").replace(
      /[^\p{L}\p{N}\s_-]/gu,
      "_"
    );
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleSources() {
    setSourcesPanelOpen(true);
  }

  return (
    <div className="grid h-11 shrink-0 grid-cols-3 items-center gap-2 border-b border-border bg-background px-3">
      <div className="min-w-0" />
      <div className="flex min-w-0 items-center justify-center gap-3">
        <span className="truncate text-sm font-medium">
          {currentFolder?.name ?? "Без названия"}
        </span>
        <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
          <SaveStatusIcon status={saveStatus} />
          {saveStatusLabels[saveStatus]}
        </span>
      </div>
      <div className="flex min-w-0 items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExport}
          aria-label="Экспорт"
          disabled={!exportContent}
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
