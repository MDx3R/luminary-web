"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, FileText, Link, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateSource } from "@/lib/api/sources-api";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import type { Source } from "@/types/source";
import { ApiClientError } from "@/lib/api-client";
import { useMinimumPending } from "@/hooks/useMinimumPending";
import { InlineSpinner } from "@/components/shared/InlineSpinner";

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

interface SourceAttachCardProps {
  source: Source;
  /** Disables checkbox (attach/detach), delete menu, and title save. */
  attachBusy: boolean;
  folderId: string | null;
  chatId: string | null;
  onRequestDelete: () => void;
  /** Показывать чекбокс привязки к папке/чату. Для раздела «Все источники» — false. */
  showAttachCheckbox?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function SourceAttachCard({
  source,
  attachBusy,
  folderId,
  chatId,
  onRequestDelete,
  showAttachCheckbox = true,
  checked = false,
  onCheckedChange,
}: SourceAttachCardProps) {
  const queryClient = useQueryClient();
  const [titleDraft, setTitleDraft] = useState(source.title ?? "");
  const [titleError, setTitleError] = useState<string | null>(null);

  useEffect(() => {
    setTitleDraft(source.title ?? "");
    setTitleError(null);
  }, [source.id, source.title]);

  const trimmedServer = (source.title ?? "").trim();
  const trimmedDraft = titleDraft.trim();
  const titleDirty = trimmedDraft !== trimmedServer;

  const saveMutation = useMutation({
    mutationFn: () => updateSource(source.id, { title: trimmedDraft }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sources });
      if (folderId)
        queryClient.invalidateQueries({ queryKey: queryKeys.folder(folderId) });
      if (chatId) queryClient.invalidateQueries({ queryKey: queryKeys.chat(chatId) });
      setTitleError(null);
    },
    onError: (err) => {
      setTitleError(
        err instanceof ApiClientError ? err.message : "Не удалось сохранить название."
      );
    },
  });
  const showSavePending = useMinimumPending(saveMutation.isPending);

  const type = source.type ?? "file";
  const isFile = type === "file" || type === "page";
  const statusLabel =
    fetchStatusLabels[source.fetch_status] ?? source.fetch_status;
  const statusClass =
    fetchStatusBadgeClass[source.fetch_status] ??
    "bg-muted text-muted-foreground";

  const rowBusy = attachBusy || showSavePending;

  function handleSaveTitle(e: React.FormEvent) {
    e.preventDefault();
    if (!trimmedDraft) {
      setTitleError("Введите название.");
      return;
    }
    if (!titleDirty) return;
    setTitleError(null);
    saveMutation.mutate();
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-border bg-background p-3 text-sm shadow-sm"
      )}
    >
      <div className="flex items-start gap-2">
        <span className="mt-1.5 shrink-0 text-muted-foreground" aria-hidden>
          {isFile ? <FileText className="size-4" /> : <Link className="size-4" />}
        </span>
        <form
          className="min-w-0 flex-1 space-y-1"
          onSubmit={handleSaveTitle}
          onClick={(e) => e.stopPropagation()}
        >
          <Input
            value={titleDraft}
            onChange={(e) => {
              setTitleDraft(e.target.value);
              if (titleError) setTitleError(null);
            }}
            placeholder="Название источника"
            aria-invalid={!!titleError}
            disabled={rowBusy}
            className="h-8 text-sm"
          />
          {titleError ? (
            <p className="text-xs text-destructive" role="alert">
              {titleError}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <Badge variant="secondary" className={cn("text-xs", statusClass)}>
              {statusLabel}
            </Badge>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className="h-7 text-xs"
              disabled={!titleDirty || !trimmedDraft || rowBusy}
            >
              {showSavePending ? (
                <span className="inline-flex items-center gap-1.5">
                  <InlineSpinner className="size-3" />
                  Сохранение…
                </span>
              ) : (
                "Сохранить"
              )}
            </Button>
          </div>
        </form>
        <div className="flex shrink-0 items-start gap-0.5 pt-0.5">
          {showAttachCheckbox ? (
            <button
              type="button"
              role="checkbox"
              aria-checked={checked}
              disabled={rowBusy}
              onClick={() => onCheckedChange?.(!checked)}
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                checked
                  ? "border-green-600 bg-green-600 text-white"
                  : "border-muted-foreground/40 hover:border-muted-foreground/60 disabled:opacity-50"
              )}
              aria-label={
                checked
                  ? `Отвязать «${trimmedDraft || source.title}»`
                  : `Привязать «${trimmedDraft || source.title}»`
              }
            >
              {checked ? <Check className="size-3.5 stroke-[2.5]" /> : null}
            </button>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger
              type="button"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-50"
              disabled={rowBusy}
              aria-label="Действия с источником"
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={4}>
              <DropdownMenuItem variant="destructive" onClick={onRequestDelete}>
                <Trash2 className="size-3.5" />
                Удалить навсегда
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
