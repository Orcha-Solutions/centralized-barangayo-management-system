"use client";

import * as React from "react";
import { TourGuideOverlay, GuideToggle, TourStep } from "../../../components/TourGuide";

export const RPT_TOUR_STEPS: TourStep[] = [
  {
    id: "rpt-overview",
    targetId: "tour-rpt-stats",
    title: "Real Property Tax Assessment Roll (LGC Title II)",
    badge: "Step 1 of 6 · Assessment Metrics",
    roleIcon: "🏡",
    description:
      "Welcome to the Barangay Real Property Tax (RPT) module. Aligned with Title II of the Local Government Code of 1991 (RA 7160) and the Barangay Assessment Management System (BAMS), this module manages property valuation records, annual tax dues, and collection compliance.",
    capabilities: [
      "Live registry counts: Declared Properties, Total Assessed Valuation, and Fair Market Value",
      "Fiscal year tax collection tracking: Fully Paid properties vs. Delinquent accounts requiring notices",
      "Special Education Fund (SEF) and Basic RPT revenue share monitoring",
    ],
    tip: "Regularly review the Delinquent Dues indicator to schedule barangay treasurer demand notices.",
  },
  {
    id: "rpt-toolbar",
    targetId: "tour-rpt-toolbar",
    title: "Classification & Tax Status Filters",
    badge: "Step 2 of 6 · Filtering & Search",
    roleIcon: "🔍",
    description:
      "Quickly filter properties across statutory land classifications and collection stages to reconcile local tax rolls.",
    capabilities: [
      "Classifications: Residential, Commercial, Industrial, Agricultural, and Special properties",
      "Collection statuses: Fully Paid, Unpaid / Delinquent, and Tax-Exempt parcels",
      "Instant query search across Tax Declaration Numbers (TDN), owner names, and purok addresses",
    ],
    tip: "Select 'Unpaid / Delinquent' to generate targeted billing lists for your purok leaders.",
  },
  {
    id: "rpt-declare-btn",
    targetId: "tour-rpt-declare-btn",
    title: "Data Encoding: Declare Real Property",
    badge: "Step 3 of 6 · Property Declaration",
    roleIcon: "✍️",
    description:
      "Click '+ Declare Property' to register a new real estate parcel and assessment record under the municipal assessor's tax declaration.",
    capabilities: [
      "Fast slide-over declaration form with instant assessment computation",
      "Direct linking to the resident inhabitant registry for automated owner profiling",
    ],
    tip: "Click '👉 Open Declaration Form' below or the button at top to inspect the required assessment fields.",
    actionText: "👉 Open Declaration Form",
    actionId: "open-declare-drawer",
  },
  {
    id: "rpt-declare-drawer",
    targetId: "tour-rpt-declare-drawer",
    title: "Assessment Form: Valuation & Assessment Levels",
    badge: "Step 4 of 6 · Tax Declaration Form",
    roleIcon: "📋",
    description:
      "Encode property parcel details with automated statutory assessment level multipliers.",
    capabilities: [
      "Official Tax Declaration Number (TDN), Lot No., Block No., and Purok location",
      "Statutory Assessment Levels: 20% Residential, 50% Commercial/Industrial, 40% Agricultural, 10% Special",
      "Automatic Assessed Value computation from entered Fair Market Value (FMV)",
      "Automatic 2026 Tax Due calculation (1% Basic RPT + 1% Special Education Fund SEF)",
    ],
    tip: "Entering the Market Value automatically calculates the Assessed Value based on statutory assessment rates.",
  },
  {
    id: "rpt-table",
    targetId: "tour-rpt-table",
    title: "Data Reading: Assessment Roll & Tax Ledger",
    badge: "Step 5 of 6 · Assessment Registry",
    roleIcon: "📑",
    description:
      "Browse all registered properties with their corresponding TDNs, owners, classifications, and assessed valuations.",
    capabilities: [
      "Summary cards displaying assessed values and current year payment status chips",
      "Immediate visibility over delinquent vs paid parcels",
      "Click any property row to inspect full tax dues, payment history, and collection tools",
    ],
    tip: "Click any property row in the table to open its detailed tax dues and collection drawer.",
  },
  {
    id: "rpt-details-drawer",
    targetId: "tour-rpt-details-drawer",
    title: "Tax Dues Collection & Official Receipt (OR) Posting",
    badge: "Step 6 of 6 · Revenue Collection",
    roleIcon: "🧾",
    description:
      "Collect RPT payments directly from the property drawer. Cash and e-wallet payments automatically issue an Official Receipt (OR) and post to the General Ledger.",
    capabilities: [
      "Itemized breakdown: Basic Tax (1%), SEF (1%), and prompt payment discounts or late penalties",
      "Payment collection via Cash, Check, or Barangay E-Wallet",
      "Automatic Official Receipt (OR) issuance and automated credit to the Barangay Treasury books",
    ],
    tip: "You can toggle this guide ON or OFF anytime using the Guide button in the bottom-right corner.",
    actionText: "👉 View Sample Property",
    actionId: "select-sample-property",
  },
];

export interface RptTourGuideProps {
  enabled: boolean;
  onToggle: (next: boolean) => void;
  onOpenDeclareDrawer?: () => void;
  onCloseDeclareDrawer?: () => void;
  isDeclareDrawerOpen?: boolean;
  onSelectSampleProperty?: () => void;
  onClosePropertyDrawer?: () => void;
  isPropertyDrawerOpen?: boolean;
}

export function RptTourGuide({
  enabled,
  onToggle,
  onOpenDeclareDrawer,
  onCloseDeclareDrawer,
  isDeclareDrawerOpen,
  onSelectSampleProperty,
  onClosePropertyDrawer,
  isPropertyDrawerOpen,
}: RptTourGuideProps) {
  const handleAction = (actionId?: string) => {
    if (actionId === "open-declare-drawer" && onOpenDeclareDrawer) {
      onOpenDeclareDrawer();
    } else if (actionId === "select-sample-property" && onSelectSampleProperty) {
      onSelectSampleProperty();
    }
  };

  const handleStepChange = (index: number, step: TourStep) => {
    if (step.id === "rpt-declare-drawer") {
      if (onClosePropertyDrawer) onClosePropertyDrawer();
      if (onOpenDeclareDrawer) onOpenDeclareDrawer();
    } else if (step.id === "rpt-details-drawer") {
      if (onCloseDeclareDrawer) onCloseDeclareDrawer();
      if (onSelectSampleProperty) onSelectSampleProperty();
    } else {
      if (onCloseDeclareDrawer) onCloseDeclareDrawer();
      if (onClosePropertyDrawer) onClosePropertyDrawer();
    }
  };

  return (
    <TourGuideOverlay
      steps={RPT_TOUR_STEPS}
      enabled={enabled}
      onToggle={onToggle}
      onStepChange={handleStepChange}
      onAction={handleAction}
      isActionActive={isDeclareDrawerOpen || isPropertyDrawerOpen}
    />
  );
}

export { GuideToggle as RptGuideToggle };
