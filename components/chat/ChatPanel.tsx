"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  type ComponentProps,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SendHorizontal, Square, Copy, RotateCcw, Check } from "lucide-react";
import { useMinimumPending } from "@/hooks/useMinimumPending";
import { InlineSpinner } from "@/components/shared/InlineSpinner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/store/useChatStore";
import { useSourcesStore } from "@/store/useSourcesStore";
import {
  getChat,
  listMessages,
  sendMessage,
  getMessageResponseStream,
  cancelMessage,
  changeChatAssistant,
  removeChatAssistant,
} from "@/lib/api/chats-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { AssistantSelector } from "@/components/assistants/AssistantSelector";
import { notifyError, notifyErrorFromUnknown } from "@/lib/feedback";
import { cn } from "@/lib/utils";
import { isStreamingMessageStatus } from "@/lib/chat-stream-status";
import { consumeAssistantMessageStream } from "@/lib/assistant-message-stream";
import type { ChatMessage } from "@/types/chat";

/** Stable empty array for store selector to avoid getSnapshot loop when chat has no messages */
const EMPTY_MESSAGES: ChatMessage[] = [];

const EMPTY_PROMPTS = [
  "Объясни простыми словами",
  "Напиши краткое резюме",
  "Какие есть варианты?",
];

interface ChatPanelProps {
  /** Id чата (REST `/chats/{id}`). Если не передан, используется активный чат из стора. */
  chatId?: string | null;
  /** Подпись для селектора ассистента, когда не выбран (например "Ассистент папки" в боковой панели папки). */
  assistantEmptyLabel?: string;
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

export function ChatPanel({
  chatId,
  assistantEmptyLabel,
}: ChatPanelProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const showSendBusy = useMinimumPending(sending);
  const [sendError, setSendError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const initialQueryFromUrlHandledRef = useRef(false);

  const activeChatId = useChatStore((s) => s.activeChatId);
  const currentChatId = chatId ?? activeChatId;
  const messages = useChatStore((s) =>
    currentChatId ? (s.chats[currentChatId] ?? EMPTY_MESSAGES) : EMPTY_MESSAGES
  );
  const addMessage = useChatStore((s) => s.addMessage);
  const updateMessage = useChatStore((s) => s.updateMessage);
  const removeMessage = useChatStore((s) => s.removeMessage);

  const queryClient = useQueryClient();
  const openAttachModal = useSourcesStore((s) => s.openAttachModal);

  const { data: chat } = useQuery({
    queryKey: queryKeys.chat(currentChatId ?? ""),
    queryFn: () => getChat(currentChatId!),
    enabled: Boolean(currentChatId),
  });

  const {
    isPending: messagesQueryPending,
    isFetching: messagesQueryFetching,
    data: messagesQueryData,
  } = useQuery({
    queryKey: queryKeys.messages(currentChatId ?? ""),
    queryFn: () => listMessages(currentChatId!),
    enabled: Boolean(currentChatId),
  });

  const showThreadLoading =
    Boolean(currentChatId) &&
    messages.length === 0 &&
    (messagesQueryPending ||
      (messagesQueryFetching && messagesQueryData === undefined));

  const assistantMutation = useMutation({
    mutationFn: async (assistantId: string | null) => {
      if (!currentChatId) return;
      if (assistantId) {
        await changeChatAssistant(currentChatId, assistantId);
      } else {
        await removeChatAssistant(currentChatId);
      }
    },
    onSuccess: () => {
      if (!currentChatId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat(currentChatId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.chats });
    },
    onError: (err) => {
      notifyErrorFromUnknown(err, "Не удалось изменить ассистента");
    },
  });

  const lastMessage = messages[messages.length - 1];
  const streaming =
    lastMessage?.role === "assistant" &&
    isStreamingMessageStatus(lastMessage.status);
  const assistantMessageId =
    lastMessage?.role === "assistant" ? lastMessage.id : null;

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, lastMessage?.content, scrollToBottom]);

  useEffect(() => {
    initialQueryFromUrlHandledRef.current = false;
  }, [currentChatId]);

