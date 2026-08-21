"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ApiError, post, useApi } from "@cbms/api-client";
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
import { KP_ADVANCE_STAGES } from "../../../../lib/labels";
import type { KpCase } from "../../../../lib/types";

export default function KpCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { can, reloadDashboard } = useConsole();
  const id = String((params as Record<string, string | string[]>)?.id ?? "");

  const res = useApi<KpCase>(id ? `/kp/cases/${id}` : null);
  const c = res.data;

  const [stage, setStage] = React.useState("mediation");
  const [settlementTerms, setSettlementTerms] = React.useState("");
  const [cfaReason, setCfaReason] = React.useState("");
  const [hearingAt, setHearingAt] = React.useState("");
  const [hearingStage, setHearingStage] = React.useState("mediation");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const mayAdvance = can("kp:approve");
  const mayEncode = can("kp:encode");

  async function advance(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await post(`/kp/cases/${id}/advance`, {
        stage,
        ...(stage === "settled" && settlementTerms.trim()
          ? { settlementTerms: settlementTerms.trim() }
          : {}),
        ...(stage === "cfa_issued" && cfaReason.trim() ? { cfaReason: cfaReason.trim() } : {}),
      });
      setOk(`Case moved to ${titleize(stage)}. The corresponding KP form was generated.`);
      setSettlementTerms("");
      setCfaReason("");
      res.reload();
      reloadDashboard();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not advance the case.");
    } finally {
      setBusy(false);
    }
  }

  async function scheduleHearing(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await post(`/kp/cases/${id}/hearings`, {
        scheduledAt: new Date(hearingAt).toISOString(),
        stage: hearingStage,
      });
      setOk("Hearing scheduled.");
      setHearingAt("");
      res.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not schedule the hearing.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title={c ? c.caseNo : "KP case"}
        subtitle={c?.isConfidential ? "[RESTRICTED] VAWC/VAC case" : c?.subject}
        breadcrumb="Justice & Safety / KP Cases"
        parity="KPISBH"
        actions={
          <button type="button" className="cbms-btn" onClick={() => router.push("/kp")}>
            ← Back to docket
          </button>
        }
      />

      <ActionResult error={error} success={ok} />

      <Async loading={res.loading} error={res.error}>
        {!c ? (
          <EmptyNote>Case not found, or restricted from your role.</EmptyNote>
        ) : (
          <div className="adm-stack">
            {c.isConfidential && (
              <Alert tone="warn">
                🔒 This is a restricted VAWC/VAC record. Access is logged in the audit trail and is
                limited to the VAW desk and the Punong Barangay.
              </Alert>
            )}

            <div className="cbms-grid-2">
              <Panel title="Case">
                <KeyValue
                  items={[
                    ["Case number", c.caseNo],
                    ["Subject", c.subject],
                    ["Stage", <StatusChip key="s" status={c.stage} />],
                    ["Filed", date(c.filedAt)],
                    [
                      "Statutory deadline",
                      <DeadlineCell
                        key="d"
                        dueAt={c.deadline?.dueAt}
                        daysRemaining={c.deadline?.daysRemaining}
                        breached={c.deadline?.breached}
                      />,
                    ],
                    ["Closed", c.closedAt ? date(c.closedAt) : "—"],
                    ["Settlement terms", c.settlementTerms ?? "—"],
                    ["CFA reason", c.cfaReason ?? "—"],
                    [
                      "Pangkat members",
                      c.pangkatMembers?.length ? c.pangkatMembers.join(", ") : "Not yet constituted",
                    ],
                    [
                      "Linked blotter",
                      c.blotter ? `${c.blotter.entryNo} · ${titleize(c.blotter.category)}` : "—",
                    ],
                  ]}
                />
                <div style={{ marginTop: 14 }}>
                  <div className="cbms-label">Description</div>
                  <p style={{ fontSize: 13.5, whiteSpace: "pre-wrap", margin: 0 }}>
                    {c.description ?? "—"}
                  </p>
                </div>
              </Panel>

              <div className="adm-stack">
                <Panel title="RA 7160 §410 — the clock">
                  <ol style={{ fontSize: 13, paddingLeft: 18, margin: 0, lineHeight: 1.75 }}>
                    <li>
                      <strong>Mediation</strong> — the Punong Barangay must mediate within{" "}
                      <strong>15 days</strong> of filing.
                    </li>
                    <li>
                      <strong>Conciliation</strong> — if mediation fails, the Pangkat ng
                      Tagapagkasundo has a further <strong>15 days</strong>.
                    </li>
                    <li>
                      <strong>Extension</strong> — the Pangkat may extend by a final{" "}
                      <strong>15 days</strong> for a clear reason.
                    </li>
                    <li>
                      <strong>Outcome</strong> — an amicable settlement, or a{" "}
                      <strong>Certificate to File Action</strong> that lets the parties go to court.
                    </li>
                  </ol>
                  <div className="adm-kpi-note">
                    Missing the period does not void the case, but it exposes the barangay in any
                    subsequent court referral — the console keeps the countdown visible.
                  </div>
                </Panel>

                <Panel title="Advance the case">
                  {!mayAdvance ? (
                    <EmptyNote>Your role may view this docket but not advance stages.</EmptyNote>
                  ) : (
                    <form onSubmit={advance}>
                      <Field label="Move to stage">
                        <select
                          className="cbms-select"
                          value={stage}
                          onChange={(e) => setStage(e.target.value)}
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
                          label="Settlement terms"
                          hint="Recorded on the Amicable Settlement form generated automatically."
                        >
                          <textarea
                            className="cbms-textarea"
                            value={settlementTerms}
                            onChange={(e) => setSettlementTerms(e.target.value)}
                          />
                        </Field>
                      )}
                      {stage === "cfa_issued" && (
                        <Field label="Reason for the Certificate to File Action">
                          <textarea
                            className="cbms-textarea"
                            value={cfaReason}
                            onChange={(e) => setCfaReason(e.target.value)}
                          />
                        </Field>
                      )}
                      <Button type="submit" variant="primary" disabled={busy}>
                        {busy ? "Working…" : "Advance stage"}
                      </Button>
                    </form>
                  )}
                </Panel>
              </div>
            </div>

            <div className="cbms-grid-2">
              <Panel title="Parties" padded={false}>
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

              <Panel title="Documents" padded={false}>
                <DataTable
                  columns={[
                    { key: "kind", header: "Form", render: (d) => titleize(d.kind) },
                    { key: "issuedAt", header: "Issued", render: (d) => dateTime(d.issuedAt) },
                  ]}
                  rows={c.documents ?? []}
                  empty="No KP forms generated yet."
                />
              </Panel>
            </div>

            <Panel
              title="Hearings"
              actions={
                mayEncode ? (
                  <form onSubmit={scheduleHearing} className="adm-row">
                    <input
                      className="cbms-input"
                      type="datetime-local"
                      value={hearingAt}
                      onChange={(e) => setHearingAt(e.target.value)}
                      required
                    />
                    <select
                      className="cbms-select"
                      value={hearingStage}
                      onChange={(e) => setHearingStage(e.target.value)}
                    >
                      <option value="mediation">Mediation</option>
                      <option value="conciliation">Conciliation</option>
                    </select>
                    <Button type="submit" size="sm" disabled={busy || !hearingAt}>
                      Schedule
                    </Button>
                  </form>
                ) : undefined
              }
            >
              {(c.hearings ?? []).length === 0 ? (
                <EmptyNote>No hearing has been scheduled.</EmptyNote>
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
        )}
      </Async>
    </>
  );
}
