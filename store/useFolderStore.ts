import { create } from "zustand";
import type { Folder, SaveStatus } from "@/types/folder";

interface FolderState {
  currentFolder: Folder | null;
  saveStatus: SaveStatus;
  selectedChatId: string | null;
  /** True when current folder has at least one chat (for showing chat panel toggle). */
  folderHasChats: boolean;
  /** Incremented to request an immediate save from EditorPanel (e.g. Save button). */
  saveTrigger: number;
  /** Latest editor text (for export); cleared when folder changes. */
  pendingEditorText: string | null;
  setFolder: (folder: Folder | null) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setSelectedChatId: (chatId: string | null) => void;
  setPendingEditorText: (text: string | null) => void;
  requestSave: () => void;
  /** Clears current folder and selected chat (e.g. when navigating away). */
  clearFolder: () => void;
}

export const useFolderStore = create<FolderState>()((set) => ({
  currentFolder: null,
  saveStatus: "saved",
  selectedChatId: null,
  folderHasChats: false,
  saveTrigger: 0,
  pendingEditorText: null,

  setFolder(folder) {
    set({
      currentFolder: folder,
      folderHasChats: (folder?.chats?.length ?? 0) > 0,
      pendingEditorText: null,
    });
  },

  setSaveStatus(saveStatus) {
    set({ saveStatus });
  },

  setSelectedChatId(chatId) {
    set({ selectedChatId: chatId });
  },

  setPendingEditorText(text) {
    set({ pendingEditorText: text });
  },

  requestSave() {
    set((s) => ({ saveTrigger: s.saveTrigger + 1 }));
  },

  clearFolder() {
    set({ currentFolder: null, selectedChatId: null, folderHasChats: false });
  },
}));
