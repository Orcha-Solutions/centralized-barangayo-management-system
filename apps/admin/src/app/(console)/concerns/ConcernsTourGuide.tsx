"use client";

import * as React from "react";
import { TourGuideOverlay, GuideToggle, TourStep } from "../../../components/TourGuide";

export const CONCERNS_TOUR_STEPS: TourStep[] = [
  {
    id: "concerns-overview",
    targetId: "tour-concerns-stats",
    title: "311 Citizen Concerns Overview & EODB SLA",
    badge: "Step 1 of 6 · Overview & SLA Metrics",
    roleIcon: "📣",
    description:
      "Welcome to the 311 Citizen Concerns module. This tracks all resident-reported municipal issues—streetlights, flooding, garbage, potholes, noise, and safety hazards—under Republic Act 11032 (Ease of Doing Business Act).",
    capabilities: [
      "Real-time counters for Open Concerns, SLA Breached, and Resolved items",
      "Statutory 3-working-day response clock strictly monitored for DILG CSM audit compliance",
      "Unified citizen engagement linked directly with the citizen mobile portal and SMS updates",
    ],
    tip: "Keep an eye on the SLA Breached counter—cases exceeding 3 days flag an alert for the Punong Barangay.",
  },
  {
    id: "concerns-search-filters",
    targetId: "tour-concerns-toolbar",
    title: "Search & Multi-Criteria Filtering",
    badge: "Step 2 of 6 · Fast Lookup",
    roleIcon: "🔍",
    description:
      "Locate any citizen report in seconds using comprehensive search terms and multi-parameter filters.",
    capabilities: [
      "Search by Reference Number (e.g. CON-2026-...), Purok, description keyword, or citizen name",
      "Filter by status: Submitted, Acknowledged, In Progress, Resolved, or Rejected",
      "Filter by category: Streetlights, Flooding, Garbage, Road Damage, Noise, and Health Hazards",
    ],
    tip: "Filtering by 'Purok' helps assign Tanod patrols to geographically concentrated problems.",
  },
  {
    id: "concerns-encoding-btn",
    targetId: "tour-concerns-file-btn",
    title: "Data Encoding: File Citizen Concern (311)",
    badge: "Step 3 of 6 · Data Encoding",
    roleIcon: "✍️",
    description:
      "Staff can directly encode issues received via walk-in, telephone, or Tanod radio patrol. Click '+ File Citizen Concern (311)' to launch the fast intake drawer.",
    capabilities: [
      "Rapid slide-over drawer without leaving your current place in the table",
      "Immediate tracking reference number generated upon submission",
      "Automatic SLA due date assignment computed against statutory working days",
    ],
    tip: "Click '👉 Open Filing Drawer' below or the button in the toolbar to see the intake fields.",
    actionText: "👉 Open Filing Drawer",
    actionId: "open-new-drawer",
  },
  {
    id: "concerns-form-drawer",
    targetId: "tour-concerns-new-drawer",
    title: "311 Intake Form: Category, Location & Dispatch",
    badge: "Step 4 of 6 · Form Intake",
    roleIcon: "📝",
    description:
      "Capture all vital incident data needed for rapid tanod patrol or municipal engineering response.",
    capabilities: [
      "Select standardized issue category and assign exact Purok / Zone location",
      "Record citizen reporter name and contact phone for automated status SMS notifications",
      "Input detailed incident narrative with landmark references for responding units",
    ],
    tip: "Accurate phone numbers ensure residents receive SMS notifications when their concern is resolved.",
  },
  {
    id: "concerns-reading-table",
    targetId: "tour-concerns-table",
    title: "Data Reading: Concerns Register & Response Clocks",
    badge: "Step 5 of 6 · Data Reading",
    roleIcon: "📋",
    description:
      "Inspect all filed concerns in the master table with live response countdown clocks and status badges.",
    capabilities: [
      "Response clock chips: Green shows days remaining; Red warns of SLA breaches",
      "Reporter visibility: Anonymous or verified inhabitant profile",
      "Click on any row to open the Concern Handling and Resolution Drawer",
    ],
    tip: "Clicking any concern row opens its action drawer where you can advance its status.",
  },
  {
    id: "concerns-resolution-export",
    targetId: "tour-concerns-export-btn",
    title: "Resolution Workflow & DILG CSV Export",
    badge: "Step 6 of 6 · Resolution & Reports",
    roleIcon: "✅",
    description:
      "Handle concerns step-by-step (Submitted ➔ Acknowledged ➔ Deploy Tanod ➔ Resolved) and generate official compliance reports.",
    capabilities: [
      "One-click action progression with timestamps and staff accountability logging",
      "Attach formal resolution notes (e.g. 'Streetlight LED bulb replaced by Team B')",
      "Download official CSV reports for DILG CSM compliance and Barangay Assembly town halls",
    ],
    tip: "You can toggle this guide ON or OFF anytime using the Guide button in the bottom-right corner.",
  },
];

export interface ConcernsTourGuideProps {
  enabled: boolean;
  onToggle: (next: boolean) => void;
  onOpenNewDrawer?: () => void;
  onCloseNewDrawer?: () => void;
  isNewDrawerOpen?: boolean;
}

export function ConcernsTourGuide({
  enabled,
  onToggle,
  onOpenNewDrawer,
  onCloseNewDrawer,
  isNewDrawerOpen,
}: ConcernsTourGuideProps) {
  const handleAction = (actionId?: string) => {
    if (actionId === "open-new-drawer" && onOpenNewDrawer) {
      onOpenNewDrawer();
    }
  };

  const handleStepChange = (index: number, step: TourStep) => {
    if (step.id === "concerns-form-drawer" && onOpenNewDrawer) {
      onOpenNewDrawer();
    } else if (step.id === "concerns-reading-table" && onCloseNewDrawer) {
      onCloseNewDrawer();
    }
  };

  return (
    <TourGuideOverlay
      steps={CONCERNS_TOUR_STEPS}
      enabled={enabled}
      onToggle={onToggle}
      onStepChange={handleStepChange}
      onAction={handleAction}
      isActionActive={isNewDrawerOpen}
    />
  );
}

export { GuideToggle as ConcernsGuideToggle };
