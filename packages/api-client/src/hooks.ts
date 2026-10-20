import * as React from "react";
import { api, realBackendFetch } from "./client";
import { mockApiRouter } from "./mock";
import {
  clearSession,
  getRefreshToken,
  getStoredTenant,
  getStoredUser,
  getToken,
  normalizeSessionUser,
  setSession,
} from "./session";
import type { ApiError, SessionUser } from "./types";

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
  const [user, setUser] = React.useState<SessionUser | null>(() => {
    return getStoredUser();
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api<{ user: any; tenant?: any; permissions?: string[] }>("/auth/me")
      .then((d) => {
        if (d?.user) {
          const activeTenant = getStoredTenant() || d.tenant;
          const normalized = normalizeSessionUser(d.user, activeTenant, d.permissions);
          setUser(normalized);
          setSession(getToken() || token, normalized, getRefreshToken() || undefined, activeTenant);
        }
      })
      .catch((err) => {
        if (err && (err as any).status === 401) {
          clearSession();
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const can = React.useCallback(
    (perm: string) => {
      if (!user?.permissions) return false;
      if (user.permissions.includes("*")) return true;
      return user.permissions.includes(perm);
    },
    [user],
  );
  const hasRole = React.useCallback(
    (...roles: string[]) => !!user && roles.some((r) => user.roles.includes(r)),
    [user],
  );

  return { user, loading, can, hasRole, setUser };
}

export async function login(
  email: string,
  password: string,
  totp?: string,
  tenantIdentifier?: string,
) {
  const normalizedEmail = email.trim().toLowerCase();
  const body: Record<string, any> = { email: normalizedEmail, password };
  if (totp) body.totp = totp;
  if (tenantIdentifier) body.tenantId = tenantIdentifier;

  try {
    const data = await realBackendFetch<{
      token?: string;
      refreshToken?: string;
      expiresAt?: number;
      user?: any;
      tenant?: any;
      permissions?: string[];
      mfaRequired?: boolean;
      mfaEnrollmentRequired?: boolean;
      secret?: string;
      otpauthUri?: string;
      message?: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (data?.token && data?.user) {
      const normalizedUser = normalizeSessionUser(data.user, data.tenant, data.permissions);
      setSession(data.token, normalizedUser, data.refreshToken, data.tenant);
      return {
        ...data,
        user: normalizedUser,
      };
    }

    return data;
  } catch (err: any) {
    if (err && err.status) {
      throw err;
    }
    console.warn("[CBMS Auth] Live backend unreachable, falling back to local mock auth:", err);
    const res = await mockApiRouter("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return res as {
      token?: string;
      refreshToken?: string;
      user?: SessionUser;
      mfaRequired?: boolean;
      mfaEnrollmentRequired?: boolean;
      secret?: string;
      otpauthUri?: string;
      message?: string;
    };
  }
}

export async function logout(redirectTo: string | false = "/login") {
  try {
    const refreshToken = getRefreshToken();
    await realBackendFetch("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // Ignore network or expired token errors during logout
  }
  clearSession();
  if (redirectTo && typeof window !== "undefined") window.location.href = redirectTo;
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
