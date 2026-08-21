"use client";

import * as React from "react";
import seedData from "./seed.json";

export const API_URL = "http://localhost:4000";

const TOKEN_KEY = "cbms.token";
const USER_KEY = "cbms.user";
const STORE_KEY = "cbms.store";

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

// ---- Client-side database store ----
function getStore(): Record<string, any[]> {
  if (typeof window === "undefined") return {};
  let raw = window.localStorage.getItem(STORE_KEY);
  if (!raw) {
    // Copy the templates from seedData to avoid mutating them
    const initialStore = JSON.parse(JSON.stringify(seedData));
    window.localStorage.setItem(STORE_KEY, JSON.stringify(initialStore));
    return initialStore;
  }
  return JSON.parse(raw);
}

function saveStore(store: Record<string, any[]>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

const ROLE_PERMISSIONS_MOCK: Record<string, string[]> = {
  SYSTEM_ADMIN: ["*"],
  LGU_ADMIN: ["inhabitants:view", "issuance:view", "kp:view", "property:view", "disaster:view", "gad:view", "legislation:view", "devplan:view", "institutions:view", "finance:view", "wallet:view", "concerns:view", "feedback:view", "reports:view", "reports:create", "reports:edit", "reports:delete", "admin:view", "admin:approve", "admin:configure", "ai:view"],
  PUNONG_BARANGAY: ["inhabitants:view", "inhabitants:create", "inhabitants:edit", "issuance:view", "issuance:create", "issuance:edit", "issuance:delete", "issuance:approve", "issuance:sign", "kp:view", "kp:create", "kp:edit", "kp:delete", "vawc:view", "property:view", "property:create", "property:edit", "disaster:view", "disaster:create", "disaster:edit", "disaster:delete", "gad:view", "gad:create", "gad:edit", "gad:delete", "legislation:view", "legislation:create", "legislation:edit", "legislation:delete", "devplan:view", "devplan:create", "devplan:edit", "devplan:delete", "institutions:view", "institutions:create", "institutions:edit", "institutions:delete", "finance:view", "finance:approve", "website:view", "website:create", "website:edit", "website:delete", "reports:view", "reports:create", "reports:edit", "reports:delete", "admin:view", "admin:configure", "wallet:view", "wallet:approve", "announcements:view", "announcements:create", "announcements:edit", "announcements:delete", "concerns:view", "concerns:approve", "sos:view"],
  BARANGAY_SECRETARY: ["inhabitants:view", "inhabitants:create", "inhabitants:edit", "issuance:view", "issuance:create", "issuance:edit", "kp:view", "blotter:view", "blotter:create", "blotter:edit"],
  BARANGAY_TREASURER: ["wallet:view", "wallet:create", "wallet:edit", "wallet:encode", "cert:view"],
  LUPON_SECRETARY: ["kp:view", "kp:create", "kp:edit", "kp:delete"],
  VAW_DESK: ["blotter:view", "blotter:create", "vawc:view"],
  BHW: ["inhabitants:view", "health:view", "health:create"],
  TANOD: ["sos:view", "sos:respond"],
  DILG_VIEWER: ["reports:view"],
  RESIDENT: ["cert:request", "wallet:view", "concern:create", "sos:create"]
};

function getRolePermissions(role: string): string[] {
  return ROLE_PERMISSIONS_MOCK[role] || ["wallet:view"];
}

function mockSessionUser(email: string): SessionUser {
  const store = getStore();
  const user = store.User?.find(u => u.email?.toLowerCase() === email.toLowerCase());
  
  if (user) {
    const userRole = store.UserRole?.find(ur => ur.userId === user.id);
    const roleObj = store.Role?.find(r => r.id === userRole?.roleId);
    const roleKey = roleObj?.key || "RESIDENT";
    const brgy = store.Barangay?.find(b => b.id === user.barangayId);
    
    return {
      id: user.id,
      fullName: user.fullName || "User",
      email: user.email,
      roles: [roleKey],
      scope: roleKey === "LGU_ADMIN" ? "city" : roleKey === "DILG_VIEWER" ? "platform" : roleKey === "RESIDENT" ? "self" : "barangay",
      permissions: getRolePermissions(roleKey),
      barangayId: user.barangayId,
      cityId: user.cityId,
      inhabitantId: user.inhabitantId,
      barangay: brgy ? { id: brgy.id, name: brgy.name } : null
    };
  }

  // Fallback preset templates if user is not in database
  const emailClean = email.toLowerCase();
  if (emailClean.includes("kapitan")) {
    return {
      id: "usr-kap",
      fullName: "Kapitan Antonio Barangka",
      email: "kapitan@barangka.gov.ph",
      roles: ["PUNONG_BARANGAY"],
      scope: "barangay",
      permissions: getRolePermissions("PUNONG_BARANGAY"),
      barangayId: "barangka",
      barangay: { id: "barangka", name: "Barangka" }
    };
  }
  if (emailClean.includes("lgu")) {
    return {
      id: "usr-lgu",
      fullName: "Mayor Marikina Admin",
      email: "lgu@marikina.gov.ph",
      roles: ["LGU_ADMIN"],
      scope: "city",
      permissions: getRolePermissions("LGU_ADMIN"),
      cityId: "marikina",
    };
  }
  return {
    id: "usr-res1",
    fullName: "Resident Cardo Dalisay",
    email: email || "resident1@example.ph",
    roles: ["RESIDENT"],
    scope: "self",
    permissions: getRolePermissions("RESIDENT"),
    barangayId: "barangka",
    inhabitantId: "res1-inhabitant",
    barangay: { id: "barangka", name: "Barangka" }
  };
}

// ---- Client-side API Mock Router ----
async function mockApiRouter(path: string, opts: RequestInit = {}): Promise<any> {
  const store = getStore();
  const cleanPath = path.split("?")[0];
  const method = opts.method || "GET";

  // 1. Auth endpoints
  if (cleanPath === "/auth/login" && method === "POST") {
    const body = JSON.parse(opts.body as string);
    const email = body.email || "";
    // If empty, fall back based on app port
    let targetEmail = email;
    if (!targetEmail) {
      const port = window.location.port;
      if (port === "4101") targetEmail = "resident1@example.ph";
      else if (port === "4102") targetEmail = "lgu@marikina.gov.ph";
      else if (port === "4103") targetEmail = "treasurer@barangka.gov.ph";
      else targetEmail = "kapitan@barangka.gov.ph";
    }
    const user = mockSessionUser(targetEmail);
    setSession("mock-token", user);
    return { token: "mock-token", user };
  }

  if (cleanPath === "/auth/me" && method === "GET") {
    const storedUser = getStoredUser();
    if (!storedUser) {
      // Fallback
      const port = window.location.port;
      let email = "kapitan@barangka.gov.ph";
      if (port === "4101") email = "resident1@example.ph";
      else if (port === "4102") email = "lgu@marikina.gov.ph";
      else if (port === "4103") email = "treasurer@barangka.gov.ph";
      const u = mockSessionUser(email);
      setSession("mock-token", u);
      return { user: u };
    }
    return { user: storedUser };
  }

  if (cleanPath === "/auth/logout" && method === "POST") {
    clearSession();
    return {};
  }

  // Helper: check logged-in user
  const currentUser = getStoredUser() || mockSessionUser("kapitan@barangka.gov.ph");

  // 2. Health
  if (cleanPath === "/health" && method === "GET") {
    return { status: "ok", service: "cbms-api-mock", uptimeSec: 9999, timestamp: new Date().toISOString() };
  }

  // 3. Public barangays
  if (cleanPath === "/public/barangays" && method === "GET") {
    return store.Barangay || [];
  }

  // 4. Inhabitants
  if (cleanPath === "/inhabitants" && method === "GET") {
    let list = store.Inhabitant || [];
    if (currentUser.barangayId) {
      list = list.filter(x => x.barangayId === currentUser.barangayId);
    }
    return list;
  }

  if (cleanPath === "/inhabitants/stats" && method === "GET") {
    const list = (store.Inhabitant || []).filter(x => !currentUser.barangayId || x.barangayId === currentUser.barangayId);
    return {
      total: list.length,
      male: list.filter(x => x.gender === "male" || x.gender === "M").length,
      female: list.filter(x => x.gender === "female" || x.gender === "F").length,
      seniors: list.filter(x => x.age >= 60).length,
      youth: list.filter(x => x.age >= 15 && x.age <= 30).length
    };
  }

  // 5. Certificates
  if (cleanPath === "/certificates" && method === "GET") {
    let list = store.CertificateRequest || [];
    if (currentUser.barangayId) {
      list = list.filter(x => x.barangayId === currentUser.barangayId);
    }
    // Resolve relation fields
    return list.map(c => ({
      ...c,
      inhabitant: store.Inhabitant?.find(i => i.id === c.inhabitantId),
      type: store.CertificateType?.find(t => t.id === c.typeId)
    }));
  }

  if (cleanPath === "/certificates/stats" && method === "GET") {
    const list = (store.CertificateRequest || []).filter(x => !currentUser.barangayId || x.barangayId === currentUser.barangayId);
    return {
      pending: list.filter(x => x.status === "pending").length,
      approved: list.filter(x => x.status === "approved" || x.status === "signed" || x.status === "ready").length,
      rejected: list.filter(x => x.status === "rejected").length
    };
  }

  if (cleanPath === "/certificate-types" && method === "GET") {
    return store.CertificateType || [];
  }

  // 6. Katarungang Pambarangay (KP) & Blotter
  if (cleanPath === "/kp/cases" && method === "GET") {
    let list = store.KpCase || [];
    if (currentUser.barangayId) {
      list = list.filter(x => x.barangayId === currentUser.barangayId);
    }
    return list;
  }

  if (cleanPath === "/blotter" && method === "GET") {
    let list = store.BlotterEntry || [];
    if (currentUser.barangayId) {
      list = list.filter(x => x.barangayId === currentUser.barangayId);
    }
    return list;
  }

  // 7. Properties & Concerns
  if (cleanPath === "/properties" && method === "GET") {
    let list = store.Property || [];
    if (currentUser.barangayId) {
      list = list.filter(x => x.barangayId === currentUser.barangayId);
    }
    return list;
  }

  if (cleanPath === "/concerns" && method === "GET") {
    let list = store.Concern || [];
    if (currentUser.barangayId) {
      list = list.filter(x => x.barangayId === currentUser.barangayId);
    }
    return list;
  }

  // 8. Wallets & Transactions
  if (cleanPath === "/wallets/me" && method === "GET") {
    const inhId = currentUser.inhabitantId || "res1-inhabitant";
    const wallet = store.Wallet?.find(w => w.inhabitantId === inhId);
    if (!wallet) return { balanceCentavos: 100000, id: "mock-wallet-id" };
    return wallet;
  }

  if (cleanPath === "/wallet/scorecard" && method === "GET") {
    const list = store.WalletTransaction || [];
    return {
      balanceCentavos: 50000000n,
      totalTransactions: list.length,
      totalDisbursements: list.filter(x => x.type === "disbursement").length
    };
  }

  if (cleanPath === "/wallet/batches" && method === "GET") {
    return store.DisbursementBatch || [];
  }

  // 9. Dashboard aggregates
  if (cleanPath === "/dashboard" && method === "GET") {
    const brgyId = currentUser.barangayId || "barangka";
    const inhabitants = (store.Inhabitant || []).filter(x => x.barangayId === brgyId);
    const households = (store.Household || []).filter(x => x.barangayId === brgyId);
    const certificates = (store.CertificateRequest || []).filter(x => x.barangayId === brgyId);
    const kpCases = (store.KpCase || []).filter(x => x.barangayId === brgyId);
    const concerns = (store.Concern || []).filter(x => x.barangayId === brgyId);
    const sosAlerts = (store.SosAlert || []).filter(x => x.barangayId === brgyId);
    const batches = (store.DisbursementBatch || []).filter(x => x.barangayId === brgyId || !x.barangayId);

    const population = {
      inhabitants: inhabitants.length,
      households: households.length,
      seniors: inhabitants.filter(x => x.isSenior || x.age >= 60).length,
      pwd: inhabitants.filter(x => x.isPwd).length
    };

    const actionQueue = {
      certificatesForApproval: certificates.filter(x => x.status === "pending").length,
      openConcerns: concerns.filter(x => x.status === "open").length,
      activeSosAlerts: sosAlerts.filter(x => x.status === "active").length,
      kpCasesNearDeadline: kpCases.filter(x => x.stage !== "closed" && x.stage !== "settled").length,
      kpCasesBreached: 0,
      disbursementBatchesForApproval: batches.filter(x => x.status === "pending" || x.status === "prepared").length
    };

    const wallet = {
      registeredWallets: store.Wallet?.length || 5,
      transactions30d: store.WalletTransaction?.length || 10,
      volume30dCentavos: "2500000"
    };

    const satisfaction = {
      responses30d: store.Feedback?.length || 8,
      averageRating: 4.5
    };

    return {
      population,
      actionQueue,
      wallet,
      satisfaction,
      kpAtRisk: []
    };
  }

  if (cleanPath === "/hub/scorecard" && method === "GET") {
    return {
      totalBarangays: store.Barangay?.length || 20,
      totalInhabitants: store.Inhabitant?.length || 2225,
      totalHouseholds: store.Household?.length || 546,
      totalCertificatesIssued: store.CertificateRequest?.filter(x => x.status === "signed").length || 150
    };
  }

  if (cleanPath === "/reports/quarterly" && method === "GET") {
    return {
      quarter: "Q3 2026",
      inhabitantsSeeded: store.Inhabitant?.length || 2225,
      certificatesIssued: store.CertificateRequest?.filter(x => x.status === "signed").length || 150,
      disbursedTotalCentavos: 125000000
    };
  }

  // 10. Resident specific profile, requests, concerns
  if (cleanPath === "/me/profile" && method === "GET") {
    return store.Inhabitant?.find(i => i.id === currentUser.inhabitantId) || store.Inhabitant?.[0] || {};
  }

  if (cleanPath === "/me/requests" && method === "GET") {
    return (store.CertificateRequest || []).filter(x => x.inhabitantId === currentUser.inhabitantId).map(c => ({
      ...c,
      type: store.CertificateType?.find(t => t.id === c.typeId)
    }));
  }

  if (cleanPath === "/me/concerns" && method === "GET") {
    return (store.Concern || []).filter(x => x.userId === currentUser.id || x.barangayId === currentUser.barangayId);
  }

  if (cleanPath === "/me/data-export" && method === "GET") {
    return { message: "Mock data export generated successfully." };
  }

  // 11. Mutations / POST requests
  if (method === "POST") {
    const body = opts.body ? JSON.parse(opts.body as string) : {};
    
    if (cleanPath === "/certificates") {
      const newReq = {
        id: "cert-" + Math.random().toString(36).substring(2, 9),
        inhabitantId: currentUser.inhabitantId || "res1-inhabitant",
        typeId: body.typeId,
        purpose: body.purpose,
        status: "pending",
        barangayId: currentUser.barangayId || "barangka",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (!store.CertificateRequest) store.CertificateRequest = [];
      store.CertificateRequest.push(newReq);
      saveStore(store);
      return newReq;
    }

    if (cleanPath === "/concerns") {
      const newConcern = {
        id: "con-" + Math.random().toString(36).substring(2, 9),
        title: body.title,
        description: body.description,
        status: "open",
        category: body.category,
        barangayId: currentUser.barangayId || "barangka",
        userId: currentUser.id,
        createdAt: new Date().toISOString()
      };
      if (!store.Concern) store.Concern = [];
      store.Concern.push(newConcern);
      saveStore(store);
      return newConcern;
    }

    if (cleanPath === "/sos") {
      const newAlert = {
        id: "sos-" + Math.random().toString(36).substring(2, 9),
        location: body.location || "Unknown location",
        status: "active",
        barangayId: currentUser.barangayId || "barangka",
        inhabitantId: currentUser.inhabitantId || "res1-inhabitant",
        createdAt: new Date().toISOString()
      };
      if (!store.SosAlert) store.SosAlert = [];
      store.SosAlert.push(newAlert);
      saveStore(store);
      return newAlert;
    }

    if (cleanPath === "/feedback/csm") {
      const newFb = {
        id: "fb-" + Math.random().toString(36).substring(2, 9),
        rating: body.rating,
        comments: body.comments,
        service: body.service,
        barangayId: currentUser.barangayId || "barangka",
        createdAt: new Date().toISOString()
      };
      if (!store.Feedback) store.Feedback = [];
      store.Feedback.push(newFb);
      saveStore(store);
      return newFb;
    }

    if (cleanPath === "/wallet/cash-out") {
      // Simulate Sari-Sari merchant cash out
      const amountCentavos = Number(body.amountCentavos || 0);
      const resId = body.inhabitantId;
      const wallet = store.Wallet?.find(w => w.inhabitantId === resId);
      if (wallet) {
        wallet.balanceCentavos = Number(wallet.balanceCentavos || 0) - amountCentavos;
      }
      const newTx = {
        id: "tx-" + Math.random().toString(36).substring(2, 9),
        walletId: wallet?.id || "mock-wallet",
        amountCentavos: amountCentavos,
        type: "cash_out",
        status: "completed",
        createdAt: new Date().toISOString()
      };
      if (!store.WalletTransaction) store.WalletTransaction = [];
      store.WalletTransaction.push(newTx);
      saveStore(store);
      return newTx;
    }

    // Approve / Reject certificate requests
    const approveMatch = cleanPath.match(/\/certificates\/([^\/]+)\/approve/);
    if (approveMatch) {
      const id = approveMatch[1];
      const req = store.CertificateRequest?.find(x => x.id === id);
      if (req) {
        req.status = "signed";
        req.updatedAt = new Date().toISOString();
        saveStore(store);
      }
      return req || {};
    }

    const rejectMatch = cleanPath.match(/\/certificates\/([^\/]+)\/reject/);
    if (rejectMatch) {
      const id = rejectMatch[1];
      const req = store.CertificateRequest?.find(x => x.id === id);
      if (req) {
        req.status = "rejected";
        req.updatedAt = new Date().toISOString();
        saveStore(store);
      }
      return req || {};
    }
  }

  // Fallback default response for unmocked GET paths
  if (method === "GET") {
    // If it maps to a table name in uppercase, return that array
    const parts = cleanPath.split("/");
    const targetModel = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1, -1) : "";
    if (store[targetModel]) {
      return store[targetModel];
    }
    return [];
  }

  return {};
}

export async function api<T = any>(
  path: string,
  opts: RequestInit & { raw?: boolean } = {},
): Promise<T> {
  if (typeof window !== "undefined") {
    // Execute router in-browser with a slight simulated network delay for realism
    await new Promise(r => setTimeout(r, 100));
    return mockApiRouter(path, opts) as unknown as T;
  }
  return {} as T;
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
    (perm: string) => !!(user?.permissions?.includes(perm) || user?.permissions?.includes("*")),
    [user],
  );
  const hasRole = React.useCallback(
    (...roles: string[]) => !!user && roles.some((r) => user.roles.includes(r)),
    [user],
  );

  return { user, loading, can, hasRole, setUser };
}

export async function login(email: string, password: string, totp?: string) {
  const body = { email, password, totp };
  const res = await mockApiRouter("/auth/login", {
    method: "POST",
    body: JSON.stringify(body)
  });
  return res as {
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
  await mockApiRouter("/auth/logout", { method: "POST" });
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
