import { useFolderStore } from "@/store/useFolderStore";
import { streamFolderEditorAutocomplete } from "@/lib/api/folders-api";
import { collectAutocompleteSuggestion } from "@/lib/stream-aggregate";

export interface InlineSuggestionContext {
  textBeforeCursor: string;
  textAfterCursor: string;
}

/**
 * Folder-scoped autocomplete via streaming API (same delta format as chat).
 */
export async function getInlineSuggestion(
  context: InlineSuggestionContext,
  signal?: AbortSignal,
  folderId?: string
): Promise<string | null> {
  const resolvedFolderId =
    folderId ?? useFolderStore.getState().currentFolder?.id;
  if (!resolvedFolderId) return null;
  if (
    context.textBeforeCursor.length === 0 &&
    context.textAfterCursor.length === 0
  ) {
    return null;
  }
  try {
    return collectAutocompleteSuggestion(
      streamFolderEditorAutocomplete(
        resolvedFolderId,
        {
          text_before_cursor: context.textBeforeCursor,
          text_after_cursor: context.textAfterCursor,
        },
        signal
      )
    );
  } catch {
    return null;
  }
}
