/** Shapes returned by the CBMS API (apps/api). Kept deliberately loose where the
 *  API returns generic CRUD rows. */

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export interface Bag<T> {
  items: T[];
}

// ---------------------------------------------------------------- dashboard

export interface ActionQueue {
  certificatesForApproval: number;
  openConcerns: number;
  activeSosAlerts: number;
  kpCasesNearDeadline: number;
  kpCasesBreached: number;
  disbursementBatchesForApproval: number;
}

export interface KpAtRisk {
  id: string;
  caseNo: string;
  stage: string;
  filedAt: string;
  subject?: string;
  dueAt: string | null;
  daysRemaining: number | null;
  breached: boolean;
}

export interface DashboardData {
  population: { inhabitants: number; households: number; seniors: number; pwd: number };
  actionQueue: ActionQueue;
  wallet: { registeredWallets: number; transactions30d: number; volume30dCentavos: string };
  satisfaction: { responses30d: number; averageRating: number };
  kpAtRisk: KpAtRisk[];
}

// ---------------------------------------------------------------- residents

export interface HouseholdBrief {
  householdNo: string;
  purok?: string | null;
  addressLine?: string | null;
}

export interface Inhabitant {
  id: string;
  barangayId?: string;
  householdId?: string | null;
  relationToHead?: string | null;
  incomeSource?: string | null;
  residentType?: string; // non_migrant, migrant, transient (BIMS Form A2)
  firstName: string;
  middleName?: string | null;
  lastName: string;
  suffix?: string | null;
  sex: string;
  gender?: string; // male, female, lesbian, gay, bisexual, transgender, queer, etc.
  birthDate: string;
  birthPlace?: string | null;
  residenceMotherAtBirth?: string | null;
  civilStatus?: string;
  citizenship?: string;
  philsysNo?: string | null; // 16-digit PCN
  contactPhone?: string | null;
  contactEmail?: string | null;
  telephoneNumber?: string | null;
  occupation?: string | null;
  educationLevel?: string | null;
  religion?: string | null;
  bloodType?: string | null;
  height?: number | null; // meters
  weight?: number | null; // kg
  complexion?: string | null; // fair, medium, dark
  nationality?: string | null; // filipino, dual_citizen, foreign_citizen, no_citizenship
  isRegisteredVoter?: boolean;
  isResidentVoter?: boolean;
  lastVotedYear?: number | null;
  ethnicity?: string | null; // Form 1.A
  mothersMaidenFirstName?: string | null;
  mothersMaidenMiddleName?: string | null;
  mothersMaidenLastName?: string | null;
  govAssistance?: string | null; // 4Ps, TUPAD, SLP, Others
  isEmployed?: boolean;
  isUnemployed?: boolean;
  isStudent?: boolean;
  isOsc?: boolean; // Out of School Children 6-14
  isOsy?: boolean; // Out of School Youth 15-24
  isMigrant?: boolean;
  isRefugee?: boolean;
  isSenior: boolean;
  isRegisteredSenior?: boolean;
  isPwd: boolean;
  isRegisteredPwd?: boolean;
  pwdType?: string | null;
  isSoloParent: boolean;
  isRegisteredSoloParent?: boolean;
  is4Ps: boolean;
  isIndigenous: boolean;
  isPregnant?: boolean;
  isBedridden?: boolean;
  isOfw?: boolean;
  isVoter?: boolean;
  isDeceased?: boolean;
  privacyConsent?: boolean;
  monthlyIncome?: number | null;
  source: string;
  bimsRef?: string | null;
  photoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  household?: (HouseholdBrief & { id?: string; consents?: ConsentRecord[] }) | null;
}

export interface InhabitantDetail extends Inhabitant {
  completeness: number;
  wallet?: Wallet | null;
  digitalId?: { id: string; qrPayload?: string | null; issuedAt?: string } | null;
  certificateRequests?: CertificateRequest[];
  residencyHistory?: Array<{
    id: string;
    effectiveAt: string;
    addressLine?: string | null;
    note?: string | null;
  }>;
}

export interface ConsentRecord {
  id: string;
  purpose: string;
  status: string;
  grantedBy: string;
  grantedAt: string;
  withdrawnAt?: string | null;
  notes?: string | null;
}

