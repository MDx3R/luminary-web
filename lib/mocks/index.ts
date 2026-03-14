import type { Folder } from "@/types/folder";
import type { ChatMessage, ChatSummary } from "@/types/chat";
import type { Assistant } from "@/types/assistant";

export const mockFolder: Folder = {
  id: "mock-folder-1",
  name: "Моя папка",
};

export const mockFolders: Folder[] = [
  mockFolder,
  { id: "mock-folder-2", name: "Исследование" },
  { id: "mock-folder-3", name: "Черновики" },
];

/** Chats belonging to a folder (for tree) */
export function getMockFolderChats(folderId: string): ChatSummary[] {
  if (folderId === mockFolder.id) {
    return [{ id: folderId, title: "Чат папки", folderId }]
  }
  return [{ id: folderId, title: "Чат", folderId }]
}

export const mockStandaloneChats: ChatSummary[] = [
  { id: "standalone-1", title: "Быстрый вопрос", folderId: null, lastAccessed: Date.now() - 3600000 },
  { id: "standalone-2", title: "Идеи", folderId: null, lastAccessed: Date.now() - 7200000 },
];

export const mockMessages: ChatMessage[] = [
  {
    id: "msg-1",
    role: "user",
    content: "Привет! Расскажи о возможностях редактора.",
  },
  {
    id: "msg-2",
    role: "assistant",
    content:
      "Редактор поддерживает Markdown и интеграцию с чатом. Выделенный текст можно отправить в чат как контекст.",
  },
  {
    id: "msg-3",
    role: "user",
    content: "Отлично, спасибо.",
  },
];

export function getMockFolderById(id: string): Folder | null {
  if (id === mockFolder.id) return mockFolder;
  return { id, name: `Папка ${id}` };
}

/** Last 4 folders for Recent Work widget */
export function getRecentFolders(): Folder[] {
  return mockFolders.slice(0, 4);
}

/** Last 5 chats (folder + standalone) for Jump Back, sorted by lastAccessed */
export function getRecentChats(): ChatSummary[] {
  return [...mockStandaloneChats]
    .sort((a, b) => (b.lastAccessed ?? 0) - (a.lastAccessed ?? 0))
    .slice(0, 5);
}

export const mockAssistants: Assistant[] = [
  { id: "asst-1", name: "Исследователь" },
  { id: "asst-2", name: "Редактор" },
  { id: "asst-3", name: "Аналитик" },
];
