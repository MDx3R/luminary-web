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
import { Bot } from "lucide-react";
import { createAssistant } from "@/lib/api/assistants-api";
import { queryKeys } from "@/lib/query-keys";
import { ApiClientError } from "@/lib/api-client";
import { useMinimumPending } from "@/hooks/useMinimumPending";
import { InlineSpinner } from "@/components/shared/InlineSpinner";

interface CreateAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAssistantModal({
  open,
  onOpenChange,
}: CreateAssistantModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      createAssistant({
        name: name.trim(),
        description: description.trim(),
        prompt: prompt.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assistants });
      onOpenChange(false);
      setName("");
      setDescription("");
      setPrompt("");
      setError(null);
    },
    onError: (err) => {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Не удалось создать ассистента."
      );
    },
  });

  const showPending = useMinimumPending(mutation.isPending);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Введите название ассистента.");
      return;
    }
    setError(null);
    mutation.mutate();
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setName("");
      setDescription("");
      setPrompt("");
      setError(null);
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden rounded-xl">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Bot className="size-5 shrink-0 text-muted-foreground" />
            Новый ассистент
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5">
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <div className="grid gap-2">
            <label
              htmlFor="assistant-name"
              className="text-sm font-medium"
            >
              Название
            </label>
            <Input
              id="assistant-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Название ассистента"
              autoFocus
              aria-invalid={!!error}
              disabled={showPending}
            />
          </div>
          <div className="grid gap-2">
            <label
              htmlFor="assistant-description"
              className="text-sm font-medium"
            >
              Описание
            </label>
            <Input
              id="assistant-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание"
              disabled={showPending}
            />
          </div>
          <div className="grid gap-2">
            <label
              htmlFor="assistant-prompt"
              className="text-sm font-medium"
            >
              Инструкции (необязательно)
            </label>
            <textarea
              id="assistant-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Системный промпт для ассистента"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={3}
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
                  Создание…
                </span>
              ) : (
                "Создать"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