  const sendMessageText = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text) return;

      const cid = chatId ?? useChatStore.getState().activeChatId;
      if (!cid) return;

      const msgs = useChatStore.getState().chats[cid] ?? [];
      const last = msgs[msgs.length - 1];
      if (last?.role === "assistant" && isStreamingMessageStatus(last.status))
        return;

      setSending(true);
      setSendError(null);
      const tempUserId = `pending-user-${Date.now()}`;
      addMessage(cid, {
        id: tempUserId,
        role: "user",
        content: text,
        status: "completed",
      });

      try {
        const { id: userMessageId } = await sendMessage(cid, text);
        updateMessage(cid, tempUserId, { id: userMessageId });
        const tempAssistantId = `pending-${userMessageId}`;
        addMessage(cid, {
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
          await consumeAssistantMessageStream(
            getMessageResponseStream(
              cid,
              userMessageId,
              controller.signal
            ),
            {
              onStart: (newId, status) => {
                updateMessage(cid, tempAssistantId, {
                  id: newId,
                  status: status || "streaming",
                });
                currentAssistantId = newId;
              },
              onDelta: (chunk, status) => {
                accumulated += chunk;
                updateMessage(cid, currentAssistantId, {
                  content: accumulated,
                  status: status || "streaming",
                });
              },
              onEnd: () => {
                updateMessage(cid, currentAssistantId, {
                  status: "completed",
                });
              },
              onError: (errContent) => {
                updateMessage(cid, currentAssistantId, {
                  status: "failed",
                  content: errContent,
                });
              },
            }
          );
        } catch (err) {
          if ((err as Error).name === "AbortError") {
            updateMessage(cid, currentAssistantId, {
              status: "cancelled",
            });
          } else {
            updateMessage(cid, currentAssistantId, {
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
            queryKey: queryKeys.messages(cid),
          });
        }

        inputRef.current?.focus();
      } catch (err) {
        removeMessage(cid, tempUserId);
        const message =
          err instanceof Error ? err.message : "Не удалось отправить сообщение";
        setSendError(message);
        inputRef.current?.focus();
      } finally {
        setSending(false);
      }
    },
    [chatId, addMessage, updateMessage, removeMessage, queryClient]
  );

  useEffect(() => {
    if (!currentChatId || initialQueryFromUrlHandledRef.current) return;
    const q = searchParams.get("q")?.trim();
    if (!q) return;

    initialQueryFromUrlHandledRef.current = true;
    const next = new URLSearchParams(searchParams.toString());
    next.delete("q");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    void sendMessageText(q);
  }, [
    currentChatId,
    pathname,
    router,
    searchParams,
    sendMessageText,
  ]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentChatId) return;
    const text = inputValue.trim();
    if (!text) return;
    if (streaming) return;

    setInputValue("");
    await sendMessageText(text);
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
        {currentChatId && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border/50 bg-muted/20 px-3 py-2 text-xs">
            <span className="text-muted-foreground">
              Источники в чате:{" "}
              <span className="font-medium text-foreground">
                {chat?.sources?.length ?? 0}
              </span>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() =>
                openAttachModal({ type: "chat", id: currentChatId })
              }
            >
              Управлять
            </Button>
          </div>
        )}
        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col gap-4 p-4">
            {showThreadLoading ? (
              <div className="flex flex-col items-center gap-2 py-12">
                <InlineSpinner className="size-6 text-muted-foreground" />
                <p className="text-center text-sm text-muted-foreground">
                  Загрузка сообщений…
                </p>
              </div>
            ) : messages.length === 0 ? (
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
                      disabled={showSendBusy}
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
        className="flex shrink-0 flex-col gap-3 border-t border-border bg-background px-4 pt-4 pb-5 min-w-[200px]"
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
            onKeyDown={(e) => {
              if (e.key !== "Enter" || e.shiftKey) return;
              if (e.nativeEvent.isComposing) return;
              if (!currentChatId || streaming || showSendBusy) return;
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }}
            placeholder="Сообщение…"
            aria-label="Ввод сообщения"
            disabled={!currentChatId || streaming || showSendBusy}
            className="border-0 rounded-none rounded-t-lg focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/20 px-2 py-1.5 rounded-b-lg">
            <div className="flex shrink-0">
              {currentChatId && (
                <AssistantSelector
                  value={chat?.assistant_id ?? null}
                  valueLabel={chat?.assistant_name ?? null}
                  onSelect={(id) => assistantMutation.mutate(id)}
                  emptyLabel={assistantEmptyLabel}
                  disabled={assistantMutation.isPending || showSendBusy}
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                />
              )}
            </div>
            <div className="flex shrink-0">
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
                  disabled={
                    !currentChatId || !inputValue.trim() || showSendBusy
                  }
                >
                  {showSendBusy ? (
                    <InlineSpinner className="size-4" />
                  ) : (
                    <SendHorizontal className="size-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

interface ChatMessageBlockProps {
  message: ChatMessage;
}

function buildMessageCopyText(message: ChatMessage): string {
  const body = (message.content ?? "").trim();
  if (message.attachments.length === 0) return body;
  const names = message.attachments.map((a) => a.name).join(", ");
  if (!body) return `Вложения: ${names}`;
  return `${body}\n\nВложения: ${names}`;
}

function ChatMessageBlock({ message }: ChatMessageBlockProps) {
  const isUser = message.role === "user";
  const isGenerating =
    message.role === "assistant" &&
    isStreamingMessageStatus(message.status);
  const isFailed = message.status === "failed";
  const isCancelled = message.status === "cancelled";
  const showMessageActions =
    message.status === "completed" &&
    !isFailed &&
    !isCancelled &&
    (Boolean(message.content) || message.attachments.length > 0);

  const contentTrimmed = (message.content ?? "").trim();
  const showPlaceholder = isGenerating && !contentTrimmed;
  const hasStreamingBody = isGenerating && Boolean(contentTrimmed);

  const [copyDone, setCopyDone] = useState(false);
  const copyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyResetRef.current) clearTimeout(copyResetRef.current);
    };
  }, []);

  const handleCopyMessage = useCallback(async () => {
    const text = buildMessageCopyText(message);
    if (!text) {
      notifyError("Нечего копировать");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopyDone(true);
      if (copyResetRef.current) clearTimeout(copyResetRef.current);
      copyResetRef.current = setTimeout(() => {
        copyResetRef.current = null;
        setCopyDone(false);
      }, 2000);
    } catch (err) {
      notifyErrorFromUnknown(err, "Не удалось скопировать");
    }
  }, [message]);

  return (
    <div
      className={cn(
        "group/msg flex flex-col rounded-lg border text-sm max-w-[85%] overflow-hidden shadow-sm transition-[box-shadow,border-color,transform] duration-200 hover:border-border/55 hover:shadow-md",
        isUser
          ? "ml-auto border-border/60 bg-primary/10 text-foreground"
          : "mr-auto border-border/30 bg-muted/25 text-foreground"
      )}
    >
      <div
        className={cn(
          "shrink-0 border-b border-border/50 px-3 py-1.5",
          isUser ? "bg-muted/25" : "bg-muted/15"
        )}
      >
        <span className="text-xs font-medium text-muted-foreground">
          {isUser ? "Вы" : "Ассистент"}
        </span>
      </div>
      <div
        className={cn(
          "px-3 py-2 prose prose-sm dark:prose-invert max-w-none wrap-break-word",
          !isUser && "prose-headings:font-medium prose-p:leading-relaxed"
        )}
      >
        {showPlaceholder && (
          <span className="text-muted-foreground animate-pulse">Думаю…</span>
        )}
        {hasStreamingBody && (
          <>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
            <span className="inline-block h-4 w-0.5 animate-pulse bg-current align-middle" />
          </>
        )}
        {message.role === "assistant" &&
          !isGenerating &&
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
      {message.attachments.length > 0 && (
        <div className="shrink-0 border-t border-border/40 bg-muted/10 px-3 py-2">
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Вложения
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {message.attachments.map((a) => (
              <li
                key={`${a.content_id}-${a.name}`}
                className="rounded-md border border-border/50 bg-background/80 px-2 py-0.5 text-xs text-foreground/90"
              >
                {a.name}
              </li>
            ))}
          </ul>
        </div>
      )}
      {showMessageActions && (
        <div className="flex shrink-0 flex-wrap gap-1 border-t border-border/40 bg-muted/10 px-2 py-1.5 opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => void handleCopyMessage()}
            aria-label="Копировать текст сообщения"
            aria-live="polite"
          >
            {copyDone ? (
              <Check className="size-3.5 shrink-0 text-muted-foreground" />
            ) : (
              <Copy className="size-3.5 shrink-0" />
            )}
            {copyDone ? "Скопировано" : "Копировать"}
          </Button>
          {!isUser && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              disabled
              title="Скоро"
              aria-label="Повторить ответ — скоро"
            >
              <RotateCcw className="size-3.5 shrink-0" />
              Ещё раз
            </Button>
          )}
        </div>
      )}
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
