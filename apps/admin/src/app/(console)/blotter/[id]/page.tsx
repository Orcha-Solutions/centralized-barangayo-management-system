"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, useApi } from "@cbms/api-client";
import {
  Alert,
  Button,
  Chip,
  Field,
  KeyValue,
  PageHead,
  Panel,
  StatCard,
  StatGrid,
  StatusChip,
  dateTime,
  titleize,
} from "@cbms/ui";
import { ActionResult, Async, EmptyNote } from "../../../../components/common";
import { useConsole } from "../../../../components/Shell";
import type { BlotterActionLog, BlotterEntry } from "../../../../lib/types";

function getActionIcon(action: string): string {
  const a = action.toLowerCase();
  if (a.includes("intake") || a.includes("statement") || a.includes("booking")) return "📝";
  if (a.includes("ocular") || a.includes("inspection") || a.includes("patrol") || a.includes("dispatch")) return "🔍";
  if (a.includes("summons") || a.includes("hearing") || a.includes("notice")) return "📜";
  if (a.includes("bpo") || a.includes("protection")) return "🛡️";
  if (a.includes("medical") || a.includes("hospital")) return "🚑";
  if (a.includes("cswdo") || a.includes("dswd") || a.includes("referral") || a.includes("counseling")) return "🤝";
  if (a.includes("police") || a.includes("pnp") || a.includes("cctv")) return "🚓";
  if (a.includes("resolved") || a.includes("closed") || a.includes("compliance") || a.includes("settlement")) return "✅";
  return "📌";
}

