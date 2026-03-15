import type { ChatSourceItem } from "@/types/source";

export type MessageRole = "user" | "assistant";

export type MessageStatus =
  | "pending"
  | "processing"
  | "streaming"
  | "completed"
  | "failed"
  | "cancelled";

export type StreamState = "start" | "delta" | "end" | "error";

export interface StreamingMessageEvent {
  message_id: string;
  state: StreamState;
  content: string;
  author: string;
  status: string;
}

export interface AttachmentItem {
  name: string;
  content_id: string;
  source_id: string | null;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  role: string;
  status: string;
  content: string;
  model_id: string;
  tokens?: number | null;
  created_at: string;
  edited_at: string;
  attachments: AttachmentItem[];
}

/** Summary for list (standalone chats from GET /chats; folder chats from FolderResponse.chats) */
export interface ChatSummary {
  id: string;
  name: string;
  model_id: string;
  created_at: string;
}

export interface Chat {
  id: string;
  name: string;
  folder_id: string | null;
  assistant_id: string | null;
  assistant_name: string | null;
  model_id: string;
  max_context_messages: number;
  sources: ChatSourceItem[];
  created_at: string;
}
