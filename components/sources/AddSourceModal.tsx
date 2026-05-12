"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookMarked, FileUp, Link as LinkIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  appModalDialogContentClassName,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFolderStore } from "@/store/useFolderStore";
import { useSourcesStore } from "@/store/useSourcesStore";
import { createFileSource, createLinkSource } from "@/lib/api/sources-api";
import { addSourceToFolder } from "@/lib/api/folders-api";
import { addSourceToChat } from "@/lib/api/chats-api";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { useMinimumPending } from "@/hooks/useMinimumPending";
import { InlineSpinner } from "@/components/shared/InlineSpinner";

type Step = "choose" | "file" | "url";

export function AddSourceModal() {
  const queryClient = useQueryClient();
  const currentFolder = useFolderStore((s) => s.currentFolder);
  const addSourceModalOpen = useSourcesStore((s) => s.addSourceModalOpen);
  const attachContext = useSourcesStore((s) => s.attachContext);
  const setAddSourceModalOpen = useSourcesStore((s) => s.setAddSourceModalOpen);

  const [step, setStep] = useState<Step>("choose");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileCatalogTitle, setFileCatalogTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const folderId =
    attachContext?.type === "folder"
      ? attachContext.id
      : currentFolder?.id ?? null;
  const chatId = attachContext?.type === "chat" ? attachContext.id : null;

  const fileMutation = useMutation({
    mutationFn: () => {
      const title =
        fileCatalogTitle.trim() || selectedFile!.name;
      return createFileSource(selectedFile!, title);
    },
    onSuccess: async (data) => {
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.sources });
        if (folderId) {
          await addSourceToFolder(folderId, data.id);
          queryClient.invalidateQueries({ queryKey: queryKeys.folder(folderId) });
        }
        if (chatId) {
          await addSourceToChat(chatId, data.id);
          queryClient.invalidateQueries({ queryKey: queryKeys.chat(chatId) });
        }
      }
      handleClose(false);
    },
  });

  const linkMutation = useMutation({
    mutationFn: () =>
      createLinkSource({
        title: linkTitle.trim(),
        url: linkUrl.trim(),
      }),
    onSuccess: async (data) => {
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.sources });
        if (folderId) {
          await addSourceToFolder(folderId, data.id);
          queryClient.invalidateQueries({ queryKey: queryKeys.folder(folderId) });
        }
        if (chatId) {
          await addSourceToChat(chatId, data.id);
          queryClient.invalidateQueries({ queryKey: queryKeys.chat(chatId) });
        }
      }
      handleClose(false);
    },
  });

  function handleClose(open: boolean) {
    if (!open) {
      setAddSourceModalOpen(false);
      setStep("choose");
      setLinkUrl("");
      setLinkTitle("");
      setSelectedFile(null);
      setFileCatalogTitle("");
    }
  }

  function handleChooseKind(k: "file" | "url") {
    if (k === "file") {
      setStep("file");
      setFileCatalogTitle("");
    } else setStep("url");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setSelectedFile(file ?? null);
    setFileCatalogTitle(file?.name ?? "");
  }

  function handleAddFile() {
    if (!selectedFile) return;
    const title = fileCatalogTitle.trim() || selectedFile.name;
    if (!title) return;
    fileMutation.mutate();
  }

  function handleAddUrl() {
    if (!linkUrl.trim() || !linkTitle.trim()) return;
    linkMutation.mutate();
  }

  const canAddFile = Boolean(selectedFile);
  const canAddUrl = Boolean(linkUrl.trim()) && Boolean(linkTitle.trim());
  const isPending = fileMutation.isPending || linkMutation.isPending;
  const showPending = useMinimumPending(isPending);

  if (attachContext) return null;

  return (
    <Dialog open={addSourceModalOpen} onOpenChange={handleClose}>
      <DialogContent
        className={cn(appModalDialogContentClassName, "sm:max-w-md")}
        showCloseButton
      >
        <DialogHeader className="space-y-2 p-5 pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <BookMarked className="size-5 shrink-0 text-muted-foreground" />
            Добавить источник
          </DialogTitle>
          {step === "choose" ? (
            <DialogDescription className="text-left text-muted-foreground">
              Файл или ссылка в общий каталог.
            </DialogDescription>
          ) : (
            <DialogDescription className="sr-only">
              {step === "file"
                ? "Выбор файла и названия для каталога."
                : "Название и адрес ссылки."}
            </DialogDescription>
          )}
        </DialogHeader>

        {step === "choose" && (
          <>
            <div className="flex flex-col gap-3 px-5 pb-3">
              <Button
                variant="outline"
                className="justify-start gap-3"
                onClick={() => handleChooseKind("file")}
              >
                <FileUp className="size-4 shrink-0" />
                Загрузить файл
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-3"
                onClick={() => handleChooseKind("url")}
              >
                <LinkIcon className="size-4 shrink-0" />
                Вставить ссылку
              </Button>
            </div>
            <DialogFooter className="border-t border-border p-4 pt-5">
              <Button variant="ghost" onClick={() => handleClose(false)}>
                Отмена
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "file" && (
          <>
            <div className="flex flex-col gap-6 px-5 pb-3">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="sr-only"
                tabIndex={-1}
                aria-label="Выберите файл с устройства"
                disabled={showPending}
              />
              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-fit"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={showPending}
                >
                  Выбрать файл
                </Button>
                {selectedFile ? (
                  <p className="truncate text-xs text-muted-foreground">{selectedFile.name}</p>
                ) : null}
              </div>
              <div className="grid gap-3">
                <label
                  htmlFor="add-source-file-title"
                  className="text-sm font-medium text-foreground"
                >
                  Название
                </label>
                <Input
                  id="add-source-file-title"
                  value={fileCatalogTitle}
                  onChange={(e) => setFileCatalogTitle(e.target.value)}
                  placeholder={selectedFile ? "Как в списке" : "Сначала выберите файл"}
                  disabled={showPending}
                  className="w-full min-w-0"
                />
              </div>
            </div>
            <DialogFooter className="flex flex-row flex-wrap justify-end gap-2 border-t border-border p-4 pt-5">
              <Button
                variant="ghost"
                onClick={() => {
                  setStep("choose");
                  setSelectedFile(null);
                  setFileCatalogTitle("");
                }}
                disabled={showPending}
              >
                Назад
              </Button>
              <Button onClick={handleAddFile} disabled={!canAddFile || showPending}>
                {showPending ? (
                  <span className="inline-flex items-center gap-2">
                    <InlineSpinner className="size-3.5" />
                    Загрузка…
                  </span>
                ) : (
                  "Добавить"
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "url" && (
          <>
            <div className="flex flex-col gap-6 px-5 pb-3">
              <div className="grid gap-3">
                <label
                  htmlFor="add-source-link-title"
                  className="text-sm font-medium text-foreground"
                >
                  Название
                </label>
                <Input
                  id="add-source-link-title"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Краткое имя"
                  disabled={showPending}
                  className="w-full min-w-0"
                />
              </div>
              <div className="grid gap-3">
                <label
                  htmlFor="add-source-link-url"
                  className="text-sm font-medium text-foreground"
                >
                  URL
                </label>
                <Input
                  id="add-source-link-url"
                  type="url"
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  aria-label="URL источника"
                  disabled={showPending}
                  className="w-full min-w-0"
                />
              </div>
            </div>
            <DialogFooter className="flex flex-row flex-wrap justify-end gap-2 border-t border-border p-4 pt-5">
              <Button
                variant="ghost"
                onClick={() => {
                  setStep("choose");
                  setLinkUrl("");
                  setLinkTitle("");
                }}
                disabled={showPending}
              >
                Назад
              </Button>
              <Button onClick={handleAddUrl} disabled={!canAddUrl || showPending}>
                {showPending ? (
                  <span className="inline-flex items-center gap-2">
                    <InlineSpinner className="size-3.5" />
                    Добавление…
                  </span>
                ) : (
                  "Добавить"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
