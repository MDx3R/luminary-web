"use client";

import { useState } from "react";
import { toast } from "sonner";
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
      toast.success("Чат переименован");
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
      <DialogContent className="sm:max-w-sm" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>Переименовать чат</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {error && (
            <p className="text-sm text-destructive mb-2" role="alert">
              {error}
            </p>
          )}
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название чата"
            aria-invalid={!!error}
            className="mb-4"
          />
          <DialogFooter className="flex flex-row justify-end gap-2">
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
