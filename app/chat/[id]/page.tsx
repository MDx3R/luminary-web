"use client"

import { useEffect, useRef } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { ChatPanel } from "@/components/chat/ChatPanel"
import { useChatStore } from "@/store/useChatStore"

export default function StandaloneChatPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = typeof params.id === "string" ? params.id : null
  const initChat = useChatStore((s) => s.initChat)
  const addMessage = useChatStore((s) => s.addMessage)
  const initialQueryAdded = useRef(false)

  useEffect(() => {
    if (!id) return
    initChat(id, [])
  }, [id, initChat])

  useEffect(() => {
    if (!id || initialQueryAdded.current) return
    const q = searchParams.get("q")
    if (q?.trim()) {
      initialQueryAdded.current = true
      addMessage(id, { role: "user", content: q.trim() })
    }
  }, [id, addMessage, searchParams])

  if (!id) return null

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-border px-4 py-2">
        <h1 className="text-sm font-medium text-muted-foreground">
          Автономный чат
        </h1>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <ChatPanel chatId={id} />
      </div>
    </div>
  )
}
