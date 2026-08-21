/**
 * Permission catalog — `module:action`.
 * Actions: view | encode | approve | disburse | configure
 * This file is the single source of truth; the seed writes it into the DB.
 */

export const ACTIONS = ["view", "encode", "approve", "disburse", "configure"] as const;
export type Action = (typeof ACTIONS)[number];

export const MODULES = {
  // Group A — LGUSS-BIMS parity
  inhabitants: "A1 Inhabitant Profiling (BIPS)",
  issuance: "A2 Issuance Management (BCIS)",
  kp: "A3 Katarungang Pambarangay & Blotter (KPISBH)",
  vawc: "A3 VAWC/VAC restricted track",
  property: "A4 Property & Asset Management (BAMS)",
  disaster: "A5 Disaster Resilience (BDRIS)",
  gad: "A6 GAD Plan & Budget (BGADPBMS)",
  legislation: "A7 Ordinances & Resolutions (BORIS)",
  devplan: "A8 Barangay Development Plan (BDP)",
  institutions: "A9 Barangay-Based Institutions (BBI)",
  finance: "A10 Financial Management (BFMS-style)",
  website: "A11 Public Website + CMS",
  reports: "A12 Report Management",
  admin: "A13 Platform administration",
  // Group B — CBMS whitespace
  wallet: "B1 Barangay E-Wallet",
  ai: "B2 AI Agentic Layer",
  concerns: "B3 Report a Concern (311)",
  sos: "B3 Panic / SOS",
  announcements: "B3 Announcements & alerts",
  appointments: "B3 Appointments & queue",
  feedback: "B3 Citizen feedback (CSM)",
  health: "B3 Resident health services",
  livelihood: "B3 Livelihood & jobs",
  participation: "B3 Participatory budgeting & assembly",
} as const;

export type ModuleKey = keyof typeof MODULES;

export type PermissionKey = `${ModuleKey}:${Action}`;

export function permission(module: ModuleKey, action: Action): PermissionKey {
  return `${module}:${action}`;
}

/** Every permission that exists in the system. */
export const ALL_PERMISSIONS: PermissionKey[] = (
  Object.keys(MODULES) as ModuleKey[]
).flatMap((m) => ACTIONS.map((a) => permission(m, a)));

const ALL = (m: ModuleKey): PermissionKey[] => ACTIONS.map((a) => permission(m, a));
const VIEW_ENCODE = (m: ModuleKey): PermissionKey[] => [
  permission(m, "view"),
  permission(m, "encode"),
];
const VIEW = (m: ModuleKey): PermissionKey[] => [permission(m, "view")];

/**
 * Role → permission grants.
 * Keys match the RoleKey enum in the Prisma schema.
 */
