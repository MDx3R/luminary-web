"use client";

import { useState, useRef } from "react";
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
import type { SourceKind } from "@/types/source";
import { cn } from "@/lib/utils";

type Step = "choose" | "file" | "url";

export function AddSourceModal() {
  const currentFolder = useFolderStore((s) => s.currentFolder);
  const addSourceModalOpen = useSourcesStore((s) => s.addSourceModalOpen);
  const setAddSourceModalOpen = useSourcesStore((s) => s.setAddSourceModalOpen);
  const addSource = useSourcesStore((s) => s.addSource);

  const [step, setStep] = useState<Step>("choose");
  const [urlValue, setUrlValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const folderId = currentFolder?.id ?? null;

  function handleClose(open: boolean) {
    if (!open) {
      setAddSourceModalOpen(false);
      setStep("choose");
      setUrlValue("");
      setSelectedFile(null);
    }
  }

  function handleChooseKind(kind: SourceKind) {
    if (kind === "file") setStep("file");
    else setStep("url");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setSelectedFile(file ?? null);
  }

  function handleAddFile() {
    if (!folderId || !selectedFile) return;
    addSource(folderId, "file", {
      title: selectedFile.name,
      fileName: selectedFile.name,
      mimeType: selectedFile.type || undefined,
    });
    handleClose(false);
  }

  function handleAddUrl() {
    const url = urlValue.trim();
    if (!folderId || !url) return;
    const title =
      url.length > 50 ? url.slice(0, 50) + "…" : url;
    addSource(folderId, "url", { title, url });
    handleClose(false);
  }

  const canAddFile = Boolean(folderId && selectedFile);
  const canAddUrl = Boolean(folderId && urlValue.trim());

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
              <Button onClick={handleAddFile} disabled={!canAddFile}>
                Добавить
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
              <Button onClick={handleAddUrl} disabled={!canAddUrl}>
                Добавить
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
