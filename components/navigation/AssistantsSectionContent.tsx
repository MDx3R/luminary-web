"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  listAssistants,
  listPublicAssistants,
  deleteAssistant,
  cloneAssistant,
  publishAssistant,
} from "@/lib/api/assistants-api";
import { queryKeys } from "@/lib/query-keys";
import { AssistantItem } from "@/components/assistants/AssistantItem";
import { AssistantLibraryCard } from "@/components/assistants/AssistantLibraryCard";
import { AssistantPreviewModal } from "@/components/assistants/AssistantPreviewModal";
import { useAssistantsUiStore } from "@/store/useAssistantsUiStore";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import type { AssistantSummary } from "@/types/assistant";
import { notifyErrorFromUnknown } from "@/lib/feedback";
import { useMinimumPending } from "@/hooks/useMinimumPending";
import { ListLoadingRow } from "@/components/shared/ListLoadingRow";
import { Copy, Eye, Library } from "lucide-react";

export function AssistantsSectionContent() {
  const queryClient = useQueryClient();
  const openAssistantEditor = useAssistantsUiStore((s) => s.openAssistantEditor);
  const [tab, setTab] = useState<"mine" | "catalog">("mine");
  const [inlineNotice, setInlineNotice] = useState<string | null>(null);
  const noticeClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showNotice(text: string) {
    if (noticeClearRef.current) clearTimeout(noticeClearRef.current);
    setInlineNotice(text);
    noticeClearRef.current = setTimeout(() => {
      noticeClearRef.current = null;
      setInlineNotice(null);
    }, 2500);
  }

  useEffect(() => {
    return () => {
      if (noticeClearRef.current) clearTimeout(noticeClearRef.current);
    };
  }, []);

  const [deletingAssistant, setDeletingAssistant] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [previewAssistant, setPreviewAssistant] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: assistants = [], isLoading: mineLoading } = useQuery({
    queryKey: queryKeys.assistants,
    queryFn: listAssistants,
    enabled: tab === "mine",
  });

  const { data: publicAssistants = [], isLoading: publicLoading } = useQuery({
    queryKey: queryKeys.assistantsPublic,
    queryFn: () => listPublicAssistants({ limit: 100, offset: 0 }),
    enabled: tab === "catalog",
  });

  const cloneMutation = useMutation({
    mutationFn: (id: string) => cloneAssistant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assistants });
      showNotice("Ассистент добавлен в ваш список");
    },
    onError: (err) => {
      notifyErrorFromUnknown(err, "Не удалось клонировать");
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => publishAssistant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assistants });
      queryClient.invalidateQueries({ queryKey: queryKeys.assistantsPublic });
      showNotice("Ассистент опубликован в каталоге");
    },
    onError: (err) => {
      notifyErrorFromUnknown(err, "Не удалось опубликовать");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAssistant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assistants });
      queryClient.invalidateQueries({ queryKey: queryKeys.assistantsPublic });
      setDeletingAssistant(null);
      showNotice("Ассистент удалён");
    },
    onError: (err) => {
      notifyErrorFromUnknown(err, "Не удалось удалить ассистента");
    },
  });

  function handleEdit(assistant: AssistantSummary) {
    openAssistantEditor(assistant.id);
  }

  function handleDelete(assistant: AssistantSummary) {
    setDeletingAssistant({ id: assistant.id, name: assistant.name });
  }

  const isLoading = tab === "mine" ? mineLoading : publicLoading;
  const showAssistantsLoading = useMinimumPending(isLoading);
  const list = tab === "mine" ? assistants : publicAssistants;

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-hidden">
      {inlineNotice ? (
        <p
          className="mx-2 shrink-0 rounded-md border border-border bg-muted/40 px-2 py-1.5 text-center text-xs text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          {inlineNotice}
        </p>
      ) : null}
      <div className="flex shrink-0 gap-1 px-2 pt-1">
        <Button
          type="button"
          variant={tab === "mine" ? "secondary" : "ghost"}
          size="sm"
          className="h-7 flex-1 text-xs"
          onClick={() => setTab("mine")}
        >
          Мои
        </Button>
        <Button
          type="button"
          variant={tab === "catalog" ? "secondary" : "ghost"}
          size="sm"
          className="h-7 flex-1 gap-1 text-xs"
          onClick={() => setTab("catalog")}
        >
          <Library className="size-3.5 shrink-0" />
          Каталог
        </Button>
      </div>
      {showAssistantsLoading ? (
        <ListLoadingRow label="Загрузка…" />
      ) : list.length === 0 ? (
        <p className="px-2 py-2 text-xs text-muted-foreground">
          {tab === "mine"
            ? "Нет ассистентов. Создайте ассистента кнопкой выше."
            : "В каталоге пока нет публичных ассистентов."}
        </p>
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <div className="min-h-full w-full px-3">
            <ul className="flex w-full flex-col gap-2 py-2 pb-4">
              {list.map((assistant) => (
                <li key={assistant.id} className="w-full">
                  {tab === "mine" ? (
                    <AssistantItem
                      assistant={assistant}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onPublish={() => publishMutation.mutate(assistant.id)}
                      publishPending={
                        publishMutation.isPending &&
                        publishMutation.variables === assistant.id
                      }
                    />
                  ) : (
                    <AssistantLibraryCard
                      assistant={assistant}
                      actions={
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Просмотр «${assistant.name}»`}
                            title="Просмотр"
                            onClick={() =>
                              setPreviewAssistant({
                                id: assistant.id,
                                name: assistant.name,
                              })
                            }
                          >
                            <Eye className="size-4 text-muted-foreground" />
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="gap-1"
                            disabled={
                              cloneMutation.isPending &&
                              cloneMutation.variables === assistant.id
                            }
                            onClick={() => cloneMutation.mutate(assistant.id)}
                          >
                            <Copy className="size-3.5 shrink-0" />
                            Клонировать
                          </Button>
                        </>
                      }
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </ScrollArea>
      )}
      <AssistantPreviewModal
        open={Boolean(previewAssistant)}
        onOpenChange={(open) => !open && setPreviewAssistant(null)}
        assistantId={previewAssistant?.id ?? null}
        fallbackName={previewAssistant?.name ?? ""}
        onClone={(id) => cloneMutation.mutate(id)}
        clonePending={cloneMutation.isPending}
      />
      <ConfirmDeleteDialog
        open={Boolean(deletingAssistant)}
        onOpenChange={(open) => !open && setDeletingAssistant(null)}
        title="Удалить ассистента?"
        description={
          deletingAssistant
            ? `Ассистент «${deletingAssistant.name}» будет удалён. Это действие нельзя отменить.`
            : ""
        }
        confirmLabel="Удалить"
        onConfirm={() => {
          if (deletingAssistant) deleteMutation.mutate(deletingAssistant.id);
        }}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
