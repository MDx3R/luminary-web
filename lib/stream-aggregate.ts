import { AUTOCOMPLETE_EMPTY_SIGNAL } from "@/lib/editor/autocomplete-constants";
import type { StreamingMessageEvent } from "@/types/chat";

/** Concatenate `delta` chunks from a chat-style SSE stream; throws on `error` state. */
export async function collectStreamedText(
  stream: AsyncIterable<StreamingMessageEvent>
): Promise<string> {
  let out = "";
  for await (const ev of stream) {
    if (ev.state === "error") {
      throw new Error(ev.content?.trim() || "Ошибка потока");
    }
    if (ev.state === "delta" && ev.content) {
      out += ev.content;
    }
    if (ev.state === "end" && ev.content) {
      out += ev.content;
    }
  }
  return out;
}

/** Like {@link collectStreamedText} but ignores `end` payloads (folder inline edit, etc.). */
export async function collectStreamedDeltaText(
  stream: AsyncIterable<StreamingMessageEvent>
): Promise<string> {
  let out = "";
  for await (const ev of stream) {
    if (ev.state === "error") {
      throw new Error(ev.content?.trim() || "Ошибка потока");
    }
    if (ev.state === "delta" && ev.content) {
      out += ev.content;
    }
  }
  return out;
}

/**
 * Autocomplete stream: only `delta` text (ignore `end` payloads so markers like "end"
 * never appear in the ghost). Maps empty / backend empty signal to null.
 */
export async function collectAutocompleteSuggestion(
  stream: AsyncIterable<StreamingMessageEvent>
): Promise<string | null> {
  let out = "";
  for await (const ev of stream) {
    if (ev.state === "error") {
      throw new Error(ev.content?.trim() || "Ошибка потока");
    }
    if (ev.state === "delta" && ev.content) {
      out += ev.content;
    }
  }
  const trimmed = out.trim();
  if (trimmed.length === 0) return null;
  if (trimmed === AUTOCOMPLETE_EMPTY_SIGNAL) return null;
  const withoutSignal = trimmed.replaceAll(AUTOCOMPLETE_EMPTY_SIGNAL, "").trim();
  if (withoutSignal.length === 0) return null;
  return withoutSignal;
}