export interface HouseholdMigrant {
  id: string;
  householdId: string;
  inhabitantId?: string | null;
  inhabitantName?: string | null;
  previousResidence: string;
  stayPreviousYears: number;
  stayPreviousMonths: number;
  reasonForLeaving: string; // DILG Codes 1-16
  transferDate: string;
  reasonForTransferring: string; // DILG Codes 1-5
  stayCurrentYears: number;
  stayCurrentMonths: number;
  intentionToReturn: boolean;
  createdAt?: string;
}

export interface DeceasedRecord {
  id: string;
  barangayId?: string;
  inhabitantId: string;
  dateOfDeath: string;
  immediateCause: string;
  underlyingCause: string; // mental, physical, infectious, non_infectious, deficiency, etc.
  recordedById?: string;
  createdAt?: string;
  inhabitant?: Inhabitant | null;
}

export interface BarangayOfficial {
  id: string;
  barangayId?: string;
  inhabitantId?: string | null;
  fullName: string;
  positionType: "elective" | "appointive";
  position: string;
  termStart: number;
  termEnd: number;
  monthlyHonorarium?: number;
  isActive: boolean;
  inactiveReason?: string | null;
  createdAt?: string;
}

export interface Household {
  id: string;
  householdNo: string;
  householdName?: string | null; // e.g. "Dela Cruz Family" (BIMS Form A1)
  householdType?: string | null; // nuclear, extended, single_parent, childless, blended, single_person, non_related
  tenureStatus?: string | null; // owner, renter, others
  housingUnit?: string | null; // single_house, duplex, townhouse_rowhouse, condominium, apartment
  monthlyIncome?: number | null;
  numFamilies?: number;
  numMembers?: number;
  numMigrants?: number;
  purok?: string | null;
  sitio?: string | null;
  houseNo?: string | null;
  blockNo?: string | null;
  lotNo?: string | null;
  street?: string | null;
  subdivision?: string | null;
  buildingName?: string | null;
  addressLine: string;
  zipCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  waterSource?: string | null;
  toiletFacility?: string | null;
  electricitySource?: string | null;
  cookingFuel?: string | null;
  wasteDisposal?: string | null;
  is4Ps?: boolean;
  isIndigent?: boolean;
  source?: string;
  headId?: string | null;
  remarks?: string | null;
  _count?: { members: number };
  consents?: ConsentRecord[];
  members?: Inhabitant[];
  migrants?: HouseholdMigrant[];
}

// ---------------------------------------------------------------- issuance

export interface CertificateType {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  fee: number;
  validityDays: number;
  requirements: string[];
  exemptNote?: string | null;
  isActive: boolean;
}

export interface CertificateRequest {
  id: string;
  referenceNo: string;
  purpose: string;
  status: string;
  fee: number;
  paymentMethod?: string | null;
  paidAt?: string | null;
  orNumber?: string | null;
  approvedAt?: string | null;
  rejectedReason?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  verifyCode?: string | null;
  submittedAt?: string;
  releasedAt?: string | null;
  processingMs?: number | null;
  source?: string;
  createdAt: string;
  type?: { name: string; code: string; requirements?: string[]; validityDays?: number } | null;
  inhabitant?: (Partial<Inhabitant> & { household?: HouseholdBrief | null }) | null;
}

