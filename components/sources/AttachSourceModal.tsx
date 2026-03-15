"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Check, FileUp, Link as LinkIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSourcesStore } from "@/store/useSourcesStore";
import { listSources } from "@/lib/api/sources-api";
import { getFolder } from "@/lib/api/folders-api";
import { getChat } from "@/lib/api/chats-api";
import { addSourceToFolder, removeSourceFromFolder } from "@/lib/api/folders-api";
import { addSourceToChat, removeSourceFromChat } from "@/lib/api/chats-api";
import { createFileSource, createLinkSource } from "@/lib/api/sources-api";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import type { Source } from "@/types/source";

const fetchStatusLabels: Record<string, string> = {
  not_fetched: "Ожидание",
  fetched: "Загружено",
  embedded: "Готово",
  failed: "Ошибка",
};

type AttachStep = "list" | "upload";
type UploadKind = "choose" | "file" | "url";

export function AttachSourceModal() {
  const queryClient = useQueryClient();
  const addSourceModalOpen = useSourcesStore((s) => s.addSourceModalOpen);
  const attachContext = useSourcesStore((s) => s.attachContext);
  const closeAttachModal = useSourcesStore((s) => s.closeAttachModal);

  const [step, setStep] = useState<AttachStep>("list");
  const [uploadKind, setUploadKind] = useState<UploadKind>("choose");
  const [urlValue, setUrlValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: sources = [], isLoading: sourcesLoading } = useQuery({
    queryKey: queryKeys.sources,
    queryFn: listSources,
    enabled: addSourceModalOpen,
  });

  const folderId =
    attachContext?.type === "folder" ? attachContext.id : null;
  const chatId = attachContext?.type === "chat" ? attachContext.id : null;

  const { data: folder } = useQuery({
    queryKey: queryKeys.folder(folderId!),
    queryFn: () => getFolder(folderId!),
    enabled: addSourceModalOpen && Boolean(folderId),
  });
  const { data: chat } = useQuery({
    queryKey: queryKeys.chat(chatId!),
    queryFn: () => getChat(chatId!),
    enabled: addSourceModalOpen && Boolean(chatId),
  });

  const attachedSourceIds = new Set<string>(
    folderId
      ? (folder?.sources ?? []).map((s) => s.id)
      : (chat?.sources ?? []).map((s) => s.id)
  );

  const addToFolderMutation = useMutation({
    mutationFn: ({ sourceId }: { sourceId: string }) =>
      addSourceToFolder(folderId!, sourceId),
    onSuccess: () => {
      if (folderId)
        queryClient.invalidateQueries({ queryKey: queryKeys.folder(folderId) });
    },
  });
  const removeFromFolderMutation = useMutation({
    mutationFn: ({ sourceId }: { sourceId: string }) =>
      removeSourceFromFolder(folderId!, sourceId),
    onSuccess: () => {
      if (folderId)
        queryClient.invalidateQueries({ queryKey: queryKeys.folder(folderId) });
    },
  });
  const addToChatMutation = useMutation({
    mutationFn: ({ sourceId }: { sourceId: string }) =>
      addSourceToChat(chatId!, sourceId),
    onSuccess: () => {
      if (chatId)
        queryClient.invalidateQueries({ queryKey: queryKeys.chat(chatId) });
    },
  });
  const removeFromChatMutation = useMutation({
    mutationFn: ({ sourceId }: { sourceId: string }) =>
      removeSourceFromChat(chatId!, sourceId),
    onSuccess: () => {
      if (chatId)
        queryClient.invalidateQueries({ queryKey: queryKeys.chat(chatId) });
    },
  });

  function handleCheckedChange(sourceId: string, checked: boolean) {
    if (folderId) {
      if (checked) addToFolderMutation.mutate({ sourceId });
      else removeFromFolderMutation.mutate({ sourceId });
    } else if (chatId) {
      if (checked) addToChatMutation.mutate({ sourceId });
      else removeFromChatMutation.mutate({ sourceId });
    }
  }

  const createFileMutation = useMutation({
    mutationFn: () =>
      createFileSource(selectedFile!, selectedFile!.name),
    onSuccess: async (data) => {
      if (!data?.id) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.sources });
      if (folderId) {
        await addSourceToFolder(folderId, data.id);
        queryClient.invalidateQueries({ queryKey: queryKeys.folder(folderId) });
      }
      if (chatId) {
        await addSourceToChat(chatId, data.id);
        queryClient.invalidateQueries({ queryKey: queryKeys.chat(chatId) });
      }
      setStep("list");
      setUploadKind("choose");
      setSelectedFile(null);
    },
  });

  const createLinkMutation = useMutation({
    mutationFn: () => {
      const url = urlValue.trim();
      const title = url.length > 50 ? url.slice(0, 50) + "…" : url;
      return createLinkSource({ title, url });
    },
    onSuccess: async (data) => {
      if (!data?.id) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.sources });
      if (folderId) {
        await addSourceToFolder(folderId, data.id);
        queryClient.invalidateQueries({ queryKey: queryKeys.folder(folderId) });
      }
      if (chatId) {
        await addSourceToChat(chatId, data.id);
        queryClient.invalidateQueries({ queryKey: queryKeys.chat(chatId) });
      }
      setStep("list");
      setUploadKind("choose");
      setUrlValue("");
    },
  });

  const uploadPending =
    createFileMutation.isPending || createLinkMutation.isPending;

  const title =
    attachContext?.type === "folder"
      ? "Добавить источник в папку"
      : "Добавить источник в чат";

  function handleOpenChange(open: boolean) {
    if (!open) {
      setStep("list");
      setUploadKind("choose");
      setUrlValue("");
      setSelectedFile(null);
      closeAttachModal();
    }
  }

  if (!addSourceModalOpen) return null;

  if (step === "upload") {
    return (
      <Dialog open={addSourceModalOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md flex flex-col max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Загрузить новый источник</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            {uploadKind === "choose" && (
              <>
                <Button
                  variant="outline"
                  className="justify-start gap-3"
                  onClick={() => setUploadKind("file")}
                >
                  <FileUp className="size-4 shrink-0" />
                  Загрузить файл
                </Button>
                <Button
                  variant="outline"
                  className="justify-start gap-3"
                  onClick={() => setUploadKind("url")}
                >
                  <LinkIcon className="size-4 shrink-0" />
                  Вставить ссылку
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setStep("list")}
                  className="self-start"
                >
                  Назад к списку
                </Button>
              </>
            )}
            {uploadKind === "file" && (
              <div className="flex flex-col gap-3">
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={(e) =>
                    setSelectedFile(e.target.files?.[0] ?? null)
                  }
                  className="text-sm file:mr-2 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground file:text-sm"
                  aria-label="Выберите файл"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Выбран: {selectedFile.name}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setUploadKind("choose");
                      setSelectedFile(null);
                    }}
                  >
                    Назад
                  </Button>
                  <Button
                    onClick={() => createFileMutation.mutate()}
                    disabled={!selectedFile || uploadPending}
                  >
                    {uploadPending ? "Загрузка…" : "Загрузить и привязать"}
                  </Button>
                </div>
              </div>
            )}
            {uploadKind === "url" && (
              <div className="flex flex-col gap-3">
                <Input
                  type="url"
                  placeholder="https://..."
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  aria-label="URL источника"
                />
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setUploadKind("choose");
                      setUrlValue("");
                    }}
                  >
                    Назад
                  </Button>
                  <Button
                    onClick={() => createLinkMutation.mutate()}
                    disabled={!urlValue.trim() || uploadPending}
                  >
                    {uploadPending ? "Добавление…" : "Добавить и привязать"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={addSourceModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col items-center py-2">
            {sourcesLoading ? (
              <p className="py-4 text-sm text-muted-foreground">
                Загрузка источников…
              </p>
            ) : (
              <>
                <ul className="flex w-full max-w-[280px] flex-col gap-1">
                  {sources.length === 0 ? (
                    <p className="py-2 text-center text-sm text-muted-foreground">
                      Нет источников. Загрузите новый ниже.
                    </p>
                  ) : (
                    sources.map((source: Source) => {
                      const isAttached = attachedSourceIds.has(source.id);
                      const isPending =
                        addToFolderMutation.isPending ||
                        removeFromFolderMutation.isPending ||
                        addToChatMutation.isPending ||
                        removeFromChatMutation.isPending;
                      return (
                        <li
                          key={source.id}
                          className={cn(
                            "flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                          )}
                        >
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={isAttached}
                            disabled={isPending}
                            onClick={() =>
                              handleCheckedChange(source.id, !isAttached)
                            }
                            className={cn(
                              "flex shrink-0 size-6 items-center justify-center rounded-full border-2 transition-colors",
                              isAttached
                                ? "border-green-600 bg-green-600 text-white"
                                : "border-muted-foreground/40 hover:border-muted-foreground/60"
                            )}
                            aria-label={
                              isAttached
                                ? `Отвязать «${source.title}»`
                                : `Привязать «${source.title}»`
                            }
                          >
                            {isAttached ? (
                              <Check className="size-3.5 stroke-[2.5]" />
                            ) : null}
                          </button>
                          <div className="min-w-0 flex-1">
                            <span className="truncate font-medium">
                              {source.title}
                            </span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {fetchStatusLabels[source.fetch_status] ??
                                source.fetch_status}
                            </span>
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 justify-center gap-2"
                    onClick={() => setStep("upload")}
                  >
                    <FileUp className="size-4" />
                    Загрузить новый источник
                  </Button>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
