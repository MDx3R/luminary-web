"use client";

import { Check, Loader2, Circle } from "lucide-react";
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

  return (
    <div className="flex h-11 shrink-0 items-center justify-center gap-3 border-b border-border bg-background px-3">
      <span className="truncate text-sm font-medium">
        {currentFolder?.name ?? "Без названия"}
      </span>
      <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
        <SaveStatusIcon status={saveStatus} />
        {saveStatusLabels[saveStatus]}
      </span>
    </div>
  );
}