export interface CertificateStats {
  total: number;
  pendingApproval: number;
  released: number;
  awaitingPayment: number;
  medianProcessingHours: number;
  ra11032Compliant: boolean;
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

// ---------------------------------------------------------------- KP / blotter

export interface Deadline {
  dueAt: string | null;
  daysRemaining: number | null;
  breached: boolean;
}

export interface KpParty {
  id: string;
  role: string;
  nameOverride?: string | null;
  address?: string | null;
  contact?: string | null;
  inhabitant?: Partial<Inhabitant> | null;
}

export interface KpHearing {
  id: string;
  scheduledAt: string;
  stage: string;
  attended?: boolean | null;
  minutes?: string | null;
  outcome?: string | null;
}

export interface KpCase {
  id: string;
  caseNo: string;
  subject: string;
  description?: string;
  stage: string;
  isConfidential: boolean;
  filedAt: string;
  closedAt?: string | null;
  settlementTerms?: string | null;
  cfaReason?: string | null;
  pangkatMembers?: string[];
  deadline: Deadline;
  parties?: KpParty[];
  hearings?: KpHearing[];
  documents?: Array<{ id: string; kind: string; issuedAt: string }>;
  blotter?: BlotterEntry | null;
  _count?: { hearings: number };
}

export interface BlotterEntry {
  id: string;
  entryNo: string;
  category: string;
  incidentAt: string;
  location: string;
  narrative: string;
  reportedBy: string;
  respondentName?: string | null;
  isConfidential: boolean;
  kpCase?: { id: string; caseNo: string; stage: string } | null;
}

// ---------------------------------------------------------------- wallet

export interface Wallet {
  id: string;
  ownerType: string;
  kycTier: string;
  status: string;
  balanceCentavos: string;
  emiAccountRef: string;
  createdAt?: string;
  inhabitant?: { firstName: string; lastName: string; philsysNo?: string | null } | null;
  merchant?: { businessName: string } | null;
  agent?: { outletName: string } | null;
}

export interface WalletTransaction {
  id: string;
  type: string;
  status: string;
  amountCentavos: string;
  feeCentavos: string;
  reference: string;
  description?: string | null;
  createdAt: string;
  completedAt?: string | null;
  merchant?: { businessName: string } | null;
  agent?: { outletName: string } | null;
}

export interface WalletScorecard {
  registeredWallets: number;
  adultPopulation: number;
  registrationRate: number;
  active30d: number;
  activeRate: number;
  merchantsAccepting: number;
  cashInOutPoints: number;
  cashOutOnlyRatio: number;
  targets: {
    registrationRate: string;
    activeRate: string;
    merchantsAccepting: string;
    note: string;
  };
}

export interface BatchItem {
  id: string;
  payeeName: string;
  amountCentavos: string;
  status: string;
  remarks?: string | null;
  paidAt?: string | null;
  walletId?: string | null;
  inhabitantId?: string | null;
  inhabitant?: { firstName: string; lastName: string } | null;
}

export interface DisbursementBatch {
  id: string;
  batchNo: string;
  kind: string;
  title: string;
  fund: string;
  status: string;
  preparedById?: string | null;
  approvedById?: string | null;
  approvedAt?: string | null;
  executedAt?: string | null;
  totalCentavos: string;
  itemCount: number;
  sourceNote?: string | null;
  createdAt: string;
  items?: BatchItem[];
  _count?: { items: number };
}

// ---------------------------------------------------------------- finance

export interface LedgerEntry {
  id: string;
  postedAt: string;
  fund: string;
  accountCode: string;
  description: string;
  direction: string;
  amount: number;
  orNumber?: string | null;
  dvNumber?: string | null;
  refType?: string | null;
}

export interface OfficialReceipt {
  id: string;
  orNumber: string;
  payorName: string;
  amount: number;
  particulars: string;
  issuedAt: string;
}

export interface BudgetLine {
  id: string;
  expenseClass: string;
  accountCode: string;
  description: string;
  amount: number;
  obligated: number;
  disbursed: number;
}

export interface Budget {
  id: string;
  year: number;
  totalAmount: number;
  skFundAmount: number;
  status: string;
  lines?: BudgetLine[];
}

// ---------------------------------------------------------------- assets / DRRM

export interface Property {
  id: string;
  name: string;
  type: string;
  status: string;
  category: string;
  capacity: number;
  custodian?: string | null;
  addressLine?: string | null;
  description?: string | null;
  acquiredAt?: string | null;
  acquisitionCost?: number | null;
  isEvacuationCenter?: boolean;
  source?: string;
  updatedAt: string;
  createdAt: string;
}

export interface Material {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  location?: string | null;
  updatedAt: string;
}

export interface EvacuationCenter {
  id: string;
  name: string;
  capacity: number;
  addressLine?: string | null;
  isOpen: boolean;
}

export interface DisasterEvent {
  id: string;
  name: string;
  hazardType: string;
  status: string;
  declaredAt: string;
  closedAt?: string | null;
  summary?: string | null;
  evacuations?: Array<{
    id: string;
    centerId: string;
    headcount: number;
    checkInAt: string;
    checkOutAt?: string | null;
    center?: EvacuationCenter | null;
  }>;
  reliefs?: Array<{
    id: string;
    goods: string;
    quantity: number;
    cashAmount?: number | null;
    releasedAt: string;
    receivedBy?: string | null;
  }>;
}

export interface Hazard {
  id: string;
  purok: string;
  hazardType: string;
  riskLevel: string;
  notes?: string | null;
}

// ---------------------------------------------------------------- governance

export interface Legislation {
  id: string;
  kind: string;
  number: string;
  series: number;
  title: string;
  body?: string | null;
  status: string;
  sponsors: string[];
  enactedAt?: string | null;
  isPublished: boolean;
  createdAt: string;
}

export interface DevelopmentPlan {
  id: string;
  title: string;
  vision?: string | null;
  startYear: number;
  endYear: number;
  status: string;
  projects?: DevProject[];
}

export interface DevProject {
  id: string;
  planId: string;
  title: string;
  sector: string;
  budget: number;
  fundingSource?: string | null;
  status: string;
  targetYear: number;
  progressPct: number;
}

export interface GadActivity {
  id: string;
  title: string;
  attribution: string;
  genderIssue?: string | null;
  budget: number;
  actualSpend?: number | null;
  targetOutput?: string | null;
  quarter?: number | null;
  status: string;
}

export interface GadPlan {
  id: string;
  year: number;
  totalBudget: number;
  gadBudget: number;
  status: string;
  activities?: GadActivity[];
}

export interface Institution {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  accreditedAt?: string | null;
  isActive: boolean;
  members?: Array<{
    id: string;
    position: string;
    nameOverride?: string | null;
    termStart?: string | null;
    termEnd?: string | null;
    inhabitant?: Partial<Inhabitant> | null;
  }>;
  minutes?: Array<{ id: string; title?: string; meetingAt?: string }>;
}

// ---------------------------------------------------------------- B3 / comms

export interface Concern {
  id: string;
  referenceNo: string;
  category: string;
  description: string;
  purok?: string | null;
  status: string;
  slaDueAt?: string | null;
  slaBreached: boolean;
  acknowledgedAt?: string | null;
  resolvedAt?: string | null;
  resolutionNote?: string | null;
  createdAt: string;
  inhabitant?: { firstName: string; lastName: string } | null;
}

export interface SosAlert {
  id: string;
  kind: string;
  latitude?: number | null;
  longitude?: number | null;
  note?: string | null;
  status: string;
  isTest: boolean;
  acknowledgedAt?: string | null;
  resolvedAt?: string | null;
  responseNote?: string | null;
  createdAt: string;
  inhabitant?: { firstName: string; lastName: string; contactPhone?: string | null } | null;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: string;
  severity: string;
  channels: string[];
  publishedAt?: string | null;
  isPublished: boolean;
  createdAt: string;
}

export interface Appointment {
  id: string;
  service: string;
  scheduledAt: string;
  queueNumber?: string | null;
  status: string;
  notes?: string | null;
  inhabitant?: { firstName: string; lastName: string } | null;
}

export interface SitePage {
  id: string;
  slug: string;
  title: string;
  body: string;
  isPublished: boolean;
  sortOrder: number;
  updatedAt: string;
}

export interface SitePost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  body: string;
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt: string;
}

export interface Ticket {
  id: string;
  subject: string;
  body: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
  responses?: Array<{ id: string; body: string; createdAt: string }>;
}

export interface AuditRow {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  actorRole?: string | null;
  ip?: string | null;
  isAiAction: boolean;
  createdAt: string;
  diff?: unknown;
  actor?: { fullName: string; email: string | null } | null;
}

// ---------------------------------------------------------------- reports

export interface QuarterlyReport {
  period: string;
  barangaysCovered: number;
  registeredInhabitants: number;
  certificatesIssued: number;
  kpCasesFiled: number;
  concernsReceived: number;
  disbursementCount: number;
  disbursementTotalCentavos: string;
  csmResponses: number;
  csmAverage: number;
  note: string;
}

export interface CsmSummary {
  responses: number;
  averageRating: number;
  satisfactionRate: number;
  grievances: number;
  distribution: Array<{ star: number; count: number }>;
  byService: Array<{ service: string; average: number; responses: number }>;
}
