import { create } from "zustand";

export type AttachContext =
  | { type: "folder"; id: string }
  | { type: "chat"; id: string }
  | null;

interface SourcesState {
  sourcesPanelOpen: boolean;
  addSourceModalOpen: boolean;
  /** When AttachSourceModal is open: folder or chat we're attaching to. */
  attachContext: AttachContext;
  setSourcesPanelOpen: (open: boolean) => void;
  setAddSourceModalOpen: (open: boolean) => void;
  setAttachContext: (context: AttachContext) => void;
  /** Open attach modal for folder or chat. */
  openAttachModal: (context: AttachContext) => void;
  closeAttachModal: () => void;
}

export const useSourcesStore = create<SourcesState>()((set) => ({
  sourcesPanelOpen: false,
  addSourceModalOpen: false,
  attachContext: null,

  setSourcesPanelOpen(open) {
    set({ sourcesPanelOpen: open });
  },

  setAddSourceModalOpen(open) {
    set({ addSourceModalOpen: open });
  },

  setAttachContext(context) {
    set({ attachContext: context });
  },

  openAttachModal(context) {
    set({ attachContext: context, addSourceModalOpen: true });
  },

  closeAttachModal() {
    set({ addSourceModalOpen: false, attachContext: null });
  },
}));
