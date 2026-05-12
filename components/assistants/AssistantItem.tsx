"use client";

import { Pencil, Trash2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AssistantSummary } from "@/types/assistant";
import { AssistantLibraryCard } from "@/components/assistants/AssistantLibraryCard";

interface AssistantItemProps {
  assistant: AssistantSummary;
  onEdit: (assistant: AssistantSummary) => void;
  onDelete: (assistant: AssistantSummary) => void;
  /** Publish personal assistant to the public catalog (POST /assistants/{id}/publish). */
  onPublish?: () => void;
  publishPending?: boolean;
}

export function AssistantItem({
  assistant,
  onEdit,
  onDelete,
  onPublish,
  publishPending,
}: AssistantItemProps) {
  return (
    <AssistantLibraryCard
      assistant={assistant}
      actions={
        <>
          {onPublish && assistant.type !== "public" ? (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onPublish}
              disabled={publishPending}
              aria-label={`Опубликовать «${assistant.name}»`}
              title="Опубликовать в каталоге"
            >
              <Share2 className="size-4 text-muted-foreground" />
            </Button>
          ) : null}
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
        </>
      }
    />
  );
}
