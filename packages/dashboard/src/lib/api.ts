const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3334";

const TOKEN_KEY = "steve_session_token";

/** Get the stored session token */
export function getSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Store session token after login/signup */
export function setSessionToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

/** Clear session token on logout */
export function clearSessionToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = getSessionToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || res.statusText);
  }

  return res.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// SWR fetcher that attaches auth
export const fetcher = async <T = unknown>(path: string): Promise<T> => {
  return apiFetch<T>(path);
};
