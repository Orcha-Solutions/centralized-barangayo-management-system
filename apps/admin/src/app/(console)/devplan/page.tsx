"use client";

import * as React from "react";
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
import { ActionResult, Progress } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import { PROJECT_STATUSES } from "../../../lib/labels";
import type { DevProject } from "../../../lib/types";
import { useDevPlanStore } from "../../../store/devPlanStore";

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
  const mayEncode = can("devplan:encode") || can("devplan:create") || can("devplan:edit");

  const {
    plans,
    projects,
    loading,
    error: storeError,
    fetchPlans,
    fetchProjects,
    addProject,
    updateProjectProgress,
    updateProjectStatus,
    deleteProject,
    toggleLockProject,
  } = useDevPlanStore();

  React.useEffect(() => {
    fetchPlans();
    fetchProjects();
  }, [fetchPlans, fetchProjects]);

  const [status, setStatus] = React.useState("all");
  const [sector, setSector] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const pageSize = 25;

  const plan = plans[0] ?? null;

  // Filtered slice
  const filteredProjects = projects.filter((p) => {
    if (status !== "all" && p.status !== status) return false;
    if (sector !== "all" && p.sector !== sector) return false;
    return true;
  });

  const pagedProjects = filteredProjects.slice((page - 1) * pageSize, page * pageSize);

  const ongoing = projects.filter((p) => p.status === "ongoing").length;
  const completed = projects.filter((p) => p.status === "completed").length;
  const totalBudget = projects.reduce((sum, p) => sum + Number(p.budget ?? 0), 0);

  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);
  /** Per-row edits to progressPct, keyed by project id. */
  const [draft, setDraft] = React.useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = React.useState<DevProject | null>(null);

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

  async function saveProgress(p: DevProject) {
    if (p.isLocked) {
      setError(`“${p.title}” is locked and cannot be edited. Unlock it first.`);
      return;
    }
    const raw = draft[p.id];
    const value = Math.max(0, Math.min(100, Math.round(Number(raw))));
    if (raw === undefined || Number.isNaN(Number(raw))) return;
    setBusyId(p.id);
    setError(null);
    setOk(null);
    try {
      await updateProjectProgress(p.id, value);
      setOk(`“${p.title}” physical accomplishment updated to ${value}%.`);
      setDraft((d) => {
        const next = { ...d };
        delete next[p.id];
        return next;
      });
    } catch (err: any) {
      setError(err?.message ?? "Could not update the progress.");
    } finally {
      setBusyId(null);
    }
  }

  async function saveStatus(p: DevProject, to: string) {
    if (p.isLocked) {
      setError(`“${p.title}” is locked and cannot be edited. Unlock it first.`);
      return;
    }
    setBusyId(p.id);
    setError(null);
    setOk(null);
    try {
      await updateProjectStatus(p.id, to);
      setOk(`“${p.title}” moved to ${titleize(to)}.`);
    } catch (err: any) {
      setError(err?.message ?? "Could not update the status.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleLock(p: DevProject) {
    setBusyId(p.id);
    setError(null);
    setOk(null);
    try {
      await toggleLockProject(p.id);
      setOk(
        p.isLocked
          ? `“${p.title}” unlocked. Editing and updates are now enabled.`
          : `“${p.title}” locked. It is now finalized and protected from edits or deletion.`
      );
    } catch (err: any) {
      setError(err?.message ?? "Could not toggle lock status.");
    } finally {
      setBusyId(null);
    }
  }

  function openDeleteModal(p: DevProject) {
    if (p.isLocked) {
      setError(`“${p.title}” is locked and protected. Unlock the project before deleting.`);
      return;
    }
    setDeleteTarget(p);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.isLocked) {
      setError(`“${deleteTarget.title}” is locked and protected. Unlock the project before deleting.`);
      setDeleteTarget(null);
      return;
    }
    setBusyId(deleteTarget.id);
    setError(null);
    setOk(null);
    try {
      await deleteProject(deleteTarget.id);
      setOk(`“${deleteTarget.title}” has been successfully deleted from the Development Plan.`);
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err?.message ?? "Could not delete the project.");
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
      await addProject({
        planId: formPlanId,
        title: form.title.trim(),
        sector: form.sector,
        budget: Number(form.budget),
        fundingSource: form.fundingSource || "NTA",
        targetYear: Number(form.targetYear),
      });
      setOk(`“${form.title.trim()}” successfully added to BDP & AIP project registry.`);
      setForm({
        planId: formPlanId,
        title: "",
        sector: "infrastructure",
        budget: "",
        fundingSource: "NTA",
        targetYear: String(thisYear),
      });
      setOpenDrawer(false);
    } catch (err: any) {
      setError(err?.message ?? "Could not add the project.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title="Barangay Development Plan (BDP / AIP)"
        subtitle="Programmes, projects, and activities of the Barangay Development Council (BDC), tracked against budget appropriations and physical accomplishment."
        breadcrumb="Governance / Development"
        parity="BDP Form 1"
        actions={
          mayEncode ? (
            <Button variant="primary" onClick={() => setOpenDrawer(true)}>
              ➕ New BDP Project
            </Button>
          ) : undefined
        }
      />

      <ActionResult error={error || storeError} success={ok} />

      <Panel
        title={plan ? plan.title : "Development Plan"}
        actions={
          plan ? (
            <span className="adm-chiprow" style={{ display: "flex", gap: "0.5rem" }}>
              <Chip tone="navy">
                Period: {plan.startYear}–{plan.endYear}
              </Chip>
              <StatusChip status={plan.status} />
            </span>
          ) : undefined
        }
      >
        {plan ? (
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7 }}>
            <strong style={{ color: "var(--cbms-navy)" }}>Executive Vision — </strong>
            {plan.vision ?? "No vision statement has been recorded for this plan."}
          </p>
        ) : (
          <p className="adm-muted">Loading development plan...</p>
        )}
      </Panel>

      <div style={{ height: 16 }} />

      <StatGrid>
        <StatCard
          label="Total PPAs in Plan"
          value={num(projects.length)}
          icon="🧭"
          hint="Every BDP & AIP project on file"
        />
        <StatCard
          label="Ongoing Projects"
          value={num(ongoing)}
          icon="🚧"
          tone="gold"
          hint="Under active implementation"
        />
        <StatCard
          label="Completed Projects"
          value={num(completed)}
          icon="✅"
          tone="green"
          hint="Delivered and operational"
        />
        <StatCard
          label="Total Programmed Budget"
          value={pesoAmount(totalBudget)}
          icon="💰"
          hint="Sum of all project appropriations"
        />
      </StatGrid>

      <div style={{ height: 16 }} />

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
            <option value="all">All Statuses</option>
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
            <option value="all">All Sectors</option>
            {PROJECT_SECTORS.map((s) => (
              <option key={s} value={s}>
                {titleize(s)}
              </option>
            ))}
          </select>
          <div className="cbms-toolbar__spacer" />
          <span className="adm-muted">{num(filteredProjects.length)} project(s)</span>
        </Toolbar>

        <DataTable
          columns={[
            {
              key: "title",
              header: "Project Title",
              render: (p) => (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                    <span className="cbms-table__primary" style={{ fontWeight: 600 }}>{p.title}</span>
                    {p.isLocked && (
                      <Chip tone="navy">🔒 Locked</Chip>
                    )}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>Target Year: {p.targetYear}</div>
                </div>
              ),
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
              header: "Funding Source",
              render: (p) => (
                <Chip tone="navy">{p.fundingSource ?? "NTA"}</Chip>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (p) =>
                mayEncode && !p.isLocked ? (
                  <select
                    className="cbms-select cbms-select--sm"
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
              header: "Physical Accomplishment",
              width: 220,
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
                    {mayEncode && !p.isLocked ? (
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          alignItems: "center",
                          marginTop: 6,
                        }}
                      >
                        <input
                          className="cbms-input cbms-input--sm"
                          type="number"
                          min={0}
                          max={100}
                          style={{ width: 68 }}
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
                          {busyId === p.id ? "…" : "Save"}
                        </Button>
                      </div>
                    ) : (
                      p.isLocked && (
                        <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 4 }}>
                          🔒 Finalized (Read-only)
                        </div>
                      )
                    )}
                  </div>
                );
              },
            },
            {
              key: "actions",
              header: "Actions",
              align: "right",
              width: 100,
              render: (p) =>
                mayEncode ? (
                  <div style={{ display: "flex", gap: "0.35rem", justifyContent: "flex-end", alignItems: "center" }}>
                    <Button
                      size="sm"
                      variant="default"
                      disabled={busyId === p.id}
                      onClick={() => handleToggleLock(p)}
                      title={p.isLocked ? "Unlock project to allow editing" : "Lock / Finalize project"}
                      aria-label={p.isLocked ? "Unlock project" : "Lock project"}
                      style={{ padding: "0.25rem 0.5rem", minWidth: 34 }}
                    >
                      {p.isLocked ? "🔓" : "🔒"}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={busyId === p.id || p.isLocked}
                      onClick={() => openDeleteModal(p)}
                      title={p.isLocked ? "Project is locked. Unlock to delete." : "Delete project"}
                      aria-label="Delete project"
                      style={{ padding: "0.25rem 0.5rem", minWidth: 34 }}
                    >
                      🗑️
                    </Button>
                  </div>
                ) : (
                  <span className="adm-muted" style={{ fontSize: "0.8rem" }}>Read-only</span>
                ),
            },
          ]}
          rows={pagedProjects}
          empty="No projects match this filter."
        />

        <Pagination page={page} pageSize={pageSize} total={filteredProjects.length} onPage={setPage} />
      </Panel>

      {/* Delete Warning Modal */}
      {deleteTarget && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.55)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            backdropFilter: "blur(2px)",
          }}
          onClick={() => setDeleteTarget(null)}
        >
          <div
            style={{
              backgroundColor: "var(--color-bg-card, #ffffff)",
              borderRadius: "0.75rem",
              padding: "1.75rem",
              maxWidth: "520px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid var(--color-border, #e2e8f0)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "1rem" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  backgroundColor: "#fef2f2",
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.35rem",
                  flexShrink: 0,
                }}
              >
                ⚠️
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#991b1b" }}>
                  Delete BDP Project?
                </h3>
                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                  This action is permanent and cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.25rem",
                  cursor: "pointer",
                  color: "#94a3b8",
                  lineHeight: 1,
                  padding: "0.25rem",
                }}
              >
                ✕
              </button>
            </div>

            {/* Warning Box */}
            <Alert tone="danger">
              <strong>Warning:</strong> Deleting this PPA will permanently remove its budget appropriation, physical accomplishment records, and tracking history from the Barangay Development Plan.
            </Alert>

            {/* Project Overview Card */}
            <div
              style={{
                marginTop: "1rem",
                marginBottom: "1.5rem",
                padding: "0.875rem 1rem",
                backgroundColor: "var(--color-bg-subtle, #f8fafc)",
                borderRadius: "0.5rem",
                border: "1px solid var(--color-border, #e2e8f0)",
                fontSize: "0.85rem",
              }}
            >
              <div style={{ fontWeight: 600, color: "var(--color-text, #1b2430)", marginBottom: "0.5rem" }}>
                {deleteTarget.title}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", color: "#64748b" }}>
                <div>
                  <strong>Sector:</strong> {titleize(deleteTarget.sector)}
                </div>
                <div>
                  <strong>Budget:</strong> {pesoAmount(deleteTarget.budget)}
                </div>
                <div>
                  <strong>Target Year:</strong> {deleteTarget.targetYear}
                </div>
                <div>
                  <strong>Progress:</strong> {deleteTarget.progressPct}% ({titleize(deleteTarget.status)})
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                type="button"
                className="cbms-btn"
                onClick={() => setDeleteTarget(null)}
                disabled={busyId === deleteTarget.id}
              >
                Cancel
              </button>
              <Button
                variant="danger"
                disabled={busyId === deleteTarget.id}
                onClick={confirmDelete}
              >
                {busyId === deleteTarget.id ? "Deleting…" : "🗑️ Confirm Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Right Slide-Over Content Drawer */}
      {openDrawer && (
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
            backdropFilter: "blur(2px)",
          }}
          onClick={() => setOpenDrawer(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "560px",
              backgroundColor: "var(--color-bg-card, #ffffff)",
              height: "100%",
              boxShadow: "-4px 0 25px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--color-border, #e2e8f0)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "var(--color-bg-subtle, #f8fafc)",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "bold", color: "var(--color-text, #1b2430)" }}>
                  🧭 Add New BDP Project
                </h3>
                <span style={{ fontSize: "0.78rem", color: "var(--cbms-muted, #64748b)" }}>
                  Barangay Development Council (BDC) · Annual Investment Program
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpenDrawer(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "var(--cbms-muted, #64748b)",
                  lineHeight: 1,
                  padding: "0.25rem 0.5rem",
                }}
              >
                ✕
              </button>
            </div>

            {/* Drawer Form Body */}
            <form
              onSubmit={submit}
              style={{
                padding: "1.5rem",
                overflowY: "auto",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "1.1rem",
              }}
            >
              {plans.length > 1 && (
                <Field label="Target Development Plan">
                  <select
                    className="cbms-select"
                    value={formPlanId}
                    onChange={(e) => setForm((f) => ({ ...f, planId: e.target.value }))}
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.startYear}–{p.endYear})
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              <Field label="Development Sector">
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

              <Field label="Project Title / Name" hint="Clear, actionable title of the infrastructure or service PPA.">
                <input
                  className="cbms-input"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Purok 4 Concrete Culvert & Drainage Rehabilitation"
                  required
                />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <Field label="Budget Appropriation (₱)" hint="Total funding allocated.">
                  <input
                    className="cbms-input"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.budget}
                    onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                    placeholder="750000"
                    required
                  />
                </Field>

                <Field label="Target Year">
                  <input
                    className="cbms-input"
                    type="number"
                    value={form.targetYear}
                    onChange={(e) => setForm((f) => ({ ...f, targetYear: e.target.value }))}
                    required
                  />
                </Field>
              </div>

              <Field label="Funding Source">
                <select
                  className="cbms-select"
                  value={form.fundingSource}
                  onChange={(e) => setForm((f) => ({ ...f, fundingSource: e.target.value }))}
                >
                  {FUNDING_SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s === "NTA" ? "NTA (National Tax Allotment / IRA)" : s === "LGU" ? "City / Municipal LGU Counterpart" : titleize(s)}
                    </option>
                  ))}
                </select>
              </Field>

              <Alert tone="info">
                💡 Projects will start in <strong>Proposed</strong> status at 0% physical accomplishment. BDC officers can update status to Ongoing or Completed as milestones are reached.
              </Alert>

              {/* Drawer Footer Actions */}
              <div
                style={{
                  marginTop: "auto",
                  paddingTop: "1.25rem",
                  borderTop: "1px solid var(--color-border, #e2e8f0)",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                }}
              >
                <button
                  type="button"
                  className="cbms-btn"
                  onClick={() => setOpenDrawer(false)}
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary" disabled={busy || !formPlanId}>
                  {busy ? "Saving Project…" : "Save Project to Plan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
