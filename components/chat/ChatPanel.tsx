"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  type ComponentProps,
} from "react";
import { SendHorizontal, Square } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/store/useChatStore";
import {
  sendMessage,
  getMessageResponseStream,
  cancelMessage,
} from "@/lib/api/chats-api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";

const STREAMING_STATUSES = ["pending", "processing", "streaming"];

const EMPTY_PROMPTS = [
  "Объясни простыми словами",
  "Напиши краткое резюме",
  "Какие есть варианты?",
];

interface ChatPanelProps {
  /** Id чата (например id папки или отдельный chatId). Если не передан, используется активный чат из стора. */
  chatId?: string | null;
}

function isStreaming(status: string): boolean {
  return STREAMING_STATUSES.includes(status);
}

const INPUT_MIN_ROWS = 2;
const INPUT_LINE_HEIGHT_PX = 24;
const INPUT_MAX_HEIGHT_PX = 160;

const ChatInput = forwardRef<
  HTMLTextAreaElement,
  ComponentProps<"textarea"> & { value?: string }
>(function ChatInput({ value, onChange, className, ...props }, ref) {
  const internalRef = useRef<HTMLTextAreaElement | null>(null);

  function setRef(el: HTMLTextAreaElement | null) {
    internalRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref && "current" in ref) ref.current = el;
  }

  function adjustHeight() {
    const el = internalRef.current;
    if (!el) return;
    el.style.height = "auto";
    const minH = INPUT_MIN_ROWS * INPUT_LINE_HEIGHT_PX;
    const next = Math.min(Math.max(el.scrollHeight, minH), INPUT_MAX_HEIGHT_PX);
    el.style.height = `${next}px`;
  }

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      ref={setRef}
      value={value}
      onChange={(e) => {
        onChange?.(e);
        requestAnimationFrame(adjustHeight);
      }}
      rows={INPUT_MIN_ROWS}
      className={cn(
        "w-full min-w-0 flex-1 resize-none overflow-y-auto rounded-lg border border-input bg-transparent px-4 py-4 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm",
        className
      )}
      style={{
        minHeight: INPUT_MIN_ROWS * INPUT_LINE_HEIGHT_PX,
        maxHeight: INPUT_MAX_HEIGHT_PX,
      }}
      {...props}
    />
  );
});

