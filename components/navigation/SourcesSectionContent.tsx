"use client";

import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { listSources } from "@/lib/api/sources-api";
import { queryKeys } from "@/lib/query-keys";
import { SourceItem } from "@/components/sources/SourceItem";

export function SourcesSectionContent() {
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
      {sources.length === 0 ? (
        <p className="px-2 py-2 text-xs text-muted-foreground">
          Нет источников. Добавьте источник кнопкой выше или через папку/чат.
        </p>
      ) : (
        <ScrollArea className="flex-1 min-h-0">
          <div className="min-h-full w-full px-3">
            <ul className="flex w-full flex-col gap-2 py-2 pb-4">
              {sources.map((source) => (
                <li key={source.id} className="w-full">
                  <SourceItem source={source} />
                </li>
              ))}
            </ul>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
