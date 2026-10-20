import type { TenantInfo } from "@cbms/api-client";

export type DbMode = "shared_db" | "isolated_schema" | "dedicated_db";
export type LeadershipMode = "both" | "direct" | "invite";

export interface ProvisionedDossier {
  tenant: TenantInfo;
  primaryMember?: {
    name: string;
    email: string;
    role: string;
    tempPassword?: string;
  };
  inviteLink?: string;
  inviteEmail?: string;
  inviteRole?: string;
}

export interface SubdomainAvailability {
  available: boolean;
  subdomain: string;
  reason?: string;
}
