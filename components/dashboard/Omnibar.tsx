"use client"

import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const PLACEHOLDER = "Начни исследование или задай вопрос..."

export function Omnibar() {
  const router = useRouter()
  const [value, setValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const query = value.trim()
    if (!query) return
    const newId = crypto.randomUUID()
    router.push(`/chat/${newId}?q=${encodeURIComponent(query)}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-2xl items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20"
    >
      <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={PLACEHOLDER}
        className={cn(
          "flex-1 border-0 bg-transparent p-0 text-base placeholder:text-muted-foreground",
          "focus-visible:ring-0 focus-visible:ring-offset-0"
        )}
        aria-label={PLACEHOLDER}
        autoComplete="off"
      />
    </form>
  )
}
