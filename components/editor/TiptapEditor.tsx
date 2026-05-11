"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import { createEditorExtensions } from "./editor-extensions";
import {
  EditorBubbleMenu,
  type EditorBubbleMenuCallbacks,
} from "./EditorBubbleMenu";
import { getMarkdownFromEditor } from "@/lib/editor/markdown-from-editor";

export interface TiptapEditorProps {
  initialContent?: string;
  onContentChange?: (markdown: string) => void;
  getBubbleMenuCallbacks: (editor: Editor) => EditorBubbleMenuCallbacks;
  /** When true, bubble shows a compact loader instead of actions (inline AI stream). */
  bubbleInlineAiBusy?: boolean;
}

const CONTENT_CHANGE_DEBOUNCE_MS = 500;

export function TiptapEditor({
  initialContent,
  onContentChange,
  getBubbleMenuCallbacks,
  bubbleInlineAiBusy = false,
}: TiptapEditorProps) {
  const onContentChangeRef = useRef(onContentChange);
  useEffect(() => {
    onContentChangeRef.current = onContentChange;
  }, [onContentChange]);

  const editor = useEditor(
    {
      extensions: createEditorExtensions(),
      content:
        initialContent !== undefined && initialContent !== ""
          ? initialContent
          : "<p></p>",
      contentType: initialContent ? "markdown" : "html",
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: "prose-editor min-h-[280px] w-full max-w-none outline-none",
        },
      },
    },
    []
  );

  useEffect(() => {
    if (!editor || !onContentChangeRef.current) return;
    const handler = () => {
      if (!editor.isDestroyed) {
        const markdown = getMarkdownFromEditor(editor);
        onContentChangeRef.current?.(markdown);
      }
    };
    let timer: ReturnType<typeof setTimeout> | null = null;
    const debounced = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        handler();
      }, CONTENT_CHANGE_DEBOUNCE_MS);
    };
    editor.on("update", debounced);
    return () => {
      editor.off("update", debounced);
      if (timer) clearTimeout(timer);
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <>
      <EditorContent editor={editor} />
      <EditorBubbleMenu
        editor={editor}
        callbacks={getBubbleMenuCallbacks(editor)}
        inlineAiBusy={bubbleInlineAiBusy}
      />
    </>
  );
}
