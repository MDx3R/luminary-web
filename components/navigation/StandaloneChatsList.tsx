"use client"

import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { mockStandaloneChats } from "@/lib/mocks"

export function StandaloneChatsList() {
  return (
    <div className="flex flex-col gap-0.5 py-1">
      {mockStandaloneChats.length === 0 ? (
        <p className="px-2 py-2 text-xs text-muted-foreground">
          Нет автономных чатов
        </p>
      ) : (
        mockStandaloneChats.map((chat) => (
          <Link
            key={chat.id}
            href={`/chat/${chat.id}`}
            className={cn(
              "flex min-h-8 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <MessageCircle className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{chat.title}</span>
          </Link>
        ))
      )}
    </div>
  )
}
