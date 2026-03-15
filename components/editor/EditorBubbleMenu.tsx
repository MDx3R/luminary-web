"use client";

import { useState, useCallback } from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/core";
import { Sparkles, FileText, SpellCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface EditorBubbleMenuCallbacks {
  onAskAI: (selectedText: string) => void;
  onSummarize: (selectedText: string) => void;
  onFixGrammar: (selectedText: string) => void;
  /** Send selected text with a custom comment/query. */
  onAskWithComment: (selectedText: string, comment: string) => void;
}

interface EditorBubbleMenuProps {
  editor: Editor | null;
  callbacks: EditorBubbleMenuCallbacks;
}

function getSelectedText(editor: Editor): string {
  const { from, to } = editor.state.selection;
  const size = editor.state.doc.content.size;
  if (from < 0 || to > size || from > to) return "";
  return editor.state.doc.textBetween(from, to, " ");
}

export function EditorBubbleMenu({ editor, callbacks }: EditorBubbleMenuProps) {
  const [comment, setComment] = useState("");

  const handleSendWithComment = useCallback(() => {
    if (!editor) return;
    const selected = getSelectedText(editor);
    callbacks.onAskWithComment(selected, comment.trim());
    setComment("");
  }, [editor, comment, callbacks]);

  if (!editor) return null;

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ state }) => {
        const { from, to } = state.selection;
        const size = state.doc.content.size;
        return from >= 0 && to <= size && from < to;
      }}
    >
      <div className="flex min-w-xs flex-col gap-2 rounded-lg border border-border bg-popover p-2 shadow-md">
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => callbacks.onAskAI(getSelectedText(editor))}
            className="gap-1.5"
          >
            <Sparkles className="size-3.5" />
            Ask AI
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => callbacks.onSummarize(getSelectedText(editor))}
            className="gap-1.5"
          >
            <FileText className="size-3.5" />
            Summarize
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => callbacks.onFixGrammar(getSelectedText(editor))}
            className="gap-1.5"
          >
            <SpellCheck className="size-3.5" />
            Fix Grammar
          </Button>
        </div>
        <div className="flex items-center gap-1.5">
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendWithComment();
              }
            }}
            placeholder="Добавить комментарий или запрос…"
            className="min-w-0 flex-1"
            aria-label="Запрос или комментарий к выделенному тексту"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSendWithComment}
            className="shrink-0 gap-1.5"
            aria-label="Отправить запрос"
          >
            <Send className="size-3.5" />
            Send
          </Button>
        </div>
      </div>
    </BubbleMenu>
  );
}
