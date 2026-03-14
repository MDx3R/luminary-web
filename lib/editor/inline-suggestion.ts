/**
 * Context for requesting an inline suggestion (Notion/Cursor-style completion).
 * Extend this interface when integrating with a real API (e.g. cursor position, doc context).
 */
export interface InlineSuggestionContext {
  /** Text from the start of the current block (or document) up to the cursor. */
  textBeforeCursor: string
}

/**
 * Fetches an inline suggestion for the given context.
 * Stub: returns null or a fixed string for UI testing.
 * Replace with API call when backend is ready.
 */
export async function getInlineSuggestion(
  context: InlineSuggestionContext
): Promise<string | null> {
  // Stub: no real completion yet. Use context.textBeforeCursor when calling API.
  if (context.textBeforeCursor.length === 0) return null
  return null
}
