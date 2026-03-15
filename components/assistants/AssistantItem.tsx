"use client";

import { Bot, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AssistantSummary } from "@/types/assistant";
import { cn } from "@/lib/utils";

interface AssistantItemProps {
  assistant: AssistantSummary;
  onEdit: (assistant: AssistantSummary) => void;
  onDelete: (assistant: AssistantSummary) => void;
}

export function AssistantItem({
  assistant,
  onEdit,
  onDelete,
}: AssistantItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm"
      )}
    >
      <span className="shrink-0 text-muted-foreground" aria-hidden>
        <Bot className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{assistant.name}</p>
        {assistant.description ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {assistant.description}
          </p>
        ) : null}
        {assistant.type ? (
          <span className="mt-1 inline-block text-xs text-muted-foreground/80">
            {assistant.type}
          </span>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(assistant)}
          aria-label={`Редактировать «${assistant.name}»`}
        >
          <Pencil className="size-4 text-muted-foreground" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(assistant)}
          aria-label={`Удалить «${assistant.name}»`}
        >
          <Trash2 className="size-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
