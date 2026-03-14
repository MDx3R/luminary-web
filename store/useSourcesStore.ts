import { create } from "zustand";
import type { Source, SourceKind, SourceStatus } from "@/types/source";

interface AddSourcePayload {
  title: string;
  url?: string;
  fileName?: string;
  mimeType?: string;
}

interface SourcesState {
  sources: Source[];
  sourcesPanelOpen: boolean;
  addSourceModalOpen: boolean;
  setSourcesPanelOpen: (open: boolean) => void;
  setAddSourceModalOpen: (open: boolean) => void;
  getSourcesByFolderId: (folderId: string) => Source[];
  addSource: (
    folderId: string,
    kind: SourceKind,
    payload: AddSourcePayload
  ) => void;
  removeSource: (id: string) => void;
  setSourceStatus: (id: string, status: SourceStatus) => void;
}

export const useSourcesStore = create<SourcesState>()((set, get) => ({
  sources: [],
  sourcesPanelOpen: false,
  addSourceModalOpen: false,

  setSourcesPanelOpen(open) {
    set({ sourcesPanelOpen: open });
  },

  setAddSourceModalOpen(open) {
    set({ addSourceModalOpen: open });
  },

  getSourcesByFolderId(folderId: string) {
    return get().sources.filter((s) => s.folderId === folderId);
  },

  addSource(folderId, kind, payload) {
    const id = crypto.randomUUID();
    const source: Source = {
      id,
      folderId,
      kind,
      title: payload.title,
      status: "processing",
      ...(kind === "file" && {
        fileName: payload.fileName,
        mimeType: payload.mimeType,
      }),
      ...(kind === "url" && { url: payload.url }),
    };
    set((state) => ({ sources: [...state.sources, source] }));
  },

  removeSource(id) {
    set((state) => ({
      sources: state.sources.filter((s) => s.id !== id),
    }));
  },

  setSourceStatus(id, status) {
    set((state) => ({
      sources: state.sources.map((s) =>
        s.id === id ? { ...s, status } : s
      ),
    }));
  },
}));
