import { apiFetch } from "@/lib/api-client";
import type { Chat, ChatSummary } from "@/types/chat";
import type { ChatMessage } from "@/types/chat";
import type { IDResponse } from "@/lib/api-types";

export async function listChats(): Promise<ChatSummary[]> {
  return apiFetch<ChatSummary[]>("/chats");
}

export async function getChat(id: string): Promise<Chat> {
  return apiFetch<Chat>(`/chats/${id}`);
}

export async function createChat(payload: {
  name?: string | null;
  assistant_id?: string | null;
  model_id: string;
  max_context_messages: number;
}): Promise<IDResponse> {
  return apiFetch<IDResponse>("/chats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function addSourceToChat(
  chatId: string,
  sourceId: string
): Promise<void> {
  return apiFetch<void>(`/chats/${chatId}/sources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source_id: sourceId }),
  });
}

export async function removeSourceFromChat(
  chatId: string,
  sourceId: string
): Promise<void> {
  return apiFetch<void>(`/chats/${chatId}/sources/${sourceId}`, {
    method: "DELETE",
  });
}

export async function listMessages(
  chatId: string,
  params?: { limit?: number; before?: string }
): Promise<ChatMessage[]> {
  const search = new URLSearchParams();
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.before != null) search.set("before", params.before);
  const qs = search.toString();
  return apiFetch<ChatMessage[]>(
    `/chats/${chatId}/messages${qs ? `?${qs}` : ""}`
  );
}
