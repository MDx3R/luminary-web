"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateSource } from "@/lib/api/sources-api";
import { queryKeys } from "@/lib/query-keys";
import { ApiClientError } from "@/lib/api-client";
import { useMinimumPending } from "@/hooks/useMinimumPending";
import { InlineSpinner } from "@/components/shared/InlineSpinner";

interface RenameSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceId: string | null;
  sourceTitle: string;
}

export function RenameSourceDialog({
  open,
  onOpenChange,
  sourceId,
  sourceTitle,
}: RenameSourceDialogProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(sourceTitle);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => updateSource(sourceId!, { title: title.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sources });
      onOpenChange(false);
    },
    onError: (err) => {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Не удалось переименовать источник."
      );
    },
  });

  const showPending = useMinimumPending(mutation.isPending);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Введите название.");
      return;
    }
    if (!sourceId) return;
    setError(null);
    mutation.mutate();
  }

  function handleOpenChange(next: boolean) {
    if (!next) setError(null);
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>Переименовать источник</DialogTitle>
          <DialogDescription className="sr-only">
            Изменение названия записи в каталоге источников.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {error && (
            <p className="text-sm text-destructive mb-2" role="alert">
              {error}
            </p>
          )}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название"
            aria-invalid={!!error}
            className="mb-4"
            disabled={showPending}
          />
          <DialogFooter className="flex flex-row justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={showPending}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={showPending}>
              {showPending ? (
                <span className="inline-flex items-center gap-2">
                  <InlineSpinner className="size-3.5" />
                  Сохранение…
                </span>
              ) : (
                "Сохранить"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
