import type { FolderSourceItem } from "@/types/source";

export type SaveStatus = "saved" | "saving" | "unsaved";

export interface FolderChatItem {
  id: string;
  name: string;
  model_id: string;
  created_at: string;
}

export interface FolderEditorItem {
  text: string;
  updated_at: string;
}

export interface FolderSummary {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Folder {
  id: string;
  name: string;
  description: string | null;
  assistant_id?: string | null;
  assistant_name?: string | null;
  editor?: FolderEditorItem | null;
  chats: FolderChatItem[];
  sources: FolderSourceItem[];
  created_at: string;
}
