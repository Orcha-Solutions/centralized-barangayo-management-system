"use client";

import * as React from "react";
import { TourGuideOverlay, GuideToggle, TourStep } from "../../../components/TourGuide";

export const ASSETS_TOUR_STEPS: TourStep[] = [
  {
    id: "assets-overview",
    targetId: "tour-assets-stats",
    title: "Barangay Asset Inventory (DILG BAMS Parity)",
    badge: "Step 1 of 7 · Asset Directory & Metrics",
    roleIcon: "🏢",
    description:
      "Welcome to the Barangay Assets & Property Inventory. Mirrored after the DILG BAMS (Barangay Assets Management System), this tracks all barangay real and personal property, condition statuses, and named custodians under Local Government Code §375.",
    capabilities: [
      "Real-time counters for Total Assets, Infrastructures, Non-infrastructure Equipment, and Operational items",
      "Compliance with COA Circular No. 2020-006 and LGC §375 accountability requirements",
      "Integrated with Disaster Risk Reduction (DRRM) and evacuation center planning",
    ],
    tip: "Every piece of equipment must carry a named custodian to maintain physical audit accountability.",
  },
  {
    id: "assets-search-filters",
    targetId: "tour-assets-toolbar",
    title: "Search & Governance Pillar Filtering",
    badge: "Step 2 of 7 · Fast Filter & Search",
    roleIcon: "🔍",
    description:
      "Quickly filter government property by type, operational status, or SGLGB Governance Pillar.",
    capabilities: [
      "Filter by Type: Infrastructure (Barangay Hall, Multi-purpose Covered Court, Day Care Center) vs Non-infrastructure (Vehicles, Computers, Generators)",
      "Filter by Status: Operational, Under Repair, Condemned, Borrowed, or Disposed",
      "SGLGB Governance Pillar allocation (Financial Administration, Disaster Preparedness, Health Compliance, Peace & Order)",
    ],
    tip: "Searching by custodian name instantly reveals all government equipment assigned to an official.",
  },
  {
    id: "assets-encoding-btn",
    targetId: "tour-assets-new-btn",
    title: "Data Encoding: Register New Barangay Asset",
    badge: "Step 3 of 7 · Asset Registration",
    roleIcon: "✍️",
    description:
      "To book a newly acquired facility, vehicle, or piece of office/rescue equipment, click '+ New property'. This opens the official BAMS property registration drawer.",
    capabilities: [
      "Fast slide-over drawer without leaving the inventory table",
      "Generates unique Asset ID code and permanent property ledger record",
    ],
    tip: "Click '👉 Open Registration Drawer' below or the button in the toolbar to see the asset fields.",
    actionText: "👉 Open Registration Drawer",
    actionId: "open-new-property",
  },
  {
    id: "assets-form-drawer",
    targetId: "tour-assets-new-drawer",
    title: "BAMS Form & Custodian Accountability (LGC §375)",
    badge: "Step 4 of 7 · BAMS Asset Form",
    roleIcon: "📝",
    description:
      "Capture complete asset inventory data: Asset Name, Type, Physical Address, Acquisition Cost, Date Acquired, and Evacuation Center designation.",
    capabilities: [
      "Named Custodian assignment required by Commission on Audit (COA) guidelines",
      "Acquisition cost recording for municipal depreciation and asset ledger balance",
      "Disaster evacuation center flag with maximum capacity calculation",
    ],
    tip: "Assigning an Evacuation Center tag automatically syncs the facility with the DRRM Disaster Dashboard.",
  },
  {
    id: "assets-reading-table",
    targetId: "tour-assets-table",
    title: "Data Reading: Asset Register & Inspection Dossier",
    badge: "Step 5 of 7 · Asset Masterlist",
    roleIcon: "📋",
    description:
      "Review all barangay properties in the master table. Inspect physical location, custodian accountability, and operational condition.",
    capabilities: [
      "Click any row or the 'View' button to open the 360-degree Asset Inspection Dossier",
      "Track maintenance schedules, condition assessments, and official property tags",
      "Authorize equipment borrowing or dispatch for community events and tanod operations",
    ],
    tip: "Clicking 'View' opens the full asset card with serial numbers, condition status, and QR tracking.",
  },
  {
    id: "assets-materials",
    targetId: "tour-assets-materials",
    title: "Materials & Disaster Supplies Inventory",
    badge: "Step 6 of 7 · Supplies & Relief Goods",
    roleIcon: "📦",
    description:
      "Track consumable materials, disaster relief food packs, medical clinic supplies, and Tanod patrol gears in the stockroom.",
    capabilities: [
      "Real-time stock levels with automatic 'Reorder Level' red alert badges",
      "Storage location tracking (e.g. Storage Room A, DRRM Warehouse, Barangay Clinic)",
      "Quick 'Adjust' button to record inventory receipts, issuances, and physical counts",
    ],
    tip: "Items at or below the reorder level are highlighted in red to prompt immediate procurement.",
  },
  {
    id: "assets-export",
    targetId: "tour-assets-export-btn",
    title: "COA Compliance & Asset Export",
    badge: "Step 7 of 7 · Audit & Reporting",
    roleIcon: "📊",
    description:
      "Generate and export official property registers for annual Commission on Audit (COA) compliance, SGLGB assessment, and Barangay Assembly presentations.",
    capabilities: [
      "One-click CSV export matching COA Circular 2020-006 property ledger schedules",
      "Verifiable record of municipal asset transfers, depreciations, and disposals",
    ],
    tip: "You can toggle this guide ON or OFF anytime using the Guide button in the bottom-right corner.",
  },
];

export interface AssetsTourGuideProps {
  enabled: boolean;
  onToggle: (next: boolean) => void;
  onOpenNew?: () => void;
  onCloseNew?: () => void;
  isNewOpen?: boolean;
}

export function AssetsTourGuide({
  enabled,
  onToggle,
  onOpenNew,
  onCloseNew,
  isNewOpen,
}: AssetsTourGuideProps) {
  const handleAction = (actionId?: string) => {
    if (actionId === "open-new-property" && onOpenNew) {
      onOpenNew();
    }
  };

  const handleStepChange = (index: number, step: TourStep) => {
    if (step.id === "assets-form-drawer" && onOpenNew) {
      onOpenNew();
    } else if (step.id === "assets-reading-table" && onCloseNew) {
      onCloseNew();
    }
  };

  return (
    <TourGuideOverlay
      steps={ASSETS_TOUR_STEPS}
      enabled={enabled}
      onToggle={onToggle}
      onStepChange={handleStepChange}
      onAction={handleAction}
      isActionActive={isNewOpen}
    />
  );
}

export { GuideToggle as AssetsGuideToggle };
