import { create } from "zustand";
import type { Folder, SaveStatus } from "@/types/folder";

interface FolderState {
  currentFolder: Folder | null;
  saveStatus: SaveStatus;
  selectedChatId: string | null;
  /** True when current folder has at least one chat (for showing chat panel toggle). */
  folderHasChats: boolean;
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
  folderHasChats: false,

  setFolder(folder) {
    set({
      currentFolder: folder,
      folderHasChats: (folder?.chats?.length ?? 0) > 0,
    });
  },

  setSaveStatus(saveStatus) {
    set({ saveStatus });
  },

  setSelectedChatId(chatId) {
    set({ selectedChatId: chatId });
  },

  clearFolder() {
    set({ currentFolder: null, selectedChatId: null, folderHasChats: false });
  },
}));
