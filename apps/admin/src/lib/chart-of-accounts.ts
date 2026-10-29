/**
 * COA Uniform Accounts Code Structure (UACS) & Chart of Accounts
 * Standardized mapping for Philippine Barangay Financial Administration (COA Circ. 2015-011).
 */

export interface CoaAccount {
  code: string;
  name: string;
  category: "Revenue" | "Expense" | "Asset" | "Equity";
  direction: "credit" | "debit";
  defaultFund?: "general" | "development" | "bdrrmf" | "sk" | "gad";
}

export const COA_ACCOUNTS: CoaAccount[] = [
  // --- Revenue & Inflows (Credit) ---
  {
    code: "4-02-01-040",
    name: "Clearance and Certification Fees",
    category: "Revenue",
    direction: "credit",
    defaultFund: "general",
  },
  {
    code: "4-01-01-010",
    name: "National Tax Allotment (NTA / IRA Allotment)",
    category: "Revenue",
    direction: "credit",
    defaultFund: "general",
  },
  {
    code: "4-01-02-040",
    name: "Real Property Tax (RPT Barangay Share)",
    category: "Revenue",
    direction: "credit",
    defaultFund: "general",
  },
  {
    code: "4-02-01-010",
    name: "Business Clearance & Permit Fees",
    category: "Revenue",
    direction: "credit",
    defaultFund: "general",
  },
  {
    code: "4-02-02-010",
    name: "Rental of Barangay Properties & Facilities",
    category: "Revenue",
    direction: "credit",
    defaultFund: "general",
  },
  {
    code: "4-04-01-010",
    name: "City / Municipal Subsidies & Financial Aid",
    category: "Revenue",
    direction: "credit",
    defaultFund: "general",
  },
  {
    code: "4-06-01-010",
    name: "Grants, Solicitations & Cash Donations",
    category: "Revenue",
    direction: "credit",
    defaultFund: "general",
  },

  // --- Expenses & Outflows (Debit) ---
  {
    code: "5-01-01-010",
    name: "Honoraria & Allowances (Barangay Officials)",
    category: "Expense",
    direction: "debit",
    defaultFund: "general",
  },
  {
    code: "5-02-99-070",
    name: "Barangay Tanod, BHERT & Lupon Honoraria",
    category: "Expense",
    direction: "debit",
    defaultFund: "general",
  },
  {
    code: "5-02-03-010",
    name: "Office Supplies & Administrative Consumables",
    category: "Expense",
    direction: "debit",
    defaultFund: "general",
  },
  {
    code: "5-02-04-020",
    name: "Electricity & Streetlighting Utility Bills",
    category: "Expense",
    direction: "debit",
    defaultFund: "general",
  },
  {
    code: "5-02-04-010",
    name: "Water Services & Pumping Utilities",
    category: "Expense",
    direction: "debit",
    defaultFund: "general",
  },
  {
    code: "5-02-03-990",
    name: "Disaster Preparedness & Relief Supplies (5% BDRRMF)",
    category: "Expense",
    direction: "debit",
    defaultFund: "bdrrmf",
  },
  {
    code: "5-06-04-010",
    name: "Barangay Infrastructure & Public Works (20% BDF)",
    category: "Expense",
    direction: "debit",
    defaultFund: "development",
  },
  {
    code: "5-02-99-990",
    name: "Sangguniang Kabataan Youth & Sports (10% SK)",
    category: "Expense",
    direction: "debit",
    defaultFund: "sk",
  },
  {
    code: "5-02-99-080",
    name: "Gender & Development Programs (5% GAD)",
    category: "Expense",
    direction: "debit",
    defaultFund: "gad",
  },
  {
    code: "5-02-13-040",
    name: "Repairs & Maintenance of Barangay Hall & Assets",
    category: "Expense",
    direction: "debit",
    defaultFund: "general",
  },
  {
    code: "5-02-03-080",
    name: "Health Center Medical & First-Aid Supplies",
    category: "Expense",
    direction: "debit",
    defaultFund: "general",
  },
];

const COA_MAP: Record<string, CoaAccount> = COA_ACCOUNTS.reduce((acc, curr) => {
  acc[curr.code] = curr;
  return acc;
}, {} as Record<string, CoaAccount>);

/**
 * Returns human-readable account title for any COA code, or a fallback.
 */
export function getAccountTitle(code?: string | null, fallback?: string): string {
  if (!code) return fallback || "General Financial Transaction";
  return COA_MAP[code]?.name || fallback || code;
}

/**
 * Returns the short account category (e.g. Revenue, Expense).
 */
export function getAccountCategory(code?: string | null): string {
  if (!code) return "General";
  return COA_MAP[code]?.category || "General";
}
