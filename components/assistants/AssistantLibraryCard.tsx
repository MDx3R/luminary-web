"use client";

import type { ReactNode } from "react";
import { Bot } from "lucide-react";
import type { AssistantSummary } from "@/types/assistant";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AssistantLibraryCardProps {
  assistant: AssistantSummary;
  /** Toolbar on the right (icon buttons, compact buttons). */
  actions: ReactNode;
  className?: string;
}

export function AssistantLibraryCard({
  assistant,
  actions,
  className,
}: AssistantLibraryCardProps) {
  const tags = assistant.tags?.filter(Boolean) ?? [];
  const showMeta = tags.length > 0 || assistant.type;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm shadow-sm",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex size-4 shrink-0 items-center justify-center text-muted-foreground"
          aria-hidden
        >
          <Bot className="size-4" />
        </span>
        <div className="min-w-0 flex-1 space-y-1 text-left">
          <p className="truncate font-medium text-foreground">{assistant.name}</p>
          {assistant.description ? (
            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
              {assistant.description}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-0.5 self-start pt-0.5">
          {actions}
        </div>
      </div>
      {showMeta ? (
        <div className="flex min-w-0 flex-wrap gap-1.5 border-t border-border/60 pt-2">
          {assistant.type ? (
            <Badge
              variant="outline"
              className="shrink-0 text-[10px] font-normal uppercase"
            >
              {assistant.type}
            </Badge>
          ) : null}
          {tags.slice(0, 8).map((t) => (
            <Badge
              key={t}
              variant="secondary"
              className="max-w-full shrink-0 whitespace-normal break-words text-xs font-normal"
            >
              {t}
            </Badge>
          ))}
          {tags.length > 8 ? (
            <Badge variant="secondary" className="shrink-0 text-xs font-normal">
              +{tags.length - 8}
            </Badge>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
