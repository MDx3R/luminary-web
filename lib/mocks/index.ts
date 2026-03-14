import type { Folder } from "@/types/folder";
import type { ChatMessage } from "@/types/chat";

export const mockFolder: Folder = {
  id: "mock-folder-1",
  name: "Моя папка",
};

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
