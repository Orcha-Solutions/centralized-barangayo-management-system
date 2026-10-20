export interface StatutoryFees {
  clearance?: number;
  residency?: number;
  businessClearance?: number;
}

export interface BarangaySettings {
  hallAddress?: string;
  hallPhone?: string;
  emergencyHotline?: string;
  purokCount?: number;
  statutoryFees?: StatutoryFees;
  pilot?: boolean;
  timezone?: string;
  [key: string]: any;
}

export function parseTenantSettings(raw: any): BarangaySettings {
  if (!raw) return {};
  if (typeof raw === "object") return raw as BarangaySettings;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as BarangaySettings;
    } catch {
      return {};
    }
  }
  return {};
}
