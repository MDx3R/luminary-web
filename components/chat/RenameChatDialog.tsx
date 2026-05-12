"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  appModalDialogContentClassName,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateChatName } from "@/lib/api/chats-api";
import { queryKeys } from "@/lib/query-keys";
import { ApiClientError } from "@/lib/api-client";
import { useMinimumPending } from "@/hooks/useMinimumPending";
import { InlineSpinner } from "@/components/shared/InlineSpinner";

interface RenameChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatId: string | null;
  chatName: string;
  folderId?: string | null;
}

export function RenameChatDialog({
  open,
  onOpenChange,
  chatId,
  chatName,
  folderId,
}: RenameChatDialogProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(chatName);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(chatName);
    setError(null);
  }, [open, chatId, chatName]);

  const mutation = useMutation({
    mutationFn: () => updateChatName(chatId!, { name: name.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats });
      if (chatId)
        queryClient.invalidateQueries({ queryKey: queryKeys.chat(chatId) });
      if (folderId)
        queryClient.invalidateQueries({ queryKey: queryKeys.folder(folderId) });
      onOpenChange(false);
    },
    onError: (err) => {
      setError(
        err instanceof ApiClientError ? err.message : "Не удалось переименовать чат."
      );
    },
  });

  const showPending = useMinimumPending(mutation.isPending);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Введите название чата.");
      return;
    }
    if (!chatId) return;
    setError(null);
    mutation.mutate();
  }

  function handleOpenChange(next: boolean) {
    if (!next) setError(null);
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={cn(appModalDialogContentClassName)} showCloseButton={true}>
        <DialogHeader className="p-5 pb-0">
          <DialogTitle>Переименовать чат</DialogTitle>
          <DialogDescription className="sr-only">
            Изменение отображаемого названия чата.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5">
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <div className="grid gap-2">
            <label htmlFor="rename-chat-name" className="text-sm font-medium">
              Название
            </label>
            <Input
              id="rename-chat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Название чата"
              aria-invalid={!!error}
              className="w-full min-w-0"
              disabled={showPending}
            />
          </div>
          <DialogFooter className="p-0 pt-2 flex flex-row justify-end gap-2">
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
