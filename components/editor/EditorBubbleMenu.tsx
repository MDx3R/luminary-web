"use client";

import { useState, useCallback, useMemo } from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/core";
import { Sparkles, FileText, SpellCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InlineSpinner } from "@/components/shared/InlineSpinner";
import { cn } from "@/lib/utils";

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
  /** Show compact loading state in the bubble while inline AI runs. */
  inlineAiBusy?: boolean;
}

function getSelectedText(editor: Editor): string {
  const { from, to } = editor.state.selection;
  const size = editor.state.doc.content.size;
  if (from < 0 || to > size || from > to) return "";
  return editor.state.doc.textBetween(from, to, " ");
}

function preserveSelectionMouseDown(
  e: React.MouseEvent<HTMLElement>,
): void {
  e.preventDefault();
}

export function EditorBubbleMenu({
  editor,
  callbacks,
  inlineAiBusy = false,
}: EditorBubbleMenuProps) {
  const [comment, setComment] = useState("");

  const bubbleFloatingOptions = useMemo(
    () => ({
      placement: "top" as const,
      offset: 8,
      flip: { padding: 8 },
    }),
    [],
  );

  const handleSendWithComment = useCallback(() => {
    if (!editor || inlineAiBusy) return;
    const selected = getSelectedText(editor);
    callbacks.onAskWithComment(selected, comment.trim());
    setComment("");
    editor.chain().focus().run();
  }, [editor, comment, callbacks, inlineAiBusy]);

  if (!editor) return null;

  const runAiAction = (fn: (text: string) => void) => {
    const text = getSelectedText(editor);
    fn(text);
    editor.chain().focus().run();
  };

  return (
    <BubbleMenu
      editor={editor}
      options={bubbleFloatingOptions}
      shouldShow={({ state }) => {
        const { from, to } = state.selection;
        const size = state.doc.content.size;
        return from >= 0 && to <= size && from < to;
      }}
    >
      <div
        className={cn(
          "relative flex min-h-23 min-w-[min(100%,22rem)] max-w-[min(100vw-2rem,32rem)] flex-col gap-2 overflow-hidden rounded-xl border border-border/80 bg-popover/85 p-2 pt-2.5 shadow-2xl ring-1 ring-border/60 backdrop-blur-xl dark:bg-popover/75",
        )}
      >
          <div
            className="pointer-events-none absolute inset-x-2 top-0 h-px rounded-full bg-linear-to-r from-chart-1 via-primary/70 to-chart-2 opacity-90"
            aria-hidden
          />

          <div className="relative z-0 flex min-h-0 flex-1 flex-col gap-2">
            <div
              className="flex flex-wrap items-center gap-0.5 rounded-lg bg-muted/55 p-0.5 dark:bg-muted/35"
              data-slot="bubble-toolbar"
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={inlineAiBusy}
                onMouseDown={preserveSelectionMouseDown}
                onClick={() => runAiAction((t) => callbacks.onAskAI(t))}
                className="gap-1.5 text-foreground/90 hover:text-foreground"
              >
                <Sparkles className="size-3.5 shrink-0" />
                Ask AI
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={inlineAiBusy}
                onMouseDown={preserveSelectionMouseDown}
                onClick={() => runAiAction((t) => callbacks.onSummarize(t))}
                className="gap-1.5 text-foreground/90 hover:text-foreground"
              >
                <FileText className="size-3.5 shrink-0" />
                Summarize
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={inlineAiBusy}
                onMouseDown={preserveSelectionMouseDown}
                onClick={() => runAiAction((t) => callbacks.onFixGrammar(t))}
                className="gap-1.5 text-foreground/90 hover:text-foreground"
              >
                <SpellCheck className="size-3.5 shrink-0" />
                Fix Grammar
              </Button>
            </div>

            <div className="flex min-h-8 items-center gap-1.5">
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendWithComment();
                  }
                }}
                placeholder="Комментарий или запрос…"
                className="min-h-8 min-w-0 flex-1 border-border/80 bg-background/80"
                aria-label="Запрос или комментарий к выделенному тексту"
                disabled={inlineAiBusy}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={inlineAiBusy}
                onMouseDown={preserveSelectionMouseDown}
                onClick={handleSendWithComment}
                className="shrink-0 gap-1.5 border-border/60 bg-secondary/90 shadow-sm"
                aria-label="Отправить запрос"
              >
                <Send className="size-3.5 shrink-0" />
                Send
              </Button>
            </div>
          </div>

          {inlineAiBusy ? (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-[inherit] bg-popover/75 px-3 backdrop-blur-md dark:bg-popover/65"
              role="status"
              aria-busy="true"
              aria-live="polite"
            >
              <InlineSpinner className="size-4 shrink-0 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Генерация…
              </span>
            </div>
          ) : null}
      </div>
    </BubbleMenu>
  );
}
