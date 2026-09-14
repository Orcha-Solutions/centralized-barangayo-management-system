"use client";

import * as React from "react";
import { ApiError, del, patch, post, qs, useApi } from "@cbms/api-client";
import {
  Alert,
  Button,
  Chip,
  DataTable,
  Field,
  PageHead,
  Pagination,
  Panel,
  StatCard,
  StatGrid,
  StatusChip,
  Toolbar,
  date,
  dateTime,
  num,
  relative,
  titleize,
} from "@cbms/ui";
import { ActionResult, Async } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import { CONCERN_CATEGORIES, CONCERN_STATUSES } from "../../../lib/labels";
import { downloadText, toCsv } from "../../../lib/download";
import type { Concern, Paged } from "../../../lib/types";

const OPEN_STATUSES = ["submitted", "acknowledged", "in_progress"];

const PUROKS = [
  "Purok 1",
  "Purok 2",
  "Purok 3",
  "Purok 4",
  "Purok 5",
  "Purok 6",
  "Purok 7",
];

interface NewConcernForm {
  category: string;
  purok: string;
  description: string;
  reporterName: string;
  reporterContact: string;
}

const EMPTY_CONCERN_FORM: NewConcernForm = {
  category: "streetlight",
  purok: "Purok 1",
  description: "",
  reporterName: "",
  reporterContact: "",
};

/** Next status in the handling flow, or null when the concern is closed. */
function nextStatus(status: string): { value: string; label: string } | null {
  switch (status) {
    case "submitted":
      return { value: "acknowledged", label: "👉 Acknowledge" };
    case "acknowledged":
      return { value: "in_progress", label: "🚨 Deploy Tanod / Start Work" };
    case "in_progress":
      return { value: "resolved", label: "✅ Resolve Concern" };
    default:
      return null;
  }
}

