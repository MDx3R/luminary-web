"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Trash2 } from "lucide-react";
import {
  getAssistant,
  updateAssistantInfo,
  updateAssistantInstructions,
  deleteAssistant,
} from "@/lib/api/assistants-api";
import { queryKeys } from "@/lib/query-keys";
import { ApiClientError } from "@/lib/api-client";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";

interface EditAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assistantId: string | null;
}

export function EditAssistantModal({
  open,
  onOpenChange,
  assistantId,
}: EditAssistantModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: assistant, isLoading } = useQuery({
    queryKey: queryKeys.assistant(assistantId ?? ""),
    queryFn: () => getAssistant(assistantId!),
    enabled: open && Boolean(assistantId),
  });

  useEffect(() => {
    if (assistant) {
      setName(assistant.name);
      setDescription(assistant.description);
      setPrompt(assistant.prompt ?? "");
    }
  }, [assistant]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await updateAssistantInfo(assistantId!, {
        name: name.trim(),
        description: description.trim(),
      });
      await updateAssistantInstructions(assistantId!, {
        prompt: prompt.trim(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assistants });
      queryClient.invalidateQueries({
        queryKey: queryKeys.assistant(assistantId!),
      });
      setError(null);
    },
    onError: (err) => {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Не удалось сохранить изменения."
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAssistant(assistantId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assistants });
      onOpenChange(false);
      setDeleteDialogOpen(false);
    },
    onError: (err) => {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Не удалось удалить ассистента."
      );
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Введите название ассистента.");
      return;
    }
    setError(null);
    saveMutation.mutate();
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setError(null);
      setDeleteDialogOpen(false);
    }
    onOpenChange(next);
  }

  if (!assistantId) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-sm max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden rounded-xl">
          <DialogHeader className="p-5 pb-0">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <Bot className="size-5 shrink-0 text-muted-foreground" />
              Редактировать ассистента
            </DialogTitle>
          </DialogHeader>
          {isLoading ? (
            <div className="p-5 text-sm text-muted-foreground">
              Загрузка…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5">
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <div className="grid gap-2">
                <label
                  htmlFor="edit-assistant-name"
                  className="text-sm font-medium"
                >
                  Название
                </label>
                <Input
                  id="edit-assistant-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Название ассистента"
                  autoFocus
                  aria-invalid={!!error}
                />
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor="edit-assistant-description"
                  className="text-sm font-medium"
                >
                  Описание
                </label>
                <Input
                  id="edit-assistant-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Краткое описание"
                />
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor="edit-assistant-prompt"
                  className="text-sm font-medium"
                >
                  Инструкции
                </label>
                <textarea
                  id="edit-assistant-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Системный промпт"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={3}
                />
              </div>
              <DialogFooter className="flex flex-row justify-end gap-2 p-0 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="mr-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="size-4 mr-1 inline" />
                  Удалить
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleOpenChange(false)}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Сохранение…" : "Сохранить"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Удалить ассистента?"
        description={`Ассистент «${assistant?.name ?? ""}» будет удалён. Это действие нельзя отменить.`}
        confirmLabel="Удалить"
        onConfirm={() => deleteMutation.mutate()}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
