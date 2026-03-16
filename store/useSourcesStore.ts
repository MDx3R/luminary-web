import { create } from "zustand";

export type AttachContext =
  | { type: "folder"; id: string }
  | { type: "chat"; id: string }
  | null;

/** When set, AttachSourceModal opens directly on the upload/create step instead of the list. */
export type AttachInitialStep = "list" | "upload" | null;

interface SourcesState {
  sourcesPanelOpen: boolean;
  addSourceModalOpen: boolean;
  /** When AttachSourceModal is open: folder or chat we're attaching to. */
  attachContext: AttachContext;
  /** If "upload", attach modal opens on create step (file/link) instead of list. */
  attachInitialStep: AttachInitialStep;
  setSourcesPanelOpen: (open: boolean) => void;
  setAddSourceModalOpen: (open: boolean) => void;
  setAttachContext: (context: AttachContext) => void;
  /** Open attach modal for folder or chat. */
  openAttachModal: (context: AttachContext, initialStep?: AttachInitialStep) => void;
  /** Open attach modal straight to upload/create step (e.g. from SourcesPanel "Добавить источник"). */
  openCreateSourceModal: (context: AttachContext) => void;
  clearAttachInitialStep: () => void;
  closeAttachModal: () => void;
}

export const useSourcesStore = create<SourcesState>()((set) => ({
  sourcesPanelOpen: false,
  addSourceModalOpen: false,
  attachContext: null,
  attachInitialStep: null,

  setSourcesPanelOpen(open) {
    set({ sourcesPanelOpen: open });
  },

  setAddSourceModalOpen(open) {
    set({ addSourceModalOpen: open });
  },

  setAttachContext(context) {
    set({ attachContext: context });
  },

  openAttachModal(context, initialStep = "list") {
    set({
      attachContext: context,
      addSourceModalOpen: true,
      attachInitialStep: initialStep ?? "list",
    });
  },

  openCreateSourceModal(context) {
    set({
      attachContext: context,
      addSourceModalOpen: true,
      attachInitialStep: "upload",
    });
  },

  clearAttachInitialStep() {
    set({ attachInitialStep: null });
  },

  closeAttachModal() {
    set({
      addSourceModalOpen: false,
      attachContext: null,
      attachInitialStep: null,
    });
  },
}));
