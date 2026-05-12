"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { listSources, deleteSource } from "@/lib/api/sources-api";
import { queryKeys } from "@/lib/query-keys";
import { SourceAttachCard } from "@/components/sources/SourceAttachCard";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { useMinimumPending } from "@/hooks/useMinimumPending";
import { ListLoadingRow } from "@/components/shared/ListLoadingRow";
import { notifyErrorFromUnknown } from "@/lib/feedback";

export function SourcesSectionContent() {
  const queryClient = useQueryClient();
  const { data: sources = [], isLoading } = useQuery({
    queryKey: queryKeys.sources,
    queryFn: listSources,
  });
  const showSourcesLoading = useMinimumPending(isLoading);

  const [sourceToDelete, setSourceToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sources });
    },
    onError: (err) => {
      notifyErrorFromUnknown(err, "Не удалось удалить источник.");
    },
  });

  if (showSourcesLoading) {
    return <ListLoadingRow label="Загрузка источников…" />;
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-2 overflow-hidden">
        <p className="px-2 pt-1 text-xs font-medium text-muted-foreground">
          Все источники в аккаунте
        </p>
        {sources.length === 0 ? (
          <p className="px-2 py-2 text-xs text-muted-foreground">
            Нет источников. Добавьте источник кнопкой выше или через папку/чат.
          </p>
        ) : (
          <ScrollArea className="min-h-0 flex-1">
            <div className="min-h-full w-full px-3">
              <ul className="m-0 flex w-full list-none flex-col gap-3 p-0 py-2 pb-4">
                {sources.map((source) => (
                  <li key={source.id} className="w-full">
                    <SourceAttachCard
                      source={source}
                      showAttachCheckbox={false}
                      attachBusy={deleteMutation.isPending}
                      folderId={null}
                      chatId={null}
                      onRequestDelete={() =>
                        setSourceToDelete({
                          id: source.id,
                          title: source.title ?? "Источник",
                        })
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>
          </ScrollArea>
        )}
      </div>
      <ConfirmDeleteDialog
        open={!!sourceToDelete}
        onOpenChange={(open) => !open && setSourceToDelete(null)}
        title="Удалить источник?"
        description={
          sourceToDelete
            ? `Источник «${sourceToDelete.title}» будет удалён без возможности восстановления.`
            : ""
        }
        onConfirm={async () => {
          if (sourceToDelete)
            await deleteMutation.mutateAsync(sourceToDelete.id);
        }}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
