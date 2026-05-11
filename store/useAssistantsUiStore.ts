import { create } from "zustand";

interface AssistantsUiState {
  editAssistantId: string | null;
  editAssistantModalOpen: boolean;
  openAssistantEditor: (assistantId: string) => void;
  closeAssistantEditor: () => void;
}

export const useAssistantsUiStore = create<AssistantsUiState>()((set) => ({
  editAssistantId: null,
  editAssistantModalOpen: false,

  openAssistantEditor(assistantId) {
    set({ editAssistantId: assistantId, editAssistantModalOpen: true });
  },

  closeAssistantEditor() {
    set({ editAssistantModalOpen: false });
    queueMicrotask(() => set({ editAssistantId: null }));
  },
}));
