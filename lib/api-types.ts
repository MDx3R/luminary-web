export interface AuthTokensResponse {
  user_id: string;
  access_token: string;
  refresh_token: string;
}

export interface IdentityResponse {
  id: string;
  username: string;
}

export interface IDResponse {
  id: string;
}

export interface ApiErrorDetail {
  error?: string;
  message?: string;
  username?: string;
}

export class AuthApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: ApiErrorDetail
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}
