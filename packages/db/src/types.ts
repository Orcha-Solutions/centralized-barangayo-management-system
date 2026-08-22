// Generated TypeScript types from schema.prisma
// DO NOT EDIT DIRECTLY

export namespace Prisma {
  export class Decimal {
    private value: number;
    constructor(val: string | number | Decimal) {
      if (val instanceof Decimal) {
        this.value = val.value;
      } else {
        this.value = Number(val);
      }
    }
    toString() { return String(this.value); }
    toNumber() { return this.value; }
    toFixed(n: number) { return this.value.toFixed(n); }
  }
}

export enum TenantMode {
  companion = "companion",
  standalone = "standalone",
}

export enum RecordSource {
  CBMS = "CBMS",
  BIMS = "BIMS",
  IMPORT = "IMPORT",
}

export interface Region {
  id: string;
  psgcCode: string;
  name: string;
  provinces: Province[];
  createdAt: Date;
}

export interface Province {
  id: string;
  psgcCode: string;
  name: string;
  regionId: string;
  region: Region;
  cities: City[];
}

export interface City {
  id: string;
  psgcCode: string;
  name: string;
  isCity: boolean;
  provinceId: string;
  province: Province;
  barangays: Barangay[];
  users: User[];
}

export enum BarangayStatus {
  pending = "pending",
  active = "active",
  suspended = "suspended",
}

export interface Barangay {
  id: string;
  psgcCode: string;
  name: string;
  cityId: string;
  city: City;
  status: BarangayStatus;
  mode: TenantMode;
  logoUrl: string | null;
  brandPrimary: string | null;
  brandAccent: string | null;
  addressLine: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  hotline: string | null;
  puroks: string[];
  approvedAt: Date | null;
  approvedById: string | null;
  createdAt: Date;
  updatedAt: Date;
  users: User[];
  households: Household[];
  inhabitants: Inhabitant[];
  consents: ConsentRecord[];
  certificateTypes: CertificateType[];
  certificateRequests: CertificateRequest[];
  blotterEntries: BlotterEntry[];
  kpCases: KpCase[];
  properties: Property[];
  materials: Material[];
  evacuationCenters: EvacuationCenter[];
  disasterEvents: DisasterEvent[];
  hazards: Hazard[];
  gadPlans: GadPlan[];
  legislations: Legislation[];
  developmentPlans: DevelopmentPlan[];
  institutions: Institution[];
  budgets: Budget[];
  ledgerEntries: LedgerEntry[];
  officialReceipts: OfficialReceipt[];
  sitePages: SitePage[];
  sitePosts: SitePost[];
  reportRuns: ReportRun[];
  tickets: Ticket[];
  files: FileObject[];
  wallets: Wallet[];
  disbursementBatches: DisbursementBatch[];
  merchants: Merchant[];
  agents: Agent[];
  concerns: Concern[];
  sosAlerts: SosAlert[];
  announcements: Announcement[];
  appointments: Appointment[];
  feedback: Feedback[];
  healthCampaigns: HealthCampaign[];
  jobPosts: JobPost[];
  benefitApplications: BenefitApplication[];
  pbCycles: PbCycle[];
  assemblies: Assembly[];
  auditLogs: AuditLog[];
  aiInteractions: AiInteraction[];
  syncRuns: BimsSyncRun[];
}

export enum RoleKey {
  SYSTEM_ADMIN = "SYSTEM_ADMIN",
  LGU_ADMIN = "LGU_ADMIN",
  PUNONG_BARANGAY = "PUNONG_BARANGAY",
  BARANGAY_SECRETARY = "BARANGAY_SECRETARY",
  BARANGAY_TREASURER = "BARANGAY_TREASURER",
  SB_MEMBER = "SB_MEMBER",
  SK_OFFICIAL = "SK_OFFICIAL",
  LUPON_SECRETARY = "LUPON_SECRETARY",
  VAW_DESK_OFFICER = "VAW_DESK_OFFICER",
  BHW = "BHW",
  TANOD = "TANOD",
  RESIDENT = "RESIDENT",
  AGENT_MERCHANT = "AGENT_MERCHANT",
  DILG_VIEWER = "DILG_VIEWER",
}

export enum ScopeLevel {
  platform = "platform",
  region = "region",
  province = "province",
  city = "city",
  barangay = "barangay",
  self = "self",
}

export interface Role {
  id: string;
  key: RoleKey;
  name: string;
  description: string | null;
  scope: ScopeLevel;
  isStaff: boolean;
  permissions: RolePermission[];
  users: UserRole[];
}

