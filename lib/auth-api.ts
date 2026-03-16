import type {
  AuthTokensResponse,
  IdentityResponse,
  IDResponse,
  ApiErrorDetail,
} from "./api-types";
import { AuthApiError } from "./api-types";

const getBaseUrl = (): string => {
  const url = (process.env.NEXT_PUBLIC_API_URL ?? "").trim().replace(/\/$/, "");
  // Empty = same origin (e.g. behind nginx that proxies /auth and /users to backend)
  return url;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail: ApiErrorDetail | undefined;
    try {
      const body = await res.json();
      detail = body.detail as ApiErrorDetail | undefined;
      if (typeof detail === "object" && detail?.message) {
        throw new AuthApiError(detail.message, res.status, detail);
      }
      if (typeof detail === "object" && detail?.error) {
        const msg =
          detail.error === "UsernameAlreadyTakenError"
            ? "Имя пользователя уже занято."
            : detail.error === "InvalidUsernameOrPasswordError"
              ? "Неверное имя пользователя или пароль."
              : (detail.message ?? "Ошибка запроса.");
        throw new AuthApiError(msg, res.status, detail);
      }
    } catch (e) {
      if (e instanceof AuthApiError) throw e;
    }
    throw new AuthApiError(
      res.status === 401
        ? "Требуется авторизация."
        : res.status === 403
          ? "Доступ запрещён."
          : `Ошибка запроса: ${res.status}`,
      res.status,
      detail
    );
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function login(
  username: string,
  password: string
): Promise<AuthTokensResponse> {
  const base = getBaseUrl();
  const body = new URLSearchParams({ username, password });
  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    credentials: "include",
  });
  return handleResponse<AuthTokensResponse>(res);
}

export async function register(
  username: string,
  password: string
): Promise<IDResponse> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    credentials: "include",
  });
  return handleResponse<IDResponse>(res);
}

export async function fetchMe(accessToken: string): Promise<IdentityResponse> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: "include",
  });
  return handleResponse<IdentityResponse>(res);
}

export async function logout(accessToken: string): Promise<void> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: "include",
  });
  await handleResponse<void>(res);
}

export async function refreshToken(
  refreshTokenValue: string
): Promise<AuthTokensResponse> {
  const base = getBaseUrl();
  const body = new URLSearchParams({
    refresh_token: refreshTokenValue,
    grant_type: "refresh_token",
  });
  const res = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    credentials: "include",
  });
  return handleResponse<AuthTokensResponse>(res);
}
