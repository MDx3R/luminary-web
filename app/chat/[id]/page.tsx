"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ChatToolbar } from "@/components/chat/ChatToolbar";
import { listMessages } from "@/lib/api/chats-api";
import { queryKeys } from "@/lib/query-keys";
import { useHydrateChatMessages } from "@/hooks/useHydrateChatMessages";

export default function StandaloneChatPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;

  const { data: messages } = useQuery({
    queryKey: queryKeys.messages(id ?? ""),
    queryFn: () => listMessages(id!),
    enabled: Boolean(id),
  });

  useHydrateChatMessages(id, messages);

  if (!id) return null;

  return (
    <div className="flex h-full w-full justify-center">
      <div className="flex h-full w-full max-w-3xl flex-col">
        <ChatToolbar chatId={id} />
        <div className="flex min-h-0 flex-1 flex-col">
          <ChatPanel chatId={id} />
        </div>
      </div>
    </div>
  );
}
