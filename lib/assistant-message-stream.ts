import type { StreamingMessageEvent } from "@/types/chat";

export interface AssistantStreamHandlers {
  onStart: (messageId: string, status?: string) => void;
  onDelta: (content: string, status?: string) => void;
  onEnd: () => void;
  onError: (content: string) => void;
}

/**
 * Общий цикл SSE ответа ассистента (start / delta / end / error).
 */
export async function consumeAssistantMessageStream(
  stream: AsyncIterable<StreamingMessageEvent>,
  handlers: AssistantStreamHandlers
): Promise<void> {
  for await (const event of stream) {
    if (event.state === "start") {
      const newId =
        typeof event.message_id === "string"
          ? event.message_id
          : String(event.message_id);
      handlers.onStart(newId, event.status);
      continue;
    }
    if (event.state === "delta") {
      handlers.onDelta(event.content, event.status);
      continue;
    }
    if (event.state === "end") {
      handlers.onEnd();
      break;
    }
    if (event.state === "error") {
      handlers.onError(event.content || "Ошибка генерации");
      break;
    }
  }
}
