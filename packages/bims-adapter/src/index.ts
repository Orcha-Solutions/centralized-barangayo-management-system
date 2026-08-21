/**
 * §6 — LGUSS-BIMS adapter.
 *
 * IMPORTANT: DILG MC No. 2025-104 publishes no external API for LGUSS-BIMS, and §4.3.4
 * limits sharing of inhabitant data to authorized parties holding signed household consent.
 * This module is therefore a MOCK with a real seam. A production implementation requires a
 * DILG data-sharing agreement; until then CBMS runs `standalone` or mirrors nothing.
 *
 * Invariant in companion mode: **BIMS wins.** We never write over a BIMS-sourced record.
 */

export type BimsDataset = "inhabitants" | "issuances" | "properties" | "kp_cases";

export interface BimsInhabitant {
  bimsRef: string;
  householdNo: string;
  purok?: string;
  addressLine?: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  suffix?: string;
  relationToHead?: string;
  sex: "male" | "female";
  birthDate: string;
  birthPlace?: string;
  civilStatus?: string;
  citizenship?: string;
  occupation?: string;
  educationLevel?: string;
  philsysNo?: string;
  isSenior?: boolean;
  isPwd?: boolean;
  isSoloParent?: boolean;
  is4Ps?: boolean;
  isIndigenous?: boolean;
  isVoter?: boolean;
  updatedAt: string;
}

export interface BimsIssuance {
  bimsRef: string;
  certificateCode: string;
  issuedTo: string;
  issuedAt: string;
  orNumber?: string;
}

export interface PullResult<T> {
  dataset: BimsDataset;
  rows: T[];
  /** Rows whose BIMS copy differs from ours — BIMS is authoritative; we surface, never overwrite. */
  conflicts: Array<{ bimsRef: string; field: string; ours: unknown; theirs: unknown }>;
  pulledAt: Date;
}

export interface ReconVoucher {
  barangayPsgc: string;
  period: string;
  totalCollectedCentavos: string;
  totalDisbursedCentavos: string;
  note: string;
}

export interface BimsGateway {
  readonly name: string;
  readonly isMock: boolean;
  /** True only when a DILG data-sharing agreement is configured for this tenant. */
  isAuthorized(barangayPsgc: string): Promise<boolean>;

  pullInhabitants(barangayPsgc: string, since?: Date): Promise<PullResult<BimsInhabitant>>;
  pullIssuances(barangayPsgc: string, since?: Date): Promise<PullResult<BimsIssuance>>;
  /** Push a reconciliation summary only — never personal data. */
  pushReconVoucher(voucher: ReconVoucher): Promise<{ accepted: boolean; ref: string }>;
  /** Produce RBI rows in the BIMS Form B shape for manual handover. */
  exportRbiForms(rows: BimsInhabitant[]): Promise<string>;
}

export class MockBimsGateway implements BimsGateway {
  readonly name = "LGUSS-BIMS (mock adapter)";
  readonly isMock = true;

  async isAuthorized(): Promise<boolean> {
    // No live interface exists. Always false until a DILG MOA is in place.
    return false;
  }

  async pullInhabitants(
    barangayPsgc: string,
    _since?: Date,
  ): Promise<PullResult<BimsInhabitant>> {
    return {
      dataset: "inhabitants",
      rows: [],
      conflicts: [],
      pulledAt: new Date(),
    };
  }

  async pullIssuances(): Promise<PullResult<BimsIssuance>> {
    return { dataset: "issuances", rows: [], conflicts: [], pulledAt: new Date() };
  }

  async pushReconVoucher(voucher: ReconVoucher) {
    return {
      accepted: false,
      ref: `MOCK-NOT-SENT-${voucher.period}`,
    };
  }

  async exportRbiForms(rows: BimsInhabitant[]): Promise<string> {
    const header = [
      "HOUSEHOLD_NO", "PUROK", "ADDRESS", "LAST_NAME", "FIRST_NAME", "MIDDLE_NAME",
      "SUFFIX", "RELATION_TO_HEAD", "SEX", "BIRTH_DATE", "BIRTH_PLACE", "CIVIL_STATUS",
      "CITIZENSHIP", "OCCUPATION", "EDUCATION", "PHILSYS_NO",
      "SENIOR", "PWD", "SOLO_PARENT", "FOUR_PS", "IP", "VOTER",
    ];
    const esc = (v: unknown) => {
      const s = v === null || v === undefined ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const yn = (b?: boolean) => (b ? "Y" : "N");
    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push(
        [
          r.householdNo, r.purok, r.addressLine, r.lastName, r.firstName, r.middleName,
          r.suffix, r.relationToHead, r.sex, r.birthDate.slice(0, 10), r.birthPlace,
          r.civilStatus, r.citizenship ?? "Filipino", r.occupation, r.educationLevel,
          r.philsysNo, yn(r.isSenior), yn(r.isPwd), yn(r.isSoloParent), yn(r.is4Ps),
          yn(r.isIndigenous), yn(r.isVoter),
        ].map(esc).join(","),
      );
    }
    return lines.join("\n");
  }
}

/** Conflict policy in companion mode: BIMS is the system of record. */
export function resolveConflict<T>(ours: T, theirs: T): T {
  return theirs;
}

let _gateway: BimsGateway | null = null;
export function getBimsGateway(): BimsGateway {
  if (!_gateway) _gateway = new MockBimsGateway();
  return _gateway;
}
export function setBimsGateway(g: BimsGateway) {
  _gateway = g;
}

// ---------------------------------------------------------------
// PhilSys — format validation + mock verification
// ---------------------------------------------------------------

/** PhilSys Card Number is 16 digits, conventionally shown as 4-4-4-4. */
export function isValidPcnFormat(pcn: string): boolean {
  return /^\d{4}-?\d{4}-?\d{4}-?\d{4}$/.test(pcn.trim());
}

export function normalizePcn(pcn: string): string {
  const digits = pcn.replace(/\D/g, "");
  if (digits.length !== 16) return pcn.trim();
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export interface PhilsysVerification {
  verified: boolean;
  isMock: true;
  reason?: string;
}

export async function verifyPhilsys(pcn: string): Promise<PhilsysVerification> {
  if (!isValidPcnFormat(pcn)) {
    return { verified: false, isMock: true, reason: "Invalid PhilSys number format." };
  }
  // No live PSA interface. Format-valid numbers pass in dev only.
  return { verified: true, isMock: true, reason: "Mock verification — no live PSA connection." };
}
