import { ApiError } from "./types";
import { getToken, getRefreshToken, getStoredTenant, getStoredUser, setSession, normalizeSessionUser } from "./session";
import { mockApiRouter } from "./mock";

export const API_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ||
  "http://localhost:4000";

let refreshPromise: Promise<boolean> | null = null;

export async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (!data?.token) return false;

      const user = getStoredUser();
      const tenant = getStoredTenant();
      if (user) {
        setSession(data.token, user, data.refreshToken || refreshToken, tenant);
      }
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export function isLiveBackendEndpoint(cleanPath: string): boolean {
  return (
    cleanPath.startsWith("/auth/") ||
    cleanPath === "/inhabitants" ||
    cleanPath.startsWith("/inhabitants/") ||
    cleanPath === "/households" ||
    cleanPath.startsWith("/households/") ||
    cleanPath === "/tenants" ||
    cleanPath.startsWith("/tenants/") ||
    cleanPath === "/rbac" ||
    cleanPath.startsWith("/rbac/") ||
    cleanPath === "/users" ||
    cleanPath.startsWith("/users/") ||
    cleanPath === "/blotters" ||
    cleanPath.startsWith("/blotters/") ||
    cleanPath === "/blotter" ||
    cleanPath.startsWith("/blotter/") ||
    cleanPath === "/appointments" ||
    cleanPath.startsWith("/appointments/") ||
    cleanPath === "/appointment" ||
    cleanPath.startsWith("/appointment/") ||
    cleanPath === "/kp" ||
    cleanPath.startsWith("/kp/")
  );
}

export function enrichHouseholdForUi(h: any): any {
  if (!h || typeof h !== "object") return h;
  const members = Array.isArray(h.members) ? h.members : [];
  return {
    ...h,
    members,
    consents: Array.isArray(h.consents) ? h.consents : [],
    _count: h._count || { members: members.length },
  };
}

export async function realBackendFetch<T = any>(
  path: string,
  opts: RequestInit & { raw?: boolean } = {},
  retried = false,
): Promise<T> {
  const cleanPath = path.split("?")[0].replace(/^\/api/, "");
  const storedUser = getStoredUser();
  const storedTenant = getStoredTenant();
  const activeTenantId = storedUser?.tenantId || storedTenant?.id || "tnt-barangka";
  const activeBarangayId = storedUser?.barangayId || storedTenant?.barangayId || "brgy-barangka";

  let targetPath = path;
  let isUsersListBridge = false;
  let isUsersStatusBridge = false;

  if (cleanPath === "/users" && (!opts.method || opts.method === "GET")) {
    targetPath = `/api/tenants/${activeTenantId}/members`;
    isUsersListBridge = true;
  } else if (cleanPath.startsWith("/users/") && cleanPath.endsWith("/status") && opts.method === "PATCH") {
    const parts = cleanPath.split("/");
    const targetUserId = parts[2];
    targetPath = `/api/tenants/${activeTenantId}/members/${targetUserId}`;
    isUsersStatusBridge = true;
    if (opts.body) {
      try {
        const parsed = JSON.parse(opts.body as string);
        opts = {
          ...opts,
          body: JSON.stringify({
            name: parsed.fullName || parsed.name,
            role: parsed.role,
            isActive: parsed.isActive,
            banned: parsed.banned,
            canCreate: parsed.canCreate,
            canRead: parsed.canRead,
            canUpdate: parsed.canUpdate,
            canDelete: parsed.canDelete,
          }),
        };
      } catch {}
    }
  }

  const normalizedPath = targetPath.startsWith("/api/")
    ? targetPath
    : `/api${targetPath.startsWith("/") ? targetPath : `/${targetPath}`}`;
  const url = `${API_URL}${normalizedPath}`;

  const headers = new Headers(opts.headers || {});
  if (!headers.has("Content-Type") && opts.body) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token && token !== "mock-token") {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const isLoginRequest = normalizedPath.includes("/auth/login");
  if (!isLoginRequest) {
    if (activeTenantId && !headers.has("X-Tenant-Id")) {
      headers.set("X-Tenant-Id", activeTenantId);
    }
    if (activeBarangayId && !headers.has("X-Barangay-Id")) {
      headers.set("X-Barangay-Id", activeBarangayId);
    }
  }

  const res = await fetch(url, {
    ...opts,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && !retried && !isLoginRequest && !normalizedPath.includes("/auth/refresh-token")) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return realBackendFetch<T>(path, opts, true);
    }
  }

  let payload: any = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }
  } else {
    const txt = await res.text();
    payload = txt ? { message: txt } : null;
  }

  if (!res.ok) {
    throw new ApiError(res.status, payload || { message: `HTTP ${res.status}` });
  }

  if (isUsersListBridge && payload && Array.isArray(payload.members)) {
    const mappedItems = payload.members.map((m: any) => ({
      id: m.id,
      fullName: m.name || m.fullName || m.email,
      name: m.name || m.fullName || m.email,
      email: m.email,
      role: m.role,
      isActive: m.isActive !== false && !m.banned,
      banned: !!m.banned,
      tenantId: m.tenantId,
      barangayId: m.barangayId,
      phoneNumber: m.phoneNumber,
      canCreate: m.canCreate !== false,
      canRead: m.canRead !== false,
      canUpdate: m.canUpdate !== false,
      canDelete: !!m.canDelete,
      lastLoginAt: m.lastLoginAt,
      createdAt: m.createdAt,
    }));
    return { items: mappedItems, total: mappedItems.length } as unknown as T;
  }

  if (isUsersStatusBridge && payload?.member) {
    const m = payload.member;
    return {
      ...m,
      fullName: m.name || m.fullName || m.email,
    } as unknown as T;
  }

  if (cleanPath === "/households" && Array.isArray(payload)) {
    return payload.map(enrichHouseholdForUi) as unknown as T;
  }
  if (cleanPath.startsWith("/households/") && payload && typeof payload === "object" && !Array.isArray(payload)) {
    return enrichHouseholdForUi(payload) as unknown as T;
  }

  return payload as T;
}

export async function api<T = any>(
  path: string,
  opts: RequestInit & { raw?: boolean } = {},
): Promise<T> {
  if (typeof window !== "undefined") {
    const cleanPath = path.split("?")[0].replace(/^\/api/, "");
    if (isLiveBackendEndpoint(cleanPath)) {
      try {
        return await realBackendFetch<T>(path, opts);
      } catch (err) {
        if (err instanceof ApiError) {
          throw err;
        }
        console.warn(`[CBMS API] Backend unreachable for ${path}, falling back to offline store:`, err);
      }
    }
    await new Promise((r) => setTimeout(r, 80));
    return mockApiRouter(path, opts) as unknown as T;
  }
  return {} as T;
}

export const get = <T = any,>(path: string) => api<T>(path);
export const post = <T = any,>(path: string, body?: unknown) =>
  api<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) });
export const put = <T = any,>(path: string, body?: unknown) =>
  api<T>(path, { method: "PUT", body: JSON.stringify(body ?? {}) });
export const patch = <T = any,>(path: string, body?: unknown) =>
  api<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) });
export const del = <T = any,>(path: string) => api<T>(path, { method: "DELETE" });
