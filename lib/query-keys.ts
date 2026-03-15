export const queryKeys = {
  sources: ["sources"] as const,
  folders: ["folders"] as const,
  folder: (id: string) => ["folder", id] as const,
  chats: ["chats"] as const,
  chat: (id: string) => ["chat", id] as const,
  messages: (chatId: string) => ["messages", chatId] as const,
};
