export interface SessionUser {
  id: string;
  fullName: string;
  name?: string;
  email: string | null;
  role?: string;
  roles: string[];
  scope: string;
  permissions: string[];
  isActive?: boolean;
  canCreate?: boolean;
  canRead?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  tenantId?: string | null;
  barangayId?: string | null;
  cityId?: string | null;
  inhabitantId?: string | null;
  barangay?: { id: string; name: string; code?: string; mode?: string } | null;
  city?: { id: string; name: string } | null;
}

export class ApiError extends Error {
  status: number;
  body: any;
  constructor(status: number, body: any) {
    super(body?.message ?? body?.error ?? `Request failed (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export interface TenantInfo {
  id: string;
  code: string;
  name: string;
  subdomain: string;
  customDomain?: string | null;
  barangayId: string;
  cityId: string;
  psgcCode?: string | null;
  mode: "shared_db" | "isolated_schema" | "dedicated_db" | string;
  status: "active" | "suspended" | "provisioning" | string;
  schemaName?: string;
  settings?: string | Record<string, any>;
  barangay?: {
    id: string;
    code: string;
    name: string;
    cityId: string;
    psgcCode?: string;
  } | null;
}

export interface TenantInvitationInfo {
  id: string;
  tenantId: string;
  tenantName: string;
  barangayId: string;
  barangayName: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  isValid: boolean;
  message?: string;
}

export interface CreateTenantPayload {
  name: string;
  code: string;
  subdomain: string;
  customDomain?: string;
  cityId: string;
  psgcCode?: string;
  mode?: "shared_db" | "isolated_schema" | "dedicated_db";
  settings?: Record<string, any>;
}

export interface UpdateTenantPayload {
  name?: string;
  customDomain?: string;
  status?: "active" | "suspended" | "provisioning";
  mode?: "shared_db" | "isolated_schema" | "dedicated_db";
  settings?: Record<string, any>;
}

export interface RbacRoleInfo {
  role: string;
  title: string;
  scope: "platform" | "city" | "barangay" | "self" | string;
  description: string;
  permissions: string[];
  requiresMfa: boolean;
}

export interface RbacPermissionInfo {
  key: string;
  module: string;
  action: string;
  description: string;
}

export interface RbacPermissionsCatalogResponse {
  permissions: RbacPermissionInfo[];
  byModule: Record<string, RbacPermissionInfo[]>;
  total: number;
}

export interface RbacMeInfo {
  userId: string;
  name: string;
  email: string;
  role: string;
  roleTitle: string;
  scope: string;
  tenantId: string;
  barangayId: string;
  cityId: string;
  permissions: string[];
  totalPerms: number;
}
