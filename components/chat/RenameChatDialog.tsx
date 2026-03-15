"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateChatName } from "@/lib/api/chats-api";
import { queryKeys } from "@/lib/query-keys";
import { ApiClientError } from "@/lib/api-client";

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
      <DialogContent className="sm:max-w-sm max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden rounded-xl" showCloseButton={true}>
        <DialogHeader className="p-5 pb-0">
          <DialogTitle>Переименовать чат</DialogTitle>
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
            <div className="flex justify-center">
              <Input
                id="rename-chat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Название чата"
                aria-invalid={!!error}
                className="w-full min-w-0 max-w-[240px]"
              />
            </div>
          </div>
          <DialogFooter className="p-0 pt-2 flex flex-row justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={mutation.isPending}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Сохранение…" : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
