import { apiFetch } from "@/lib/api-client";
import { postJsonSseStream } from "@/lib/sse-stream";
import type { Folder, FolderSummary } from "@/types/folder";
import type { IDResponse } from "@/lib/api-types";
import type { StreamingMessageEvent } from "@/types/chat";

export async function listFolders(): Promise<FolderSummary[]> {
  return apiFetch<FolderSummary[]>("/folders");
}

export async function getFolder(id: string): Promise<Folder> {
  return apiFetch<Folder>(`/folders/${id}`);
}

export async function createFolder(payload: {
  name: string;
  description?: string | null;
}): Promise<IDResponse> {
  return apiFetch<IDResponse>("/folders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateFolder(
  id: string,
  payload: { name: string; description?: string | null }
): Promise<void> {
  return apiFetch<void>(`/folders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteFolder(id: string): Promise<void> {
  return apiFetch<void>(`/folders/${id}`, { method: "DELETE" });
}

export async function updateFolderEditor(
  folderId: string,
  payload: { text: string }
): Promise<void> {
  return apiFetch<void>(`/folders/${folderId}/editor`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function removeChatFromFolder(
  folderId: string,
  chatId: string
): Promise<void> {
  return apiFetch<void>(`/folders/${folderId}/chats/${chatId}`, {
    method: "DELETE",
  });
}

export async function addSourceToFolder(
  folderId: string,
  sourceId: string
): Promise<void> {
  return apiFetch<void>(`/folders/${folderId}/sources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source_id: sourceId }),
  });
}

export async function removeSourceFromFolder(
  folderId: string,
  sourceId: string
): Promise<void> {
  return apiFetch<void>(`/folders/${folderId}/sources/${sourceId}`, {
    method: "DELETE",
  });
}

export async function changeFolderAssistant(
  folderId: string,
  assistantId: string
): Promise<void> {
  return apiFetch<void>(`/folders/${folderId}/assistant`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assistant_id: assistantId }),
  });
}

export async function removeFolderAssistant(folderId: string): Promise<void> {
  return apiFetch<void>(`/folders/${folderId}/assistant`, { method: "DELETE" });
}

export async function createFolderChat(
  folderId: string,
  payload: {
    name?: string | null;
    assistant_id?: string | null;
  }
): Promise<IDResponse> {
  return apiFetch<IDResponse>(`/folders/${folderId}/chats`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/** SSE stream: same event shape as chat assistant response. */
export async function* streamFolderEditorInline(
  folderId: string,
  payload: { instruction: string; document_markdown: string },
  signal?: AbortSignal
): AsyncGenerator<StreamingMessageEvent> {
  yield* postJsonSseStream(
    `/folders/${folderId}/editor/inline/stream`,
    payload,
    signal
  );
}

/** SSE stream: same event shape as chat assistant response. */
export async function* streamFolderEditorAutocomplete(
  folderId: string,
  payload: { text_before_cursor: string; text_after_cursor: string },
  signal?: AbortSignal
): AsyncGenerator<StreamingMessageEvent> {
  yield* postJsonSseStream(
    `/folders/${folderId}/editor/autocomplete/stream`,
    payload,
    signal
  );
}
