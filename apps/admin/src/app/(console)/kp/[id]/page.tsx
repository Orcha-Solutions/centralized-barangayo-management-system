"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Chip,
  DataTable,
  Field,
  KeyValue,
  PageHead,
  Panel,
  StatusChip,
  date,
  dateTime,
  titleize,
} from "@cbms/ui";
import { ActionResult, Async, DeadlineCell, EmptyNote } from "../../../../components/common";
import { useConsole } from "../../../../components/Shell";
import { Toast } from "../../../../components/Toast";
import { KP_ADVANCE_STAGES } from "../../../../lib/labels";
import {
  useKpCaseDetailQuery,
  useAdvanceKpStageMutation,
  useScheduleKpHearingMutation,
  useDeleteKpCaseMutation,
} from "../../../../lib/kp-queries";
import { DeleteKpModal } from "../components/DeleteKpModal";
import { KpPrintModal } from "../components/KpPrintModal";
import { KpDetailActions } from "../components/KpDetailActions";

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

  const [stage, setStage] = React.useState("mediation");
  const [settlementTerms, setSettlementTerms] = React.useState("");
  const [cfaReason, setCfaReason] = React.useState("");
  const [hearingAt, setHearingAt] = React.useState("");
  const [hearingStage, setHearingStage] = React.useState("mediation");

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

  async function advance(e: React.FormEvent) {
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

  async function scheduleHearing(e: React.FormEvent) {
    e.preventDefault();
    if (!hearingAt) return;
    try {
      await hearingMutation.mutateAsync({
        id,
        scheduledAt: new Date(hearingAt).toISOString(),
        stage: hearingStage,
      });
      showToast("Hearing Scheduled", "New hearing session and Notice Form 8 created.", "success");
      setHearingAt("");
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

  return (
    <>
      <PageHead
        title={c ? (c.isLocked ? `${c.caseNo} 🔒 [LOCKED]` : c.caseNo) : "KP Case Docket"}
        subtitle={c?.isConfidential ? "[RESTRICTED VAWC/VAC DOMESTIC TRACK]" : c?.subject}
        breadcrumb="Justice & Safety / KP Cases"
        parity="KPISBH"
        actions={
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button type="button" className="cbms-btn" onClick={() => router.push("/kp")}>
              ← Back to docket
            </button>
            <KpDetailActions
              caseData={c ?? null}
              onPrint={() => setShowPrintModal(true)}
              onDelete={() => setDeleteModalOpen(true)}
              isDeleting={deleteMutation.isPending}
            />
          </div>
        }
      />

      <Async loading={isLoading} error={queryError as Error}>
        {c && (
          <div className="cbms-detail">
            {c.isLocked && (
              <div style={{ marginBottom: 16 }}>
                <Alert tone="warn">
                  🔒 <strong>Case Docket Locked</strong> — This case docket is locked. Modifications, stage advancements, hearing additions, and deletions are disabled until unlocked.
                </Alert>
              </div>
            )}
            {c.isConfidential && (
              <div style={{ marginBottom: 16 }}>
                <Alert tone="danger">
                  Restricted case docket. Confidential proceedings governed by VAWC / Family Code statutory secrecy provisions.
                </Alert>
              </div>
            )}

            <div className="cbms-grid-2">
              <Panel title="Dispute Information">
                <KeyValue
                  items={[
                    ["Case Docket", c.caseNo],
                    ["Docket Status", c.isLocked ? <Chip tone="red">🔒 Locked</Chip> : <Chip tone="green">Active</Chip>],
                    ["Subject", c.subject],
                    ["Date Filed", date(c.filedAt)],
                    ["Statutory Stage", <StatusChip status={c.stage} />],
                    [
                      "Statutory Clock (RA 7160 §410)",
                      <DeadlineCell
                        dueAt={c.deadline?.dueAt}
                        daysRemaining={c.deadline?.daysRemaining}
                        breached={c.deadline?.breached}
                      />,
                    ],
                    [
                      "Hearings Recorded",
                      String(c._count?.hearings ?? c.hearings?.length ?? 0),
                    ],
                  ]}
                />
                <div style={{ marginTop: 12 }}>
                  <div className="adm-muted" style={{ marginBottom: 4, fontSize: "0.8rem", fontWeight: 600 }}>
                    Dispute Narrative & Facts
                  </div>
                  <div style={{ whiteSpace: "pre-wrap", fontSize: "0.85rem", lineHeight: 1.5, background: "#f8fafc", padding: "0.75rem", borderRadius: "0.375rem" }}>
                    {c.description || "—"}
                  </div>
                </div>
              </Panel>

              <div>
                <Panel title="Progress & Statutory Stage">
                  {c.closedAt ? (
                    <div>
                      <div className="adm-row" style={{ marginBottom: 8 }}>
                        <span className="adm-muted">Status:</span>
                        <StatusChip status={c.stage} />
                        <span className="adm-muted">· Closed {date(c.closedAt)}</span>
                      </div>
                      {c.settlementTerms && (
                        <div style={{ marginTop: 8 }}>
                          <div className="adm-muted" style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: 2 }}>
                            Amicable Settlement Terms (KP Form 16)
                          </div>
                          <div style={{ whiteSpace: "pre-wrap", fontSize: "0.85rem", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "0.5rem", borderRadius: "4px" }}>
                            {c.settlementTerms}
                          </div>
                        </div>
                      )}
                      {c.cfaReason && (
                        <div style={{ marginTop: 8 }}>
                          <div className="adm-muted" style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: 2 }}>
                            Certification to File Action Grounds (KP Form 20)
                          </div>
                          <div style={{ whiteSpace: "pre-wrap", fontSize: "0.85rem", background: "#fef2f2", border: "1px solid #fecaca", padding: "0.5rem", borderRadius: "4px" }}>
                            {c.cfaReason}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : c.isLocked ? (
                    <div style={{ padding: "0.85rem", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "0.375rem", fontSize: "0.85rem", color: "#92400e" }}>
                      🔒 <strong>Stage advancement locked</strong>: This dispute case docket is currently locked against modifications and edits. Unlock the case docket to advance statutory stages.
                    </div>
                  ) : !mayAdvance ? (
                    <EmptyNote>Only the Punong Barangay or authorized Lupon Secretary may advance statutory stages.</EmptyNote>
                  ) : (
                    <form onSubmit={advance} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <Field label="Advance to Statutory Stage">
                        <select
                          className="cbms-select"
                          value={stage}
                          onChange={(e) => setStage(e.target.value)}
                          disabled={advanceMutation.isPending}
                        >
                          {KP_ADVANCE_STAGES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                      {stage === "settled" && (
                        <Field
                          label="Amicable Settlement Terms"
                          hint="Recorded on KP Form 16 generated automatically upon submission."
                        >
                          <textarea
                            className="cbms-textarea"
                            value={settlementTerms}
                            onChange={(e) => setSettlementTerms(e.target.value)}
                            required
                            disabled={advanceMutation.isPending}
                          />
                        </Field>
                      )}
                      {stage === "cfa_issued" && (
                        <Field label="Grounds for Certificate to File Action (CFA)" hint="Conforming to DILG Form 20 requirements">
                          <textarea
                            className="cbms-textarea"
                            value={cfaReason}
                            onChange={(e) => setCfaReason(e.target.value)}
                            required
                            disabled={advanceMutation.isPending}
                          />
                        </Field>
                      )}
                      <Button type="submit" variant="primary" disabled={advanceMutation.isPending}>
                        {advanceMutation.isPending ? "Advancing..." : "Advance Stage"}
                      </Button>
                    </form>
                  )}
                </Panel>
              </div>
            </div>

            <div className="cbms-grid-2" style={{ marginTop: 16 }}>
              <Panel title="Dispute Parties" padded={false}>
                <DataTable
                  columns={[
                    { key: "role", header: "Role", render: (p) => <StatusChip status={p.role} /> },
                    {
                      key: "name",
                      header: "Name",
                      render: (p) =>
                        p.inhabitant
                          ? `${p.inhabitant.firstName ?? ""} ${p.inhabitant.lastName ?? ""}`.trim()
                          : (p.nameOverride ?? "—"),
                    },
                    { key: "address", header: "Address", render: (p) => p.address ?? "—" },
                    { key: "contact", header: "Contact", render: (p) => p.contact ?? "—" },
                  ]}
                  rows={c.parties ?? []}
                  empty="No parties recorded."
                />
              </Panel>

              <Panel title="Statutory Documents Issued" padded={false}>
                <DataTable
                  columns={[
                    { key: "kind", header: "Form Kind", render: (d) => titleize(d.kind) },
                    { key: "issuedAt", header: "Date Issued", render: (d) => dateTime(d.issuedAt) },
                  ]}
                  rows={c.documents ?? []}
                  empty="No KP forms generated yet."
                />
              </Panel>
            </div>

            <div style={{ marginTop: 16 }}>
              <Panel
                title="Hearing Schedule & Minutes"
                actions={
                  c.isLocked ? (
                    <span className="adm-muted" style={{ fontSize: "0.8rem", fontStyle: "italic" }}>
                      🔒 Hearing scheduling locked
                    </span>
                  ) : mayEncode ? (
                    <form onSubmit={scheduleHearing} className="adm-row">
                      <input
                        className="cbms-input"
                        type="datetime-local"
                        value={hearingAt}
                        onChange={(e) => setHearingAt(e.target.value)}
                        required
                        disabled={hearingMutation.isPending}
                      />
                      <select
                        className="cbms-select"
                        value={hearingStage}
                        onChange={(e) => setHearingStage(e.target.value)}
                        disabled={hearingMutation.isPending}
                      >
                        <option value="mediation">Mediation (PB)</option>
                        <option value="conciliation">Conciliation (Pangkat)</option>
                      </select>
                      <Button type="submit" size="sm" disabled={hearingMutation.isPending || !hearingAt}>
                        {hearingMutation.isPending ? "Scheduling..." : "Schedule Hearing"}
                      </Button>
                    </form>
                  ) : undefined
                }
              >
                {(c.hearings ?? []).length === 0 ? (
                  <EmptyNote>No hearings recorded yet.</EmptyNote>
                ) : (
                  <ul className="adm-timeline">
                    {(c.hearings ?? []).map((h) => (
                      <li key={h.id}>
                        <div className="adm-timeline__when">{dateTime(h.scheduledAt)}</div>
                        <div className="adm-timeline__what">
                          <span className="adm-chiprow">
                            <StatusChip status={h.stage} />
                            {h.attended === true && <Chip tone="green">Attended</Chip>}
                            {h.attended === false && <Chip tone="red">No-show</Chip>}
                          </span>
                        </div>
                        {h.minutes && <div className="adm-timeline__what">{h.minutes}</div>}
                        {h.outcome && (
                          <div className="adm-timeline__what">Outcome: {h.outcome}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>
          </div>
        )}
      </Async>

      {/* Typed Deletion Confirmation Modal */}
      <DeleteKpModal
        open={deleteModalOpen}
        targetCase={c ?? null}
        busy={deleteMutation.isPending}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Official Printable Docket Modal */}
      <KpPrintModal
        open={showPrintModal}
        caseData={c ?? null}
        onClose={() => setShowPrintModal(false)}
      />

      {/* Post-Transaction Toast Notification */}
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
