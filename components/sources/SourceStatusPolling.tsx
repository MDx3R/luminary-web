"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listSources } from "@/lib/api/sources-api";
import { queryKeys } from "@/lib/query-keys";

/** Source statuses that no longer change (no need to poll). */
const FINAL_SOURCE_STATUSES = ["embedded", "failed"] as const;

function hasSourcesInProgress(
  sources: Array<{ fetch_status: string }> | undefined
): boolean {
  if (!sources?.length) return false;
  return sources.some(
    (s) =>
      !FINAL_SOURCE_STATUSES.includes(s.fetch_status as "embedded" | "failed")
  );
}

const SOURCE_POLL_INTERVAL_MS = 3000;

/**
 * Global source status polling. Fetches the user's sources list and refetches
 * every SOURCE_POLL_INTERVAL_MS while any source is in progress (not_fetched / fetched).
 * When the list updates, invalidates folder and chat queries so embedded source
 * statuses stay in sync everywhere (folder panel, chat, etc.).
 */
export function SourceStatusPolling() {
  const queryClient = useQueryClient();

  const { data: sources } = useQuery({
    queryKey: queryKeys.sources,
    queryFn: listSources,
    refetchInterval: (query) =>
      hasSourcesInProgress(query.state.data) ? SOURCE_POLL_INTERVAL_MS : false,
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    if (!sources) return;
    queryClient.invalidateQueries({ queryKey: ["folder"] });
    queryClient.invalidateQueries({ queryKey: ["chat"] });
  }, [sources, queryClient]);

  return null;
}
