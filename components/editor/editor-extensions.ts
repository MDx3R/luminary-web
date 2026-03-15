import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import { InlineSuggestionExtension } from "./inline-suggestion-extension";
import Placeholder from "@tiptap/extension-placeholder";
import type { Node } from "@tiptap/pm/model";

export function createEditorExtensions() {
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
    InlineSuggestionExtension,
  ];
}
