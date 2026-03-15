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
import { updateFolder } from "@/lib/api/folders-api";
import { queryKeys } from "@/lib/query-keys";
import { useFolderStore } from "@/store/useFolderStore";
import { ApiClientError } from "@/lib/api-client";

interface RenameFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: string | null;
  folderName: string;
  folderDescription?: string | null;
}

export function RenameFolderDialog({
  open,
  onOpenChange,
  folderId,
  folderName,
  folderDescription = null,
}: RenameFolderDialogProps) {
  const queryClient = useQueryClient();
  const currentFolder = useFolderStore((s) => s.currentFolder);
  const setFolder = useFolderStore((s) => s.setFolder);
  const [name, setName] = useState(folderName);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      updateFolder(folderId!, { name: name.trim(), description: folderDescription ?? null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.folders });
      if (folderId)
        queryClient.invalidateQueries({ queryKey: queryKeys.folder(folderId) });
      if (currentFolder?.id === folderId)
        setFolder({ ...currentFolder, name: name.trim() });
      onOpenChange(false);
    },
    onError: (err) => {
      setError(
        err instanceof ApiClientError ? err.message : "Не удалось переименовать папку."
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
    if (!folderId) return;
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
          <DialogTitle>Переименовать папку</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5">
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <div className="grid gap-2">
            <label htmlFor="rename-folder-name" className="text-sm font-medium">
              Название
            </label>
            <div className="flex justify-center">
              <Input
                id="rename-folder-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Название папки"
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
