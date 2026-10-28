"use client";

import { create } from "zustand";
import {
  clearSession,
  getStoredTenant,
  getStoredUser,
  switchActiveTenant,
  type RbacPermissionInfo,
  type RbacRoleInfo,
  type SessionUser,
  type TenantInfo,
} from "@cbms/api-client";
import { NAV_GROUPS } from "../components/nav";

/**
 * Bidirectional mapping between DILG MC 2025-104 backend permissions (`rbi:read`, `documents:issue`, etc.)
 * and UI module permission keys (`inhabitants:view`, `issuance:create`, etc.).
 */
const PERMISSION_SYNONYMS: Record<string, string[]> = {
  "inhabitants:view": ["rbi:read"],
  "inhabitants:create": ["rbi:write"],
  "inhabitants:edit": ["rbi:write"],
  "inhabitants:delete": ["rbi:delete"],
  "rbi:read": ["inhabitants:view"],
  "rbi:write": ["inhabitants:create", "inhabitants:edit"],
  "rbi:delete": ["inhabitants:delete"],

  "issuance:view": ["documents:read"],
  "issuance:create": ["documents:issue"],
  "issuance:edit": ["documents:issue", "documents:sign"],
  "documents:read": ["issuance:view"],
  "documents:issue": ["issuance:create", "issuance:edit"],

  "blotter:view": ["blotter:read", "vawc:read"],
  "blotter:create": ["blotter:write", "vawc:write"],
  "blotter:read": ["blotter:view"],
  "blotter:write": ["blotter:create"],

  "kp:view": ["blotter:read"],
  "kp:create": ["blotter:write", "blotter:summon"],
  "kp:edit": ["blotter:settle", "blotter:summon"],

  "appointments:view": ["appointments:read"],
  "appointments:read": ["appointments:view"],

  "finance:view": ["finance:read", "finance:reports"],
  "finance:read": ["finance:view"],
  "wallet:manage": ["finance:collect", "finance:disburse"],

  "disaster:view": ["emergency:read"],
  "disaster:create": ["emergency:alert"],
  "sos:view": ["emergency:read"],
  "sos:respond": ["emergency:alert"],
  "sos:create": ["emergency:alert"],
  "sos:update": ["emergency:alert"],
  "sos:delete": ["emergency:alert"],

  "vawc:view": ["vawc:read"],
  "vawc:create": ["vawc:write"],
  "vawc:encode": ["vawc:write"],

  "admin:view": ["users:read", "audit:read", "tenant:read"],
  "admin:configure": ["users:manage", "tenant:manage"],
  "reports:view": ["rbi:export", "finance:reports", "audit:read"],
};

export type CrudAction = "create" | "read" | "update" | "delete";

export interface RbacState {
  user: SessionUser | null;
  activeTenant: TenantInfo | null;
  tenants: TenantInfo[];
  rolesCatalog: RbacRoleInfo[];
  permissionsCatalog: RbacPermissionInfo[];
  permissionsByModule: Record<string, RbacPermissionInfo[]>;
  hydrated: boolean;

  // Actions
  hydrateFromStorage: () => void;
  setUser: (user: SessionUser | null) => void;
  setActiveTenant: (tenant: TenantInfo) => void;
  setTenants: (tenants: TenantInfo[]) => void;
  setRolesCatalog: (roles: RbacRoleInfo[]) => void;
  setPermissionsCatalog: (
    permissions: RbacPermissionInfo[],
    byModule: Record<string, RbacPermissionInfo[]>,
  ) => void;
  resetSession: () => void;

  // Selectors / Evaluators
  can: (perm: string) => boolean;
  canAny: (...perms: string[]) => boolean;
  canAll: (...perms: string[]) => boolean;
  hasRole: (...roles: string[]) => boolean;
  canCrud: (action: CrudAction) => boolean;
  canAccessRoute: (pathname: string) => { allowed: boolean; reason?: string; requiredPerm?: string };
}