export const ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  SYSTEM_ADMIN: ALL_PERMISSIONS,

  LGU_ADMIN: [
    ...VIEW("inhabitants"),
    ...VIEW("issuance"),
    ...VIEW("kp"),
    ...VIEW("property"),
    ...VIEW("disaster"),
    ...VIEW("gad"),
    ...VIEW("legislation"),
    ...VIEW("devplan"),
    ...VIEW("institutions"),
    ...VIEW("finance"),
    ...VIEW("wallet"),
    ...VIEW("concerns"),
    ...VIEW("feedback"),
    ...ALL("reports"),
    permission("admin", "view"),
    permission("admin", "approve"), // approves barangay onboarding
    permission("admin", "configure"),
    permission("ai", "view"),
  ],

  PUNONG_BARANGAY: [
    ...VIEW_ENCODE("inhabitants"),
    ...ALL("issuance"),
    ...ALL("kp"),
    ...VIEW("vawc"), // PB may see VAWC cases
    ...VIEW_ENCODE("property"),
    ...ALL("disaster"),
    ...ALL("gad"),
    ...ALL("legislation"),
    ...ALL("devplan"),
    ...ALL("institutions"),
    ...VIEW("finance"),
    permission("finance", "approve"),
    ...ALL("website"),
    ...ALL("reports"),
    permission("admin", "view"),
    permission("admin", "configure"),
    // Wallet: approves batches but does not prepare them (maker–checker).
    permission("wallet", "view"),
    permission("wallet", "approve"),
    ...ALL("announcements"),
    ...VIEW("concerns"),
    permission("concerns", "approve"),
    ...VIEW("sos"),
    ...VIEW("appointments"),
    ...VIEW("feedback"),
    ...VIEW("health"),
    ...VIEW("livelihood"),
    ...ALL("participation"),
    permission("ai", "view"),
    permission("ai", "approve"),
  ],

  BARANGAY_SECRETARY: [
    ...VIEW_ENCODE("inhabitants"),
    ...VIEW_ENCODE("issuance"),
    ...VIEW_ENCODE("kp"),
    ...VIEW_ENCODE("property"),
    ...VIEW_ENCODE("disaster"),
    ...VIEW_ENCODE("legislation"),
    ...VIEW_ENCODE("institutions"),
    ...VIEW_ENCODE("website"),
    ...VIEW_ENCODE("devplan"),
    ...VIEW_ENCODE("gad"),
    ...VIEW("finance"),
    ...ALL("reports"),
    ...VIEW_ENCODE("announcements"),
    ...VIEW_ENCODE("concerns"),
    ...VIEW_ENCODE("appointments"),
    ...VIEW("feedback"),
    ...VIEW_ENCODE("participation"),
    permission("admin", "view"),
    permission("ai", "view"),
  ],

  BARANGAY_TREASURER: [
    ...VIEW("inhabitants"),
    ...VIEW("issuance"),
    ...VIEW_ENCODE("property"),
    ...ALL("finance"),
    // Prepares disbursement batches; PB approves.
    permission("wallet", "view"),
    permission("wallet", "encode"),
    permission("wallet", "disburse"),
    ...ALL("reports"),
    permission("ai", "view"),
  ],

  SB_MEMBER: [
    ...VIEW("inhabitants"),
    ...VIEW_ENCODE("legislation"),
    ...VIEW("devplan"),
    ...VIEW("gad"),
    ...VIEW("finance"),
    ...VIEW("reports"),
    ...VIEW("concerns"),
    ...VIEW("participation"),
  ],

  SK_OFFICIAL: [
    ...VIEW("inhabitants"),
    ...VIEW("finance"),
    ...VIEW("devplan"),
    ...VIEW_ENCODE("livelihood"),
    ...VIEW_ENCODE("participation"),
    ...VIEW("reports"),
  ],

  LUPON_SECRETARY: [
    ...VIEW("inhabitants"),
    ...ALL("kp"),
    ...VIEW("reports"),
    permission("ai", "view"),
  ],

  VAW_DESK_OFFICER: [
    ...VIEW("inhabitants"),
    ...VIEW_ENCODE("kp"),
    ...ALL("vawc"), // the only role besides PB with VAWC access
    ...VIEW("reports"),
  ],

  BHW: [
    ...VIEW("inhabitants"),
    ...ALL("health"),
    ...VIEW("disaster"),
    ...VIEW_ENCODE("concerns"),
    ...VIEW("reports"),
  ],

  TANOD: [
    ...VIEW("inhabitants"),
    ...VIEW_ENCODE("kp"), // blotter intake
    ...ALL("sos"),
    ...VIEW_ENCODE("disaster"),
    ...VIEW_ENCODE("concerns"),
  ],

  RESIDENT: [
    permission("issuance", "view"),
    permission("issuance", "encode"), // submit own request
    permission("wallet", "view"),
    permission("concerns", "view"),
    permission("concerns", "encode"),
    permission("sos", "encode"),
    permission("appointments", "view"),
    permission("appointments", "encode"),
    permission("feedback", "encode"),
    permission("health", "view"),
    permission("health", "encode"),
    permission("livelihood", "view"),
    permission("livelihood", "encode"),
    permission("participation", "view"),
    permission("participation", "encode"),
    permission("announcements", "view"),
    permission("ai", "view"),
  ],

  AGENT_MERCHANT: [
    permission("wallet", "view"),
    permission("wallet", "encode"), // cash-in/out, accept QR
  ],

  DILG_VIEWER: [
    // Aggregates only — enforced additionally by TenantScope.aggregatesOnly.
    permission("reports", "view"),
    permission("inhabitants", "view"),
    permission("issuance", "view"),
    permission("finance", "view"),
    permission("wallet", "view"),
  ],
};

/** Roles that must pass MFA. */
export const STAFF_ROLES = [
  "SYSTEM_ADMIN",
  "LGU_ADMIN",
  "PUNONG_BARANGAY",
  "BARANGAY_SECRETARY",
  "BARANGAY_TREASURER",
  "SB_MEMBER",
  "SK_OFFICIAL",
  "LUPON_SECRETARY",
  "VAW_DESK_OFFICER",
  "BHW",
  "TANOD",
  "DILG_VIEWER",
] as const;

export const ROLE_SCOPE: Record<string, string> = {
  SYSTEM_ADMIN: "platform",
  LGU_ADMIN: "city",
  PUNONG_BARANGAY: "barangay",
  BARANGAY_SECRETARY: "barangay",
  BARANGAY_TREASURER: "barangay",
  SB_MEMBER: "barangay",
  SK_OFFICIAL: "barangay",
  LUPON_SECRETARY: "barangay",
  VAW_DESK_OFFICER: "barangay",
  BHW: "barangay",
  TANOD: "barangay",
  RESIDENT: "self",
  AGENT_MERCHANT: "barangay",
  DILG_VIEWER: "region",
};

export const ROLE_LABELS: Record<string, string> = {
  SYSTEM_ADMIN: "System Administrator",
  LGU_ADMIN: "LGU Administrator",
  PUNONG_BARANGAY: "Punong Barangay",
  BARANGAY_SECRETARY: "Barangay Secretary",
  BARANGAY_TREASURER: "Barangay Treasurer",
  SB_MEMBER: "Sangguniang Barangay Member",
  SK_OFFICIAL: "SK Official",
  LUPON_SECRETARY: "Lupon Secretary",
  VAW_DESK_OFFICER: "VAW Desk Officer",
  BHW: "Barangay Health Worker",
  TANOD: "Barangay Tanod / Responder",
  RESIDENT: "Resident",
  AGENT_MERCHANT: "Agent / Merchant",
  DILG_VIEWER: "DILG Viewer",
};