export function ChatPanel({ chatId }: ChatPanelProps = {}) {
  const [inputValue, setInputValue] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const activeChatId = useChatStore((s) => s.activeChatId);
  const getMessages = useChatStore((s) => s.getMessages);
  const addMessage = useChatStore((s) => s.addMessage);
  const updateMessage = useChatStore((s) => s.updateMessage);

  const queryClient = useQueryClient();
  const currentChatId = chatId ?? activeChatId;
  const messages = currentChatId ? getMessages(currentChatId) : [];

  const lastMessage = messages[messages.length - 1];
  const streaming =
    lastMessage?.role === "assistant" && isStreaming(lastMessage.status);
  const assistantMessageId =
    lastMessage?.role === "assistant" ? lastMessage.id : null;

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, lastMessage?.content, scrollToBottom]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentChatId) return;
    const text = inputValue.trim();
    if (!text) return;
    if (streaming) return;

    setSendError(null);
    setInputValue("");

    try {
      const { id: userMessageId } = await sendMessage(currentChatId, text);
      addMessage(currentChatId, {
        id: userMessageId,
        role: "user",
        content: text,
        status: "completed",
      });
      const tempAssistantId = `pending-${userMessageId}`;
      addMessage(currentChatId, {
        id: tempAssistantId,
        role: "assistant",
        content: "",
        status: "pending",
      });

      const controller = new AbortController();
      abortRef.current = controller;
      let accumulated = "";
      let currentAssistantId = tempAssistantId;

      try {
        for await (const event of getMessageResponseStream(
          currentChatId,
          userMessageId,
          controller.signal
        )) {
          if (event.state === "start") {
            const newId =
              typeof event.message_id === "string"
                ? event.message_id
                : String(event.message_id);
            updateMessage(currentChatId, tempAssistantId, {
              id: newId,
              status: event.status || "streaming",
            });
            currentAssistantId = newId;
            continue;
          }
          if (event.state === "delta") {
            accumulated += event.content;
            updateMessage(currentChatId, currentAssistantId, {
              content: accumulated,
              status: event.status || "streaming",
            });
            continue;
          }
          if (event.state === "end") {
            updateMessage(currentChatId, currentAssistantId, {
              status: "completed",
            });
            break;
          }
          if (event.state === "error") {
            updateMessage(currentChatId, currentAssistantId, {
              status: "failed",
              content: event.content || "Ошибка генерации",
            });
            break;
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          updateMessage(currentChatId, currentAssistantId, {
            status: "cancelled",
          });
        } else {
          updateMessage(currentChatId, currentAssistantId, {
            status: "failed",
            content:
              err instanceof Error
                ? err.message
                : "Ошибка при получении ответа",
          });
        }
      } finally {
        abortRef.current = null;
        queryClient.invalidateQueries({
          queryKey: queryKeys.messages(currentChatId),
        });
      }

      inputRef.current?.focus();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Не удалось отправить сообщение";
      setSendError(message);
      inputRef.current?.focus();
    }
  }

  function handleCancelStream() {
    if (!currentChatId || !assistantMessageId) return;
    abortRef.current?.abort();
    cancelMessage(currentChatId, assistantMessageId).catch(() => {});
  }

  return (
    <div className="flex h-full min-h-0 min-w-[200px] flex-col">
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        aria-live="polite"
        aria-label="Сообщения чата"
      >
        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col gap-4 p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <p className="text-center text-sm text-muted-foreground">
                  Начните диалог — напишите сообщение или выберите подсказку.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {EMPTY_PROMPTS.map((prompt) => (
                    <Button
                      key={prompt}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => setInputValue(prompt)}
                      aria-label={`Подсказка: ${prompt}`}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessageBlock key={msg.id} message={msg} />
              ))
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 flex-col gap-3 border-t border-border bg-background px-4 pt-4 pb-8 min-w-[200px]"
      >
        {sendError && (
          <p className="text-sm text-destructive" role="alert">
            {sendError}
          </p>
        )}
        <div className="w-full overflow-hidden rounded-lg border border-input bg-transparent focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          <ChatInput
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Сообщение…"
            aria-label="Ввод сообщения"
            disabled={!currentChatId || streaming}
            className="border-0 rounded-none rounded-t-lg focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <div className="flex justify-end border-t border-border bg-muted/20 px-2 py-1.5 rounded-b-lg">
            {streaming ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCancelStream}
                aria-label="Остановить генерацию"
              >
                <Square className="size-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                aria-label="Отправить"
                disabled={!currentChatId || !inputValue.trim()}
              >
                <SendHorizontal className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

interface ChatMessageBlockProps {
  message: ChatMessage;
}

function ChatMessageBlock({ message }: ChatMessageBlockProps) {
  const isUser = message.role === "user";
  const isPending =
    message.role === "assistant" && message.status === "pending";
  const isStreaming =
    message.role === "assistant" && message.status === "streaming";
  const isFailed = message.status === "failed";
  const isCancelled = message.status === "cancelled";

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border text-sm max-w-[85%] overflow-hidden",
        isUser
          ? "ml-auto border-border/60 bg-primary/10 text-foreground"
          : "mr-auto border-border/40 bg-muted/50 text-foreground"
      )}
    >
      <div className="shrink-0 border-b border-border/50 px-3 py-1.5 bg-muted/30">
        <span className="text-xs font-medium text-muted-foreground">
          {isUser ? "Вы" : "Ассистент"}
        </span>
      </div>
      <div className="px-3 py-2 prose prose-sm dark:prose-invert max-w-none wrap-break-word">
        {isPending && <span className="text-muted-foreground">Думаю…</span>}
        {isStreaming && message.content && (
          <>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
            <span className="inline-block h-4 w-0.5 animate-pulse bg-current align-middle" />
          </>
        )}
        {message.role === "assistant" &&
          !isPending &&
          !isStreaming &&
          !isFailed &&
          !isCancelled &&
          message.content && (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          )}
        {message.role === "user" && message.content && <>{message.content}</>}
        {isFailed &&
          (message.content ? (
            <>{message.content}</>
          ) : (
            <span className="text-destructive">Ошибка</span>
          ))}
        {isCancelled && message.content && <>{message.content}</>}
      </div>
      {(isFailed || isCancelled) && (
        <div className="shrink-0 border-t border-border/50 px-3 py-1.5 bg-muted/20">
          <span
            className={
              isFailed
                ? "text-xs text-destructive"
                : "text-xs text-muted-foreground"
            }
          >
            {isFailed ? "Ошибка" : "Генерация отменена"}
          </span>
        </div>
      )}
    </div>
  );
}
