import { apiFetch } from "@/lib/api-client";
import type { Folder, FolderSummary } from "@/types/folder";
import type { IDResponse } from "@/lib/api-types";

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
    model_id: string;
    max_context_messages: number;
  }
): Promise<IDResponse> {
  return apiFetch<IDResponse>(`/folders/${folderId}/chats`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
