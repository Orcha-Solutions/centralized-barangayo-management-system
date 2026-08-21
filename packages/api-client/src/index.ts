"use client";

import * as React from "react";

export const API_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  "http://localhost:4000";

const TOKEN_KEY = "cbms.token";
const USER_KEY = "cbms.user";

export interface SessionUser {
  id: string;
  fullName: string;
  email: string | null;
  roles: string[];
  scope: string;
  permissions: string[];
  barangayId?: string | null;
  cityId?: string | null;
  inhabitantId?: string | null;
  barangay?: { id: string; name: string; mode?: string } | null;
  city?: { id: string; name: string } | null;
}

export class ApiError extends Error {
  status: number;
  body: any;
  constructor(status: number, body: any) {
    super(body?.message ?? `Request failed (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setSession(token: string, user: SessionUser) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as SessionUser) : null;
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export async function api<T = any>(
  path: string,
  opts: RequestInit & { raw?: boolean } = {},
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers ?? {}),
    },
  });

  if (opts.raw) return res as unknown as T;

  const text = await res.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      clearSession();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    throw new ApiError(res.status, body);
  }
  return body as T;
}

export const get = <T = any,>(path: string) => api<T>(path);
export const post = <T = any,>(path: string, body?: unknown) =>
  api<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) });
export const patch = <T = any,>(path: string, body?: unknown) =>
  api<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) });
export const del = <T = any,>(path: string) => api<T>(path, { method: "DELETE" });

// ---------------------------------------------------------------
// React hooks
// ---------------------------------------------------------------

export function useApi<T = any>(
  path: string | null,
  deps: unknown[] = [],
): { data: T | null; error: ApiError | null; loading: boolean; reload: () => void } {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<ApiError | null>(null);
  const [loading, setLoading] = React.useState(!!path);
  const [nonce, setNonce] = React.useState(0);

  React.useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api<T>(path)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e as ApiError))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, nonce, ...deps]);

  return { data, error, loading, reload: () => setNonce((n) => n + 1) };
}

export function useSession() {
  const [user, setUser] = React.useState<SessionUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const stored = getStoredUser();
    if (stored) setUser(stored);
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api<{ user: SessionUser }>("/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => clearSession())
      .finally(() => setLoading(false));
  }, []);

  const can = React.useCallback(
    (perm: string) => !!user?.permissions?.includes(perm),
    [user],
  );
  const hasRole = React.useCallback(
    (...roles: string[]) => !!user && roles.some((r) => user.roles.includes(r)),
    [user],
  );

  return { user, loading, can, hasRole, setUser };
}

export async function login(email: string, password: string, totp?: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, ...(totp ? { totp } : {}) }),
  });
  const body = await res.json();
  if (!res.ok) throw new ApiError(res.status, body);
  if (body.token) setSession(body.token, body.user);
  return body as {
    token?: string;
    user?: SessionUser;
    mfaRequired?: boolean;
    mfaEnrollmentRequired?: boolean;
    secret?: string;
    otpauthUri?: string;
    message?: string;
  };
}

export async function logout() {
  try {
    await post("/auth/logout");
  } catch {
    /* ignore */
  }
  clearSession();
  if (typeof window !== "undefined") window.location.href = "/login";
}

/** Query-string builder that drops empty values. */
export function qs(params: Record<string, string | number | undefined | null>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "" && v !== "all") p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}
