// Static TypeScript Mock Dataset for CBMS Client API Simulation

export interface StaticCertificateType {
  id: string;
  barangayId: string;
  code: string;
  name: string;
  description: string;
  fee: number;
  validityDays: number;
  requirements: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaticCertificateRequest {
  id: string;
  barangayId: string;
  inhabitantId: string;
  typeId: string;
  referenceNo: string;
  purpose: string;
  status: string;
  fee: number;
  paymentMethod?: string | null;
  paidAt?: string | null;
  orNumber?: string | null;
  verifyCode?: string | null;
  source: string;
  type?: { name: string; code: string; fee: number };
  inhabitant?: { firstName: string; lastName: string; philsysNo?: string };
  createdAt: string;
  updatedAt: string;
}

export interface StaticLguDocRequest {
  id: string;
  barangayId: string;
  inhabitantId: string;
  docType: string;
  purpose: string;
  status: string;
  referenceNo: string;
  fee: number;
  paidAt?: string | null;
  orNumber?: string | null;
  remarks?: string | null;
  attachmentName?: string | null;
  attachmentUrl?: string | null;
  approvedAt?: string | null;
  releasedAt?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaticBlotterActionLog {
  id: string;
  actionTaken: string;
  officerName: string;
  officerRole: string;
  notes?: string | null;
  statusAfter?: string | null;
  timestamp: string;
  documentRef?: string | null;
}

export interface StaticBlotterEntry {
  id: string;
  entryNo: string;
  incidentNo?: string;
  barangayId: string;
  category: string;
  incidentAt: string;
  location: string;
  narrative: string;
  reportedBy: string;
  respondentName?: string | null;
  isConfidential: boolean;
  status: string;
  createdAt: string;
  kpCase?: { id: string; caseNo: string; stage: string } | null;
  actionsTaken?: StaticBlotterActionLog[];
}

export interface StaticKpCase {
  id: string;
  caseNo: string;
  caseNumber?: string;
  barangayId: string;
  subject: string;
  description?: string;
  stage: string;
  isConfidential: boolean;
  filedAt: string;
  closedAt?: string | null;
  settlementTerms?: string | null;
  cfaReason?: string | null;
  deadline: { target: string; isPast: boolean; daysRemaining: number };
  parties?: Array<{ id: string; role: "COMPLAINANT" | "RESPONDENT"; inhabitant?: { firstName: string; lastName: string } | null; name?: string }>;
  _count?: { hearings: number };
  createdAt: string;
}

export interface StaticSosAlert {
  id: string;
  kind: string;
  status: string;
  location?: string;
  note?: string | null;
  details?: string;
  latitude?: number | null;
  longitude?: number | null;
  isTest: boolean;
  barangayId: string;
  responseNote?: string | null;
  acknowledgedAt?: string | null;
  resolvedAt?: string | null;
  inhabitant?: { firstName: string; lastName: string; contactPhone?: string | null } | null;
  createdAt: string;
}

export interface StaticLedgerEntry {
  id: string;
  barangayId: string;
  postedAt: string;
  fund: "general" | "sk" | "gad" | "disaster" | "trust";
  accountCode: string;
  description: string;
  direction: "credit" | "debit";
  amount: number;
  orNumber?: string | null;
  dvNumber?: string | null;
  refType?: string | null;
}

export interface StaticOfficialReceipt {
  id: string;
  barangayId: string;
  orNumber: string;
  payorName: string;
  amount: number;
  particulars: string;
  issuedAt: string;
}

export interface StaticBudgetLine {
  id: string;
  expenseClass: "PS" | "MOOE" | "CO";
  accountCode: string;
  description: string;
  amount: number;
  obligated: number;
  disbursed: number;
}

export interface StaticBudget {
  id: string;
  barangayId: string;
  year: number;
  totalAmount: number;
  skFundAmount: number;
  status: string;
  lines: StaticBudgetLine[];
}

export interface StaticRptProperty {
  id: string;
  barangayId: string;
  taxDeclarationNo: string;
  ownerInhabitantId?: string | null;
  ownerName: string;
  propertyType: "residential" | "commercial" | "industrial" | "agricultural" | "special";
  assessedValue: number;
  marketValue: number;
  addressLine: string;
  purok?: string;
  lotNo?: string;
  blockNo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaticRptTaxDue {
  id: string;
  rptPropertyId: string;
  taxYear: number;
  basicTaxAmount: number;
  sefTaxAmount: number;
  penaltyAmount: number;
  totalAmount: number;
  paymentStatus: "unpaid" | "partially_paid" | "fully_paid" | "exempt";
  paidAt?: string | null;
  orNumber?: string | null;
  discountAmount?: number;
  isActive: boolean;
  createdAt?: string;
}

export const STATIC_BARANGAY_ID = "van6rdk";

export const STATIC_CERTIFICATE_TYPES: StaticCertificateType[] = [
  {
    id: "ct-clearance",
    barangayId: STATIC_BARANGAY_ID,
    code: "BC-01",
    name: "Barangay Clearance",
    description: "General multipurpose barangay clearance for employment, postal ID, and background check.",
    fee: 50,
    validityDays: 180,
    requirements: ["Valid Government ID", "Proof of Residency / Purok Endorsement"],
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "ct-indigency",
    barangayId: STATIC_BARANGAY_ID,
    code: "CI-02",
    name: "Certificate of Indigency",
    description: "Official certification for indigent residents to avail DSWD medical, burial, and educational financial assistance.",
    fee: 0,
    validityDays: 90,
    requirements: ["DSWD / 4Ps ID or Case Worker Assessment"],
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "ct-residency",
    barangayId: STATIC_BARANGAY_ID,
    code: "CR-03",
    name: "Certificate of Residency",
    description: "Proof of domicile for bank account opening, school enrollment, and court requirements.",
    fee: 50,
    validityDays: 180,
    requirements: ["Utility Bill or Lease Contract", "Voter Registration Record"],
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "ct-jobseeker",
    barangayId: STATIC_BARANGAY_ID,
    code: "FJ-04",
    name: "First-Time Jobseeker Certificate (RA 11261)",
    description: "Waives all government certification and clearance fees for first-time Filipino job applicants.",
    fee: 0,
    validityDays: 365,
    requirements: ["Oath of Undertaking", "Barangay Verification Form"],
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "ct-business",
    barangayId: STATIC_BARANGAY_ID,
    code: "BB-05",
    name: "Barangay Business Clearance",
    description: "Prerequisite clearance for commercial establishments, sari-sari stores, and local enterprises.",
    fee: 500,
    validityDays: 365,
    requirements: ["DTI / SEC Registration", "Locational / Contract of Lease"],
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export const STATIC_CERTIFICATE_REQUESTS: StaticCertificateRequest[] = [
  {
    id: "cert-001",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "uh8hppo",
    typeId: "ct-clearance",
    referenceNo: "BC-2026-00101",
    purpose: "Pre-employment requirement for BPO Company in Pasig City",
    status: "for_approval",
    fee: 50,
    paymentMethod: "CASH",
    paidAt: "2026-08-24T08:00:00.000Z",
    orNumber: "OR-2026-9901",
    verifyCode: "BCMS-9901-VERIFIED",
    source: "DESK",
    type: { name: "Barangay Clearance", code: "BC-01", fee: 50 },
    inhabitant: { firstName: "Juan", lastName: "Dela Cruz", philsysNo: "1234-5678-9012" },
    createdAt: "2026-08-24T06:00:00.000Z",
    updatedAt: "2026-08-24T08:00:00.000Z",
  },
  {
    id: "cert-002",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "xk3tyib",
    typeId: "ct-indigency",
    referenceNo: "CI-2026-00102",
    purpose: "Medical Assistance Application at Amang Rodriguez Memorial Medical Center",
    status: "released",
    fee: 0,
    paymentMethod: "EXEMPT",
    paidAt: null,
    orNumber: "EXEMPT-RA11032",
    verifyCode: "BCMS-IND-2026",
    source: "ONLINE",
    type: { name: "Certificate of Indigency", code: "CI-02", fee: 0 },
    inhabitant: { firstName: "Maria", lastName: "Santos", philsysNo: "8899-1122-3344" },
    createdAt: "2026-08-23T09:30:00.000Z",
    updatedAt: "2026-08-23T14:00:00.000Z",
  },
  {
    id: "cert-003",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "uh8hppo",
    typeId: "ct-residency",
    referenceNo: "CR-2026-00103",
    purpose: "Proof of Address for LandBank ATM Savings Account Opening",
    status: "released",
    fee: 50,
    paymentMethod: "GCASH",
    paidAt: "2026-08-22T10:15:00.000Z",
    orNumber: "OR-2026-8812",
    verifyCode: "BCMS-RES-8812",
    source: "KIOSK",
    type: { name: "Certificate of Residency", code: "CR-03", fee: 50 },
    inhabitant: { firstName: "Ricardo", lastName: "Lim", philsysNo: "5544-3322-1100" },
    createdAt: "2026-08-22T08:00:00.000Z",
    updatedAt: "2026-08-22T11:00:00.000Z",
  },
  {
    id: "cert-004",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "xk3tyib",
    typeId: "ct-jobseeker",
    referenceNo: "FJ-2026-00104",
    purpose: "First-Time Jobseeker Certification for SSS and Pag-IBIG registration",
    status: "for_approval",
    fee: 0,
    paymentMethod: "EXEMPT",
    paidAt: null,
    orNumber: "EXEMPT-RA11261",
    verifyCode: "BCMS-FTJ-11261",
    source: "DESK",
    type: { name: "First-Time Jobseeker Certificate", code: "FJ-04", fee: 0 },
    inhabitant: { firstName: "Angela", lastName: "Reyes", philsysNo: "7766-5544-3322" },
    createdAt: "2026-08-24T02:00:00.000Z",
    updatedAt: "2026-08-24T02:00:00.000Z",
  },
  {
    id: "cert-005",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "uh8hppo",
    typeId: "ct-business",
    referenceNo: "BB-2026-00105",
    purpose: "Barangay Business Clearance for Sari-sari Store & Rice Retail",
    status: "awaiting_payment",
    fee: 500,
    paymentMethod: null,
    paidAt: null,
    orNumber: null,
    source: "DESK",
    type: { name: "Barangay Business Clearance", code: "BB-05", fee: 500 },
    inhabitant: { firstName: "Eduardo", lastName: "Gonzales", philsysNo: "9988-7766-5544" },
    createdAt: "2026-08-23T15:00:00.000Z",
    updatedAt: "2026-08-23T15:00:00.000Z",
  },
];

export const STATIC_LGU_REQUESTS: StaticLguDocRequest[] = [
  {
    id: "lgu-001",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "uh8hppo",
    docType: "business_permit",
    purpose: "New Application for Sari-sari Store & E-Load Business Endorsement FY 2026",
    status: "pending",
    referenceNo: "LGU-2026-08142",
    fee: 1500,
    paidAt: null,
    orNumber: null,
    remarks: "Submitted initial DTI registration certificate and Barangay Clearance endorsement.",
    attachmentName: "DTI_Certificate_2026.pdf",
    attachmentUrl: null,
    approvedAt: null,
    releasedAt: null,
    isActive: true,
    createdAt: "2026-08-22T08:00:00.000Z",
    updatedAt: "2026-08-22T08:00:00.000Z",
  },
  {
    id: "lgu-002",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "xk3tyib",
    docType: "building_permit",
    purpose: "Locational Clearance & 2-Storey Residential House Renovation Endorsement",
    status: "under_review",
    referenceNo: "LGU-2026-09210",
    fee: 2500,
    paidAt: "2026-08-23T04:00:00.000Z",
    orNumber: "OR-2026-44910",
    remarks: "Architectural blueprint and lot title validated by Barangay Works Inspector.",
    attachmentName: "Renovation_Blueprints_Signed.pdf",
    attachmentUrl: null,
    approvedAt: null,
    releasedAt: null,
    isActive: true,
    createdAt: "2026-08-21T07:00:00.000Z",
    updatedAt: "2026-08-23T04:00:00.000Z",
  },
  {
    id: "lgu-003",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "uh8hppo",
    docType: "zoning_clearance",
    purpose: "Commercial Land Use & Zoning Certification for Auto Repair Shop",
    status: "approved",
    referenceNo: "LGU-2026-07431",
    fee: 1000,
    paidAt: "2026-08-20T03:00:00.000Z",
    orNumber: "OR-2026-38192",
    remarks: "Endorsed by Punong Barangay. Forwarded to Marikina City Planning & Development Office.",
    attachmentName: "Zoning_Vicinity_Map.pdf",
    attachmentUrl: null,
    approvedAt: "2026-08-23T09:00:00.000Z",
    releasedAt: null,
    isActive: true,
    createdAt: "2026-08-19T06:00:00.000Z",
    updatedAt: "2026-08-23T09:00:00.000Z",
  },
  {
    id: "lgu-004",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "xk3tyib",
    docType: "sanitary_permit",
    purpose: "Annual Health & Sanitation Inspection Clearance for Food Canteen / Eatery",
    status: "released",
    referenceNo: "LGU-2026-06104",
    fee: 800,
    paidAt: "2026-08-16T02:00:00.000Z",
    orNumber: "OR-2026-29104",
    remarks: "Water bacteriological test passed and food handler health cards verified.",
    attachmentName: "Water_Test_Lab_Results.pdf",
    attachmentUrl: null,
    approvedAt: "2026-08-17T03:00:00.000Z",
    releasedAt: "2026-08-18T05:00:00.000Z",
    isActive: true,
    createdAt: "2026-08-15T01:00:00.000Z",
    updatedAt: "2026-08-18T05:00:00.000Z",
  },
  {
    id: "lgu-005",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "uh8hppo",
    docType: "rpt_clearance",
    purpose: "Real Property Tax Assessor Clearance & Assessment Endorsement for Transfer of Ownership",
    status: "rejected",
    referenceNo: "LGU-2026-05299",
    fee: 500,
    paidAt: null,
    orNumber: null,
    remarks: "Returned to applicant: Unpaid previous year tax declaration dues pending at City Treasurer.",
    attachmentName: "Tax_Declaration_Copy.pdf",
    attachmentUrl: null,
    approvedAt: null,
    releasedAt: null,
    isActive: true,
    createdAt: "2026-08-12T04:00:00.000Z",
    updatedAt: "2026-08-14T02:00:00.000Z",
  },
];

export const STATIC_BLOTTER_ENTRIES: StaticBlotterEntry[] = [
  {
    id: "blotter-001",
    entryNo: "BLT-2026-001",
    incidentNo: "BLT-2026-001",
    barangayId: STATIC_BARANGAY_ID,
    category: "dispute",
    incidentAt: "2026-08-22T14:30:00.000Z",
    location: "Purok 3 Bonifacio St, Barangka",
    narrative: "Boundary and concrete fence extension altercation between neighboring properties.",
    reportedBy: "Juan Dela Cruz",
    respondentName: "Pedro Penduko",
    isConfidential: false,
    status: "active",
    createdAt: "2026-08-22T15:00:00.000Z",
    kpCase: { id: "kp-001", caseNo: "KP-2026-001", stage: "mediation" },
    actionsTaken: [
      {
        id: "act-101",
        actionTaken: "Initial Intake & Sworn Narrative Recorded",
        officerName: "Officer Rommel Reyes",
        officerRole: "Executive Officer, Barangay Tanod",
        notes: "Complainant Juan Dela Cruz appeared in person. Documented boundary dispute regarding recent concrete footing extension.",
        statusAfter: "active",
        timestamp: "2026-08-22T15:00:00.000Z",
        documentRef: "Blotter Sheet No. 2026-08-01",
      },
      {
        id: "act-102",
        actionTaken: "Ocular Inspection & Purok Validation",
        officerName: "Tanod Mobile Patrol Team & Kagawad on Infrastructure",
        officerRole: "Barangay Tanod / Committee on Infrastructure",
        notes: "On-site ocular verification conducted at Purok 3 Bonifacio St. Verified concrete wall footing extended approximately 1.2m into access path.",
        statusAfter: "active",
        timestamp: "2026-08-22T16:30:00.000Z",
        documentRef: "Ocular Inspection Report #2026-044",
      },
      {
        id: "act-103",
        actionTaken: "Summons / Notice of Hearing Issued (KP Form 7)",
        officerName: "Hon. Eduardo M. Santos",
        officerRole: "Punong Barangay",
        notes: "Official Notice to Appear served to respondent Pedro Penduko for 1st Mediation Conference scheduled at the Barangay Hall.",
        statusAfter: "under_mediation",
        timestamp: "2026-08-23T09:00:00.000Z",
        documentRef: "Summons Subpoena KP-7-001",
      },
      {
        id: "act-104",
        actionTaken: "Endorsed to Katarungang Pambarangay (KP-2026-001)",
        officerName: "Atty. Fernando Cruz",
        officerRole: "Lupon Secretary",
        notes: "Case docketed under KP-2026-001. Formal mediation proceedings opened before the Lupon Tagapamayapa.",
        statusAfter: "endorsed_kp",
        timestamp: "2026-08-24T10:00:00.000Z",
        documentRef: "KP Docket Notice #KP-2026-001",
      },
    ],
  },
  {
    id: "blotter-002",
    entryNo: "BLT-2026-002",
    incidentNo: "BLT-2026-002",
    barangayId: STATIC_BARANGAY_ID,
    category: "noise",
    incidentAt: "2026-08-23T22:45:00.000Z",
    location: "Purok 1 Rizal Ave, Barangka",
    narrative: "Loud videoke and public disturbance operating past 10:00 PM curfew hours.",
    reportedBy: "Carmen Santos",
    respondentName: "Alex Bautista",
    isConfidential: false,
    status: "resolved",
    createdAt: "2026-08-23T23:00:00.000Z",
    kpCase: null,
    actionsTaken: [
      {
        id: "act-201",
        actionTaken: "Desk Intake & Hotline Dispatch Call",
        officerName: "Tanod Desk Officer",
        officerRole: "Duty Tanod",
        notes: "Emergency hotline call logged regarding excessive videoke noise echoing across residential cluster past curfew.",
        statusAfter: "active",
        timestamp: "2026-08-23T23:00:00.000Z",
        documentRef: "Hotline Call Log #8821",
      },
      {
        id: "act-202",
        actionTaken: "Tanod Mobile Patrol Unit Dispatched",
        officerName: "Mobile Unit 2 (Ex-O Reyes & Tanod Bautista)",
        officerRole: "Barangay Public Safety Officers",
        notes: "Patrol vehicle arrived at venue within 12 minutes. Sound level confirmed exceeding 85dB at property line.",
        statusAfter: "in_progress",
        timestamp: "2026-08-23T23:15:00.000Z",
        documentRef: "Patrol Log Entry #2026-08-112",
      },
      {
        id: "act-203",
        actionTaken: "Verbal Warning & Voluntary Compliance",
        officerName: "Executive Officer Rommel Reyes",
        officerRole: "Executive Officer, Barangay Tanod",
        notes: "Respondent Alex Bautista complied immediately by powering down sound system. Signed 1st Offense Warning undertaking.",
        statusAfter: "resolved",
        timestamp: "2026-08-23T23:25:00.000Z",
        documentRef: "Barangay Ordinance Citation #OR-2026-089",
      },
      {
        id: "act-204",
        actionTaken: "Case Closed & Archived",
        officerName: "Maria Clara Santos",
        officerRole: "Barangay Secretary",
        notes: "Follow-up monitoring patrol at 01:00 AM confirmed no recurring noise. Case marked resolved.",
        statusAfter: "resolved",
        timestamp: "2026-08-24T08:00:00.000Z",
        documentRef: "Blotter Resolution Slip #BLT-RES-002",
      },
    ],
  },
  {
    id: "blotter-003",
    entryNo: "BLT-2026-003",
    incidentNo: "BLT-2026-003",
    barangayId: STATIC_BARANGAY_ID,
    category: "theft",
    incidentAt: "2026-08-21T11:15:00.000Z",
    location: "Purok 4 Mabini St",
    narrative: "Missing mountain bicycle parked outside commercial establishment. CCTV requested.",
    reportedBy: "Mark Lopez",
    respondentName: "Unidentified Suspect",
    isConfidential: false,
    status: "active",
    createdAt: "2026-08-21T12:00:00.000Z",
    kpCase: null,
    actionsTaken: [
      {
        id: "act-301",
        actionTaken: "Incident Blotter Booking",
        officerName: "Officer Rommel Reyes",
        officerRole: "Executive Officer, Barangay Tanod",
        notes: "Complainant Mark Lopez presented purchase invoice and serial number (TRX-9982) for stolen mountain bike.",
        statusAfter: "active",
        timestamp: "2026-08-21T12:00:00.000Z",
        documentRef: "Blotter Entry Sheet #BLT-2026-003",
      },
      {
        id: "act-302",
        actionTaken: "Barangay CCTV Footage Extraction",
        officerName: "BDRRMC IT & Operations Desk",
        officerRole: "Barangay Command & Control Center",
        notes: "Retrieved 1080p security video from Camera 04 (Mabini-Bonifacio corner). Identified suspect wearing black cap leaving east on foot at 11:18 AM.",
        statusAfter: "investigating",
        timestamp: "2026-08-21T13:30:00.000Z",
        documentRef: "CCTV Chain of Custody Ref #CCTV-2026-031",
      },
      {
        id: "act-303",
        actionTaken: "Police Endorsement & Evidence Transmittal",
        officerName: "Hon. Eduardo M. Santos",
        officerRole: "Punong Barangay",
        notes: "Transmitted formal Endorsement Letter with thumb drive of CCTV footage to Marikina Police Sub-Station 3 for investigation and case buildup.",
        statusAfter: "referred_pnp",
        timestamp: "2026-08-21T15:00:00.000Z",
        documentRef: "PNP Endorsement Form #BRGY-PNP-2026-052",
      },
    ],
  },
  {
    id: "blotter-004",
    entryNo: "BLT-2026-004",
    incidentNo: "BLT-2026-004",
    barangayId: STATIC_BARANGAY_ID,
    category: "vawc",
    incidentAt: "2026-08-20T19:00:00.000Z",
    location: "Purok 2 M.L. Quezon St",
    narrative: "Domestic verbal argument referred to Barangay VAWC Desk for protective assessment.",
    reportedBy: "Confidential Resident",
    respondentName: "Confidential",
    isConfidential: true,
    status: "endorsed",
    createdAt: "2026-08-20T20:00:00.000Z",
    kpCase: null,
    actionsTaken: [
      {
        id: "act-401",
        actionTaken: "Confidential Intake in VAW Desk Safe Room",
        officerName: "Elena Rivera",
        officerRole: "Barangay VAW Desk Officer",
        notes: "Conducted private, trauma-informed interview pursuant to RA 9262 protocols. Recorded confidential victim narrative and risk assessment.",
        statusAfter: "active",
        timestamp: "2026-08-20T20:00:00.000Z",
        documentRef: "BIMS Form D1 Intake #VAWC-2026-004",
      },
      {
        id: "act-402",
        actionTaken: "Medical Examination Referral Issued",
        officerName: "Elena Rivera",
        officerRole: "Barangay VAW Desk Officer",
        notes: "Issued official Medical Referral Slip to Amang Rodriguez Memorial Medical Center (ARMMC) for medico-legal assessment.",
        statusAfter: "medical_eval",
        timestamp: "2026-08-20T20:45:00.000Z",
        documentRef: "Medical Referral Slip #MED-2026-019",
      },
      {
        id: "act-403",
        actionTaken: "Barangay Protection Order (BPO) Processed & Issued",
        officerName: "Hon. Eduardo M. Santos",
        officerRole: "Punong Barangay",
        notes: "Ex-parte 15-day Barangay Protection Order (BPO) issued under Sec. 15 of RA 9262, prohibiting respondent within 500 meters of victim and residence.",
        statusAfter: "bpo_issued",
        timestamp: "2026-08-21T08:30:00.000Z",
        documentRef: "BPO Form 2 Order #BPO-2026-004",
      },
      {
        id: "act-404",
        actionTaken: "CSWDO & PNP Women's Desk Case Endorsement",
        officerName: "Elena Rivera",
        officerRole: "Barangay VAW Desk Officer",
        notes: "Formally endorsed case packet to Marikina City Social Welfare and Development Office (CSWDO) for continuous psychosocial support and protective monitoring.",
        statusAfter: "endorsed",
        timestamp: "2026-08-21T11:00:00.000Z",
        documentRef: "CSWDO Transmittal #CSWDO-BAR-2026-088",
      },
    ],
  },
  {
    id: "blotter-005",
    entryNo: "BLT-2026-005",
    incidentNo: "BLT-2026-005",
    barangayId: STATIC_BARANGAY_ID,
    category: "property",
    incidentAt: "2026-08-19T08:30:00.000Z",
    location: "Purok 5 Del Pilar St",
    narrative: "Blocked canal culvert causing stagnant drainage spillover into adjacent residential lot.",
    reportedBy: "Elena Ramos",
    respondentName: "Mario Gomez",
    isConfidential: false,
    status: "active",
    createdAt: "2026-08-19T09:00:00.000Z",
    kpCase: { id: "kp-002", caseNo: "KP-2026-002", stage: "conciliation" },
    actionsTaken: [
      {
        id: "act-501",
        actionTaken: "Complaint Intake & Photo Evidence Logged",
        officerName: "Duty Tanod Desk",
        officerRole: "Barangay Public Safety Desk",
        notes: "Elena Ramos filed formal complaint regarding drainage obstruction caused by neighboring construction debris.",
        statusAfter: "active",
        timestamp: "2026-08-19T09:00:00.000Z",
        documentRef: "Blotter Sheet #BLT-2026-005",
      },
      {
        id: "act-502",
        actionTaken: "Joint Sanitation & Engineering Site Inspection",
        officerName: "Kagawad on Environmental Sanitation & Maintenance Crew",
        officerRole: "Barangay Council & Engineering Staff",
        notes: "Inspected Purok 5 drainage line. Found hardened gravel and cement runoff clogging municipal culvert. Immediate partial clearance performed.",
        statusAfter: "investigating",
        timestamp: "2026-08-19T14:00:00.000Z",
        documentRef: "Sanitation Inspection Sheet #SAN-2026-012",
      },
      {
        id: "act-503",
        actionTaken: "Notice of Conciliation Issued (KP-2026-002)",
        officerName: "Atty. Fernando Cruz",
        officerRole: "Lupon Secretary",
        notes: "Elevated to Katarungang Pambarangay for cost settlement and permanent pipe rehabilitation agreements.",
        statusAfter: "endorsed_kp",
        timestamp: "2026-08-20T10:00:00.000Z",
        documentRef: "KP Conciliation Notice #KP-2026-002",
      },
    ],
  },
];

export const STATIC_KP_CASES: StaticKpCase[] = [
  {
    id: "kp-001",
    caseNo: "KP-2026-001",
    caseNumber: "KP-2026-001",
    barangayId: STATIC_BARANGAY_ID,
    subject: "Unsettled Commercial Rental Debt",
    description: "Unpaid stall rental arrears of ₱15,000 for 3 consecutive months.",
    stage: "mediation",
    filedAt: "2026-08-21T10:00:00.000Z",
    isConfidential: false,
    deadline: { target: "2026-09-05T10:00:00.000Z", isPast: false, daysRemaining: 12 },
    parties: [
      { id: "p1", role: "COMPLAINANT", name: "Juan Dela Cruz", inhabitant: { firstName: "Juan", lastName: "Dela Cruz" } },
      { id: "p2", role: "RESPONDENT", name: "Pedro Penduko", inhabitant: { firstName: "Pedro", lastName: "Penduko" } },
    ],
    _count: { hearings: 2 },
    createdAt: "2026-08-21T10:00:00.000Z",
  },
  {
    id: "kp-002",
    caseNo: "KP-2026-002",
    caseNumber: "KP-2026-002",
    barangayId: STATIC_BARANGAY_ID,
    subject: "Right-of-Way & Pathway Obstruction",
    description: "Construction materials blocking shared pathway to interior residential units.",
    stage: "conciliation",
    filedAt: "2026-08-16T14:00:00.000Z",
    isConfidential: false,
    deadline: { target: "2026-08-31T14:00:00.000Z", isPast: false, daysRemaining: 7 },
    parties: [
      { id: "p3", role: "COMPLAINANT", name: "Ricardo Lim", inhabitant: { firstName: "Ricardo", lastName: "Lim" } },
      { id: "p4", role: "RESPONDENT", name: "Alberto Reyes", inhabitant: { firstName: "Alberto", lastName: "Reyes" } },
    ],
    _count: { hearings: 1 },
    createdAt: "2026-08-16T14:00:00.000Z",
  },
  {
    id: "kp-003",
    caseNo: "KP-2026-003",
    caseNumber: "KP-2026-003",
    barangayId: STATIC_BARANGAY_ID,
    subject: "Minor Physical Altercation Settlement",
    description: "Scuffle following a basketball dispute; parties agreed to amicable settlement.",
    stage: "settled",
    filedAt: "2026-08-09T16:00:00.000Z",
    closedAt: "2026-08-23T16:00:00.000Z",
    settlementTerms: "Parties signed amicable agreement; respondent paid medical reimbursement.",
    isConfidential: false,
    deadline: { target: "2026-08-23T16:00:00.000Z", isPast: true, daysRemaining: 0 },
    parties: [
      { id: "p5", role: "COMPLAINANT", name: "Gary Cruz", inhabitant: { firstName: "Gary", lastName: "Cruz" } },
      { id: "p6", role: "RESPONDENT", name: "Dennis Santos", inhabitant: { firstName: "Dennis", lastName: "Santos" } },
    ],
    _count: { hearings: 3 },
    createdAt: "2026-08-09T16:00:00.000Z",
  },
  {
    id: "kp-004",
    caseNo: "KP-2026-004",
    caseNumber: "KP-2026-004",
    barangayId: STATIC_BARANGAY_ID,
    subject: "Animal Nuisance & Uncontrolled Barking",
    description: "Continuous disturbance and lack of sanitation in backyard animal pen.",
    stage: "filed",
    filedAt: "2026-08-23T11:00:00.000Z",
    isConfidential: false,
    deadline: { target: "2026-09-06T11:00:00.000Z", isPast: false, daysRemaining: 14 },
    parties: [
      { id: "p7", role: "COMPLAINANT", name: "Teresa Rivera", inhabitant: { firstName: "Teresa", lastName: "Rivera" } },
      { id: "p8", role: "RESPONDENT", name: "Manuel Tan", inhabitant: { firstName: "Manuel", lastName: "Tan" } },
    ],
    _count: { hearings: 0 },
    createdAt: "2026-08-23T11:00:00.000Z",
  },
];

export const STATIC_SOS_ALERTS: StaticSosAlert[] = [
  {
    id: "sos-001",
    kind: "medical",
    status: "active",
    location: "Block 4 Lot 12 Purok 3 (Near Barangka Chapel)",
    note: "Senior citizen experiencing severe chest tightness and shortness of breath. Tanod and BHW responding.",
    details: "Senior citizen experiencing severe chest tightness and shortness of breath. Tanod and BHW responding.",
    latitude: 14.6341,
    longitude: 121.0967,
    isTest: false,
    barangayId: STATIC_BARANGAY_ID,
    inhabitant: { firstName: "Maria", lastName: "Santos", contactPhone: "09171234567" },
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: "sos-002",
    kind: "fire",
    status: "dispatched",
    location: "Purok 1 Riverside Alley",
    note: "Sparks on electric distribution line; BFP Marikina sub-station alerted.",
    details: "Sparks on electric distribution line; BFP Marikina sub-station alerted.",
    latitude: 14.6355,
    longitude: 121.0981,
    isTest: false,
    barangayId: STATIC_BARANGAY_ID,
    inhabitant: { firstName: "Barangay Watchman", lastName: "Tanod", contactPhone: "09189876543" },
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "sos-003",
    kind: "police",
    status: "resolved",
    location: "Corner J.P. Rizal and Bonifacio St",
    note: "Minor motorcycle scrape incident; Lupon officers attended and traffic resolved.",
    details: "Minor motorcycle scrape incident; Lupon officers attended and traffic resolved.",
    latitude: 14.6362,
    longitude: 121.0955,
    isTest: false,
    barangayId: STATIC_BARANGAY_ID,
    inhabitant: { firstName: "Mark", lastName: "Bautista", contactPhone: "09205551234" },
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: "sos-004",
    kind: "flood",
    status: "resolved",
    location: "Marikina Riverbanks Level 1 Sensor",
    note: "Water level sensor connectivity diagnostic test drill.",
    details: "Water level sensor connectivity diagnostic test drill.",
    latitude: 14.633,
    longitude: 121.094,
    isTest: true,
    barangayId: STATIC_BARANGAY_ID,
    inhabitant: { firstName: "DRRM Monitoring", lastName: "Officer", contactPhone: "09990001122" },
    createdAt: "2026-08-23T06:00:00.000Z",
  },
];

export const STATIC_LEDGER_ENTRIES: StaticLedgerEntry[] = [
  {
    id: "led-01",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-09-11T09:30:00.000Z",
    fund: "general",
    accountCode: "4-02-01-040",
    description: "Clearance & Certification Fees collection (Batch OR-2026-00115 to 00118)",
    direction: "credit",
    amount: 1400,
    orNumber: "OR-2026-00118",
    refType: "official_receipt"
  },
  {
    id: "led-02",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-09-10T14:15:00.000Z",
    fund: "disaster",
    accountCode: "5-02-03-080",
    description: "First aid & trauma kits replenishment for BDRRMC rescue team",
    direction: "debit",
    amount: 36000,
    dvNumber: "DV-DRRM-2026-015",
    refType: "disbursement_voucher"
  },
  {
    id: "led-03",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-09-08T11:00:00.000Z",
    fund: "sk",
    accountCode: "5-02-99-010",
    description: "High school scholarship learning materials & book assistance grants",
    direction: "debit",
    amount: 65000,
    dvNumber: "DV-SK-2026-008",
    refType: "disbursement_voucher"
  },
  {
    id: "led-04",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-09-06T15:40:00.000Z",
    fund: "gad",
    accountCode: "5-02-03-080",
    description: "Maternal health checkup kits & hygiene supplies for Barangay Health Clinic",
    direction: "debit",
    amount: 31200,
    dvNumber: "DV-GAD-2026-010",
    refType: "disbursement_voucher"
  },
  {
    id: "led-05",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-09-05T10:20:00.000Z",
    fund: "general",
    accountCode: "5-02-13-060",
    description: "Preventive maintenance, oil change & fuel replenishment for Patrol Mobile 01 & 02",
    direction: "debit",
    amount: 32800,
    dvNumber: "DV-2026-09-003",
    refType: "disbursement_voucher"
  },
  {
    id: "led-06",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-09-03T16:00:00.000Z",
    fund: "general",
    accountCode: "4-02-01-040",
    description: "Business clearance & inspection fees — Commercial establishments",
    direction: "credit",
    amount: 18700,
    orNumber: "OR-2026-00113",
    refType: "official_receipt"
  },
  {
    id: "led-07",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-09-01T08:00:00.000Z",
    fund: "general",
    accountCode: "4-01-01-010",
    description: "National Tax Allotment (NTA / IRA) — Monthly Allotment Release (September 2026)",
    direction: "credit",
    amount: 2375000,
    orNumber: "NTA-2026-09",
    refType: "bank_credit"
  },
  {
    id: "led-08",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-08-30T16:45:00.000Z",
    fund: "general",
    accountCode: "5-01-01-010",
    description: "Honoraria & personnel compensation — Punong Barangay & Kagawads (August 2026)",
    direction: "debit",
    amount: 450000,
    dvNumber: "DV-2026-08-041",
    refType: "disbursement_voucher"
  },
  {
    id: "led-09",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-08-30T16:45:00.000Z",
    fund: "general",
    accountCode: "5-01-02-990",
    description: "Honoraria & subsistence allowances — Barangay Tanods & Security Force (24 personnel)",
    direction: "debit",
    amount: 192000,
    dvNumber: "DV-2026-08-042",
    refType: "disbursement_voucher"
  },
  {
    id: "led-10",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-08-30T16:45:00.000Z",
    fund: "general",
    accountCode: "5-01-02-010",
    description: "Honoraria — Appointed Barangay Officials (Secretary, Treasurer)",
    direction: "debit",
    amount: 100000,
    dvNumber: "DV-2026-08-043",
    refType: "disbursement_voucher"
  },
  {
    id: "led-11",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-08-28T13:30:00.000Z",
    fund: "general",
    accountCode: "4-02-02-010",
    description: "Gymnasium & Multi-Purpose Covered Court rental fees — Inter-Purok Invitational",
    direction: "credit",
    amount: 3500,
    orNumber: "OR-2026-00111",
    refType: "official_receipt"
  },
  {
    id: "led-12",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-08-27T10:15:00.000Z",
    fund: "general",
    accountCode: "5-02-04-010",
    description: "Meralco electric utility bills for Barangay Complex & Outposts (August 2026)",
    direction: "debit",
    amount: 78450,
    dvNumber: "DV-2026-08-044",
    refType: "disbursement_voucher"
  },
  {
    id: "led-13",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-08-26T14:30:00.000Z",
    fund: "gad",
    accountCode: "5-02-02-010",
    description: "Livelihood skills training workshop (Baking & Pastry) for solo parents and women",
    direction: "debit",
    amount: 58000,
    dvNumber: "DV-GAD-2026-008",
    refType: "disbursement_voucher"
  },
  {
    id: "led-14",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-08-25T11:00:00.000Z",
    fund: "general",
    accountCode: "5-02-04-010",
    description: "Manila Water utility bills for Barangay Hall & Health Center",
    direction: "debit",
    amount: 14320,
    dvNumber: "DV-2026-08-045",
    refType: "disbursement_voucher"
  },
  {
    id: "led-15",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-08-24T09:00:00.000Z",
    fund: "trust",
    accountCode: "1-07-04-020",
    description: "Progress Billing #2 — Riverbank drainage desilting & flood buffer wall construction",
    direction: "debit",
    amount: 385000,
    dvNumber: "DV-BDF-2026-014",
    refType: "disbursement_voucher"
  },
  {
    id: "led-16",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-08-22T15:20:00.000Z",
    fund: "general",
    accountCode: "4-02-01-040",
    description: "Tricycle franchise clearance & TODA supervision fees",
    direction: "credit",
    amount: 4500,
    orNumber: "OR-2026-00108",
    refType: "official_receipt"
  },
  {
    id: "led-17",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-08-20T10:00:00.000Z",
    fund: "general",
    accountCode: "4-02-02-010",
    description: "Barangka Wet & Dry Market stall rental collections (August 2026)",
    direction: "credit",
    amount: 6800,
    orNumber: "OR-2026-00107",
    refType: "official_receipt"
  },
  {
    id: "led-18",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-08-19T14:00:00.000Z",
    fund: "disaster",
    accountCode: "5-02-12-030",
    description: "Procurement of 500 emergency relief food packs (canned goods, rice, hygiene packs)",
    direction: "debit",
    amount: 187500,
    dvNumber: "DV-DRRM-2026-009",
    refType: "disbursement_voucher"
  },
  {
    id: "led-19",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-08-18T11:30:00.000Z",
    fund: "sk",
    accountCode: "5-02-99-010",
    description: "Barangka Youth Inter-Purok Basketball & Volleyball League uniforms and kits",
    direction: "debit",
    amount: 92000,
    dvNumber: "DV-SK-2026-005",
    refType: "disbursement_voucher"
  },
  {
    id: "led-20",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-08-16T16:00:00.000Z",
    fund: "gad",
    accountCode: "5-02-12-040",
    description: "VAWC Crisis Desk emergency survivor assistance & temporary shelter subsidy",
    direction: "debit",
    amount: 42500,
    dvNumber: "DV-GAD-2026-006",
    refType: "disbursement_voucher"
  },
  {
    id: "led-21",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-08-15T09:30:00.000Z",
    fund: "general",
    accountCode: "4-01-02-040",
    description: "Real Property Tax (RPT) 50% City Barangay Share (Q2 2026 Remittance)",
    direction: "credit",
    amount: 842500,
    orNumber: "RPT-2026-Q2",
    refType: "bank_credit"
  },
  {
    id: "led-22",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-08-14T10:45:00.000Z",
    fund: "general",
    accountCode: "5-02-03-010",
    description: "Procurement of quarterly office, printing, and document supplies",
    direction: "debit",
    amount: 48200,
    dvNumber: "DV-2026-08-048",
    refType: "disbursement_voucher"
  },
  {
    id: "led-23",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-08-12T13:00:00.000Z",
    fund: "trust",
    accountCode: "4-01-01-010",
    description: "Local Government Support Fund (LGSF) — Financial Assistance grant from DILG",
    direction: "credit",
    amount: 1500000,
    orNumber: "LGSF-2026-GR",
    refType: "bank_credit"
  },
  {
    id: "led-24",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-08-10T14:30:00.000Z",
    fund: "disaster",
    accountCode: "5-02-13-050",
    description: "Calibration and battery replacement for Barangka early flood warning siren system",
    direction: "debit",
    amount: 28400,
    dvNumber: "DV-DRRM-2026-011",
    refType: "disbursement_voucher"
  },
  {
    id: "led-25",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-08-05T11:00:00.000Z",
    fund: "sk",
    accountCode: "5-02-02-010",
    description: "SK Youth Leadership Summit & anti-drug awareness camp supplies",
    direction: "debit",
    amount: 45000,
    dvNumber: "DV-SK-2026-007",
    refType: "disbursement_voucher"
  },
  {
    id: "led-26",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-08-01T08:00:00.000Z",
    fund: "general",
    accountCode: "4-01-01-010",
    description: "National Tax Allotment (NTA / IRA) — Monthly Allotment Release (August 2026)",
    direction: "credit",
    amount: 2375000,
    orNumber: "NTA-2026-08",
    refType: "bank_credit"
  },
  {
    id: "led-27",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-08-01T08:30:00.000Z",
    fund: "sk",
    accountCode: "4-01-01-010",
    description: "10% SK Fund mandatory statutory transfer from General Fund (August 2026)",
    direction: "credit",
    amount: 237500,
    orNumber: "SK-TR-08",
    refType: "fund_transfer"
  },
  {
    id: "led-28",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-08-01T08:30:00.000Z",
    fund: "disaster",
    accountCode: "4-01-01-010",
    description: "5% BDRRMF statutory allocation monthly transfer (August 2026)",
    direction: "credit",
    amount: 118750,
    orNumber: "DRRM-TR-08",
    refType: "fund_transfer"
  },
  {
    id: "led-29",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-08-01T08:30:00.000Z",
    fund: "gad",
    accountCode: "4-01-01-010",
    description: "5% GAD statutory allocation monthly transfer (August 2026)",
    direction: "credit",
    amount: 118750,
    orNumber: "GAD-TR-08",
    refType: "fund_transfer"
  },
  {
    id: "led-30",
    barangayId: STATIC_BARANGAY_ID,
    postedAt: "2026-07-25T14:00:00.000Z",
    fund: "trust",
    accountCode: "1-07-04-010",
    description: "Solar street lighting installation along Dela Paz & A. Bonifacio (Phase 1)",
    direction: "debit",
    amount: 450000,
    dvNumber: "DV-BDF-2026-012",
    refType: "disbursement_voucher"
  }
];

export const STATIC_OFFICIAL_RECEIPTS: StaticOfficialReceipt[] = [
  {
    id: "or-101",
    barangayId: STATIC_BARANGAY_ID,
    orNumber: "OR-2026-00101",
    payorName: "Mateo S. Gonzales",
    amount: 150,
    particulars: "Barangay Clearance for Employment",
    issuedAt: "2026-08-10T09:15:00.000Z"
  },
  {
    id: "or-102",
    barangayId: STATIC_BARANGAY_ID,
    orNumber: "OR-2026-00102",
    payorName: "Barangka River Cafe & Grill / Lea Salonga",
    amount: 2500,
    particulars: "Barangay Business Clearance (Annual Renewal)",
    issuedAt: "2026-08-11T10:30:00.000Z"
  },
  {
    id: "or-103",
    barangayId: STATIC_BARANGAY_ID,
    orNumber: "OR-2026-00103",
    payorName: "Aling Tina's Sari-Sari Store / Cristina Santos",
    amount: 500,
    particulars: "Barangay Business Clearance & Signboard Fee",
    issuedAt: "2026-08-12T11:45:00.000Z"
  },
  {
    id: "or-104",
    barangayId: STATIC_BARANGAY_ID,
    orNumber: "OR-2026-00104",
    payorName: "Ricardo De Jesus",
    amount: 50,
    particulars: "Certificate of Indigency (PAO Legal Endorsement)",
    issuedAt: "2026-08-14T08:50:00.000Z"
  },
  {
    id: "or-105",
    barangayId: STATIC_BARANGAY_ID,
    orNumber: "OR-2026-00105",
    payorName: "MegaPrime Hardware & Const. Supplies",
    amount: 4200,
    particulars: "Barangay Business Clearance & Heavy Truck Staging Fee",
    issuedAt: "2026-08-15T14:10:00.000Z"
  },
  {
    id: "or-106",
    barangayId: STATIC_BARANGAY_ID,
    orNumber: "OR-2026-00106",
    payorName: "Maria Clara B. Santos",
    amount: 100,
    particulars: "Certificate of Residency (PhilSys / DFA Passport)",
    issuedAt: "2026-08-18T10:00:00.000Z"
  },
  {
    id: "or-107",
    barangayId: STATIC_BARANGAY_ID,
    orNumber: "OR-2026-00107",
    payorName: "Barangka Wet & Dry Market Vendors Coop",
    amount: 6800,
    particulars: "Market Stall Rental & Environmental Maintenance Fee",
    issuedAt: "2026-08-20T10:00:00.000Z"
  },
  {
    id: "or-108",
    barangayId: STATIC_BARANGAY_ID,
    orNumber: "OR-2026-00108",
    payorName: "Danilo M. Cruz",
    amount: 75,
    particulars: "Barangay Clearance for Tricycle Franchise Renewal (TODA Zone 3)",
    issuedAt: "2026-08-22T15:20:00.000Z"
  },
  {
    id: "or-109",
    barangayId: STATIC_BARANGAY_ID,
    orNumber: "OR-2026-00109",
    payorName: "Golden Horizon Bakery Corp.",
    amount: 1800,
    particulars: "Barangay Business Clearance & Sanitary Inspection Fee",
    issuedAt: "2026-08-25T13:40:00.000Z"
  },
  {
    id: "or-110",
    barangayId: STATIC_BARANGAY_ID,
    orNumber: "OR-2026-00110",
    payorName: "Elena Bautista",
    amount: 50,
    particulars: "Certificate of Good Moral Character (Scholarship Application)",
    issuedAt: "2026-08-26T09:20:00.000Z"
  },
  {
    id: "or-111",
    barangayId: STATIC_BARANGAY_ID,
    orNumber: "OR-2026-00111",
    payorName: "Marikina Riverway Sports Club",
    amount: 3500,
    particulars: "Barangay Gymnasium Rental Fee — Inter-Purok Tournament",
    issuedAt: "2026-08-28T13:30:00.000Z"
  },
  {
    id: "or-112",
    barangayId: STATIC_BARANGAY_ID,
    orNumber: "OR-2026-00112",
    payorName: "Vicente Ramirez Jr.",
    amount: 150,
    particulars: "Barangay Clearance for Police Clearance & LTOPF",
    issuedAt: "2026-09-01T11:15:00.000Z"
  },
  {
    id: "or-113",
    barangayId: STATIC_BARANGAY_ID,
    orNumber: "OR-2026-00113",
    payorName: "7-Eleven Barangka Branch / PhilSeven Corp",
    amount: 5000,
    particulars: "Annual Barangay Business Permit & Solid Waste Assessment",
    issuedAt: "2026-09-02T14:30:00.000Z"
  },
  {
    id: "or-114",
    barangayId: STATIC_BARANGAY_ID,
    orNumber: "OR-2026-00114",
    payorName: "Rosalinda P. Dizon",
    amount: 100,
    particulars: "Certificate of Cohabitation & Residency",
    issuedAt: "2026-09-04T10:05:00.000Z"
  },
  {
    id: "or-115",
    barangayId: STATIC_BARANGAY_ID,
    orNumber: "OR-2026-00115",
    payorName: "Silver Star Laundry Services",
    amount: 1200,
    particulars: "Barangay Clearance (Commercial Laundry & Wastewater Compliance)",
    issuedAt: "2026-09-05T15:00:00.000Z"
  },
  {
    id: "or-116",
    barangayId: STATIC_BARANGAY_ID,
    orNumber: "OR-2026-00116",
    payorName: "Arturo Macaraeg",
    amount: 200,
    particulars: "Barangay Clearance for Electrical Wiring & Building Permit",
    issuedAt: "2026-09-07T09:40:00.000Z"
  },
  {
    id: "or-117",
    barangayId: STATIC_BARANGAY_ID,
    orNumber: "OR-2026-00117",
    payorName: "Barangka Community Multi-Purpose Coop",
    amount: 2000,
    particulars: "Barangay Hall Conference Room Use & Audio-Visual Equipment Fee",
    issuedAt: "2026-09-09T16:10:00.000Z"
  },
  {
    id: "or-118",
    barangayId: STATIC_BARANGAY_ID,
    orNumber: "OR-2026-00118",
    payorName: "Corazon Del Mundo",
    amount: 50,
    particulars: "Barangay Certification (First Time Jobseeker / Documentary Stamp)",
    issuedAt: "2026-09-10T11:25:00.000Z"
  }
];

export const STATIC_BUDGETS: StaticBudget[] = [
  {
    id: "bgt-2026",
    barangayId: STATIC_BARANGAY_ID,
    year: 2026,
    totalAmount: 28500000,
    skFundAmount: 2850000,
    status: "enacted",
    lines: [
      {
        id: "bl-01",
        expenseClass: "PS",
        accountCode: "5-01-01-010",
        description: "Salaries & Honoraria — Punong Barangay & Sangguniang Barangay Members",
        amount: 5400000,
        obligated: 3600000,
        disbursed: 3600000
      },
      {
        id: "bl-02",
        expenseClass: "PS",
        accountCode: "5-01-02-010",
        description: "Honoraria — Appointed Barangay Officials (Secretary, Treasurer)",
        amount: 1200000,
        obligated: 800000,
        disbursed: 800000
      },
      {
        id: "bl-03",
        expenseClass: "PS",
        accountCode: "5-01-02-990",
        description: "Honoraria & Allowances — Barangay Tanod Security Force (24 Pax)",
        amount: 2304000,
        obligated: 1536000,
        disbursed: 1536000
      },
      {
        id: "bl-04",
        expenseClass: "PS",
        accountCode: "5-01-02-991",
        description: "Honoraria — Barangay Health Workers (BHW) & Nutrition Scholars",
        amount: 1080000,
        obligated: 720000,
        disbursed: 720000
      },
      {
        id: "bl-05",
        expenseClass: "PS",
        accountCode: "5-01-04-030",
        description: "Year-End Bonus & Cash Gift (Barangay Appointed & Elective Personnel)",
        amount: 850000,
        obligated: 0,
        disbursed: 0
      },
      {
        id: "bl-06",
        expenseClass: "MOOE",
        accountCode: "5-02-01-010",
        description: "Travelling & Training Expenses — Local Seminars & DILG Workshops",
        amount: 350000,
        obligated: 210000,
        disbursed: 185000
      },
      {
        id: "bl-07",
        expenseClass: "MOOE",
        accountCode: "5-02-03-010",
        description: "Office Supplies & Materials Expenses — Hall & Desk Operations",
        amount: 620000,
        obligated: 480000,
        disbursed: 435000
      },
      {
        id: "bl-08",
        expenseClass: "MOOE",
        accountCode: "5-02-04-010",
        description: "Electricity & Water Utility Expenses — Barangay Hall & Health Center",
        amount: 980000,
        obligated: 660000,
        disbursed: 642000
      },
      {
        id: "bl-09",
        expenseClass: "MOOE",
        accountCode: "5-02-05-020",
        description: "Internet & Telecommunications Expenses (Fiber & Radio Relay)",
        amount: 240000,
        obligated: 160000,
        disbursed: 160000
      },
      {
        id: "bl-10",
        expenseClass: "MOOE",
        accountCode: "5-02-13-040",
        description: "Repairs & Maintenance — Multi-Purpose Hall & Day Care Facilities",
        amount: 750000,
        obligated: 520000,
        disbursed: 485000
      },
      {
        id: "bl-11",
        expenseClass: "MOOE",
        accountCode: "5-02-13-060",
        description: "Repairs & Maintenance — Patrol Vehicles & Ambulance",
        amount: 460000,
        obligated: 340000,
        disbursed: 315000
      },
      {
        id: "bl-12",
        expenseClass: "MOOE",
        accountCode: "5-02-12-030",
        description: "5% Local Disaster Risk Reduction & Management Fund (LDRRMF / BDRRMC)",
        amount: 1425000,
        obligated: 980000,
        disbursed: 890000
      },
      {
        id: "bl-13",
        expenseClass: "MOOE",
        accountCode: "5-02-12-040",
        description: "5% Gender and Development Fund (GAD Statutory Allocation — VAW & Livelihood)",
        amount: 1425000,
        obligated: 875000,
        disbursed: 810000
      },
      {
        id: "bl-14",
        expenseClass: "MOOE",
        accountCode: "5-02-99-080",
        description: "Barangay Peace and Order Council (BPOC) Operations",
        amount: 500000,
        obligated: 360000,
        disbursed: 345000
      },
      {
        id: "bl-15",
        expenseClass: "MOOE",
        accountCode: "5-02-99-090",
        description: "Barangay Anti-Drug Abuse Council (BADAC) Community Rehabilitation",
        amount: 350000,
        obligated: 220000,
        disbursed: 195000
      },
      {
        id: "bl-16",
        expenseClass: "CO",
        accountCode: "1-07-04-010",
        description: "20% Barangay Development Fund (BDF) — Solar Street Lighting Along A. Bonifacio",
        amount: 3200000,
        obligated: 3200000,
        disbursed: 2400000
      },
      {
        id: "bl-17",
        expenseClass: "CO",
        accountCode: "1-07-04-020",
        description: "20% BDF — Riverbank Drainage Desilting & Flood Barrier Improvement",
        amount: 2500000,
        obligated: 2500000,
        disbursed: 1850000
      },
      {
        id: "bl-18",
        expenseClass: "CO",
        accountCode: "1-07-05-010",
        description: "IT Equipment & Digital Identification Terminals for CBMS Kiosks",
        amount: 1066000,
        obligated: 850000,
        disbursed: 780000
      },
      {
        id: "bl-19",
        expenseClass: "CO",
        accountCode: "1-07-06-010",
        description: "Disaster Rescue Equipment & High-Water Rubber Boats",
        amount: 950000,
        obligated: 950000,
        disbursed: 950000
      },
      {
        id: "bl-20",
        expenseClass: "MOOE",
        accountCode: "5-02-99-010",
        description: "Sangguniang Kabataan (SK 10%) — Youth Development, Sports & Training Programs",
        amount: 2850000,
        obligated: 1900000,
        disbursed: 1650000
      }
    ]
  },
  {
    id: "bgt-2025",
    barangayId: STATIC_BARANGAY_ID,
    year: 2025,
    totalAmount: 26000000,
    skFundAmount: 2600000,
    status: "enacted",
    lines: [
      {
        id: "bl25-01",
        expenseClass: "PS",
        accountCode: "5-01-01-010",
        description: "Salaries & Honoraria — Punong Barangay & Sangguniang Barangay Members",
        amount: 5100000,
        obligated: 5100000,
        disbursed: 5100000
      },
      {
        id: "bl25-02",
        expenseClass: "PS",
        accountCode: "5-01-02-010",
        description: "Honoraria — Appointed Barangay Officials (Secretary, Treasurer)",
        amount: 1100000,
        obligated: 1100000,
        disbursed: 1100000
      },
      {
        id: "bl25-03",
        expenseClass: "PS",
        accountCode: "5-01-02-990",
        description: "Honoraria & Allowances — Barangay Tanod Security Force",
        amount: 2100000,
        obligated: 2100000,
        disbursed: 2100000
      },
      {
        id: "bl25-04",
        expenseClass: "PS",
        accountCode: "5-01-02-991",
        description: "Honoraria — Barangay Health Workers (BHW)",
        amount: 980000,
        obligated: 980000,
        disbursed: 980000
      },
      {
        id: "bl25-05",
        expenseClass: "PS",
        accountCode: "5-01-04-030",
        description: "Year-End Bonus & Cash Gift",
        amount: 720000,
        obligated: 720000,
        disbursed: 720000
      },
      {
        id: "bl25-06",
        expenseClass: "MOOE",
        accountCode: "5-02-03-010",
        description: "Office Supplies & Materials Expenses",
        amount: 550000,
        obligated: 550000,
        disbursed: 550000
      },
      {
        id: "bl25-07",
        expenseClass: "MOOE",
        accountCode: "5-02-04-010",
        description: "Electricity & Water Utility Expenses",
        amount: 880000,
        obligated: 880000,
        disbursed: 880000
      },
      {
        id: "bl25-08",
        expenseClass: "MOOE",
        accountCode: "5-02-12-030",
        description: "5% Local Disaster Risk Reduction & Management Fund (LDRRMF)",
        amount: 1300000,
        obligated: 1300000,
        disbursed: 1300000
      },
      {
        id: "bl25-09",
        expenseClass: "MOOE",
        accountCode: "5-02-12-040",
        description: "5% Gender and Development Fund (GAD)",
        amount: 1300000,
        obligated: 1300000,
        disbursed: 1300000
      },
      {
        id: "bl25-10",
        expenseClass: "CO",
        accountCode: "1-07-04-010",
        description: "20% BDF — Barangay Evacuation Multi-Purpose Center Upgrade",
        amount: 5200000,
        obligated: 5200000,
        disbursed: 5200000
      },
      {
        id: "bl25-11",
        expenseClass: "CO",
        accountCode: "1-07-05-010",
        description: "IT Equipment & CCTV Security Upgrades",
        amount: 1170000,
        obligated: 1170000,
        disbursed: 1170000
      },
      {
        id: "bl25-12",
        expenseClass: "MOOE",
        accountCode: "5-02-13-040",
        description: "Repairs & Maintenance — Hall & Facilities",
        amount: 700000,
        obligated: 700000,
        disbursed: 700000
      },
      {
        id: "bl25-13",
        expenseClass: "MOOE",
        accountCode: "5-02-13-060",
        description: "Repairs & Maintenance — Transportation Equipment",
        amount: 400000,
        obligated: 400000,
        disbursed: 400000
      },
      {
        id: "bl25-14",
        expenseClass: "MOOE",
        accountCode: "5-02-99-080",
        description: "Barangay Peace & Order Programs",
        amount: 1000000,
        obligated: 1000000,
        disbursed: 1000000
      },
      {
        id: "bl25-15",
        expenseClass: "MOOE",
        accountCode: "5-02-99-010",
        description: "Sangguniang Kabataan (SK 10%) Fund",
        amount: 2600000,
        obligated: 2600000,
        disbursed: 2600000
      }
    ]
  }
];

export const STATIC_RPT_PROPERTIES: StaticRptProperty[] = [
  {
    id: "rpt-01",
    barangayId: STATIC_BARANGAY_ID,
    taxDeclarationNo: "TD-2026-BAR-00101",
    ownerInhabitantId: "inh-mateo",
    ownerName: "Mateo S. Gonzales",
    propertyType: "residential",
    assessedValue: 700000,
    marketValue: 3500000,
    addressLine: "14 Dela Paz St., Purok 1",
    purok: "Purok 1",
    lotNo: "Lot 4",
    blockNo: "Block 12",
    isActive: true,
    createdAt: "2026-01-10T08:30:00.000Z",
    updatedAt: "2026-01-10T08:30:00.000Z",
  },
  {
    id: "rpt-02",
    barangayId: STATIC_BARANGAY_ID,
    taxDeclarationNo: "TD-2026-BAR-00102",
    ownerInhabitantId: null,
    ownerName: "Barangka River Cafe & Grill / Lea Salonga",
    propertyType: "commercial",
    assessedValue: 6000000,
    marketValue: 12000000,
    addressLine: "88 Riverbanks Ave., River Park",
    purok: "Purok 4",
    lotNo: "Lot 1-A",
    blockNo: "Block 2",
    isActive: true,
    createdAt: "2026-01-12T10:15:00.000Z",
    updatedAt: "2026-01-12T10:15:00.000Z",
  },
  {
    id: "rpt-03",
    barangayId: STATIC_BARANGAY_ID,
    taxDeclarationNo: "TD-2026-BAR-00103",
    ownerInhabitantId: "inh-cristina",
    ownerName: "Cristina Santos (Aling Tina)",
    propertyType: "residential",
    assessedValue: 360000,
    marketValue: 1800000,
    addressLine: "25 Gen. J. Cruz St., Purok 2",
    purok: "Purok 2",
    lotNo: "Lot 18",
    blockNo: "Block 5",
    isActive: true,
    createdAt: "2026-01-15T14:20:00.000Z",
    updatedAt: "2026-01-15T14:20:00.000Z",
  },
  {
    id: "rpt-04",
    barangayId: STATIC_BARANGAY_ID,
    taxDeclarationNo: "TD-2026-BAR-00104",
    ownerInhabitantId: null,
    ownerName: "MegaPrime Hardware & Const. Supplies Corp.",
    propertyType: "commercial",
    assessedValue: 9250000,
    marketValue: 18500000,
    addressLine: "104 A. Bonifacio Ave.",
    purok: "Purok 3",
    lotNo: "Lot 8",
    blockNo: "Block 1",
    isActive: true,
    createdAt: "2026-01-18T09:00:00.000Z",
    updatedAt: "2026-01-18T09:00:00.000Z",
  },
  {
    id: "rpt-05",
    barangayId: STATIC_BARANGAY_ID,
    taxDeclarationNo: "TD-2026-BAR-00105",
    ownerInhabitantId: "inh-ricardo",
    ownerName: "Ricardo De Jesus",
    propertyType: "residential",
    assessedValue: 190000,
    marketValue: 950000,
    addressLine: "7 P. Burgos St., Purok 5",
    purok: "Purok 5",
    lotNo: "Lot 12",
    blockNo: "Block 8",
    isActive: true,
    createdAt: "2026-01-20T11:45:00.000Z",
    updatedAt: "2026-01-20T11:45:00.000Z",
  },
  {
    id: "rpt-06",
    barangayId: STATIC_BARANGAY_ID,
    taxDeclarationNo: "TD-2026-BAR-00106",
    ownerInhabitantId: null,
    ownerName: "Golden Horizon Bakery Corp.",
    propertyType: "commercial",
    assessedValue: 3250000,
    marketValue: 6500000,
    addressLine: "42 Marcos Highway cor. Dela Paz",
    purok: "Purok 1",
    lotNo: "Lot 2-B",
    blockNo: "Block 3",
    isActive: true,
    createdAt: "2026-01-22T13:30:00.000Z",
    updatedAt: "2026-01-22T13:30:00.000Z",
  },
  {
    id: "rpt-07",
    barangayId: STATIC_BARANGAY_ID,
    taxDeclarationNo: "TD-2026-BAR-00107",
    ownerInhabitantId: null,
    ownerName: "Marikina Footwear & Leather Processing Plant",
    propertyType: "industrial",
    assessedValue: 12000000,
    marketValue: 24000000,
    addressLine: "15 Industrial Valley Subd.",
    purok: "Purok 6",
    lotNo: "Lot 1",
    blockNo: "Block 9",
    isActive: true,
    createdAt: "2026-01-25T15:00:00.000Z",
    updatedAt: "2026-01-25T15:00:00.000Z",
  },
  {
    id: "rpt-08",
    barangayId: STATIC_BARANGAY_ID,
    taxDeclarationNo: "TD-2026-BAR-00108",
    ownerInhabitantId: "inh-clara",
    ownerName: "Maria Clara B. Santos",
    propertyType: "residential",
    assessedValue: 480000,
    marketValue: 2400000,
    addressLine: "31 E. Dela Paz St., Purok 2",
    purok: "Purok 2",
    lotNo: "Lot 14",
    blockNo: "Block 4",
    isActive: true,
    createdAt: "2026-01-28T16:10:00.000Z",
    updatedAt: "2026-01-28T16:10:00.000Z",
  },
  {
    id: "rpt-09",
    barangayId: STATIC_BARANGAY_ID,
    taxDeclarationNo: "TD-2026-BAR-00109",
    ownerInhabitantId: null,
    ownerName: "Philippine Seven Corp (7-Eleven Barangka)",
    propertyType: "commercial",
    assessedValue: 7000000,
    marketValue: 14000000,
    addressLine: "55 A. Bonifacio Ave. cor. Chorillo St.",
    purok: "Purok 3",
    lotNo: "Lot 3",
    blockNo: "Block 2",
    isActive: true,
    createdAt: "2026-02-01T08:45:00.000Z",
    updatedAt: "2026-02-01T08:45:00.000Z",
  },
  {
    id: "rpt-10",
    barangayId: STATIC_BARANGAY_ID,
    taxDeclarationNo: "TD-2026-BAR-00110",
    ownerInhabitantId: "inh-danilo",
    ownerName: "Danilo M. Cruz",
    propertyType: "residential",
    assessedValue: 320000,
    marketValue: 1600000,
    addressLine: "19 J.P. Rizal St., Purok 4",
    purok: "Purok 4",
    lotNo: "Lot 9",
    blockNo: "Block 6",
    isActive: true,
    createdAt: "2026-02-03T10:00:00.000Z",
    updatedAt: "2026-02-03T10:00:00.000Z",
  },
  {
    id: "rpt-11",
    barangayId: STATIC_BARANGAY_ID,
    taxDeclarationNo: "TD-2026-BAR-00111",
    ownerInhabitantId: null,
    ownerName: "Barangka Community Urban Farm & Nursery",
    propertyType: "agricultural",
    assessedValue: 840000,
    marketValue: 2100000,
    addressLine: "Lot 12 Riverbank Greenzone",
    purok: "Purok 7",
    lotNo: "Lot 12",
    blockNo: "Block 1",
    isActive: true,
    createdAt: "2026-02-05T11:20:00.000Z",
    updatedAt: "2026-02-05T11:20:00.000Z",
  },
  {
    id: "rpt-12",
    barangayId: STATIC_BARANGAY_ID,
    taxDeclarationNo: "TD-2026-BAR-00112",
    ownerInhabitantId: "inh-elena",
    ownerName: "Silver Star Laundry Services / Elena Bautista",
    propertyType: "commercial",
    assessedValue: 2100000,
    marketValue: 4200000,
    addressLine: "8 Chorillo St., Purok 3",
    purok: "Purok 3",
    lotNo: "Lot 6",
    blockNo: "Block 7",
    isActive: true,
    createdAt: "2026-02-08T14:30:00.000Z",
    updatedAt: "2026-02-08T14:30:00.000Z",
  },
];

export const STATIC_RPT_TAX_DUES: StaticRptTaxDue[] = [
  {
    id: "due-01",
    rptPropertyId: "rpt-01",
    taxYear: 2026,
    basicTaxAmount: 7000,
    sefTaxAmount: 7000,
    penaltyAmount: 0,
    totalAmount: 14000,
    paymentStatus: "fully_paid",
    paidAt: "2026-03-15T09:30:00.000Z",
    orNumber: "OR-2026-00041",
    isActive: true,
  },
  {
    id: "due-02",
    rptPropertyId: "rpt-02",
    taxYear: 2026,
    basicTaxAmount: 60000,
    sefTaxAmount: 60000,
    penaltyAmount: 0,
    totalAmount: 120000,
    paymentStatus: "fully_paid",
    paidAt: "2026-01-20T11:15:00.000Z",
    orNumber: "OR-2026-00012",
    isActive: true,
  },
  {
    id: "due-03",
    rptPropertyId: "rpt-03",
    taxYear: 2026,
    basicTaxAmount: 3600,
    sefTaxAmount: 3600,
    penaltyAmount: 720,
    totalAmount: 7920,
    paymentStatus: "unpaid",
    paidAt: null,
    orNumber: null,
    isActive: true,
  },
  {
    id: "due-04",
    rptPropertyId: "rpt-04",
    taxYear: 2026,
    basicTaxAmount: 92500,
    sefTaxAmount: 92500,
    penaltyAmount: 0,
    totalAmount: 185000,
    paymentStatus: "fully_paid",
    paidAt: "2026-02-28T14:40:00.000Z",
    orNumber: "OR-2026-00028",
    isActive: true,
  },
  {
    id: "due-05",
    rptPropertyId: "rpt-05",
    taxYear: 2026,
    basicTaxAmount: 1900,
    sefTaxAmount: 1900,
    penaltyAmount: 380,
    totalAmount: 4180,
    paymentStatus: "unpaid",
    paidAt: null,
    orNumber: null,
    isActive: true,
  },
  {
    id: "due-06",
    rptPropertyId: "rpt-06",
    taxYear: 2026,
    basicTaxAmount: 32500,
    sefTaxAmount: 32500,
    penaltyAmount: 0,
    totalAmount: 65000,
    paymentStatus: "partially_paid",
    paidAt: "2026-04-12T10:00:00.000Z",
    orNumber: "OR-2026-00067",
    isActive: true,
  },
  {
    id: "due-07",
    rptPropertyId: "rpt-07",
    taxYear: 2026,
    basicTaxAmount: 120000,
    sefTaxAmount: 120000,
    penaltyAmount: 0,
    totalAmount: 240000,
    paymentStatus: "fully_paid",
    paidAt: "2026-01-15T09:00:00.000Z",
    orNumber: "OR-2026-00008",
    isActive: true,
  },
  {
    id: "due-08",
    rptPropertyId: "rpt-08",
    taxYear: 2026,
    basicTaxAmount: 4800,
    sefTaxAmount: 4800,
    penaltyAmount: 0,
    totalAmount: 9600,
    paymentStatus: "fully_paid",
    paidAt: "2026-03-22T13:20:00.000Z",
    orNumber: "OR-2026-00055",
    isActive: true,
  },
  {
    id: "due-09",
    rptPropertyId: "rpt-09",
    taxYear: 2026,
    basicTaxAmount: 70000,
    sefTaxAmount: 70000,
    penaltyAmount: 0,
    totalAmount: 140000,
    paymentStatus: "fully_paid",
    paidAt: "2026-01-18T10:45:00.000Z",
    orNumber: "OR-2026-00010",
    isActive: true,
  },
  {
    id: "due-10",
    rptPropertyId: "rpt-10",
    taxYear: 2026,
    basicTaxAmount: 3200,
    sefTaxAmount: 3200,
    penaltyAmount: 640,
    totalAmount: 7040,
    paymentStatus: "unpaid",
    paidAt: null,
    orNumber: null,
    isActive: true,
  },
  {
    id: "due-11",
    rptPropertyId: "rpt-11",
    taxYear: 2026,
    basicTaxAmount: 8400,
    sefTaxAmount: 8400,
    penaltyAmount: 0,
    totalAmount: 16800,
    paymentStatus: "exempt",
    paidAt: null,
    orNumber: null,
    isActive: true,
  },
  {
    id: "due-12",
    rptPropertyId: "rpt-12",
    taxYear: 2026,
    basicTaxAmount: 21000,
    sefTaxAmount: 21000,
    penaltyAmount: 4200,
    totalAmount: 46200,
    paymentStatus: "unpaid",
    paidAt: null,
    orNumber: null,
    isActive: true,
  },
];

// ============================================================================
// DILG BIMS BIPS Standard Masterlists (DILG MC No. 2025-104 Annex B)
// ============================================================================

// Form 1.A: 70 Standard National Ethnicities
export const DILG_ETHNICITIES: string[] = [
  "Aeta", "Agta", "Ati", "Ayta Mag-antsi", "Ayta Magbukon", "Ayta Mag-indi", "Ayta Abellen", "Badjao", "Bagobo", "Bago",
  "Balangao", "Batak", "B'laan", "Bugkalot", "Bukidnon", "Bontoc", "Dumagat", "Gaddang", "Hanunuo Mangyan", "Higaonon",
  "Ilongot", "Ifugao", "Iraya Mangyan", "Isneg", "Itawis", "Ivatan", "Iwak", "Jama Mapun", "Kabihug", "Kalagan",
  "Kalanguya", "Kalinga", "Kankanaey", "Kaolo", "Ke'ney", "Kinaray-a", "Kolibugan", "Kagayanen", "Lambangian", "Langilan Manobo",
  "Maguindanao", "Mandaya", "Mamanwa", "Mansaka", "Manobo", "Mangyan", "Matigsalug", "Molbog", "Palawano", "Panay Bukidnon",
  "Pala'wan", "Pankalis", "Remontado", "Sama Banguingui", "Sama Dilaut", "Subanon", "Tagbanwa", "Tagakaulo", "Teduray", "T'boli",
  "Talaandig", "Tau't Batu", "Tingguian", "Tinggian", "Tumandok", "Ubo", "Yakan", "Other Local Ethnicity", "Other Foreign Ethnicity", "Not Reported"
];

// Form A1 Part 2: Relationship to Household Head (Codes 1 to 26)
export const DILG_RELATIONSHIP_CODES: Array<{ code: string; label: string; group: string }> = [
  { code: "1", label: "Household Head", group: "Head" },
  { code: "2a", label: "Spouse", group: "Spouse/Partner" },
  { code: "2b", label: "Common-law / Live-in Partner", group: "Spouse/Partner" },
  { code: "3", label: "Son", group: "Children" },
  { code: "4", label: "Daughter", group: "Children" },
  { code: "5", label: "Stepson", group: "Children" },
  { code: "6", label: "Stepdaughter", group: "Children" },
  { code: "7", label: "Son-in-law", group: "In-laws" },
  { code: "8", label: "Daughter-in-law", group: "In-laws" },
  { code: "9", label: "Grandson", group: "Grandchildren" },
  { code: "10", label: "Granddaughter", group: "Grandchildren" },
  { code: "11", label: "Father", group: "Parents" },
  { code: "12", label: "Mother", group: "Parents" },
  { code: "13", label: "Father-in-law", group: "In-laws" },
  { code: "14", label: "Mother-in-law", group: "In-laws" },
  { code: "15", label: "Brother", group: "Siblings" },
  { code: "16", label: "Sister", group: "Siblings" },
  { code: "17", label: "Brother-in-law", group: "In-laws" },
  { code: "18", label: "Sister-in-law", group: "In-laws" },
  { code: "19", label: "Uncle", group: "Relatives" },
  { code: "20", label: "Aunt", group: "Relatives" },
  { code: "21", label: "Nephew", group: "Relatives" },
  { code: "22", label: "Niece", group: "Relatives" },
  { code: "23", label: "Other relative", group: "Relatives" },
  { code: "24", label: "Boarder", group: "Non-relatives" },
  { code: "25", label: "Domestic Helper", group: "Non-relatives" },
  { code: "26", label: "Other non-relative", group: "Non-relatives" },
];

// Form A1 Part 2: Source of Income (Codes 1 to 8)
export const DILG_INCOME_SOURCE_CODES: Array<{ code: string; label: string }> = [
  { code: "1", label: "Employment (Salary/Wages)" },
  { code: "2", label: "Business (Enterprise/Trade)" },
  { code: "3", label: "Remittance (OFW/Domestic)" },
  { code: "4", label: "Investments (Interest/Dividends)" },
  { code: "5", label: "Pension (SSS/GSIS/Social Pension)" },
  { code: "6", label: "Farming (Agriculture)" },
  { code: "7", label: "Fishing (Aquaculture)" },
  { code: "8", label: "Others" },
];

// Form A1 Part 3: Reasons for Leaving Previous Residence (Codes 1 to 16)
export const DILG_REASONS_FOR_LEAVING: Array<{ code: string; label: string }> = [
  { code: "1", label: "1 - Lack of employment" },
  { code: "2", label: "2 - Perception of better income in other place" },
  { code: "3", label: "3 - Schooling" },
  { code: "4", label: "4 - Presence of relatives and friends in other place" },
  { code: "5", label: "5 - Employment / Job relocation" },
  { code: "6", label: "6 - Disaster-related relocation" },
  { code: "7", label: "7 - Retirement" },
  { code: "8", label: "8 - To live with parents" },
  { code: "9", label: "9 - To live with children" },
  { code: "10", label: "10 - Marriage" },
  { code: "11", label: "11 - Annulment / Divorce / Separation" },
  { code: "12", label: "12 - Commuting-related reasons" },
  { code: "13", label: "13 - Health-related reasons" },
  { code: "14", label: "14 - Peace and security" },
  { code: "15", label: "15 - Climate-induced displacement" },
  { code: "16", label: "16 - Other reasons" },
];

// Form A1 Part 3: Reasons for Transferring to Current Barangay (Codes 1 to 5)
export const DILG_REASONS_FOR_TRANSFERRING: Array<{ code: string; label: string }> = [
  { code: "1", label: "1 - Availability of jobs" },
  { code: "2", label: "2 - Higher wage" },
  { code: "3", label: "3 - Presence of schools or universities" },
  { code: "4", label: "4 - Presence of relatives & friends in other place" },
  { code: "5", label: "5 - Other reasons" },
];

// Form A2: Educational Attainment Taxonomy
export const DILG_EDUCATIONAL_ATTAINMENTS: string[] = [
  "No education",
  "Pre-school",
  "Elementary Level",
  "Elementary Graduate",
  "High School Level",
  "High School Graduate",
  "Junior HS",
  "Junior HS Graduate",
  "Senior HS Level",
  "Senior HS Graduate",
  "Vocational / Tech",
  "College Level",
  "College Graduate",
  "Post-graduate"
];

// Form A2: Religion Taxonomy
export const DILG_RELIGIONS: string[] = [
  "Roman Catholic",
  "Islam",
  "Iglesia ni Cristo",
  "Christian (Protestant/Evangelical)",
  "Aglipayan Church (IFI)",
  "Seventh-day Adventist",
  "Bible Baptist Church",
  "Jehovah's Witnesses",
  "Church of Jesus Christ of Latter-day Saints",
  "United Church of Christ in the Philippines (UCCP)",
  "Others"
];

// Form A2: Government Assistance Programs
export const DILG_GOV_ASSISTANCE_PROGRAMS: string[] = [
  "4Ps (Pantawid Pamilyang Pilipino Program)",
  "TUPAD (Tulong Panghanapbuhay sa Ating Disadvantaged/Displaced Workers)",
  "SLP (Sustainable Livelihood Program)",
  "Social Pension for Indigent Senior Citizens",
  "AICS (Assistance to Individuals in Crisis Situation)",
  "Others"
];

// Form A3: Underlying Cause of Death Taxonomy
export const DILG_CAUSE_OF_DEATH_CATEGORIES: string[] = [
  "Physical (Accident/Trauma)",
  "Infectious Disease",
  "Non-Infectious / Chronic",
  "Degenerative",
  "Deficiency / Malnutrition",
  "Inherited / Genetic",
  "Mental Health",
  "Social / Violence",
  "Self-Inflicted",
  "Others"
];

// Form A4: Official Positions
export const DILG_OFFICIAL_POSITIONS: Array<{ position: string; type: "elective" | "appointive" }> = [
  { position: "Punong Barangay", type: "elective" },
  { position: "Sangguniang Barangay Member", type: "elective" },
  { position: "SK Chairperson", type: "elective" },
  { position: "SK Member", type: "elective" },
  { position: "Barangay Secretary", type: "appointive" },
  { position: "Barangay Treasurer", type: "appointive" },
  { position: "SK Secretary", type: "appointive" },
  { position: "SK Treasurer", type: "appointive" },
  { position: "Indigenous Peoples Mandatory Representative (IPMR)", type: "appointive" },
  { position: "Barangay Tanod Executive Officer", type: "appointive" },
  { position: "Barangay Tanod", type: "appointive" },
  { position: "Barangay Health Worker (BHW)", type: "appointive" },
  { position: "Barangay Nutrition Scholar (BNS)", type: "appointive" },
  { position: "Day Care Worker", type: "appointive" },
  { position: "VAW Desk Officer", type: "appointive" },
  { position: "BADAC Duty Officer / Cluster Leader", type: "appointive" },
  { position: "Kasambahay Desk Officer", type: "appointive" },
  { position: "Lupong Tagapamayapa Member", type: "appointive" },
];

// ---------------------------------------------------------------------------
// DISBURSEMENT BATCHES & ITEMS (FINANCE / E-WALLET)
// ---------------------------------------------------------------------------

export interface StaticBatchItem {
  id: string;
  batchId: string;
  payeeName: string;
  amountCentavos: string;
  status: "paid" | "otc_fallback" | "pending" | "failed";
  paidAt?: string | null;
  remarks?: string | null;
  walletId?: string | null;
  inhabitantId?: string | null;
  inhabitant?: { firstName: string; lastName: string } | null;
  createdAt?: string;
}

export interface StaticDisbursementBatch {
  id: string;
  barangayId: string;
  batchNo: string;
  kind: "payroll_honoraria" | "ayuda_social" | "allowance_stipend" | "supplier_payment" | "emergency_aid";
  title: string;
  fund: "general" | "sk" | "gad" | "disaster" | "trust";
  status: "draft" | "for_approval" | "approved" | "executing" | "completed" | "failed" | "cancelled";
  preparedById?: string | null;
  approvedById?: string | null;
  approvedAt?: string | null;
  executedAt?: string | null;
  totalCentavos: string;
  itemCount: number;
  sourceNote?: string | null;
  dvNumber?: string | null;
  createdAt: string;
  updatedAt?: string;
  items?: StaticBatchItem[];
  _count?: { items: number };
}

export const STATIC_DISBURSEMENT_ITEMS: StaticBatchItem[] = [
  // DB-01 Items (Payroll Honoraria)
  {
    id: "item-db01-01",
    batchId: "db-01",
    inhabitantId: "inh-danilo",
    payeeName: "Danilo M. Cruz",
    inhabitant: { firstName: "Danilo", lastName: "Cruz" },
    walletId: "wal-danilo",
    amountCentavos: "1250000",
    status: "paid",
    paidAt: "2026-08-16T09:05:00.000Z",
    remarks: "Tanod Executive Officer honorarium & hazard allowance",
  },
  {
    id: "item-db01-02",
    batchId: "db-01",
    inhabitantId: "inh-mateo",
    payeeName: "Mateo S. Gonzales",
    inhabitant: { firstName: "Mateo", lastName: "Gonzales" },
    walletId: "wal-mateo",
    amountCentavos: "1000000",
    status: "paid",
    paidAt: "2026-08-16T09:05:00.000Z",
    remarks: "Lupong Tagapamayapa Member mediation stipend",
  },
  {
    id: "item-db01-03",
    batchId: "db-01",
    inhabitantId: "inh-clara",
    payeeName: "Maria Clara B. Santos",
    inhabitant: { firstName: "Maria Clara", lastName: "Santos" },
    walletId: "wal-clara",
    amountCentavos: "950000",
    status: "paid",
    paidAt: "2026-08-16T09:06:00.000Z",
    remarks: "Barangay Health Worker (BHW) clinical duty allowance",
  },
  {
    id: "item-db01-04",
    batchId: "db-01",
    inhabitantId: "inh-ricardo",
    payeeName: "Ricardo De Jesus",
    inhabitant: { firstName: "Ricardo", lastName: "De Jesus" },
    walletId: "wal-ricardo",
    amountCentavos: "850000",
    status: "paid",
    paidAt: "2026-08-16T09:06:00.000Z",
    remarks: "Barangay Nutrition Scholar monthly incentive",
  },
  {
    id: "item-db01-05",
    batchId: "db-01",
    inhabitantId: "inh-elena",
    payeeName: "Elena Bautista",
    inhabitant: { firstName: "Elena", lastName: "Bautista" },
    walletId: "wal-elena",
    amountCentavos: "900000",
    status: "paid",
    paidAt: "2026-08-16T09:07:00.000Z",
    remarks: "Day Care Center Child Development Teacher subsidy",
  },
  {
    id: "item-db01-06",
    batchId: "db-01",
    inhabitantId: null,
    payeeName: "Fernando Alvarez",
    inhabitant: null,
    walletId: null,
    amountCentavos: "800000",
    status: "otc_fallback",
    paidAt: "2026-08-16T14:30:00.000Z",
    remarks: "Tanod night shift. Cash released over-the-counter via Form 51.",
  },

  // DB-02 Items (Typhoon Ayuda)
  {
    id: "item-db02-01",
    batchId: "db-02",
    inhabitantId: "inh-mateo",
    payeeName: "Mateo S. Gonzales",
    inhabitant: { firstName: "Mateo", lastName: "Gonzales" },
    walletId: "wal-mateo",
    amountCentavos: "1000000",
    status: "paid",
    paidAt: "2026-08-21T08:35:00.000Z",
    remarks: "Calamity assistance — Dela Paz St., Purok 1 flood damage",
  },
  {
    id: "item-db02-02",
    batchId: "db-02",
    inhabitantId: "inh-cristina",
    payeeName: "Cristina Santos (Aling Tina)",
    inhabitant: { firstName: "Cristina", lastName: "Santos" },
    walletId: "wal-cristina",
    amountCentavos: "1000000",
    status: "paid",
    paidAt: "2026-08-21T08:35:00.000Z",
    remarks: "Calamity assistance — Gen. Cruz St. grocery stock loss",
  },
  {
    id: "item-db02-03",
    batchId: "db-02",
    inhabitantId: null,
    payeeName: "Domingo Carpio",
    inhabitant: null,
    walletId: null,
    amountCentavos: "1000000",
    status: "otc_fallback",
    paidAt: "2026-08-21T11:20:00.000Z",
    remarks: "Over-the-counter treasurer release; no registered digital wallet.",
  },
  {
    id: "item-db02-04",
    batchId: "db-02",
    inhabitantId: "inh-danilo",
    payeeName: "Danilo M. Cruz",
    inhabitant: { firstName: "Danilo", lastName: "Cruz" },
    walletId: "wal-danilo",
    amountCentavos: "1000000",
    status: "paid",
    paidAt: "2026-08-21T08:36:00.000Z",
    remarks: "Calamity assistance — J.P. Rizal St. easement zone",
  },

  // DB-03 Items (SK Stipend - for approval)
  {
    id: "item-db03-01",
    batchId: "db-03",
    inhabitantId: null,
    payeeName: "Angela V. Reyes",
    inhabitant: { firstName: "Angela", lastName: "Reyes" },
    walletId: "wal-angela",
    amountCentavos: "500000",
    status: "pending",
    remarks: "PLMar 3rd Year BSIT Scholar — Q1 SK Stipend",
  },
  {
    id: "item-db03-02",
    batchId: "db-03",
    inhabitantId: null,
    payeeName: "Mark Anthony Bautista",
    inhabitant: { firstName: "Mark", lastName: "Bautista" },
    walletId: "wal-mark",
    amountCentavos: "500000",
    status: "pending",
    remarks: "Marikina Polytechnic College 2nd Year Scholar",
  },
  {
    id: "item-db03-03",
    batchId: "db-03",
    inhabitantId: null,
    payeeName: "Bea Patricia Gomez",
    inhabitant: { firstName: "Bea", lastName: "Gomez" },
    walletId: "wal-bea",
    amountCentavos: "500000",
    status: "pending",
    remarks: "EARIST College of Engineering Scholar",
  },
  {
    id: "item-db03-04",
    batchId: "db-03",
    inhabitantId: null,
    payeeName: "Christian Kyle Santos",
    inhabitant: { firstName: "Christian", lastName: "Santos" },
    walletId: null,
    amountCentavos: "500000",
    status: "pending",
    remarks: "No wallet registered — requires over-the-counter release",
  },

  // DB-04 Items (Senior Pension - for approval)
  {
    id: "item-db04-01",
    batchId: "db-04",
    inhabitantId: null,
    payeeName: "Lourdes M. Villafuerte",
    inhabitant: { firstName: "Lourdes", lastName: "Villafuerte" },
    walletId: "wal-lourdes",
    amountCentavos: "300000",
    status: "pending",
    remarks: "OSCA-verified indigent senior (Age 78, Purok 2)",
  },
  {
    id: "item-db04-02",
    batchId: "db-04",
    inhabitantId: null,
    payeeName: "Artemio P. Mercado",
    inhabitant: { firstName: "Artemio", lastName: "Mercado" },
    walletId: null,
    amountCentavos: "300000",
    status: "pending",
    remarks: "Homebound senior (Age 82, Purok 4) — for house-to-house distribution",
  },

  // DB-05 Items (GAD Livelihood Seed Grants - approved)
  {
    id: "item-db05-01",
    batchId: "db-05",
    inhabitantId: "inh-elena",
    payeeName: "Elena Bautista",
    inhabitant: { firstName: "Elena", lastName: "Bautista" },
    walletId: "wal-elena",
    amountCentavos: "1000000",
    status: "pending",
    remarks: "Solo parent micro-enterprise laundry supplies grant",
  },
  {
    id: "item-db05-02",
    batchId: "db-05",
    inhabitantId: null,
    payeeName: "Rosanna T. Perez",
    inhabitant: { firstName: "Rosanna", lastName: "Perez" },
    walletId: "wal-rosanna",
    amountCentavos: "1000000",
    status: "pending",
    remarks: "Food cart & pastry business seed capital",
  },

  // DB-06 Items (Supplier Payment - completed)
  {
    id: "item-db06-01",
    batchId: "db-06",
    inhabitantId: null,
    payeeName: "MegaPrime Hardware & Const. Supplies Corp.",
    inhabitant: null,
    walletId: "wal-megaprime",
    amountCentavos: "6450000",
    status: "paid",
    paidAt: "2026-08-19T15:00:00.000Z",
    remarks: "Settlement for PO #2026-08-041 (Day Care & Health Center Drainage)",
  },
];

export const STATIC_DISBURSEMENT_BATCHES: StaticDisbursementBatch[] = [
  {
    id: "db-01",
    barangayId: STATIC_BARANGAY_ID,
    batchNo: "DB-2026-0001",
    kind: "payroll_honoraria",
    title: "Honoraria & Hazard Pay — Barangay Tanods, Lupon & BHWs (August 2026)",
    fund: "general",
    status: "completed",
    preparedById: "usr-treasurer",
    approvedById: "usr-pb",
    approvedAt: "2026-08-15T14:30:00.000Z",
    executedAt: "2026-08-16T09:00:00.000Z",
    totalCentavos: "18500000",
    itemCount: 20,
    sourceNote: "Regular monthly honoraria & night patrol hazard compensation under Ordinance No. 2026-02.",
    dvNumber: "DV-2026-08-042",
    createdAt: "2026-08-15T08:00:00.000Z",
    updatedAt: "2026-08-16T09:00:00.000Z",
  },
  {
    id: "db-02",
    barangayId: STATIC_BARANGAY_ID,
    batchNo: "DB-2026-0002",
    kind: "ayuda_social",
    title: "Emergency Calamity Financial Aid (Ayuda) — Riverbanks Flood Relief",
    fund: "disaster",
    status: "completed",
    preparedById: "usr-treasurer",
    approvedById: "usr-pb",
    approvedAt: "2026-08-20T16:00:00.000Z",
    executedAt: "2026-08-21T08:30:00.000Z",
    totalCentavos: "30000000",
    itemCount: 30,
    sourceNote: "LDRRMC Resolution 08-2026: ₱10,000 emergency assistance per severely inundated household (Purok 1, 4, 7).",
    dvNumber: "DV-DRRM-2026-011",
    createdAt: "2026-08-20T10:00:00.000Z",
    updatedAt: "2026-08-21T08:30:00.000Z",
  },
  {
    id: "db-03",
    barangayId: STATIC_BARANGAY_ID,
    batchNo: "DB-2026-0003",
    kind: "allowance_stipend",
    title: "Sangguniang Kabataan (SK) Academic Incentive & Tertiary Stipend — Term 1",
    fund: "sk",
    status: "for_approval",
    preparedById: "usr-treasurer",
    approvedById: null,
    totalCentavos: "9000000",
    itemCount: 18,
    sourceNote: "Barangay Barangka SK Scholarship Grant (₱5,000 per scholar) for enrolled college students.",
    createdAt: "2026-09-02T11:15:00.000Z",
    updatedAt: "2026-09-02T11:15:00.000Z",
  },
  {
    id: "db-04",
    barangayId: STATIC_BARANGAY_ID,
    batchNo: "DB-2026-0004",
    kind: "ayuda_social",
    title: "Quarterly Social Pension Subsidy for Indigent Seniors (Q3 2026)",
    fund: "general",
    status: "for_approval",
    preparedById: "usr-treasurer",
    approvedById: null,
    totalCentavos: "7500000",
    itemCount: 25,
    sourceNote: "OSCA-verified indigent senior citizens (75+ yrs old) at ₱3,000 per beneficiary.",
    createdAt: "2026-09-05T09:45:00.000Z",
    updatedAt: "2026-09-05T09:45:00.000Z",
  },
  {
    id: "db-05",
    barangayId: STATIC_BARANGAY_ID,
    batchNo: "DB-2026-0005",
    kind: "allowance_stipend",
    title: "Gender and Development (GAD) Livelihood Seed Grants for Solo Parents",
    fund: "gad",
    status: "approved",
    preparedById: "usr-treasurer",
    approvedById: "usr-pb",
    approvedAt: "2026-09-09T10:00:00.000Z",
    totalCentavos: "12000000",
    itemCount: 12,
    sourceNote: "GAD Statutory Fund: ₱10,000 micro-enterprise capital assistance for registered solo mothers.",
    createdAt: "2026-09-08T13:20:00.000Z",
    updatedAt: "2026-09-09T10:00:00.000Z",
  },
  {
    id: "db-06",
    barangayId: STATIC_BARANGAY_ID,
    batchNo: "DB-2026-0006",
    kind: "supplier_payment",
    title: "Procurement of Repair Materials — Day Care & Health Center Drainage",
    fund: "general",
    status: "completed",
    preparedById: "usr-treasurer",
    approvedById: "usr-pb",
    approvedAt: "2026-08-19T09:30:00.000Z",
    executedAt: "2026-08-19T15:00:00.000Z",
    totalCentavos: "6450000",
    itemCount: 1,
    sourceNote: "Purchase Order #2026-08-041; Payee: MegaPrime Hardware & Construction Supplies Corp.",
    dvNumber: "DV-2026-08-041",
    createdAt: "2026-08-18T14:00:00.000Z",
    updatedAt: "2026-08-19T15:00:00.000Z",
  },
  {
    id: "db-07",
    barangayId: STATIC_BARANGAY_ID,
    batchNo: "DB-2026-0007",
    kind: "payroll_honoraria",
    title: "TUPAD Community Public Sanitation & Canal De-clogging Workers",
    fund: "general",
    status: "draft",
    preparedById: "usr-treasurer",
    totalCentavos: "4500000",
    itemCount: 9,
    sourceNote: "10-day emergency public sanitation work along river easement zone.",
    createdAt: "2026-09-10T16:00:00.000Z",
    updatedAt: "2026-09-10T16:00:00.000Z",
  },
  {
    id: "db-08",
    barangayId: STATIC_BARANGAY_ID,
    batchNo: "DB-2026-0008",
    kind: "allowance_stipend",
    title: "BDRRMC Emergency First Responder & Flood Duty Allowance",
    fund: "disaster",
    status: "completed",
    preparedById: "usr-treasurer",
    approvedById: "usr-pb",
    approvedAt: "2026-09-01T11:00:00.000Z",
    executedAt: "2026-09-01T15:30:00.000Z",
    totalCentavos: "3600000",
    itemCount: 8,
    sourceNote: "Quarterly flood response duty and rescue operations honorarium.",
    dvNumber: "DV-DRRM-2026-015",
    createdAt: "2026-09-01T08:30:00.000Z",
    updatedAt: "2026-09-01T15:30:00.000Z",
  },
];

// ============================================================================
// BARANGAY ASSETS, PROPERTIES & MATERIALS INVENTORY (LGC §375)
// ============================================================================

export interface StaticProperty {
  id: string;
  barangayId: string;
  name: string;
  type: "infrastructure" | "non_infrastructure";
  status: "operational" | "under_maintenance" | "damaged" | "disposed";
  category: string;
  capacity: number;
  custodian?: string | null;
  addressLine?: string | null;
  description?: string | null;
  acquiredAt?: string | null;
  acquisitionCost?: number | null;
  isEvacuationCenter?: boolean;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaticMaterial {
  id: string;
  barangayId: string;
  name: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  location?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const STATIC_PROPERTIES: StaticProperty[] = [
  {
    id: "prop-01",
    barangayId: STATIC_BARANGAY_ID,
    name: "BARANGAY HALL & MULTI-PURPOSE COMPLEX",
    type: "infrastructure",
    status: "operational",
    category: "Good Fiscal or Financial Administration or Fiscal Sustainability",
    capacity: 350,
    custodian: "Hon. Ernesto Dela Cruz (Punong Barangay)",
    addressLine: "J.P. Rizal St., Brgy. Barangka, Marikina City",
    description: "Main administrative government center housing Session Hall, PB Office, Treasury, Lupong Tagapamayapa, and BDRRM Operations Desk.",
    acquiredAt: "2018-03-15T08:00:00.000Z",
    acquisitionCost: 18500000,
    isEvacuationCenter: true,
    source: "CBMS",
    createdAt: "2018-03-15T08:00:00.000Z",
    updatedAt: "2026-08-20T10:00:00.000Z",
  },
  {
    id: "prop-02",
    barangayId: STATIC_BARANGAY_ID,
    name: "BARANGAY COVERED COURT & DISASTER EVACUATION CENTER",
    type: "infrastructure",
    status: "operational",
    category: "Disaster Preparedness",
    capacity: 800,
    custodian: "Danilo Ramos (BDRRMC Action Officer)",
    addressLine: "A. Bonifacio Ave., Brgy. Barangka, Marikina City",
    description: "Designated Tier-1 high-ground evacuation sanctuary with overhead shower partitions, dual backup power inlets, and community sports facilities.",
    acquiredAt: "2020-09-10T10:00:00.000Z",
    acquisitionCost: 12800000,
    isEvacuationCenter: true,
    source: "CBMS",
    createdAt: "2020-09-10T10:00:00.000Z",
    updatedAt: "2026-08-22T14:30:00.000Z",
  },
  {
    id: "prop-03",
    barangayId: STATIC_BARANGAY_ID,
    name: "PRIMARY HEALTH CLINIC & BIRTHING STATION",
    type: "infrastructure",
    status: "operational",
    category: "Health Compliance and Responsiveness",
    capacity: 120,
    custodian: "Dr. Carmela Santos (MHO Lead Physician)",
    addressLine: "Health Compound, A. Bonifacio St., Brgy. Barangka",
    description: "DOH-accredited primary medical and maternal healthcare unit with cold-chain vaccine storage and triage zone.",
    acquiredAt: "2019-06-20T09:00:00.000Z",
    acquisitionCost: 9200000,
    isEvacuationCenter: false,
    source: "CBMS",
    createdAt: "2019-06-20T09:00:00.000Z",
    updatedAt: "2026-08-15T11:00:00.000Z",
  },
  {
    id: "prop-04",
    barangayId: STATIC_BARANGAY_ID,
    name: "EARLY CHILDHOOD DEVELOPMENT & DAY CARE CENTER",
    type: "infrastructure",
    status: "operational",
    category: "Social Protection and Sensitivity Program",
    capacity: 60,
    custodian: "Elena Reyes (Child Development Worker)",
    addressLine: "Purok 2 Elementary School Lane, Brgy. Barangka",
    description: "Inclusive early education facility serving 3-5 year old children from low-income households with nutritional feeding counter.",
    acquiredAt: "2021-02-14T08:00:00.000Z",
    acquisitionCost: 4500000,
    isEvacuationCenter: false,
    source: "CBMS",
    createdAt: "2021-02-14T08:00:00.000Z",
    updatedAt: "2026-07-28T09:30:00.000Z",
  },
  {
    id: "prop-05",
    barangayId: STATIC_BARANGAY_ID,
    name: "MATERIALS RECOVERY FACILITY (MRF) & ECO-HUB",
    type: "infrastructure",
    status: "operational",
    category: "Environmental Management",
    capacity: 50,
    custodian: "Fernando Cruz (Solid Waste Management Supervisor)",
    addressLine: "Riverside Access Road, Zone 4",
    description: "Solid waste segregation shed, compost shredding station, and plastic bottle baling equipment per RA 9003.",
    acquiredAt: "2022-04-18T11:00:00.000Z",
    acquisitionCost: 3200000,
    isEvacuationCenter: false,
    source: "CBMS",
    createdAt: "2022-04-18T11:00:00.000Z",
    updatedAt: "2026-08-10T16:00:00.000Z",
  },
  {
    id: "prop-06",
    barangayId: STATIC_BARANGAY_ID,
    name: "COMMUNITY POLICE ACTION & TANOD SECURITY OUTPOST",
    type: "infrastructure",
    status: "operational",
    category: "Peace and Order",
    capacity: 25,
    custodian: "Rodolfo Magno (Chief Tanod / Security Officer)",
    addressLine: "Junction Marcos Highway & J.P. Rizal St.",
    description: "24/7 strategic peace-and-order monitoring hub with radio dispatch relay and holding bench.",
    acquiredAt: "2021-11-05T14:00:00.000Z",
    acquisitionCost: 1850000,
    isEvacuationCenter: false,
    source: "CBMS",
    createdAt: "2021-11-05T14:00:00.000Z",
    updatedAt: "2026-08-05T12:00:00.000Z",
  },
  {
    id: "prop-07",
    barangayId: STATIC_BARANGAY_ID,
    name: "MARIKINA RIVER FLOOD MITIGATION PUMPING STATION #1",
    type: "infrastructure",
    status: "operational",
    category: "Disaster Preparedness",
    capacity: 15,
    custodian: "Engr. Manuel Soriano (Flood Mitigation Officer)",
    addressLine: "Marikina Riverbanks Dike Station 3",
    description: "High-capacity dual axial flow submersible flood pumps serving low-lying catchment areas.",
    acquiredAt: "2021-07-22T08:30:00.000Z",
    acquisitionCost: 14750000,
    isEvacuationCenter: false,
    source: "CBMS",
    createdAt: "2021-07-22T08:30:00.000Z",
    updatedAt: "2026-09-02T10:00:00.000Z",
  },
  {
    id: "prop-08",
    barangayId: STATIC_BARANGAY_ID,
    name: "BARANGAY LIVELIHOOD & WOMEN'S SKILLS TRAINING CENTER",
    type: "infrastructure",
    status: "operational",
    category: "Social Protection and Sensitivity Program",
    capacity: 80,
    custodian: "Rosario Gomez (GAD Focal Person)",
    addressLine: "3rd Floor, Annex Bldg., Barangay Complex",
    description: "GAD-funded facility equipped with commercial sewing machines, baking ovens, and soap-making workshop tables.",
    acquiredAt: "2022-10-10T13:00:00.000Z",
    acquisitionCost: 5600000,
    isEvacuationCenter: false,
    source: "CBMS",
    createdAt: "2022-10-10T13:00:00.000Z",
    updatedAt: "2026-08-18T15:00:00.000Z",
  },
  {
    id: "prop-09",
    barangayId: STATIC_BARANGAY_ID,
    name: "SENIOR CITIZENS & PWD MULTI-PURPOSE ACTIVITY PAVILION",
    type: "infrastructure",
    status: "operational",
    category: "Social Protection and Sensitivity Program",
    capacity: 150,
    custodian: "Lualhati Mendoza (OSCA Barangay Coordinator)",
    addressLine: "Purok 3 Green Park Compound",
    description: "Wheelchair-accessible community pavilion with senior physical therapy equipment, social hall, and pension disbursement station.",
    acquiredAt: "2023-01-20T09:15:00.000Z",
    acquisitionCost: 4800000,
    isEvacuationCenter: false,
    source: "CBMS",
    createdAt: "2023-01-20T09:15:00.000Z",
    updatedAt: "2026-08-12T11:45:00.000Z",
  },
  {
    id: "prop-10",
    barangayId: STATIC_BARANGAY_ID,
    name: "TOYOTA HILUX 4X4 EMERGENCY PATROL & RESCUE VEHICLE",
    type: "non_infrastructure",
    status: "operational",
    category: "Peace and Order",
    capacity: 6,
    custodian: "Rodolfo Magno (Chief Tanod)",
    addressLine: "Barangay Hall Motorpool Bay 1",
    description: "Plate: SAA-4892. Outfitted with LED lightbar, PA amplifier, heavy-duty winch, searchlights, and medical first-response kit.",
    acquiredAt: "2022-03-12T10:00:00.000Z",
    acquisitionCost: 1950000,
    isEvacuationCenter: false,
    source: "CBMS",
    createdAt: "2022-03-12T10:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "prop-11",
    barangayId: STATIC_BARANGAY_ID,
    name: "TYPE II FULLY EQUIPPED EMERGENCY MEDICAL AMBULANCE",
    type: "non_infrastructure",
    status: "operational",
    category: "Health Compliance and Responsiveness",
    capacity: 4,
    custodian: "Katrina Aquino (Emergency Medical Head / BHW Lead)",
    addressLine: "Health Center Ambulance Bay",
    description: "Plate: SAA-3190. Equipped with stretcher, suction pump, portable ventilator, cardiac monitor, and oxygen manifold.",
    acquiredAt: "2021-08-15T09:00:00.000Z",
    acquisitionCost: 2850000,
    isEvacuationCenter: false,
    source: "CBMS",
    createdAt: "2021-08-15T09:00:00.000Z",
    updatedAt: "2026-08-30T14:20:00.000Z",
  },
  {
    id: "prop-12",
    barangayId: STATIC_BARANGAY_ID,
    name: "HEAVY-DUTY ALUMINUM RESCUE BOATS WITH 40HP OUTBOARD MOTOR (SET OF 2)",
    type: "non_infrastructure",
    status: "operational",
    category: "Disaster Preparedness",
    capacity: 12,
    custodian: "Danilo Ramos (BDRRMC Action Officer)",
    addressLine: "Riverbank Staging Shed Station B",
    description: "Rigid-hull aluminum flood rescue watercraft with Yamaha 40HP 2-stroke outboard engine, oars, life jackets, and throw bags.",
    acquiredAt: "2023-05-18T14:30:00.000Z",
    acquisitionCost: 980000,
    isEvacuationCenter: false,
    source: "CBMS",
    createdAt: "2023-05-18T14:30:00.000Z",
    updatedAt: "2026-08-25T16:00:00.000Z",
  },
  {
    id: "prop-13",
    barangayId: STATIC_BARANGAY_ID,
    name: "CUMMINS 75KVA SILENT DIESEL STANDBY GENERATOR",
    type: "non_infrastructure",
    status: "operational",
    category: "Good Fiscal or Financial Administration or Fiscal Sustainability",
    capacity: 0,
    custodian: "Roberto Valenzuela (Building Maintenance Head)",
    addressLine: "Hall Utility Yard Power Enclosure",
    description: "Auto-transfer switch (ATS) soundproof generator supplying backup power to Barangay Hall, Health Clinic, and CCTV Command Center.",
    acquiredAt: "2020-11-02T11:00:00.000Z",
    acquisitionCost: 1450000,
    isEvacuationCenter: false,
    source: "CBMS",
    createdAt: "2020-11-02T11:00:00.000Z",
    updatedAt: "2026-08-28T10:15:00.000Z",
  },
  {
    id: "prop-14",
    barangayId: STATIC_BARANGAY_ID,
    name: "ISUZU ELF 6-WHEELER HYDRAULIC COMPACTOR GARBAGE TRUCK",
    type: "non_infrastructure",
    status: "operational",
    category: "Environmental Management",
    capacity: 3,
    custodian: "Fernando Cruz (Solid Waste Management Supervisor)",
    addressLine: "Motorpool Bay 3",
    description: "Plate: NBE-8821. 6-cubic meter rear-loading hydraulic compactor truck serving daily Purok segregation routes.",
    acquiredAt: "2021-06-25T08:00:00.000Z",
    acquisitionCost: 3400000,
    isEvacuationCenter: false,
    source: "CBMS",
    createdAt: "2021-06-25T08:00:00.000Z",
    updatedAt: "2026-09-03T11:00:00.000Z",
  },
  {
    id: "prop-15",
    barangayId: STATIC_BARANGAY_ID,
    name: "FEDERAL SIGNAL COMMUNITY EARLY WARNING SIREN SYSTEM",
    type: "non_infrastructure",
    status: "operational",
    category: "Disaster Preparedness",
    capacity: 0,
    custodian: "Danilo Ramos (BDRRMC Action Officer)",
    addressLine: "Barangay Hall Roofdeck Tower",
    description: "128dB multi-tone omnidirectional electronic flood warning siren network with wireless radio trigger and solar backup.",
    acquiredAt: "2022-09-08T15:00:00.000Z",
    acquisitionCost: 650000,
    isEvacuationCenter: false,
    source: "CBMS",
    createdAt: "2022-09-08T15:00:00.000Z",
    updatedAt: "2026-08-14T09:00:00.000Z",
  },
  {
    id: "prop-16",
    barangayId: STATIC_BARANGAY_ID,
    name: "HIGH-DEFINITION CCTV CENTRAL COMMAND & SURVEILLANCE CONSOLE",
    type: "non_infrastructure",
    status: "operational",
    category: "Peace and Order",
    capacity: 8,
    custodian: "Mark Villanueva (IT & CCTV Supervisor)",
    addressLine: "2nd Floor Command Operations Center",
    description: "32-channel 4K NVR matrix with 64TB NAS storage, 6 wall display screens, and PTZ controllers covering critical intersections.",
    acquiredAt: "2023-03-14T10:30:00.000Z",
    acquisitionCost: 2100000,
    isEvacuationCenter: false,
    source: "CBMS",
    createdAt: "2023-03-14T10:30:00.000Z",
    updatedAt: "2026-08-20T17:00:00.000Z",
  },
  {
    id: "prop-17",
    barangayId: STATIC_BARANGAY_ID,
    name: "AUTOMATED EXTERNAL DEFIBRILLATOR (AED) PORTABLE UNITS (3 UNITS)",
    type: "non_infrastructure",
    status: "operational",
    category: "Health Compliance and Responsiveness",
    capacity: 0,
    custodian: "Katrina Aquino (Emergency Medical Head)",
    addressLine: "Hall Lobby, Covered Court, Clinic",
    description: "Philips HeartStart bilingual CPR-assist AED units mounted in alarmed quick-access wall enclosures.",
    acquiredAt: "2023-06-11T13:00:00.000Z",
    acquisitionCost: 360000,
    isEvacuationCenter: false,
    source: "CBMS",
    createdAt: "2023-06-11T13:00:00.000Z",
    updatedAt: "2026-07-30T10:00:00.000Z",
  },
  {
    id: "prop-18",
    barangayId: STATIC_BARANGAY_ID,
    name: "KUBOTA EMERGENCY DRAINAGE DEWATERING SUBMERSIBLE PUMP",
    type: "non_infrastructure",
    status: "under_maintenance",
    category: "Disaster Preparedness",
    capacity: 0,
    custodian: "Engr. Manuel Soriano (Flood Mitigation Officer)",
    addressLine: "Equipment Depot Bay 2",
    description: "3-inch portable diesel trash pump for alleyway flood pocket de-clogging and street drainage flushing. Undergoing routine seal servicing.",
    acquiredAt: "2022-08-30T16:00:00.000Z",
    acquisitionCost: 520000,
    isEvacuationCenter: false,
    source: "CBMS",
    createdAt: "2022-08-30T16:00:00.000Z",
    updatedAt: "2026-09-08T09:00:00.000Z",
  },
];

export const STATIC_MATERIALS: StaticMaterial[] = [
  {
    id: "mat-01",
    barangayId: STATIC_BARANGAY_ID,
    name: "Emergency Family Food Packs (6kg Rice, Canned Goods, Coffee, Biscuits)",
    unit: "boxes",
    quantity: 450,
    reorderLevel: 200,
    location: "DRRM Relief Warehouse Bay A",
    createdAt: "2026-08-01T08:00:00.000Z",
    updatedAt: "2026-09-05T14:30:00.000Z",
  },
  {
    id: "mat-02",
    barangayId: STATIC_BARANGAY_ID,
    name: "Trauma & First Aid Emergency Response Medical Kits",
    unit: "kits",
    quantity: 35,
    reorderLevel: 50,
    location: "Health Center Medical Stockroom",
    createdAt: "2026-08-01T08:00:00.000Z",
    updatedAt: "2026-09-10T11:00:00.000Z",
  },
  {
    id: "mat-03",
    barangayId: STATIC_BARANGAY_ID,
    name: "Heavy-Duty Adult Life Vests with SOLAS Whistle",
    unit: "pcs",
    quantity: 180,
    reorderLevel: 100,
    location: "River Rescue Staging Bay",
    createdAt: "2026-08-01T08:00:00.000Z",
    updatedAt: "2026-08-28T16:00:00.000Z",
  },
  {
    id: "mat-04",
    barangayId: STATIC_BARANGAY_ID,
    name: "High-Lumen Rechargeable LED Searchlights with Beacon",
    unit: "units",
    quantity: 24,
    reorderLevel: 15,
    location: "Tanod Equipment Locker",
    createdAt: "2026-08-01T08:00:00.000Z",
    updatedAt: "2026-08-15T10:00:00.000Z",
  },
  {
    id: "mat-05",
    barangayId: STATIC_BARANGAY_ID,
    name: "Heavy-Duty Woven Polypropylene Flood Sandbags",
    unit: "sacks",
    quantity: 1200,
    reorderLevel: 500,
    location: "Flood Mitigation Depot",
    createdAt: "2026-08-01T08:00:00.000Z",
    updatedAt: "2026-09-02T13:20:00.000Z",
  },
  {
    id: "mat-06",
    barangayId: STATIC_BARANGAY_ID,
    name: "Emergency Family Hygiene & Sanitation Kits",
    unit: "kits",
    quantity: 85,
    reorderLevel: 100,
    location: "DSWD Barangay Storage Shelf 2",
    createdAt: "2026-08-01T08:00:00.000Z",
    updatedAt: "2026-09-08T15:40:00.000Z",
  },
  {
    id: "mat-07",
    barangayId: STATIC_BARANGAY_ID,
    name: "Calcium Hypochlorite 70% Water Purification Chemical Drums (45kg)",
    unit: "drums",
    quantity: 12,
    reorderLevel: 8,
    location: "Health Sanitation Chemical Vault",
    createdAt: "2026-08-01T08:00:00.000Z",
    updatedAt: "2026-08-20T09:15:00.000Z",
  },
  {
    id: "mat-08",
    barangayId: STATIC_BARANGAY_ID,
    name: "Stihl MS-382 Heavy-Duty Gasoline Rescue Chainsaws",
    unit: "units",
    quantity: 4,
    reorderLevel: 3,
    location: "DRRM Power Tools Rack",
    createdAt: "2026-08-01T08:00:00.000Z",
    updatedAt: "2026-08-10T14:00:00.000Z",
  },
  {
    id: "mat-09",
    barangayId: STATIC_BARANGAY_ID,
    name: "Waterproof High-Visibility BDRRMC Responder Rain Suits & Boots",
    unit: "sets",
    quantity: 42,
    reorderLevel: 30,
    location: "Volunteer Depot Locker C",
    createdAt: "2026-08-01T08:00:00.000Z",
    updatedAt: "2026-08-25T11:30:00.000Z",
  },
  {
    id: "mat-10",
    barangayId: STATIC_BARANGAY_ID,
    name: "Unleaded Fuel & Low-Sulfur Diesel Strategic Generator Reserve",
    unit: "drums (200L)",
    quantity: 6,
    reorderLevel: 10,
    location: "Motorpool Fuel Bunker",
    createdAt: "2026-08-01T08:00:00.000Z",
    updatedAt: "2026-09-09T16:00:00.000Z",
  },
];

// ============================================================================
// RESIDENT CONCERNS (311 DISPATCH & COMMUNITY SAFETY REPORTS)
// ============================================================================

export interface StaticConcern {
  id: string;
  barangayId: string;
  inhabitantId?: string | null;
  referenceNo: string;
  category: string;
  description: string;
  purok?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: "submitted" | "acknowledged" | "in_progress" | "resolved" | "rejected";
  slaDueAt?: string | null;
  slaBreached?: boolean;
  acknowledgedAt?: string | null;
  resolvedAt?: string | null;
  resolutionNote?: string | null;
  inhabitant?: { firstName: string; lastName: string; contactNo?: string } | null;
  createdAt: string;
  updatedAt: string;
}

export const STATIC_CONCERNS: StaticConcern[] = [
  {
    id: "cn-01",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "res-01",
    referenceNo: "CN-2026-00001",
    category: "streetlight",
    description: "Pundidong ilaw sa poste ng Meralco sa kanto ng J.P. Rizal St. at A. Bonifacio Ave. Madilim at delikado sa mga naglalakad na mga trabahador at estudyante sa gabi.",
    purok: "Purok 1",
    latitude: 14.6394,
    longitude: 121.1168,
    status: "submitted",
    slaDueAt: "2026-09-14T19:30:00.000Z",
    slaBreached: false,
    inhabitant: { firstName: "Maria Theresa", lastName: "Santos", contactNo: "0917-882-3101" },
    createdAt: "2026-09-11T19:30:00.000Z",
    updatedAt: "2026-09-11T19:30:00.000Z",
  },
  {
    id: "cn-02",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "res-02",
    referenceNo: "CN-2026-00002",
    category: "noise",
    description: "Malakas na videoke at inuman sa tapat ng bahay lampas alas-dose ng hatinggabi sa Interior Riverside. Hindi makatulog ang mga bata at may pasok kinabukasan.",
    purok: "Purok 4",
    latitude: 14.6465,
    longitude: 121.0969,
    status: "in_progress",
    slaDueAt: "2026-09-15T01:15:00.000Z",
    slaBreached: false,
    acknowledgedAt: "2026-09-12T01:30:00.000Z",
    resolutionNote: "Tanod Mobile Patrol Unit 2 dispatched to remind homeowner on Barangay Curfew & Anti-Noise Ordinance.",
    inhabitant: { firstName: "Juan Carlos", lastName: "Ramos", contactNo: "0920-554-1928" },
    createdAt: "2026-09-12T01:15:00.000Z",
    updatedAt: "2026-09-12T01:30:00.000Z",
  },
  {
    id: "cn-03",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "res-03",
    referenceNo: "CN-2026-00003",
    category: "flooding",
    description: "Baradong kanal at culvert sa tapat ng Barangka Elementary School. Umaapaw ang maruming tubig sa kalsada kapag umuulan at may masangsang na amoy.",
    purok: "Purok 2",
    latitude: 14.6624,
    longitude: 121.1217,
    status: "acknowledged",
    slaDueAt: "2026-09-13T14:00:00.000Z",
    slaBreached: false,
    acknowledgedAt: "2026-09-10T15:30:00.000Z",
    inhabitant: { firstName: "Elena", lastName: "Rodriguez", contactNo: "0919-443-8821" },
    createdAt: "2026-09-10T14:00:00.000Z",
    updatedAt: "2026-09-10T15:30:00.000Z",
  },
  {
    id: "cn-04",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "res-04",
    referenceNo: "CN-2026-00004",
    category: "stray_animal",
    description: "Grupo ng mga asong gala na nanghahabol ng mga naka-motorsiklo at bisikleta sa kahabaan ng Marcos Highway service road. May nakagat na bata kahapon.",
    purok: "Purok 6",
    latitude: 14.6569,
    longitude: 121.0978,
    status: "in_progress",
    slaDueAt: "2026-09-12T09:20:00.000Z",
    slaBreached: false,
    acknowledgedAt: "2026-09-09T10:00:00.000Z",
    resolutionNote: "Coordinating with City Veterinary Office for impounding cage deployment and rabies vaccination drive.",
    inhabitant: { firstName: "Danilo", lastName: "Fernandez", contactNo: "0918-772-9930" },
    createdAt: "2026-09-09T09:20:00.000Z",
    updatedAt: "2026-09-09T10:00:00.000Z",
  },
  {
    id: "cn-05",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "res-05",
    referenceNo: "CN-2026-00005",
    category: "garbage",
    description: "Tambak ng hindi nakokolektang mga basura at construction debris sa bakanteng lote sa Dahlia St. Pinamamahayan na ng mga daga at langaw.",
    purok: "Purok 3",
    latitude: 14.6574,
    longitude: 121.1371,
    status: "submitted",
    slaDueAt: "2026-09-09T10:00:00.000Z",
    slaBreached: true,
    inhabitant: { firstName: "Roberto", lastName: "Valenzuela", contactNo: "0922-331-4490" },
    createdAt: "2026-09-06T10:00:00.000Z",
    updatedAt: "2026-09-06T10:00:00.000Z",
  },
  {
    id: "cn-06",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "res-06",
    referenceNo: "CN-2026-00006",
    category: "pothole",
    description: "Malalim na lubak sa gitna ng daan sa tapat ng covered court. Muntik nang tumaob ang tricycle kaninang umaga dahil sa lalim ng butas.",
    purok: "Purok 1",
    latitude: 14.6769,
    longitude: 121.1111,
    status: "resolved",
    slaDueAt: "2026-09-08T08:00:00.000Z",
    slaBreached: false,
    acknowledgedAt: "2026-09-05T09:15:00.000Z",
    resolvedAt: "2026-09-07T16:00:00.000Z",
    resolutionNote: "Tinambakan at pinitsohan ng cold-mix asphalt ng Barangay Maintenance & Tanod engineering crew.",
    inhabitant: { firstName: "Liza", lastName: "Macaraeg", contactNo: "0915-992-1144" },
    createdAt: "2026-09-05T08:00:00.000Z",
    updatedAt: "2026-09-07T16:00:00.000Z",
  },
  {
    id: "cn-07",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "res-07",
    referenceNo: "CN-2026-00007",
    category: "streetlight",
    description: "Tatlong sunod-sunod na solar streetlights na namatay sa pathway papuntang ilog. Madilim at ginagawang tagayan ng mga kabataan.",
    purok: "Purok 5",
    latitude: 14.6498,
    longitude: 121.1296,
    status: "in_progress",
    slaDueAt: "2026-09-14T18:45:00.000Z",
    slaBreached: false,
    acknowledgedAt: "2026-09-11T20:00:00.000Z",
    resolutionNote: "Tanod night foot patrol assigned to guard area. Replacement lithium solar batteries requested from Motorpool.",
    inhabitant: { firstName: "Nestor", lastName: "Gomez", contactNo: "0927-113-5582" },
    createdAt: "2026-09-11T18:45:00.000Z",
    updatedAt: "2026-09-11T20:00:00.000Z",
  },
  {
    id: "cn-08",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "res-08",
    referenceNo: "CN-2026-00008",
    category: "other",
    description: "Nakahambalang na sirang delivery van sa kanto ng Sampaguita St. Hindi makapasok ang bumbero o ambulansya kung sakaling magka-sunog o emergency.",
    purok: "Purok 7",
    latitude: 14.6512,
    longitude: 121.1054,
    status: "acknowledged",
    slaDueAt: "2026-09-13T11:00:00.000Z",
    slaBreached: false,
    acknowledgedAt: "2026-09-10T13:00:00.000Z",
    inhabitant: { firstName: "Corazon", lastName: "Alcantara", contactNo: "0932-665-7719" },
    createdAt: "2026-09-10T11:00:00.000Z",
    updatedAt: "2026-09-10T13:00:00.000Z",
  },
  {
    id: "cn-09",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: null,
    referenceNo: "CN-2026-00009",
    category: "flooding",
    description: "Tumutagas na malaking tubo ng Manila Water sa sidewalk ng Shoe Ave. Umaagos ang malinis na tubig sa kalye at nagdudulot ng madulas na putik.",
    purok: "Purok 4",
    latitude: 14.6488,
    longitude: 121.1123,
    status: "resolved",
    slaDueAt: "2026-09-10T07:30:00.000Z",
    slaBreached: false,
    acknowledgedAt: "2026-09-07T08:00:00.000Z",
    resolvedAt: "2026-09-08T14:30:00.000Z",
    resolutionNote: "Nai-coordinate sa Manila Water Quick Response Team; natapos ang pipe clamping at leak restoration.",
    inhabitant: null,
    createdAt: "2026-09-07T07:30:00.000Z",
    updatedAt: "2026-09-08T14:30:00.000Z",
  },
  {
    id: "cn-10",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "res-09",
    referenceNo: "CN-2026-00010",
    category: "noise",
    description: "Maikot na pagpaparaing ng open pipe muffler ng mga motorsiklo sa Purok 2 tuwing madaling araw. Hinihiling ang Tanod checkpoint o speed control.",
    purok: "Purok 2",
    latitude: 14.6610,
    longitude: 121.1245,
    status: "submitted",
    slaDueAt: "2026-09-15T05:00:00.000Z",
    slaBreached: false,
    inhabitant: { firstName: "Arturo", lastName: "Pineda", contactNo: "0916-224-8891" },
    createdAt: "2026-09-12T05:00:00.000Z",
    updatedAt: "2026-09-12T05:00:00.000Z",
  },
  {
    id: "cn-11",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "res-10",
    referenceNo: "CN-2026-00011",
    category: "garbage",
    description: "Mga plastic sando bags at styrofoam na itinapon sa riverbank easement. Pagsapit ng high tide ay naanod sa Marikina river.",
    purok: "Purok 5",
    latitude: 14.6472,
    longitude: 121.0988,
    status: "resolved",
    slaDueAt: "2026-09-07T16:00:00.000Z",
    slaBreached: false,
    acknowledgedAt: "2026-09-04T17:00:00.000Z",
    resolvedAt: "2026-09-06T11:00:00.000Z",
    resolutionNote: "Nalinis ng Barangay River Patrol Eco-Aides kasama ang Barangay Tanod river guards.",
    inhabitant: { firstName: "Gloria", lastName: "Bautista", contactNo: "0917-338-9920" },
    createdAt: "2026-09-04T16:00:00.000Z",
    updatedAt: "2026-09-06T11:00:00.000Z",
  },
  {
    id: "cn-12",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "res-11",
    referenceNo: "CN-2026-00012",
    category: "pothole",
    description: "Bumigay na drainage cover / manhole sa harap ng Barangka Talipapa. Maaaring mahulog ang mga tao lalo na sa gabi.",
    purok: "Purok 1",
    latitude: 14.6421,
    longitude: 121.1154,
    status: "acknowledged",
    slaDueAt: "2026-09-10T13:10:00.000Z",
    slaBreached: true,
    acknowledgedAt: "2026-09-07T14:00:00.000Z",
    inhabitant: { firstName: "Fernando", lastName: "Ocampo", contactNo: "0920-881-2234" },
    createdAt: "2026-09-07T13:10:00.000Z",
    updatedAt: "2026-09-07T14:00:00.000Z",
  },
  {
    id: "cn-13",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "res-12",
    referenceNo: "CN-2026-00013",
    category: "stray_animal",
    description: "Kuting at aso na nakakulong sa abandonadong bahay, walang pagkain at tubig, panay ang tahol at iyak na nakaka-abala sa magkapitbahay.",
    purok: "Purok 3",
    latitude: 14.6555,
    longitude: 121.1321,
    status: "in_progress",
    slaDueAt: "2026-09-14T10:15:00.000Z",
    slaBreached: false,
    acknowledgedAt: "2026-09-11T11:00:00.000Z",
    resolutionNote: "Barangay Tanod coordinated with PAWS animal welfare volunteer for temporary foster custody.",
    inhabitant: { firstName: "Joy", lastName: "Del Rosario", contactNo: "0919-661-0023" },
    createdAt: "2026-09-11T10:15:00.000Z",
    updatedAt: "2026-09-11T11:00:00.000Z",
  },
  {
    id: "cn-14",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "res-13",
    referenceNo: "CN-2026-00014",
    category: "other",
    description: "Sanga ng malaking punong mangga na nakasandal sa kawad ng kuryente at telepono sa kahabaan ng Zone 4. Nanganganib mag-spark kapag humangin.",
    purok: "Purok 4",
    latitude: 14.6478,
    longitude: 121.1012,
    status: "submitted",
    slaDueAt: "2026-09-15T08:00:00.000Z",
    slaBreached: false,
    inhabitant: { firstName: "Mark Anthony", lastName: "Tan", contactNo: "0922-771-3341" },
    createdAt: "2026-09-12T08:00:00.000Z",
    updatedAt: "2026-09-12T08:00:00.000Z",
  },
  {
    id: "cn-15",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "res-14",
    referenceNo: "CN-2026-00015",
    category: "streetlight",
    description: "Patay-sinding poste sa Purok 6 tapat ng basketball half-court. Baka magdulot ng electrical short circuit.",
    purok: "Purok 6",
    latitude: 14.6541,
    longitude: 121.0965,
    status: "resolved",
    slaDueAt: "2026-09-06T19:00:00.000Z",
    slaBreached: false,
    acknowledgedAt: "2026-09-04T08:30:00.000Z",
    resolvedAt: "2026-09-05T15:00:00.000Z",
    resolutionNote: "Pinalitan ng bagong 100W LED bulb ng Barangay maintenance electrician.",
    inhabitant: { firstName: "Tessie", lastName: "Morales", contactNo: "0915-442-7789" },
    createdAt: "2026-09-03T19:00:00.000Z",
    updatedAt: "2026-09-05T15:00:00.000Z",
  },
  {
    id: "cn-16",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "res-15",
    referenceNo: "CN-2026-00016",
    category: "flooding",
    description: "Pag-apaw ng drainage creek tuwing biglang buhos ng ulan dahil sa naipong water hyacinth at putik.",
    purok: "Purok 7",
    latitude: 14.6525,
    longitude: 121.1078,
    status: "in_progress",
    slaDueAt: "2026-09-13T16:30:00.000Z",
    slaBreached: false,
    acknowledgedAt: "2026-09-10T17:00:00.000Z",
    resolutionNote: "Flood mitigation backhoe and Tanod crew deployed for river easement desiltation.",
    inhabitant: { firstName: "Pedro", lastName: "Castillo", contactNo: "0917-119-4456" },
    createdAt: "2026-09-10T16:30:00.000Z",
    updatedAt: "2026-09-10T17:00:00.000Z",
  },
  {
    id: "cn-17",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: null,
    referenceNo: "CN-2026-00017",
    category: "noise",
    description: "Nag-aaway na kapitbahay sa Purok 3 Pasilyo 2, nagbabatuhan ng mga bote sa eskinita.",
    purok: "Purok 3",
    latitude: 14.6562,
    longitude: 121.1345,
    status: "resolved",
    slaDueAt: "2026-09-14T22:30:00.000Z",
    slaBreached: false,
    acknowledgedAt: "2026-09-11T22:40:00.000Z",
    resolvedAt: "2026-09-11T23:45:00.000Z",
    resolutionNote: "Agad pinuntahan ng Tanod on-duty; inawat at dinala sa barangay outpost para sa paunang mediation.",
    inhabitant: null,
    createdAt: "2026-09-11T22:30:00.000Z",
    updatedAt: "2026-09-11T23:45:00.000Z",
  },
  {
    id: "cn-18",
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "res-16",
    referenceNo: "CN-2026-00018",
    category: "garbage",
    description: "May nag-iwan ng patay na hayop at maruruming diaper sa tapat ng waiting shed sa Purok 2.",
    purok: "Purok 2",
    latitude: 14.6618,
    longitude: 121.1231,
    status: "resolved",
    slaDueAt: "2026-09-14T06:00:00.000Z",
    slaBreached: false,
    acknowledgedAt: "2026-09-11T06:30:00.000Z",
    resolvedAt: "2026-09-11T08:00:00.000Z",
    resolutionNote: "Agad kinuha at inilibing ng sanitation crew, at binuhusan ng disinfectant ang paligid.",
    inhabitant: { firstName: "Remedios", lastName: "Cruz", contactNo: "0928-335-6671" },
    createdAt: "2026-09-11T06:00:00.000Z",
    updatedAt: "2026-09-11T08:00:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// IT Support & Incident Tickets Mock Data
// ---------------------------------------------------------------------------

export interface StaticTicketResponse {
  id: string;
  body: string;
  createdAt: string;
  authorName?: string;
  isInternal?: boolean;
}

export interface StaticTicket {
  id: string;
  barangayId?: string;
  subject: string;
  body: string;
  category: "technical" | "access" | "data_correction" | "training" | "other";
  status: "open" | "in_progress" | "escalated" | "resolved" | "closed";
  priority: "urgent" | "high" | "normal" | "low";
  createdAt: string;
  updatedAt?: string;
  responses?: StaticTicketResponse[];
}

export const STATIC_TICKETS: StaticTicket[] = [
  {
    id: "tkt-001",
    barangayId: STATIC_BARANGAY_ID,
    subject: "Thermal POS receipt printer offline at Treasury Window 1",
    body: "During issuance of Community Tax Certificate (Cedula) and Barangay Clearance, the thermal POS printer (Epson TM-T82) stopped communicating with the cashier workstation. Red error LED is flashing. Cashier currently writing manual receipts.",
    category: "technical",
    priority: "urgent",
    status: "in_progress",
    createdAt: "2026-09-21T08:15:00.000Z",
    updatedAt: "2026-09-21T08:25:00.000Z",
    responses: [
      {
        id: "tr-001",
        body: "IT Helpdesk (M. Alcantara): Investigating workstation spooler service. Restarted Windows Print Spooler and reseated high-speed USB cable. Running test 80mm feed calibration.",
        createdAt: "2026-09-21T08:25:00.000Z",
      },
    ],
  },
  {
    id: "tkt-002",
    barangayId: STATIC_BARANGAY_ID,
    subject: "Account security lockout after failed password retries — Elena Rivera (VAW Desk)",
    body: "Elena Rivera (VAWC Desk Officer) was locked out of her console session after 5 consecutive password attempts on the newly deployed intake terminal in Room 204. Requesting security lock clearance and password reset.",
    category: "access",
    priority: "high",
    status: "open",
    createdAt: "2026-09-21T08:45:00.000Z",
    updatedAt: "2026-09-21T08:45:00.000Z",
    responses: [],
  },
  {
    id: "tkt-003",
    barangayId: STATIC_BARANGAY_ID,
    subject: "Typographical correction for PhilSys ID on Inhabitant record inh-004",
    body: "Barangay Secretary noted that PhilSys Card number for resident Roberto Gonzales was entered as 1234-5678-9012-3450 instead of 1234-5678-9012-3456. Resident presented original National ID physical card and PhilSys QR verification slip. Correction requested with audit logging.",
    category: "data_correction",
    priority: "normal",
    status: "open",
    createdAt: "2026-09-20T14:10:00.000Z",
    updatedAt: "2026-09-20T14:10:00.000Z",
    responses: [],
  },
  {
    id: "tkt-004",
    barangayId: STATIC_BARANGAY_ID,
    subject: "Replication sync timeout during brownout: 4 blotter entries in offline queue",
    body: "During brief power outage at Purok 4 Sub-station, 4 incident reports were entered into the offline SQLite edge buffer. When power returned, sync daemon reported replication timeout (E_SYNC_SOCKET_TIMEOUT). Requesting central cloud database consistency check.",
    category: "technical",
    priority: "urgent",
    status: "escalated",
    createdAt: "2026-09-20T11:30:00.000Z",
    updatedAt: "2026-09-20T12:20:00.000Z",
    responses: [
      {
        id: "tr-002",
        body: "IT Officer (M. Alcantara): Checked edge tablet local journal. All 4 incident entries are intact with cryptographic client signatures. Escalating to Central LGU Platform Ops for forced replica reconciliation.",
        createdAt: "2026-09-20T11:50:00.000Z",
      },
      {
        id: "tr-003",
        body: "Central Platform Ops (D. Tan): Escalation received. Triggered manual replication pipeline for Barangay Barangka node. Outpost telemetry confirms all 4 blotter records committed and assigned canonical numbers.",
        createdAt: "2026-09-20T12:20:00.000Z",
      },
    ],
  },
  {
    id: "tkt-005",
    barangayId: STATIC_BARANGAY_ID,
    subject: "Biometric USB scanner device not detected on Registry Station 3",
    body: "Registry station 3 reports 'Device Not Found' when attempting inhabitant biometric enrollment. USB status in Windows Device Manager displays warning code 43 (Port Reset Failed).",
    category: "technical",
    priority: "high",
    status: "in_progress",
    createdAt: "2026-09-21T07:50:00.000Z",
    updatedAt: "2026-09-21T08:10:00.000Z",
    responses: [
      {
        id: "tr-004",
        body: "IT Support: Reconnected scanner to powered USB 3.0 back panel port. Reinstalling vendor biometric SDK drivers v3.4.1. Remote session established with Registry Station 3.",
        createdAt: "2026-09-21T08:10:00.000Z",
      },
    ],
  },
  {
    id: "tkt-006",
    barangayId: STATIC_BARANGAY_ID,
    subject: "Request to merge duplicate inhabitant records for Maria Clara Delos Santos",
    body: "Inhabitant was encoded twice: once under maiden name 'Maria Clara Cruz' (inh-089) and once under married name 'Maria Clara Delos Santos' (inh-214). Both share the same PhilSys national identity number and date of birth.",
    category: "data_correction",
    priority: "high",
    status: "resolved",
    createdAt: "2026-09-17T13:20:00.000Z",
    updatedAt: "2026-09-17T15:45:00.000Z",
    responses: [
      {
        id: "tr-005",
        body: "IT Officer (M. Alcantara): PhilSys hash confirmed identical. Unified certificate history, blotter references, and household tree under master record inh-214. Flagged inh-089 as merged alias in audit trail.",
        createdAt: "2026-09-17T15:45:00.000Z",
      },
    ],
  },
  {
    id: "tkt-007",
    barangayId: STATIC_BARANGAY_ID,
    subject: "Refresher session request: Lupong Tagapamayapa KP Form 7 to Form 11 generation",
    body: "Lupon Secretary Atty. Cruz requested a 30-minute training session for newly appointed Lupon clerks on generating automated summons, hearing notices, and amicable settlement certificates directly from blotter entries.",
    category: "training",
    priority: "low",
    status: "resolved",
    createdAt: "2026-09-18T09:00:00.000Z",
    updatedAt: "2026-09-19T15:00:00.000Z",
    responses: [
      {
        id: "tr-006",
        body: "IT Helpdesk: Scheduled hands-on session for Friday 2:00 PM at Barangay Session Hall. Provided Lupon staff with laminated KP process quick-reference guide.",
        createdAt: "2026-09-18T10:30:00.000Z",
      },
      {
        id: "tr-007",
        body: "IT Support: Training completed successfully with 4 Lupon clerks in attendance. Verified sample test case draft for KP Form 7 and Form 11.",
        createdAt: "2026-09-19T15:00:00.000Z",
      },
    ],
  },
  {
    id: "tkt-008",
    barangayId: STATIC_BARANGAY_ID,
    subject: "UPS Battery replacement warning on Server Rack APC 1500VA",
    body: "The backup UPS powering the local network switch, NAS backup storage, and firewall in the IT comms closet is beeping at 15-minute intervals. Self-test indicates battery replacement required before upcoming rainy season.",
    category: "other",
    priority: "normal",
    status: "open",
    createdAt: "2026-09-19T16:00:00.000Z",
    updatedAt: "2026-09-19T16:00:00.000Z",
    responses: [],
  },
  {
    id: "tkt-009",
    barangayId: STATIC_BARANGAY_ID,
    subject: "Emergency dispatch tablet Wi-Fi disconnect during Tanod night mobile patrol",
    body: "Mobile Patrol Tablet Unit 2 loses connectivity when transitioning from Barangay Hall mesh Wi-Fi to cellular APN around Purok 5 boundary. Tanod officers unable to receive real-time SOS beacons until app restarted.",
    category: "technical",
    priority: "urgent",
    status: "in_progress",
    createdAt: "2026-09-21T06:30:00.000Z",
    updatedAt: "2026-09-21T07:15:00.000Z",
    responses: [
      {
        id: "tr-008",
        body: "IT Support: Updated APN roaming profile and configured background persistent heartbeat service on Tablet Unit 2. Field drive test underway along Purok 5 perimeter.",
        createdAt: "2026-09-21T07:15:00.000Z",
      },
    ],
  },
  {
    id: "tkt-010",
    barangayId: STATIC_BARANGAY_ID,
    subject: "Role assignment request: BDRRMC Incident Commander access for Kagawad B. Bautista",
    body: "Pursuant to Barangay Council Executive Order No. 04-2026, Kagawad Bernardo Bautista has assumed the role of BDRRMC Committee Chair. Requires role escalation from standard staff to BDRRMC_OFFICER for flood monitoring dashboard.",
    category: "access",
    priority: "normal",
    status: "closed",
    createdAt: "2026-09-16T10:15:00.000Z",
    updatedAt: "2026-09-16T11:00:00.000Z",
    responses: [
      {
        id: "tr-009",
        body: "IT Officer: Validated executive order documentation. Role upgraded to BDRRMC_OFFICER and bound to registered mobile device for 2FA security compliance.",
        createdAt: "2026-09-16T11:00:00.000Z",
      },
    ],
  },
  {
    id: "tkt-011",
    barangayId: STATIC_BARANGAY_ID,
    subject: "Guidance on automated DILG Quarterly Performance Report CSV export",
    body: "Barangay Secretary requested assistance on validating automated CSV fields against DILG Memorandum Circular 2025-104 requirements for the upcoming Q3 submission.",
    category: "training",
    priority: "low",
    status: "resolved",
    createdAt: "2026-09-15T14:00:00.000Z",
    updatedAt: "2026-09-15T15:30:00.000Z",
    responses: [
      {
        id: "tr-010",
        body: "IT Officer: Walked through the reports module with Secretary Bautista. Exported preliminary Q3 CSV dataset and verified 100% field compliance against DILG schema validator.",
        createdAt: "2026-09-15T15:30:00.000Z",
      },
    ],
  },
  {
    id: "tkt-012",
    barangayId: STATIC_BARANGAY_ID,
    subject: "HDMI active extender display signal drop in Barangay Session Hall",
    body: "Projector feed drops out intermittently when connecting presentation laptops on lectern HDMI port during council sessions.",
    category: "technical",
    priority: "low",
    status: "closed",
    createdAt: "2026-09-14T08:30:00.000Z",
    updatedAt: "2026-09-14T11:10:00.000Z",
    responses: [
      {
        id: "tr-011",
        body: "IT Support: Replaced damaged passive HDMI cable with shielded CAT6 active balun kit. Confirmed stable 1080p 60Hz video playback throughout 3-hour legislative session.",
        createdAt: "2026-09-14T11:10:00.000Z",
      },
    ],
  },
];
