import { create } from "zustand";
import type { Folder, SaveStatus } from "@/types/folder";
import { getMockFolderById } from "@/lib/mocks";

interface FolderState {
  currentFolder: Folder | null;
  saveStatus: SaveStatus;
  setFolder: (folder: Folder | null) => void;
  setSaveStatus: (status: SaveStatus) => void;
  initFromFolderId: (folderId: string) => void;
}

export const useFolderStore = create<FolderState>()((set) => ({
  currentFolder: null,
  saveStatus: "saved",

  setFolder(folder) {
    set({ currentFolder: folder });
  },

  setSaveStatus(saveStatus) {
    set({ saveStatus });
  },

  initFromFolderId(folderId: string) {
    const folder = getMockFolderById(folderId);
    set({ currentFolder: folder });
  },
}));
