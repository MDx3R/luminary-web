"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifyError, notifyErrorFromUnknown } from "@/lib/feedback";
import { FileDown, BookMarked, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFolderStore } from "@/store/useFolderStore";
import { useSourcesStore } from "@/store/useSourcesStore";
import {
  changeFolderAssistant,
  removeFolderAssistant,
  addSourceToFolder,
} from "@/lib/api/folders-api";
import { createFileSource } from "@/lib/api/sources-api";
import { queryKeys } from "@/lib/query-keys";
import { AssistantSelector } from "@/components/assistants/AssistantSelector";
import { useMinimumPending } from "@/hooks/useMinimumPending";
import { InlineSpinner } from "@/components/shared/InlineSpinner";

export function EditorPillBar() {
  const queryClient = useQueryClient();
  const currentFolder = useFolderStore((s) => s.currentFolder);
  const pendingEditorText = useFolderStore((s) => s.pendingEditorText);
  const setSourcesPanelOpen = useSourcesStore((s) => s.setSourcesPanelOpen);
  const [sourceSavedFlash, setSourceSavedFlash] = useState(false);
  const sourceFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (sourceFlashTimerRef.current)
        clearTimeout(sourceFlashTimerRef.current);
    };
  }, []);

  const assistantMutation = useMutation({
    mutationFn: async (assistantId: string | null) => {
      if (!currentFolder?.id) return;
      if (assistantId) {
        await changeFolderAssistant(currentFolder.id, assistantId);
        return assistantId;
      }
      await removeFolderAssistant(currentFolder.id);
    },
    onSuccess: () => {
      if (!currentFolder?.id) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.folder(currentFolder.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.folders });
    },
    onError: (err) => {
      notifyErrorFromUnknown(err, "Не удалось изменить ассистента");
    },
  });

  const saveEditorAsSourceMutation = useMutation({
    mutationFn: async () => {
      if (!currentFolder?.id) throw new Error("NO_FOLDER");
      const text = pendingEditorText ?? currentFolder.editor?.text ?? "";
      if (!text.trim()) throw new Error("EMPTY");
      const base = (currentFolder.name ?? "document").replace(
        /[^\p{L}\p{N}\s_-]/gu,
        "_"
      );
      const file = new File([text], `${base}.md`, {
        type: "text/markdown;charset=utf-8",
      });
      const { id: sourceId } = await createFileSource(file, `${base}.md`);
      await addSourceToFolder(currentFolder.id, sourceId);
    },
    onSuccess: () => {
      if (!currentFolder?.id) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.sources });
      queryClient.invalidateQueries({ queryKey: queryKeys.folder(currentFolder.id) });
      if (sourceFlashTimerRef.current)
        clearTimeout(sourceFlashTimerRef.current);
      setSourceSavedFlash(true);
      sourceFlashTimerRef.current = setTimeout(() => {
        sourceFlashTimerRef.current = null;
        setSourceSavedFlash(false);
      }, 2200);
    },
    onError: (err) => {
      if (err instanceof Error && err.message === "EMPTY") {
        notifyError("Нет текста для сохранения.");
        return;
      }
      notifyErrorFromUnknown(err, "Не удалось сохранить как источник");
    },
  });

  const showAssistantPending = useMinimumPending(assistantMutation.isPending);
  const showSaveSourcePending = useMinimumPending(
    saveEditorAsSourceMutation.isPending
  );

  const exportContent = pendingEditorText ?? currentFolder?.editor?.text ?? "";

  function handleExport() {
    if (!exportContent) return;
    const text = exportContent;
    const name = (currentFolder?.name ?? "export").replace(
      /[^\p{L}\p{N}\s_-]/gu,
      "_"
    );
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleSources() {
    setSourcesPanelOpen(true);
  }

  return (
    <div className="flex shrink-0 justify-center pb-5 pt-3">
      <div className="flex items-center gap-1 rounded-full border border-border bg-background/95 px-3 py-1.5 shadow-sm">
        {currentFolder?.id && (
          <AssistantSelector
            value={currentFolder.assistant_id ?? null}
            valueLabel={currentFolder.assistant_name ?? null}
            onSelect={(id) => assistantMutation.mutate(id)}
            disabled={showAssistantPending || showSaveSourcePending}
            variant="ghost"
            size="sm"
            className="shrink-0"
          />
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExport}
          aria-label="Экспорт"
          disabled={!exportContent}
        >
          <FileDown className="size-4" />
          Экспорт
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => saveEditorAsSourceMutation.mutate()}
          aria-label="Сохранить как источник"
          disabled={
            !currentFolder?.id ||
            !exportContent ||
            showSaveSourcePending
          }
        >
          {showSaveSourcePending ? (
            <InlineSpinner className="size-4" />
          ) : sourceSavedFlash ? (
            <BookMarked className="size-4 text-muted-foreground" />
          ) : (
            <FileUp className="size-4" />
          )}
          {sourceSavedFlash ? "Сохранено" : "В источники"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSources}
          aria-label="Источники"
        >
          <BookMarked className="size-4" />
          Источники
        </Button>
      </div>
    </div>
  );
}
