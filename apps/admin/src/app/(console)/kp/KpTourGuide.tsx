"use client";

import * as React from "react";
import { TourGuideOverlay, GuideToggle, TourStep } from "../../../components/TourGuide";

export const KP_TOUR_STEPS: TourStep[] = [
  {
    id: "kp-stats",
    targetId: "tour-kp-stats",
    title: "Katarungang Pambarangay Docket (RA 7160 §410)",
    badge: "Step 1 of 6 · Docket & Legal Timers",
    roleIcon: "⚖️",
    description:
      "Welcome to the Katarungang Pambarangay (KP) case docket. Under RA 7160 (Local Government Code), disputes undergo statutory amicable conciliation: 15 days mediation before the Punong Barangay, followed by 15 days before the Pangkat Tagapagkasundo (extendable by 15 days).",
    capabilities: [
      "Real-time counters for Open Cases, Approaching Deadlines (<5 days), and Breached periods",
      "Statutory clock tracking to prevent undue delays in community dispute settlement",
      "Official KPISBH compliance mirroring DILG Lupon Tagapamayapa standards",
    ],
    tip: "A breached deadline warns the Lupon that a Certificate to File Action (CFA) may need to be issued.",
  },
  {
    id: "kp-new-btn",
    targetId: "tour-kp-new-btn",
    title: "Data Encoding: File a New KP Case",
    badge: "Step 2 of 6 · Case Filing",
    roleIcon: "✍️",
    description:
      "When a complainant formalizes a complaint after initial blotter referral or walk-in filing, click '+ File a case' to initialize the official dispute docket.",
    capabilities: [
      "In-page dispute intake form with immediate docket number generation (e.g. KP-2026-...)",
      "Starts the initial 15-day Punong Barangay mediation period from day of filing",
    ],
    tip: "Click '👉 Open Case Form' below or the button at top to view the filing fields.",
    actionText: "👉 Open Case Form",
    actionId: "open-new-kp",
  },
  {
    id: "kp-encode-panel",
    targetId: "tour-kp-encode-panel",
    title: "Case Intake Form: Parties, Subject & Protection",
    badge: "Step 3 of 6 · Case Intake",
    roleIcon: "📝",
    description:
      "Record the core elements of the complaint: Case Subject, Respondent name (residents or non-residents permitted), Detailed Narrative, and Confidential VAWC designation.",
    capabilities: [
      "Subject & description encrypted at rest for sensitive neighborhood matters",
      "Special VAWC/VAC checkbox ensures sensitive domestic cases remain restricted to authorized desks",
      "Automatic complainant linking to the Barangay Inhabitants Registry",
    ],
    tip: "Accurate respondent names allow proper delivery of the Notice of Hearing (KP Form 7).",
  },
  {
    id: "kp-toolbar",
    targetId: "tour-kp-toolbar",
    title: "Filter by Statutory Conciliation Stage",
    badge: "Step 4 of 6 · Stage Tracking",
    roleIcon: "🔍",
    description:
      "Monitor disputes at each stage of the statutory amicable settlement ladder.",
    capabilities: [
      "Filed: Fresh complaints awaiting initial summons",
      "Mediation: 15-day period before the Punong Barangay",
      "Conciliation: 15-day period before the 3-member Pangkat Tagapagkasundo",
      "Settled / CFA Issued: Cases concluded by amicable settlement or certified for court filing",
    ],
    tip: "Filtering by 'Mediation' helps the Punong Barangay schedule upcoming weekly hearing calendars.",
  },
  {
    id: "kp-table",
    targetId: "tour-kp-table",
    title: "Data Reading: Case Docket, Parties & Hearings",
    badge: "Step 5 of 6 · Docket Masterlist",
    roleIcon: "📋",
    description:
      "Inspect all filed cases, involved parties, current conciliation stage, statutory deadline countdown, and logged hearing sessions.",
    capabilities: [
      "Parties column: Clear visual tags distinguishing Complainants vs Respondents",
      "Statutory deadline cell: Color-coded remaining days or overdue breach alerts",
      "Hearing count: Quick overview of proceedings held before the Lupon",
    ],
    tip: "Clicking any case row opens the comprehensive dossier with summonses, hearing minutes, and settlement forms.",
  },
  {
    id: "kp-statutory-alert",
    targetId: "tour-kp-statutory-alert",
    title: "Statutory Deadlines & Certificate to File Action (CFA)",
    badge: "Step 6 of 6 · Legal Remedies",
    roleIcon: "📜",
    description:
      "When mediation fails or statutory time limits lapse, the Lupon issues a Certificate to File Action (KP Form 20). This satisfies the condition precedent for filing an action in the Municipal Trial Court.",
    capabilities: [
      "Audit trail records all hearing absences and repudiations",
      "Generates print-ready DILG KP Forms (Summons, Subpoena, Amicable Settlement, and CFA)",
      "Protects citizen legal rights by upholding due process under RA 7160",
    ],
    tip: "You can toggle this guide ON or OFF anytime using the Guide button in the bottom-right corner.",
  },
];

export interface KpTourGuideProps {
  enabled: boolean;
  onToggle: (next: boolean) => void;
  onOpenNew?: () => void;
  onCloseNew?: () => void;
  isNewOpen?: boolean;
}

export function KpTourGuide({
  enabled,
  onToggle,
  onOpenNew,
  onCloseNew,
  isNewOpen,
}: KpTourGuideProps) {
  const handleAction = (actionId?: string) => {
    if (actionId === "open-new-kp" && onOpenNew) {
      onOpenNew();
    }
  };

  const handleStepChange = (index: number, step: TourStep) => {
    if (step.id === "kp-encode-panel" && onOpenNew) {
      onOpenNew();
    } else if (step.id === "kp-table" && onCloseNew) {
      onCloseNew();
    }
  };

  return (
    <TourGuideOverlay
      steps={KP_TOUR_STEPS}
      enabled={enabled}
      onToggle={onToggle}
      onStepChange={handleStepChange}
      onAction={handleAction}
      isActionActive={isNewOpen}
    />
  );
}

export { GuideToggle as KpGuideToggle };
