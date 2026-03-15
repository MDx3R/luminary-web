"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFolderStore } from "@/store/useFolderStore";
import { useSourcesStore } from "@/store/useSourcesStore";
import { removeSourceFromFolder } from "@/lib/api/folders-api";
import { queryKeys } from "@/lib/query-keys";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { SourceItem } from "./SourceItem";
import { ApiClientError } from "@/lib/api-client";

export function SourcesPanel() {
  const queryClient = useQueryClient();
  const currentFolder = useFolderStore((s) => s.currentFolder);
  const sourcesPanelOpen = useSourcesStore((s) => s.sourcesPanelOpen);
  const setSourcesPanelOpen = useSourcesStore((s) => s.setSourcesPanelOpen);
  const openAttachModal = useSourcesStore((s) => s.openAttachModal);
  const [sourceToRemove, setSourceToRemove] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const folderId = currentFolder?.id ?? null;
  const sources = currentFolder?.sources ?? [];

  const removeMutation = useMutation({
    mutationFn: (sourceId: string) =>
      removeSourceFromFolder(folderId!, sourceId),
    onSuccess: () => {
      if (folderId)
        queryClient.invalidateQueries({ queryKey: queryKeys.folder(folderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.sources });
      toast.success("Источник убран из папки");
    },
    onError: (err) => {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : "Не удалось убрать источник из папки.";
      toast.error(msg);
    },
  });

  function handleAddSource() {
    if (folderId) openAttachModal({ type: "folder", id: folderId });
  }

  function handleRemove(sourceId: string, sourceTitle: string) {
    setSourceToRemove({ id: sourceId, title: sourceTitle });
  }

  async function handleConfirmRemove() {
    if (!sourceToRemove || !folderId) return;
    await removeMutation.mutateAsync(sourceToRemove.id);
  }

  return (
    <>
    <Sheet open={sourcesPanelOpen} onOpenChange={setSourcesPanelOpen}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Источники</SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-3 overflow-hidden px-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddSource}
            className="w-full shrink-0"
            disabled={!folderId}
          >
            <Plus className="size-4" />
            Добавить источник
          </Button>
          <ScrollArea className="flex-1 min-h-0">
            {!folderId ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Откройте папку, чтобы управлять источниками.
              </p>
            ) : sources.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Нет источников. Добавьте файл или ссылку.
              </p>
            ) : (
              <ul className="flex flex-col gap-2 pb-4">
                {sources.map((source) => (
                  <li key={source.id}>
                    <SourceItem
                      source={source}
                      onRemove={() => handleRemove(source.id, source.title)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
    <ConfirmDeleteDialog
      open={!!sourceToRemove}
      onOpenChange={(open) => !open && setSourceToRemove(null)}
      title="Убрать источник из папки?"
      description={
        sourceToRemove
          ? `Источник «${sourceToRemove.title}» будет отвязан от папки.`
          : ""
      }
      confirmLabel="Убрать"
      onConfirm={handleConfirmRemove}
      isPending={removeMutation.isPending}
    />
  </>
  );
}