export default function BlotterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { can, hasRole, user } = useConsole();
  const id = String((params as Record<string, string | string[]>)?.id ?? "");

  const res = useApi<BlotterEntry>(id ? `/blotter/${id}` : null);
  const entry = res.data;

  // Modal / Form state for logging an action
  const [showLogModal, setShowLogModal] = React.useState(false);
  const [actionTitle, setActionTitle] = React.useState("");
  const [officerName, setOfficerName] = React.useState(user?.fullName || "");
  const [officerRole, setOfficerRole] = React.useState(
    user?.roles?.[0] ? user.roles[0].replace(/_/g, " ") : "Barangay Public Safety Officer"
  );
  const [statusAfter, setStatusAfter] = React.useState("active");
  const [documentRef, setDocumentRef] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Authorization check for confidential VAWC records
  const isVawAuthorized =
    can("vawc:view") ||
    hasRole("VAW_DESK_OFFICER") ||
    hasRole("PUNONG_BARANGAY") ||
    hasRole("SYSTEM_ADMIN");

  const isConfidentialAndHidden = entry?.isConfidential && !isVawAuthorized;

  // Can log action check
  const canLogAction =
    can("blotter:create") ||
    can("blotter:view") ||
    can("kp:create") ||
    hasRole("VAW_DESK_OFFICER") ||
    hasRole("TANOD") ||
    hasRole("LUPON_SECRETARY") ||
    hasRole("BARANGAY_SECRETARY") ||
    hasRole("PUNONG_BARANGAY") ||
    hasRole("SYSTEM_ADMIN");

  const actions = entry?.actionsTaken ?? [];

  async function handleRecordAction(e: React.FormEvent) {
    e.preventDefault();
    if (!actionTitle.trim() || !notes.trim()) {
      setErrorMsg("Please provide an action title and detailed notes.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await api(`/blotter/${id}/actions`, {
        method: "POST",
        body: JSON.stringify({
          actionTaken: actionTitle.trim(),
          officerName: officerName.trim() || user?.fullName || "Barangay Officer",
          officerRole: officerRole.trim() || "Duty Officer",
          notes: notes.trim(),
          statusAfter,
          documentRef: documentRef.trim() || null,
        }),
      });

      setSubmitSuccess(true);
      setShowLogModal(false);
      setActionTitle("");
      setDocumentRef("");
      setNotes("");
      await res.reload();
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to record barangay action.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHead
        title={entry ? `Blotter Entry: ${entry.entryNo}` : "Blotter Incident Record"}
        subtitle={
          entry
            ? `Incident logged on ${dateTime(entry.incidentAt)} at ${entry.location}. Status: ${titleize(entry.status || "active")}.`
            : "Official incident record book."
        }
        breadcrumb="Justice & Safety / Blotter"
        parity="KPISBH / BIMS Form C1 & D1"
        actions={
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              className="cbms-btn"
              onClick={() => router.push("/blotter")}
            >
              ← Back to Blotter
            </button>
            {canLogAction && entry && (
              <button
                type="button"
                className="cbms-btn cbms-btn--primary"
                onClick={() => {
                  setOfficerName(user?.fullName || "");
                  setOfficerRole(user?.roles?.[0] ? user.roles[0].replace(/_/g, " ") : "Duty Officer");
                  setShowLogModal(true);
                }}
              >
                ➕ Record Action / Intervention
              </button>
            )}
            <Button
              className="adm-noprint"
              onClick={() => window.print()}
              disabled={!entry}
            >
              🖨️ Print Form C1 / D1
            </Button>
          </div>
        }
      />

      <Async loading={res.loading} error={res.error}>
        {entry ? (
          <>
            {submitSuccess && (
              <div style={{ marginBottom: 16 }}>
                <Alert tone="success">
                  ✅ <strong>Barangay action recorded successfully!</strong> The intervention history and incident timeline have been updated.
                </Alert>
              </div>
            )}

            {/* Confidentiality Warning Alert */}
            {entry.isConfidential && (
              <div style={{ marginBottom: 16 }}>
                {isVawAuthorized ? (
                  <Alert tone="warn">
                    🔒 <strong>Restricted VAWC / Child Protection Record (RA 9262 / DILG Form D1):</strong> You are viewing an unredacted incident profile authorized under your protective functionary credentials. All access events are audited.
                  </Alert>
                ) : (
                  <Alert tone="danger">
                    🔒 <strong>Confidential Incident:</strong> This record contains protected information under Republic Act 9262 (Anti-VAWC Act). Details and narratives are redacted for unauthorized roles.
                  </Alert>
                )}
              </div>
            )}

            {/* Top Stat Summary */}
            <StatGrid>
              <StatCard
                label="Blotter Entry No."
                value={entry.entryNo}
                icon="📕"
                hint="Official docket number"
              />
              <StatCard
                label="Incident Status"
                value={titleize(entry.status || "active")}
                icon="⚡"
                tone={entry.status === "resolved" ? "green" : entry.status === "endorsed" ? "gold" : "navy"}
                hint={`${actions.length} action(s) logged to date`}
              />
              <StatCard
                label="Incident Classification"
                value={titleize(entry.category)}
                icon="⚖️"
                tone={entry.category === "vawc" ? "red" : "navy"}
                hint={entry.isConfidential ? "Confidential (RA 9262)" : "Public Blotter"}
              />
              <StatCard
                label="Katarungang Pambarangay"
                value={entry.kpCase ? entry.kpCase.caseNo : "No KP Referral"}
                icon="🏛️"
                tone={entry.kpCase ? "gold" : "navy"}
                hint={entry.kpCase ? `Stage: ${titleize(entry.kpCase.stage)}` : "Direct barangay intervention"}
              />
            </StatGrid>

            <div style={{ height: 16 }} />

            <div className="cbms-grid-2">
              {/* Incident Details Key-Value */}
              <Panel title="Incident Overview & Parties">
                <KeyValue
                  items={[
                    ["Entry Number", entry.entryNo],
                    [
                      "Category",
                      <span className="adm-chiprow" key="cat">
                        <StatusChip status={entry.category} />
                        {entry.isConfidential && <Chip tone="red">Restricted</Chip>}
                      </span>,
                    ],
                    ["Current Status", <StatusChip key="st" status={entry.status || "active"} />],
                    ["Date & Time of Incident", dateTime(entry.incidentAt)],
                    ["Incident Location / Venue", entry.location],
                    ["Reported By (Complainant)", isConfidentialAndHidden ? "[REDACTED FOR PRIVACY]" : entry.reportedBy],
                    ["Respondent / Alleged Party", isConfidentialAndHidden ? "[REDACTED FOR PRIVACY]" : entry.respondentName || "—"],
                    ["Barangay Jurisdiction", "Barangay Barangka, Marikina City"],
                  ]}
                />
              </Panel>

              {/* Related KP Case or Protective Services */}
              <Panel title="Disposition & Legal Escalation">
                {entry.kpCase ? (
                  <div>
                    <p style={{ margin: "0 0 1rem 0", fontSize: 13.5, lineHeight: 1.6 }}>
                      This blotter entry has been formally endorsed to the <strong>Lupong Tagapamayapa</strong> for amicable settlement under the Katarungang Pambarangay Law (RA 7160).
                    </p>
                    <KeyValue
                      items={[
                        ["KP Docket No.", entry.kpCase.caseNo],
                        ["Current KP Stage", <StatusChip key="stg" status={entry.kpCase.stage} />],
                      ]}
                    />
                    <div style={{ marginTop: 14 }}>
                      <Link href={`/kp/${entry.kpCase.id}`} className="cbms-btn cbms-btn--primary">
                        ⚖️ View Full KP Case Docket →
                      </Link>
                    </div>
                  </div>
                ) : entry.category === "vawc" ? (
                  <div>
                    <p style={{ margin: "0 0 0.85rem 0", fontSize: 13.5, lineHeight: 1.6 }}>
                      <strong>Statutory Note on VAWC Cases:</strong> Under Section 410 of the Local Government Code and Republic Act 9262, offenses involving violence against women and children are <strong>non-mediable</strong>.
                    </p>
                    <ul style={{ margin: "0 0 1rem 0", paddingLeft: "1.25rem", fontSize: "0.85rem", lineHeight: 1.7, color: "#475569" }}>
                      <li>No conciliation or confrontation between victim and perpetrator shall be required.</li>
                      <li>VAW Desk officer coordinates with PNP Women's Desk and City Social Welfare (CSWD).</li>
                      <li>Barangay Protection Orders (BPO) can be requested from the Punong Barangay.</li>
                    </ul>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        type="button"
                        className="cbms-btn cbms-btn--primary"
                        onClick={() => {
                          setActionTitle("Barangay Protection Order (BPO) Issued");
                          setStatusAfter("bpo_issued");
                          setDocumentRef("BPO Form D2");
                          setShowLogModal(true);
                        }}
                      >
                        🛡️ Issue Barangay Protection Order (BPO)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ margin: "0 0 1rem 0", fontSize: 13.5, lineHeight: 1.6 }}>
                      This incident is logged in the Official Barangay Blotter Record. It has not been endorsed to a formal KP conciliation docket.
                    </p>
                    <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                      💡 If the parties request amicable dispute settlement, this entry can be elevated into a Katarungang Pambarangay case by the Lupon Secretary.
                    </div>
                  </div>
                )}
              </Panel>
            </div>

            <div style={{ height: 16 }} />

            {/* Detailed Narrative */}
            <Panel title="Incident Narrative & Initial Intake">
              {isConfidentialAndHidden ? (
                <div style={{ padding: "1.5rem", textAlign: "center", backgroundColor: "#fef2f2", borderRadius: "0.5rem" }}>
                  <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>🔒</div>
                  <strong style={{ color: "#991b1b" }}>Confidential Record Redacted</strong>
                  <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "#7f1d1d" }}>
                    The incident narrative is protected under RA 9262 and cannot be displayed without VAW Desk Officer or Punong Barangay credentials.
                  </p>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      whiteSpace: "pre-wrap",
                      fontSize: 14,
                      lineHeight: 1.75,
                      padding: "1rem 1.25rem",
                      backgroundColor: "var(--color-bg-subtle, #f8fafc)",
                      borderRadius: "0.375rem",
                      border: "1px solid var(--color-border, #e2e8f0)",
                      fontFamily: "inherit",
                    }}
                  >
                    {entry.narrative}
                  </div>
                  <div style={{ marginTop: "0.75rem", fontSize: "0.78rem", color: "#64748b" }}>
                    🔒 All blotter entries are recorded with tamper-evident cryptographic hashes and immutable timestamps.
                  </div>
                </div>
              )}
            </Panel>

            <div style={{ height: 16 }} />

            {/* ---------------------------------------------------------------- */}
            {/* BARANGAY ACTION HISTORY & INTERVENTION TIMELINE                 */}
            {/* ---------------------------------------------------------------- */}
            <Panel
              title={`🛡️ Barangay Actions & Intervention History (${actions.length})`}
              actions={
                canLogAction ? (
                  <button
                    type="button"
                    className="cbms-btn cbms-btn--primary"
                    style={{ fontSize: "0.82rem", padding: "0.35rem 0.75rem" }}
                    onClick={() => {
                      setOfficerName(user?.fullName || "");
                      setOfficerRole(user?.roles?.[0] ? user.roles[0].replace(/_/g, " ") : "Duty Officer");
                      setShowLogModal(true);
                    }}
                  >
                    ➕ Record Action
                  </button>
                ) : undefined
              }
            >
              {actions.length === 0 ? (
                <div style={{ padding: "2rem 1rem", textAlign: "center", color: "#64748b" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📋</div>
                  <strong>No follow-up actions recorded yet.</strong>
                  <p style={{ margin: "0.25rem 0 1rem 0", fontSize: "0.85rem" }}>
                    Record mobile patrols, summons, ocular inspections, referrals, or resolution notes taken by the barangay.
                  </p>
                  {canLogAction && (
                    <button
                      type="button"
                      className="cbms-btn cbms-btn--primary"
                      onClick={() => setShowLogModal(true)}
                    >
                      ➕ Record First Barangay Action
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {actions.map((act: BlotterActionLog, idx: number) => {
                    const icon = getActionIcon(act.actionTaken);
                    return (
                      <div
                        key={act.id || idx}
                        style={{
                          display: "flex",
                          gap: "1rem",
                          position: "relative",
                        }}
                      >
                        {/* Timeline Left Connector */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 36 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              backgroundColor: "var(--color-bg-subtle, #f1f5f9)",
                              border: "2px solid var(--color-border, #cbd5e1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.1rem",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                              zIndex: 1,
                            }}
                          >
                            {icon}
                          </div>
                          {idx < actions.length - 1 && (
                            <div
                              style={{
                                width: 2,
                                flex: 1,
                                backgroundColor: "var(--color-border, #e2e8f0)",
                                margin: "4px 0",
                              }}
                            />
                          )}
                        </div>

                        {/* Action Card Content */}
                        <div
                          style={{
                            flex: 1,
                            backgroundColor: "var(--color-bg-subtle, #f8fafc)",
                            border: "1px solid var(--color-border, #e2e8f0)",
                            borderRadius: "0.5rem",
                            padding: "1rem 1.25rem",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.4rem" }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                                <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>
                                  {act.actionTaken}
                                </strong>
                                <span
                                  style={{
                                    fontSize: "0.72rem",
                                    padding: "0.15rem 0.5rem",
                                    borderRadius: "1rem",
                                    backgroundColor: "#e2e8f0",
                                    color: "#475569",
                                    fontWeight: 600,
                                  }}
                                >
                                  Step {idx + 1}
                                </span>
                              </div>
                              <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.2rem" }}>
                                👤 <strong>{act.officerName}</strong> &bull; {act.officerRole}
                              </div>
                            </div>

                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 500 }}>
                                🕒 {dateTime(act.timestamp)}
                              </div>
                              {act.statusAfter && (
                                <div style={{ marginTop: "0.25rem" }}>
                                  <StatusChip status={act.statusAfter} />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Notes */}
                          {act.notes && (
                            <div
                              style={{
                                marginTop: "0.6rem",
                                padding: "0.65rem 0.85rem",
                                backgroundColor: "#ffffff",
                                borderRadius: "0.375rem",
                                border: "1px solid var(--color-border, #e2e8f0)",
                                fontSize: "0.85rem",
                                lineHeight: 1.6,
                                color: "#334155",
                              }}
                            >
                              {act.notes}
                            </div>
                          )}

                          {/* Document reference */}
                          {act.documentRef && (
                            <div style={{ marginTop: "0.5rem", fontSize: "0.76rem", color: "#0369a1", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.35rem" }}>
                              <span>📄 Official Reference:</span>
                              <span style={{ backgroundColor: "#e0f2fe", padding: "0.1rem 0.4rem", borderRadius: "0.25rem" }}>
                                {act.documentRef}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>

            {/* ---------------------------------------------------------------- */}
            {/* RECORD ACTION MODAL POPUP                                       */}
            {/* ---------------------------------------------------------------- */}
            {showLogModal && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 9999,
                  padding: "1rem",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "0.75rem",
                    maxWidth: 580,
                    width: "100%",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "1.25rem 1.5rem",
                      backgroundColor: "var(--color-primary, #0369a1)",
                      color: "#ffffff",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.1rem" }}>🛡️ Record Barangay Action / Intervention</h3>
                      <div style={{ fontSize: "0.8rem", opacity: 0.9, marginTop: "0.2rem" }}>
                        Docket: {entry.entryNo} &bull; {entry.location}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLogModal(false)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ffffff",
                        fontSize: "1.25rem",
                        cursor: "pointer",
                        lineHeight: 1,
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleRecordAction} style={{ padding: "1.5rem" }}>
                    {errorMsg && (
                      <div style={{ marginBottom: "1rem" }}>
                        <Alert tone="danger">{errorMsg}</Alert>
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <Field label="Action Taken / Intervention Title" required>
                        <input
                          type="text"
                          className="cbms-input"
                          list="action-suggestions"
                          placeholder="e.g., Tanod Mobile Patrol Dispatched / Summons Issued / BPO Issued"
                          value={actionTitle}
                          onChange={(e) => setActionTitle(e.target.value)}
                          required
                        />
                        <datalist id="action-suggestions">
                          <option value="Initial Intake & Sworn Narrative Recorded" />
                          <option value="Tanod Mobile Patrol Unit Dispatched" />
                          <option value="Ocular Inspection & Purok Validation" />
                          <option value="Summons / Notice of Hearing Issued (KP Form 7)" />
                          <option value="Barangay Protection Order (BPO) Issued" />
                          <option value="Medical Examination Referral Issued" />
                          <option value="DSWD / CSWDO Case Endorsement" />
                          <option value="Police Endorsement & Evidence Transmittal" />
                          <option value="Verbal Warning & Voluntary Compliance" />
                          <option value="Amicable Settlement Reached (KP-16)" />
                          <option value="Case Closed & Archived" />
                        </datalist>
                      </Field>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <Field label="Acting Officer Name" required>
                          <input
                            type="text"
                            className="cbms-input"
                            value={officerName}
                            onChange={(e) => setOfficerName(e.target.value)}
                            required
                          />
                        </Field>

                        <Field label="Officer Role / Department" required>
                          <input
                            type="text"
                            className="cbms-input"
                            value={officerRole}
                            onChange={(e) => setOfficerRole(e.target.value)}
                            required
                          />
                        </Field>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <Field label="Resulting Status">
                          <select
                            className="cbms-input"
                            value={statusAfter}
                            onChange={(e) => setStatusAfter(e.target.value)}
                          >
                            <option value="active">Active / Open</option>
                            <option value="in_progress">In Progress / Investigating</option>
                            <option value="under_mediation">Under Mediation (KP)</option>
                            <option value="bpo_issued">Barangay Protection Order (BPO) Issued</option>
                            <option value="referred_pnp">Referred to PNP</option>
                            <option value="endorsed">Endorsed to CSWDO / External Agency</option>
                            <option value="resolved">Resolved / Closed</option>
                          </select>
                        </Field>

                        <Field label="Official Document Reference (Optional)">
                          <input
                            type="text"
                            className="cbms-input"
                            placeholder="e.g. KP Form 7, BPO #004, CCTV #031"
                            value={documentRef}
                            onChange={(e) => setDocumentRef(e.target.value)}
                          />
                        </Field>
                      </div>

                      <Field label="Operational Notes & Actions Performed" required>
                        <textarea
                          className="cbms-input"
                          rows={4}
                          placeholder="Describe the specific steps taken, findings during inspection, response of parties, or terms agreed upon..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          required
                        />
                      </Field>
                    </div>

                    <div
                      style={{
                        marginTop: "1.5rem",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "0.75rem",
                      }}
                    >
                      <button
                        type="button"
                        className="cbms-btn"
                        onClick={() => setShowLogModal(false)}
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="cbms-btn cbms-btn--primary"
                        disabled={submitting}
                      >
                        {submitting ? "Saving Action..." : "💾 Save & Update History"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyNote>Blotter entry not found.</EmptyNote>
        )}
      </Async>
    </>
  );
}

