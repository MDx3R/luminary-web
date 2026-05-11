import type { Editor } from "@tiptap/core";

interface EditorWithMarkdown {
  getMarkdown?: () => string;
}

export function getMarkdownFromEditor(editor: Editor): string {
  const e = editor as EditorWithMarkdown;
  return typeof e.getMarkdown === "function" ? e.getMarkdown() : "";
}
