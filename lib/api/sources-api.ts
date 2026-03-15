import { apiFetch } from "@/lib/api-client";
import type { Source } from "@/types/source";
import type { IDResponse } from "@/lib/api-types";

export async function listSources(): Promise<Source[]> {
  return apiFetch<Source[]>("/sources");
}

export async function getSource(id: string): Promise<Source> {
  return apiFetch<Source>(`/sources/${id}`);
}

export async function createFileSource(
  file: File,
  title: string
): Promise<IDResponse> {
  const form = new FormData();
  form.append("title", title);
  form.append("file", file);
  return apiFetch<IDResponse>("/sources/file", {
    method: "POST",
    body: form,
    headers: {},
  });
}

export async function createLinkSource(payload: {
  title: string;
  url: string;
}): Promise<IDResponse> {
  return apiFetch<IDResponse>("/sources/link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function createPageSource(
  file: File,
  title: string
): Promise<IDResponse> {
  const form = new FormData();
  form.append("title", title);
  form.append("page", file);
  return apiFetch<IDResponse>("/sources/page", {
    method: "POST",
    body: form,
    headers: {},
  });
}
