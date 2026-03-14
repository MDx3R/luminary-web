export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
}

/** Summary for nav list: folder chat (folderId set) or standalone (folderId null) */
export interface ChatSummary {
  id: string;
  title: string;
  folderId: string | null;
  lastAccessed?: number;
}
