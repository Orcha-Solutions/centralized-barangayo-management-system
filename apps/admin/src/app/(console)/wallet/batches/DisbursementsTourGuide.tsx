"use client";

import * as React from "react";
import { TourGuideOverlay, GuideToggle, TourStep } from "../../../../components/TourGuide";

export const DISBURSEMENTS_TOUR_STEPS: TourStep[] = [
  {
    id: "disbursements-overview",
    targetId: "tour-disbursements-stats",
    title: "Barangay Disbursements & Payout Batches",
    badge: "Step 1 of 5 · Payout Metrics",
    roleIcon: "💸",
    description:
      "Welcome to the Barangay Disbursements module. Designed for secure, audit-compliant municipal and barangay fiscal operations, this module governs electronic payroll, honoraria, and financial assistance payouts.",
    capabilities: [
      "Live counters: Total Batches, Batches For Approval, and Completed Payouts",
      "Cumulative Value Disbursed tracking across all completed disbursement runs",
      "Direct alignment with Commission on Audit (COA) Circular 2012-001 disbursement standards",
    ],
    tip: "Batches in 'For Approval' require executive review by the Punong Barangay before funds release.",
  },
  {
    id: "disbursements-toolbar",
    targetId: "tour-disbursements-toolbar",
    title: "Statutory Fund & Lifecycle Filtering",
    badge: "Step 2 of 5 · Filter & Status",
    roleIcon: "🔍",
    description:
      "Segregate disbursements by funding source and workflow status to maintain strict fiscal compliance.",
    capabilities: [
      "Status tracking: Draft, For Approval, Approved, Executing, Completed, and Cancelled",
      "Statutory Fund segregation: General Fund, SK Fund, GAD Fund, Disaster/LDRRM, and Trust Funds",
      "Instant search by batch number, title/purpose, or payroll kind",
    ],
    tip: "Filter by statutory fund to reconcile with your annual barangay appropriation budget.",
  },
  {
    id: "disbursements-prepare-btn",
    targetId: "tour-disbursements-prepare-btn",
    title: "Data Encoding: Prepare Payout Batch",
    badge: "Step 3 of 5 · Batch Preparation",
    roleIcon: "✍️",
    description:
      "Authorized budget and treasury staff click '+ Prepare batch' to compose a new disbursement payroll or financial assistance roster.",
    capabilities: [
      "Select registered beneficiaries from the Inhabitant registry or council roster",
      "Supports hybrid payout channels: direct e-wallet credit or over-the-counter cash release",
      "Automatic computation of total payout value in centavos",
    ],
    tip: "Whoever prepares a batch cannot approve it under mandatory maker-checker internal controls.",
  },
  {
    id: "disbursements-table",
    targetId: "tour-disbursements-table",
    title: "Data Reading: Payout Docket & Maker-Checker Audit",
    badge: "Step 4 of 5 · Batch Register",
    roleIcon: "📋",
    description:
      "Review all disbursement batches with their funding allocation, payout channels, item count, and maker-checker status.",
    capabilities: [
      "Clear status indicators showing current workflow and authorization stage",
      "Summary tags for disbursement channel (E-Wallet vs Over-the-counter)",
      "Click any batch row to inspect the itemized recipient roster and audit trail",
    ],
    tip: "Click any batch row to view its itemized payee list and approval controls.",
  },
  {
    id: "disbursements-drawer",
    targetId: "tour-disbursements-drawer",
    title: "Executive Approval, DV Issuance & Payout Execution",
    badge: "Step 5 of 5 · Approval & Execution",
    roleIcon: "🏛️",
    description:
      "The Punong Barangay reviews the batch details, individual payee allocations, and funding sources before authorizing payment.",
    capabilities: [
      "Maker-Checker compliance: Preparer cannot approve; only authorized approvers can release funds",
      "Automatic Disbursement Voucher (DV) generation upon approval",
      "Real-time wallet settlement with automatic over-the-counter fallback queue for unbanked beneficiaries",
    ],
    tip: "You can toggle this guide ON or OFF anytime using the Guide button in the bottom-right corner.",
    actionText: "👉 View Sample Batch",
    actionId: "select-sample-batch",
  },
];

export interface DisbursementsTourGuideProps {
  enabled: boolean;
  onToggle: (next: boolean) => void;
  onSelectSampleBatch?: () => void;
  onCloseBatchDrawer?: () => void;
  isBatchDrawerOpen?: boolean;
}

export function DisbursementsTourGuide({
  enabled,
  onToggle,
  onSelectSampleBatch,
  onCloseBatchDrawer,
  isBatchDrawerOpen,
}: DisbursementsTourGuideProps) {
  const handleAction = (actionId?: string) => {
    if (actionId === "select-sample-batch" && onSelectSampleBatch) {
      onSelectSampleBatch();
    }
  };

  const handleStepChange = (index: number, step: TourStep) => {
    if (step.id === "disbursements-drawer") {
      if (onSelectSampleBatch) onSelectSampleBatch();
    } else {
      if (onCloseBatchDrawer) onCloseBatchDrawer();
    }
  };

  return (
    <TourGuideOverlay
      steps={DISBURSEMENTS_TOUR_STEPS}
      enabled={enabled}
      onToggle={onToggle}
      onStepChange={handleStepChange}
      onAction={handleAction}
      isActionActive={isBatchDrawerOpen}
    />
  );
}

export { GuideToggle as DisbursementsGuideToggle };
