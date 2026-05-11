"use client";

import { useEffect } from "react";
import { useChatStore } from "@/store/useChatStore";
import type { ChatMessage } from "@/types/chat";

/**
 * Syncs React Query `messages` into the chat store, preserving optimistic
 * pending/streaming rows (same rules as folder chat view).
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
        m.status === "pending" ||
        m.status === "streaming" ||
        m.id.startsWith("pending-")
    );
    const merged = [...messages];
    for (const m of localPending) {
      if (!merged.some((x) => x.id === m.id)) merged.push(m);
    }
    setChatMessages(chatId, merged);
  }, [chatId, messages, setChatMessages]);
}
