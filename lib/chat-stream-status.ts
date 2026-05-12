import type { MessageStatus } from "@/types/chat";

/** Статусы сообщения ассистента, при которых ответ ещё формируется (блокировка отправки, мерж при гидрации). */
export const STREAMING_MESSAGE_STATUSES: MessageStatus[] = [
  "pending",
  "processing",
  "streaming",
];

export function isStreamingMessageStatus(status: string): boolean {
  return STREAMING_MESSAGE_STATUSES.includes(status as MessageStatus);
}
