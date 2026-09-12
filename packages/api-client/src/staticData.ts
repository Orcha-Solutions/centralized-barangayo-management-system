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

