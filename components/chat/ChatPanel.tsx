"use client";

import { useState } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/store/useChatStore";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  /** Id чата (например id папки или отдельный chatId). Если не передан, используется активный чат из стора. */
  chatId?: string | null;
}

export function ChatPanel({ chatId }: ChatPanelProps = {}) {
  const [inputValue, setInputValue] = useState("");
  const activeChatId = useChatStore((s) => s.activeChatId);
  const getMessages = useChatStore((s) => s.getMessages);
  const addMessage = useChatStore((s) => s.addMessage);

  const currentChatId = chatId ?? activeChatId;
  const messages = currentChatId ? getMessages(currentChatId) : [];

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!currentChatId) return;
    const text = inputValue.trim();
    if (!text) return;
    addMessage(currentChatId, { role: "user", content: text });
    setInputValue("");
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col gap-3 p-3">
            {messages.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Нет сообщений. Напишите что-нибудь.
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "ml-4 bg-primary text-primary-foreground"
                      : "mr-4 bg-muted"
                  )}
                >
                  <span className="font-medium text-muted-foreground">
                    {msg.role === "user" ? "Вы" : "Ассистент"}:
                  </span>{" "}
                  {msg.content}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 gap-2 border-t border-border bg-background p-3"
      >
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Сообщение…"
          className="min-w-0 flex-1"
          aria-label="Ввод сообщения"
        />
        <Button
          type="submit"
          size="icon"
          aria-label="Отправить"
          disabled={!currentChatId}
        >
          <SendHorizontal className="size-4" />
        </Button>
      </form>
    </div>
  );
}
