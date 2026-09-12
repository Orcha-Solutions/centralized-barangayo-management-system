"use client";

import * as React from "react";
import { ApiError, post, useApi } from "@cbms/api-client";
import {
  Alert,
  Button,
  Chip,
  DataTable,
  Field,
  PageHead,
  Panel,
  StatCard,
  StatGrid,
  StatusChip,
  Toolbar,
  num,
  pesoAmount,
  titleize,
} from "@cbms/ui";
import { ActionResult, Async, EmptyNote, Progress } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import type { GadActivity, GadPlan, Paged } from "../../../lib/types";

/** The API also returns `actualOutput`, which the shared type does not carry yet. */
interface GadActivityRow extends GadActivity {
  actualOutput?: string | null;
}
interface GadPlanRow extends GadPlan {
  activities?: GadActivityRow[];
}

/** Statutory floor: at least 5% of the annual budget must be attributed to GAD. */
const GAD_FLOOR = 0.05;

export default function GadPage() {
  const { can } = useConsole();
  const mayEncode = can("gad:encode") || can("gad:create") || can("gad:edit");

  const [picked, setPicked] = React.useState<string>("");
  const [showNew, setShowNew] = React.useState(false);

  const plans = useApi<Paged<GadPlanRow>>("/gad/plans");
  const planList = plans.data?.items ?? [];
  const selectedId = picked || planList[0]?.id || "";
  // The list endpoint does not expand activities — the detail endpoint does.
  const detail = useApi<GadPlanRow>(selectedId ? `/gad/plans/${selectedId}` : null);

  const plan = detail.data ?? planList.find((p) => p.id === selectedId) ?? null;
  const activities = detail.data?.activities ?? plan?.activities ?? [];

  const totalBudget = Number(plan?.totalBudget ?? 0);
  const gadBudget = Number(plan?.gadBudget ?? 0);
  const share = totalBudget > 0 ? (gadBudget / totalBudget) * 100 : 0;
  const compliant = share >= GAD_FLOOR * 100;
  const required = totalBudget * GAD_FLOOR;
  const shortfall = Math.max(0, required - gadBudget);
  const spent = activities.reduce((sum, a) => sum + Number(a.actualSpend ?? 0), 0);
  const utilisation = gadBudget > 0 ? (spent / gadBudget) * 100 : 0;

  const thisYear = new Date().getFullYear();
  const [form, setForm] = React.useState({
    year: String(thisYear),
    totalBudget: "",
    gadBudget: "",
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const formTotal = Number(form.totalBudget || 0);
  const formGad = Number(form.gadBudget || 0);
  const formShare = formTotal > 0 ? (formGad / formTotal) * 100 : 0;
  const formShort = Math.max(0, formTotal * GAD_FLOOR - formGad);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const created = await post<GadPlanRow>("/gad/plans", {
        year: Number(form.year),
        totalBudget: formTotal,
        gadBudget: formGad,
      });
      setOk(
        `GAD plan for ${created.year} created — ${(
          (Number(created.gadBudget) / Number(created.totalBudget)) * 100 || 0
        ).toFixed(1)}% of the annual budget.`,
      );
      setForm({ year: String(thisYear), totalBudget: "", gadBudget: "" });
      setShowNew(false);
      setPicked(created.id);
      plans.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not create the GAD plan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title="Gender & Development Plan and Budget"
        subtitle="The GAD Plan and Budget (GPB) and its accomplishment report. At least 5% of the barangay's annual budget must be attributed to GAD — this page proves it."
        breadcrumb="Governance"
        parity="BGADPBMS"
        actions={
          mayEncode ? (
            <Button variant="primary" onClick={() => setShowNew((v) => !v)}>
              {showNew ? "Close" : "+ New plan"}
            </Button>
          ) : undefined
        }
      />

      <ActionResult error={error} success={ok} />

      <Async loading={plans.loading} error={plans.error}>
        {!plan ? (
          <Panel>
            <EmptyNote>
              No GAD plan has been prepared yet. Create one to start tracking the 5% floor.
            </EmptyNote>
          </Panel>
        ) : (
          <>
            <StatGrid>
              <StatCard
                label="Total barangay budget"
                value={pesoAmount(totalBudget)}
                icon="🏛️"
                hint={`Annual budget, FY ${plan.year}`}
              />
              <StatCard
                label="GAD budget"
                value={pesoAmount(gadBudget)}
                icon="⚖"
                hint={`Minimum required: ${pesoAmount(required)}`}
              />
              <StatCard
                label="GAD share of the budget"
                value={`${share.toFixed(1)}%`}
                icon={compliant ? "✅" : "⚠️"}
                tone={compliant ? "green" : "red"}
                hint={compliant ? "At or above the 5% floor" : "Below the 5% floor"}
              />
              <StatCard
                label="GAD budget utilised"
                value={`${utilisation.toFixed(1)}%`}
                icon="📈"
                tone={utilisation >= 70 ? "green" : "gold"}
                hint={`${pesoAmount(spent)} spent across ${num(activities.length)} activit(ies)`}
              />
            </StatGrid>

            <Panel
              title={`GAD compliance — FY ${plan.year}`}
              actions={
                <span className="adm-chiprow">
                  <Chip tone={compliant ? "green" : "red"}>
                    {compliant ? "Meets the 5% minimum" : "Below the 5% minimum"}
                  </Chip>
                  <StatusChip status={plan.status} />
                </span>
              }
            >
              <Progress
                value={Math.min(100, (share / (GAD_FLOOR * 100)) * 100)}
                tone={compliant ? "green" : "red"}
                label={`${share.toFixed(1)}% of ${pesoAmount(
                  totalBudget,
                )} — the bar is full at the 5% statutory floor (${pesoAmount(required)}).`}
              />
              <div style={{ height: 12 }} />
              {compliant ? (
                <Alert tone="success">
                  <strong>Compliant.</strong> {pesoAmount(gadBudget)} is {share.toFixed(1)}% of the
                  annual budget, at or above the 5% GAD floor required by the Magna Carta of Women
                  (RA 9710) and PCW-DILG-DBM-NEDA JMC 2013-01.
                </Alert>
              ) : (
                <Alert tone="danger">
                  <strong>Below the 5% floor.</strong> {pesoAmount(gadBudget)} is only{" "}
                  {share.toFixed(1)}% of the annual budget. Increase the GAD allocation by{" "}
                  <strong>{pesoAmount(shortfall)}</strong> to reach the required{" "}
                  {pesoAmount(required)}.
                </Alert>
              )}
            </Panel>

            <div style={{ height: 16 }} />
          </>
        )}
      </Async>

      {showNew && mayEncode && (
        <>
          <Panel title="New GAD plan">
            <form onSubmit={submit}>
              <div className="adm-form-grid">
                <Field label="Year">
                  <input
                    className="cbms-input"
                    type="number"
                    value={form.year}
                    onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                    required
                  />
                </Field>
                <Field label="Total barangay budget (₱)" hint="The annual appropriation.">
                  <input
                    className="cbms-input"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.totalBudget}
                    onChange={(e) => setForm((f) => ({ ...f, totalBudget: e.target.value }))}
                    required
                  />
                </Field>
                <Field
                  label="GAD budget (₱)"
                  hint={
                    formTotal > 0
                      ? `5% of ${pesoAmount(formTotal)} is ${pesoAmount(formTotal * GAD_FLOOR)}.`
                      : "Must be at least 5% of the annual budget."
                  }
                >
                  <input
                    className="cbms-input"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.gadBudget}
                    onChange={(e) => setForm((f) => ({ ...f, gadBudget: e.target.value }))}
                    required
                  />
                </Field>
              </div>
              {formTotal > 0 && formGad > 0 && (
                <Alert tone={formShare >= GAD_FLOOR * 100 ? "success" : "warn"}>
                  {formShare >= GAD_FLOOR * 100 ? (
                    <>
                      This allocation is <strong>{formShare.toFixed(1)}%</strong> of the annual
                      budget — it meets the 5% GAD floor.
                    </>
                  ) : (
                    <>
                      ⚠️ This allocation is only <strong>{formShare.toFixed(1)}%</strong> of the
                      annual budget. It is <strong>{pesoAmount(formShort)}</strong> short of the 5%
                      minimum ({pesoAmount(formTotal * GAD_FLOOR)}) required by RA 9710.
                    </>
                  )}
                </Alert>
              )}
              <Button type="submit" variant="primary" disabled={busy}>
                {busy ? "Saving…" : "Create plan"}
              </Button>
            </form>
          </Panel>
          <div style={{ height: 16 }} />
        </>
      )}

      <Panel padded={false}>
        <Toolbar>
          <strong style={{ fontSize: 13.5, color: "var(--cbms-navy)" }}>GAD activities</strong>
          <select
            className="cbms-select"
            value={selectedId}
            onChange={(e) => setPicked(e.target.value)}
            disabled={planList.length === 0}
          >
            {planList.length === 0 && <option value="">No plans</option>}
            {planList.map((p) => (
              <option key={p.id} value={p.id}>
                FY {p.year}
              </option>
            ))}
          </select>
          <div className="cbms-toolbar__spacer" />
          <span className="adm-muted">
            {num(activities.length)} activit(ies) · {pesoAmount(spent)} of{" "}
            {pesoAmount(gadBudget)} spent
          </span>
        </Toolbar>

        <Async loading={detail.loading} error={detail.error}>
          <DataTable
            columns={[
              {
                key: "title",
                header: "Activity",
                render: (a) => <span className="cbms-table__primary">{a.title}</span>,
              },
              {
                key: "attribution",
                header: "Attribution",
                render: (a) => (
                  <Chip tone={a.attribution === "client-focused" ? "blue" : "navy"}>
                    {titleize(a.attribution)}
                  </Chip>
                ),
              },
              {
                key: "genderIssue",
                header: "Gender issue addressed",
                render: (a) =>
                  a.genderIssue ?? <span className="cbms-table__muted">Not stated</span>,
              },
              {
                key: "budget",
                header: "Budget",
                align: "right",
                render: (a) => <strong>{pesoAmount(a.budget)}</strong>,
              },
              {
                key: "actualSpend",
                header: "Actual spend",
                align: "right",
                render: (a) =>
                  a.actualSpend === null || a.actualSpend === undefined ? (
                    <span className="cbms-table__muted">—</span>
                  ) : (
                    pesoAmount(a.actualSpend)
                  ),
              },
              {
                key: "output",
                header: "Target vs actual output",
                render: (a) => (
                  <>
                    <div className="cbms-table__primary">
                      {a.actualOutput ?? "No accomplishment reported yet"}
                    </div>
                    <div className="cbms-table__muted">Target: {a.targetOutput ?? "—"}</div>
                  </>
                ),
              },
              {
                key: "quarter",
                header: "Quarter",
                render: (a) =>
                  a.quarter ? `Q${a.quarter}` : <span className="cbms-table__muted">—</span>,
              },
              { key: "status", header: "Status", render: (a) => <StatusChip status={a.status} /> },
            ]}
            rows={activities}
            empty="No GAD activities have been encoded for this plan."
          />
        </Async>
      </Panel>
    </>
  );
}
