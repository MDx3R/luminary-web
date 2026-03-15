"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { listAssistants, deleteAssistant } from "@/lib/api/assistants-api";
import { queryKeys } from "@/lib/query-keys";
import { AssistantItem } from "@/components/assistants/AssistantItem";
import { EditAssistantModal } from "@/components/assistants/EditAssistantModal";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import type { AssistantSummary } from "@/types/assistant";
import { ApiClientError } from "@/lib/api-client";
import { toast } from "sonner";

export function AssistantsSectionContent() {
  const queryClient = useQueryClient();
  const [editingAssistantId, setEditingAssistantId] = useState<string | null>(
    null
  );
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deletingAssistant, setDeletingAssistant] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: assistants = [], isLoading } = useQuery({
    queryKey: queryKeys.assistants,
    queryFn: listAssistants,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAssistant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assistants });
      setDeletingAssistant(null);
      toast.success("Ассистент удалён");
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiClientError ? err.message : "Не удалось удалить ассистента"
      );
    },
  });

  function handleEdit(assistant: AssistantSummary) {
    setEditingAssistantId(assistant.id);
    setEditModalOpen(true);
  }

  function handleDelete(assistant: AssistantSummary) {
    setDeletingAssistant({ id: assistant.id, name: assistant.name });
  }

  function handleEditModalOpenChange(open: boolean) {
    if (!open) setEditingAssistantId(null);
    setEditModalOpen(open);
  }

  if (isLoading) {
    return (
      <div className="px-2 py-2 text-xs text-muted-foreground">
        Загрузка ассистентов…
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-hidden">
      {assistants.length === 0 ? (
        <p className="px-2 py-2 text-xs text-muted-foreground">
          Нет ассистентов. Создайте ассистента кнопкой выше.
        </p>
      ) : (
        <ScrollArea className="flex-1 min-h-0">
          <div className="min-h-full w-full px-3">
            <ul className="flex w-full flex-col gap-2 py-2 pb-4">
              {assistants.map((assistant) => (
                <li key={assistant.id} className="w-full">
                  <AssistantItem
                    assistant={assistant}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </li>
              ))}
            </ul>
          </div>
        </ScrollArea>
      )}
      <EditAssistantModal
        open={editModalOpen}
        onOpenChange={handleEditModalOpenChange}
        assistantId={editingAssistantId}
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
