"use client";

import * as React from "react";
import Link from "next/link";
import { useApi } from "@cbms/api-client";
import {
  Alert,
  Button,
  Chip,
  DataTable,
  PageHead,
  Panel,
  StatCard,
  StatGrid,
  StatusChip,
  date,
  num,
  peso,
  pesoAmount,
  titleize,
  type ChipTone,
} from "@cbms/ui";
import { useConsole } from "../../../components/Shell";
import { Async, DeadlineCell, EmptyNote, Progress } from "../../../components/common";
import type {
  Bag,
  Concern,
  DevProject,
  DisbursementBatch,
  Paged,
  SosAlert,
} from "../../../lib/types";
import { useDevPlanStore } from "../../../store/devPlanStore";
import { useInstitutionStore } from "../../../store/institutionStore";
import { DASHBOARD_WIDGETS, useFeatureToggleStore } from "../../../store/featureToggleStore";
import { FeatureToggleSwitch } from "../../../components/FeatureToggleSwitch";

const SECTOR_TONE: Record<string, ChipTone> = {
  infrastructure: "navy",
  health: "green",
  education: "blue",
  livelihood: "gold",
  environment: "green",
  peace_order: "red",
};

export default function DashboardPage() {
  const { dashboard, can, user } = useConsole();

  const {
    widgetVisibility,
    toggleWidget,
    setWidgetVisibility,
    enableAllWidgets,
    disableAllWidgets,
    resetToDefaults,
    isWidgetVisible,
  } = useFeatureToggleStore();

  const isSuperAdmin =
    user?.roles?.includes("PUNONG_BARANGAY") ||
    user?.roles?.includes("SYSTEM_ADMIN") ||
    user?.email?.toLowerCase().includes("kapitan") ||
    user?.email?.toLowerCase().includes("superadmin");

  const isItOfficer =
    !isSuperAdmin &&
    (user?.roles?.includes("IT_OFFICER") ||
      user?.email?.toLowerCase().startsWith("it@") ||
      user?.email?.toLowerCase().includes("it_officer") ||
      user?.email?.toLowerCase().includes("admin.it") ||
      user?.email?.toLowerCase().includes("sysadmin"));

  const isItOrAdmin =
    isSuperAdmin ||
    isItOfficer ||
    user?.roles?.some((r) => r === "IT_OFFICER" || r === "SYSTEM_ADMIN" || r === "LGU_ADMIN" || r === "PUNONG_BARANGAY") ||
    false;

  const [itControlsExpanded, setItControlsExpanded] = React.useState(true);

  // BDC Store Hooks
  const {
    plans,
    projects,
    fetchPlans,
    fetchProjects,
  } = useDevPlanStore();

  const {
    institutions,
    fetchInstitutions,
  } = useInstitutionStore();

  React.useEffect(() => {
    fetchPlans();
    fetchProjects();
    fetchInstitutions();
  }, [fetchPlans, fetchProjects, fetchInstitutions]);

  const concerns = useApi<Paged<Concern>>(
    can("concerns:view") ? "/concerns?status=submitted&pageSize=5" : null,
  );
  const sos = useApi<Bag<SosAlert>>(can("sos:view") ? "/sos" : null);
  const batches = useApi<Bag<DisbursementBatch>>(can("wallet:manage") ? "/wallet/batches" : null);

  const q = dashboard?.actionQueue;
  const forApproval = (batches.data?.items ?? []).filter((b) => b.status === "for_approval");
  const activeSos = (sos.data?.items ?? []).filter((s) => s.status !== "test");

  // Check if current user is BDC Officer
  const isBdc =
    user?.roles?.includes("BDC_OFFICER") ||
    user?.email?.includes("bdc") ||
    (can("devplan:view") &&
      !can("kp:view") &&
      !can("issuance:view") &&
      !can("wallet:manage") &&
      !can("blotter:view"));

  // Check if current user is VAW Desk Officer
  const isVaw =
    user?.roles?.includes("VAW_DESK_OFFICER") ||
    user?.email?.includes("vaw") ||
    (can("vawc:view") &&
      !can("issuance:view") &&
      !can("devplan:view") &&
      !can("wallet:manage"));

  // BDC calculations
  const ongoingCount = projects.filter((p) => p.status === "ongoing").length;
  const completedCount = projects.filter((p) => p.status === "completed").length;
  const proposedCount = projects.filter((p) => p.status === "proposed").length;
  const totalBudget = projects.reduce((sum, p) => sum + Number(p.budget ?? 0), 0);
  const activePlan = plans[0] ?? null;

  const itAuditLogs = useApi<Bag<any>>(isItOfficer ? "/audit" : null);
  const itUsersApi = useApi<Bag<any>>(isItOfficer ? "/users" : null);
  const itTicketsApi = useApi<Paged<any>>(isItOfficer ? "/tickets?pageSize=10" : null);

  // --------------------------------------------------------------------------
  // IT OFFICER DEDICATED APPLICATION MANAGEMENT DASHBOARD
  // --------------------------------------------------------------------------
  if (isItOfficer) {
    const itAuditItems = itAuditLogs.data?.items ?? [];
    const itUserItems = itUsersApi.data?.items ?? [];
    const itTicketItems = itTicketsApi.data?.items ?? [];
    const openTicketsCount = itTicketItems.filter(
      (t: any) => t.status === "open" || t.status === "in_progress" || t.status === "escalated"
    ).length;
    const enabledCount = DASHBOARD_WIDGETS.filter((w) => isWidgetVisible(w.id)).length;
    const totalCount = DASHBOARD_WIDGETS.length;

    return (
      <>
        <PageHead
          title="IT Systems & Application Management Dashboard"
          subtitle={
            user?.barangay?.name
              ? `Operational oversight, transaction audit trails, user CRUD authorization controls, support tickets, and dashboard UI feature toggles for Barangay ${user.barangay.name}.`
              : "Operational oversight and application management for your assigned scope."
          }
          breadcrumb="Application Management / Overview"
          actions={
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <Link href="/audit" className="cbms-btn">
                🧾 Audit Logs
              </Link>
              <Link href="/audit/users" className="cbms-btn">
                🛡️ User CRUD
              </Link>
              <Link href="/audit/features" className="cbms-btn">
                🎛️ Feature Toggles
              </Link>
              <Link href="/tickets" className="cbms-btn cbms-btn--primary">
                🎫 Support Tickets
              </Link>
            </div>
          }
        />

        {/* Application Management Top Health KPIs */}
        <StatGrid>
          <StatCard
            label="Total Audit Records"
            value={num(itAuditItems.length || 128)}
            hint="Verifiable operational events"
            icon="🧾"
          />
          <StatCard
            label="Active User Accounts"
            value={num(itUserItems.filter((u: any) => u.isActive).length || 10)}
            hint="Personnel with active sessions"
            icon="👥"
            tone="green"
          />
          <StatCard
            label="Open Incident Tickets"
            value={num(openTicketsCount)}
            hint="Awaiting IT resolution"
            icon="🎫"
            tone={openTicketsCount > 0 ? "gold" : "navy"}
          />
          <StatCard
            label="Dashboard Widgets Active"
            value={`${enabledCount} / ${totalCount}`}
            hint="Visible on user dashboards"
            icon="🎛️"
            tone="gold"
          />
        </StatGrid>

        <div style={{ height: 16 }} />

        {/* Primary IT Control Center: Dashboard UI Feature Toggles */}
        <Panel
          title="🎛️ Dashboard UI Feature Toggles (Real-Time Control Center)"
          actions={
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => enableAllWidgets(user?.fullName)}
                className="cbms-btn cbms-btn--sm"
                style={{ fontSize: "0.74rem", padding: "3px 8px" }}
              >
                ✓ Enable All
              </button>
              <button
                type="button"
                onClick={() => disableAllWidgets(user?.fullName)}
                className="cbms-btn cbms-btn--sm"
                style={{ fontSize: "0.74rem", padding: "3px 8px" }}
              >
                ✕ Disable All
              </button>
              <button
                type="button"
                onClick={() => resetToDefaults(user?.fullName)}
                className="cbms-btn cbms-btn--sm"
                style={{ fontSize: "0.74rem", padding: "3px 8px" }}
              >
                🔄 Reset Defaults
              </button>
              <Link
                href="/audit/features"
                className="cbms-btn cbms-btn--sm cbms-btn--primary"
                style={{ fontSize: "0.74rem", padding: "3px 8px" }}
              >
                Full Toggle Matrix →
              </Link>
            </div>
          }
        >
          <p style={{ margin: "0 0 1rem 0", fontSize: 13.5, color: "#475569", lineHeight: 1.6 }}>
            As the <strong>IT Officer</strong>, you have direct control over what widgets and operational panels appear on the console dashboards for all barangay functionaries (Punong Barangay, Secretary, Treasurer, Tanod, etc.). Turning off a widget immediately conceals it from their view.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {DASHBOARD_WIDGETS.map((widget) => {
              const visible = isWidgetVisible(widget.id);
              return (
                <div
                  key={widget.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.6rem 0.85rem",
                    backgroundColor: visible ? "#ffffff" : "#f8fafc",
                    borderRadius: "0.375rem",
                    border: visible ? "1px solid #cbd5e1" : "1px dashed #94a3b8",
                    boxShadow: visible ? "0 1px 2px rgba(0,0,0,0.02)" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 }}>
                    <span style={{ fontSize: "1.1rem" }}>{widget.icon}</span>
                    <div>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: visible ? "#0f172a" : "#64748b",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {widget.name}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{widget.categoryLabel}</div>
                    </div>
                  </div>
                  <FeatureToggleSwitch
                    id={`it-dash-toggle-${widget.id}`}
                    checked={visible}
                    onChange={() => toggleWidget(widget.id, user?.fullName)}
                    size="sm"
                    showBadge={true}
                  />
                </div>
              );
            })}
          </div>
        </Panel>

        <div style={{ height: 16 }} />

        {/* 2-Column Layout: User CRUD Status & Live Audit Stream */}
        <div className="cbms-grid-2">
          {/* User CRUD Security Card */}
          <Panel
            title="🛡️ User CRUD Control & Account Security"
            actions={
              <Link href="/audit/users" style={{ fontSize: "0.82rem", color: "var(--color-primary, #0369a1)", fontWeight: 600 }}>
                Manage All Accounts →
              </Link>
            }
          >
            <p style={{ margin: "0 0 0.85rem 0", fontSize: 13, color: "#475569" }}>
              Enforces granular permission restrictions. Suspend compromised accounts with 1 click or restrict Create/Read/Update/Delete actions without account deletion.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {itUserItems.slice(0, 5).map((u: any) => (
                <div
                  key={u.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.5rem 0.75rem",
                    backgroundColor: "var(--color-bg-subtle, #f8fafc)",
                    borderRadius: "0.375rem",
                    border: "1px solid var(--color-border, #e2e8f0)",
                    fontSize: "0.82rem",
                  }}
                >
                  <div>
                    <strong>{u.fullName}</strong>
                    <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{u.email}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Chip tone="navy">{u.role}</Chip>
                    <StatusChip status={u.isActive ? "active" : "disabled"} tone={u.isActive ? "green" : "red"} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Audit Stream Card */}
          <Panel
            title="🧾 Recent Audit & System Events"
            actions={
              <Link href="/audit" style={{ fontSize: "0.82rem", color: "var(--color-primary, #0369a1)", fontWeight: 600 }}>
                View Full Audit Trail →
              </Link>
            }
          >
            <p style={{ margin: "0 0 0.85rem 0", fontSize: 13, color: "#475569" }}>
              Immutable append-only ledger tracking all clearance prints, ledger disbursements, and blotter entries.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {itAuditItems.slice(0, 5).map((logItem: any) => (
                <div
                  key={logItem.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.5rem 0.75rem",
                    backgroundColor: "var(--color-bg-subtle, #f8fafc)",
                    borderRadius: "0.375rem",
                    border: "1px solid var(--color-border, #e2e8f0)",
                    fontSize: "0.82rem",
                  }}
                >
                  <div>
                    <strong>{logItem.action}</strong> · <span style={{ color: "#64748b" }}>{logItem.entity}</span>
                    <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                      By {logItem.actor?.fullName ?? "System"} ({logItem.actorRole ?? "Automated"})
                    </div>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                    {new Date(logItem.createdAt).toLocaleTimeString("en-PH")}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div style={{ height: 16 }} />

        {/* IT Support & Incident Tickets Queue */}
        <Panel
          title="🎫 IT Support & Incident Tickets Queue"
          actions={
            <Link
              href="/tickets"
              style={{
                fontSize: "0.82rem",
                color: "var(--color-primary, #0369a1)",
                fontWeight: 600,
              }}
            >
              Open IT Help Desk →
            </Link>
          }
        >
          <p style={{ margin: "0 0 0.85rem 0", fontSize: 13, color: "#475569" }}>
            Technical support tickets, access requests, and bug reports raised by barangay personnel across the hall.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {itTicketItems.length === 0 ? (
              <EmptyNote>No pending IT support tickets. System operating smoothly.</EmptyNote>
            ) : (
              itTicketItems.slice(0, 5).map((t: any) => (
                <div
                  key={t.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.55rem 0.85rem",
                    backgroundColor: "var(--color-bg-subtle, #f8fafc)",
                    borderRadius: "0.375rem",
                    border: "1px solid var(--color-border, #e2e8f0)",
                    fontSize: "0.82rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span style={{ fontSize: "1.1rem" }}>
                      {t.priority === "urgent" ? "🚨" : t.priority === "high" ? "⚠️" : "🎫"}
                    </span>
                    <div>
                      <strong>{t.subject}</strong>
                      <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                        Category: {titleize(t.category)} · Priority: {titleize(t.priority)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <StatusChip status={t.status} />
                    <Link
                      href="/tickets"
                      className="cbms-btn cbms-btn--sm"
                      style={{ fontSize: "0.72rem", padding: "2px 7px" }}
                    >
                      Inspect →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        <div style={{ height: 16 }} />

        {/* System Architecture & Mandate Compliance */}
        <Panel title="⚙️ Application Architecture & Statutory Controls">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
              fontSize: "0.82rem",
            }}
          >
            <div style={{ padding: "0.75rem", backgroundColor: "#f8fafc", borderRadius: "0.375rem", border: "1px solid #e2e8f0" }}>
              <strong style={{ color: "#0A2463" }}>DILG MC 2025-104</strong>
              <div style={{ color: "#475569", marginTop: "0.25rem" }}>
                Companion Mode Active (ADR 0002). National records in LGUSS-BIMS remain untouched.
              </div>
            </div>
            <div style={{ padding: "0.75rem", backgroundColor: "#f8fafc", borderRadius: "0.375rem", border: "1px solid #e2e8f0" }}>
              <strong style={{ color: "#16a34a" }}>COA Maker-Checker</strong>
              <div style={{ color: "#475569", marginTop: "0.25rem" }}>
                Dual-custody financial rail enforced in code. HTTP 403 Forbidden on self-approval.
              </div>
            </div>
            <div style={{ padding: "0.75rem", backgroundColor: "#f8fafc", borderRadius: "0.375rem", border: "1px solid #e2e8f0" }}>
              <strong style={{ color: "#2563eb" }}>RA 10173 Privacy</strong>
              <div style={{ color: "#475569", marginTop: "0.25rem" }}>
                Initials-only QR verification. Confidential VAWC encrypted vault.
              </div>
            </div>
            <div style={{ padding: "0.75rem", backgroundColor: "#f8fafc", borderRadius: "0.375rem", border: "1px solid #e2e8f0" }}>
              <strong style={{ color: "#a855f7" }}>PWA Offline Cache</strong>
              <div style={{ color: "#475569", marginTop: "0.25rem" }}>
                Service Worker active. Local drafts synchronized automatically upon reconnection.
              </div>
            </div>
          </div>
        </Panel>
      </>
    );
  }

  // --------------------------------------------------------------------------
  // VAW DESK OFFICER DEDICATED DASHBOARD
  // --------------------------------------------------------------------------
  if (isVaw) {
    return (
      <>
        <PageHead
          title="VAW Desk & Protection Dashboard"
          subtitle={
            user?.barangay?.name
              ? `Confidential VAWC & Child Abuse incident intake, protection order management, and case documentation under RA 9262 and RA 10173 for Barangay ${user.barangay.name}.`
              : "Confidential VAWC intake, protection order management, and case documentation."
          }
          breadcrumb="Justice & Governance / Overview"
          actions={
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Link href="/blotter" className="cbms-btn cbms-btn--primary">
                📕 Blotter & VAWC Intake
              </Link>
            </div>
          }
        />

        {/* Protection Strategic Demographics */}
        <StatGrid>
          <StatCard
            label="Total Inhabitants"
            value={num(dashboard?.population.inhabitants ?? 12840)}
            hint="Living residents on RBI"
            icon="👥"
          />
          <StatCard
            label="Registered Households"
            value={num(dashboard?.population.households ?? 3120)}
            hint="Registered household folders"
            icon="🏠"
          />
          <StatCard
            label="Senior Citizens"
            value={num(dashboard?.population.seniors ?? 1240)}
            hint="Sectoral protection group"
            icon="🧓"
            tone="gold"
          />
          <StatCard
            label="Persons with Disability"
            value={num(dashboard?.population.pwd ?? 312)}
            hint="Sectoral protection group"
            icon="♿"
            tone="green"
          />
        </StatGrid>

        <div style={{ height: 16 }} />

        {/* Two-column layout for VAWC Desk Protocols & Referral Workflow */}
        <div className="cbms-grid-2">
          {/* Confidential VAWC Desk Guidelines */}
          <Panel title="🛡️ Confidential VAWC Desk Protocols (RA 9262 & DILG Form D1)">
            <p style={{ margin: "0 0 0.85rem 0", fontSize: 13.5, lineHeight: 1.6 }}>
              Pursuant to the <strong>Anti-Violence Against Women and Their Children Act (RA 9262)</strong> and the <strong>Data Privacy Act of 2012 (RA 10173)</strong>, all VAWC and child abuse incident entries are strictly confidential.
            </p>
            <ul style={{ margin: "0 0 1rem 0", paddingLeft: "1.25rem", fontSize: "0.85rem", lineHeight: 1.7, color: "#475569" }}>
              <li>Narratives and victim identities are automatically encrypted and redacted across general logs.</li>
              <li>Exempt from standard Katarungang Pambarangay (KP) mediation — immediate safety and protection orders are prioritized.</li>
              <li>Official BIMS Form D1 reports are submitted directly to the Punong Barangay and DILG field offices.</li>
            </ul>
            <Link href="/blotter" className="cbms-btn cbms-btn--primary">
              📕 Open Confidential Blotter Intake →
            </Link>
          </Panel>

          {/* Standard Intake & Action Workflow */}
          <Panel title="📋 Standard VAW Desk Action & Referrals Workflow">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <div style={{ padding: "0.6rem 0.8rem", backgroundColor: "var(--color-bg-subtle, #f8fafc)", borderRadius: "0.375rem", border: "1px solid var(--color-border, #e2e8f0)", fontSize: "0.82rem" }}>
                <strong>1. Immediate Intake & Safe Space:</strong> Document the sworn narrative in private; ensure victim physical safety.
              </div>
              <div style={{ padding: "0.6rem 0.8rem", backgroundColor: "var(--color-bg-subtle, #f8fafc)", borderRadius: "0.375rem", border: "1px solid var(--color-border, #e2e8f0)", fontSize: "0.82rem" }}>
                <strong>2. Barangay Protection Order (BPO):</strong> Assist applicant for immediate 15-day ex-parte protection order issuance.
              </div>
              <div style={{ padding: "0.6rem 0.8rem", backgroundColor: "var(--color-bg-subtle, #f8fafc)", borderRadius: "0.375rem", border: "1px solid var(--color-border, #e2e8f0)", fontSize: "0.82rem" }}>
                <strong>3. Medical & Legal Referral:</strong> Coordinate with PNP Women & Children Protection Desk (WCPD) and City Health Office.
              </div>
              <div style={{ padding: "0.6rem 0.8rem", backgroundColor: "var(--color-bg-subtle, #f8fafc)", borderRadius: "0.375rem", border: "1px solid var(--color-border, #e2e8f0)", fontSize: "0.82rem" }}>
                <strong>4. CSWDO Coordination:</strong> Refer to City Social Welfare for psychosocial counseling and temporary protective shelter.
              </div>
            </div>
          </Panel>
        </div>
      </>
    );
  }

  // --------------------------------------------------------------------------
  // BDC OFFICER DEDICATED DASHBOARD
  // --------------------------------------------------------------------------
  if (isBdc) {
    return (
      <>
        <PageHead
          title="Barangay Development Council (BDC) Dashboard"
          subtitle={
            user?.barangay?.name
              ? `Development planning, annual investment programs (AIP), and institutional monitoring for Barangay ${user.barangay.name}.`
              : "Development planning and annual investment programs (AIP) for your assigned scope."
          }
          breadcrumb="Governance / Overview"
          actions={
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Link href="/devplan" className="cbms-btn cbms-btn--primary">
                🧭 Manage BDP & AIP
              </Link>
              <Link href="/institutions" className="cbms-btn">
                🏛️ Institutions (BBI)
              </Link>
              <Link href="/reports" className="cbms-btn">
                📊 Reports
              </Link>
            </div>
          }
        />

        {/* Development Plan Top Highlights */}
        <StatGrid>
          <StatCard
            label="Total PPAs in Plan"
            value={num(projects.length)}
            icon="🧭"
            hint="BDP 2026–2028 & AIP Registry"
          />
          <StatCard
            label="Ongoing Projects"
            value={num(ongoingCount)}
            icon="🚧"
            tone="gold"
            hint="Under active implementation"
          />
          <StatCard
            label="Completed Projects"
            value={num(completedCount)}
            icon="✅"
            tone="green"
            hint="Delivered and operational"
          />
          <StatCard
            label="Total Programmed Budget"
            value={pesoAmount(totalBudget)}
            icon="💰"
            tone="navy"
            hint="Sum of all sector appropriations"
          />
        </StatGrid>

        <div style={{ height: 16 }} />

        {/* Baseline Demography & Community Metrics */}
        <StatGrid>
          <StatCard
            label="Total Inhabitants"
            value={num(dashboard?.population.inhabitants ?? 12840)}
            hint="Living residents on RBI"
            icon="👥"
          />
          <StatCard
            label="Registered Households"
            value={num(dashboard?.population.households ?? 3120)}
            hint="Registered household folders"
            icon="🏠"
          />
          <StatCard
            label="Senior Citizens"
            value={num(dashboard?.population.seniors ?? 1240)}
            hint="Sectoral target group"
            icon="🧓"
            tone="gold"
          />
          <StatCard
            label="Persons with Disability (PWD)"
            value={num(dashboard?.population.pwd ?? 312)}
            hint="Sectoral target group"
            icon="♿"
            tone="green"
          />
        </StatGrid>

        <div style={{ height: 16 }} />

        {/* Main 2-Column Overview */}
        <div className="cbms-grid-2">
          {/* Active Development Plan Card */}
          <Panel
            title={activePlan ? activePlan.title : "Executive-Legislative Development Plan"}
            actions={
              activePlan ? (
                <span className="adm-chiprow" style={{ display: "flex", gap: "0.4rem" }}>
                  <Chip tone="navy">Period: {activePlan.startYear}–{activePlan.endYear}</Chip>
                  <StatusChip status={activePlan.status} />
                </span>
              ) : undefined
            }
          >
            {activePlan ? (
              <div>
                <p style={{ margin: "0 0 1rem 0", fontSize: 13.5, lineHeight: 1.6 }}>
                  <strong style={{ color: "var(--cbms-navy)" }}>Executive Vision Statement — </strong>
                  {activePlan.vision ?? "No vision statement recorded."}
                </p>

                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "0.85rem" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b", marginBottom: "0.5rem" }}>
                    SECTORAL APPROPRIATIONS BREAKDOWN
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    <Chip tone="navy">🏗️ Infrastructure: {num(projects.filter((p) => p.sector === "infrastructure").length)}</Chip>
                    <Chip tone="green">🏥 Health: {num(projects.filter((p) => p.sector === "health").length)}</Chip>
                    <Chip tone="blue">🎓 Education: {num(projects.filter((p) => p.sector === "education").length)}</Chip>
                    <Chip tone="gold">🌾 Livelihood: {num(projects.filter((p) => p.sector === "livelihood").length)}</Chip>
                    <Chip tone="green">🌱 Environment: {num(projects.filter((p) => p.sector === "environment").length)}</Chip>
                    <Chip tone="red">🛡️ Peace & Order: {num(projects.filter((p) => p.sector === "peace_order").length)}</Chip>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyNote>Loading development plan...</EmptyNote>
            )}
          </Panel>

          {/* Barangay-Based Institutions (BBI) Status */}
          <Panel
            title="Barangay-Based Institutions (BBIs)"
            actions={
              <Link href="/institutions" style={{ fontSize: "0.82rem", color: "var(--color-primary, #0369a1)", fontWeight: 600 }}>
                View All Rosters →
              </Link>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {institutions.slice(0, 5).map((inst) => (
                <div
                  key={inst.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.5rem 0.75rem",
                    backgroundColor: "var(--color-bg-subtle, #f8fafc)",
                    borderRadius: "0.375rem",
                    border: "1px solid var(--color-border, #e2e8f0)",
                    fontSize: "0.85rem",
                  }}
                >
                  <div>
                    <strong>{inst.code}</strong> — {inst.name}
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {inst.members?.length ?? 0} official member(s)
                    </div>
                  </div>
                  <Chip tone={inst.isActive ? "green" : "gray"}>
                    {inst.isActive ? "Active BBI" : "Inactive"}
                  </Chip>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div style={{ height: 16 }} />

        {/* Priority BDP / AIP Projects Registry */}
        <Panel
          title="Priority BDP & AIP Programmes, Projects, and Activities"
          actions={
            <Link href="/devplan" className="cbms-btn cbms-btn--sm">
              🧭 Open BDP Matrix →
            </Link>
          }
          padded={false}
        >
          <DataTable
            columns={[
              {
                key: "title",
                header: "Project Title",
                render: (p: DevProject) => (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span className="cbms-table__primary" style={{ fontWeight: 600 }}>
                        {p.title}
                      </span>
                      {p.isLocked && <Chip tone="navy">🔒 Locked</Chip>}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Target Year: {p.targetYear}</div>
                  </div>
                ),
              },
              {
                key: "sector",
                header: "Sector",
                render: (p: DevProject) => (
                  <Chip tone={SECTOR_TONE[p.sector] ?? "gray"}>{titleize(p.sector)}</Chip>
                ),
              },
              {
                key: "budget",
                header: "Budget",
                align: "right",
                render: (p: DevProject) => <strong>{pesoAmount(p.budget)}</strong>,
              },
              {
                key: "fundingSource",
                header: "Funding Source",
                render: (p: DevProject) => <Chip tone="navy">{p.fundingSource ?? "NTA"}</Chip>,
              },
              {
                key: "status",
                header: "Status",
                render: (p: DevProject) => <StatusChip status={p.status} />,
              },
              {
                key: "progressPct",
                header: "Physical Accomplishment",
                width: 200,
                render: (p: DevProject) => (
                  <Progress
                    value={p.progressPct}
                    tone={p.progressPct >= 100 ? "green" : p.progressPct > 0 ? "navy" : "gold"}
                    label={`${p.progressPct}% physical accomplishment`}
                  />
                ),
              },
            ]}
            rows={projects.slice(0, 6)}
            empty="No BDP projects recorded."
          />
        </Panel>
      </>
    );
  }

  // --------------------------------------------------------------------------
  // GENERAL ADMIN / FUNCTIONARY DASHBOARD
  // --------------------------------------------------------------------------
  return (
    <>
      <PageHead
        title="Dashboard"
        subtitle={
          user?.barangay?.name
            ? `Operational picture for Barangay ${user.barangay.name}.`
            : "Operational picture for your assigned scope."
        }
        breadcrumb="Overview"
        actions={
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {isItOrAdmin && (
              <button
                type="button"
                onClick={() => setItControlsExpanded((prev) => !prev)}
                className="cbms-btn cbms-btn--sm"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  backgroundColor: itControlsExpanded ? "#eff6ff" : undefined,
                  color: itControlsExpanded ? "#1d4ed8" : undefined,
                  border: itControlsExpanded ? "1px solid #93c5fd" : undefined,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                title="Toggle IT Feature Controls Toolbar"
              >
                <span>🎛️</span>
                <span>IT Feature Controls</span>
                <Chip tone={itControlsExpanded ? "blue" : "gray"}>
                  {DASHBOARD_WIDGETS.filter((w) => isWidgetVisible(w.id)).length}/{DASHBOARD_WIDGETS.length}
                </Chip>
              </button>
            )}
            <Link href="/reports" className="cbms-btn">
              📊 Reports
            </Link>
          </div>
        }
      />

      {/* IT Role Feature Controls Toolbar (Direct on-dashboard widget visibility toggling) */}
      {isItOrAdmin && itControlsExpanded && (
        <div
          style={{
            marginBottom: "1.25rem",
            padding: "0.85rem 1.15rem",
            backgroundColor: "#f8fafc",
            borderRadius: "0.5rem",
            border: "1px solid #cbd5e1",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ fontSize: "1.3rem" }}>🎛️</span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <strong style={{ fontSize: "0.92rem", color: "#0f172a" }}>
                    IT Role Feature Controls — Dashboard Widget Visibility
                  </strong>
                  <Chip tone="navy">IT Officer Mode</Chip>
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                  Simple on/off switches to toggle visibility of widgets on the dashboard for all console users in real-time.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => enableAllWidgets(user?.fullName)}
                className="cbms-btn cbms-btn--sm"
                style={{ fontSize: "0.74rem", padding: "3px 8px" }}
              >
                ✓ Enable All
              </button>
              <button
                type="button"
                onClick={() => disableAllWidgets(user?.fullName)}
                className="cbms-btn cbms-btn--sm"
                style={{ fontSize: "0.74rem", padding: "3px 8px" }}
              >
                ✕ Disable All
              </button>
              <button
                type="button"
                onClick={() => resetToDefaults(user?.fullName)}
                className="cbms-btn cbms-btn--sm"
                style={{ fontSize: "0.74rem", padding: "3px 8px" }}
              >
                🔄 Reset
              </button>
              <Link
                href="/audit"
                className="cbms-btn cbms-btn--sm cbms-btn--primary"
                style={{ fontSize: "0.74rem", padding: "3px 8px" }}
              >
                IT Security Center →
              </Link>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "0.6rem",
              marginTop: "0.85rem",
              paddingTop: "0.75rem",
              borderTop: "1px solid #e2e8f0",
            }}
          >
            {DASHBOARD_WIDGETS.map((widget) => {
              const visible = isWidgetVisible(widget.id);
              return (
                <div
                  key={widget.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.45rem 0.65rem",
                    backgroundColor: visible ? "#ffffff" : "#f1f5f9",
                    borderRadius: "0.375rem",
                    border: visible ? "1px solid #cbd5e1" : "1px dashed #94a3b8",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", minWidth: 0 }}>
                    <span style={{ fontSize: "1rem" }}>{widget.icon}</span>
                    <span
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: visible ? "#0f172a" : "#64748b",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={widget.name}
                    >
                      {widget.name}
                    </span>
                  </div>
                  <FeatureToggleSwitch
                    id={`dash-toggle-${widget.id}`}
                    checked={visible}
                    onChange={() => toggleWidget(widget.id, user?.fullName)}
                    size="sm"
                    showBadge={false}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!dashboard && <Alert tone="info">Loading live counters from the API…</Alert>}

      {/* Demographic Stats Widget */}
      {isWidgetVisible("widget_population_stats") && (
        <StatGrid>
          <StatCard
            label="Inhabitants"
            value={num(dashboard?.population.inhabitants)}
            hint="Living residents on the RBI"
            icon="👥"
          />
          <StatCard
            label="Households"
            value={num(dashboard?.population.households)}
            hint="Registered household folders"
            icon="🏠"
          />
          <StatCard
            label="Senior citizens"
            value={num(dashboard?.population.seniors)}
            hint="Sectoral registry"
            icon="🧓"
            tone="gold"
          />
          <StatCard
            label="Persons with disability"
            value={num(dashboard?.population.pwd)}
            hint="Sectoral registry"
            icon="♿"
            tone="green"
          />
        </StatGrid>
      )}

      {/* Action Queue Stats (Only if user has actionable permissions and widget is enabled) */}
      {isWidgetVisible("widget_action_queue_stats") &&
        (can("issuance:view") || can("concerns:view") || can("sos:view") || can("kp:view") || can("wallet:manage")) && (
          <StatGrid>
            {can("issuance:view") && (
              <StatCard
                label="Certificates for approval"
                value={num(q?.certificatesForApproval)}
                hint="Awaiting the Punong Barangay"
                icon="📄"
                tone={q?.certificatesForApproval ? "red" : "navy"}
              />
            )}
            {can("concerns:view") && (
              <StatCard
                label="Open concerns (311)"
                value={num(q?.openConcerns)}
                hint="RA 11032 clock is running"
                icon="📣"
                tone={q?.openConcerns ? "gold" : "navy"}
              />
            )}
            {can("sos:view") && (
              <StatCard
                label="Active SOS"
                value={num(q?.activeSosAlerts)}
                hint="Live panic alerts"
                icon="🚨"
                tone={q?.activeSosAlerts ? "red" : "navy"}
              />
            )}
            {can("kp:view") && (
              <StatCard
                label="KP near deadline"
                value={num(q?.kpCasesNearDeadline)}
                hint={`${num(q?.kpCasesBreached)} already breached (RA 7160 §410)`}
                icon="⚖️"
                tone={q?.kpCasesBreached ? "red" : "gold"}
              />
            )}
            {can("wallet:manage") && (
              <StatCard
                label="Batches for approval"
                value={num(q?.disbursementBatchesForApproval)}
                hint="Maker–checker pending"
                icon="💸"
                tone={q?.disbursementBatchesForApproval ? "gold" : "navy"}
              />
            )}
          </StatGrid>
        )}

      {/* Grid: Needs your action & E-wallet/Satisfaction */}
      {(isWidgetVisible("widget_needs_action") || isWidgetVisible("widget_wallet_satisfaction")) && (
        <div className="cbms-grid-2">
          {isWidgetVisible("widget_needs_action") &&
            (can("issuance:view") || can("kp:view") || can("concerns:view") || can("sos:view") || can("wallet:manage")) && (
              <Panel title="Needs your action" padded={false}>
                <div style={{ padding: "6px 0" }}>
                  <ActionRow
                    href="/certificates?status=for_approval"
                    icon="📄"
                    label="Certificates awaiting approval"
                    count={q?.certificatesForApproval ?? 0}
                    show={can("issuance:view")}
                  />
                  <ActionRow
                    href="/kp"
                    icon="⚖️"
                    label="KP cases inside the statutory window"
                    count={q?.kpCasesNearDeadline ?? 0}
                    show={can("kp:view")}
                  />
                  <ActionRow
                    href="/concerns"
                    icon="📣"
                    label="Open 311 concerns"
                    count={q?.openConcerns ?? 0}
                    show={can("concerns:view")}
                  />
                  <ActionRow
                    href="/sos"
                    icon="🚨"
                    label="Active SOS alerts"
                    count={q?.activeSosAlerts ?? 0}
                    show={can("sos:view")}
                  />
                  <ActionRow
                    href="/wallet/batches"
                    icon="💸"
                    label="Disbursement batches for approval"
                    count={q?.disbursementBatchesForApproval ?? 0}
                    show={can("wallet:manage")}
                  />
                </div>
              </Panel>
            )}

          {isWidgetVisible("widget_wallet_satisfaction") && (can("wallet:manage") || can("reports:view")) && (
            <Panel title="E-wallet & satisfaction">
              <div className="cbms-kv">
                {can("wallet:manage") && (
                  <>
                    <div className="cbms-kv__k">Registered resident wallets</div>
                    <div className="cbms-kv__v">{num(dashboard?.wallet.registeredWallets)}</div>
                    <div className="cbms-kv__k">Transactions (30 days)</div>
                    <div className="cbms-kv__v">{num(dashboard?.wallet.transactions30d)}</div>
                    <div className="cbms-kv__k">Volume (30 days)</div>
                    <div className="cbms-kv__v">{peso(dashboard?.wallet.volume30dCentavos ?? "0")}</div>
                  </>
                )}
                <div className="cbms-kv__k">CSM responses (30 days)</div>
                <div className="cbms-kv__v">{num(dashboard?.satisfaction.responses30d)}</div>
                <div className="cbms-kv__k">Average rating</div>
                <div className="cbms-kv__v">
                  {(dashboard?.satisfaction.averageRating ?? 0).toFixed(2)} / 5.00
                </div>
              </div>
              <div className="adm-kpi-note">
                E-wallet and the resident self-service suite are <strong>CBMS-exclusive</strong> —
                they have no LGUSS-BIMS counterpart.
              </div>
            </Panel>
          )}
        </div>
      )}

      {/* KP cases approaching statutory deadline */}
      {isWidgetVisible("widget_kp_deadline") && can("kp:view") && (
        <>
          <div style={{ height: 16 }} />
          <Panel title="KP cases approaching the RA 7160 §410 deadline" padded={false}>
            {dashboard && dashboard.kpAtRisk.length === 0 ? (
              <EmptyNote>No case is within five days of its statutory deadline.</EmptyNote>
            ) : (
              <DataTable
                columns={[
                  {
                    key: "caseNo",
                    header: "Case",
                    render: (r) => <span className="cbms-table__primary">{r.caseNo}</span>,
                  },
                  { key: "stage", header: "Stage", render: (r) => <StatusChip status={r.stage} /> },
                  { key: "filedAt", header: "Filed", render: (r) => date(r.filedAt) },
                  {
                    key: "deadline",
                    header: "Deadline",
                    render: (r) => (
                      <DeadlineCell
                        dueAt={r.dueAt}
                        daysRemaining={r.daysRemaining}
                        breached={r.breached}
                      />
                    ),
                  },
                ]}
                rows={dashboard?.kpAtRisk ?? []}
                empty="No case is within five days of its statutory deadline."
                onRowClick={(r) => {
                  window.location.href = `/kp/${r.id}`;
                }}
              />
            )}
          </Panel>
        </>
      )}

      {/* Grid: 311 concerns & Live SOS */}
      {(isWidgetVisible("widget_recent_concerns") || isWidgetVisible("widget_live_sos")) && (
        <>
          <div style={{ height: 16 }} />
          <div className="cbms-grid-2">
            {isWidgetVisible("widget_recent_concerns") && can("concerns:view") && (
              <Panel title="Newest 311 concerns" padded={false}>
                <Async loading={concerns.loading} error={concerns.error}>
                  <DataTable
                    columns={[
                      { key: "referenceNo", header: "Ref." },
                      { key: "category", header: "Category" },
                      {
                        key: "status",
                        header: "Status",
                        render: (r) => (
                          <span className="adm-chiprow">
                            <StatusChip status={r.status} />
                            {r.slaBreached && <Chip tone="red">SLA breached</Chip>}
                          </span>
                        ),
                      },
                      { key: "createdAt", header: "Filed", render: (r) => date(r.createdAt) },
                    ]}
                    rows={concerns.data?.items ?? []}
                    empty="No unacknowledged concerns."
                  />
                </Async>
              </Panel>
            )}

            {isWidgetVisible("widget_live_sos") && can("sos:view") && (
              <Panel title="Live SOS board" padded={false}>
                <Async loading={sos.loading} error={sos.error}>
                  <DataTable
                    columns={[
                      { key: "kind", header: "Kind", render: (r) => <StatusChip status={r.kind} /> },
                      {
                        key: "inhabitant",
                        header: "Resident",
                        render: (r) =>
                          r.inhabitant ? `${r.inhabitant.firstName} ${r.inhabitant.lastName}` : "Anonymous",
                      },
                      { key: "status", header: "Status", render: (r) => <StatusChip status={r.status} /> },
                      {
                        key: "createdAt",
                        header: "Raised",
                        render: (r) => new Date(r.createdAt).toLocaleTimeString("en-PH"),
                      },
                    ]}
                    rows={activeSos}
                    empty="No active alerts. All quiet."
                  />
                </Async>
              </Panel>
            )}
          </div>
        </>
      )}

      {/* Disbursement Batches waiting for checker */}
      {isWidgetVisible("widget_disbursement_batches") && can("wallet:manage") && forApproval.length > 0 && (
        <>
          <div style={{ height: 16 }} />
          <Panel title="Disbursement batches waiting for a checker" padded={false}>
            <DataTable
              columns={[
                { key: "batchNo", header: "Batch" },
                { key: "title", header: "Title" },
                { key: "kind", header: "Kind", render: (r) => <StatusChip status={r.kind} /> },
                { key: "itemCount", header: "Payees", align: "right" },
                {
                  key: "totalCentavos",
                  header: "Total",
                  align: "right",
                  render: (r) => peso(r.totalCentavos),
                },
              ]}
              rows={forApproval}
              onRowClick={(r) => {
                window.location.href = `/wallet/batches/${r.id}`;
              }}
            />
          </Panel>
        </>
      )}

      {/* Fallback when all widgets are toggled off by IT policy */}
      {DASHBOARD_WIDGETS.every((w) => !isWidgetVisible(w.id)) && (
        <Panel title="All Dashboard Widgets Hidden">
          <div style={{ padding: "2.5rem 1rem", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🎛️</div>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--color-text, #0f172a)" }}>
              All widgets have been toggled off by IT policy
            </h3>
            <p style={{ margin: "0 0 1.25rem 0", color: "#64748b", fontSize: "0.875rem" }}>
              An IT Officer has temporarily hidden all operational dashboard widgets.
            </p>
            {isItOrAdmin && (
              <Button
                variant="primary"
                onClick={() => enableAllWidgets(user?.fullName)}
              >
                Restore All Dashboard Widgets
              </Button>
            )}
          </div>
        </Panel>
      )}
    </>
  );
}

function ActionRow(props: {
  href: string;
  icon: string;
  label: string;
  count: number;
  show: boolean;
}) {
  if (!props.show) return null;
  return (
    <Link
      href={props.href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 18px",
        borderBottom: "1px solid #f1f5f9",
        fontSize: 13.5,
      }}
    >
      <span style={{ fontSize: 18 }}>{props.icon}</span>
      <span style={{ flex: 1 }}>{props.label}</span>
      <Chip tone={props.count > 0 ? "red" : "gray"}>{props.count}</Chip>
    </Link>
  );
}
