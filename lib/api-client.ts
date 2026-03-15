import { useAuthStore } from "@/store/useAuthStore";

export function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }
  return url.replace(/\/$/, "") + "/api/v1";
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: unknown
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail: unknown;
    try {
      const text = await res.text();
      if (text) detail = JSON.parse(text) as unknown;
      else detail = undefined;
    } catch {
      detail = undefined;
    }
    const message =
      typeof detail === "object" &&
      detail !== null &&
      "message" in detail &&
      typeof (detail as { message: unknown }).message === "string"
        ? (detail as { message: string }).message
        : `Ошибка запроса: ${res.status}`;
    throw new ApiClientError(message, res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export interface ApiFetchOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { headers = {}, skipAuth = false, ...rest } = options;
  const base = getBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const token = skipAuth ? null : useAuthStore.getState().accessToken;
  const authHeaders: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  let res = await fetch(url, {
    ...rest,
    headers: { ...authHeaders, ...headers },
    credentials: "include",
  });

  if (res.status === 401 && !skipAuth) {
    try {
      await useAuthStore.getState().refreshTokens();
      const newToken = useAuthStore.getState().accessToken;
      if (newToken) {
        res = await fetch(url, {
          ...rest,
          headers: {
            ...authHeaders,
            Authorization: `Bearer ${newToken}`,
            ...headers,
          },
          credentials: "include",
        });
      }
    } catch {
      useAuthStore.getState().logout();
      throw new ApiClientError("Требуется авторизация.", 401);
    }
  }

  return handleResponse<T>(res);
}