export interface Permission {
  id: string;
  key: string;
  module: string;
  action: string;
  roles: RolePermission[];
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
  role: Role;
  permission: Permission;
}

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  passwordHash: string | null;
  fullName: string;
  avatarUrl: string | null;
  isActive: boolean;
  mfaEnabled: boolean;
  mfaSecret: string | null;
  barangayId: string | null;
  barangay: Barangay | null;
  cityId: string | null;
  city: City | null;
  inhabitantId: string | null;
  inhabitant: Inhabitant | null;
  roles: UserRole[];
  sessions: Session[];
  auditLogs: AuditLog[];
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  userId: string;
  roleId: string;
  user: User;
  role: Role;
}

export interface Session {
  id: string;
  userId: string;
  user: User;
  token: string;
  ip: string | null;
  userAgent: string | null;
  mfaPassed: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  barangayId: string | null;
  barangay: Barangay | null;
  actorId: string | null;
  actor: User | null;
  actorRole: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  beforeHash: string | null;
  afterHash: string | null;
  diff: any | null;
  ip: string | null;
  userAgent: string | null;
  isAiAction: boolean;
  createdAt: Date;
}

export enum ConsentPurpose {
  SERVICE_DELIVERY = "SERVICE_DELIVERY",
  DISBURSEMENT = "DISBURSEMENT",
  BIMS_SHARING = "BIMS_SHARING",
  HEALTH_PROGRAM = "HEALTH_PROGRAM",
  ANALYTICS = "ANALYTICS",
}

export enum ConsentStatus {
  granted = "granted",
  withdrawn = "withdrawn",
  expired = "expired",
}

export interface ConsentRecord {
  id: string;
  barangayId: string;
  barangay: Barangay;
  householdId: string | null;
  household: Household | null;
  inhabitantId: string | null;
  inhabitant: Inhabitant | null;
  purpose: ConsentPurpose;
  status: ConsentStatus;
  grantedBy: string;
  grantedAt: Date;
  withdrawnAt: Date | null;
  evidenceUrl: string | null;
  notes: string | null;
  createdAt: Date;
}

export enum Sex {
  male = "male",
  female = "female",
}

export enum CivilStatus {
  single = "single",
  married = "married",
  widowed = "widowed",
  separated = "separated",
  annulled = "annulled",
}

