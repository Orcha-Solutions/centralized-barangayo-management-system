"use client";

import * as React from "react";
import { TourGuideOverlay, GuideToggle, TourStep } from "../../../components/TourGuide";

export const BLOTTER_TOUR_STEPS: TourStep[] = [
  {
    id: "blotter-head",
    targetId: "tour-blotter-head",
    title: "Official Barangay Blotter (KPISBH Parity)",
    badge: "Step 1 of 6 · Incident Book Overview",
    roleIcon: "🛡️",
    description:
      "The Barangay Blotter is your official incident record book mirroring the DILG KPISBH standard. It logs all community disputes, peace and order incidents, and safety complaints filed with the Tanod desk.",
    capabilities: [
      "Chronological ledger with sequential entry numbers (e.g. BLOT-2026-...)",
      "Strict data privacy controls compliant with RA 10173 and RA 9262 (Anti-VAWC Act)",
      "Instant linkage between field incident logs and Katarungang Pambarangay mediation cases",
    ],
    tip: "VAWC records are encrypted and redacted from general view to safeguard victim confidentiality.",
  },
  {
    id: "blotter-encoding-btn",
    targetId: "tour-blotter-new-btn",
    title: "Data Encoding: Record New Incident Entry",
    badge: "Step 2 of 6 · Incident Filing",
    roleIcon: "✍️",
    description:
      "Authorized staff (Tanod, Secretary, or VAW Desk Officer) can log new incidents as they occur. Click '+ New blotter entry' to open the intake form.",
    capabilities: [
      "In-page expandable intake form for swift incident documentation",
      "Immediate entry timestamp capture and preliminary classification",
    ],
    tip: "Click '👉 Open Entry Form' below or the top button to toggle the form.",
    actionText: "👉 Open Entry Form",
    actionId: "open-new-blotter",
  },
  {
    id: "blotter-encode-panel",
    targetId: "tour-blotter-encode-panel",
    title: "Blotter Intake: Parties, Narrative & Confidentiality",
    badge: "Step 3 of 6 · Entry Documentation",
    roleIcon: "📝",
    description:
      "Capture the factual incident details: Category, Date & Time of Incident, Location landmark, Complainant, Respondent, and Sworn Narrative.",
    capabilities: [
      "Incident categorization: Dispute, Disturbance, Theft, Property Damage, or VAWC",
      "Restricted VAWC Handling: Automatically tags entries as confidential, restricted strictly to the VAW Desk and Punong Barangay",
      "Comprehensive narrative recorded and encrypted at rest with tamper auditing",
    ],
    tip: "Always record specific landmarks in the Location field to assist patrolling Tanods.",
  },
  {
    id: "blotter-toolbar",
    targetId: "tour-blotter-toolbar",
    title: "Search & Category Filtering",
    badge: "Step 4 of 6 · Fast Search",
    roleIcon: "🔍",
    description:
      "Quickly retrieve blotter entries for verification, follow-up investigation, or barangay clearance cross-checks.",
    capabilities: [
      "Search by Entry Number, Street/Purok location, or Reporter/Complainant name",
      "Filter by Incident Category (Disputes, Curfew, Noise, VAWC, etc.)",
      "Live counter showing total matching entries in the registry",
    ],
    tip: "Searching a resident's name instantly verifies whether they have pending blotter complaints.",
  },
  {
    id: "blotter-table",
    targetId: "tour-blotter-table",
    title: "Data Reading: Blotter Masterlist & Confidential Redactions",
    badge: "Step 5 of 6 · Data Reading",
    roleIcon: "📋",
    description:
      "View all recorded entries in the master ledger. Note that restricted VAWC records display a lock icon [🔒] with redacted narratives for unauthorized staff.",
    capabilities: [
      "Clear status chips identifying incident nature and confidential classifications",
      "Direct link to full entry details, printable report, and witness statements",
      "Click any entry row to inspect the full case history and actions taken",
    ],
    tip: "Clicking any entry row navigates to its full detail page with print-ready incident excerpts.",
  },
  {
    id: "blotter-escalate",
    targetId: "tour-blotter-table",
    title: "Case Escalation: Katarungang Pambarangay Referral",
    badge: "Step 6 of 6 · Lupon Referral",
    roleIcon: "⚖️",
    description:
      "When a neighborhood dispute cannot be resolved informally at the Tanod desk, the system links the blotter record directly into a formal Katarungang Pambarangay (KP) docket.",
    capabilities: [
      "Seamless transfer of complainant, respondent, and facts into the Lupon system",
      "Avoids duplicate encoding while maintaining an unbroken chain of documentation",
      "Direct link displayed in the 'KP case' column for fast cross-navigation",
    ],
    tip: "You can toggle this guide ON or OFF anytime using the Guide button in the bottom-right corner.",
  },
];

export interface BlotterTourGuideProps {
  enabled: boolean;
  onToggle: (next: boolean) => void;
  onOpenNew?: () => void;
  onCloseNew?: () => void;
  isNewOpen?: boolean;
}

export function BlotterTourGuide({
  enabled,
  onToggle,
  onOpenNew,
  onCloseNew,
  isNewOpen,
}: BlotterTourGuideProps) {
  const handleAction = (actionId?: string) => {
    if (actionId === "open-new-blotter" && onOpenNew) {
      onOpenNew();
    }
  };

  const handleStepChange = (index: number, step: TourStep) => {
    if (step.id === "blotter-encode-panel" && onOpenNew) {
      onOpenNew();
    } else if (step.id === "blotter-table" && onCloseNew) {
      onCloseNew();
    }
  };

  return (
    <TourGuideOverlay
      steps={BLOTTER_TOUR_STEPS}
      enabled={enabled}
      onToggle={onToggle}
      onStepChange={handleStepChange}
      onAction={handleAction}
      isActionActive={isNewOpen}
    />
  );
}

export { GuideToggle as BlotterGuideToggle };
