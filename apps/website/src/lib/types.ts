/**
 * Response shapes for the four PUBLIC (unauthenticated) API endpoints this
 * site consumes. Kept hand-written so the build never depends on the API.
 *
 * Money note: Prisma `Decimal` columns are serialised by the API as decimal
 * STRINGS in pesos (e.g. "200", "18500000") — not centavos. Render them with
 * `pesoAmount()` from @cbms/ui, never `peso()`.
 */

export interface PublicBarangayCard {
  id: string;
  name: string;
  psgcCode: string;
  logoUrl: string | null;
  brandPrimary: string | null;
  brandAccent: string | null;
  city: { name: string } | null;
}

export interface PublicBarangayList {
  items: PublicBarangayCard[];
}

export interface PublicBarangayProfile {
  id: string;
  name: string;
  psgcCode: string;
  addressLine: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  hotline: string | null;
  logoUrl: string | null;
  brandPrimary: string | null;
  brandAccent: string | null;
  /** "companion" (alongside LGUSS-BIMS) | "standalone" */
  mode: string | null;
  city: { name: string } | null;
}

export interface SitePage {
  id: string;
  slug: string;
  title: string;
  body: string;
  sortOrder: number;
  updatedAt: string | null;
}

export interface SitePost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  coverUrl: string | null;
  publishedAt: string | null;
  createdAt: string | null;
}

export interface PublicLegislation {
  kind: string;
  number: string;
  series: number;
  title: string;
  enactedAt: string | null;
}

export interface PublicOfficial {
  position: string;
  name: string | null;
}

export interface PublicFee {
  name: string;
  /** Decimal string in PESOS. */
  fee: string | number | null;
  requirements: string[];
  exemptNote: string | null;
  validityDays: number | null;
}

export interface PublicProject {
  title: string;
  sector: string;
  /** Decimal string in PESOS. */
  budget: string | number | null;
  status: string;
  progressPct: number;
  targetYear: number;
}

export interface PublicBudgetLine {
  id: string;
  expenseClass: string;
  accountCode: string;
  description: string;
  amount: string | number | null;
  obligated: string | number | null;
  disbursed: string | number | null;
}

export interface PublicBudget {
  id: string;
  year: number;
  totalAmount: string | number | null;
  skFundAmount: string | number | null;
  status: string;
  lines: PublicBudgetLine[];
}

export interface PublicBarangaySite {
  barangay: PublicBarangayProfile;
  pages: SitePage[];
  posts: SitePost[];
  ordinances: PublicLegislation[];
  officials: PublicOfficial[];
  transparency: {
    fees: PublicFee[];
    projects: PublicProject[];
    budget: PublicBudget | null;
  };
  notice: string;
}

export interface ConcernMapRow {
  purok: string | null;
  category: string;
  status: string;
  count: number;
}

export interface ConcernMap {
  items: ConcernMapRow[];
}

/** GET /verify/:code — 200 when a released certificate matched. */
export interface VerifyHit {
  valid: boolean;
  expired: boolean;
  certificate: string;
  referenceNo: string;
  /** Initials only, e.g. "K. S." — the API never exposes the full name here. */
  issuedTo: string;
  barangay: string;
  city: string;
  issuedAt: string | null;
  expiresAt: string | null;
}

/** GET /verify/:code — 404 when nothing matched. */
export interface VerifyMiss {
  valid: false;
  message: string;
}

export type VerifyResult =
  | { kind: "hit"; data: VerifyHit }
  | { kind: "miss"; message: string }
  | { kind: "unavailable"; message: string };
