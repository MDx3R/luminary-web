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
      toast.success("Папка переименована");
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
      <DialogContent className="sm:max-w-sm" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>Переименовать папку</DialogTitle>
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
            placeholder="Название папки"
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
