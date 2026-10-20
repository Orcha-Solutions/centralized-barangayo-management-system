import type { SessionUser, TenantInfo } from "./types";

export const TOKEN_KEY = "cbms.token";
export const REFRESH_TOKEN_KEY = "cbms.refresh_token";
export const TENANT_KEY = "cbms.tenant";
export const USER_KEY = "cbms.user";
export const STORE_KEY = "cbms.store_v3";

export const ROLE_PERMISSIONS_MOCK: Record<string, string[]> = {
  SYSTEM_ADMIN: ["*"],
  PUNONG_BARANGAY: ["*"],
  LGU_ADMIN: [
    "inhabitants:view",
    "issuance:view",
    "kp:view",
    "property:view",
    "property:encode",
    "disaster:view",
    "gad:view",
    "legislation:view",
    "devplan:view",
    "institutions:view",
    "finance:view",
    "wallet:manage",
    "concerns:view",
    "concerns:encode",
    "feedback:view",
    "reports:view",
    "admin:view",
    "admin:approve",
    "admin:configure",
    "ai:view",
  ],
  BARANGAY_SECRETARY: [
    "inhabitants:view",
    "inhabitants:create",
    "inhabitants:edit",
    "issuance:view",
    "issuance:create",
    "issuance:edit",
    "appointments:view",
    "concerns:view",
    "concerns:encode",
    "legislation:view",
    "announcements:view",
    "reports:view",
    "kp:view",
    "blotter:view",
    "property:view",
    "property:encode",
  ],
  BDC_OFFICER: ["devplan:view", "devplan:create", "devplan:edit", "institutions:view", "reports:view"],
  BDRRMC_OFFICER: ["disaster:view", "disaster:create", "sos:view", "property:view", "property:encode"],
  VAW_DESK_OFFICER: ["blotter:view", "blotter:create", "vawc:view", "vawc:create", "vawc:encode"],
  LUPON_SECRETARY: ["kp:view", "kp:create", "kp:edit", "blotter:view"],
  BARANGAY_TREASURER: ["finance:view", "wallet:manage", "property:view", "property:encode", "issuance:view"],
  TANOD: ["sos:view", "sos:respond", "kp:view", "blotter:view", "concerns:view", "concerns:encode"],
  BHW: ["inhabitants:view", "health:view", "concerns:view", "concerns:encode"],
  SK_OFFICIAL: ["devplan:view", "institutions:view", "announcements:view"],
  BADAC_OFFICER: ["kp:view", "blotter:view", "institutions:view"],
  DILG_VIEWER: ["reports:view"],
  IT_OFFICER: [
    "admin:view",
    "admin:configure",
    "reports:view",
    "inhabitants:view",
    "issuance:view",
    "finance:view",
    "property:view",
    "disaster:view",
    "blotter:view",
    "kp:view",
    "concerns:view",
    "wallet:view",
  ],
  RESIDENT: ["cert:request", "wallet:resident", "concern:create", "sos:create"],
};

