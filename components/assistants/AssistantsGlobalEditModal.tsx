"use client";

import { EditAssistantModal } from "@/components/assistants/EditAssistantModal";
import { useAssistantsUiStore } from "@/store/useAssistantsUiStore";

/** Single edit dialog for an assistant (sidebar, dashboard, etc.). */
export function AssistantsGlobalEditModal() {
  const editAssistantId = useAssistantsUiStore((s) => s.editAssistantId);
  const editAssistantModalOpen = useAssistantsUiStore(
    (s) => s.editAssistantModalOpen
  );
  const closeAssistantEditor = useAssistantsUiStore(
    (s) => s.closeAssistantEditor
  );

  return (
    <EditAssistantModal
      open={editAssistantModalOpen}
      onOpenChange={(open) => {
        if (!open) closeAssistantEditor();
      }}
      assistantId={editAssistantId}
    />
  );
}
