import { apiFetch } from "@/lib/api-client";
import type { AssistantSummary, Assistant } from "@/types/assistant";
import type { IDResponse } from "@/lib/api-types";

export async function listAssistants(): Promise<AssistantSummary[]> {
  return apiFetch<AssistantSummary[]>("/assistants");
}

export async function getAssistant(id: string): Promise<Assistant> {
  return apiFetch<Assistant>(`/assistants/${id}`);
}

export async function createAssistant(payload: {
  name: string;
  description: string;
  prompt?: string | null;
}): Promise<IDResponse> {
  return apiFetch<IDResponse>("/assistants", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateAssistantInfo(
  id: string,
  payload: { name: string; description: string }
): Promise<void> {
  return apiFetch<void>(`/assistants/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateAssistantInstructions(
  id: string,
  payload: { prompt: string }
): Promise<void> {
  return apiFetch<void>(`/assistants/${id}/instructions`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteAssistant(id: string): Promise<void> {
  return apiFetch<void>(`/assistants/${id}`, { method: "DELETE" });
}