export interface Household {
  id: string;
  barangayId: string;
  barangay: Barangay;
  householdNo: string;
  purok: string | null;
  sitio: string | null;
  houseNo?: string | null;
  blockNo?: string | null;
  lotNo?: string | null;
  street?: string | null;
  subdivision?: string | null;
  buildingName?: string | null;
  addressLine: string;
  latitude: number | null;
  longitude: number | null;
  squareMeters?: number | null;
  hasGarage?: boolean;
  dwellingType: string | null;
  roofMaterial?: string | null;
  wallMaterial?: string | null;
  tenureStatus: string | null;
  landTenure?: string | null;
  waterSource: string | null;
  toiletFacility: string | null;
  electricitySource: string | null;
  cookingFuel?: string | null;
  wasteDisposal?: string | null;
  internetAccess?: string | null;
  monthlyIncomeBand: string | null;
  primaryIncomeSource?: string | null;
  hazardZoneRisk?: string | null;
  is4Ps: boolean;
  isIndigent?: boolean;
  headId: string | null;
  remarks?: string | null;
  members: Inhabitant[];
  source: RecordSource;
  bimsRef: string | null;
  consents: ConsentRecord[];
  reliefs: ReliefDistribution[];
  evacuations: EvacuationRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Inhabitant {
  id: string;
  barangayId: string;
  barangay: Barangay;
  householdId: string | null;
  household: Household | null;
  relationToHead: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  sex: Sex;
  birthDate: Date;
  birthPlace: string | null;
  civilStatus: CivilStatus;
  citizenship: string;
  philsysNo: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  occupation: string | null;
  educationLevel: string | null;
  religion: string | null;
  bloodType: string | null;
  monthlyIncome: Prisma.Decimal | number | null;
  isSenior: boolean;
  isPwd: boolean;
  pwdType: string | null;
  isSoloParent: boolean;
  is4Ps: boolean;
  isIndigenous: boolean;
  isPregnant: boolean;
  isBedridden: boolean;
  isOfw: boolean;
  isVoter: boolean;
  isDeceased: boolean;
  deceasedDate: Date | null;
  residencyStart: Date | null;
  isResident: boolean;
  source: RecordSource;
  bimsRef: string | null;
  photoUrl: string | null;
  user: User | null;
  consents: ConsentRecord[];
  certificateRequests: CertificateRequest[];
  wallet: Wallet | null;
  kpParties: KpParty[];
  institutionMembers: InstitutionMember[];
  concerns: Concern[];
  sosAlerts: SosAlert[];
  appointments: Appointment[];
  feedback: Feedback[];
  healthRecords: HealthRecord[];
  jobApplications: JobApplication[];
  benefitApplications: BenefitApplication[];
  pbVotes: PbVote[];
  digitalId: DigitalId | null;
  batchItems: DisbursementBatchItem[];
  residencyHistory: ResidencyHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ResidencyHistory {
  id: string;
  inhabitantId: string;
  inhabitant: Inhabitant;
  event: string;
  effectiveAt: Date;
  fromAddress: string | null;
  toAddress: string | null;
  remarks: string | null;
  createdAt: Date;
}

export enum RequestStatus {
  draft = "draft",
  submitted = "submitted",
  awaiting_payment = "awaiting_payment",
  paid = "paid",
  for_approval = "for_approval",
  approved = "approved",
  released = "released",
  rejected = "rejected",
  cancelled = "cancelled",
}

export enum PaymentMethod {
  wallet = "wallet",
  otc_cash = "otc_cash",
  waived = "waived",
}

export interface CertificateType {
  id: string;
  barangayId: string;
  barangay: Barangay;
  code: string;
  name: string;
  description: string | null;
  fee: Prisma.Decimal | number;
  validityDays: number;
  isActive: boolean;
  requiresApproval: boolean;
  requirements: string[];
  exemptNote: string | null;
  templateBody: string | null;
  requests: CertificateRequest[];
}

export interface CertificateRequest {
  id: string;
  barangayId: string;
  barangay: Barangay;
  typeId: string;
  type: CertificateType;
  inhabitantId: string;
  inhabitant: Inhabitant;
  referenceNo: string;
  purpose: string;
  status: RequestStatus;
  fee: Prisma.Decimal | number;
  paymentMethod: PaymentMethod | null;
  paidAt: Date | null;
  orNumber: string | null;
  approvedById: string | null;
  approvedAt: Date | null;
  rejectedReason: string | null;
  issuedAt: Date | null;
  expiresAt: Date | null;
  verifyCode: string | null;
  pdfUrl: string | null;
  submittedAt: Date;
  releasedAt: Date | null;
  processingMs: number | null;
  source: RecordSource;
  bimsRef: string | null;
  aiDraft: string | null;
  feedback: Feedback[];
  transactions: WalletTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

export enum BlotterCategory {
  dispute = "dispute",
  theft = "theft",
  physical_injury = "physical_injury",
  noise = "noise",
  vandalism = "vandalism",
  vawc = "vawc",
  drugs = "drugs",
  traffic = "traffic",
  other = "other",
}

export interface BlotterEntry {
  id: string;
  barangayId: string;
  barangay: Barangay;
  entryNo: string;
  category: BlotterCategory;
  incidentAt: Date;
  location: string;
  narrative: string;
  reportedBy: string;
  respondentName: string | null;
  isConfidential: boolean;
  recordedById: string | null;
  kpCase: KpCase | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum KpStage {
  filed = "filed",
  mediation = "mediation",
  conciliation = "conciliation",
  settled = "settled",
  repudiated = "repudiated",
  cfa_issued = "cfa_issued",
  dismissed = "dismissed",
  withdrawn = "withdrawn",
}

export interface KpCase {
  id: string;
  barangayId: string;
  barangay: Barangay;
  caseNo: string;
  blotterId: string | null;
  blotter: BlotterEntry | null;
  subject: string;
  description: string;
  stage: KpStage;
  isConfidential: boolean;
  filedAt: Date;
  mediationDueAt: Date | null;
  conciliationDueAt: Date | null;
  extendedDueAt: Date | null;
  closedAt: Date | null;
  settlementTerms: string | null;
  cfaReason: string | null;
  pangkatMembers: string[];
  parties: KpParty[];
  hearings: KpHearing[];
  documents: KpDocument[];
  source: RecordSource;
  bimsRef: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum PartyRole {
  complainant = "complainant",
  respondent = "respondent",
  witness = "witness",
}

export interface KpParty {
  id: string;
  caseId: string;
  case: KpCase;
  role: PartyRole;
  inhabitantId: string | null;
  inhabitant: Inhabitant | null;
  nameOverride: string | null;
  address: string | null;
  contact: string | null;
}

export interface KpHearing {
  id: string;
  caseId: string;
  case: KpCase;
  scheduledAt: Date;
  stage: KpStage;
  attended: boolean | null;
  minutes: string | null;
  outcome: string | null;
  createdAt: Date;
}

export interface KpDocument {
  id: string;
  caseId: string;
  case: KpCase;
  kind: string;
  pdfUrl: string | null;
  issuedAt: Date;
}

export enum PropertyType {
  infrastructure = "infrastructure",
  non_infrastructure = "non_infrastructure",
}

export enum PropertyStatus {
  operational = "operational",
  under_construction = "under_construction",
  unserviceable = "unserviceable",
  closed = "closed",
}

export interface Property {
  id: string;
  barangayId: string;
  barangay: Barangay;
  name: string;
  type: PropertyType;
  status: PropertyStatus;
  category: string;
  capacity: number;
  acquiredAt: Date | null;
  acquisitionCost: Prisma.Decimal | number | null;
  custodian: string | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  addressLine: string | null;
  isEvacuationCenter: boolean;
  evacuationCenter: EvacuationCenter | null;
  maintenance: MaintenanceRecord[];
  source: RecordSource;
  bimsRef: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceRecord {
  id: string;
  propertyId: string;
  property: Property;
  performedAt: Date;
  kind: string;
  cost: Prisma.Decimal | number | null;
  remarks: string | null;
  createdAt: Date;
}

export interface Material {
  id: string;
  barangayId: string;
  barangay: Barangay;
  name: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  location: string | null;
  updatedAt: Date;
  createdAt: Date;
}

export interface Hazard {
  id: string;
  barangayId: string;
  barangay: Barangay;
  purok: string;
  hazardType: string;
  riskLevel: string;
  notes: string | null;
  createdAt: Date;
}

export interface EvacuationCenter {
  id: string;
  barangayId: string;
  barangay: Barangay;
  propertyId: string | null;
  property: Property | null;
  name: string;
  capacity: number;
  addressLine: string | null;
  latitude: number | null;
  longitude: number | null;
  isOpen: boolean;
  evacuations: EvacuationRecord[];
  createdAt: Date;
}

export enum DisasterEventStatus {
  monitoring = "monitoring",
  active = "active",
  recovery = "recovery",
  closed = "closed",
}

export interface DisasterEvent {
  id: string;
  barangayId: string;
  barangay: Barangay;
  name: string;
  hazardType: string;
  status: DisasterEventStatus;
  declaredAt: Date;
  closedAt: Date | null;
  summary: string | null;
  evacuations: EvacuationRecord[];
  reliefs: ReliefDistribution[];
  createdAt: Date;
}

export interface EvacuationRecord {
  id: string;
  eventId: string;
  event: DisasterEvent;
  centerId: string;
  center: EvacuationCenter;
  householdId: string;
  household: Household;
  headcount: number;
  checkInAt: Date;
  checkOutAt: Date | null;
}

export interface ReliefDistribution {
  id: string;
  eventId: string;
  event: DisasterEvent;
  householdId: string;
  household: Household;
  goods: string;
  quantity: number;
  cashAmount: Prisma.Decimal | number | null;
  releasedAt: Date;
  releasedBy: string | null;
  receivedBy: string | null;
}

export interface GadPlan {
  id: string;
  barangayId: string;
  barangay: Barangay;
  year: number;
  totalBudget: Prisma.Decimal | number;
  gadBudget: Prisma.Decimal | number;
  status: string;
  activities: GadActivity[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GadActivity {
  id: string;
  planId: string;
  plan: GadPlan;
  title: string;
  attribution: string;
  genderIssue: string | null;
  budget: Prisma.Decimal | number;
  actualSpend: Prisma.Decimal | number | null;
  targetOutput: string | null;
  actualOutput: string | null;
  quarter: number | null;
  status: string;
}

export enum LegislationKind {
  ordinance = "ordinance",
  resolution = "resolution",
  executive_order = "executive_order",
}

export enum LegislationStatus {
  draft = "draft",
  enacted = "enacted",
  vetoed = "vetoed",
  amended = "amended",
  repealed = "repealed",
}

export interface Legislation {
  id: string;
  barangayId: string;
  barangay: Barangay;
  kind: LegislationKind;
  number: string;
  series: number;
  title: string;
  body: string | null;
  status: LegislationStatus;
  sponsors: string[];
  firstReadingAt: Date | null;
  secondReadingAt: Date | null;
  enactedAt: Date | null;
  fileUrl: string | null;
  isPublished: boolean;
  amendsId: string | null;
  amends: Legislation | null;
  amendedBy: Legislation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DevelopmentPlan {
  id: string;
  barangayId: string;
  barangay: Barangay;
  title: string;
  vision: string | null;
  startYear: number;
  endYear: number;
  status: string;
  projects: DevProject[];
  createdAt: Date;
}

export enum ProjectStatus {
  proposed = "proposed",
  approved = "approved",
  ongoing = "ongoing",
  completed = "completed",
  deferred = "deferred",
}

export interface DevProject {
  id: string;
  planId: string;
  plan: DevelopmentPlan;
  title: string;
  description: string | null;
  sector: string;
  budget: Prisma.Decimal | number;
  fundingSource: string | null;
  status: ProjectStatus;
  targetYear: number;
  progressPct: number;
  alignmentTags: string[];
  pbOptions: PbOption[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Institution {
  id: string;
  barangayId: string;
  barangay: Barangay;
  code: string;
  name: string;
  description: string | null;
  accreditedAt: Date | null;
  isActive: boolean;
  members: InstitutionMember[];
  minutes: InstitutionMinutes[];
  createdAt: Date;
}

export interface InstitutionMember {
  id: string;
  institutionId: string;
  institution: Institution;
  inhabitantId: string | null;
  inhabitant: Inhabitant | null;
  nameOverride: string | null;
  position: string;
  termStart: Date | null;
  termEnd: Date | null;
}

export interface InstitutionMinutes {
  id: string;
  institutionId: string;
  institution: Institution;
  meetingAt: Date;
  agenda: string | null;
  minutes: string | null;
  fileUrl: string | null;
}

export interface Budget {
  id: string;
  barangayId: string;
  barangay: Barangay;
  year: number;
  ordinanceId: string | null;
  totalAmount: Prisma.Decimal | number;
  skFundAmount: Prisma.Decimal | number;
  status: string;
  lines: BudgetLine[];
  createdAt: Date;
}

export interface BudgetLine {
  id: string;
  budgetId: string;
  budget: Budget;
  expenseClass: string;
  accountCode: string;
  description: string;
  amount: Prisma.Decimal | number;
  obligated: Prisma.Decimal | number;
  disbursed: Prisma.Decimal | number;
}

export enum LedgerDirection {
  debit = "debit",
  credit = "credit",
}

export enum FundType {
  general = "general",
  sk = "sk",
  gad = "gad",
  disaster = "disaster",
  trust = "trust",
}

export interface LedgerEntry {
  id: string;
  barangayId: string;
  barangay: Barangay;
  postedAt: Date;
  fund: FundType;
  accountCode: string;
  description: string;
  direction: LedgerDirection;
  amount: Prisma.Decimal | number;
  orNumber: string | null;
  dvNumber: string | null;
  refType: string | null;
  refId: string | null;
  transactionId: string | null;
  transaction: WalletTransaction | null;
  createdById: string | null;
  createdAt: Date;
}

export interface OfficialReceipt {
  id: string;
  barangayId: string;
  barangay: Barangay;
  orNumber: string;
  payorName: string;
  amount: Prisma.Decimal | number;
  particulars: string;
  issuedAt: Date;
  issuedById: string | null;
  refType: string | null;
  refId: string | null;
}

export interface SitePage {
  id: string;
  barangayId: string;
  barangay: Barangay;
  slug: string;
  title: string;
  body: string;
  isPublished: boolean;
  sortOrder: number;
  updatedAt: Date;
}

export interface SitePost {
  id: string;
  barangayId: string;
  barangay: Barangay;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  coverUrl: string | null;
  publishedAt: Date | null;
  isPublished: boolean;
  createdAt: Date;
}

export interface ReportRun {
  id: string;
  barangayId: string | null;
  barangay: Barangay | null;
  cityId: string | null;
  key: string;
  period: string | null;
  format: string;
  params: any | null;
  status: string;
  fileUrl: string | null;
  rowCount: number | null;
  generatedById: string | null;
  createdAt: Date;
}

export enum TicketStatus {
  open = "open",
  in_progress = "in_progress",
  escalated = "escalated",
  resolved = "resolved",
  closed = "closed",
}

export interface Ticket {
  id: string;
  barangayId: string | null;
  barangay: Barangay | null;
  subject: string;
  body: string;
  category: string;
  status: TicketStatus;
  priority: string;
  raisedById: string | null;
  assignedToId: string | null;
  resolvedAt: Date | null;
  responses: TicketResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketResponse {
  id: string;
  ticketId: string;
  ticket: Ticket;
  authorId: string | null;
  body: string;
  isInternal: boolean;
  createdAt: Date;
}

export interface FileObject {
  id: string;
  barangayId: string | null;
  barangay: Barangay | null;
  key: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  scanStatus: string;
  uploadedById: string | null;
  createdAt: Date;
}

export interface FeatureFlag {
  id: string;
  key: string;
  enabled: boolean;
  scope: string;
  notes: string | null;
  updatedAt: Date;
}

export interface BimsSyncRun {
  id: string;
  barangayId: string;
  barangay: Barangay;
  dataset: string;
  direction: string;
  status: string;
  pulled: number;
  conflicts: number;
  message: string | null;
  startedAt: Date;
  finishedAt: Date | null;
}

export enum WalletOwnerType {
  resident = "resident",
  official = "official",
  treasury = "treasury",
  merchant = "merchant",
  agent = "agent",
}

export enum KycTier {
  tier1 = "tier1",
  tier2 = "tier2",
}

export enum WalletStatus {
  active = "active",
  frozen = "frozen",
  closed = "closed",
}

export interface Wallet {
  id: string;
  barangayId: string;
  barangay: Barangay;
  ownerType: WalletOwnerType;
  inhabitantId: string | null;
  inhabitant: Inhabitant | null;
  emiAccountRef: string;
  kycTier: KycTier;
  status: WalletStatus;
  balanceCentavos: bigint;
  merchant: Merchant | null;
  agent: Agent | null;
  outgoing: WalletTransaction[];
  incoming: WalletTransaction[];
  batchItems: DisbursementBatchItem[];
  createdAt: Date;
  updatedAt: Date;
}

export enum TxnType {
  disbursement = "disbursement",
  fee_collection = "fee_collection",
  bill_payment = "bill_payment",
  merchant_payment = "merchant_payment",
  p2p_transfer = "p2p_transfer",
  cash_in = "cash_in",
  cash_out = "cash_out",
  reversal = "reversal",
  adjustment = "adjustment",
}

export enum TxnStatus {
  pending = "pending",
  completed = "completed",
  failed = "failed",
  reversed = "reversed",
}

export interface WalletTransaction {
  id: string;
  barangayId: string;
  type: TxnType;
  status: TxnStatus;
  fromWalletId: string | null;
  fromWallet: Wallet | null;
  toWalletId: string | null;
  toWallet: Wallet | null;
  amountCentavos: bigint;
  feeCentavos: bigint;
  currency: string;
  reference: string;
  description: string | null;
  emiTxnRef: string | null;
  batchItemId: string | null;
  certificateRequestId: string | null;
  certificateRequest: CertificateRequest | null;
  billPaymentId: string | null;
  agentId: string | null;
  agent: Agent | null;
  merchantId: string | null;
  merchant: Merchant | null;
  ledgerEntries: LedgerEntry[];
  dispute: Dispute | null;
  completedAt: Date | null;
  createdAt: Date;
}

export enum BatchStatus {
  draft = "draft",
  for_approval = "for_approval",
  approved = "approved",
  executing = "executing",
  completed = "completed",
  failed = "failed",
  cancelled = "cancelled",
}

export enum BatchKind {
  payroll_honoraria = "payroll_honoraria",
  allowance_stipend = "allowance_stipend",
  ayuda_social = "ayuda_social",
}

export interface DisbursementBatch {
  id: string;
  barangayId: string;
  barangay: Barangay;
  batchNo: string;
  kind: BatchKind;
  title: string;
  fund: FundType;
  status: BatchStatus;
  preparedById: string | null;
  approvedById: string | null;
  approvedAt: Date | null;
  executedAt: Date | null;
  totalCentavos: bigint;
  itemCount: number;
  sourceNote: string | null;
  disasterEventId: string | null;
  items: DisbursementBatchItem[];
  createdAt: Date;
  updatedAt: Date;
}

export enum BatchItemStatus {
  pending = "pending",
  paid = "paid",
  failed = "failed",
  otc_fallback = "otc_fallback",
  cancelled = "cancelled",
}

export interface DisbursementBatchItem {
  id: string;
  batchId: string;
  batch: DisbursementBatch;
  inhabitantId: string | null;
  inhabitant: Inhabitant | null;
  walletId: string | null;
  wallet: Wallet | null;
  payeeName: string;
  amountCentavos: bigint;
  status: BatchItemStatus;
  remarks: string | null;
  paidAt: Date | null;
}

export interface Merchant {
  id: string;
  barangayId: string;
  barangay: Barangay;
  walletId: string;
  wallet: Wallet;
  businessName: string;
  ownerName: string;
  category: string;
  addressLine: string | null;
  qrCode: string;
  mdrBps: number;
  isActive: boolean;
  transactions: WalletTransaction[];
  createdAt: Date;
}

export interface Agent {
  id: string;
  barangayId: string;
  barangay: Barangay;
  walletId: string;
  wallet: Wallet;
  outletName: string;
  ownerName: string;
  addressLine: string | null;
  commissionBps: number;
  cashOnHandCentavos: bigint;
  floatAlertThreshold: bigint;
  isActive: boolean;
  transactions: WalletTransaction[];
  floatLogs: AgentFloatLog[];
  createdAt: Date;
}

export interface AgentFloatLog {
  id: string;
  agentId: string;
  agent: Agent;
  kind: string;
  amountCentavos: bigint;
  balanceAfterCentavos: bigint;
  note: string | null;
  createdAt: Date;
}

export interface Biller {
  id: string;
  code: string;
  name: string;
  category: string;
  commissionCentavos: bigint;
  isActive: boolean;
  payments: BillPayment[];
}

export interface BillPayment {
  id: string;
  barangayId: string;
  billerId: string;
  biller: Biller;
  walletId: string;
  accountNo: string;
  amountCentavos: bigint;
  convenienceFeeCentavos: bigint;
  status: TxnStatus;
  paidAt: Date | null;
  createdAt: Date;
}

export interface Dispute {
  id: string;
  transactionId: string;
  transaction: WalletTransaction;
  raisedById: string | null;
  reason: string;
  status: string;
  resolution: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
}

export interface AiInteraction {
  id: string;
  barangayId: string | null;
  barangay: Barangay | null;
  userId: string | null;
  surface: string;
  prompt: string;
  response: string;
  citations: any | null;
  model: string | null;
  tokensIn: number | null;
  tokensOut: number | null;
  latencyMs: number | null;
  escalatedTicketId: string | null;
  createdAt: Date;
}

export enum AiRunStatus {
  running = "running",
  awaiting_approval = "awaiting_approval",
  completed = "completed",
  failed = "failed",
  rejected = "rejected",
}

export interface AiWorkflowRun {
  id: string;
  barangayId: string;
  workflow: string;
  refType: string | null;
  refId: string | null;
  status: AiRunStatus;
  steps: AiWorkflowStep[];
  startedAt: Date;
  finishedAt: Date | null;
}

export interface AiWorkflowStep {
  id: string;
  runId: string;
  run: AiWorkflowRun;
  seq: number;
  name: string;
  input: any | null;
  output: any | null;
  status: string;
  isHumanGate: boolean;
  decidedById: string | null;
  createdAt: Date;
}

export enum ConcernStatus {
  submitted = "submitted",
  acknowledged = "acknowledged",
  in_progress = "in_progress",
  resolved = "resolved",
  rejected = "rejected",
}

export interface Concern {
  id: string;
  barangayId: string;
  barangay: Barangay;
  inhabitantId: string | null;
  inhabitant: Inhabitant | null;
  referenceNo: string;
  category: string;
  description: string;
  photoUrl: string | null;
  resolutionPhotoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  purok: string | null;
  status: ConcernStatus;
  slaDueAt: Date | null;
  acknowledgedAt: Date | null;
  resolvedAt: Date | null;
  assignedToId: string | null;
  resolutionNote: string | null;
  feedback: Feedback[];
  createdAt: Date;
  updatedAt: Date;
}

export enum SosStatus {
  active = "active",
  acknowledged = "acknowledged",
  dispatched = "dispatched",
  resolved = "resolved",
  false_alarm = "false_alarm",
  test = "test",
}

export interface SosAlert {
  id: string;
  barangayId: string;
  barangay: Barangay;
  inhabitantId: string | null;
  inhabitant: Inhabitant | null;
  kind: string;
  latitude: number | null;
  longitude: number | null;
  note: string | null;
  status: SosStatus;
  isTest: boolean;
  acknowledgedAt: Date | null;
  respondedById: string | null;
  resolvedAt: Date | null;
  responseNote: string | null;
  createdAt: Date;
}

export interface Announcement {
  id: string;
  barangayId: string;
  barangay: Barangay;
  title: string;
  body: string;
  category: string;
  severity: string;
  channels: string[];
  publishedAt: Date | null;
  isPublished: boolean;
  disasterEventId: string | null;
  authorId: string | null;
  replies: AnnouncementReply[];
  createdAt: Date;
}

export interface AnnouncementReply {
  id: string;
  announcementId: string;
  announcement: Announcement;
  inhabitantId: string | null;
  body: string;
  isModerated: boolean;
  isHidden: boolean;
  createdAt: Date;
}

export enum AppointmentStatus {
  booked = "booked",
  checked_in = "checked_in",
  serving = "serving",
  completed = "completed",
  no_show = "no_show",
  cancelled = "cancelled",
}

export interface Appointment {
  id: string;
  barangayId: string;
  barangay: Barangay;
  inhabitantId: string | null;
  inhabitant: Inhabitant | null;
  service: string;
  scheduledAt: Date;
  queueNumber: string | null;
  status: AppointmentStatus;
  checkedInAt: Date | null;
  servedAt: Date | null;
  completedAt: Date | null;
  notes: string | null;
  createdAt: Date;
}

export interface Feedback {
  id: string;
  barangayId: string;
  barangay: Barangay;
  inhabitantId: string | null;
  inhabitant: Inhabitant | null;
  rating: number;
  comment: string | null;
  service: string;
  certificateRequestId: string | null;
  certificateRequest: CertificateRequest | null;
  concernId: string | null;
  concern: Concern | null;
  isGrievance: boolean;
  escalatedAt: Date | null;
  createdAt: Date;
}

export interface DigitalId {
  id: string;
  inhabitantId: string;
  inhabitant: Inhabitant;
  idNumber: string;
  qrCode: string;
  issuedAt: Date;
  expiresAt: Date | null;
  isRevoked: boolean;
  photoUrl: string | null;
}

export interface HealthCampaign {
  id: string;
  barangayId: string;
  barangay: Barangay;
  name: string;
  kind: string;
  cohortFilter: any | null;
  startsAt: Date;
  endsAt: Date | null;
  isActive: boolean;
  records: HealthRecord[];
  createdAt: Date;
}

export interface HealthRecord {
  id: string;
  campaignId: string | null;
  campaign: HealthCampaign | null;
  inhabitantId: string;
  inhabitant: Inhabitant;
  kind: string;
  notes: string | null;
  recordedAt: Date;
  recordedById: string | null;
  followUpAt: Date | null;
}

export interface JobPost {
  id: string;
  barangayId: string;
  barangay: Barangay;
  title: string;
  employer: string;
  kind: string;
  description: string;
  location: string | null;
  salaryRange: string | null;
  contact: string | null;
  closesAt: Date | null;
  isActive: boolean;
  applications: JobApplication[];
  createdAt: Date;
}

export interface JobApplication {
  id: string;
  jobPostId: string;
  jobPost: JobPost;
  inhabitantId: string;
  inhabitant: Inhabitant;
  status: string;
  note: string | null;
  createdAt: Date;
}

export interface BenefitApplication {
  id: string;
  barangayId: string;
  barangay: Barangay;
  inhabitantId: string;
  inhabitant: Inhabitant;
  program: string;
  status: string;
  documents: string[];
  reviewedById: string | null;
  reviewNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PbCycle {
  id: string;
  barangayId: string;
  barangay: Barangay;
  title: string;
  year: number;
  opensAt: Date;
  closesAt: Date;
  status: string;
  options: PbOption[];
  votes: PbVote[];
  createdAt: Date;
}

export interface PbOption {
  id: string;
  cycleId: string;
  cycle: PbCycle;
  projectId: string | null;
  project: DevProject | null;
  label: string;
  detail: string | null;
  voteCount: number;
  votes: PbVote[];
}

export interface PbVote {
  id: string;
  cycleId: string;
  cycle: PbCycle;
  optionId: string;
  option: PbOption;
  inhabitantId: string;
  inhabitant: Inhabitant;
  createdAt: Date;
}

export interface Assembly {
  id: string;
  barangayId: string;
  barangay: Barangay;
  title: string;
  scheduledAt: Date;
  agenda: string | null;
  minutes: string | null;
  isPublished: boolean;
  createdAt: Date;
}

