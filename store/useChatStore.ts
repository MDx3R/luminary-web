import { create } from "zustand";
import type { ChatMessage } from "@/types/chat";

interface ChatState {
  /** Текущий открытый чат (id папки, id чата и т.д.) */
  activeChatId: string | null;
  /** Сообщения по id чата — чат может быть привязан к папке или быть отдельным */
  chats: Record<string, ChatMessage[]>;

  setActiveChat: (chatId: string | null) => void;
  getMessages: (chatId: string) => ChatMessage[];
  addMessage: (
    chatId: string,
    message: Pick<ChatMessage, "role" | "content"> & Partial<ChatMessage>
  ) => void;
  updateMessage: (
    chatId: string,
    messageId: string,
    partial: Partial<ChatMessage>
  ) => void;
  setChatMessages: (chatId: string, messages: ChatMessage[]) => void;
  initChat: (chatId: string, initialMessages?: ChatMessage[]) => void;
}

function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  activeChatId: null,
  chats: {},

  setActiveChat(chatId) {
    set({ activeChatId: chatId });
  },

  getMessages(chatId: string) {
    return get().chats[chatId] ?? [];
  },

  addMessage(chatId, message) {
    const newMessage: ChatMessage = {
      ...message,
      id: message.id ?? generateMessageId(),
      chat_id: chatId,
      role: message.role ?? "user",
      status: message.status ?? "pending",
      content: message.content ?? "",
      model_id: message.model_id ?? "",
      created_at: message.created_at ?? new Date().toISOString(),
      edited_at: message.edited_at ?? new Date().toISOString(),
      attachments: message.attachments ?? [],
    };
    set((state) => ({
      chats: {
        ...state.chats,
        [chatId]: [...(state.chats[chatId] ?? []), newMessage],
      },
    }));
  },

  updateMessage(chatId, messageId, partial) {
    set((state) => {
      const list = state.chats[chatId] ?? [];
      const idx = list.findIndex((m) => m.id === messageId);
      if (idx < 0) return state;
      const next = [...list];
      next[idx] = { ...next[idx], ...partial };
      return { chats: { ...state.chats, [chatId]: next } };
    });
  },

  setChatMessages(chatId, messages) {
    set((state) => ({
      chats: { ...state.chats, [chatId]: messages },
    }));
  },

  initChat(chatId, initialMessages = []) {
    set((state) => ({
      activeChatId: chatId,
      chats: {
        ...state.chats,
        [chatId]:
          initialMessages.length > 0
            ? initialMessages
            : (state.chats[chatId] ?? []),
      },
    }));
  },
}));
