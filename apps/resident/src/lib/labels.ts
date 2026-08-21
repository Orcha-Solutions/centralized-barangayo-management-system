import type { ChipTone } from "@cbms/ui";
import type { TKey } from "@/i18n";

/** Certificate-request lifecycle → dictionary key + chip colour. */
export const REQUEST_STATUS: Record<string, { key: TKey; tone: ChipTone }> = {
  draft: { key: "st_draft", tone: "gray" },
  submitted: { key: "st_submitted", tone: "blue" },
  awaiting_payment: { key: "st_awaiting_payment", tone: "gold" },
  paid: { key: "st_paid", tone: "green" },
  for_approval: { key: "st_for_approval", tone: "gold" },
  approved: { key: "st_approved", tone: "green" },
  released: { key: "st_released", tone: "green" },
  rejected: { key: "st_rejected", tone: "red" },
  cancelled: { key: "st_cancelled", tone: "gray" },
};

/** The happy path a resident's request walks through. */
export const REQUEST_TIMELINE = [
  "submitted",
  "awaiting_payment",
  "for_approval",
  "released",
] as const;

export const CONCERN_STATUS: Record<string, { key: TKey; tone: ChipTone }> = {
  submitted: { key: "st_submitted", tone: "blue" },
  acknowledged: { key: "st_approved", tone: "blue" },
  in_progress: { key: "st_for_approval", tone: "gold" },
  resolved: { key: "st_released", tone: "green" },
  rejected: { key: "st_rejected", tone: "red" },
};

export interface Choice {
  value: string;
  key: TKey;
  icon: string;
}

export const CONCERN_CATEGORIES: Choice[] = [
  { value: "streetlight", key: "cat_streetlight", icon: "💡" },
  { value: "flooding", key: "cat_flooding", icon: "🌊" },
  { value: "garbage", key: "cat_garbage", icon: "🗑️" },
  { value: "pothole", key: "cat_pothole", icon: "🕳️" },
  { value: "noise", key: "cat_noise", icon: "🔊" },
  { value: "stray_animal", key: "cat_stray_animal", icon: "🐕" },
  { value: "other", key: "cat_other", icon: "❓" },
];

export const SOS_KINDS: Choice[] = [
  { value: "medical", key: "kind_medical", icon: "🚑" },
  { value: "fire", key: "kind_fire", icon: "🔥" },
  { value: "crime", key: "kind_crime", icon: "🚨" },
  { value: "flood", key: "kind_flood", icon: "🌊" },
];

export const APPOINTMENT_STATUS: Record<string, { key: TKey; tone: ChipTone }> = {
  booked: { key: "appt_st_booked", tone: "blue" },
  checked_in: { key: "appt_st_checked_in", tone: "blue" },
  serving: { key: "appt_st_serving", tone: "gold" },
  completed: { key: "appt_st_completed", tone: "green" },
  no_show: { key: "appt_st_no_show", tone: "red" },
  cancelled: { key: "appt_st_cancelled", tone: "gray" },
};

export const APPOINTMENT_SERVICES: Choice[] = [
  { value: "certificate", key: "appt_svc_certificate", icon: "📄" },
  { value: "kp_hearing", key: "appt_svc_kp_hearing", icon: "⚖️" },
  { value: "health", key: "appt_svc_health", icon: "🩺" },
  { value: "general", key: "appt_svc_general", icon: "💬" },
];

export const TXN_TYPE: Record<string, TKey> = {
  disbursement: "txn_disbursement",
  fee_collection: "txn_fee_collection",
  bill_payment: "txn_bill_payment",
  merchant_payment: "txn_merchant_payment",
  p2p_transfer: "txn_p2p_transfer",
  cash_in: "txn_cash_in",
  cash_out: "txn_cash_out",
  reversal: "txn_reversal",
  adjustment: "txn_adjustment",
};

export const TXN_STATUS: Record<string, TKey> = {
  pending: "txn_pending",
  failed: "txn_failed",
  reversed: "txn_reversed",
};

export const WALLET_STATUS: Record<string, TKey> = {
  active: "wallet_st_active",
  frozen: "wallet_st_frozen",
  closed: "wallet_st_closed",
};

export const KYC_TIER: Record<string, TKey> = {
  tier1: "kyc_tier1",
  tier2: "kyc_tier2",
};

export const JOB_KINDS: Record<string, TKey> = {
  job: "jobs_kind_job",
  training: "jobs_kind_training",
  scholarship: "jobs_kind_scholarship",
};

export const FEEDBACK_STARS: Array<{ rating: number; key: TKey }> = [
  { rating: 1, key: "fb_star_1" },
  { rating: 2, key: "fb_star_2" },
  { rating: 3, key: "fb_star_3" },
  { rating: 4, key: "fb_star_4" },
  { rating: 5, key: "fb_star_5" },
];

/** Announcement severity → the `cbms-alert--*` modifier. */
export function severityTone(severity: string): "info" | "warn" | "danger" {
  if (severity === "critical") return "danger";
  if (severity === "warning") return "warn";
  return "info";
}
