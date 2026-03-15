"use client";

import { FileText, Link, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Source } from "@/types/source";
import type { FolderSourceItem } from "@/types/source";
import { cn } from "@/lib/utils";

type SourceLike = Source | FolderSourceItem;

interface SourceItemProps {
  source: SourceLike;
  onRemove?: (sourceId: string) => void;
}

const fetchStatusLabels: Record<string, string> = {
  not_fetched: "Ожидание",
  fetched: "Загружено",
  embedded: "Готово",
  failed: "Ошибка",
};

const fetchStatusBadgeClass: Record<string, string> = {
  not_fetched: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  fetched: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  embedded: "bg-green-500/15 text-green-600 dark:text-green-400",
  failed: "bg-destructive/15 text-destructive",
};

export function SourceItem({ source, onRemove }: SourceItemProps) {
  const type = source.type ?? "file";
  const isFile = type === "file" || type === "page";
  const displayTitle =
    source.title ||
    (source.url
      ? source.url.slice(0, 50) + (source.url.length > 50 ? "…" : "")
      : "—");
  const statusLabel =
    fetchStatusLabels[source.fetch_status] ?? source.fetch_status;
  const statusClass =
    fetchStatusBadgeClass[source.fetch_status] ?? "bg-muted text-muted-foreground";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm"
      )}
    >
      <span className="shrink-0 text-muted-foreground" aria-hidden>
        {isFile ? <FileText className="size-4" /> : <Link className="size-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{displayTitle}</p>
        <Badge
          variant="secondary"
          className={cn("mt-1 text-xs", statusClass)}
        >
          {statusLabel}
        </Badge>
      </div>
      {onRemove && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onRemove(source.id)}
          aria-label="Убрать из папки"
        >
          <Trash2 className="size-4 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}
