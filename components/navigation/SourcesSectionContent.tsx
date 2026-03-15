"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { listSources } from "@/lib/api/sources-api";
import { queryKeys } from "@/lib/query-keys";
import { SourceItem } from "@/components/sources/SourceItem";
import { useSourcesStore } from "@/store/useSourcesStore";

export function SourcesSectionContent() {
  const setAddSourceModalOpen = useSourcesStore(
    (s) => s.setAddSourceModalOpen
  );
  const { data: sources = [], isLoading } = useQuery({
    queryKey: queryKeys.sources,
    queryFn: listSources,
  });

  if (isLoading) {
    return (
      <div className="px-2 py-2 text-xs text-muted-foreground">
        Загрузка источников…
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-hidden">
      <Button
        variant="outline"
        size="sm"
        className="mx-2 w-[calc(100%-1rem)] shrink-0 justify-start gap-2"
        onClick={() => setAddSourceModalOpen(true)}
      >
        <Plus className="size-4" />
        Загрузить источник
      </Button>
      {sources.length === 0 ? (
        <p className="px-2 py-2 text-xs text-muted-foreground">
          Нет источников. Загрузите файл или ссылку кнопкой выше или через
          папку/чат.
        </p>
      ) : (
        <ScrollArea className="flex-1 min-h-0">
          <ul className="flex flex-col gap-2 py-2 pb-4">
            {sources.map((source) => (
              <li key={source.id}>
                <SourceItem source={source} />
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </div>
  );
}
