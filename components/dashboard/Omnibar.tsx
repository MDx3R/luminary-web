"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createChat } from "@/lib/api/chats-api";
import { notifyErrorFromUnknown } from "@/lib/feedback";
import { useMinimumPending } from "@/hooks/useMinimumPending";
import { InlineSpinner } from "@/components/shared/InlineSpinner";
import { useAuthStore } from "@/store/useAuthStore";

const PLACEHOLDER = "Начни исследование или задай вопрос...";

export function Omnibar() {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [value, setValue] = useState("");
  const [creating, setCreating] = useState(false);
  const showCreating = useMinimumPending(creating);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = value.trim();
    if (!isLoggedIn || !query || creating) return;
    setCreating(true);
    try {
      const { id } = await createChat({ name: null });
      router.push(`/chat/${id}?q=${encodeURIComponent(query)}`);
    } catch (err) {
      notifyErrorFromUnknown(err, "Не удалось создать чат.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-2xl items-center gap-2 rounded-xl border-2 border-border bg-background px-4 py-3 shadow-sm transition-colors focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20"
    >
      <span className="relative flex size-5 shrink-0 items-center justify-center text-muted-foreground">
        {showCreating ? (
          <InlineSpinner className="size-5" />
        ) : (
          <Search className="size-5" aria-hidden />
        )}
      </span>
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={
          isLoggedIn ? PLACEHOLDER : "Войдите, чтобы создавать чаты и искать…"
        }
        disabled={!isLoggedIn || creating || showCreating}
        className={cn(
          "flex-1 border-0 bg-transparent p-0 text-base placeholder:text-muted-foreground",
          "dark:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        )}
        aria-label={
          isLoggedIn ? PLACEHOLDER : "Войдите, чтобы создавать чаты и искать"
        }
        autoComplete="off"
      />
    </form>
  );
}