export const useRbacStore = create<RbacState>((set, get) => ({
  user: typeof window !== "undefined" ? getStoredUser() : null,
  activeTenant: typeof window !== "undefined" ? getStoredTenant() : null,
  tenants: [],
  rolesCatalog: [],
  permissionsCatalog: [],
  permissionsByModule: {},
  hydrated: false,

  hydrateFromStorage: () => {
    let storedUser = getStoredUser();
    let storedTenant = getStoredTenant();
    if (storedTenant?.id === "tnt-sanroque" || storedUser?.tenantId === "tnt-sanroque") {
      const defaultTenant: TenantInfo = {
        id: "tnt-barangka",
        name: "Barangay Barangka",
        code: "BRGY-BARANGKA",
        subdomain: "barangka",
        barangayId: "brgy-barangka",
        cityId: "city-marikina",
        mode: "shared_db",
        status: "active",
      };
      storedUser = switchActiveTenant(defaultTenant);
      storedTenant = defaultTenant;
    }
    set({
      user: storedUser,
      activeTenant: storedTenant,
      hydrated: true,
    });
  },

  setUser: (user) => set({ user, hydrated: true }),

  setActiveTenant: (tenant) => {
    const updatedUser = switchActiveTenant(tenant);
    set((state) => ({
      activeTenant: tenant,
      user: updatedUser || state.user,
    }));
  },

  setTenants: (tenants) =>
    set((state) => {
      const currentTenantId = state.user?.tenantId || state.activeTenant?.id || "tnt-barangka";
      const matched = tenants.find((t) => t.id === currentTenantId) || state.activeTenant;
      return { tenants, activeTenant: matched };
    }),

  setRolesCatalog: (rolesCatalog) => set({ rolesCatalog }),

  setPermissionsCatalog: (permissionsCatalog, permissionsByModule) =>
    set({ permissionsCatalog, permissionsByModule }),

  resetSession: () => {
    clearSession();
    set({ user: null, activeTenant: null });
  },

  canCrud: (action: CrudAction) => {
    const { user } = get();
    if (!user) return false;
    if (user.isActive === false) return false;
    if (user.roles?.includes("SYSTEM_ADMIN")) return true;
    switch (action) {
      case "create":
        return user.canCreate !== false;
      case "read":
        return user.canRead !== false;
      case "update":
        return user.canUpdate !== false;
      case "delete":
        return !!user.canDelete;
      default:
        return false;
    }
  },

  can: (perm: string) => {
    const { user, canCrud } = get();
    if (!user || user.isActive === false) return false;

    // Enforce granular CRUD lock if applicable
    const lowerPerm = perm.toLowerCase();
    if (lowerPerm.endsWith(":delete") && !canCrud("delete")) return false;
    if (
      (lowerPerm.endsWith(":create") ||
        lowerPerm.endsWith(":write") ||
        lowerPerm.endsWith(":issue") ||
        lowerPerm.endsWith(":encode")) &&
      !canCrud("create")
    ) {
      return false;
    }
    if ((lowerPerm.endsWith(":edit") || lowerPerm.endsWith(":update")) && !canCrud("update")) {
      return false;
    }
    if ((lowerPerm.endsWith(":view") || lowerPerm.endsWith(":read")) && !canCrud("read")) {
      return false;
    }

    const perms = user.permissions || [];
    if (perms.includes("*")) return true;
    if (perms.includes(perm)) return true;

    const synonyms = PERMISSION_SYNONYMS[perm] || [];
    return synonyms.some((s) => perms.includes(s));
  },

  canAny: (...perms: string[]) => {
    const { can } = get();
    return perms.some((p) => can(p));
  },

  canAll: (...perms: string[]) => {
    const { can } = get();
    return perms.every((p) => can(p));
  },

  hasRole: (...roles: string[]) => {
    const { user } = get();
    if (!user?.roles) return false;
    return roles.some((r) => user.roles.includes(r));
  },

  canAccessRoute: (pathname: string) => {
    const { user, can, hasRole } = get();
    if (!user) {
      return { allowed: false, reason: "Authentication required." };
    }
    if (user.isActive === false) {
      return { allowed: false, reason: "Account has been suspended by IT Security Policy." };
    }

    // Always allow dashboard, docs, and login
    if (
      pathname === "/" ||
      pathname === "/dashboard" ||
      pathname.startsWith("/docs") ||
      pathname.startsWith("/login")
    ) {
      return { allowed: true };
    }

    // ORCHA Super Admin platform routes & tenant onboarding are strictly reserved for ORCHA company operators
    if (pathname.startsWith("/super-admin") || pathname === "/hub/onboard") {
      const isOrchaSuperAdmin =
        hasRole("SYSTEM_ADMIN") ||
        user.scope === "platform" ||
        user.email?.toLowerCase().startsWith("admin@") ||
        user.email?.toLowerCase().includes("superadmin") ||
        user.email?.toLowerCase().includes("orcha");
      return isOrchaSuperAdmin
        ? { allowed: true }
        : {
            allowed: false,
            reason:
              "Barangay tenant provisioning and multi-tenant database onboarding are strictly managed by ORCHA Platform Operations. Client Barangays and LGUs do not have permission to provision tenants.",
          };
    }

    const isSuperAdmin =
      hasRole("PUNONG_BARANGAY", "SYSTEM_ADMIN") ||
      user.email?.toLowerCase().includes("kapitan") ||
      user.email?.toLowerCase().includes("superadmin") ||
      user.email?.toLowerCase().startsWith("admin@");

    if (isSuperAdmin) {
      return { allowed: true };
    }

    // Strict functionary role boundaries (DILG MC 2025-104 & RA 9262 / RA 10173 separation of duties)
    const isItUser =
      hasRole("IT_OFFICER") ||
      user.email?.toLowerCase().startsWith("it@");
    if (isItUser) {
      const itAllowed =
        pathname.startsWith("/audit") ||
        pathname.startsWith("/users") ||
        pathname.startsWith("/features") ||
        pathname.startsWith("/tickets") ||
        pathname.startsWith("/docs");
      return itAllowed
        ? { allowed: true }
        : {
            allowed: false,
            reason:
              "IT Officers / Systems Auditors are restricted to Application Management, User CRUD, Audit Logs, and Support Tickets under separation-of-duties policy.",
            requiredPerm: "admin:configure",
          };
    }

    const isVawUser =
      hasRole("VAW_DESK_OFFICER") ||
      user.email?.toLowerCase().includes("vaw");
    if (isVawUser) {
      const vawAllowed = pathname.startsWith("/blotter");
      return vawAllowed
        ? { allowed: true }
        : {
            allowed: false,
            reason:
              "VAW Desk Officers are scoped exclusively to the Confidential VAWC & Blotter Desk (RA 9262).",
            requiredPerm: "vawc:read",
          };
    }

    const isLuponUser =
      hasRole("LUPON_SECRETARY") ||
      user.email?.toLowerCase().includes("lupon");
    if (isLuponUser) {
      const luponAllowed = pathname.startsWith("/blotter") || pathname.startsWith("/kp");
      return luponAllowed
        ? { allowed: true }
        : {
            allowed: false,
            reason:
              "Lupon Tagapamayapa Secretaries are scoped to Katarungang Pambarangay Cases and Blotter Records.",
            requiredPerm: "kp:view",
          };
    }

    const isBdcUser =
      hasRole("BDC_OFFICER", "BDC_CHAIR") ||
      user.email?.toLowerCase().includes("bdc");
    if (isBdcUser) {
      const bdcAllowed =
        pathname.startsWith("/devplan") ||
        pathname.startsWith("/institutions") ||
        pathname.startsWith("/reports");
      return bdcAllowed
        ? { allowed: true }
        : {
            allowed: false,
            reason:
              "Barangay Development Council (BDC) Coordinators are scoped to Development Planning (AIP/BDP), Institutions, and Reports.",
            requiredPerm: "devplan:view",
          };
    }

    // Evaluate against NAV_GROUPS permission definitions
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
          if (group.roles && !group.roles.some((r) => hasRole(r))) {
            return {
              allowed: false,
              reason: `Requires one of the following roles: ${group.roles.join(", ")}`,
              requiredPerm: item.perm,
            };
          }
          if (item.perm && !can(item.perm)) {
            return {
              allowed: false,
              reason: `Your current role (${user.roles.join(", ")}) does not have the '${item.perm}' permission.`,
              requiredPerm: item.perm,
            };
          }
        }
      }
    }

    return { allowed: true };
  },
}));
