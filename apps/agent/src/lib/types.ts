/**
 * Shapes returned by the CBMS API (apps/api). Money fields arrive as STRINGS
 * because the API serialises Prisma BigInt centavos with `String(bigint)` —
 * always render them through `peso()` from @cbms/ui, never with Number maths.
 */

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** GET /wallets — note the API only `select`s `outletName` off the agent relation. */
export interface WalletRow {
  id: string;
  barangayId: string;
  ownerType: "resident" | "merchant" | "agent" | "treasury" | string;
  inhabitantId: string | null;
  emiAccountRef: string;
  kycTier: string;
  status: string;
  balanceCentavos: string;
  createdAt: string;
  updatedAt: string;
  inhabitant: { firstName: string; lastName: string; philsysNo: string | null } | null;
  merchant: { businessName: string } | null;
  agent: { outletName: string } | null;
}

/** GET /wallet/transactions */
export interface TxnRow {
  id: string;
  barangayId: string;
  type: string;
  status: string;
  fromWalletId: string | null;
  toWalletId: string | null;
  amountCentavos: string;
  feeCentavos: string;
  currency: string;
  reference: string;
  description: string | null;
  emiTxnRef: string | null;
  agentId: string | null;
  merchantId: string | null;
  completedAt: string | null;
  createdAt: string;
  agent: { outletName: string } | null;
  merchant: { businessName: string } | null;
}

/** GET /inhabitants */
export interface InhabitantRow {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  sex: string;
  birthDate: string | null;
  philsysNo: string | null;
  contactPhone: string | null;
  isSenior: boolean;
  isPwd: boolean;
  is4Ps: boolean;
  isSoloParent: boolean;
  isDeceased: boolean;
  household: { householdNo: string; purok: string | null; addressLine: string | null } | null;
}

/** POST /wallet/cash-out */
export interface CashOutResponse {
  ok: boolean;
  lowFloatAlert?: boolean;
}
