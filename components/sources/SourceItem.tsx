"use client";

import { FileText, Link, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSourcesStore } from "@/store/useSourcesStore";
import type { Source } from "@/types/source";
import { cn } from "@/lib/utils";

interface SourceItemProps {
  source: Source;
}

const statusLabels: Record<Source["status"], string> = {
  indexed: "Indexed",
  processing: "Processing",
};

export function SourceItem({ source }: SourceItemProps) {
  const removeSource = useSourcesStore((s) => s.removeSource);
  const isFile = source.kind === "file";
  const displayTitle =
    source.title || (source.url ? source.url.slice(0, 50) + (source.url.length > 50 ? "…" : "") : "—");

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm"
      )}
    >
      <span className="shrink-0 text-muted-foreground" aria-hidden>
        {isFile ? (
          <FileText className="size-4" />
        ) : (
          <Link className="size-4" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{displayTitle}</p>
        <Badge
          variant={source.status === "indexed" ? "default" : "secondary"}
          className="mt-1 text-xs"
        >
          {statusLabels[source.status]}
        </Badge>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => removeSource(source.id)}
        aria-label="Удалить источник"
      >
        <Trash2 className="size-4 text-muted-foreground" />
      </Button>
    </div>
  );
}
