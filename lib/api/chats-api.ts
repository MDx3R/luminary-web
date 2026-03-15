import { apiFetch, getBaseUrl } from "@/lib/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import type { Chat, ChatSummary, ChatMessage, StreamingMessageEvent } from "@/types/chat";
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

export async function deleteChat(id: string): Promise<void> {
  return apiFetch<void>(`/chats/${id}`, { method: "DELETE" });
}

export async function updateChatName(
  chatId: string,
  payload: { name: string }
): Promise<void> {
  return apiFetch<void>(`/chats/${chatId}/name`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
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

export async function sendMessage(
  chatId: string,
  content: string
): Promise<{ id: string }> {
  return apiFetch<IDResponse>(`/chats/${chatId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}

export async function cancelMessage(
  chatId: string,
  messageId: string
): Promise<void> {
  return apiFetch<void>(
    `/chats/${chatId}/messages/${messageId}/cancel`,
    { method: "POST" }
  );
}

/**
 * SSE stream of assistant response. Pass AbortSignal to cancel.
 * Yields events with message_id, state (start|delta|end|error), content, author, status.
 */
export async function* getMessageResponseStream(
  chatId: string,
  messageId: string,
  signal?: AbortSignal
): AsyncGenerator<StreamingMessageEvent> {
  const base = getBaseUrl();
  const url = `${base}/chats/${chatId}/messages/${messageId}/response`;
  const token = useAuthStore.getState().accessToken;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(url, {
    method: "POST",
    headers,
    credentials: "include",
    signal,
  });
  if (!res.ok) {
    const text = await res.text();
    let message = `Ошибка запроса: ${res.status}`;
    try {
      if (text) {
        const detail = JSON.parse(text) as { message?: string };
        if (typeof detail.message === "string") message = detail.message;
      }
    } catch {
      // use default message
    }
    throw new Error(message);
  }
  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const part of parts) {
        const line = part.split("\n").find((l) => l.startsWith("data: "));
        if (!line) continue;
        const raw = line.slice(6).trim();
        if (raw === "[DONE]" || !raw) continue;
        try {
          const event = JSON.parse(raw) as StreamingMessageEvent;
          yield event;
        } catch {
          // skip malformed
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
