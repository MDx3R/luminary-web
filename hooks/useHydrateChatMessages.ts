"use client";

import { useEffect } from "react";
import { useChatStore } from "@/store/useChatStore";
import { isStreamingMessageStatus } from "@/lib/chat-stream-status";
import type { ChatMessage } from "@/types/chat";

/**
 * Syncs React Query `messages` into the chat store, preserving optimistic
 * in-flight assistant rows (same rules as folder chat view).
 */
export function useHydrateChatMessages(
  chatId: string | null | undefined,
  messages: ChatMessage[] | undefined
) {
  const setActiveChat = useChatStore((s) => s.setActiveChat);
  const setChatMessages = useChatStore((s) => s.setChatMessages);

  useEffect(() => {
    if (!chatId) return;
    setActiveChat(chatId);
  }, [chatId, setActiveChat]);

  useEffect(() => {
    if (!chatId || !messages) return;
    const current = useChatStore.getState().chats[chatId] ?? [];
    const localPending = current.filter(
      (m) =>
        isStreamingMessageStatus(m.status) || m.id.startsWith("pending-")
    );
    const merged = [...messages];
    for (const m of localPending) {
      if (!merged.some((x) => x.id === m.id)) merged.push(m);
    }
    setChatMessages(chatId, merged);
  }, [chatId, messages, setChatMessages]);
}
