import { downloadCsv, downloadText } from "./download";

export interface ReportSample {
  id: string;
  title: string;
  category: "ALL" | "BIPS" | "BDP" | "KP" | "GAD" | "CSM" | "OFFICIALS";
  format: "CSV" | "JSON";
  filename: string;
  description: string;
  complianceTag: string;
  recordCount: number;
  headers: string[];
  rows: Array<Array<string | number | boolean | null | undefined>>;
}

export const REPORT_SAMPLES: ReportSample[] = [
  {
    id: "sample-bips-a1",
    title: "BIPS Form A1: Household Profile Registry",
    category: "BIPS",
    format: "CSV",
    filename: "dilg_bips_form_a1_households_sample.csv",
    description: "Sample household intake records including family structure, tenure status, address, head of household, and monthly income bracket.",
    complianceTag: "DILG MC 2025-104 (Form A1)",
    recordCount: 6,
    headers: [
      "Household_No",
      "Household_Type",
      "Tenure_Status",
      "Household_Unit",
      "Purok_Sitio",
      "Complete_Address",
      "Head_Last_Name",
      "Head_First_Name",
      "Head_Middle_Name",
      "Monthly_Income_PHP",
      "Total_Members",
      "Migrants_Count",
      "Has_Sanitary_Toilet",
      "Water_Source_Level",
    ],
    rows: [
      ["HH-2026-00101", "Nuclear Family", "Owner", "Single House", "Purok 1", "124 Acacia St., Barangka", "Santos", "Danilo", "Cruz", 45000, 5, 0, true, "Level 3"],
      ["HH-2026-00102", "Extended Family", "Owner", "Single House", "Purok 2", "45 Rosal St., Barangka", "Reyes", "Maria Elena", "Garcia", 62000, 8, 1, true, "Level 3"],
      ["HH-2026-00103", "Single Parent Family", "Renter", "Apartment", "Purok 3", "88 Riverside Ave., Barangka", "Dela Cruz", "Rowena", "Bautista", 24000, 3, 0, true, "Level 2"],
      ["HH-2026-00104", "Nuclear Family", "Owner", "Townhouse", "Purok 4", "12 Sampaguita St., Barangka", "Mendoza", "Arthur", "Villanueva", 75000, 4, 0, true, "Level 3"],
      ["HH-2026-00105", "Non-related Family", "Renter", "Condominium", "Purok 1", "302 Barangka Tower 1", "Aquino", "Kenneth", "Lim", 55000, 3, 2, true, "Level 3"],
      ["HH-2026-00106", "Childless Family", "Owner", "Duplex", "Purok 5", "67 Bougainvillea Lane", "Torres", "Manuel", "Soriano", 38000, 2, 0, true, "Level 2"],
    ],
  },
  {
    id: "sample-bips-a2",
    title: "BIPS Form A2: Individual Inhabitants Profile",
    category: "BIPS",
    format: "CSV",
    filename: "dilg_bips_form_a2_inhabitants_sample.csv",
    description: "Granular individual demographic records including PhilSys PCN, civil status, educational attainment, occupation, and sectoral classifications.",
    complianceTag: "DILG MC 2025-104 (Form A2)",
    recordCount: 8,
    headers: [
      "PhilSys_PCN",
      "Last_Name",
      "First_Name",
      "Middle_Name",
      "Suffix",
      "Sex",
      "Gender",
      "Birth_Date",
      "Age",
      "Civil_Status",
      "Resident_Type",
      "Education_Level",
      "Occupation",
      "Contact_Phone",
      "Purok",
      "Sector_4Ps",
      "Sector_PWD",
      "Sector_Senior",
      "Sector_SoloParent",
      "Registered_Voter",
    ],
    rows: [
      ["1234-5678-9101-1213", "Santos", "Danilo", "Cruz", "Jr.", "Male", "Male", "1982-05-14", 43, "Married", "Non-migrant", "College Graduate", "Civil Engineer", "09171234567", "Purok 1", false, false, false, false, true],
      ["2345-6789-0123-4567", "Santos", "Corazon", "Pineda", "", "Female", "Female", "1985-09-20", 40, "Married", "Non-migrant", "College Graduate", "Public School Teacher", "09182345678", "Purok 1", false, false, false, false, true],
      ["3456-7890-1234-5678", "Reyes", "Maria Elena", "Garcia", "", "Female", "Female", "1958-11-03", 67, "Widowed", "Non-migrant", "High School Graduate", "Retired Merchant", "09193456789", "Purok 2", true, false, true, false, true],
      ["4567-8901-2345-6789", "Dela Cruz", "Rowena", "Bautista", "", "Female", "Female", "1990-03-12", 36, "Single/Never Married", "Non-migrant", "Vocational/Tech", "Online Baker", "09204567890", "Purok 3", true, false, false, true, true],
      ["5678-9012-3456-7890", "Mendoza", "Arthur", "Villanueva", "", "Male", "Male", "1978-07-25", 47, "Married", "Non-migrant", "College Graduate", "Accountant", "09215678901", "Purok 4", false, false, false, false, true],
      ["6789-0123-4567-8901", "Aquino", "Kenneth", "Lim", "", "Male", "Male", "1998-12-08", 27, "Single/Never Married", "Migrant", "College Graduate", "Software Developer", "09226789012", "Purok 1", false, false, false, false, true],
      ["7890-1234-5678-9012", "Torres", "Manuel", "Soriano", "", "Male", "Male", "1960-04-18", 65, "Married", "Non-migrant", "High School Graduate", "Barangay Tanod", "09237890123", "Purok 5", false, true, true, false, true],
      ["8901-2345-6789-0123", "Bautista", "Angelica", "Santos", "", "Female", "Female", "2006-08-30", 19, "Single/Never Married", "Non-migrant", "Senior HS Graduate", "College Student", "09248901234", "Purok 3", false, false, false, false, true],
    ],
  },
  {
    id: "sample-bdp-aip",
    title: "BDP & AIP: Programs, Projects & Activities Matrix",
    category: "BDP",
    format: "CSV",
    filename: "bdp_aip_project_investment_matrix_sample.csv",
    description: "Barangay Development Plan (BDP 2026–2028) & Annual Investment Program (AIP) appropriations, funding sources, and physical accomplishment status.",
    complianceTag: "DILG BDP Form 1 / MC 2025-104",
    recordCount: 9,
    headers: [
      "Project_Code",
      "Plan_Period",
      "Project_Title",
      "Development_Sector",
      "Budget_Appropriation_PHP",
      "Funding_Source",
      "Target_Year",
      "Physical_Accomplishment_Pct",
      "Project_Status",
      "Is_Locked_Finalized",
    ],
    rows: [
      ["PROJ-2026-001", "BDP 2026–2028", "Solar-Powered Streetlighting & Smart CCTV Grid (Phase 2)", "Infrastructure", 1250000, "NTA (National Tax Allotment)", 2026, 75, "Ongoing", false],
      ["PROJ-2026-002", "BDP 2026–2028", "Purok 3 Riverbank Drainage Outfall & Slope Protection", "Infrastructure", 850000, "LGU Counterpart", 2026, 45, "Ongoing", false],
      ["PROJ-2026-003", "BDP 2026–2028", "Multi-Purpose Evacuation Hall Roof Solarization & Retrofit", "Infrastructure", 2100000, "National Government Grant", 2027, 10, "Proposed", false],
      ["PROJ-2026-004", "BDP 2026–2028", "BHW Mobile Telehealth Tablet Kit & Diagnostic Backpacks", "Health", 320000, "NTA (National Tax Allotment)", 2026, 100, "Completed", true],
      ["PROJ-2026-005", "BDP 2026–2028", "First 1,000 Days Maternal & Infant Nutrition Supplementary Program", "Health", 450000, "Grant", 2026, 60, "Ongoing", false],
      ["PROJ-2026-006", "BDP 2026–2028", "Community Hydroponics & Urban Rooftop Farming Livelihood Hub", "Livelihood", 600000, "Trust Fund", 2026, 35, "Ongoing", false],
      ["PROJ-2026-007", "BDP 2026–2028", "Digital Freelancing & IT Skill Training for Out-of-School Youth (OSY)", "Education", 280000, "LGU Counterpart", 2026, 90, "Ongoing", false],
      ["PROJ-2026-008", "BDP 2026–2028", "Barangay Materials Recovery Facility (MRF) Upgrades & Composting Unit", "Environment", 540000, "NTA (National Tax Allotment)", 2026, 100, "Completed", true],
      ["PROJ-2026-009", "BDP 2026–2028", "Integrated Peace & Order Patrol Bike Fleet & Tanod Radio Network", "Peace & Order", 390000, "NTA (National Tax Allotment)", 2026, 80, "Ongoing", false],
    ],
  },
  {
    id: "sample-kp-cases",
    title: "Katarungang Pambarangay: Quarterly Caseload & Settlement Summary",
    category: "KP",
    format: "CSV",
    filename: "kp_quarterly_caseload_report_sample.csv",
    description: "Lupon Tagapamayapa case filings, nature of dispute, mediation stages, and amicable settlement dispositions.",
    complianceTag: "DILG KPISBH Forms C1–C3",
    recordCount: 5,
    headers: [
      "KP_Case_No",
      "Date_Filed",
      "Nature_of_Dispute",
      "Complainant",
      "Respondent",
      "Proceedings_Stage",
      "Disposition_Status",
      "Date_Settled",
      "Certificate_to_Bar_Action_Issued",
    ],
    rows: [
      ["KP-2026-042", "2026-08-05", "Boundary and Property Easement Dispute", "Renato Velasquez", "Eduardo Morales", "Mediation (Punong Barangay)", "Amicably Settled", "2026-08-12", "No"],
      ["KP-2026-043", "2026-08-11", "Collection of Sum of Money (Small Claims)", "Luzviminda Ocampo", "Teresa Alcantara", "Conciliation (Pangkat)", "Amicably Settled", "2026-08-20", "No"],
      ["KP-2026-044", "2026-08-18", "Unjust Vexation & Neighborhood Noise Disturbance", "Ferdinand Roxas", "Crispin Navarro", "Mediation (Punong Barangay)", "Repudiated / Ongoing Conciliation", "", "No"],
      ["KP-2026-045", "2026-08-25", "Slight Physical Injuries resulting from Altercation", "Jaime Dizon", "Ronald Ramos", "Conciliation (Pangkat)", "Repudiated / Failed Settlement", "2026-09-02", "Yes (Issued Certificate to File Action)"],
      ["KP-2026-046", "2026-09-01", "Tenant-Landlord Rental Payment Default", "Clarita Bernardo", "Joselito David", "Mediation (Punong Barangay)", "Ongoing Mediation", "", "No"],
    ],
  },
  {
    id: "sample-gad-plan",
    title: "GAD Plan & Budget Accomplishment (BGADPBMS)",
    category: "GAD",
    format: "CSV",
    filename: "gad_annual_plan_and_accomplishment_sample.csv",
    description: "Gender and Development (GAD) 5% statutory budget attribution, HGDG gender-responsiveness ratings, and accomplishment outputs.",
    complianceTag: "DILG BGADPBMS Forms G1–G2",
    recordCount: 5,
    headers: [
      "Year",
      "GAD_PPA_Title",
      "Target_Gender_Issue_or_Mandate",
      "HGDG_Design_Score",
      "Approved_GAD_Budget_PHP",
      "Actual_Expenditure_PHP",
      "Physical_Target_Output",
      "Actual_Accomplishment",
      "Responsible_Person",
      "Status",
    ],
    rows: [
      [2026, "VAWC Desk Strengthening & Trauma-Informed Counseling Training", "Lack of specialized crisis response protocols for VAWC survivors", "18.5 (Gender-Responsive)", 180000, 175000, "100% of VAW desk volunteers trained", "15 volunteers and desk officers certified", "VAW Desk Officer", "Completed"],
      [2026, "Maternal & Child Health Care Supplementation & Nutrition Education", "High incidence of moderate underweight infants in Purok 3 & 5", "16.0 (Gender-Responsive)", 350000, 290000, "250 pregnant & lactating mothers reached", "265 mothers graduated from nutrition course", "Barangay Health Worker Head", "Ongoing"],
      [2026, "Livelihood & Digital Literacy Bootcamp for Solo Mothers", "Underemployment among female single heads of households", "17.0 (Gender-Responsive)", 220000, 215000, "50 solo mothers trained in e-commerce", "52 solo mothers certified and launched online stores", "Social Welfare Officer", "Completed"],
      [2026, "Safe Spaces Act (Bawal Bastos) Community Information Drive", "Sexual harassment prevalence in public thoroughfares and public transport", "14.5 (Promising GAD)", 120000, 85000, "4 purok-wide advocacy sessions & signage", "3 sessions conducted; 12 signboards mounted", "Barangay Tanod Head", "Ongoing"],
      [2026, "Breast & Cervical Cancer Screening & Diagnostics Day", "Low early detection rates for reproductive health among women", "19.0 (Gender-Responsive)", 200000, 198000, "300 women screened via mobile diagnostic clinic", "312 women screened with immediate doctor referrals", "BHW Nutrition Scholar", "Completed"],
    ],
  },
  {
    id: "sample-csm-feedback",
    title: "Client Satisfaction Measurement (CSM - RA 11032)",
    category: "CSM",
    format: "CSV",
    filename: "csm_citizen_satisfaction_raw_feedback_sample.csv",
    description: "Citizen feedback and service ratings compliant with ARTA / RA 11032 Ease of Doing Business quarterly reporting guidelines.",
    complianceTag: "RA 11032 / ARTA Guidelines",
    recordCount: 6,
    headers: [
      "Response_ID",
      "Date_Logged",
      "Frontline_Service",
      "Rating_Stars",
      "Satisfaction_Status",
      "Turnaround_Time_Minutes",
      "Courtesy_Score",
      "Efficiency_Score",
      "Facility_Cleanliness_Score",
      "Citizen_Remarks",
      "Grievance_Flagged",
    ],
    rows: [
      ["CSM-2026-0891", "2026-09-08 09:14", "Barangay Clearance", 5, "Very Satisfied", 8, 5, 5, 5, "Mabilis at napakabait ng nag-asikaso.", false],
      ["CSM-2026-0892", "2026-09-08 10:30", "Certificate of Indigency", 5, "Very Satisfied", 12, 5, 5, 4, "Convenient online verification.", false],
      ["CSM-2026-0893", "2026-09-08 11:45", "Business Clearance", 4, "Satisfied", 15, 4, 4, 4, "Smooth process, cashier line moved well.", false],
      ["CSM-2026-0894", "2026-09-09 14:10", "First Time Jobseeker Certificate", 5, "Very Satisfied", 10, 5, 5, 5, "No fee charged pursuant to RA 11261. Great help!", false],
      ["CSM-2026-0895", "2026-09-09 15:25", "Incident Blotter Record", 3, "Neutral", 28, 3, 3, 4, "Took a bit long due to shift change.", false],
      ["CSM-2026-0896", "2026-09-10 11:05", "Barangay ID Issuance", 5, "Very Satisfied", 7, 5, 5, 5, "Digital photo capture was very prompt.", false],
    ],
  },
  {
    id: "sample-bips-a4",
    title: "BIPS Form A4: Barangay Officials & Functionaries Roster",
    category: "OFFICIALS",
    format: "CSV",
    filename: "dilg_bips_form_a4_officials_sample.csv",
    description: "Elected barangay officials and appointed functionaries roster with position classifications, terms of office, and committee assignments.",
    complianceTag: "DILG MC 2025-104 (Form A4)",
    recordCount: 8,
    headers: [
      "Official_Name",
      "Position_Title",
      "Position_Type",
      "Term_Period",
      "Committee_Chairmanship",
      "Monthly_Honorarium_PHP",
      "Official_Status",
      "Contact_Email",
    ],
    rows: [
      ["Hon. Roberto S. Tan", "Punong Barangay", "Elective", "2023–2025", "Executive & BDC Chair", 35000, "Active", "captain@barangka.gov.ph"],
      ["Hon. Carmela G. Ramos", "Sangguniang Barangay Member (Kagawad)", "Elective", "2023–2025", "Committee on Finance & Appropriations", 24000, "Active", "carmela.ramos@barangka.gov.ph"],
      ["Hon. Jonathan D. Cruz", "Sangguniang Barangay Member (Kagawad)", "Elective", "2023–2025", "Committee on Peace and Order / BPOC", 24000, "Active", "jonathan.cruz@barangka.gov.ph"],
      ["Hon. Leah M. Bautista", "Sangguniang Barangay Member (Kagawad)", "Elective", "2023–2025", "Committee on Health, Sanitation & GAD", 24000, "Active", "leah.bautista@barangka.gov.ph"],
      ["Hon. Marco E. Villanueva", "SK Chairperson", "Elective", "2023–2025", "Committee on Youth & Sports Development", 24000, "Active", "sk@barangka.gov.ph"],
      ["Ms. Teresa N. Alcantara", "Barangay Secretary", "Appointive", "2023–2025", "Secretariat & Records Custodian", 18500, "Active", "secretary@barangka.gov.ph"],
      ["Mr. Ricardo F. Gomez", "Barangay Treasurer", "Appointive", "2023–2025", "Treasury & Disbursement Officer", 18500, "Active", "treasurer@barangka.gov.ph"],
      ["Mrs. Clarita V. Santos", "VAW Desk Officer", "Appointive", "2023–2025", "Violence Against Women Helpdesk", 12000, "Active", "vaw@barangka.gov.ph"],
    ],
  },
];

export function downloadSampleReport(sample: ReportSample) {
  downloadCsv(sample.filename, sample.headers, sample.rows);
}

export function downloadSampleJson(sample: ReportSample) {
  const jsonObjects = sample.rows.map((row) => {
    const obj: Record<string, any> = {};
    sample.headers.forEach((header, idx) => {
      obj[header] = row[idx];
    });
    return obj;
  });
  const jsonString = JSON.stringify(
    {
      reportTitle: sample.title,
      complianceStandard: sample.complianceTag,
      generatedAt: new Date().toISOString(),
      recordCount: sample.recordCount,
      data: jsonObjects,
    },
    null,
    2
  );

  const jsonFilename = sample.filename.replace(/\.csv$/, ".json");
  downloadText(jsonString, jsonFilename, "application/json;charset=utf-8;");
}
