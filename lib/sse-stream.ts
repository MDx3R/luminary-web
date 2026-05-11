import { getBaseUrl, ApiClientError } from "@/lib/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import type { StreamingMessageEvent } from "@/types/chat";

function parseErrorMessage(status: number, text: string): string {
  let message = `Ошибка запроса: ${status}`;
  try {
    if (text) {
      const detail = JSON.parse(text) as { message?: string };
      if (typeof detail.message === "string") message = detail.message;
    }
  } catch {
    // keep default
  }
  return message;
}

/**
 * POST with JSON body, then read SSE (data: JSON lines) like chat message stream.
 * On 401: single-flight refresh via store, one retry.
 */
export async function* postJsonSseStream(
  path: string,
  body: unknown,
  signal?: AbortSignal
): AsyncGenerator<StreamingMessageEvent> {
  const base = getBaseUrl();
  const url = path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? path : `/${path}`}`;

  async function doFetch(token: string | null): Promise<Response> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    return fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(body),
      signal,
    });
  }

  let token = useAuthStore.getState().accessToken;
  let res = await doFetch(token);

  if (res.status === 401) {
    try {
      await useAuthStore.getState().refreshTokens();
    } catch {
      await useAuthStore.getState().logout();
      throw new ApiClientError("Требуется авторизация.", 401);
    }
    token = useAuthStore.getState().accessToken;
    if (!token) {
      await useAuthStore.getState().logout();
      throw new ApiClientError("Требуется авторизация.", 401);
    }
    res = await doFetch(token);
  }

  if (res.status === 401) {
    await useAuthStore.getState().logout();
    throw new ApiClientError("Требуется авторизация.", 401);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new ApiClientError(parseErrorMessage(res.status, text), res.status);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new ApiClientError("Нет тела ответа.", res.status || 500);

  const decoder = new TextDecoder();
  let buffer = "";
  function* parseSseBlock(block: string): Generator<StreamingMessageEvent> {
    const line = block.split("\n").find((l) => l.startsWith("data: "));
    if (!line) return;
    const raw = line.slice(6).trim();
    if (raw === "[DONE]" || !raw) return;
    try {
      yield JSON.parse(raw) as StreamingMessageEvent;
    } catch {
      if (process.env.NODE_ENV === "development") {
        console.warn("[sse-stream] skip malformed data line", raw.slice(0, 200));
      }
    }
  }
  try {
    while (true) {
      let chunk: ReadableStreamReadResult<Uint8Array>;
      try {
        chunk = await reader.read();
      } catch (readErr) {
        if (readErr instanceof Error && readErr.name === "AbortError") {
          throw readErr;
        }
        const msg =
          readErr instanceof Error ? readErr.message : String(readErr);
        const lower = msg.toLowerCase();
        if (
          lower.includes("chunked") ||
          lower.includes("failed to fetch") ||
          lower.includes("networkerror") ||
          readErr instanceof TypeError
        ) {
          throw new Error(
            "Соединение с сервером прервалось. Проверьте сеть или попробуйте позже."
          );
        }
        throw readErr;
      }
      const { done, value } = chunk;
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const part of parts) {
        yield* parseSseBlock(part);
      }
    }
    if (buffer.trim()) {
      yield* parseSseBlock(buffer);
    }
  } finally {
    reader.releaseLock();
  }
}
