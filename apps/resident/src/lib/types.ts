/** Shapes returned by the CBMS API (money arrives as centavo strings or peso decimals). */

export interface ListResponse<T> {
  items: T[];
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: string;
  severity: string; // info | warning | critical
  publishedAt: string | null;
  isPublished: boolean;
}

export interface ConsentRecord {
  id: string;
  purpose: string;
  status: string; // granted | withdrawn | expired
  grantedBy: string;
  grantedAt: string;
  withdrawnAt: string | null;
  notes: string | null;
}

export interface DigitalId {
  id: string;
  idNumber: string;
  qrCode: string;
  issuedAt: string;
  expiresAt: string | null;
  isRevoked: boolean;
}

export interface WalletSummary {
  id: string;
  ownerType: string;
  status: string;
  kycTier: string;
  /** centavos, serialized as a string */
  balanceCentavos: string;
}

export interface Profile {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  sex: string;
  birthDate: string;
  civilStatus: string;
  contactPhone: string | null;
  contactEmail: string | null;
  household:
    | {
        id: string;
        householdNo: string;
        addressLine: string;
        purok: string | null;
        consents: ConsentRecord[];
      }
    | null;
  digitalId: DigitalId | null;
  wallet: WalletSummary | null;
  barangay: { name: string; contactPhone: string | null; hotline: string | null } | null;
}

export interface CertificateType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  /** peso decimal, serialized as a number */
  fee: number;
  validityDays: number;
  requirements: string[];
  exemptNote: string | null;
}

export interface CertificateRequest {
  id: string;
  referenceNo: string;
  purpose: string;
  status: string;
  fee: number;
  orNumber: string | null;
  paymentMethod: string | null;
  paidAt: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  releasedAt: string | null;
  submittedAt: string;
  createdAt: string;
  rejectedReason: string | null;
  verifyCode: string | null;
  type?: { id?: string; name: string; code: string } | null;
}

export interface CertificateDocument {
  referenceNo: string;
  title: string;
  barangay: string;
  body: string;
  issuedAt: string | null;
  expiresAt: string | null;
  verifyCode: string | null;
  verifyUrl: string;
  orNumber: string | null;
}

export interface Concern {
  id: string;
  referenceNo: string;
  category: string;
  description: string;
  purok: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  slaDueAt: string | null;
  slaBreached?: boolean;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
  createdAt: string;
}

export interface SosAlert {
  id: string;
  kind: string;
  status: string;
  isTest: boolean;
  latitude: number | null;
  longitude: number | null;
  note: string | null;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  type: string;
  status: string;
  amountCentavos: string;
  feeCentavos: string;
  reference: string;
  description: string | null;
  direction: "in" | "out";
  completedAt: string | null;
  createdAt: string;
}

export interface WalletMeResponse {
  wallet: WalletSummary;
  /** The API names this field `direction`; each row carries its own in/out flag. */
  direction: WalletTransaction[];
}

export interface PbOption {
  id: string;
  label: string;
  detail: string | null;
  voteCount: number;
}

export interface PbCycle {
  id: string;
  title: string;
  year: number;
  opensAt: string;
  closesAt: string;
  status: string;
  options?: PbOption[];
}

export interface Appointment {
  id: string;
  service: string;
  scheduledAt: string;
  queueNumber: string | null;
  status: string;
  notes: string | null;
}

export interface HealthCampaign {
  id: string;
  name: string;
  kind: string;
  startsAt: string;
  endsAt: string | null;
  isActive: boolean;
}

export interface JobPost {
  id: string;
  title: string;
  employer: string;
  kind: string;
  description: string;
  location: string | null;
  salaryRange: string | null;
  contact: string | null;
  closesAt: string | null;
  isActive: boolean;
}
