"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { MessageSquarePlus } from "lucide-react";
import { createChat } from "@/lib/api/chats-api";
import { createFolderChat } from "@/lib/api/folders-api";
import { queryKeys } from "@/lib/query-keys";
import { ApiClientError } from "@/lib/api-client";

const DEFAULT_MODEL_ID =
  process.env.NEXT_PUBLIC_DEFAULT_MODEL_ID ??
  "00000000-0000-0000-0000-000000000001";
const DEFAULT_MAX_CONTEXT = 10;

interface CreateChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, creates chat inside this folder (createFolderChat). Otherwise standalone (createChat). */
  folderId?: string | null;
  onSuccess?: (chatId: string) => void;
}

export function CreateChatDialog({
  open,
  onOpenChange,
  folderId,
  onSuccess,
}: CreateChatDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim() || null,
        model_id: DEFAULT_MODEL_ID,
        max_context_messages: DEFAULT_MAX_CONTEXT,
      };
      if (folderId) {
        return createFolderChat(folderId, payload);
      }
      return createChat(payload);
    },
    onSuccess: (data) => {
      if (folderId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.folders });
        queryClient.invalidateQueries({ queryKey: queryKeys.folder(folderId) });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.chats });
      }
      onOpenChange(false);
      setName("");
      setError(null);
      if (data?.id) {
        onSuccess?.(data.id);
        if (!folderId) {
          router.push(`/chat/${data.id}`);
        }
      }
    },
    onError: (err) => {
      setError(
        err instanceof ApiClientError ? err.message : "Не удалось создать чат."
      );
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    mutation.mutate();
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setName("");
      setError(null);
    }
    onOpenChange(next);
  }

  const isFolderChat = Boolean(folderId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden rounded-xl">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <MessageSquarePlus className="size-5 shrink-0 text-muted-foreground" />
            {isFolderChat ? "Новый чат в папке" : "Новый чат"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5">
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <div className="grid gap-2">
            <label htmlFor="chat-name" className="text-sm font-medium">
              Название (необязательно)
            </label>
            <Input
              id="chat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Название чата"
              autoFocus
              aria-invalid={!!error}
            />
          </div>
          <DialogFooter className="p-0 pt-2 flex flex-row justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Создание…" : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
