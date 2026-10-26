"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  api,
  createInvitation,
  createTenant,
  deleteTenant,
  fetchRbacMe,
  fetchRbacPermissions,
  fetchRbacRoles,
  getRefreshToken,
  getStoredTenant,
  getTenant,
  getToken,
  listTenantInvitations,
  listTenantMembers,
  listTenants,
  normalizeSessionUser,
  patch,
  recruitTenantMember,
  revokeTenantInvitation,
  setSession,
  updateTenant,
  type CreateTenantPayload,
  type RbacMeInfo,
  type RbacPermissionsCatalogResponse,
  type RbacRoleInfo,
  type SessionUser,
  type TenantInfo,
  type TenantInvitationInfo,
  type UpdateTenantPayload,
} from "@cbms/api-client";
import { useRbacStore } from "./rbac-store";

export const RBAC_QUERY_KEYS = {
  session: (tenantId?: string | null) => ["auth", "session", tenantId || "default"] as const,
  rbacMe: (tenantId?: string | null) => ["rbac", "me", tenantId || "default"] as const,
  roles: ["rbac", "roles"] as const,
  permissions: ["rbac", "permissions"] as const,
  tenants: ["tenants", "active"] as const,
  tenantMembers: (tenantId: string) => ["tenants", tenantId, "members"] as const,
  tenantInvitations: (tenantId: string) => ["tenants", tenantId, "invitations"] as const,
};

/**
 * Fetches `/api/auth/me` and `/api/rbac/me` via TanStack React Query and synchronizes
 * the resulting `SessionUser` and effective DILG MC 2025-104 permissions into `useRbacStore`.
 */
export function useRbacSessionQuery() {
  const setUser = useRbacStore((s) => s.setUser);
  const activeTenant = useRbacStore((s) => s.activeTenant);
  const token = typeof window !== "undefined" ? getToken() : null;

  return useQuery<SessionUser | null>({
    queryKey: RBAC_QUERY_KEYS.session(activeTenant?.id),
    enabled: !!token,
    staleTime: 60 * 1000,
    queryFn: async () => {
      const [meRes, rbacMeRes] = await Promise.allSettled([
        api<{ user: any; tenant?: any; permissions?: string[] }>("/auth/me"),
        fetchRbacMe(),
      ]);

      if (meRes.status === "rejected") {
        throw meRes.reason;
      }

      const d = meRes.value;
      if (!d?.user) return null;

      const rbacPerms =
        rbacMeRes.status === "fulfilled" && Array.isArray(rbacMeRes.value?.permissions)
          ? rbacMeRes.value.permissions
          : [];
      const mergedRawPerms = Array.from(
        new Set([...(d.permissions || []), ...(d.user.permissions || []), ...rbacPerms]),
      );

      const effectiveTenant = getStoredTenant() || d.tenant;
      const normalized = normalizeSessionUser(d.user, effectiveTenant, mergedRawPerms);
      setSession(
        getToken() || token || "",
        normalized,
        getRefreshToken() || undefined,
        effectiveTenant,
      );
      setUser(normalized);
      return normalized;
    },
  });
}

/**
 * Fetches all 13 DILG MC 2025-104 standard roles (`GET /api/rbac/roles`) and caches in React Query + Zustand.
 */
export function useRbacRolesQuery() {
  const setRolesCatalog = useRbacStore((s) => s.setRolesCatalog);

  return useQuery<RbacRoleInfo[]>({
    queryKey: RBAC_QUERY_KEYS.roles,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const roles = await fetchRbacRoles();
      setRolesCatalog(roles);
      return roles;
    },
  });
}

/**
 * Fetches the complete catalog of 26 granular CBMS permissions grouped by module (`GET /api/rbac/permissions`).
 */
export function useRbacPermissionsQuery() {
  const setPermissionsCatalog = useRbacStore((s) => s.setPermissionsCatalog);

  return useQuery<RbacPermissionsCatalogResponse>({
    queryKey: RBAC_QUERY_KEYS.permissions,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const res = await fetchRbacPermissions();
      setPermissionsCatalog(res.permissions, res.byModule);
      return res;
    },
  });
}

/**
 * Fetches all active Barangay Tenants (`GET /api/tenants`) and syncs into Zustand.
 */
export function useTenantsQuery(params?: { q?: string; status?: string; mode?: string }) {
  const setTenants = useRbacStore((s) => s.setTenants);

  const queryKey = React.useMemo(
    () => ["tenants", "active", params?.q?.trim() ?? "", params?.status ?? "all", params?.mode ?? "all"] as const,
    [params?.q, params?.status, params?.mode]
  );

  return useQuery<TenantInfo[]>({
    queryKey,
    staleTime: 30 * 1000,
    queryFn: async () => {
      const list = await listTenants(params);
      if (
        list.length > 0 &&
        !params?.q?.trim() &&
        (!params?.status || params.status === "all") &&
        (!params?.mode || params.mode === "all")
      ) {
        setTenants(list);
      }
      return list;
    },
  });
}

/**
 * Fetches a single Barangay Tenant by ID or subdomain (`GET /api/tenants/:identifier`).
 */
export function useSingleTenantQuery(identifier: string) {
  return useQuery<TenantInfo | null>({
    queryKey: ["tenants", "detail", identifier],
    enabled: !!identifier,
    staleTime: 30 * 1000,
    queryFn: async () => {
      try {
        const res = await getTenant(identifier);
        return res?.tenant ?? null;
      } catch {
        return null;
      }
    },
  });
}

