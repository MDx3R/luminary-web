"use client";

"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useFolderStore } from "@/store/useFolderStore";
import { getChat } from "@/lib/api/chats-api";
import { queryKeys } from "@/lib/query-keys";

/**
 * Сжатый wayfinding: папка / чат в папке / автономный чат / дашборд / настройки.
 */
export function HeaderContextTitle() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentFolder = useFolderStore((s) => s.currentFolder);

  const folderMatch = pathname?.match(/^\/folder\/([^/]+)/);
  const folderIdFromPath = folderMatch?.[1] ?? null;
  const chatFromUrl = folderIdFromPath ? searchParams.get("chat") : null;
  const standaloneChatMatch = pathname?.match(/^\/chat\/([^/]+)/);
  const standaloneChatId = standaloneChatMatch?.[1] ?? null;

  const { data: standaloneChat } = useQuery({
    queryKey: queryKeys.chat(standaloneChatId ?? ""),
    queryFn: () => getChat(standaloneChatId!),
    enabled: Boolean(standaloneChatId),
  });

  let label: string | null = null;

  if (folderIdFromPath && currentFolder?.id === folderIdFromPath) {
    const chatName = currentFolder.chats?.find((c) => c.id === chatFromUrl)
      ?.name;
    if (chatFromUrl && chatName) {
      label = `${currentFolder.name} · ${chatName}`;
    } else {
      label = currentFolder.name;
    }
  } else if (standaloneChatId && standaloneChat?.name) {
    label = standaloneChat.name;
  } else if (pathname === "/dashboard" || pathname === "/") {
    label = "Дашборд";
  } else if (pathname?.startsWith("/settings")) {
    label = "Настройки";
  }

  if (!label) return null;

  return (
    <p
      className="min-w-0 max-w-full truncate text-center text-xs font-medium text-muted-foreground md:text-sm"
      title={label}
    >
      {label}
    </p>
  );
}
