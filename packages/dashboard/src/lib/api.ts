const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3334";

let tokenGetter: (() => Promise<string | null>) | null = null;

/** Called from the AuthProvider to inject Clerk's getToken */
export function setTokenGetter(fn: () => Promise<string | null>) {
  tokenGetter = fn;
}

async function getAuthHeaders(): Promise<HeadersInit> {
  if (typeof window === "undefined") return {};
  try {
    const token = await tokenGetter?.();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch {
    // token fetch failed
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
