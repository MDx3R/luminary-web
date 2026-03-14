import StarterKit from "@tiptap/starter-kit"
import { Markdown } from "@tiptap/markdown"
import { InlineSuggestionExtension } from "./inline-suggestion-extension"

export function createEditorExtensions() {
  return [
    StarterKit.configure({}),
    Markdown.configure({
      markedOptions: { gfm: true },
    }),
    InlineSuggestionExtension,
  ]
}