export default function ConcernsPage() {
  const { can } = useConsole();
  // Front-line staff (Secretary, BHW, Tanod) hold concerns:encode; the Punong
  // Barangay holds concerns:approve. Either may move a concern along.
  const mayEncode = can("concerns:encode") || can("concerns:approve");

  const [q, setQ] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [category, setCategory] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 25;

  const list = useApi<Paged<Concern>>(
    `/concerns${qs({ q: search, status, category, page, pageSize })}`,
  );

  // Content Drawers State
  const [selectedConcern, setSelectedConcern] = React.useState<Concern | null>(null);
  const [showNewDrawer, setShowNewDrawer] = React.useState(false);

  // Resolution and form states
  const [newForm, setNewForm] = React.useState<NewConcernForm>(EMPTY_CONCERN_FORM);
  const [resolutionNote, setResolutionNote] = React.useState("");
  const [isRejecting, setIsRejecting] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");

  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const rows = list.data?.items ?? [];
  const openCount = rows.filter((c) => OPEN_STATUSES.includes(c.status)).length;
  const breached = rows.filter((c) => c.slaBreached).length;
  const resolved = rows.filter((c) => c.status === "resolved").length;

  function openDrawer(c: Concern) {
    setSelectedConcern(c);
    setResolutionNote(c.resolutionNote || "");
    setIsRejecting(false);
    setRejectReason("");
    setError(null);
    setOk(null);
  }

  async function advance(c: Concern, to: string, note?: string) {
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const updated = await patch<Concern>(`/concerns/${c.id}`, {
        status: to,
        ...(note ? { resolutionNote: note } : {}),
      });
      setOk(`${c.referenceNo} advanced to “${titleize(to)}”.`);
      setSelectedConcern(updated);
      setResolutionNote("");
      setIsRejecting(false);
      list.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not update the concern.");
    } finally {
      setBusy(false);
    }
  }

  async function createConcern(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const created = await post<Concern>("/concerns", {
        category: newForm.category,
        purok: newForm.purok,
        description: newForm.description.trim(),
        ...(newForm.reporterName.trim()
          ? {
              inhabitant: {
                firstName: newForm.reporterName.trim().split(" ")[0] || "Resident",
                lastName: newForm.reporterName.trim().split(" ").slice(1).join(" ") || "",
                contactNo: newForm.reporterContact.trim() || undefined,
              },
            }
          : {}),
      });
      setOk(`Concern filed with Reference #${created.referenceNo} (3-day SLA clock started).`);
      setNewForm(EMPTY_CONCERN_FORM);
      setShowNewDrawer(false);
      list.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not log the concern.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteConcern(id: string) {
    if (!window.confirm("Are you sure you want to remove this concern record?")) {
      return;
    }
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await del(`/concerns/${id}`);
      setOk("Concern record removed.");
      setSelectedConcern(null);
      list.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not delete concern.");
    } finally {
      setBusy(false);
    }
  }

  function exportCsv() {
    downloadText(
      toCsv(
        [
          "Reference No",
          "Category",
          "Description",
          "Purok",
          "Reported By",
          "Contact",
          "Status",
          "Filed At",
          "SLA Due",
          "SLA Breached",
          "Resolution Note",
        ],
        rows.map((c) => [
          c.referenceNo,
          titleize(c.category),
          c.description,
          c.purok ?? "",
          c.inhabitant ? `${c.inhabitant.firstName} ${c.inhabitant.lastName}` : "Anonymous",
          (c as any).inhabitant?.contactNo ?? "",
          titleize(c.status),
          c.createdAt,
          c.slaDueAt ?? "",
          c.slaBreached ? "Yes" : "No",
          c.resolutionNote ?? "",
        ]),
      ),
      `concerns-311-${new Date().toISOString().slice(0, 10)}.csv`,
      "text/csv;charset=utf-8;",
    );
  }

  return (
    <>
      <PageHead
        title="Report a Concern (311)"
        subtitle="Resident-reported issues — streetlights, flooding, garbage, potholes, noise, and safety hazards. Each one carries a 3-working-day service clock under the Ease of Doing Business Act (RA 11032)."
        breadcrumb="Services"
        exclusive
      />

      <ActionResult error={error} success={ok} />

      <StatGrid>
        <StatCard
          label="Open on this page"
          value={num(openCount)}
          hint="Submitted, acknowledged or in progress"
          icon="📣"
        />
        <StatCard
          label="SLA breached"
          value={num(breached)}
          hint="Past the RA 11032 clock"
          icon="⏰"
          tone={breached > 0 ? "red" : "green"}
        />
        <StatCard
          label="Resolved on this page"
          value={num(resolved)}
          hint="Closed with a resolution note"
          icon="✅"
          tone="green"
        />
        <StatCard
          label="Total matching"
          value={num(list.data?.total)}
          hint="Across every page of this filter"
          icon="🗂"
        />
      </StatGrid>

      {breached > 0 && (
        <Alert tone="warn">
          <strong>{breached}</strong> concern{breached === 1 ? "" : "s"} on this page{" "}
          {breached === 1 ? "has" : "have"} passed the 3-working-day response window. These are
          evaluated in the DILG Client Satisfaction Measurement (CSM) audit.
        </Alert>
      )}

      <Panel padded={false}>
        <Toolbar>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setSearch(q.trim());
            }}
            style={{ display: "flex", gap: 8 }}
          >
            <input
              className="cbms-input cbms-input--search"
              placeholder="Search reference, description, purok, or reporter…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Button type="submit">Search</Button>
          </form>
          <select
            className="cbms-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            {CONCERN_STATUSES.map((s) => (
              <option key={s} value={s}>
                {titleize(s)}
              </option>
            ))}
          </select>
          <select
            className="cbms-select"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All categories</option>
            {CONCERN_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {titleize(c)}
              </option>
            ))}
          </select>
          <div className="cbms-toolbar__spacer" />
          <span className="adm-muted">{num(list.data?.total)} concern(s)</span>
          <Button onClick={exportCsv} disabled={rows.length === 0}>
            ⬇ Export CSV
          </Button>
          {mayEncode && (
            <Button
              variant="primary"
              onClick={() => {
                setShowNewDrawer(true);
                setSelectedConcern(null);
                setNewForm(EMPTY_CONCERN_FORM);
              }}
            >
              + File Citizen Concern (311)
            </Button>
          )}
        </Toolbar>

        <Async loading={list.loading} error={list.error}>
          <DataTable
            onRowClick={(c) => openDrawer(c)}
            columns={[
              {
                key: "referenceNo",
                header: "Reference",
                render: (c) => (
                  <span className="adm-chiprow">
                    <span className="cbms-table__primary" style={{ fontWeight: 600 }}>{c.referenceNo}</span>
                    {c.slaBreached && <Chip tone="red">SLA breached</Chip>}
                  </span>
                ),
              },
              {
                key: "category",
                header: "Category",
                render: (c) => <StatusChip status={c.category} />,
              },
              {
                key: "description",
                header: "Concern",
                render: (c) => (
                  <span className="cbms-table__muted">
                    {c.description.length > 70 ? `${c.description.slice(0, 70)}…` : c.description}
                  </span>
                ),
              },
              {
                key: "purok",
                header: "Purok",
                render: (c) => c.purok ?? <span className="cbms-table__muted">—</span>,
              },
              {
                key: "reporter",
                header: "Reported by",
                render: (c) =>
                  c.inhabitant ? (
                    <span style={{ fontWeight: 500 }}>{`${c.inhabitant.firstName} ${c.inhabitant.lastName}`}</span>
                  ) : (
                    <span className="cbms-table__muted">Anonymous</span>
                  ),
              },
              {
                key: "createdAt",
                header: "Filed",
                render: (c) => (
                  <span title={dateTime(c.createdAt)}>{relative(c.createdAt)}</span>
                ),
              },
              {
                key: "sla",
                header: "Response clock",
                render: (c) => {
                  if (c.status === "resolved") {
                    return <Chip tone="green">Closed {relative(c.resolvedAt)}</Chip>;
                  }
                  if (c.status === "rejected") return <Chip tone="gray">Rejected</Chip>;
                  if (!c.slaDueAt) return <span className="cbms-table__muted">—</span>;
                  const days = Math.ceil(
                    (new Date(c.slaDueAt).getTime() - Date.now()) / 86_400_000,
                  );
                  return c.slaBreached ? (
                    <Chip tone="red">Breached by {Math.abs(days)}d</Chip>
                  ) : (
                    <Chip tone={days <= 1 ? "gold" : "green"}>{days}d left</Chip>
                  );
                },
              },
              {
                key: "status",
                header: "Status",
                render: (c) => <StatusChip status={c.status} />,
              },
              {
                key: "action",
                header: "Action",
                render: (c) => (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDrawer(c);
                    }}
                  >
                    View
                  </Button>
                ),
              },
            ]}
            rows={rows}
            empty="No concerns match this filter."
          />
        </Async>

        <Pagination page={page} pageSize={pageSize} total={list.data?.total ?? 0} onPage={setPage} />
      </Panel>

      {/* ========================================================================= */}
      {/* 1. CONTENT DRAWER: VIEW & HANDLE CONCERN (APPEARING ON THE RIGHT)         */}
      {/* ========================================================================= */}
      {selectedConcern && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            zIndex: 1500,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setSelectedConcern(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "580px",
              backgroundColor: "var(--cbms-surface, #ffffff)",
              height: "100%",
              boxShadow: "-6px 0 25px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--cbms-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.02)",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--cbms-navy)" }}>
                  📢 Concern {selectedConcern.referenceNo}
                </h3>
                <span style={{ fontSize: "0.8rem", color: "var(--cbms-muted)" }}>
                  Category: {titleize(selectedConcern.category)} · {selectedConcern.purok || "General Area"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedConcern(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "var(--cbms-muted)",
                  padding: "4px 8px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Status & SLA Badges */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <StatusChip status={selectedConcern.status} />
                <StatusChip status={selectedConcern.category} />
                {selectedConcern.status === "resolved" ? (
                  <Chip tone="green">✅ Resolved {relative(selectedConcern.resolvedAt)}</Chip>
                ) : selectedConcern.slaBreached ? (
                  <Chip tone="red">⏰ SLA Breached</Chip>
                ) : (
                  <Chip tone="blue">⏱️ 3-Day SLA Active</Chip>
                )}
              </div>

              {/* SLA Response Clock Card */}
              <div
                style={{
                  border: "1px solid var(--cbms-border)",
                  borderRadius: "8px",
                  padding: "14px 16px",
                  backgroundColor:
                    selectedConcern.status === "resolved"
                      ? "rgba(16, 126, 62, 0.05)"
                      : selectedConcern.slaBreached
                      ? "rgba(239, 68, 68, 0.05)"
                      : "rgba(10, 37, 64, 0.03)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--cbms-navy)", fontWeight: 700 }}>
                    Ease of Doing Business Act (RA 11032) Service Clock
                  </span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                    {selectedConcern.slaDueAt ? `Due: ${date(selectedConcern.slaDueAt)}` : "No Clock Set"}
                  </span>
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: selectedConcern.slaBreached ? "var(--cbms-red)" : "var(--cbms-fg)" }}>
                  {selectedConcern.status === "resolved"
                    ? `Resolved within statutory response window on ${dateTime(selectedConcern.resolvedAt)}.`
                    : selectedConcern.slaBreached
                    ? `⚠️ Standard 3-working-day response window was breached. Requires priority response.`
                    : `Active 3-working-day response clock running.`}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--cbms-muted)", marginTop: 4 }}>
                  All citizen reports are tracked and reported in the DILG SGLGB Citizen Satisfaction Measurement.
                </div>
              </div>

              {/* Report Description */}
              <div
                style={{
                  border: "1px solid var(--cbms-border)",
                  borderRadius: "8px",
                  padding: "16px",
                  backgroundColor: "var(--cbms-surface)",
                }}
              >
                <div style={{ fontSize: "0.75rem", color: "var(--cbms-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>
                  Resident Incident Description
                </div>
                <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.5, color: "var(--cbms-fg)" }}>
                  “{selectedConcern.description}”
                </p>
              </div>

              {/* Details Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  padding: "14px",
                  backgroundColor: "var(--cbms-bg, #f8f9fa)",
                  borderRadius: "8px",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--cbms-muted)" }}>Reported By</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                    {selectedConcern.inhabitant
                      ? `${selectedConcern.inhabitant.firstName} ${selectedConcern.inhabitant.lastName}`
                      : "Anonymous Resident"}
                  </div>
                  {(selectedConcern as any).inhabitant?.contactNo && (
                    <div style={{ fontSize: "0.8rem", color: "var(--cbms-muted)" }}>
                      📞 {(selectedConcern as any).inhabitant.contactNo}
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--cbms-muted)" }}>Location / Purok</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                    {selectedConcern.purok || "Barangay Barangka"}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--cbms-muted)" }}>
                    Zone Security Jurisdiction
                  </div>
                </div>
              </div>

              {/* Workflow Stepper & Handling Details */}
              <div
                style={{
                  border: "1px solid var(--cbms-border)",
                  borderRadius: "8px",
                  padding: "16px",
                }}
              >
                <div style={{ fontSize: "0.75rem", color: "var(--cbms-navy)", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>
                  Tanod & Desk Officer Response Workflow
                </div>

                {/* Visual Steps */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 16 }}>
                  <div style={{ textAlign: "center", padding: "6px 4px", borderRadius: 4, backgroundColor: "rgba(10, 37, 64, 0.08)", fontSize: "0.7rem", fontWeight: 600 }}>
                    1. Filed ✅
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "6px 4px",
                      borderRadius: 4,
                      backgroundColor:
                        selectedConcern.status !== "submitted"
                          ? "rgba(10, 37, 64, 0.08)"
                          : "rgba(0, 0, 0, 0.03)",
                      fontSize: "0.7rem",
                      fontWeight: selectedConcern.status !== "submitted" ? 600 : 400,
                    }}
                  >
                    2. Acknowledged {selectedConcern.status !== "submitted" ? "✅" : "⏳"}
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "6px 4px",
                      borderRadius: 4,
                      backgroundColor:
                        selectedConcern.status === "in_progress" || selectedConcern.status === "resolved"
                          ? "rgba(10, 37, 64, 0.08)"
                          : "rgba(0, 0, 0, 0.03)",
                      fontSize: "0.7rem",
                      fontWeight:
                        selectedConcern.status === "in_progress" || selectedConcern.status === "resolved"
                          ? 600
                          : 400,
                    }}
                  >
                    3. Tanod Action {selectedConcern.status === "in_progress" || selectedConcern.status === "resolved" ? "✅" : "⏳"}
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "6px 4px",
                      borderRadius: 4,
                      backgroundColor:
                        selectedConcern.status === "resolved" ? "rgba(16, 126, 62, 0.15)" : "rgba(0, 0, 0, 0.03)",
                      color: selectedConcern.status === "resolved" ? "var(--cbms-green)" : undefined,
                      fontSize: "0.7rem",
                      fontWeight: selectedConcern.status === "resolved" ? 700 : 400,
                    }}
                  >
                    4. Resolved {selectedConcern.status === "resolved" ? "✅" : "⏳"}
                  </div>
                </div>

                {/* If Resolved, show resolution note */}
                {selectedConcern.status === "resolved" && (
                  <div
                    style={{
                      backgroundColor: "rgba(16, 126, 62, 0.08)",
                      border: "1px solid rgba(16, 126, 62, 0.2)",
                      borderRadius: 6,
                      padding: "12px 14px",
                    }}
                  >
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--cbms-green)", marginBottom: 4 }}>
                      Official Resolution Record (Visible to Resident):
                    </div>
                    <div style={{ fontSize: "0.9rem", lineHeight: 1.4, color: "var(--cbms-fg)" }}>
                      {selectedConcern.resolutionNote || "Issue resolved by Barangay Tanod and maintenance personnel."}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--cbms-muted)", marginTop: 6 }}>
                      Closed {dateTime(selectedConcern.resolvedAt)}
                    </div>
                  </div>
                )}

                {/* If In Progress, provide resolution textarea directly */}
                {mayEncode && selectedConcern.status === "in_progress" && (
                  <div>
                    <Field
                      label="Plain-Language Resolution Note"
                      hint="Describe the action taken by the Tanod or maintenance team — this note will be sent directly to the resident."
                    >
                      <textarea
                        className="cbms-textarea"
                        rows={3}
                        value={resolutionNote}
                        onChange={(e) => setResolutionNote(e.target.value)}
                        placeholder="Halimbawa: Nakausap at pinaalalahanan ng Tanod Mobile Patrol ang may-ari ng videoke; tumahimik na ang lugar."
                      />
                    </Field>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <Button
                        variant="primary"
                        disabled={busy || resolutionNote.trim().length < 3}
                        onClick={() => advance(selectedConcern, "resolved", resolutionNote.trim())}
                      >
                        {busy ? "Saving…" : "✅ Mark Resolved & Notify Resident"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Rejection Mode */}
                {mayEncode && isRejecting && (
                  <div style={{ marginTop: 12, padding: 12, border: "1px solid var(--cbms-border)", borderRadius: 6 }}>
                    <Field label="Rejection Reason" hint="Specify why this report is invalid or non-actionable.">
                      <input
                        className="cbms-input"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Duplicate report, outside barangay territorial jurisdiction, etc."
                      />
                    </Field>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <Button
                        variant="primary"
                        disabled={busy || rejectReason.trim().length < 3}
                        onClick={() => advance(selectedConcern, "rejected", rejectReason.trim())}
                      >
                        Confirm Rejection
                      </Button>
                      <Button onClick={() => setIsRejecting(false)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Filing metadata */}
              <div style={{ fontSize: "0.75rem", color: "var(--cbms-muted)", marginTop: "auto", paddingTop: 8, borderTop: "1px solid var(--cbms-border)" }}>
                Filed on {dateTime(selectedConcern.createdAt)} · Reference {selectedConcern.referenceNo}
              </div>
            </div>

            {/* Footer Actions */}
            <div
              style={{
                padding: "16px 20px",
                borderTop: "1px solid var(--cbms-border)",
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                backgroundColor: "rgba(0,0,0,0.02)",
              }}
            >
              {mayEncode && selectedConcern.status !== "resolved" && selectedConcern.status !== "rejected" ? (
                <div style={{ display: "flex", gap: 8 }}>
                  {selectedConcern.status === "submitted" && (
                    <Button variant="primary" disabled={busy} onClick={() => advance(selectedConcern, "acknowledged")}>
                      👉 Acknowledge Concern
                    </Button>
                  )}
                  {selectedConcern.status === "acknowledged" && (
                    <Button variant="primary" disabled={busy} onClick={() => advance(selectedConcern, "in_progress")}>
                      🚨 Deploy Tanod / Start Work
                    </Button>
                  )}
                  {!isRejecting && selectedConcern.status !== "in_progress" && (
                    <Button variant="default" onClick={() => setIsRejecting(true)}>
                      Reject…
                    </Button>
                  )}
                  <Button variant="danger" onClick={() => deleteConcern(selectedConcern.id)} disabled={busy}>
                    🗑️ Delete
                  </Button>
                </div>
              ) : (
                <div />
              )}
              <Button onClick={() => setSelectedConcern(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CONTENT DRAWER: FILE NEW CITIZEN CONCERN 311 (RIGHT DRAWER)           */}
      {/* ========================================================================= */}
      {showNewDrawer && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            zIndex: 1500,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setShowNewDrawer(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "560px",
              backgroundColor: "var(--cbms-surface, #ffffff)",
              height: "100%",
              boxShadow: "-6px 0 25px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--cbms-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.02)",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--cbms-navy)" }}>
                  + File Resident Concern (311)
                </h3>
                <span style={{ fontSize: "0.8rem", color: "var(--cbms-muted)" }}>
                  Desk Intake & Tanod Radio Incident Dispatch
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowNewDrawer(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "var(--cbms-muted)",
                  padding: "4px 8px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={createConcern} style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "auto" }}>
              <div style={{ padding: "20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Category">
                    <select
                      className="cbms-select"
                      value={newForm.category}
                      onChange={(e) => setNewForm((f) => ({ ...f, category: e.target.value }))}
                    >
                      {CONCERN_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {titleize(c)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Purok / Zone">
                    <select
                      className="cbms-select"
                      value={newForm.purok}
                      onChange={(e) => setNewForm((f) => ({ ...f, purok: e.target.value }))}
                    >
                      {PUROKS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Complainant / Reporter Name" hint="Leave blank if anonymous.">
                    <input
                      className="cbms-input"
                      value={newForm.reporterName}
                      onChange={(e) => setNewForm((f) => ({ ...f, reporterName: e.target.value }))}
                      placeholder="e.g. Maria Santos"
                    />
                  </Field>
                  <Field label="Contact Number" hint="Mobile phone for updates.">
                    <input
                      className="cbms-input"
                      value={newForm.reporterContact}
                      onChange={(e) => setNewForm((f) => ({ ...f, reporterContact: e.target.value }))}
                      placeholder="09XX-XXX-XXXX"
                    />
                  </Field>
                </div>

                <Field label="Incident / Concern Description" hint="Specific location details, landmarks, and community impact.">
                  <textarea
                    className="cbms-textarea"
                    rows={4}
                    value={newForm.description}
                    onChange={(e) => setNewForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Halimbawa: Pundidong ilaw sa poste malapit sa waiting shed ng Purok 2. Madilim tuwing gabi."
                    minLength={5}
                    required
                  />
                </Field>

                <div
                  style={{
                    backgroundColor: "rgba(10, 37, 64, 0.04)",
                    border: "1px solid var(--cbms-border)",
                    borderRadius: 6,
                    padding: "10px 12px",
                    fontSize: "0.8rem",
                    color: "var(--cbms-muted)",
                    lineHeight: 1.4,
                  }}
                >
                  ⏱️ <strong>Statutory 3-Day SLA:</strong> Upon recording, an automatic 3-working-day response countdown clock begins in compliance with the Ease of Doing Business Act (RA 11032).
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: "16px 20px",
                  borderTop: "1px solid var(--cbms-border)",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  backgroundColor: "rgba(0,0,0,0.02)",
                }}
              >
                <Button type="button" onClick={() => setShowNewDrawer(false)} disabled={busy}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={busy}>
                  {busy ? "Filing…" : "Log Citizen Concern"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
