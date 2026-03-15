"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileUp, Link as LinkIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

type Step = "choose" | "file" | "url";

export function AddSourceModal() {
  const queryClient = useQueryClient();
  const currentFolder = useFolderStore((s) => s.currentFolder);
  const addSourceModalOpen = useSourcesStore((s) => s.addSourceModalOpen);
  const attachContext = useSourcesStore((s) => s.attachContext);
  const setAddSourceModalOpen = useSourcesStore((s) => s.setAddSourceModalOpen);

  const [step, setStep] = useState<Step>("choose");
  const [urlValue, setUrlValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const folderId =
    attachContext?.type === "folder"
      ? attachContext.id
      : currentFolder?.id ?? null;
  const chatId = attachContext?.type === "chat" ? attachContext.id : null;

  const fileMutation = useMutation({
    mutationFn: () =>
      createFileSource(selectedFile!, selectedFile!.name),
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
    mutationFn: () => {
      const url = urlValue.trim();
      const title = url.length > 50 ? url.slice(0, 50) + "…" : url;
      return createLinkSource({ title, url });
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

  function handleClose(open: boolean) {
    if (!open) {
      setAddSourceModalOpen(false);
      setStep("choose");
      setUrlValue("");
      setSelectedFile(null);
    }
  }

  function handleChooseKind(k: "file" | "url") {
    if (k === "file") setStep("file");
    else setStep("url");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setSelectedFile(file ?? null);
  }

  function handleAddFile() {
    if (!selectedFile) return;
    fileMutation.mutate();
  }

  function handleAddUrl() {
    if (!urlValue.trim()) return;
    linkMutation.mutate();
  }

  const canAddFile = Boolean(selectedFile);
  const canAddUrl = Boolean(urlValue.trim());
  const isPending = fileMutation.isPending || linkMutation.isPending;

  if (attachContext) return null;

  return (
    <Dialog open={addSourceModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить источник</DialogTitle>
        </DialogHeader>

        {step === "choose" && (
          <div className="flex flex-col gap-2 p-4 pt-0">
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
        )}

        {step === "file" && (
          <div className="flex flex-col gap-3 p-4 pt-0">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              className="text-sm file:mr-2 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground file:text-sm"
              aria-label="Выберите файл"
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Выбран: {selectedFile.name}
              </p>
            )}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="ghost"
                onClick={() => {
                  setStep("choose");
                  setSelectedFile(null);
                }}
              >
                Назад
              </Button>
              <Button
                onClick={handleAddFile}
                disabled={!canAddFile || isPending}
              >
                {isPending ? "Загрузка…" : "Добавить"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "url" && (
          <div className="flex flex-col gap-3 p-4 pt-0">
            <Input
              type="url"
              placeholder="https://..."
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              aria-label="URL источника"
              className={cn("w-full")}
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="ghost"
                onClick={() => {
                  setStep("choose");
                  setUrlValue("");
                }}
              >
                Назад
              </Button>
              <Button
                onClick={handleAddUrl}
                disabled={!canAddUrl || isPending}
              >
                {isPending ? "Добавление…" : "Добавить"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "choose" && (
          <DialogFooter>
            <Button variant="ghost" onClick={() => handleClose(false)}>
              Отмена
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
