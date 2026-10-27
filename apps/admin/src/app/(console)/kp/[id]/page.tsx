"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert, PageHead, titleize } from "@cbms/ui";
import { useConsole } from "../../../../components/Shell";
import { Toast } from "../../../../components/Toast";
import {
  useKpCaseDetailQuery,
  useAdvanceKpStageMutation,
  useScheduleKpHearingMutation,
  useDeleteKpCaseMutation,
} from "../../../../lib/kp-queries";
import { KpHero } from "./components/KpHero";
import { KpStats } from "./components/KpStats";
import { KpDisputeNarrativeCard } from "./components/KpDisputeNarrativeCard";
import { KpHearingsCard } from "./components/KpHearingsCard";
import { KpPartiesCard } from "./components/KpPartiesCard";
import { KpStageProgressionCard } from "./components/KpStageProgressionCard";
import { ScheduleHearingModal } from "./components/ScheduleHearingModal";
import { DeleteKpModal } from "../components/DeleteKpModal";
import { KpPrintModal } from "../components/KpPrintModal";

export default function KpCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { can, reloadDashboard } = useConsole();
  const id = String((params as Record<string, string | string[]>)?.id ?? "");

  // React Query Detail
  const { data: c, isLoading, error: queryError, refetch } = useKpCaseDetailQuery(id);

  // Mutations
  const advanceMutation = useAdvanceKpStageMutation();
  const hearingMutation = useScheduleKpHearingMutation();
  const deleteMutation = useDeleteKpCaseMutation();

  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [showPrintModal, setShowPrintModal] = React.useState(false);
  const [showScheduleModal, setShowScheduleModal] = React.useState(false);

  const [stage, setStage] = React.useState("mediation");
  const [settlementTerms, setSettlementTerms] = React.useState("");
  const [cfaReason, setCfaReason] = React.useState("");

  const [toast, setToast] = React.useState<{
    open: boolean;
    message: string;
    description?: string;
    tone: "success" | "danger" | "info";
  }>({
    open: false,
    message: "",
    description: "",
    tone: "success",
  });

  const showToast = (message: string, description?: string, tone: "success" | "danger" | "info" = "success") => {
    setToast({ open: true, message, description, tone });
  };

  const mayAdvance = can("kp:approve") || can("kp:manage");
  const mayEncode = can("kp:encode") || can("kp:manage");

  async function handleAdvance(e: React.FormEvent) {
    e.preventDefault();
    try {
      await advanceMutation.mutateAsync({
        id,
        stage,
        settlementTerms: stage === "settled" ? settlementTerms.trim() : undefined,
        cfaReason: stage === "cfa_issued" ? cfaReason.trim() : undefined,
      });
      showToast(
        "Stage Advanced",
        `Case moved to ${titleize(stage)}. Statutory KP form generated successfully.`,
        "success"
      );
      setSettlementTerms("");
      setCfaReason("");
      refetch();
      reloadDashboard();
    } catch (err: any) {
      showToast("Advance Failed", err?.message ?? "Could not advance case stage.", "danger");
    }
  }

  async function handleScheduleHearing(scheduledAt: string, hearingStage: string) {
    try {
      await hearingMutation.mutateAsync({
        id,
        scheduledAt: new Date(scheduledAt).toISOString(),
        stage: hearingStage,
      });
      showToast("Hearing Scheduled", "New hearing session and Notice Form 8 created.", "success");
      setShowScheduleModal(false);
      refetch();
    } catch (err: any) {
      showToast("Scheduling Failed", err?.message ?? "Could not schedule the hearing.", "danger");
    }
  }

  async function handleDeleteConfirm() {
    if (!c) return;
    try {
      await deleteMutation.mutateAsync(c.id);
      showToast("Case Deleted", `Case docket ${c.caseNo} has been deleted.`, "success");
      setDeleteModalOpen(false);
      reloadDashboard();
      router.push("/kp");
    } catch (err: any) {
      showToast("Deletion Failed", err?.message ?? "Could not delete this KP case.", "danger");
    }
  }

  // Modern Loading Screen
  if (isLoading && !c) {
    return (
      <>
        <PageHead
          title="Loading Case Docket…"
          breadcrumb="Justice & Safety / KP Cases"
          parity="KPISBH"
        />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "5rem 0", gap: "1rem" }}>
          <span className="cbms-spinner" aria-label="Loading KP Case" style={{ width: 36, height: 36 }} />
          <span style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 500 }}>
            Retrieving dispute docket and statutory proceedings records…
          </span>
        </div>
      </>
    );
  }

  // Modern Error Screen
  if (queryError || !c) {
    return (
      <>
        <PageHead
          title="Case Docket Not Found"
          breadcrumb="Justice & Safety / KP Cases"
          parity="KPISBH"
        />
        <Alert tone="danger">
          {(queryError as any)?.message || "The requested Katarungang Pambarangay case docket could not be found or has been deleted."}
        </Alert>
        <div style={{ marginTop: "1.5rem" }}>
          <button type="button" className="cbms-btn" onClick={() => router.push("/kp")}>
            ← Return to KP Cases Docket
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Alerts if Locked or Confidential */}
        {c.isLocked && (
          <Alert tone="warn">
            🔒 <strong>Case Docket Locked</strong> — This case docket is locked. Modifications, stage advancements, hearing additions, and deletions are disabled until unlocked.
          </Alert>
        )}
        {c.isConfidential && (
          <Alert tone="danger">
            Restricted case docket. Confidential proceedings governed by VAWC / Family Code statutory secrecy provisions.
          </Alert>
        )}

        {/* 1. Modern Hero Banner matching Inhabitants & Certificates */}
        <KpHero
          caseData={c}
          isDeleting={deleteMutation.isPending}
          onPrint={() => setShowPrintModal(true)}
          onScheduleHearing={() => setShowScheduleModal(true)}
          onAdvanceStage={() => {
            const el = document.getElementById("kp-stage-section");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          onDelete={() => setDeleteModalOpen(true)}
        />

        {/* 2. Key Metric Stat Cards */}
        <KpStats caseData={c} />

        {/* 3. Two-Column Dossier Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))",
            gap: "1.25rem",
            alignItems: "start",
          }}
        >
          {/* Left Column: Dispute Facts & Hearings Timeline */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <KpDisputeNarrativeCard caseData={c} />
            <KpHearingsCard
              caseData={c}
              mayEncode={mayEncode}
              onOpenScheduleModal={() => setShowScheduleModal(true)}
            />
          </div>

          {/* Right Column: Stage Progression & Registered Parties */}
          <div id="kp-stage-section" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <KpStageProgressionCard
              caseData={c}
              mayAdvance={mayAdvance}
              stage={stage}
              setStage={setStage}
              settlementTerms={settlementTerms}
              setSettlementTerms={setSettlementTerms}
              cfaReason={cfaReason}
              setCfaReason={setCfaReason}
              isAdvancing={advanceMutation.isPending}
              onAdvance={handleAdvance}
            />
            <KpPartiesCard caseData={c} />
          </div>
        </div>
      </div>

      {/* Schedule Hearing Modal */}
      <ScheduleHearingModal
        open={showScheduleModal}
        caseNo={c.caseNo}
        busy={hearingMutation.isPending}
        onClose={() => setShowScheduleModal(false)}
        onSubmit={handleScheduleHearing}
      />

      {/* Typed Deletion Confirmation Modal */}
      <DeleteKpModal
        open={deleteModalOpen}
        targetCase={c}
        busy={deleteMutation.isPending}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Official Printable Docket Modal */}
      <KpPrintModal
        open={showPrintModal}
        caseData={c}
        onClose={() => setShowPrintModal(false)}
      />

      {/* Floating Toast Notification */}
      <Toast
        open={toast.open}
        message={toast.message}
        description={toast.description}
        tone={toast.tone}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}
