"use client";

import * as React from "react";
import { TourGuideOverlay, GuideToggle, TourStep } from "../../../components/TourGuide";

export const FINANCE_TOUR_STEPS: TourStep[] = [
  {
    id: "finance-overview",
    targetId: "tour-finance-stats",
    title: "Barangay Treasury & Ledger (BFMS Parity)",
    badge: "Step 1 of 7 · Treasury Overview & Balances",
    roleIcon: "💰",
    description:
      "Welcome to the Barangay Treasury & General Ledger module. Compliant with DILG BFMS (Barangay Financial Management System) and Commission on Audit (COA) circulars, this manages double-entry bookkeeping, official receipts, and annual appropriation tracking.",
    capabilities: [
      "Live balances: Credits (Inflows/Collections), Debits (Disbursements/Expenses), and Total Official Receipts",
      "Annual Appropriation monitoring under Local Government Code §314",
      "Segregated tracking across statutory funds (General Fund, 20% BDF, 10% SK, 5% BDRRMF, 5% GAD)",
    ],
    tip: "Keep an eye on the Debits counter to monitor operating expenditure against collection targets.",
  },
  {
    id: "finance-tabs",
    targetId: "tour-finance-tabs",
    title: "Core Financial Pillars & Subsystems",
    badge: "Step 2 of 7 · Navigation Tabs",
    roleIcon: "📑",
    description:
      "Seamlessly switch between the three core pillars of barangay fiscal administration using the navigation tabs:",
    capabilities: [
      "General Ledger: Double-entry accounting records categorized by standard COA Account Codes",
      "Official Receipts: Computerized receipting for barangay clearances, permits, and rentals",
      "Budget & Utilisation: Tracking authorized appropriations, obligations (OBR), and actual cash disbursements",
    ],
    tip: "Clicking a tab updates the active view while retaining your search filters and fiscal period.",
  },
  {
    id: "finance-encoding-btn",
    targetId: "tour-finance-record-btn",
    title: "Data Encoding: Record Journal Entry",
    badge: "Step 3 of 7 · Ledger Encoding",
    roleIcon: "✍️",
    description:
      "Click '+ Record Journal Entry' to post financial transactions directly into the barangay books with immediate debit/credit validation.",
    capabilities: [
      "Fast slide-over drawer without leaving the active ledger sheet",
      "Real-time validation ensuring balanced accounting entries",
    ],
    tip: "Click '👉 Open Journal Entry Drawer' below or the button at top to view the transaction fields.",
    actionText: "👉 Open Journal Entry Drawer",
    actionId: "open-record-drawer",
  },
  {
    id: "finance-record-drawer",
    targetId: "tour-finance-record-drawer",
    title: "Journal Entry Form: COA Accounts & Fund Allocation",
    badge: "Step 4 of 7 · Journal Voucher Form",
    roleIcon: "📝",
    description:
      "Encode transaction entries adhering strictly to the COA New Government Accounting System (NGAS) for Barangays.",
    capabilities: [
      "Statutory Fund selection: General Fund, Development Fund (20%), Disaster Fund (5%), SK Fund (10%), or GAD (5%)",
      "Standardized COA Account Codes (e.g. 4-02-01-040 Clearance Fees, 5-02-03-010 Office Supplies)",
      "Direction toggle (Credit for Collections/Inflows; Debit for Disbursements/Expenses)",
      "Mandatory Reference Voucher Number (Official Receipt OR or Disbursement Voucher DV)",
    ],
    tip: "Always reference the Disbursement Voucher (DV) number when recording checks or payments.",
  },
  {
    id: "finance-reading-table",
    targetId: "tour-finance-table",
    title: "Data Reading: General Ledger & Audit Trail",
    badge: "Step 5 of 7 · Ledger Masterlist",
    roleIcon: "📋",
    description:
      "Inspect posted transactions in real-time. View chronological timestamps, account codes, debit/credit distributions, and reference numbers.",
    capabilities: [
      "Fast search by account code, check voucher, payee, or transaction description",
      "Filter by statutory fund (GF, BDF, BDRRMF, SK, GAD) or flow direction",
      "Click any entry to inspect the full journal voucher dossier and audit trail",
    ],
    tip: "Clicking any ledger row opens its detailed transaction audit card.",
  },
  {
    id: "finance-receipts",
    targetId: "tour-finance-receipt-btn",
    title: "Official Receipts & Revenue Collections",
    badge: "Step 6 of 7 · Revenue Collections",
    roleIcon: "🧾",
    description:
      "Treasury staff can issue computerized Official Receipts (OR) for clearances, CTCs, and rental fees with immediate automated debit/credit ledger posting.",
    capabilities: [
      "Electronic OR sequence tracking preventing missing or duplicate receipts",
      "Automatic journal entry creation upon OR issuance",
      "Anti-fraud voiding and cancellation audit logging",
    ],
    tip: "Switching to the 'Official receipts' tab displays all issued receipts and daily cash collections.",
  },
  {
    id: "finance-export",
    targetId: "tour-finance-export-btn",
    title: "COA Compliance & Ledger CSV Export",
    badge: "Step 7 of 7 · Audit & Compliance",
    roleIcon: "📊",
    description:
      "Export transaction registers in CSV format for City/Municipal Accounting audit submission and DILG SGLGB Financial Administration assessments.",
    capabilities: [
      "One-click CSV download formatted for municipal accounting consolidation",
      "Permanent audit records for the Punong Barangay and Sangguniang Barangay session reviews",
    ],
    tip: "You can toggle this guide ON or OFF anytime using the Guide button in the bottom-right corner.",
  },
];

export interface FinanceTourGuideProps {
  enabled: boolean;
  onToggle: (next: boolean) => void;
  onOpenRecordDrawer?: () => void;
  onCloseRecordDrawer?: () => void;
  isRecordDrawerOpen?: boolean;
  onSelectTab?: (tab: "ledger" | "receipts" | "budget") => void;
}

export function FinanceTourGuide({
  enabled,
  onToggle,
  onOpenRecordDrawer,
  onCloseRecordDrawer,
  isRecordDrawerOpen,
  onSelectTab,
}: FinanceTourGuideProps) {
  const handleAction = (actionId?: string) => {
    if (actionId === "open-record-drawer" && onOpenRecordDrawer) {
      onOpenRecordDrawer();
    }
  };

  const handleStepChange = (index: number, step: TourStep) => {
    if (step.id === "finance-record-drawer") {
      if (onSelectTab) onSelectTab("ledger");
      if (onOpenRecordDrawer) onOpenRecordDrawer();
    } else if (step.id === "finance-receipts") {
      if (onCloseRecordDrawer) onCloseRecordDrawer();
      if (onSelectTab) onSelectTab("receipts");
    } else {
      if (onCloseRecordDrawer) onCloseRecordDrawer();
      if (step.id === "finance-reading-table" || step.id === "finance-export" || step.id === "finance-encoding-btn") {
        if (onSelectTab) onSelectTab("ledger");
      }
    }
  };

  return (
    <TourGuideOverlay
      steps={FINANCE_TOUR_STEPS}
      enabled={enabled}
      onToggle={onToggle}
      onStepChange={handleStepChange}
      onAction={handleAction}
      isActionActive={isRecordDrawerOpen}
    />
  );
}

export { GuideToggle as FinanceGuideToggle };
