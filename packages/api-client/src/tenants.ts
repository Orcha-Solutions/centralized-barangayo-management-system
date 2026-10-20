import { realBackendFetch } from "./client";
import type {
  CreateTenantPayload,
  RbacMeInfo,
  RbacPermissionsCatalogResponse,
  RbacRoleInfo,
  TenantInfo,
  TenantInvitationInfo,
  UpdateTenantPayload,
} from "./types";

export async function listTenants(params?: {
  q?: string;
  status?: string;
  mode?: string;
}): Promise<TenantInfo[]> {
  try {
    const query = new URLSearchParams();
    const trimmedQ = params?.q?.trim() ?? "";
    if (trimmedQ.length >= 3) query.set("q", trimmedQ);
    if (params?.status && params.status !== "all") query.set("status", params.status);
    if (params?.mode && params.mode !== "all") query.set("mode", params.mode);
    const qs = query.toString();
    const endpoint = `/tenants${qs ? `?${qs}` : ""}`;
    const res = await realBackendFetch<{ tenants: TenantInfo[]; count: number }>(endpoint);
    return Array.isArray(res?.tenants) ? res.tenants : [];
  } catch {
    return [];
  }
}

export async function checkSubdomainAvailability(subdomain: string): Promise<{
  available: boolean;
  subdomain: string;
  reason?: string;
}> {
  return realBackendFetch(`/tenants/check-availability?subdomain=${encodeURIComponent(subdomain)}`);
}

export async function validateInvitation(token: string): Promise<TenantInvitationInfo> {
  return realBackendFetch<TenantInvitationInfo>(`/tenants/invitations/${encodeURIComponent(token)}`);
}

export async function acceptInvitation(payload: {
  token: string;
  name: string;
  password: string;
  phoneNumber?: string;
}): Promise<{ message: string; member: any }> {
  return realBackendFetch("/tenants/invitations/accept", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createInvitation(
  tenantIdentifier: string,
  payload: { email: string; role: string; expiresDays?: number },
): Promise<{ message: string; invitation: any; inviteUrl: string }> {
  return realBackendFetch(`/tenants/${encodeURIComponent(tenantIdentifier)}/invitations`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function recruitTenantMember(
  tenantIdentifier: string,
  payload: {
    name: string;
    email: string;
    password: string;
    role: string;
    phoneNumber?: string;
    canCreate?: boolean;
    canRead?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
  },
): Promise<{ message: string; member: any }> {
  return realBackendFetch(`/tenants/${encodeURIComponent(tenantIdentifier)}/members`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listTenantMembers(
  tenantIdentifier: string,
  roleFilter?: string,
): Promise<{ members: any[]; count: number }> {
  try {
    const qs = roleFilter ? `?role=${encodeURIComponent(roleFilter)}` : "";
    return await realBackendFetch(`/tenants/${encodeURIComponent(tenantIdentifier)}/members${qs}`);
  } catch {
    return { members: [], count: 0 };
  }
}

export async function createTenant(
  payload: CreateTenantPayload,
): Promise<{ message: string; tenant: TenantInfo }> {
  return realBackendFetch("/tenants", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTenant(
  id: string,
  payload: UpdateTenantPayload,
): Promise<{ message: string; tenant: TenantInfo }> {
  return realBackendFetch(`/tenants/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getTenant(identifier: string): Promise<{ tenant: TenantInfo }> {
  return realBackendFetch(`/tenants/${encodeURIComponent(identifier)}`);
}

export async function listTenantInvitations(
  tenantIdentifier: string,
): Promise<TenantInvitationInfo[]> {
  try {
    const res = await realBackendFetch<{ invitations: TenantInvitationInfo[] }>(
      `/tenants/${encodeURIComponent(tenantIdentifier)}/invitations`,
    );
    return Array.isArray(res?.invitations) ? res.invitations : [];
  } catch {
    return [];
  }
}

export async function revokeTenantInvitation(
  tenantIdentifier: string,
  invitationId: string,
): Promise<{ message: string }> {
  return realBackendFetch(
    `/tenants/${encodeURIComponent(tenantIdentifier)}/invitations/${encodeURIComponent(invitationId)}`,
    {
      method: "DELETE",
    },
  );
}

export async function fetchRbacRoles(): Promise<RbacRoleInfo[]> {
  const res = await realBackendFetch<{ roles: RbacRoleInfo[]; count: number }>("/rbac/roles");
  return Array.isArray(res?.roles) ? res.roles : [];
}

export async function fetchRbacPermissions(): Promise<RbacPermissionsCatalogResponse> {
  const res = await realBackendFetch<RbacPermissionsCatalogResponse>("/rbac/permissions");
  return {
    permissions: Array.isArray(res?.permissions) ? res.permissions : [],
    byModule: res?.byModule || {},
    total: res?.total || 0,
  };
}

export async function fetchRbacMe(): Promise<RbacMeInfo> {
  return realBackendFetch<RbacMeInfo>("/rbac/me");
}
