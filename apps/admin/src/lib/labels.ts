/** Display labels + option lists mirroring the API enums. */

export const ROLE_LABELS: Record<string, string> = {
  SYSTEM_ADMIN: "System Administrator",
  LGU_ADMIN: "LGU Administrator",
  PUNONG_BARANGAY: "Punong Barangay",
  BARANGAY_SECRETARY: "Barangay Secretary",
  BARANGAY_TREASURER: "Barangay Treasurer",
  BDC_OFFICER: "BDC Chairperson",
  BDRRMC_OFFICER: "BDRRMC Officer",
  BADAC_OFFICER: "BADAC Officer",
  SB_MEMBER: "Sangguniang Barangay Member",
  SK_OFFICIAL: "SK Official",
  LUPON_SECRETARY: "Lupon Secretary",
  VAW_DESK_OFFICER: "VAW Desk Officer",
  BHW: "Barangay Health Worker",
  TANOD: "Barangay Tanod / Responder",
  RESIDENT: "Resident",
  AGENT_MERCHANT: "Agent / Merchant",
  DILG_VIEWER: "DILG Viewer",
  IT_OFFICER: "IT Officer / Systems Auditor",
};

export function roleLabel(roles: string[] | undefined): string {
  if (!roles?.length) return "—";
  return roles.map((r) => ROLE_LABELS[r] ?? r).join(", ");
}

export const CONSENT_PURPOSES = [
  "SERVICE_DELIVERY",
  "DISBURSEMENT",
  "BIMS_SHARING",
  "HEALTH_PROGRAM",
  "ANALYTICS",
] as const;

export const CONSENT_PURPOSE_HINTS: Record<string, string> = {
  SERVICE_DELIVERY: "Processing certificates, clearances and front-line requests.",
  DISBURSEMENT: "Required before ayuda / cash aid may be paid to this household (RA 10173).",
  BIMS_SHARING: "Sharing the record with DILG LGUSS-BIMS as the system of record.",
  HEALTH_PROGRAM: "Health campaigns, immunisation and BHW cohort lists.",
  ANALYTICS: "De-identified planning statistics and the LGU scorecard.",
};

export const CERT_STATUSES = [
  "draft",
  "submitted",
  "awaiting_payment",
  "paid",
  "for_approval",
  "approved",
  "released",
  "rejected",
  "cancelled",
] as const;

export const KP_STAGES = [
  "filed",
  "mediation",
  "conciliation",
  "settled",
  "repudiated",
  "cfa_issued",
  "dismissed",
  "withdrawn",
] as const;

export const KP_ADVANCE_STAGES = [
  { value: "mediation", label: "Mediation (Punong Barangay)" },
  { value: "conciliation", label: "Conciliation (Pangkat ng Tagapagkasundo)" },
  { value: "settled", label: "Settled — amicable settlement" },
  { value: "repudiated", label: "Repudiated" },
  { value: "cfa_issued", label: "Certificate to File Action (CFA)" },
  { value: "dismissed", label: "Dismissed" },
  { value: "withdrawn", label: "Withdrawn" },
] as const;

export const BLOTTER_CATEGORIES = [
  "dispute",
  "theft",
  "physical_injury",
  "noise",
  "vandalism",
  "vawc",
  "drugs",
  "traffic",
  "other",
] as const;

export const CONCERN_CATEGORIES = [
  "streetlight",
  "flooding",
  "garbage",
  "pothole",
  "noise",
  "stray_animal",
  "other",
] as const;

export const CONCERN_STATUSES = [
  "submitted",
  "acknowledged",
  "in_progress",
  "resolved",
  "rejected",
] as const;

export const SECTORS = [
  { value: "senior", label: "Senior citizen" },
  { value: "pwd", label: "Person with disability" },
  { value: "solo_parent", label: "Solo parent" },
  { value: "4ps", label: "4Ps beneficiary" },
  { value: "indigenous", label: "Indigenous people" },
  { value: "pregnant", label: "Pregnant" },
  { value: "bedridden", label: "Bedridden" },
] as const;

export const FUNDS = ["general", "sk", "gad", "disaster", "trust"] as const;

export const BATCH_KINDS = [
  { value: "payroll_honoraria", label: "Payroll / honoraria" },
  { value: "allowance_stipend", label: "Allowance / stipend" },
  { value: "ayuda_social", label: "Ayuda / social assistance" },
] as const;

export const PROPERTY_TYPES = ["infrastructure", "non_infrastructure"] as const;
export const PROPERTY_STATUSES = [
  "operational",
  "under_construction",
  "unserviceable",
  "closed",
] as const;

export const LEGISLATION_KINDS = ["ordinance", "resolution", "executive_order"] as const;
export const LEGISLATION_STATUSES = [
  "draft",
  "enacted",
  "vetoed",
  "amended",
  "repealed",
] as const;

export const PROJECT_STATUSES = [
  "proposed",
  "approved",
  "ongoing",
  "completed",
  "deferred",
] as const;

export const APPOINTMENT_STATUSES = [
  "booked",
  "checked_in",
  "serving",
  "completed",
  "no_show",
  "cancelled",
] as const;

export const TICKET_STATUSES = [
  "open",
  "in_progress",
  "escalated",
  "resolved",
  "closed",
] as const;

export const DISASTER_STATUSES = ["monitoring", "active", "recovery", "closed"] as const;

export const SOS_KIND_ICON: Record<string, string> = {
  medical: "🚑",
  fire: "🔥",
  crime: "🚔",
  flood: "🌊",
};

export const TXN_TYPES = [
  "disbursement",
  "fee_collection",
  "bill_payment",
  "merchant_payment",
  "p2p_transfer",
  "cash_in",
  "cash_out",
  "reversal",
  "adjustment",
] as const;
