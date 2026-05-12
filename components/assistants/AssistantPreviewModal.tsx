"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  appModalDialogContentClassName,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Copy } from "lucide-react";
import { getAssistant } from "@/lib/api/assistants-api";
import { queryKeys } from "@/lib/query-keys";
import { ListLoadingRow } from "@/components/shared/ListLoadingRow";
import { useMinimumPending } from "@/hooks/useMinimumPending";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AssistantPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assistantId: string | null;
  /** Shown in header while detail loads. */
  fallbackName?: string;
  onClone?: (id: string) => void;
  clonePending?: boolean;
}

export function AssistantPreviewModal({
  open,
  onOpenChange,
  assistantId,
  fallbackName = "",
  onClone,
  clonePending = false,
}: AssistantPreviewModalProps) {
  const { data: assistant, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.assistant(assistantId ?? ""),
    queryFn: () => getAssistant(assistantId!),
    enabled: open && Boolean(assistantId),
    retry: false,
  });
  const showLoading = useMinimumPending(isLoading);

  const tags = assistant?.tags?.filter(Boolean) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(appModalDialogContentClassName, "sm:max-w-md")} showCloseButton>
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Bot className="size-5 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {(assistant?.name ?? fallbackName) || "Ассистент"}
            </span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Просмотр ассистента из каталога без редактирования; клонирование внизу.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="min-h-0 max-h-[55vh] flex-1">
          <div className="space-y-4 p-5 pt-3">
            {showLoading ? (
              <ListLoadingRow label="Загрузка…" className="text-sm" />
            ) : isError ? (
              <div className="space-y-2 text-sm">
                <p className="text-destructive" role="alert">
                  Не удалось загрузить данные ассистента.
                </p>
                <p className="text-muted-foreground">
                  {error instanceof Error ? error.message : "Проверьте доступ к каталогу."}
                </p>
                <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
                  Повторить
                </Button>
              </div>
            ) : assistant ? (
              <>
                {assistant.description ? (
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Описание</p>
                    <p className="text-sm leading-relaxed text-foreground">{assistant.description}</p>
                  </div>
                ) : null}
                {(tags.length > 0 || assistant.type) && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Метки</p>
                    <div className="flex flex-wrap gap-1">
                      {assistant.type ? (
                        <Badge variant="outline" className="text-xs font-normal">
                          {assistant.type}
                        </Badge>
                      ) : null}
                      {tags.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs font-normal">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Инструкции</p>
                  <textarea
                    readOnly
                    value={assistant.prompt ?? ""}
                    placeholder="—"
                    rows={8}
                    className="flex min-h-[120px] w-full resize-none rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <p className="border-t border-border/80 pt-3 text-xs italic text-muted-foreground">
                  Просмотр из каталога — только чтение; копия к себе — кнопкой ниже.
                </p>
              </>
            ) : null}
          </div>
        </ScrollArea>
        <DialogFooter className="flex flex-row flex-wrap items-center justify-end gap-2 border-t border-border p-4">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
          {assistantId && onClone ? (
            <Button
              type="button"
              variant="secondary"
              className="gap-1.5"
              disabled={clonePending}
              onClick={() => onClone(assistantId)}
            >
              <Copy className="size-4 shrink-0" />
              Клонировать к себе
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