export function getRolePermissions(role: string): string[] {
  if (role === "PUNONG_BARANGAY" || role === "SYSTEM_ADMIN") return ["*"];
  return ROLE_PERMISSIONS_MOCK[role] || [];
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredTenant(): any | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(TENANT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function normalizeSessionUser(
  rawUser: any,
  rawTenant?: any,
  rawPermissions?: string[],
): SessionUser {
  if (!rawUser) {
    return {
      id: "usr-kapitan",
      fullName: "Hon. Antonio S. Santos (Punong Barangay)",
      name: "Hon. Antonio S. Santos (Punong Barangay)",
      email: "kapitan@barangka.gov.ph",
      role: "PUNONG_BARANGAY",
      roles: ["PUNONG_BARANGAY"],
      scope: "barangay",
      permissions: ["*"],
      isActive: true,
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true,
      tenantId: "tnt-barangka",
      barangayId: "brgy-barangka",
      cityId: "city-marikina",
      inhabitantId: null,
      barangay: { id: "brgy-barangka", name: "Barangka", code: "BRGY-BARANGKA", mode: "isolated_schema" },
      city: { id: "city-marikina", name: "Marikina City" },
    };
  }
  const roleKey =
    rawUser.role ||
    (Array.isArray(rawUser.roles) && rawUser.roles.length > 0
      ? rawUser.roles[0]
      : "RESIDENT");
  const roles =
    Array.isArray(rawUser.roles) && rawUser.roles.length > 0
      ? rawUser.roles
      : [roleKey];

  const scope =
    rawUser.scope ||
    (roleKey === "SYSTEM_ADMIN"
      ? "platform"
      : roleKey === "LGU_ADMIN" || roleKey === "DILG_VIEWER"
        ? "city"
        : roleKey === "RESIDENT"
          ? "self"
          : "barangay");

  const backendPerms = Array.isArray(rawPermissions)
    ? rawPermissions
    : Array.isArray(rawUser.permissions)
      ? rawUser.permissions
      : [];
  const uiPerms = getRolePermissions(roleKey);
  const mergedPerms = Array.from(new Set([...backendPerms, ...uiPerms]));

  const canCreate = rawUser.canCreate !== false;
  const canRead = rawUser.canRead !== false;
  const canUpdate = rawUser.canUpdate !== false;
  const canDelete =
    rawUser.canDelete !== undefined
      ? !!rawUser.canDelete
      : roleKey === "SYSTEM_ADMIN" ||
        roleKey === "PUNONG_BARANGAY" ||
        roleKey === "BARANGAY_SECRETARY";
  const isActive = rawUser.isActive !== false && !rawUser.banned;

  const tenant = rawTenant || getStoredTenant();
  const effectiveTenantId = rawUser.tenantId || tenant?.id || "tnt-barangka";
  const effectiveBarangayId = rawUser.barangayId || tenant?.barangayId || "brgy-barangka";
  const effectiveCityId = rawUser.cityId || tenant?.cityId || "city-marikina";

  const brgyObj =
    rawUser.barangay ||
    tenant?.barangay || {
      id: effectiveBarangayId,
      name: ((tenant?.name as string) || "Barangka").replace(/^Barangay\s+/i, ""),
      code: tenant?.code || "BRGY-BARANGKA",
      mode: tenant?.mode || "companion",
    };

  return {
    id: rawUser.id || "usr-unknown",
    fullName: rawUser.fullName || rawUser.name || rawUser.email || "Official",
    name: rawUser.name || rawUser.fullName || rawUser.email || "Official",
    email: rawUser.email || null,
    role: roleKey,
    roles,
    scope,
    permissions: mergedPerms,
    isActive,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    tenantId: effectiveTenantId,
    barangayId: effectiveBarangayId,
    cityId: effectiveCityId,
    inhabitantId: rawUser.inhabitantId || null,
    barangay: brgyObj,
    city: rawUser.city || { id: effectiveCityId, name: "Marikina City" },
  };
}

export function setSession(
  token: string,
  user: SessionUser,
  refreshToken?: string,
  tenant?: any,
) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  if (tenant) {
    window.localStorage.setItem(TENANT_KEY, JSON.stringify(tenant));
  }
  const normalized = normalizeSessionUser(user, tenant);
  window.localStorage.setItem(USER_KEY, JSON.stringify(normalized));
}

export function getStoredUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return normalizeSessionUser(parsed);
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(TENANT_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function switchActiveTenant(tenant: TenantInfo): SessionUser | null {
  if (typeof window === "undefined") return null;
  const current = getStoredUser();
  if (!current) return null;

  const updated: SessionUser = {
    ...current,
    tenantId: tenant.id,
    barangayId: tenant.barangayId || tenant.id,
    barangay: {
      id: tenant.barangayId || tenant.id,
      name: (tenant.name || "Barangay").replace(/^Barangay\s+/i, ""),
      code: tenant.code,
      mode: tenant.mode,
    },
  };

  setSession(getToken() || "active-token", updated, getRefreshToken() || undefined, tenant);
  return updated;
}
