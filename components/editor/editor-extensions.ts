import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import { InlineSuggestionExtension } from "./inline-suggestion-extension";
import Placeholder from "@tiptap/extension-placeholder";
import type { Node } from "@tiptap/pm/model";

export interface EditorExtensionsOptions {
  folderId?: string | null;
}

export function createEditorExtensions(
  options: EditorExtensionsOptions = {}
) {
  const folderId = options.folderId ?? null;
  return [
    StarterKit,
    Placeholder.configure({
      emptyEditorClass: "is-editor-empty",
      placeholder: ({ node }: { node: Node }) => {
        if (node.type.name === "heading") {
          return "Какой будет заголовок?";
        } else {
          return "Начните писать...";
        }
      },
    }),
    Markdown.configure({
      markedOptions: { gfm: true },
    }),
    InlineSuggestionExtension.configure({ folderId }),
  ];
}
