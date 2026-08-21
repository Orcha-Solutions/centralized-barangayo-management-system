"use client";

import * as React from "react";
import { ApiError, patch, post, qs, useApi } from "@cbms/api-client";
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
  num,
  pesoAmount,
  titleize,
  type ChipTone,
} from "@cbms/ui";
import { ActionResult, Async, EmptyNote, Progress } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import { PROJECT_STATUSES } from "../../../lib/labels";
import type { DevelopmentPlan, DevProject, Paged } from "../../../lib/types";

/** Project sectors used by the BDP module (distinct from the resident sector flags). */
const PROJECT_SECTORS = [
  "infrastructure",
  "health",
  "education",
  "livelihood",
  "environment",
  "peace_order",
] as const;

const SECTOR_TONE: Record<string, ChipTone> = {
  infrastructure: "navy",
  health: "green",
  education: "blue",
  livelihood: "gold",
  environment: "green",
  peace_order: "red",
};

const FUNDING_SOURCES = ["NTA", "LGU", "national", "grant", "trust"] as const;

export default function DevPlanPage() {
  const { can } = useConsole();
  const mayEncode = can("devplan:encode");

  const [status, setStatus] = React.useState("all");
  const [sector, setSector] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [showNew, setShowNew] = React.useState(false);
  const pageSize = 25;

  const plans = useApi<Paged<DevelopmentPlan>>("/devplan/plans");
  const list = useApi<Paged<DevProject>>(
    `/devplan/projects${qs({ status, sector, page, pageSize })}`,
  );
  // Unfiltered slice used for the programme-level counters.
  const all = useApi<Paged<DevProject>>("/devplan/projects?pageSize=200");

  const plan = plans.data?.items?.[0] ?? null;
  const projects = all.data?.items ?? [];
  const ongoing = projects.filter((p) => p.status === "ongoing").length;
  const completed = projects.filter((p) => p.status === "completed").length;
  const totalBudget = projects.reduce((sum, p) => sum + Number(p.budget ?? 0), 0);

  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);
  /** Per-row edits to progressPct, keyed by project id. */
  const [draft, setDraft] = React.useState<Record<string, string>>({});

  const thisYear = new Date().getFullYear();
  const [form, setForm] = React.useState({
    planId: "",
    title: "",
    sector: "infrastructure",
    budget: "",
    fundingSource: "NTA",
    targetYear: String(thisYear),
  });

  const formPlanId = form.planId || plan?.id || "";

  function refresh() {
    list.reload();
    all.reload();
  }

  async function saveProgress(p: DevProject) {
    const raw = draft[p.id];
    const value = Math.max(0, Math.min(100, Math.round(Number(raw))));
    if (raw === undefined || Number.isNaN(Number(raw))) return;
    setBusyId(p.id);
    setError(null);
    setOk(null);
    try {
      await patch(`/devplan/projects/${p.id}`, { progressPct: value });
      setOk(`“${p.title}” is now ${value}% complete.`);
      setDraft((d) => {
        const next = { ...d };
        delete next[p.id];
        return next;
      });
      refresh();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not update the progress.");
    } finally {
      setBusyId(null);
    }
  }

  async function saveStatus(p: DevProject, to: string) {
    setBusyId(p.id);
    setError(null);
    setOk(null);
    try {
      await patch(`/devplan/projects/${p.id}`, { status: to });
      setOk(`“${p.title}” moved to ${titleize(to)}.`);
      refresh();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not update the status.");
    } finally {
      setBusyId(null);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!formPlanId) {
      setError("There is no development plan to attach this project to yet.");
      return;
    }
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await post<DevProject>("/devplan/projects", {
        planId: formPlanId,
        title: form.title.trim(),
        sector: form.sector,
        budget: Number(form.budget),
        ...(form.fundingSource ? { fundingSource: form.fundingSource } : {}),
        targetYear: Number(form.targetYear),
      });
      setOk(`“${form.title.trim()}” added to the development plan.`);
      setForm({
        planId: formPlanId,
        title: "",
        sector: "infrastructure",
        budget: "",
        fundingSource: "NTA",
        targetYear: String(thisYear),
      });
      setShowNew(false);
      refresh();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not add the project.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title="Barangay Development Plan"
        subtitle="Programmes, projects and activities of the Barangay Development Council, tracked against their budget and physical accomplishment."
        breadcrumb="Governance"
        parity="BDP"
        actions={
          mayEncode ? (
            <Button variant="primary" onClick={() => setShowNew((v) => !v)}>
              {showNew ? "Close" : "+ New project"}
            </Button>
          ) : undefined
        }
      />

      <ActionResult error={error} success={ok} />

      <Panel
        title={plan ? plan.title : "Development plan"}
        actions={
          plan ? (
            <span className="adm-chiprow">
              <Chip tone="navy">
                {plan.startYear}–{plan.endYear}
              </Chip>
              <StatusChip status={plan.status} />
            </span>
          ) : undefined
        }
      >
        <Async loading={plans.loading} error={plans.error}>
          {plan ? (
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7 }}>
              <strong style={{ color: "var(--cbms-navy)" }}>Vision — </strong>
              {plan.vision ?? "No vision statement has been recorded for this plan."}
            </p>
          ) : (
            <EmptyNote>
              No development plan has been adopted yet. Projects must belong to a plan.
            </EmptyNote>
          )}
        </Async>
      </Panel>

      <div style={{ height: 16 }} />

      <StatGrid>
        <StatCard
          label="Projects in the plan"
          value={num(all.data?.total)}
          icon="🧭"
          hint="Every PPA on file"
        />
        <StatCard
          label="Ongoing"
          value={num(ongoing)}
          icon="🚧"
          tone="gold"
          hint="Implementation started"
        />
        <StatCard
          label="Completed"
          value={num(completed)}
          icon="✅"
          tone="green"
          hint="Delivered and closed"
        />
        <StatCard
          label="Total programmed budget"
          value={pesoAmount(totalBudget)}
          icon="💰"
          hint="Sum of every project's appropriation"
        />
      </StatGrid>

      {showNew && mayEncode && (
        <>
          <Panel title="New project">
            <form onSubmit={submit}>
              <div className="adm-form-grid">
                {(plans.data?.items?.length ?? 0) > 1 && (
                  <Field label="Development plan">
                    <select
                      className="cbms-select"
                      value={formPlanId}
                      onChange={(e) => setForm((f) => ({ ...f, planId: e.target.value }))}
                    >
                      {(plans.data?.items ?? []).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
                <Field label="Sector">
                  <select
                    className="cbms-select"
                    value={form.sector}
                    onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}
                  >
                    {PROJECT_SECTORS.map((s) => (
                      <option key={s} value={s}>
                        {titleize(s)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Budget (₱)" hint="Appropriation for the whole project.">
                  <input
                    className="cbms-input"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.budget}
                    onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                    required
                  />
                </Field>
                <Field label="Funding source">
                  <select
                    className="cbms-select"
                    value={form.fundingSource}
                    onChange={(e) => setForm((f) => ({ ...f, fundingSource: e.target.value }))}
                  >
                    {FUNDING_SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {s === "NTA" ? "NTA (IRA share)" : titleize(s)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Target year">
                  <input
                    className="cbms-input"
                    type="number"
                    value={form.targetYear}
                    onChange={(e) => setForm((f) => ({ ...f, targetYear: e.target.value }))}
                    required
                  />
                </Field>
              </div>
              <Field label="Project title">
                <input
                  className="cbms-input"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Drainage improvement — Purok 1 to 3"
                  required
                />
              </Field>
              {!formPlanId && (
                <Alert tone="warn">
                  Adopt a development plan first — every project is filed under a plan.
                </Alert>
              )}
              <Button type="submit" variant="primary" disabled={busy || !formPlanId}>
                {busy ? "Saving…" : "Add project"}
              </Button>
            </form>
          </Panel>
          <div style={{ height: 16 }} />
        </>
      )}

      <Panel padded={false}>
        <Toolbar>
          <select
            className="cbms-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {titleize(s)}
              </option>
            ))}
          </select>
          <select
            className="cbms-select"
            value={sector}
            onChange={(e) => {
              setSector(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All sectors</option>
            {PROJECT_SECTORS.map((s) => (
              <option key={s} value={s}>
                {titleize(s)}
              </option>
            ))}
          </select>
          <div className="cbms-toolbar__spacer" />
          <span className="adm-muted">{num(list.data?.total)} project(s)</span>
        </Toolbar>

        <Async loading={list.loading} error={list.error}>
          <DataTable
            columns={[
              {
                key: "title",
                header: "Project",
                render: (p) => <span className="cbms-table__primary">{p.title}</span>,
              },
              {
                key: "sector",
                header: "Sector",
                render: (p) => (
                  <Chip tone={SECTOR_TONE[p.sector] ?? "gray"}>{titleize(p.sector)}</Chip>
                ),
              },
              {
                key: "budget",
                header: "Budget",
                align: "right",
                render: (p) => <strong>{pesoAmount(p.budget)}</strong>,
              },
              {
                key: "fundingSource",
                header: "Funding source",
                render: (p) =>
                  p.fundingSource ?? <span className="cbms-table__muted">Unfunded</span>,
              },
              { key: "targetYear", header: "Target year", render: (p) => p.targetYear },
              {
                key: "status",
                header: "Status",
                render: (p) =>
                  mayEncode ? (
                    <select
                      className="cbms-select"
                      value={p.status}
                      disabled={busyId === p.id}
                      onChange={(e) => saveStatus(p, e.target.value)}
                    >
                      {PROJECT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {titleize(s)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <StatusChip status={p.status} />
                  ),
              },
              {
                key: "progressPct",
                header: "Progress",
                width: 210,
                render: (p) => {
                  const pending = draft[p.id];
                  return (
                    <div>
                      <Progress
                        value={p.progressPct}
                        tone={
                          p.progressPct >= 100 ? "green" : p.progressPct > 0 ? "navy" : "gold"
                        }
                        label={`${p.progressPct}% physical accomplishment`}
                      />
                      {mayEncode && (
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            alignItems: "center",
                            marginTop: 6,
                          }}
                        >
                          <input
                            className="cbms-input"
                            type="number"
                            min={0}
                            max={100}
                            style={{ width: 74 }}
                            value={pending ?? String(p.progressPct)}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, [p.id]: e.target.value }))
                            }
                          />
                          <Button
                            size="sm"
                            disabled={
                              busyId === p.id ||
                              pending === undefined ||
                              pending === String(p.progressPct)
                            }
                            onClick={() => saveProgress(p)}
                          >
                            {busyId === p.id ? "Saving…" : "Save"}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                },
              },
            ]}
            rows={list.data?.items ?? []}
            empty="No projects match this filter."
          />
        </Async>

        <Pagination page={page} pageSize={pageSize} total={list.data?.total ?? 0} onPage={setPage} />
      </Panel>
    </>
  );
}
