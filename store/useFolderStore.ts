import { create } from "zustand";
import type { Folder, SaveStatus } from "@/types/folder";

interface FolderState {
  currentFolder: Folder | null;
  saveStatus: SaveStatus;
  selectedChatId: string | null;
  setFolder: (folder: Folder | null) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setSelectedChatId: (chatId: string | null) => void;
  /** Clears current folder and selected chat (e.g. when navigating away). */
  clearFolder: () => void;
}

export const useFolderStore = create<FolderState>()((set) => ({
  currentFolder: null,
  saveStatus: "saved",
  selectedChatId: null,

  setFolder(folder) {
    set({ currentFolder: folder });
  },

  setSaveStatus(saveStatus) {
    set({ saveStatus });
  },

  setSelectedChatId(chatId) {
    set({ selectedChatId: chatId });
  },

  clearFolder() {
    set({ currentFolder: null, selectedChatId: null });
  },
}));
