import { apiFetch } from "@/lib/api-client";
import type { AssistantSummary, Assistant } from "@/types/assistant";
import type { IDResponse } from "@/lib/api-types";

export async function listAssistants(): Promise<AssistantSummary[]> {
  return apiFetch<AssistantSummary[]>("/assistants/");
}

export async function listPublicAssistants(options?: {
  limit?: number;
  offset?: number;
}): Promise<AssistantSummary[]> {
  const params = new URLSearchParams();
  if (options?.limit != null) params.set("limit", String(options.limit));
  if (options?.offset != null) params.set("offset", String(options.offset));
  const qs = params.toString();
  return apiFetch<AssistantSummary[]>(
    `/assistants/public${qs ? `?${qs}` : ""}`
  );
}

export async function getAssistant(id: string): Promise<Assistant> {
  return apiFetch<Assistant>(`/assistants/${id}`);
}

export async function createAssistant(payload: {
  name: string;
  description: string;
  prompt?: string | null;
}): Promise<IDResponse> {
  return apiFetch<IDResponse>("/assistants/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateAssistantInfo(
  id: string,
  payload: { name: string; description: string; tags?: string[] }
): Promise<void> {
  return apiFetch<void>(`/assistants/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name,
      description: payload.description,
      tags: payload.tags ?? [],
    }),
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

export async function cloneAssistant(id: string): Promise<IDResponse> {
  return apiFetch<IDResponse>(`/assistants/${id}/clone`, {
    method: "POST",
  });
}

export async function publishAssistant(id: string): Promise<void> {
  return apiFetch<void>(`/assistants/${id}/publish`, {
    method: "POST",
  });
}
