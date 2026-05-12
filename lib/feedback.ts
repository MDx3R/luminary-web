import { toast } from "sonner";
import { ApiClientError } from "@/lib/api-client";

type NotifyErrorOptions = {
  /** Sonner duration in ms; omit for library default */
  duration?: number;
};

/**
 * Глобальный канал для ошибок сети, API и системных сбоев.
 * Не использовать для микро-подтверждений (копирование и т.п.) — там inline UI.
 */
export function notifyError(
  message: string,
  options?: NotifyErrorOptions
): void {
  toast.error(message, {
    ...(options?.duration != null ? { duration: options.duration } : {}),
  });
}

export function notifyErrorFromUnknown(
  err: unknown,
  fallback: string,
  options?: NotifyErrorOptions
): void {
  const message =
    err instanceof ApiClientError
      ? err.message
      : err instanceof Error
        ? err.message
        : fallback;
  notifyError(message, options);
}
