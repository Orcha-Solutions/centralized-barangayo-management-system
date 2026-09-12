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

