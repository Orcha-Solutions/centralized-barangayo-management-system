/** Response shapes returned by the CBMS API endpoints this app consumes. */

/** One row of GET /hub/scorecard — a single barangay's adoption metrics. */
export interface ScorecardRow {
  barangayId: string;
  name: string;
  psgcCode: string;
  /** BarangayStatus: pending | active | suspended */
  status: string;
  /** TenantMode: companion | standalone */
  mode: string;
  population: number;
  registeredWallets: number;
  /** Percentage of the adult proxy population, e.g. 82.4 */
  registrationRate: number;
  merchants: number;
  cashPoints: number;
  transactions30d: number;
  /** Centavos as a string — render with peso(). */
  volume30dCentavos: string;
  certificates: number;
  satisfaction: number;
}

export interface ScorecardTotals {
  population: number;
  registeredWallets: number;
  merchants: number;
  transactions30d: number;
  certificates: number;
}

export interface ScorecardTargets {
  registrationRate: string;
  activeRate: string;
  merchants: string;
  cashPointCoverage: string;
}

/** GET /hub/scorecard */
export interface HubScorecard {
  scope: string;
  barangayCount: number;
  totals: ScorecardTotals;
  targets: ScorecardTargets;
  rows: ScorecardRow[];
}

/** GET /reports/quarterly */
export interface QuarterlyReport {
  /** e.g. "2026-Q3" */
  period: string;
  barangaysCovered: number;
  registeredInhabitants: number;
  certificatesIssued: number;
  kpCasesFiled: number;
  concernsReceived: number;
  disbursementCount: number;
  /** Centavos as a string — render with peso(). */
  disbursementTotalCentavos: string;
  csmResponses: number;
  csmAverage: number;
  note: string;
}

/** Base URL of the public barangay website app. */
export const PUBLIC_SITE_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_PUBLIC_SITE_URL) ||
  "http://localhost:4104";

export function publicSiteFor(psgcCode: string): string {
  return `${PUBLIC_SITE_URL}/b/${psgcCode}`;
}

/** Colour band for an adoption rate: green >= 80, gold 50-79, red < 50. */
export function rateTone(rate: number): "green" | "gold" | "red" {
  if (rate >= 80) return "green";
  if (rate >= 50) return "gold";
  return "red";
}
