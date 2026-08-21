"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ApiError, post, qs, useApi } from "@cbms/api-client";
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
  num,
  titleize,
} from "@cbms/ui";
import { ActionResult, Async, DeadlineCell } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import { KP_STAGES } from "../../../lib/labels";
import type { Bag, KpAtRisk, KpCase, Paged } from "../../../lib/types";

export default function KpPage() {
  const router = useRouter();
  const { can, reloadDashboard } = useConsole();
  const [stage, setStage] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [showNew, setShowNew] = React.useState(false);
  const pageSize = 25;

  const list = useApi<Paged<KpCase>>(`/kp/cases${qs({ stage, page, pageSize })}`);
  const deadlines = useApi<Bag<KpAtRisk> & { breached: number }>("/kp/deadlines");

  const [form, setForm] = React.useState({
    subject: "",
    description: "",
    respondentName: "",
    isConfidential: false,
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const rows = list.data?.items ?? [];
  const open = rows.filter((c) => ["filed", "mediation", "conciliation"].includes(c.stage)).length;
  const breached = (deadlines.data?.items ?? []).filter((d) => d.breached).length;

  async function fileCase(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const created = await post<KpCase>("/kp/cases", {
        subject: form.subject.trim(),
        description: form.description.trim(),
        ...(form.respondentName.trim() ? { respondentName: form.respondentName.trim() } : {}),
        isConfidential: form.isConfidential,
      });
      setOk(`Case ${created.caseNo} filed. The 15-day mediation clock started today.`);
      setForm({ subject: "", description: "", respondentName: "", isConfidential: false });
      setShowNew(false);
      list.reload();
      deadlines.reload();
      reloadDashboard();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not file the case.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title="Katarungang Pambarangay"
        subtitle="Case docket with the statutory clock of RA 7160 §410: 15 days mediation before the Punong Barangay, then 15 days conciliation by the Pangkat (extendable by 15)."
        breadcrumb="Justice & Safety"
        parity="KPISBH"
        actions={
          can("kp:encode") ? (
            <Button variant="primary" onClick={() => setShowNew((v) => !v)}>
              {showNew ? "Close" : "+ File a case"}
            </Button>
          ) : undefined
        }
      />

      <ActionResult error={error} success={ok} />

      <StatGrid>
        <StatCard label="Cases on this page" value={num(list.data?.total)} icon="⚖️" />
        <StatCard label="Open (clock running)" value={num(open)} icon="⏱️" tone="gold" />
        <StatCard
          label="Within 5 days of deadline"
          value={num(deadlines.data?.items?.length)}
          icon="⚠️"
          tone="gold"
        />
        <StatCard
          label="Breached"
          value={num(breached)}
          icon="🚩"
          tone={breached ? "red" : "green"}
          hint="Past the statutory period"
        />
      </StatGrid>

      {showNew && (
        <>
          <Panel title="File a new KP case">
            <form onSubmit={fileCase}>
              <div className="adm-form-grid">
                <Field label="Subject">
                  <input
                    className="cbms-input"
                    value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    minLength={3}
                    required
                  />
                </Field>
                <Field label="Respondent (non-resident allowed)">
                  <input
                    className="cbms-input"
                    value={form.respondentName}
                    onChange={(e) => setForm((f) => ({ ...f, respondentName: e.target.value }))}
                  />
                </Field>
              </div>
              <Field label="Description" hint="Encrypted at rest. Minimum 10 characters.">
                <textarea
                  className="cbms-textarea"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  minLength={10}
                  required
                />
              </Field>
              {can("vawc:encode") && (
                <label className="adm-row" style={{ marginBottom: 12, fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={form.isConfidential}
                    onChange={(e) => setForm((f) => ({ ...f, isConfidential: e.target.checked }))}
                  />
                  Restricted (VAWC/VAC) — visible only to the VAW desk and the Punong Barangay
                </label>
              )}
              <Button type="submit" variant="primary" disabled={busy}>
                {busy ? "Filing…" : "File case"}
              </Button>
            </form>
          </Panel>
          <div style={{ height: 16 }} />
        </>
      )}

      {breached > 0 && (
        <Alert tone="danger">
          {breached} case(s) have passed the RA 7160 §410 deadline. The Lupon must issue a
          Certificate to File Action or document the delay.
        </Alert>
      )}

      <Panel padded={false}>
        <Toolbar>
          <select
            className="cbms-select"
            value={stage}
            onChange={(e) => {
              setStage(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All stages</option>
            {KP_STAGES.map((s) => (
              <option key={s} value={s}>
                {titleize(s)}
              </option>
            ))}
          </select>
          <div className="cbms-toolbar__spacer" />
          <span className="adm-muted">{num(list.data?.total)} case(s)</span>
        </Toolbar>

        <Async loading={list.loading} error={list.error}>
          <DataTable
            columns={[
              {
                key: "caseNo",
                header: "Case",
                render: (c) => (
                  <>
                    <div className="cbms-table__primary">
                      {c.caseNo} {c.isConfidential && "🔒"}
                    </div>
                    <div className="cbms-table__muted">
                      {c.isConfidential ? "[RESTRICTED]" : c.subject}
                    </div>
                  </>
                ),
              },
              {
                key: "parties",
                header: "Parties",
                render: (c) => (
                  <span className="adm-chiprow">
                    {(c.parties ?? []).map((p) => (
                      <Chip key={p.id} tone={p.role === "complainant" ? "blue" : "gray"}>
                        {p.inhabitant
                          ? `${p.inhabitant.firstName} ${p.inhabitant.lastName}`
                          : (p.nameOverride ?? "—")}
                      </Chip>
                    ))}
                    {(c.parties ?? []).length === 0 && <span className="cbms-table__muted">—</span>}
                  </span>
                ),
              },
              { key: "stage", header: "Stage", render: (c) => <StatusChip status={c.stage} /> },
              { key: "filedAt", header: "Filed", render: (c) => date(c.filedAt) },
              {
                key: "deadline",
                header: "Statutory deadline",
                render: (c) => (
                  <DeadlineCell
                    dueAt={c.deadline?.dueAt}
                    daysRemaining={c.deadline?.daysRemaining}
                    breached={c.deadline?.breached}
                  />
                ),
              },
              {
                key: "hearings",
                header: "Hearings",
                align: "right",
                render: (c) => num(c._count?.hearings ?? c.hearings?.length ?? 0),
              },
            ]}
            rows={rows}
            empty="No KP cases match this filter."
            onRowClick={(c) => router.push(`/kp/${c.id}`)}
          />
        </Async>

        <Pagination page={page} pageSize={pageSize} total={list.data?.total ?? 0} onPage={setPage} />
      </Panel>
    </>
  );
}
