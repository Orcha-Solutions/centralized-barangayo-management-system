"use client";

import * as React from "react";
import seedData from "./seed.json";

export const API_URL = "http://localhost:4000";

const TOKEN_KEY = "cbms.token";
const USER_KEY = "cbms.user";
const STORE_KEY = "cbms.store_v3";

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
  const fresh = user?.email ? mockSessionUser(user.email) : user;
  window.localStorage.setItem(USER_KEY, JSON.stringify(fresh));
}

export function getStoredUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SessionUser;
    if (parsed?.email) {
      return mockSessionUser(parsed.email);
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

import {
  STATIC_BARANGAY_ID,
  STATIC_CERTIFICATE_TYPES,
  STATIC_CERTIFICATE_REQUESTS,
  STATIC_LGU_REQUESTS,
  STATIC_BLOTTER_ENTRIES,
  STATIC_KP_CASES,
  STATIC_SOS_ALERTS,
  STATIC_LEDGER_ENTRIES,
  STATIC_OFFICIAL_RECEIPTS,
  STATIC_BUDGETS,
  STATIC_RPT_PROPERTIES,
  STATIC_RPT_TAX_DUES,
  STATIC_DISBURSEMENT_BATCHES,
  STATIC_DISBURSEMENT_ITEMS,
  STATIC_PROPERTIES,
  STATIC_MATERIALS,
  STATIC_CONCERNS,
} from "./staticData";

export * from "./staticData";

// ---- Client-side database store ----
let _inMemoryStore: Record<string, any[]> | null = null;

function getStore(): Record<string, any[]> {
  if (typeof window === "undefined") return seedData as unknown as Record<string, any[]>;
  if (!_inMemoryStore) {
    // Free up old bloated localStorage keys if present
    try {
      window.localStorage.removeItem("cbms.store");
      window.localStorage.removeItem("cbms.store_v2");
      window.localStorage.removeItem("cbms.store_v3");
    } catch {}

    // Clone seed data once in memory
    const initializedStore: Record<string, any[]> = JSON.parse(JSON.stringify(seedData));

    // Load any lightweight user mutations from localStorage
    try {
      const delta = window.localStorage.getItem("cbms.mutations");
      if (delta) {
        const parsed = JSON.parse(delta);
        for (const [k, v] of Object.entries(parsed)) {
          if (Array.isArray(v)) initializedStore[k] = v;
        }
      }
    } catch {}

    // Attach strongly-typed static datasets (always available at the top)
    initializedStore.LguDocRequest = [
      ...STATIC_LGU_REQUESTS,
      ...(initializedStore.LguDocRequest || []).filter(x => !STATIC_LGU_REQUESTS.some(s => s.id === x.id))
    ];
    initializedStore.CertificateType = [
      ...STATIC_CERTIFICATE_TYPES,
      ...(initializedStore.CertificateType || []).filter(x => !STATIC_CERTIFICATE_TYPES.some(s => s.id === x.id))
    ];
    initializedStore.CertificateRequest = [
      ...STATIC_CERTIFICATE_REQUESTS,
      ...(initializedStore.CertificateRequest || []).filter(x => !STATIC_CERTIFICATE_REQUESTS.some(s => s.id === x.id))
    ];
    initializedStore.BlotterEntry = [
      ...STATIC_BLOTTER_ENTRIES,
      ...(initializedStore.BlotterEntry || []).filter(x => !STATIC_BLOTTER_ENTRIES.some(s => s.id === x.id))
    ];
    initializedStore.KpCase = [
      ...STATIC_KP_CASES,
      ...(initializedStore.KpCase || []).filter(x => !STATIC_KP_CASES.some(s => s.id === x.id))
    ];
    initializedStore.SosAlert = [
      ...STATIC_SOS_ALERTS,
      ...(initializedStore.SosAlert || []).filter(x => !STATIC_SOS_ALERTS.some(s => s.id === x.id))
    ];
    initializedStore.LedgerEntry = [
      ...STATIC_LEDGER_ENTRIES,
      ...(initializedStore.LedgerEntry || []).filter(x => !STATIC_LEDGER_ENTRIES.some(s => s.id === x.id))
    ];
    initializedStore.OfficialReceipt = [
      ...STATIC_OFFICIAL_RECEIPTS,
      ...(initializedStore.OfficialReceipt || []).filter(x => !STATIC_OFFICIAL_RECEIPTS.some(s => s.id === x.id))
    ];
    initializedStore.Budget = [
      ...STATIC_BUDGETS,
      ...(initializedStore.Budget || []).filter(x => !STATIC_BUDGETS.some(s => s.id === x.id))
    ];
    initializedStore.RptProperty = [
      ...STATIC_RPT_PROPERTIES,
      ...(initializedStore.RptProperty || []).filter(x => !STATIC_RPT_PROPERTIES.some(s => s.id === x.id))
    ];
    initializedStore.RptTaxDue = [
      ...STATIC_RPT_TAX_DUES,
      ...(initializedStore.RptTaxDue || []).filter(x => !STATIC_RPT_TAX_DUES.some(s => s.id === x.id))
    ];
    initializedStore.DisbursementBatch = [
      ...STATIC_DISBURSEMENT_BATCHES,
      ...(initializedStore.DisbursementBatch || []).filter(x => !STATIC_DISBURSEMENT_BATCHES.some(s => s.id === x.id))
    ];
    initializedStore.DisbursementBatchItem = [
      ...STATIC_DISBURSEMENT_ITEMS,
      ...(initializedStore.DisbursementBatchItem || []).filter(x => !STATIC_DISBURSEMENT_ITEMS.some(s => s.id === x.id))
    ];
    initializedStore.Property = [
      ...STATIC_PROPERTIES,
      ...(initializedStore.Property || []).filter(x => !STATIC_PROPERTIES.some(s => s.id === x.id))
    ];
    initializedStore.Material = [
      ...STATIC_MATERIALS,
      ...(initializedStore.Material || []).filter(x => !STATIC_MATERIALS.some(s => s.id === x.id))
    ];
    initializedStore.Concern = [
      ...STATIC_CONCERNS,
      ...(initializedStore.Concern || []).filter(x => !STATIC_CONCERNS.some(s => s.id === x.id))
    ];

    _inMemoryStore = initializedStore;
  }
  return _inMemoryStore;
}

function saveStore(store: Record<string, any[]>) {
  _inMemoryStore = store;
  if (typeof window === "undefined") return;
  try {
    const delta: Record<string, any[]> = {
      CertificateRequest: store.CertificateRequest,
      LguDocRequest: store.LguDocRequest,
      BlotterEntry: store.BlotterEntry,
      KpCase: store.KpCase,
      SosAlert: store.SosAlert,
      Household: store.Household,
      Concern: store.Concern,
      Appointment: store.Appointment,
      Property: store.Property,
      Material: store.Material
    };
    window.localStorage.setItem("cbms.mutations", JSON.stringify(delta));
  } catch {}
}

const ROLE_PERMISSIONS_MOCK: Record<string, string[]> = {
  SYSTEM_ADMIN: ["*"],
  PUNONG_BARANGAY: ["*"],
  LGU_ADMIN: ["inhabitants:view", "issuance:view", "kp:view", "property:view", "property:encode", "disaster:view", "gad:view", "legislation:view", "devplan:view", "institutions:view", "finance:view", "wallet:manage", "concerns:view", "concerns:encode", "feedback:view", "reports:view", "admin:view", "admin:approve", "admin:configure", "ai:view"],
  BARANGAY_SECRETARY: ["inhabitants:view", "inhabitants:create", "inhabitants:edit", "issuance:view", "issuance:create", "issuance:edit", "appointments:view", "concerns:view", "concerns:encode", "legislation:view", "announcements:view", "reports:view", "kp:view", "blotter:view", "property:view", "property:encode"],
  BDC_OFFICER: ["devplan:view", "devplan:create", "devplan:edit", "institutions:view", "reports:view"],
  BDRRMC_OFFICER: ["disaster:view", "disaster:create", "sos:view", "property:view", "property:encode"],
  VAW_DESK_OFFICER: [
    "blotter:view",
    "blotter:create",
    "vawc:view",
    "vawc:create",
    "vawc:encode"
  ],
  LUPON_SECRETARY: ["kp:view", "kp:create", "kp:edit", "blotter:view"],
  BARANGAY_TREASURER: ["finance:view", "wallet:manage", "property:view", "property:encode", "issuance:view"],
  TANOD: ["sos:view", "sos:respond", "kp:view", "blotter:view", "concerns:view", "concerns:encode"],
  BHW: ["inhabitants:view", "health:view", "concerns:view", "concerns:encode"],
  SK_OFFICIAL: ["devplan:view", "institutions:view", "announcements:view"],
  BADAC_OFFICER: ["kp:view", "blotter:view", "institutions:view"],
  DILG_VIEWER: ["reports:view"],
  RESIDENT: ["cert:request", "wallet:resident", "concern:create", "sos:create"]
};

function getRolePermissions(role: string): string[] {
  if (role === "PUNONG_BARANGAY" || role === "SYSTEM_ADMIN") return ["*"];
  return ROLE_PERMISSIONS_MOCK[role] || [];
}

function mockSessionUser(email: string): SessionUser {
  const emailClean = (email || "").toLowerCase().trim();
  
  // 1. BDC (Barangay Development Council)
  if (emailClean.includes("bdc")) {
    return {
      id: "usr-bdc",
      fullName: "Engr. Roberto Gomez (BDC Chair)",
      email: "bdc@barangka.gov.ph",
      roles: ["BDC_OFFICER"],
      scope: "barangay",
      permissions: getRolePermissions("BDC_OFFICER"),
      barangayId: STATIC_BARANGAY_ID,
      barangay: { id: STATIC_BARANGAY_ID, name: "Barangka" }
    };
  }

  // 2. VAW Desk Officer
  if (emailClean.includes("vaw")) {
    return {
      id: "usr-vaw",
      fullName: "Elena Rivera (VAW Desk Officer)",
      email: "vawdesk@barangka.gov.ph",
      roles: ["VAW_DESK_OFFICER"],
      scope: "barangay",
      permissions: getRolePermissions("VAW_DESK_OFFICER"),
      barangayId: STATIC_BARANGAY_ID,
      barangay: { id: STATIC_BARANGAY_ID, name: "Barangka" }
    };
  }

  // 3. Lupon Secretary
  if (emailClean.includes("lupon")) {
    return {
      id: "usr-lupon",
      fullName: "Atty. Fernando Cruz (Lupon Secretary)",
      email: "lupon@barangka.gov.ph",
      roles: ["LUPON_SECRETARY"],
      scope: "barangay",
      permissions: getRolePermissions("LUPON_SECRETARY"),
      barangayId: STATIC_BARANGAY_ID,
      barangay: { id: STATIC_BARANGAY_ID, name: "Barangka" }
    };
  }

  // 4. Barangay Treasurer
  if (emailClean.includes("treasurer")) {
    return {
      id: "usr-treas",
      fullName: "Teresa Morales (Barangay Treasurer)",
      email: "treasurer@barangka.gov.ph",
      roles: ["BARANGAY_TREASURER"],
      scope: "barangay",
      permissions: getRolePermissions("BARANGAY_TREASURER"),
      barangayId: STATIC_BARANGAY_ID,
      barangay: { id: STATIC_BARANGAY_ID, name: "Barangka" }
    };
  }

  // 5. Barangay Tanod
  if (emailClean.includes("tanod")) {
    return {
      id: "usr-tanod",
      fullName: "Executive Officer Rommel Reyes (Tanod)",
      email: "tanod@barangka.gov.ph",
      roles: ["TANOD"],
      scope: "barangay",
      permissions: getRolePermissions("TANOD"),
      barangayId: STATIC_BARANGAY_ID,
      barangay: { id: STATIC_BARANGAY_ID, name: "Barangka" }
    };
  }

  // 6. BDRRMC Officer
  if (emailClean.includes("bdrrmc") || emailClean.includes("drrm")) {
    return {
      id: "usr-bdrrmc",
      fullName: "Capt. Danilo Cruz (BDRRMC Chief)",
      email: "bdrrmc@barangka.gov.ph",
      roles: ["BDRRMC_OFFICER"],
      scope: "barangay",
      permissions: getRolePermissions("BDRRMC_OFFICER"),
      barangayId: STATIC_BARANGAY_ID,
      barangay: { id: STATIC_BARANGAY_ID, name: "Barangka" }
    };
  }

  // 7. Barangay Secretary
  if (emailClean.includes("secretary")) {
    return {
      id: "usr-sec",
      fullName: "Lourdes Bautista (Barangay Secretary)",
      email: "secretary@barangka.gov.ph",
      roles: ["BARANGAY_SECRETARY"],
      scope: "barangay",
      permissions: getRolePermissions("BARANGAY_SECRETARY"),
      barangayId: STATIC_BARANGAY_ID,
      barangay: { id: STATIC_BARANGAY_ID, name: "Barangka" }
    };
  }

  // 8. BHW
  if (emailClean.includes("bhw")) {
    return {
      id: "usr-bhw",
      fullName: "Corazon Del Rosario (BHW Lead)",
      email: "bhw@barangka.gov.ph",
      roles: ["BHW"],
      scope: "barangay",
      permissions: getRolePermissions("BHW"),
      barangayId: STATIC_BARANGAY_ID,
      barangay: { id: STATIC_BARANGAY_ID, name: "Barangka" }
    };
  }

  // 9. Punong Barangay (Super Admin)
  if (emailClean.includes("kapitan")) {
    return {
      id: "usr-kap",
      fullName: "Eduardo M. Santos (Punong Barangay)",
      email: "kapitan@barangka.gov.ph",
      roles: ["PUNONG_BARANGAY"],
      scope: "barangay",
      permissions: getRolePermissions("PUNONG_BARANGAY"),
      barangayId: STATIC_BARANGAY_ID,
      barangay: { id: STATIC_BARANGAY_ID, name: "Barangka" }
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

  const store = getStore();
  const user = store.User?.find(u => u.email?.toLowerCase() === emailClean);
  
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

  return {
    id: "usr-res1",
    fullName: "Resident Cardo Dalisay",
    email: email || "resident1@example.ph",
    roles: ["RESIDENT"],
    scope: "self",
    permissions: getRolePermissions("RESIDENT"),
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "res1-inhabitant",
    barangay: { id: STATIC_BARANGAY_ID, name: "Barangka" }
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
    const token = getToken();
    if (!token) {
      throw new ApiError(401, { message: "Unauthorized: No token provided" });
    }
    const storedUser = getStoredUser();
    if (!storedUser?.email) {
      throw new ApiError(401, { message: "Unauthorized: No active user session" });
    }
    const refreshed = mockSessionUser(storedUser.email);
    setSession(token, refreshed);
    return { user: refreshed };
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

  // Households GET
  if (cleanPath === "/households" && method === "GET") {
    let list = store.Household || [];
    if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
      const filtered = list.filter(x => x.barangayId === currentUser.barangayId);
      if (filtered.length > 0) list = filtered;
    }
    return list.map(h => {
      const members = (store.Inhabitant || []).filter(i => i.householdId === h.id);
      return {
        ...h,
        members,
        _count: { members: members.length },
        consents: h.consents || []
      };
    });
  }

  // Household Details GET
  const hhDetailMatch = cleanPath.match(/\/households\/([^\/]+)$/);
  if (hhDetailMatch && method === "GET") {
    const id = hhDetailMatch[1];
    const h = store.Household?.find(x => x.id === id);
    if (!h) return null;
    const members = (store.Inhabitant || []).filter(i => i.householdId === h.id);
    return {
      ...h,
      members,
      _count: { members: members.length },
      consents: h.consents || []
    };
  }

  // Household Timeline / Transactions GET
  const hhTimelineMatch = cleanPath.match(/\/households\/([^\/]+)\/transactions/);
  if (hhTimelineMatch && method === "GET") {
    const hhId = hhTimelineMatch[1];
    const h = store.Household?.find(x => x.id === hhId);
    const members = (store.Inhabitant || []).filter(i => i.householdId === hhId);
    const memberIds = members.map(m => m.id);

    const certs = (store.CertificateRequest || []).filter(c => memberIds.includes(c.inhabitantId));
    
    const timeline = [
      ...certs.map(c => ({
        id: c.id,
        type: "document",
        description: `Barangay Clearance (${c.purpose || "General Purpose"}) - ${members.find(m => m.id === c.inhabitantId)?.firstName || "Member"}`,
        amount: (Number(c.fee) || 0) * 100,
        status: c.status,
        date: c.createdAt
      })),
      {
        id: `m-ayuda-${hhId}`,
        type: "aid",
        description: "Emergency Ayuda / Social Amelioration Cash Assistance Disbursement",
        amount: 500000,
        status: "completed",
        date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `m-relief-${hhId}`,
        type: "relief",
        description: "Disaster Relief Operations Food Pack Distribution (Typhoon Recovery)",
        amount: 0,
        status: "released",
        date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `m-cert-${hhId}`,
        type: "document",
        description: "Barangay Certificate of Residency & Co-habitation",
        amount: 5000,
        status: "signed",
        date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `m-hh-reg-${hhId}`,
        type: "registry",
        description: "RBI Household Registration & Profiling Intake",
        amount: 0,
        status: "completed",
        date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return timeline;
  }

  // 5. Certificates
  if (cleanPath === "/certificates" && method === "GET") {
    let list = store.CertificateRequest || [];
    if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
      const filtered = list.filter(x => x.barangayId === currentUser.barangayId || x.barangayId === STATIC_BARANGAY_ID);
      if (filtered.length > 0) list = filtered;
    }
    // Resolve relation fields
    const resolved = list.map(c => ({
      ...c,
      inhabitant: c.inhabitant || store.Inhabitant?.find(i => i.id === c.inhabitantId) || { firstName: "Juan", lastName: "Dela Cruz", philsysNo: "1234-5678-9012" },
      type: c.type || store.CertificateType?.find(t => t.id === c.typeId) || { name: "Barangay Clearance", code: "BC-01", fee: c.fee || 50 }
    }));
    return {
      items: resolved,
      total: resolved.length,
      page: 1,
      pageSize: 50
    };
  }

  if (cleanPath === "/certificates/stats" && method === "GET") {
    let list = store.CertificateRequest || [];
    if (!list || list.length === 0) {
      list = [...STATIC_CERTIFICATE_REQUESTS];
    }
    return {
      total: list.length,
      pendingApproval: list.filter(x => x.status === "for_approval" || x.status === "pending" || x.status === "submitted").length,
      released: list.filter(x => x.status === "released" || x.status === "signed" || x.status === "ready" || x.status === "approved").length,
      awaitingPayment: list.filter(x => x.status === "awaiting_payment").length,
      medianProcessingHours: 2.5,
      ra11032Compliant: true
    };
  }

  if (cleanPath === "/certificate-types" && method === "GET") {
    return store.CertificateType || STATIC_CERTIFICATE_TYPES;
  }

  // 6. Katarungang Pambarangay (KP) & Blotter
  if (cleanPath === "/kp/cases" && method === "GET") {
    let list = store.KpCase || [];
    if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
      const filtered = list.filter(x => x.barangayId === currentUser.barangayId || x.barangayId === STATIC_BARANGAY_ID);
      if (filtered.length > 0) list = filtered;
    }
    return {
      items: list,
      total: list.length,
      page: 1,
      pageSize: 50
    };
  }

  if (cleanPath === "/kp/deadlines" && method === "GET") {
    const list = store.KpCase || STATIC_KP_CASES;
    const atRisk = list
      .filter(x => x.stage !== "closed" && x.stage !== "settled")
      .map(c => ({
        caseId: c.id,
        caseNumber: c.caseNo || c.caseNumber || c.id,
        subject: c.subject,
        stage: c.stage,
        daysRemaining: c.deadline?.daysRemaining ?? 5,
        deadline: c.deadline?.target || new Date(Date.now() + 86400000 * 5).toISOString(),
        breached: c.deadline?.isPast ?? false
      }));
    return {
      items: atRisk,
      total: atRisk.length,
      breached: atRisk.filter(x => x.breached).length
    };
  }

  const blotterActionMatch = cleanPath.match(/\/blotter\/([^\/]+)\/actions$/);
  if (blotterActionMatch && method === "POST") {
    const bId = blotterActionMatch[1];
    const list = store.BlotterEntry || [];
    const item = list.find((b: any) => b.id === bId || b.entryNo === bId);
    if (!item) {
      throw new Error("Blotter entry not found.");
    }
    const body = opts.body ? JSON.parse(opts.body as string) : {};
    const newAction = {
      id: `act-${Date.now()}`,
      actionTaken: body?.actionTaken || "Action Recorded",
      officerName: body?.officerName || currentUser.fullName || "Barangay Officer",
      officerRole: body?.officerRole || (currentUser.roles?.[0] ? currentUser.roles[0].replace(/_/g, " ") : "Duty Officer"),
      notes: body?.notes || "",
      statusAfter: body?.statusAfter || item.status || "active",
      timestamp: new Date().toISOString(),
      documentRef: body?.documentRef || null
    };
    item.actionsTaken = [...(item.actionsTaken || []), newAction];
    if (body?.statusAfter) {
      item.status = body.statusAfter;
    }
    saveStore(store);
    return item;
  }

  const blotterDetailMatch = cleanPath.match(/\/blotter\/([^\/]+)$/);
  if (blotterDetailMatch && method === "GET") {
    const bId = blotterDetailMatch[1];
    const list = store.BlotterEntry || [];
    const item = list.find((b: any) => b.id === bId || b.entryNo === bId);
    if (!item) {
      throw new Error("Blotter entry not found.");
    }
    return item;
  }

  const kpDetailMatch = cleanPath.match(/\/kp\/cases\/([^\/]+)$/);
  if (kpDetailMatch && method === "GET") {
    const kId = kpDetailMatch[1];
    const list = store.KpCase || STATIC_KP_CASES;
    const item = list.find((k: any) => k.id === kId || k.caseNo === kId || k.caseNumber === kId);
    if (!item) {
      throw new Error("KP case not found.");
    }
    return item;
  }

  if (cleanPath === "/blotter" && method === "GET") {
    let list = store.BlotterEntry || [];
    if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
      const filtered = list.filter(x => x.barangayId === currentUser.barangayId || x.barangayId === STATIC_BARANGAY_ID);
      if (filtered.length > 0) list = filtered;
    }
    return {
      items: list,
      total: list.length,
      page: 1,
      pageSize: 50
    };
  }

  if (cleanPath === "/sos" && method === "GET") {
    let list = store.SosAlert || [];
    if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
      const filtered = list.filter(x => x.barangayId === currentUser.barangayId || x.barangayId === STATIC_BARANGAY_ID);
      if (filtered.length > 0) list = filtered;
    }
    return {
      items: list,
      total: list.length
    };
  }

  // 7. Properties & Materials & Concerns
  const propSingleMatch = cleanPath.match(/^\/properties\/([^/]+)$/);
  if (propSingleMatch && method === "GET") {
    const id = propSingleMatch[1];
    const list = store.Property || STATIC_PROPERTIES;
    const item = list.find((p: any) => p.id === id);
    if (!item) return null;
    return {
      ...item,
      acquisitionCost: typeof item.acquisitionCost === "object" && item.acquisitionCost !== null
        ? Number(item.acquisitionCost.value)
        : (item.acquisitionCost !== undefined && item.acquisitionCost !== null ? Number(item.acquisitionCost) : null),
      capacity: Number(item.capacity) || 0,
    };
  }

  if (cleanPath === "/properties" && method === "GET") {
    const queryString = path.includes("?") ? path.split("?")[1] : "";
    const queryParams = new URLSearchParams(queryString);
    const q = (queryParams.get("q") || "").toLowerCase().trim();
    const type = queryParams.get("type") || "all";
    const status = queryParams.get("status") || "all";
    const page = parseInt(queryParams.get("page") || "1", 10);
    const pageSize = parseInt(queryParams.get("pageSize") || "25", 10);

    let list = (store.Property || STATIC_PROPERTIES) as any[];
    if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
      const filteredByBrgy = list.filter(x => !x.barangayId || x.barangayId === currentUser.barangayId || x.barangayId === STATIC_BARANGAY_ID);
      if (filteredByBrgy.length > 0) list = filteredByBrgy;
    }

    list = list.map(item => ({
      ...item,
      acquisitionCost: typeof item.acquisitionCost === "object" && item.acquisitionCost !== null
        ? Number(item.acquisitionCost.value)
        : (item.acquisitionCost !== undefined && item.acquisitionCost !== null ? Number(item.acquisitionCost) : null),
      capacity: Number(item.capacity) || 0,
    }));

    if (type !== "all") {
      list = list.filter(x => x.type === type);
    }
    if (status !== "all") {
      list = list.filter(x => x.status === status);
    }
    if (q) {
      list = list.filter(x =>
        (x.name && x.name.toLowerCase().includes(q)) ||
        (x.category && x.category.toLowerCase().includes(q)) ||
        (x.custodian && x.custodian.toLowerCase().includes(q)) ||
        (x.addressLine && x.addressLine.toLowerCase().includes(q)) ||
        (x.description && x.description.toLowerCase().includes(q))
      );
    }

    const total = list.length;
    const startIndex = (page - 1) * pageSize;
    const items = list.slice(startIndex, startIndex + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  const matSingleMatch = cleanPath.match(/^\/materials\/([^/]+)$/);
  if (matSingleMatch && method === "GET") {
    const id = matSingleMatch[1];
    const list = store.Material || STATIC_MATERIALS;
    return list.find((m: any) => m.id === id) || null;
  }

  if (cleanPath === "/materials" && method === "GET") {
    const queryString = path.includes("?") ? path.split("?")[1] : "";
    const queryParams = new URLSearchParams(queryString);
    const q = (queryParams.get("q") || "").toLowerCase().trim();
    const page = parseInt(queryParams.get("page") || "1", 10);
    const pageSize = parseInt(queryParams.get("pageSize") || "100", 10);

    let list = (store.Material || STATIC_MATERIALS) as any[];
    if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
      const filteredByBrgy = list.filter(x => !x.barangayId || x.barangayId === currentUser.barangayId || x.barangayId === STATIC_BARANGAY_ID);
      if (filteredByBrgy.length > 0) list = filteredByBrgy;
    }

    list = list.map(item => ({
      ...item,
      quantity: Number(item.quantity) || 0,
      reorderLevel: Number(item.reorderLevel) || 0,
    }));

    if (q) {
      list = list.filter(x =>
        (x.name && x.name.toLowerCase().includes(q)) ||
        (x.location && x.location.toLowerCase().includes(q)) ||
        (x.unit && x.unit.toLowerCase().includes(q))
      );
    }

    const total = list.length;
    const startIndex = (page - 1) * pageSize;
    const items = list.slice(startIndex, startIndex + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  // 7.5 Resident Concerns (311 Citizen Reports)
  const concernSingleMatch = cleanPath.match(/^\/concerns\/([^/]+)$/);
  if (concernSingleMatch && method === "GET") {
    const id = concernSingleMatch[1];
    const list = store.Concern || STATIC_CONCERNS;
    const c = list.find((x: any) => x.id === id || x.referenceNo === id);
    if (!c) return null;
    const now = Date.now();
    const isOverdue = c.slaDueAt && new Date(c.slaDueAt).getTime() < now && c.status !== "resolved" && c.status !== "rejected";
    let inh = c.inhabitant;
    if (!inh && c.inhabitantId && store.Inhabitant) {
      const foundInh = store.Inhabitant.find((i: any) => i.id === c.inhabitantId);
      if (foundInh) inh = { firstName: foundInh.firstName, lastName: foundInh.lastName, contactNo: foundInh.contactNumber || foundInh.contactNo };
    }
    return {
      ...c,
      slaBreached: Boolean(c.slaBreached || isOverdue),
      inhabitant: inh || null,
    };
  }

  if (cleanPath === "/concerns" && method === "GET") {
    const queryString = path.includes("?") ? path.split("?")[1] : "";
    const queryParams = new URLSearchParams(queryString);
    const q = (queryParams.get("q") || "").toLowerCase().trim();
    const status = queryParams.get("status") || "all";
    const category = queryParams.get("category") || "all";
    const page = parseInt(queryParams.get("page") || "1", 10);
    const pageSize = parseInt(queryParams.get("pageSize") || "25", 10);

    let list = (store.Concern || STATIC_CONCERNS) as any[];
    if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
      const filteredByBrgy = list.filter(x => !x.barangayId || x.barangayId === currentUser.barangayId || x.barangayId === STATIC_BARANGAY_ID);
      if (filteredByBrgy.length > 0) list = filteredByBrgy;
    }

    const now = Date.now();
    list = list.map(c => {
      const isOverdue = c.slaDueAt && new Date(c.slaDueAt).getTime() < now && c.status !== "resolved" && c.status !== "rejected";
      let inh = c.inhabitant;
      if (!inh && c.inhabitantId && store.Inhabitant) {
        const foundInh = store.Inhabitant.find((i: any) => i.id === c.inhabitantId);
        if (foundInh) inh = { firstName: foundInh.firstName, lastName: foundInh.lastName, contactNo: foundInh.contactNumber || foundInh.contactNo };
      }
      return {
        ...c,
        slaBreached: Boolean(c.slaBreached || isOverdue),
        inhabitant: inh || null,
      };
    });

    if (status !== "all") {
      list = list.filter(x => x.status === status);
    }
    if (category !== "all") {
      list = list.filter(x => x.category === category);
    }
    if (q) {
      list = list.filter(x =>
        (x.referenceNo && x.referenceNo.toLowerCase().includes(q)) ||
        (x.description && x.description.toLowerCase().includes(q)) ||
        (x.purok && x.purok.toLowerCase().includes(q)) ||
        (x.inhabitant && `${x.inhabitant.firstName} ${x.inhabitant.lastName}`.toLowerCase().includes(q))
      );
    }

    const total = list.length;
    const startIndex = (page - 1) * pageSize;
    const items = list.slice(startIndex, startIndex + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
    };
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
    const registered = (store.Wallet || []).length || 854;
    const adults = (store.Inhabitant || []).filter(x => (x.age ?? 25) >= 18).length || 1020;
    const regRate = Math.min(100, Math.round((registered / adults) * 100)) || 84;
    const active = Math.round(registered * 0.62) || 530;
    const activeRate = Math.min(100, Math.round((active / registered) * 100)) || 62;

    return {
      registeredWallets: registered,
      adultPopulation: adults,
      registrationRate: regRate,
      active30d: active,
      activeRate: activeRate,
      merchantsAccepting: (store.Merchant || []).length || 12,
      cashInOutPoints: (store.Agent || []).length || 4,
      cashOutOnlyRatio: 42,
      balanceCentavos: "50000000",
      totalTransactions: list.length,
      totalDisbursements: list.filter(x => x.type === "disbursement").length,
      targets: {
        registrationRate: "80–90%",
        activeRate: "50–65%",
        merchantsAccepting: "8–15",
        note: "Targeting 80%+ digital disbursement adoption across active households."
      }
    };
  }

  if (cleanPath === "/wallet/batches" && method === "GET") {
    let list = (store.DisbursementBatch || STATIC_DISBURSEMENT_BATCHES) as any[];
    if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
      const filtered = list.filter(x => !x.barangayId || x.barangayId === currentUser.barangayId || x.barangayId === STATIC_BARANGAY_ID);
      if (filtered.length > 0) list = filtered;
    }
    const allItems = store.DisbursementBatchItem || STATIC_DISBURSEMENT_ITEMS;
    list = list.map(b => {
      const rawItems = b.items || allItems.filter((i: any) => i.batchId === b.id);
      const items = rawItems.map((it: any) => ({
        ...it,
        amountCentavos: String(it.amountCentavos || "0").replace(/n$/, "")
      }));
      return {
        ...b,
        totalCentavos: String(b.totalCentavos || "0").replace(/n$/, ""),
        itemCount: items.length || b.itemCount || 0,
        items,
        _count: { items: items.length || b.itemCount || 0 }
      };
    });
    return { items: list };
  }

  const batchDetailMatch = cleanPath.match(/^\/wallet\/batches\/([^/]+)$/);
  if (batchDetailMatch && method === "GET") {
    const id = batchDetailMatch[1];
    const list = (store.DisbursementBatch || STATIC_DISBURSEMENT_BATCHES) as any[];
    const batch = list.find((b: any) => b.id === id || b.batchNo === id);
    if (!batch) return null;
    const allItems = store.DisbursementBatchItem || STATIC_DISBURSEMENT_ITEMS;
    const items = (batch.items || allItems.filter((i: any) => i.batchId === batch.id)).map((it: any) => ({
      ...it,
      amountCentavos: String(it.amountCentavos || "0").replace(/n$/, "")
    }));
    return {
      ...batch,
      totalCentavos: String(batch.totalCentavos || "0").replace(/n$/, ""),
      items,
      itemCount: items.length || batch.itemCount || 0,
      _count: { items: items.length || batch.itemCount || 0 }
    };
  }

  if (cleanPath === "/wallet/batches" && method === "POST") {
    const body = opts.body ? JSON.parse(opts.body as string) : {};
    const existing = store.DisbursementBatch || STATIC_DISBURSEMENT_BATCHES;
    const nextNum = 100 + existing.length + 1;
    const batchNo = `DB-2026-00${nextNum}`;
    const batchId = "db-" + Math.random().toString(36).substring(2, 9);

    const items = (body.items || []).map((it: any, idx: number) => {
      const amountCentavos = String(Math.round((Number(it.amountPeso) || 0) * 100));
      return {
        id: `item-${batchId}-${idx + 1}`,
        batchId,
        payeeName: it.payeeName,
        amountCentavos,
        status: "pending",
        walletId: "wal-" + Math.random().toString(36).substring(2, 7),
        inhabitantId: it.inhabitantId || null,
        remarks: null,
        createdAt: new Date().toISOString()
      };
    });

    const totalCentavos = items.reduce((acc: bigint, curr: any) => acc + BigInt(curr.amountCentavos || 0), 0n).toString();

    const newBatch = {
      id: batchId,
      barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
      batchNo,
      kind: body.kind || "payroll_honoraria",
      title: body.title || "Disbursement Batch",
      fund: body.fund || "general",
      status: "for_approval",
      preparedById: currentUser.id || "usr-treasurer",
      sourceNote: body.sourceNote || null,
      totalCentavos,
      itemCount: items.length,
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!store.DisbursementBatch) store.DisbursementBatch = [...STATIC_DISBURSEMENT_BATCHES];
    store.DisbursementBatch = [newBatch, ...store.DisbursementBatch];

    if (!store.DisbursementBatchItem) store.DisbursementBatchItem = [...STATIC_DISBURSEMENT_ITEMS];
    store.DisbursementBatchItem = [...items, ...store.DisbursementBatchItem];

    saveStore(store);
    return newBatch;
  }

  const batchApproveMatch = cleanPath.match(/^\/wallet\/batches\/([^/]+)\/approve$/);
  if (batchApproveMatch && method === "POST") {
    const id = batchApproveMatch[1];
    const list = (store.DisbursementBatch || STATIC_DISBURSEMENT_BATCHES) as any[];
    const batch = list.find((b: any) => b.id === id || b.batchNo === id);
    if (!batch) return { error: "Batch not found" };

    if (batch.preparedById && currentUser.id && batch.preparedById === currentUser.id) {
      const err: any = new Error("Maker–checker violation: you prepared this batch and cannot approve it (LGC §375).");
      err.status = 403;
      throw err;
    }

    const allItems = store.DisbursementBatchItem || STATIC_DISBURSEMENT_ITEMS;
    const items = batch.items || allItems.filter((i: any) => i.batchId === batch.id);

    let paid = 0;
    let otcFallback = 0;
    let failed = 0;
    let totalPaidCentavos = 0n;

    items.forEach((item: any) => {
      if (item.walletId) {
        item.status = "paid";
        item.paidAt = new Date().toISOString();
        paid++;
        totalPaidCentavos += BigInt(String(item.amountCentavos).replace(/n$/, "") || 0);
      } else {
        item.status = "otc_fallback";
        item.remarks = "No registered e-wallet. Queued for over-the-counter treasurer payout.";
        otcFallback++;
      }
    });

    const dvNo = "DV-2026-" + Math.floor(1000 + Math.random() * 9000);
    batch.status = "completed";
    batch.approvedById = currentUser.id || "usr-pb";
    batch.approvedAt = new Date().toISOString();
    batch.executedAt = new Date().toISOString();
    batch.dvNumber = dvNo;
    batch.items = items;

    // Post corresponding Disbursement Voucher in General Ledger!
    const amountPesos = Number(totalPaidCentavos) / 100;
    const ledgerEntry = {
      id: "led-" + Math.random().toString(36).substring(2, 9),
      barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
      postedAt: batch.executedAt,
      fund: batch.fund,
      accountCode: batch.fund === "sk" ? "5-02-99-010" : batch.fund === "disaster" ? "5-02-12-030" : "5-01-01-010",
      description: `Disbursement: ${batch.title} (${batch.batchNo}) via E-Money Rail`,
      direction: "debit",
      amount: amountPesos,
      dvNumber: dvNo,
      refType: "disbursement_voucher"
    };
    store.LedgerEntry = [ledgerEntry, ...(store.LedgerEntry || STATIC_LEDGER_ENTRIES)];

    saveStore(store);
    return {
      paid,
      failed,
      otcFallback,
      totalPaidCentavos: totalPaidCentavos.toString(),
      dvNumber: dvNo,
    };
  }

  // 8.5 Treasury & Finance (Ledger, Official Receipts, Budgets)
  if (cleanPath === "/finance/ledger" && method === "GET") {
    const queryString = path.includes("?") ? path.split("?")[1] : "";
    const queryParams = new URLSearchParams(queryString);
    const fund = queryParams.get("fund") || "all";
    const direction = queryParams.get("direction") || "all";
    const q = (queryParams.get("q") || "").toLowerCase().trim();
    const page = parseInt(queryParams.get("page") || "1", 10);
    const pageSize = parseInt(queryParams.get("pageSize") || "25", 10);

    let list = (store.LedgerEntry || STATIC_LEDGER_ENTRIES) as any[];
    if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
      const filteredByBrgy = list.filter(x => !x.barangayId || x.barangayId === currentUser.barangayId || x.barangayId === STATIC_BARANGAY_ID);
      if (filteredByBrgy.length > 0) list = filteredByBrgy;
    }

    list = list.map(item => ({
      ...item,
      amount: typeof item.amount === "object" && item.amount !== null ? item.amount.value : Number(item.amount)
    }));

    if (fund !== "all") {
      list = list.filter(x => x.fund && x.fund.toLowerCase() === fund.toLowerCase());
    }
    if (direction !== "all") {
      list = list.filter(x => x.direction && x.direction.toLowerCase() === direction.toLowerCase());
    }
    if (q) {
      list = list.filter(x =>
        (x.description && x.description.toLowerCase().includes(q)) ||
        (x.accountCode && x.accountCode.toLowerCase().includes(q)) ||
        (x.orNumber && x.orNumber.toLowerCase().includes(q)) ||
        (x.dvNumber && x.dvNumber.toLowerCase().includes(q))
      );
    }

    list = [...list].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

    const total = list.length;
    const startIndex = (page - 1) * pageSize;
    const items = list.slice(startIndex, startIndex + pageSize);

    return {
      items,
      total,
      page,
      pageSize
    };
  }

  const ledgerDetailMatch = cleanPath.match(/^\/finance\/ledger\/([^/]+)$/);
  if (ledgerDetailMatch && method === "GET") {
    const id = ledgerDetailMatch[1];
    const list = (store.LedgerEntry || STATIC_LEDGER_ENTRIES) as any[];
    const item = list.find((x: any) => x.id === id || x.orNumber === id || x.dvNumber === id);
    if (!item) return null;
    return {
      ...item,
      amount: typeof item.amount === "object" && item.amount !== null ? item.amount.value : Number(item.amount)
    };
  }

  if (cleanPath === "/finance/ledger" && method === "POST") {
    const body = opts.body ? JSON.parse(opts.body as string) : {};
    const newEntry = {
      id: "led-" + Math.random().toString(36).substring(2, 9),
      barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
      postedAt: body.postedAt || new Date().toISOString(),
      fund: body.fund || "general",
      accountCode: body.accountCode || "4-02-01-040",
      description: body.description || "General Ledger entry",
      direction: body.direction || "credit",
      amount: Number(body.amount) || 0,
      orNumber: body.orNumber || null,
      dvNumber: body.dvNumber || null,
      refType: body.refType || (body.orNumber ? "official_receipt" : body.dvNumber ? "disbursement_voucher" : "manual")
    };
    store.LedgerEntry = [newEntry, ...(store.LedgerEntry || STATIC_LEDGER_ENTRIES)];
    saveStore(store);
    return newEntry;
  }

  if (cleanPath === "/finance/receipts" && method === "GET") {
    const queryString = path.includes("?") ? path.split("?")[1] : "";
    const queryParams = new URLSearchParams(queryString);
    const page = parseInt(queryParams.get("page") || "1", 10);
    const pageSize = parseInt(queryParams.get("pageSize") || "50", 10);

    let list = (store.OfficialReceipt || STATIC_OFFICIAL_RECEIPTS) as any[];
    if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
      const filteredByBrgy = list.filter(x => !x.barangayId || x.barangayId === currentUser.barangayId || x.barangayId === STATIC_BARANGAY_ID);
      if (filteredByBrgy.length > 0) list = filteredByBrgy;
    }

    list = list.map(item => ({
      ...item,
      amount: typeof item.amount === "object" && item.amount !== null ? item.amount.value : Number(item.amount)
    }));

    list = [...list].sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());

    const total = list.length;
    const startIndex = (page - 1) * pageSize;
    const items = list.slice(startIndex, startIndex + pageSize);

    return {
      items,
      total,
      page,
      pageSize
    };
  }

  const receiptDetailMatch = cleanPath.match(/^\/finance\/receipts\/([^/]+)$/);
  if (receiptDetailMatch && method === "GET") {
    const id = receiptDetailMatch[1];
    const list = (store.OfficialReceipt || STATIC_OFFICIAL_RECEIPTS) as any[];
    const item = list.find((x: any) => x.id === id || x.orNumber === id);
    if (!item) return null;
    return {
      ...item,
      amount: typeof item.amount === "object" && item.amount !== null ? item.amount.value : Number(item.amount)
    };
  }

  if (cleanPath === "/finance/receipts" && method === "POST") {
    const body = opts.body ? JSON.parse(opts.body as string) : {};
    const list = (store.OfficialReceipt || STATIC_OFFICIAL_RECEIPTS) as any[];
    const nextNum = 100 + list.length + 1;
    const orNumber = body.orNumber || `OR-2026-00${nextNum}`;
    const amount = Number(body.amount) || 0;
    const newReceipt = {
      id: "or-" + Math.random().toString(36).substring(2, 9),
      barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
      orNumber,
      payorName: body.payorName || "Resident",
      amount,
      particulars: body.particulars || "Barangay Clearance / Certification Fee",
      issuedAt: new Date().toISOString(),
      status: "issued"
    };
    store.OfficialReceipt = [newReceipt, ...list];

    // Automatically generate corresponding credit entry in general ledger
    const newLedgerEntry = {
      id: "led-" + Math.random().toString(36).substring(2, 9),
      barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
      postedAt: newReceipt.issuedAt,
      fund: body.fund || "general",
      accountCode: body.accountCode || "4-02-01-040",
      description: `Official Receipt collection (${orNumber}) — ${newReceipt.particulars} (${newReceipt.payorName})`,
      direction: "credit",
      amount,
      orNumber,
      refType: "official_receipt"
    };
    store.LedgerEntry = [newLedgerEntry, ...(store.LedgerEntry || STATIC_LEDGER_ENTRIES)];

    saveStore(store);
    return newReceipt;
  }

  const cancelReceiptMatch = cleanPath.match(/^\/finance\/receipts\/([^/]+)\/cancel$/);
  if (cancelReceiptMatch && method === "POST") {
    const id = cancelReceiptMatch[1];
    const body = opts.body ? JSON.parse(opts.body as string) : {};
    const list = (store.OfficialReceipt || STATIC_OFFICIAL_RECEIPTS) as any[];
    const item = list.find((x: any) => x.id === id || x.orNumber === id);
    if (item) {
      item.status = "cancelled";
      item.cancellationReason = body.reason || "Cancelled by Treasurer";
      item.cancelledAt = new Date().toISOString();
      saveStore(store);
    }
    return item || {};
  }

  if (cleanPath === "/finance/budgets" && method === "GET") {
    const queryString = path.includes("?") ? path.split("?")[1] : "";
    const queryParams = new URLSearchParams(queryString);
    const pageSize = parseInt(queryParams.get("pageSize") || "20", 10);

    let list = (store.Budget || STATIC_BUDGETS) as any[];
    if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
      const filteredByBrgy = list.filter(x => !x.barangayId || x.barangayId === currentUser.barangayId || x.barangayId === STATIC_BARANGAY_ID);
      if (filteredByBrgy.length > 0) list = filteredByBrgy;
    }

    list = list.map(b => {
      let rawLines = b.lines;
      if (rawLines && typeof rawLines === "object" && !Array.isArray(rawLines) && Array.isArray(rawLines.create)) {
        rawLines = rawLines.create;
      }
      const lines = Array.isArray(rawLines)
        ? rawLines.map((l: any, idx: number) => ({
            id: l.id || `bl-${idx + 1}`,
            expenseClass: l.expenseClass || "MOOE",
            accountCode: l.accountCode || "",
            description: l.description || "",
            amount: typeof l.amount === "object" && l.amount !== null ? l.amount.value : Number(l.amount || 0),
            obligated: typeof l.obligated === "object" && l.obligated !== null ? l.obligated.value : Number(l.obligated || 0),
            disbursed: typeof l.disbursed === "object" && l.disbursed !== null ? l.disbursed.value : Number(l.disbursed || 0)
          }))
        : [];
      return {
        ...b,
        totalAmount: typeof b.totalAmount === "object" && b.totalAmount !== null ? b.totalAmount.value : Number(b.totalAmount || 0),
        skFundAmount: typeof b.skFundAmount === "object" && b.skFundAmount !== null ? b.skFundAmount.value : Number(b.skFundAmount || 0),
        lines
      };
    });

    return {
      items: list,
      total: list.length,
      page: 1,
      pageSize
    };
  }

  const budgetDetailMatch = cleanPath.match(/^\/finance\/budgets\/([^/]+)$/);
  if (budgetDetailMatch && method === "GET") {
    const id = budgetDetailMatch[1];
    const list = (store.Budget || STATIC_BUDGETS) as any[];
    const found = list.find(b => b.id === id) || list[0];
    if (found) {
      let rawLines = found.lines;
      if (rawLines && typeof rawLines === "object" && !Array.isArray(rawLines) && Array.isArray(rawLines.create)) {
        rawLines = rawLines.create;
      }
      const lines = Array.isArray(rawLines)
        ? rawLines.map((l: any, idx: number) => ({
            id: l.id || `bl-${idx + 1}`,
            expenseClass: l.expenseClass || "MOOE",
            accountCode: l.accountCode || "",
            description: l.description || "",
            amount: typeof l.amount === "object" && l.amount !== null ? l.amount.value : Number(l.amount || 0),
            obligated: typeof l.obligated === "object" && l.obligated !== null ? l.obligated.value : Number(l.obligated || 0),
            disbursed: typeof l.disbursed === "object" && l.disbursed !== null ? l.disbursed.value : Number(l.disbursed || 0)
          }))
        : [];
      return {
        ...found,
        totalAmount: typeof found.totalAmount === "object" && found.totalAmount !== null ? found.totalAmount.value : Number(found.totalAmount || 0),
        skFundAmount: typeof found.skFundAmount === "object" && found.skFundAmount !== null ? found.skFundAmount.value : Number(found.skFundAmount || 0),
        lines
      };
    }
    return null;
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
      disbursementBatchesForApproval: batches.filter(x => x.status === "pending" || x.status === "prepared" || x.status === "for_approval").length
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
    const rawBarangays = store.Barangay && store.Barangay.length > 0 ? store.Barangay : [
      { id: "barangka", name: "Barangka", psgcCode: "137404001", mode: "companion" },
      { id: "calumpang", name: "Calumpang", psgcCode: "137404002", mode: "companion" },
      { id: "concepcion_uno", name: "Concepcion Uno", psgcCode: "137404003", mode: "companion" },
      { id: "concepcion_dos", name: "Concepcion Dos", psgcCode: "137404004", mode: "standalone" },
      { id: "fortune", name: "Fortune", psgcCode: "137404005", mode: "companion" },
      { id: "industrial_valley", name: "Industrial Valley", psgcCode: "137404006", mode: "companion" },
      { id: "jesus_dela_pena", name: "Jesus Dela Peña", psgcCode: "137404007", mode: "companion" },
      { id: "malanday", name: "Malanday", psgcCode: "137404008", mode: "standalone" },
      { id: "marikina_heights", name: "Marikina Heights", psgcCode: "137404009", mode: "companion" },
      { id: "nangka", name: "Nangka", psgcCode: "137404010", mode: "companion" },
      { id: "parang", name: "Parang", psgcCode: "137404011", mode: "companion" },
      { id: "san_roque", name: "San Roque", psgcCode: "137404012", mode: "companion" },
      { id: "santa_elena", name: "Santa Elena", psgcCode: "137404013", mode: "companion" },
      { id: "santo_nino", name: "Santo Niño", psgcCode: "137404014", mode: "companion" },
      { id: "tañong", name: "Tañong", psgcCode: "137404015", mode: "companion" },
      { id: "tumana", name: "Tumana", psgcCode: "137404016", mode: "companion" }
    ];

    const rows = rawBarangays.map((b: any, index: number) => {
      const pop = store.Inhabitant?.filter(x => x.barangayId === b.id).length || (2400 + (index * 175));
      const wallets = Math.round(pop * (0.62 + (index % 5) * 0.06));
      const rate = Math.min(98.5, Math.round((wallets / (pop * 0.65 || 1)) * 1000) / 10);
      return {
        barangayId: b.id,
        name: b.name,
        psgcCode: b.psgcCode || `1374040${(index + 1).toString().padStart(2, "0")}`,
        status: b.status || "active",
        mode: b.mode || "companion",
        population: pop,
        registeredWallets: wallets,
        registrationRate: rate,
        merchants: 16 + (index * 3),
        cashPoints: 4 + (index % 3),
        transactions30d: 380 + (index * 45),
        volume30dCentavos: (BigInt(52000000) + BigInt(index * 4200000)).toString(),
        certificates: store.CertificateRequest?.filter(x => x.barangayId === b.id && x.status === "signed").length || (35 + index * 6),
        satisfaction: Number((4.85 - (index * 0.04)).toFixed(2))
      };
    });

    const totals = {
      population: rows.reduce((s: number, r: any) => s + r.population, 0),
      registeredWallets: rows.reduce((s: number, r: any) => s + r.registeredWallets, 0),
      merchants: rows.reduce((s: number, r: any) => s + r.merchants, 0),
      transactions30d: rows.reduce((s: number, r: any) => s + r.transactions30d, 0),
      certificates: rows.reduce((s: number, r: any) => s + r.certificates, 0)
    };

    return {
      scope: "City of Marikina",
      barangayCount: rows.length,
      totals,
      targets: {
        registrationRate: "≥ 80%",
        activeRate: "≥ 50%",
        merchants: "25 per barangay",
        cashPointCoverage: "100%"
      },
      rows
    };
  }

  if (cleanPath === "/reports/quarterly" && method === "GET") {
    const brgyId = currentUser.barangayId || "barangka";
    const totalInhabitants = store.Inhabitant?.filter(x => x.barangayId === brgyId).length || 2225;
    const certsIssued = store.CertificateRequest?.filter(x => x.barangayId === brgyId && x.status === "signed").length || 150;
    const kpCases = store.KpCase?.filter(x => x.barangayId === brgyId).length || 12;
    const concerns = store.Concern?.filter(x => x.barangayId === brgyId).length || 18;
    const disbursements = store.WalletTransaction?.filter(x => x.type === "disbursement").length || 45;

    return {
      period: "Q3 2026",
      barangaysCovered: 1,
      registeredInhabitants: totalInhabitants,
      certificatesIssued: certsIssued,
      kpCasesFiled: kpCases,
      concernsReceived: concerns,
      disbursementCount: disbursements,
      disbursementTotalCentavos: "125000000",
      csmResponses: store.Feedback?.length || 8,
      csmAverage: 4.5,
      note: "Figures represent consolidated barangay operations."
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

  // New Mock GET Endpoints
  if (cleanPath === "/civil-registry" && method === "GET") {
    let list = store.CivilRegistryRecord || [];
    if (currentUser.barangayId) {
      list = list.filter(x => x.barangayId === currentUser.barangayId);
    }
    return list;
  }

  if (cleanPath === "/lgu-requests" && method === "GET") {
    let list = store.LguDocRequest || [];
    if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
      const filtered = list.filter(x => x.barangayId === currentUser.barangayId);
      if (filtered.length > 0) list = filtered;
    }
    return list.map(req => {
      const inh = store.Inhabitant?.find(i => i.id === req.inhabitantId);
      return {
        ...req,
        inhabitant: inh || null
      };
    });
  }

  // LGU Request Detail GET
  const lguDetailMatch = cleanPath.match(/\/lgu-requests\/([^\/]+)$/);
  if (lguDetailMatch && method === "GET") {
    const id = lguDetailMatch[1];
    const r = store.LguDocRequest?.find(x => x.id === id);
    if (!r) return null;
    const inh = store.Inhabitant?.find(i => i.id === r.inhabitantId);
    return {
      ...r,
      inhabitant: inh || null
    };
  }

  // LGU Request Timeline GET
  const lguTimelineMatch = cleanPath.match(/\/lgu-requests\/([^\/]+)\/timeline$/);
  if (lguTimelineMatch && method === "GET") {
    const id = lguTimelineMatch[1];
    const r = store.LguDocRequest?.find(x => x.id === id);
    if (!r) return [];
    const events: any[] = [
      {
        id: "evt-1",
        action: "Endorsement Application Filed",
        description: `Initial application for ${r.docType?.replace(/_/g, " ") || "permit"} recorded.`,
        status: "pending",
        date: r.createdAt || new Date().toISOString(),
        actor: "Desk Officer / Citizen Portal"
      }
    ];
    if (r.orNumber || r.paidAt) {
      events.push({
        id: "evt-2",
        action: "Assessed Endorsement Fee Collected",
        description: `Official Receipt ${r.orNumber || "OR-VERIFIED"} issued for ₱${r.fee || 0}.`,
        status: "paid",
        date: r.paidAt || r.createdAt || new Date().toISOString(),
        actor: "Barangay Treasurer"
      });
    }
    if (r.status === "approved" || r.status === "released") {
      events.push({
        id: "evt-3",
        action: "Endorsement Clearance Approved",
        description: "Documentary verification complete. Endorsed by Punong Barangay to City LGU.",
        status: "approved",
        date: r.approvedAt || r.updatedAt || new Date().toISOString(),
        actor: "Punong Barangay"
      });
    }
    if (r.status === "released") {
      events.push({
        id: "evt-4",
        action: "Clearance Transmitted & Released",
        description: "Official signed clearance and QR verification released to citizen.",
        status: "released",
        date: r.releasedAt || r.updatedAt || new Date().toISOString(),
        actor: "Issuance & Records Officer"
      });
    }
    if (r.status === "rejected") {
      events.push({
        id: "evt-5",
        action: "Application Rejected / Returned",
        description: r.remarks || "Lacking statutory documents or inspection non-compliance.",
        status: "rejected",
        date: r.updatedAt || new Date().toISOString(),
        actor: "Barangay Secretary"
      });
    }
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return events;
  }

  if (cleanPath === "/rpt" && method === "GET") {
    let list = (store.RptProperty || STATIC_RPT_PROPERTIES) as any[];
    if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
      const filteredByBrgy = list.filter(x => !x.barangayId || x.barangayId === currentUser.barangayId || x.barangayId === STATIC_BARANGAY_ID);
      if (filteredByBrgy.length > 0) list = filteredByBrgy;
    }
    return list.filter(p => p.isActive !== false);
  }

  if (cleanPath === "/rpt/dues" && method === "GET") {
    return store.RptTaxDue || STATIC_RPT_TAX_DUES;
  }

  const rptDetailMatch = cleanPath.match(/^\/rpt\/([^/]+)$/);
  if (rptDetailMatch && method === "GET") {
    const id = rptDetailMatch[1];
    const list = (store.RptProperty || STATIC_RPT_PROPERTIES) as any[];
    const prop = list.find((p: any) => p.id === id || p.taxDeclarationNo === id);
    if (!prop) return null;
    const dues = (store.RptTaxDue || STATIC_RPT_TAX_DUES).filter((d: any) => d.rptPropertyId === prop.id);
    return { ...prop, dues };
  }

  const rptPayMatch = cleanPath.match(/^\/rpt\/([^/]+)\/pay$/);
  if (rptPayMatch && method === "POST") {
    const id = rptPayMatch[1];
    const dues = store.RptTaxDue || STATIC_RPT_TAX_DUES;
    const due = dues.find((d: any) => d.id === id || d.rptPropertyId === id);
    const properties = store.RptProperty || STATIC_RPT_PROPERTIES;
    const prop = properties.find((p: any) => p.id === (due ? due.rptPropertyId : id));

    if (due) {
      const receipts = store.OfficialReceipt || [];
      const nextNum = 100 + receipts.length + 1;
      const orNo = `OR-2026-00${nextNum}`;
      due.paymentStatus = "fully_paid";
      due.paidAt = new Date().toISOString();
      due.orNumber = orNo;

      const newReceipt = {
        id: "or-" + Math.random().toString(36).substring(2, 9),
        barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
        orNumber: orNo,
        payorName: prop?.ownerName || "Property Owner",
        amount: Number(due.totalAmount) || 0,
        particulars: `Real Property Tax Payment (TDN #${prop?.taxDeclarationNo || ""}) — Tax Year ${due.taxYear}`,
        issuedAt: due.paidAt,
        status: "issued"
      };
      store.OfficialReceipt = [newReceipt, ...(store.OfficialReceipt || [])];

      const newLedger = {
        id: "led-" + Math.random().toString(36).substring(2, 9),
        barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
        postedAt: due.paidAt,
        fund: "general",
        accountCode: "4-01-02-040",
        description: `Real Property Tax (RPT) Collection (${orNo}) — ${prop?.ownerName || "Owner"} (TDN #${prop?.taxDeclarationNo || ""})`,
        direction: "credit",
        amount: Number(due.totalAmount) || 0,
        orNumber: orNo,
        refType: "official_receipt"
      };
      store.LedgerEntry = [newLedger, ...(store.LedgerEntry || [])];

      saveStore(store);
      return { success: true, orNumber: orNo, due, receipt: newReceipt };
    }
  }

  if (cleanPath === "/drrm-resources" && method === "GET") {
    let list = store.DrrmResource || [];
    if (currentUser.barangayId) {
      list = list.filter(x => x.barangayId === currentUser.barangayId);
    }
    return list;
  }

  // Consolidated Inhabitant transactions timeline GET endpoint
  const timelineMatch = cleanPath.match(/\/inhabitants\/([^\/]+)\/transactions/);
  if (timelineMatch && method === "GET") {
    const inhId = timelineMatch[1];
    
    // 1. Get wallet transactions
    const wallet = store.Wallet?.find(w => w.inhabitantId === inhId);
    const wTxs = wallet 
      ? (store.WalletTransaction || []).filter(tx => tx.walletId === wallet.id)
      : [];
    
    // 2. Get certificate requests
    const certs = (store.CertificateRequest || []).filter(c => c.inhabitantId === inhId);

    // 3. Get LGU doc requests
    const lgus = (store.LguDocRequest || []).filter(l => l.inhabitantId === inhId);

    // Consolidate into a single timeline with fallback dummy transactions
    const timeline = [
      ...wTxs.map(t => ({
        id: t.id,
        type: "wallet",
        description: t.type === "cash_out" ? "E-Wallet Cash Out" : "E-Wallet Disbursement",
        amount: Number(t.amountCentavos) || 0,
        status: t.status,
        date: t.createdAt
      })),
      ...certs.map(c => ({
        id: c.id,
        type: "document",
        description: `Barangay Clearance Request: ${c.purpose || "General Purpose"}`,
        amount: (Number(c.fee) || 0) * 100, // to centavos
        status: c.status,
        date: c.createdAt
      })),
      ...lgus.map(l => ({
        id: l.id,
        type: "lgu_permit",
        description: `LGU Endorsement: ${l.docType ? l.docType.replace(/_/g, " ") : "Endorsement"}`,
        amount: (Number(l.fee) || 0) * 100, // to centavos
        status: l.status,
        date: l.createdAt
      })),
      // Dummy resident transactions in the barangay
      {
        id: `m-bid-${inhId}`,
        type: "document",
        description: "Application for Barangay ID Card",
        amount: 5000,
        status: "released",
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `m-ced-${inhId}`,
        type: "document",
        description: "Community Tax Certificate (Cedula) Issuance",
        amount: 8550,
        status: "signed",
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `m-reg-${inhId}`,
        type: "document",
        description: "Census Registry Intake / Resident Profiling",
        amount: 0,
        status: "completed",
        date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Sort by date descending
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return timeline;
  }

  // Mutations / PATCH requests
  if (method === "DELETE") {
    const inhMatch = cleanPath.match(/\/inhabitants\/([^\/]+)/);
    if (inhMatch) {
      const id = inhMatch[1];
      if (store.Inhabitant) {
        store.Inhabitant = store.Inhabitant.filter(x => x.id !== id);
        saveStore(store);
      }
      return { success: true };
    }

    const hhMatch = cleanPath.match(/\/households\/([^\/]+)/);
    if (hhMatch) {
      const id = hhMatch[1];
      if (store.Household) {
        store.Household = store.Household.filter(x => x.id !== id);
      }
      if (store.Inhabitant) {
        store.Inhabitant.forEach(i => {
          if (i.householdId === id) i.householdId = null;
        });
      }
      saveStore(store);
      return { success: true };
    }

    const lguMatch = cleanPath.match(/\/lgu-requests\/([^\/]+)/);
    if (lguMatch) {
      const id = lguMatch[1];
      if (store.LguDocRequest) {
        store.LguDocRequest = store.LguDocRequest.filter(x => x.id !== id);
        saveStore(store);
      }
      return { success: true };
    }

    const rptDelMatch = cleanPath.match(/\/rpt\/([^\/]+)/);
    if (rptDelMatch) {
      const id = rptDelMatch[1];
      if (store.RptProperty) {
        store.RptProperty = store.RptProperty.filter(x => x.id !== id);
      }
      if (store.RptTaxDue) {
        store.RptTaxDue = store.RptTaxDue.filter(x => x.rptPropertyId !== id);
      }
      saveStore(store);
      return { success: true };
    }

    const propDelMatch = cleanPath.match(/\/properties\/([^\/]+)/);
    if (propDelMatch) {
      const id = propDelMatch[1];
      if (store.Property) {
        store.Property = store.Property.filter(x => x.id !== id);
        saveStore(store);
      }
      return { success: true };
    }

    const matDelMatch = cleanPath.match(/\/materials\/([^\/]+)/);
    if (matDelMatch) {
      const id = matDelMatch[1];
      if (store.Material) {
        store.Material = store.Material.filter(x => x.id !== id);
        saveStore(store);
      }
      return { success: true };
    }

    const batchDelMatch = cleanPath.match(/\/wallet\/batches\/([^\/]+)/);
    if (batchDelMatch) {
      const id = batchDelMatch[1];
      if (store.DisbursementBatch) {
        store.DisbursementBatch = store.DisbursementBatch.filter(x => x.id !== id && x.batchNo !== id);
      }
      if (store.DisbursementBatchItem) {
        store.DisbursementBatchItem = store.DisbursementBatchItem.filter(x => x.batchId !== id);
      }
      saveStore(store);
      return { success: true };
    }

    const concernDelMatch = cleanPath.match(/\/concerns\/([^\/]+)/);
    if (concernDelMatch) {
      const id = concernDelMatch[1];
      if (store.Concern) {
        store.Concern = store.Concern.filter(x => x.id !== id && x.referenceNo !== id);
        saveStore(store);
      }
      return { success: true };
    }
  }

  // Mutations / PATCH requests
  if (method === "PATCH") {
    const body = opts.body ? JSON.parse(opts.body as string) : {};
    
    // Inhabitants PATCH
    const inhMatch = cleanPath.match(/\/inhabitants\/([^\/]+)/);
    if (inhMatch) {
      const id = inhMatch[1];
      const inh = store.Inhabitant?.find(x => x.id === id);
      if (inh) {
        Object.assign(inh, body);
        inh.updatedAt = new Date().toISOString();
        saveStore(store);
      }
      return inh || {};
    }

    // Concerns PATCH (311 Handling by Tanod & Desk Officers)
    const concernMatch = cleanPath.match(/\/concerns\/([^\/]+)/);
    if (concernMatch) {
      const id = concernMatch[1];
      const c = store.Concern?.find(x => x.id === id || x.referenceNo === id);
      if (c) {
        Object.assign(c, body);
        if (body.status === "acknowledged" && !c.acknowledgedAt) {
          c.acknowledgedAt = new Date().toISOString();
        }
        if (body.status === "resolved") {
          c.resolvedAt = new Date().toISOString();
          if (body.resolutionNote) c.resolutionNote = body.resolutionNote;
        }
        c.updatedAt = new Date().toISOString();
        saveStore(store);
      }
      return c || {};
    }

    // Properties PATCH
    const propMatch = cleanPath.match(/\/properties\/([^\/]+)/);
    if (propMatch) {
      const id = propMatch[1];
      const p = store.Property?.find(x => x.id === id);
      if (p) {
        Object.assign(p, body);
        p.updatedAt = new Date().toISOString();
        saveStore(store);
      }
      return p || {};
    }

    // Materials PATCH
    const matMatch = cleanPath.match(/\/materials\/([^\/]+)/);
    if (matMatch) {
      const id = matMatch[1];
      const m = store.Material?.find(x => x.id === id);
      if (m) {
        Object.assign(m, body);
        m.updatedAt = new Date().toISOString();
        saveStore(store);
      }
      return m || {};
    }

    // LGU Requests PATCH
    const lguMatch = cleanPath.match(/\/lgu-requests\/([^\/]+)/);
    if (lguMatch) {
      const id = lguMatch[1];
      const r = store.LguDocRequest?.find(x => x.id === id);
      if (r) {
        Object.assign(r, body);
        r.updatedAt = new Date().toISOString();
        saveStore(store);
      }
      return r || {};
    }

    // DRRM Resources PATCH
    const drrMatch = cleanPath.match(/\/drrm-resources\/([^\/]+)/);
    if (drrMatch) {
      const id = drrMatch[1];
      const res = store.DrrmResource?.find(x => x.id === id);
      if (res) {
        Object.assign(res, body);
        res.updatedAt = new Date().toISOString();
        saveStore(store);
      }
      return res || {};
    }

    // RPT Property PATCH
    const rptMatch = cleanPath.match(/\/rpt\/([^\/]+)/);
    if (rptMatch) {
      const id = rptMatch[1];
      const r = store.RptProperty?.find(x => x.id === id);
      if (r) {
        if (body.assessedValue !== undefined) body.assessedValue = Number(body.assessedValue);
        if (body.marketValue !== undefined) body.marketValue = Number(body.marketValue);
        Object.assign(r, body);
        r.updatedAt = new Date().toISOString();

        if (body.assessedValue) {
          const due = store.RptTaxDue?.find(d => d.rptPropertyId === id && d.paymentStatus === "unpaid");
          if (due) {
            due.basicTaxAmount = Math.round(r.assessedValue * 0.01);
            due.sefTaxAmount = Math.round(r.assessedValue * 0.005);
            due.totalAmount = due.basicTaxAmount + due.sefTaxAmount + (due.penaltyAmount || 0);
          }
        }
        saveStore(store);
      }
      return r || {};
    }

    // Disbursement Batch PATCH
    const batchPatchMatch = cleanPath.match(/\/wallet\/batches\/([^\/]+)/);
    if (batchPatchMatch) {
      const id = batchPatchMatch[1];
      const b = store.DisbursementBatch?.find(x => x.id === id || x.batchNo === id);
      if (b) {
        Object.assign(b, body);
        b.updatedAt = new Date().toISOString();
        saveStore(store);
      }
      return b || {};
    }

    // Household PATCH
    const hhMatch = cleanPath.match(/\/households\/([^\/]+)/);
    if (hhMatch) {
      const id = hhMatch[1];
      const h = store.Household?.find(x => x.id === id);
      if (h) {
        Object.assign(h, body);
        h.updatedAt = new Date().toISOString();
        saveStore(store);
      }
      return h || {};
    }
  }

  // 11. Mutations / POST requests
  if (method === "POST") {
    const body = opts.body ? JSON.parse(opts.body as string) : {};

    // Household POST
    if (cleanPath === "/households") {
      const newHh = {
        id: "hh-" + Math.random().toString(36).substring(2, 9),
        barangayId: currentUser.barangayId || "barangka",
        householdNo: body.householdNo || `HH-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
        houseNo: body.houseNo || "",
        blockNo: body.blockNo || "",
        lotNo: body.lotNo || "",
        street: body.street || "",
        subdivision: body.subdivision || "",
        buildingName: body.buildingName || "",
        purok: body.purok || "Purok 1",
        sitio: body.sitio || "",
        addressLine: body.addressLine || "",
        householdName: body.householdName || "Household Residence",
        householdType: body.householdType || "nuclear",
        housingUnit: body.housingUnit || "single_house",
        monthlyIncome: body.monthlyIncome ? Number(body.monthlyIncome) : 0,
        numFamilies: body.numFamilies ? Number(body.numFamilies) : 1,
        numMembers: body.numMembers ? Number(body.numMembers) : 1,
        numMigrants: body.numMigrants ? Number(body.numMigrants) : 0,
        zipCode: body.zipCode || "1803",
        latitude: body.latitude ? Number(body.latitude) : null,
        longitude: body.longitude ? Number(body.longitude) : null,
        squareMeters: body.squareMeters ? Number(body.squareMeters) : null,
        hasGarage: !!body.hasGarage,
        hazardZoneRisk: body.hazardZoneRisk || "low_risk",
        dwellingType: body.dwellingType || "single_house",
        roofMaterial: body.roofMaterial || "galvanized_iron",
        wallMaterial: body.wallMaterial || "concrete_brick",
        tenureStatus: body.tenureStatus || "owner",
        landTenure: body.landTenure || "owned",
        waterSource: body.waterSource || "piped",
        toiletFacility: body.toiletFacility || "flush_exclusive",
        electricitySource: body.electricitySource || "grid",
        cookingFuel: body.cookingFuel || "lpg",
        wasteDisposal: body.wasteDisposal || "barangay_truck",
        internetAccess: body.internetAccess || "fiber_broadband",
        monthlyIncomeBand: body.monthlyIncomeBand || "10k_to_20k",
        primaryIncomeSource: body.primaryIncomeSource || "employment",
        is4Ps: body.is4Ps || false,
        isIndigent: body.isIndigent || false,
        remarks: body.remarks || "",
        source: "CBMS",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        consents: []
      };
      if (!store.Household) store.Household = [];
      store.Household.push(newHh);

      // Also create member inhabitants if provided
      if (Array.isArray(body.members)) {
        if (!store.Inhabitant) store.Inhabitant = [];
        body.members.forEach((m: any) => {
          store.Inhabitant.push({
            id: "inh-" + Math.random().toString(36).substring(2, 9),
            barangayId: currentUser.barangayId || "barangka",
            householdId: newHh.id,
            firstName: m.firstName,
            middleName: m.middleName || "",
            lastName: m.lastName,
            suffix: m.suffix || "",
            relationToHead: m.relationToHead || "1",
            incomeSource: m.incomeSource || "1",
            monthlyIncome: m.monthlyIncome ? Number(m.monthlyIncome) : 0,
            sex: "male",
            birthDate: "1995-01-01",
            civilStatus: "single",
            citizenship: "Filipino",
            source: "CBMS",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        });
      }

      saveStore(store);
      return newHh;
    }

    // Inhabitants POST (DILG BIMS Form A2)
    if (cleanPath === "/inhabitants") {
      const newInh = {
        id: "inh-" + Math.random().toString(36).substring(2, 9),
        barangayId: currentUser.barangayId || "barangka",
        residentType: body.residentType || "non_migrant",
        philsysNo: body.philsysNo || "",
        firstName: body.firstName,
        middleName: body.middleName || "",
        lastName: body.lastName,
        suffix: body.suffix || "",
        sex: body.sex || "male",
        gender: body.gender || body.sex || "male",
        birthDate: body.birthDate || "1990-01-01",
        birthPlace: body.birthPlace || "",
        residenceMotherAtBirth: body.residenceMotherAtBirth || "",
        civilStatus: body.civilStatus || "single",
        isPregnant: !!body.isPregnant,
        citizenship: body.citizenship || "Filipino",
        nationality: body.nationality || "filipino",
        contactPhone: body.contactPhone || "",
        contactEmail: body.contactEmail || "",
        telephoneNumber: body.telephoneNumber || "",
        householdId: body.householdId || null,
        relationToHead: body.relationToHead || "1",
        incomeSource: body.incomeSource || "1",
        monthlyIncome: body.monthlyIncome ? Number(body.monthlyIncome) : 0,
        occupation: body.occupation || "",
        educationLevel: body.educationLevel || "",
        bloodType: body.bloodType || "O+",
        height: body.height ? Number(body.height) : null,
        weight: body.weight ? Number(body.weight) : null,
        complexion: body.complexion || "medium",
        isRegisteredVoter: !!body.isRegisteredVoter,
        isResidentVoter: !!body.isResidentVoter,
        lastVotedYear: body.lastVotedYear ? Number(body.lastVotedYear) : 2025,
        ethnicity: body.ethnicity || "Tagalog",
        religion: body.religion || "Roman Catholic",
        mothersMaidenFirstName: body.mothersMaidenFirstName || "",
        mothersMaidenMiddleName: body.mothersMaidenMiddleName || "",
        mothersMaidenLastName: body.mothersMaidenLastName || "",
        govAssistance: body.govAssistance || "",
        isEmployed: !!body.isEmployed,
        isUnemployed: !!body.isUnemployed,
        isStudent: !!body.isStudent,
        isOsc: !!body.isOsc,
        isOsy: !!body.isOsy,
        isOfw: !!body.isOfw,
        isIndigenous: !!body.isIndigenous,
        isMigrant: !!body.isMigrant,
        isRefugee: !!body.isRefugee,
        isSenior: !!body.isSenior,
        isRegisteredSenior: !!body.isRegisteredSenior,
        isPwd: !!body.isPwd,
        isRegisteredPwd: !!body.isRegisteredPwd,
        pwdType: body.pwdType || "",
        isSoloParent: !!body.isSoloParent,
        isRegisteredSoloParent: !!body.isRegisteredSoloParent,
        is4Ps: !!body.is4Ps,
        isDeceased: false,
        privacyConsent: true,
        source: "CBMS",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (!store.Inhabitant) store.Inhabitant = [];
      store.Inhabitant.push(newInh);
      saveStore(store);
      return newInh;
    }

    // Inhabitant Deceased POST (DILG BIMS Form A3)
    const deceasedMatch = cleanPath.match(/\/inhabitants\/([^\/]+)\/deceased$/);
    if (deceasedMatch) {
      const inhId = deceasedMatch[1];
      const inh = store.Inhabitant?.find((x: any) => x.id === inhId);
      if (inh) {
        inh.isDeceased = true;
        inh.deceasedDate = body.dateOfDeath || new Date().toISOString();
        inh.immediateCause = body.immediateCause || "";
        inh.underlyingCause = body.underlyingCause || "physical";
        saveStore(store);
      }
      return { success: true };
    }

    // Properties POST
    if (cleanPath === "/properties") {
      const newProp = {
        id: "prop-" + Math.random().toString(36).substring(2, 9),
        name: body.name,
        type: body.type,
        status: body.status,
        category: body.category,
        capacity: Number(body.capacity) || 0,
        custodian: body.custodian || null,
        addressLine: body.addressLine || null,
        description: body.description || null,
        isEvacuationCenter: Boolean(body.isEvacuationCenter),
        acquisitionCost: body.acquisitionCost !== undefined && body.acquisitionCost !== null ? Number(body.acquisitionCost) : null,
        acquiredAt: body.acquiredAt || new Date().toISOString(),
        source: "CBMS",
        barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (!store.Property) store.Property = [];
      store.Property.push(newProp);
      saveStore(store);
      return newProp;
    }

    // Materials POST
    if (cleanPath === "/materials") {
      const newMat = {
        id: "mat-" + Math.random().toString(36).substring(2, 9),
        name: body.name,
        unit: body.unit || "units",
        quantity: Number(body.quantity) || 0,
        reorderLevel: Number(body.reorderLevel) || 0,
        location: body.location || "Barangay Stockroom",
        barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (!store.Material) store.Material = [];
      store.Material.push(newMat);
      saveStore(store);
      return newMat;
    }

    // Civil Registry POST
    if (cleanPath === "/civil-registry") {
      const newRec = {
        id: "civ-" + Math.random().toString(36).substring(2, 9),
        barangayId: currentUser.barangayId || "barangka",
        recordType: body.recordType,
        registryNo: body.registryNo,
        registeredAt: body.registeredAt || new Date().toISOString(),
        inhabitantId: body.inhabitantId,
        childName: body.childName,
        fatherName: body.fatherName,
        motherName: body.motherName,
        dateOfBirth: body.dateOfBirth,
        placeOfBirth: body.placeOfBirth,
        groomName: body.groomName,
        brideName: body.brideName,
        dateOfMarriage: body.dateOfMarriage,
        placeOfMarriage: body.placeOfMarriage,
        deceasedName: body.deceasedName,
        dateOfDeath: body.dateOfDeath,
        causeOfDeath: body.causeOfDeath,
        placeOfDeath: body.placeOfDeath,
        remarks: body.remarks,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (!store.CivilRegistryRecord) store.CivilRegistryRecord = [];
      store.CivilRegistryRecord.push(newRec);

      // If record is death, mark inhabitant as inactive
      if (body.recordType === "death" && body.inhabitantId) {
        const inh = store.Inhabitant?.find(i => i.id === body.inhabitantId);
        if (inh) {
          inh.isActive = false;
        }
      }
      
      saveStore(store);
      return newRec;
    }

    // LGU Requests POST
    if (cleanPath === "/lgu-requests") {
      const newReq = {
        id: "lgu-" + Math.random().toString(36).substring(2, 9),
        barangayId: currentUser.barangayId || "barangka",
        inhabitantId: body.inhabitantId || currentUser.inhabitantId || "res1-inhabitant",
        docType: body.docType || "business_permit",
        purpose: body.purpose || "",
        status: body.status || "pending",
        referenceNo: body.referenceNo || (`LGU-2026-${Math.floor(Math.random() * 90000 + 10000)}`),
        fee: Number(body.fee) || 0,
        paidAt: body.paidAt || null,
        orNumber: body.orNumber || "",
        remarks: body.remarks || "",
        attachmentName: body.attachmentName || "",
        attachmentUrl: body.attachmentUrl || "",
        approvedAt: body.status === "approved" ? new Date().toISOString() : null,
        releasedAt: body.status === "released" ? new Date().toISOString() : null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (!store.LguDocRequest) store.LguDocRequest = [];
      store.LguDocRequest.push(newReq);
      saveStore(store);
      return newReq;
    }

    // RPT Property POST
    if (cleanPath === "/rpt") {
      const newProp = {
        id: "rpt-" + Math.random().toString(36).substring(2, 9),
        barangayId: currentUser.barangayId || "barangka",
        taxDeclarationNo: body.taxDeclarationNo,
        ownerInhabitantId: body.ownerInhabitantId,
        ownerName: body.ownerName,
        propertyType: body.propertyType,
        assessedValue: Number(body.assessedValue) || 0,
        marketValue: Number(body.marketValue) || 0,
        addressLine: body.addressLine,
        purok: body.purok,
        lotNo: body.lotNo || "",
        blockNo: body.blockNo || "",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (!store.RptProperty) store.RptProperty = [];
      store.RptProperty.push(newProp);

      // Create dummy tax due
      const newDue = {
        id: "due-" + Math.random().toString(36).substring(2, 9),
        rptPropertyId: newProp.id,
        taxYear: new Date().getFullYear(),
        basicTaxAmount: Math.round(newProp.assessedValue * 0.01),
        sefTaxAmount: Math.round(newProp.assessedValue * 0.005),
        penaltyAmount: 0,
        totalAmount: Math.round(newProp.assessedValue * 0.015),
        paymentStatus: "unpaid",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (!store.RptTaxDue) store.RptTaxDue = [];
      store.RptTaxDue.push(newDue);

      saveStore(store);
      return newProp;
    }

    // DRRM Resources POST
    if (cleanPath === "/drrm-resources") {
      const newRes = {
        id: "drr-" + Math.random().toString(36).substring(2, 9),
        barangayId: currentUser.barangayId || "barangka",
        name: body.name,
        type: body.type,
        quantity: Number(body.quantity) || 0,
        status: body.status || "operational",
        notes: body.notes,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (!store.DrrmResource) store.DrrmResource = [];
      store.DrrmResource.push(newRes);
      saveStore(store);
      return newRes;
    }

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
      const concerns = store.Concern || [];
      const nextNo = (concerns.length + 1).toString().padStart(5, "0");
      const slaClock = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      const newConcern = {
        id: "cn-" + Math.random().toString(36).substring(2, 9),
        barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
        referenceNo: body.referenceNo || `CN-2026-${nextNo}`,
        category: body.category || "other",
        description: body.description || "",
        purok: body.purok || "Purok 1",
        status: body.status || "submitted",
        slaDueAt: slaClock,
        slaBreached: false,
        inhabitantId: body.inhabitantId || currentUser.inhabitantId || null,
        inhabitant: body.inhabitant || (currentUser.fullName ? { firstName: currentUser.fullName.split(" ")[0], lastName: currentUser.fullName.split(" ").slice(1).join(" ") } : null),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (!store.Concern) store.Concern = [];
      store.Concern.unshift(newConcern);
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

    if (cleanPath === "/blotter") {
      const newBlotter = {
        id: "blt-" + Math.random().toString(36).substring(2, 9),
        incidentNo: "BLT-2026-" + Math.floor(100 + Math.random() * 900),
        category: body.category || "dispute",
        incidentAt: body.incidentAt || new Date().toISOString(),
        location: body.location || "Barangay Barangka",
        narrative: body.narrative || "",
        reportedBy: body.reportedBy || "Citizen",
        respondentName: body.respondentName || "",
        status: "active",
        barangayId: currentUser.barangayId || "van6rdk",
        createdAt: new Date().toISOString()
      };
      if (!store.BlotterEntry) store.BlotterEntry = [];
      store.BlotterEntry.unshift(newBlotter);
      saveStore(store);
      return newBlotter;
    }

    if (cleanPath === "/kp/cases") {
      const newCase = {
        id: "kp-" + Math.random().toString(36).substring(2, 9),
        caseNumber: "KP-2026-" + Math.floor(100 + Math.random() * 900),
        subject: body.subject || "Community Dispute",
        description: body.description || "",
        complainant: currentUser.fullName || "Citizen",
        respondentName: body.respondentName || "",
        stage: "filed",
        filedAt: new Date().toISOString(),
        deadlineAt: new Date(Date.now() + 86400000 * 14).toISOString(),
        isConfidential: !!body.isConfidential,
        barangayId: currentUser.barangayId || "van6rdk",
        createdAt: new Date().toISOString()
      };
      if (!store.KpCase) store.KpCase = [];
      store.KpCase.unshift(newCase);
      saveStore(store);
      return newCase;
    }

    const sosRespondMatch = cleanPath.match(/\/sos\/([^\/]+)\/respond/);
    if (sosRespondMatch) {
      const id = sosRespondMatch[1];
      const alert = (store.SosAlert || []).find(a => a.id === id);
      if (alert) {
        alert.status = body.status || "dispatched";
        alert.responseNote = body.responseNote || null;
        alert.respondedAt = new Date().toISOString();
        saveStore(store);
      }
      return alert || {};
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
  const [user, setUser] = React.useState<SessionUser | null>(() => {
    const stored = getStoredUser();
    if (stored?.email) {
      return mockSessionUser(stored.email);
    }
    return stored;
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api<{ user: SessionUser }>("/auth/me")
      .then((d) => {
        setUser(d.user);
        setSession(getToken() || "mock-token", d.user);
      })
      .catch(() => clearSession())
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
