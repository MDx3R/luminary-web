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
import { createFolder } from "@/lib/api/folders-api";
import { queryKeys } from "@/lib/query-keys";
import { ApiClientError } from "@/lib/api-client";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (folderId: string) => void;
}

export function CreateFolderDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateFolderDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      createFolder({
        name: name.trim(),
        description: description.trim() || null,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.folders });
      onOpenChange(false);
      setName("");
      setDescription("");
      setError(null);
      if (data?.id) {
        onSuccess?.(data.id);
        router.push(`/folder/${data.id}`);
      }
    },
    onError: (err) => {
      setError(
        err instanceof ApiClientError ? err.message : "Не удалось создать папку."
      );
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Введите название папки.");
      return;
    }
    setError(null);
    mutation.mutate();
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setName("");
      setDescription("");
      setError(null);
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новая папка</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <div className="grid gap-2">
            <label htmlFor="folder-name" className="text-sm font-medium">
              Название
            </label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Название папки"
              autoFocus
              aria-invalid={!!error}
            />
          </div>
          <div className="grid gap-2">
            <label
              htmlFor="folder-description"
              className="text-sm font-medium"
            >
              Описание (необязательно)
            </label>
            <Input
              id="folder-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание"
            />
          </div>
          <DialogFooter>
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