/**
 * Fetches any tenant's official staff roster (`GET /api/tenants/:identifier/members`).
 */
export function useTenantRosterQuery(tenantId: string) {
  return useQuery<{ members: any[]; count: number }>({
    queryKey: ["tenants", tenantId, "roster"],
    enabled: !!tenantId,
    staleTime: 30 * 1000,
    queryFn: async () => {
      return listTenantMembers(tenantId);
    },
  });
}

export interface TenantMemberSecurityRow {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  canCreate?: boolean;
  canRead?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

/**
 * Fetches the active tenant's staff member roster (`GET /api/tenants/:id/members`) via React Query.
 */
export function useTenantMembersQuery(tenantId: string) {
  return useQuery<{ items: TenantMemberSecurityRow[]; total: number }>({
    queryKey: RBAC_QUERY_KEYS.tenantMembers(tenantId),
    enabled: !!tenantId,
    queryFn: async () => {
      return api<{ items: TenantMemberSecurityRow[]; total: number }>("/users");
    },
  });
}

/**
 * React Query mutation to update a staff member's CRUD permissions, role, or active status.
 */
export function useUpdateTenantMemberMutation(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      userId: string;
      payload: Record<string, any>;
    }) => {
      return patch(`/users/${params.userId}/status`, params.payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: RBAC_QUERY_KEYS.tenantMembers(tenantId),
      });
      queryClient.invalidateQueries({
        queryKey: RBAC_QUERY_KEYS.session(tenantId),
      });
    },
  });
}

/**
 * React Query mutation to recruit a new official/staff member into the active tenant.
 */
export function useRecruitTenantMemberMutation(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      password: string;
      role: string;
      canCreate?: boolean;
      canRead?: boolean;
      canUpdate?: boolean;
      canDelete?: boolean;
    }) => {
      return recruitTenantMember(tenantId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: RBAC_QUERY_KEYS.tenantMembers(tenantId),
      });
    },
  });
}

/**
 * React Query mutation to generate a single-use staff onboarding invitation token.
 */
export function useCreateInvitationMutation(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { email: string; role: string; expiresDays?: number }) => {
      return createInvitation(tenantId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: RBAC_QUERY_KEYS.tenantInvitations(tenantId),
      });
    },
  });
}

/**
 * React Query mutation to provision a new Barangay Tenant (`POST /api/tenants`)
 * and automatically refresh the global tenant directory in React Query + Zustand.
 */
export function useCreateTenantMutation() {
  const queryClient = useQueryClient();
  const setTenants = useRbacStore((s) => s.setTenants);
  const tenants = useRbacStore((s) => s.tenants);

  return useMutation({
    mutationFn: async (payload: CreateTenantPayload) => {
      return createTenant(payload);
    },
    onSuccess: (res) => {
      if (res?.tenant) {
        const next = [...tenants.filter((t) => t.id !== res.tenant.id), res.tenant];
        setTenants(next);
      }
      queryClient.invalidateQueries({
        queryKey: RBAC_QUERY_KEYS.tenants,
      });
    },
  });
}

/**
 * React Query mutation to update an existing Barangay Tenant's configuration (`PATCH /api/tenants/:id`).
 */
export function useUpdateTenantMutation(tenantId: string) {
  const queryClient = useQueryClient();
  const setActiveTenant = useRbacStore((s) => s.setActiveTenant);
  const activeTenant = useRbacStore((s) => s.activeTenant);

  return useMutation({
    mutationFn: async (payload: UpdateTenantPayload) => {
      return updateTenant(tenantId, payload);
    },
    onSuccess: (res) => {
      if (res?.tenant && activeTenant?.id === res.tenant.id) {
        setActiveTenant(res.tenant);
      }
      queryClient.invalidateQueries({
        queryKey: RBAC_QUERY_KEYS.tenants,
      });
    },
  });
}

/**
 * React Query mutation to delete a Barangay Tenant (`DELETE /api/tenants/:id`).
 */
export function useDeleteTenantMutation() {
  const queryClient = useQueryClient();
  const setTenants = useRbacStore((s) => s.setTenants);
  const tenants = useRbacStore((s) => s.tenants);
  const activeTenant = useRbacStore((s) => s.activeTenant);
  const setActiveTenant = useRbacStore((s) => s.setActiveTenant);

  return useMutation({
    mutationFn: async (tenantId: string) => {
      return deleteTenant(tenantId);
    },
    onSuccess: (_, deletedId) => {
      const remaining = tenants.filter((t) => t.id !== deletedId);
      setTenants(remaining);
      if (activeTenant?.id === deletedId && remaining.length > 0) {
        setActiveTenant(remaining[0]);
      }
      queryClient.invalidateQueries({
        queryKey: RBAC_QUERY_KEYS.tenants,
      });
    },
  });
}

/**
 * Fetches pending/active onboarding invitations for a Barangay Tenant (`GET /api/tenants/:id/invitations`).
 */
export function useTenantInvitationsQuery(tenantId: string) {
  return useQuery<TenantInvitationInfo[]>({
    queryKey: RBAC_QUERY_KEYS.tenantInvitations(tenantId),
    enabled: !!tenantId,
    queryFn: async () => {
      return listTenantInvitations(tenantId);
    },
  });
}

/**
 * React Query mutation to revoke a pending onboarding invitation (`DELETE /api/tenants/:id/invitations/:invId`).
 */
export function useRevokeTenantInvitationMutation(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      return revokeTenantInvitation(tenantId, invitationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: RBAC_QUERY_KEYS.tenantInvitations(tenantId),
      });
    },
  });
}

