"use client";

import * as React from "react";
import Link from "next/link";
import {
  checkSubdomainAvailability,
  createInvitation,
  recruitTenantMember,
  switchActiveTenant,
  updateTenant,
  type TenantInfo,
  type UpdateTenantPayload,
} from "@cbms/api-client";
import {
  Alert,
  Button,
  Chip,
  DataTable,
  Field,
  KeyValue,
  PageHead,
  Panel,
  StatCard,
  StatGrid,
  StatusChip,
  Toolbar,
  num,
} from "@cbms/ui";
import { ActionResult, Async } from "../../../../components/common";

const ISOLATION_MODE_LABELS: Record<string, { label: string; desc: string; tone: "blue" | "navy" | "green" }> = {
  shared_db: {
    label: "Shared RDBMS",
    desc: "Row-Level Security (RLS) partition in primary cluster",
    tone: "blue",
  },
  isolated_schema: {
    label: "Schema-Isolated",
    desc: "Dedicated PostgreSQL schema namespace (brgy_*)",
    tone: "navy",
  },
  dedicated_db: {
    label: "Dedicated DB",
    desc: "Separate high-compliance database instance",
    tone: "green",
  },
};
import { ROLE_LABELS } from "../../../../lib/labels";
import { useRbacStore } from "../../../../lib/rbac-store";
import {
  useCreateTenantMutation,
  useRevokeTenantInvitationMutation,
  useTenantInvitationsQuery,
  useTenantMembersQuery,
  useTenantsQuery,
  useUpdateTenantMutation,
} from "../../../../lib/rbac-queries";

interface ProvisionedDossier {
  tenant: TenantInfo;
  primaryMember?: {
    name: string;
    email: string;
    role: string;
    tempPassword?: string;
  };
  inviteLink?: string;
  inviteEmail?: string;
  inviteRole?: string;
}

export default function BarangayOnboardingPage() {
  const user = useRbacStore((s) => s.user);
  const activeTenant = useRbacStore((s) => s.activeTenant);
  const setActiveTenant = useRbacStore((s) => s.setActiveTenant);
  const hasRole = useRbacStore((s) => s.hasRole);

  const tenantsQuery = useTenantsQuery();
  const createTenantMutation = useCreateTenantMutation();

  const currentTenantId = activeTenant?.id || user?.tenantId || "tnt-barangka";
  const updateTenantMutation = useUpdateTenantMutation(currentTenantId);
  const membersQuery = useTenantMembersQuery(currentTenantId);
  const invitationsQuery = useTenantInvitationsQuery(currentTenantId);
  const revokeInviteMutation = useRevokeTenantInvitationMutation(currentTenantId);

  const canProvisionNewBarangay =
    hasRole("SYSTEM_ADMIN") ||
    user?.scope === "platform" ||
    user?.email?.toLowerCase().startsWith("admin@") ||
    user?.email?.toLowerCase().includes("orcha") ||
    user?.email?.toLowerCase().includes("superadmin");

  const [mode, setMode] = React.useState<"list" | "provision" | "workspace-setup">("list");
  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);

  // Table search & filter state
  const [q, setQ] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [modeFilter, setModeFilter] = React.useState<string>("all");
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  // Step 1: Barangay Identity & Subdomain State
  const [brgyName, setBrgyName] = React.useState("");
  const [brgyCode, setBrgyCode] = React.useState("");
  const [subdomain, setSubdomain] = React.useState("");
  const [customDomain, setCustomDomain] = React.useState("");
  const [psgcCode, setPsgcCode] = React.useState("137402017");
  const [cityId, setCityId] = React.useState("city-marikina");
  const [dbMode, setDbMode] = React.useState<"shared_db" | "isolated_schema" | "dedicated_db">(
    "shared_db",
  );

  // Subdomain availability check state
  const [checkingSubdomain, setCheckingSubdomain] = React.useState(false);
  const [subdomainStatus, setSubdomainStatus] = React.useState<{
    available: boolean;
    subdomain: string;
    reason?: string;
  } | null>(null);

  // Step 2: Initial Executive & Staff Onboarding State
  const [leadershipMode, setLeadershipMode] = React.useState<"both" | "direct" | "invite">("both");
  const [execName, setExecName] = React.useState("");
  const [execEmail, setExecEmail] = React.useState("");
  const [execPhone, setExecPhone] = React.useState("+63 917 555 0100");
  const [execRole, setExecRole] = React.useState("PUNONG_BARANGAY");
  const [execPassword, setExecPassword] = React.useState("Password123!");
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState("BARANGAY_SECRETARY");

  // Step 3: Operational & DILG Statutory Defaults
  const [hallAddress, setHallAddress] = React.useState("");
  const [hallPhone, setHallPhone] = React.useState("(02) 8646-0000");
  const [emergencyHotline, setEmergencyHotline] = React.useState("161 / +63 917 911 0000");
  const [purokCount, setPurokCount] = React.useState(7);
  const [clearanceFee, setClearanceFee] = React.useState(50);
  const [residencyFee, setResidencyFee] = React.useState(50);
  const [businessClearanceFee, setBusinessClearanceFee] = React.useState(250);

  // Execution & Handover State
  const [provisioning, setProvisioning] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ ok: boolean; message: string } | null>(null);
  const [dossier, setDossier] = React.useState<ProvisionedDossier | null>(null);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  // Active Workspace Self-Setup State (Tab 2)
  const parsedCurrentSettings = React.useMemo(() => {
    if (!activeTenant?.settings) return {};
    if (typeof activeTenant.settings === "object") return activeTenant.settings;
    try {
      return JSON.parse(activeTenant.settings);
    } catch {
      return {};
    }
  }, [activeTenant]);

  const [wsAddress, setWsAddress] = React.useState(
    parsedCurrentSettings.hallAddress || "Barangay Hall Compound, Marikina City",
  );
  const [wsHotline, setWsHotline] = React.useState(
    parsedCurrentSettings.emergencyHotline || "161 / (02) 8646-2436",
  );
  const [wsPuroks, setWsPuroks] = React.useState<number>(
    Number(parsedCurrentSettings.purokCount) || 7,
  );
  const [wsClearanceFee, setWsClearanceFee] = React.useState<number>(
    Number(parsedCurrentSettings.fees?.barangayClearance ?? 50),
  );
  const [wsCustomDomain, setWsCustomDomain] = React.useState(activeTenant?.customDomain || "");

  React.useEffect(() => {
    setWsAddress(
      parsedCurrentSettings.hallAddress ||
        `${activeTenant?.name || "Barangay"} Hall, Marikina City`,
    );
    setWsHotline(parsedCurrentSettings.emergencyHotline || "161 / (02) 8646-2436");
    setWsPuroks(Number(parsedCurrentSettings.purokCount) || 7);
    setWsClearanceFee(Number(parsedCurrentSettings.fees?.barangayClearance ?? 50));
    setWsCustomDomain(activeTenant?.customDomain || "");
  }, [activeTenant, parsedCurrentSettings]);

  // Auto-derive code, subdomain, and default emails when Barangay Name changes
  function handleNameChange(val: string) {
    setBrgyName(val);
    const stripped = val.replace(/^barangay\s+/i, "").trim();
    const generatedCode = stripped
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    const generatedSub = stripped
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 24);

    setBrgyCode(generatedCode);
    setSubdomain(generatedSub);
    if (generatedSub) {
      setExecEmail(`kapitan@${generatedSub}.gov.ph`);
      setInviteEmail(`secretary@${generatedSub}.gov.ph`);
      setHallAddress(`Barangay ${stripped} Hall, Marikina City, Metro Manila`);
    }
  }

  // Debounced Subdomain Availability Check
  React.useEffect(() => {
    const clean = subdomain.trim().toLowerCase();
    if (!clean || clean.length < 2) {
      setSubdomainStatus(null);
      return;
    }
    let cancelled = false;
    setCheckingSubdomain(true);
    const timer = setTimeout(async () => {
      try {
        const res = await checkSubdomainAvailability(clean);
        if (!cancelled) {
          setSubdomainStatus(res);
        }
      } catch {
        if (!cancelled) {
          setSubdomainStatus(null);
        }
      } finally {
        if (!cancelled) {
          setCheckingSubdomain(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [subdomain]);

  async function handleProvisionSubmit() {
    setProvisioning(true);
    setFeedback(null);
    try {
      const cleanName = brgyName.replace(/^barangay\s+/i, "").trim();
      const settingsPayload = {
        hallAddress,
        hallPhone,
        emergencyHotline,
        purokCount,
        fees: {
          barangayClearance: clearanceFee,
          indigencyCertificate: 0,
          residencyCertificate: residencyFee,
          businessClearance: businessClearanceFee,
        },
        modules: {
          rbi: true,
          issuance: true,
          kp: true,
          vawc: true,
          treasury: true,
          drrm: true,
        },
        onboardedAt: new Date().toISOString(),
        onboardedBy: user?.email || "sysadmin@cbms.gov.ph",
      };

      // 1. Create the Barangay Tenant in PostgreSQL
      const createdRes = await createTenantMutation.mutateAsync({
        name: cleanName || brgyName.trim(),
        code: brgyCode.trim().toUpperCase(),
        subdomain: subdomain.trim().toLowerCase(),
        customDomain: customDomain.trim() ? customDomain.trim() : undefined,
        cityId: cityId.trim() || "city-marikina",
        psgcCode: psgcCode.trim() || undefined,
        mode: dbMode,
        settings: settingsPayload,
      });

      const createdTenant = createdRes.tenant;
      const resultDossier: ProvisionedDossier = {
        tenant: createdTenant,
      };

      // 2. Provision Initial Executive Account if selected
      if ((leadershipMode === "both" || leadershipMode === "direct") && execEmail.trim()) {
        try {
          await recruitTenantMember(createdTenant.id, {
            name: execName.trim() || `Punong Barangay (${createdTenant.name})`,
            email: execEmail.trim().toLowerCase(),
            password: execPassword,
            role: execRole,
            phoneNumber: execPhone.trim() || undefined,
            canCreate: true,
            canRead: true,
            canUpdate: true,
            canDelete: true,
          });
          resultDossier.primaryMember = {
            name: execName.trim() || `Punong Barangay (${createdTenant.name})`,
            email: execEmail.trim().toLowerCase(),
            role: execRole,
            tempPassword: execPassword,
          };
        } catch (memberErr: any) {
          console.warn("[Onboarding] Primary member recruitment notice:", memberErr);
        }
      }

      // 3. Generate Single-Use Staff Invite Token if selected
      const targetInviteEmail =
        leadershipMode === "invite" ? execEmail.trim() : inviteEmail.trim();
      const targetInviteRole = leadershipMode === "invite" ? execRole : inviteRole;

      if ((leadershipMode === "both" || leadershipMode === "invite") && targetInviteEmail) {
        try {
          const invRes = await createInvitation(createdTenant.id, {
            email: targetInviteEmail.toLowerCase(),
            role: targetInviteRole,
            expiresDays: 7,
          });
          const token = invRes?.invitation?.token;
          const link =
            typeof window !== "undefined" && token
              ? `${window.location.origin}/login?invite=${token}`
              : invRes?.inviteUrl || token;
          resultDossier.inviteLink = link;
          resultDossier.inviteEmail = targetInviteEmail.toLowerCase();
          resultDossier.inviteRole = targetInviteRole;
        } catch (invErr: any) {
          console.warn("[Onboarding] Invitation token generation notice:", invErr);
        }
      }

      setDossier(resultDossier);
      setStep(4);
      setFeedback({
        ok: true,
        message: `Barangay ${createdTenant.name} (${createdTenant.id}) has been provisioned and isolated in PostgreSQL!`,
      });
    } catch (err: any) {
      setFeedback({
        ok: false,
        message: err?.message || "Failed to provision new barangay tenant.",
      });
    } finally {
      setProvisioning(false);
    }
  }

  async function handleSaveWorkspaceSettings(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    try {
      await updateTenantMutation.mutateAsync({
        customDomain: wsCustomDomain.trim() || undefined,
        settings: {
          ...parsedCurrentSettings,
          hallAddress: wsAddress,
          emergencyHotline: wsHotline,
          purokCount: wsPuroks,
          fees: {
            ...(parsedCurrentSettings.fees || {}),
            barangayClearance: wsClearanceFee,
            indigencyCertificate: 0,
          },
          lastConfiguredAt: new Date().toISOString(),
        },
      });
      setFeedback({
        ok: true,
        message: `Updated operational configuration for Barangay ${activeTenant?.name || currentTenantId}.`,
      });
    } catch (err: any) {
      setFeedback({
        ok: false,
        message: err?.message || "Failed to save workspace configuration.",
      });
    }
  }

  function copyText(key: string, value: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  }

  const allTenants = tenantsQuery.data ?? [];
  const currentMembers = membersQuery.data?.items ?? [];
  const currentInvitations = invitationsQuery.data ?? [];

  const filteredTenants = React.useMemo(() => {
    return allTenants.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (modeFilter !== "all" && t.mode !== modeFilter) return false;
      if (!q.trim()) return true;
      const needle = q.trim().toLowerCase();
      return (
        t.name.toLowerCase().includes(needle) ||
        t.code.toLowerCase().includes(needle) ||
        t.subdomain.toLowerCase().includes(needle) ||
        (t.psgcCode && t.psgcCode.toLowerCase().includes(needle)) ||
        t.id.toLowerCase().includes(needle)
      );
    });
  }, [allTenants, q, statusFilter, modeFilter]);

  async function handleUpdateTenant(tenant: TenantInfo, patch: UpdateTenantPayload, actionLabel: string) {
    setUpdatingId(tenant.id);
    setFeedback(null);
    try {
      const res = await updateTenant(tenant.id, patch);
      if (activeTenant?.id === tenant.id && res.tenant) {
        setActiveTenant(res.tenant);
      }
      await tenantsQuery.refetch();
      setFeedback({
        ok: true,
        message: `Successfully updated ${tenant.name}: ${actionLabel}.`,
      });
    } catch (err: any) {
      setFeedback({
        ok: false,
        message: err?.message || `Failed to update tenant ${tenant.name}.`,
      });
    } finally {
      setUpdatingId(null);
    }
  }

  function handleWorkspaceSwitch(tenant: TenantInfo) {
    switchActiveTenant(tenant);
    setActiveTenant(tenant);
    setFeedback({
      ok: true,
      message: `Switched active workspace to Barangay ${tenant.name.replace(/^Barangay\s+/i, "")} (${tenant.subdomain}.cbms.gov.ph).`,
    });
  }

  // Calculate 6-point readiness checklist for Tab 2
  const readinessChecks = [
    {
      id: "tenant",
      label: "Multi-Tenant Database Isolation Active",
      done: !!activeTenant?.id,
      detail: `${activeTenant?.id || currentTenantId} (${activeTenant?.mode || "shared_db"})`,
    },
    {
      id: "subdomain",
      label: "Official Subdomain & PSGC Bound",
      done: !!activeTenant?.subdomain,
      detail: `${activeTenant?.subdomain || "barangka"}.cbms.gov.ph · PSGC ${activeTenant?.psgcCode || "137402001"}`,
    },
    {
      id: "exec",
      label: "Punong Barangay / Executive Admin Provisioned",
      done: currentMembers.some(
        (m) => m.role === "PUNONG_BARANGAY" || m.role === "BARANGAY_SECRETARY",
      ),
      detail: `${currentMembers.length} active personnel bound to tenant`,
    },
    {
      id: "hall",
      label: "Barangay Hall Address & 24/7 Emergency Hotline",
      done: !!wsAddress && !!wsHotline,
      detail: `${wsAddress} · Hotline: ${wsHotline}`,
    },
    {
      id: "fees",
      label: "RA 11261 & Statutory Clearance Fee Schedule",
      done: wsClearanceFee >= 0,
      detail: `Clearance: ₱${wsClearanceFee} · Indigency: ₱0 (Free)`,
    },
    {
      id: "roster",
      label: "Departmental RBAC Staff Roster (>3 Roles)",
      done: currentMembers.length >= 3,
      detail: `${currentMembers.length} staff accounts / ${currentInvitations.length} pending invite tokens`,
    },
  ];
  const completedChecksCount = readinessChecks.filter((c) => c.done).length;

  return (
    <>
      <PageHead
        title="Barangays"
        breadcrumb="Super Admin · Onboarding Engine"
      />

      <ActionResult
        error={feedback && !feedback.ok ? feedback.message : undefined}
        success={feedback && feedback.ok ? feedback.message : undefined}
      />

      <StatGrid>
        <StatCard
          label="Total Onboarded Barangays"
          value={num(allTenants.length || 16)}
          hint={`${allTenants.filter((t) => t.status === "active").length || 16} active · ${allTenants.filter((t) => t.status === "suspended").length} suspended`}
          icon="🏛️"
          tone="navy"
        />
        <StatCard
          label="Active Workspace"
          value={activeTenant?.name ? `Brgy. ${activeTenant.name}` : currentTenantId}
          hint={`${activeTenant?.subdomain || "barangka"}.cbms.gov.ph`}
          icon="🌐"
          tone="green"
        />
        <StatCard
          label="Workspace Readiness"
          value={`${completedChecksCount} / ${readinessChecks.length}`}
          hint="DILG MC 2025-104 Onboarding Score"
          icon="✅"
          tone={completedChecksCount === readinessChecks.length ? "green" : "gold"}
        />
        <StatCard
          label="Pending Invite Tokens"
          value={num(currentInvitations.filter((i) => i.status === "pending").length)}
          hint="7-day single-use staff links"
          icon="✉️"
          tone="navy"
        />
      </StatGrid>

     
      {mode === "list" && (
        <Panel
          title="List of Onboarded Barangays"
         
        >
          <Toolbar>
            <input
              className="cbms-input cbms-input--search"
              type="search"
              placeholder="Search by Barangay name, subdomain, code, or PSGC…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ maxWidth: 340 }}
            />

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--cbms-muted)", textTransform: "uppercase" }}>
                Status:
              </span>
              {[
                { id: "all", label: "All" },
                { id: "active", label: "Active" },
                { id: "suspended", label: "Suspended" },
              ].map((sf) => (
                <button
                  key={sf.id}
                  type="button"
                  onClick={() => setStatusFilter(sf.id)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 9999,
                    fontSize: "0.76rem",
                    fontWeight: 600,
                    border: statusFilter === sf.id ? "1px solid #2563eb" : "1px solid #cbd5e1",
                    backgroundColor: statusFilter === sf.id ? "#eff6ff" : "#ffffff",
                    color: statusFilter === sf.id ? "#1d4ed8" : "#475569",
                    cursor: "pointer",
                  }}
                >
                  {sf.label}
                </button>
              ))}

              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--cbms-muted)", textTransform: "uppercase", marginLeft: 8 }}>
                DB Mode:
              </span>
              {[
                { id: "all", label: "All Modes" },
                { id: "shared_db", label: "Shared RDBMS" },
                { id: "isolated_schema", label: "Schema-Isolated" },
                { id: "dedicated_db", label: "Dedicated DB" },
              ].map((mf) => (
                <button
                  key={mf.id}
                  type="button"
                  onClick={() => setModeFilter(mf.id)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 9999,
                    fontSize: "0.76rem",
                    fontWeight: 600,
                    border: modeFilter === mf.id ? "1px solid #16a34a" : "1px solid #cbd5e1",
                    backgroundColor: modeFilter === mf.id ? "#f0fdf4" : "#ffffff",
                    color: modeFilter === mf.id ? "#15803d" : "#475569",
                    cursor: "pointer",
                  }}
                >
                  {mf.label}
                </button>
              ))}
            </div>

            <div className="cbms-toolbar__spacer" />
            <span style={{ fontSize: 12.5, color: "var(--cbms-muted)", marginRight: 8 }}>
              Showing {num(filteredTenants.length)} of {num(allTenants.length)} barangays
            </span>
            <Button
              variant="primary"
              onClick={() => {
                setMode("provision");
                setStep(1);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.82rem",
                fontWeight: 700,
                padding: "0.4rem 0.9rem",
                whiteSpace: "nowrap",
              }}
            >
              <span>🚀</span>
              <span>+ Onboard Barangay</span>
            </Button>
          </Toolbar>

          <Async
            loading={tenantsQuery.isLoading}
            error={tenantsQuery.error ? { message: (tenantsQuery.error as Error).message } : null}
          >
            <DataTable<TenantInfo>
              columns={[
                {
                  key: "tenant",
                  header: "Barangay Tenant & Subdomain",
                  width: 250,
                  render: (t: TenantInfo) => {
                    const isCurrent = activeTenant?.id === t.id;
                    return (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span className="cbms-table__primary" style={{ fontWeight: 700 }}>
                            {t.name}
                          </span>
                          {isCurrent && <Chip tone="green">Current Workspace</Chip>}
                        </div>
                        <div className="cbms-table__muted" style={{ marginTop: 2 }}>
                          <code style={{ color: "#2563eb", fontWeight: 600 }}>
                            {t.subdomain}.cbms.gov.ph
                          </code>
                          {t.code ? ` · ${t.code}` : ""}
                        </div>
                      </div>
                    );
                  },
                },
                {
                  key: "psgc",
                  header: "PSGC / Geo Code",
                  width: 150,
                  render: (t: TenantInfo) => (
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                        {t.psgcCode || "137402001"}
                      </div>
                      <div className="cbms-table__muted">
                        {t.cityId ? `City ID: ${t.cityId}` : "Marikina City"}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "mode",
                  header: "Database Isolation Mode",
                  width: 200,
                  render: (t: TenantInfo) => {
                    const isBusy = updatingId === t.id;
                    const currentMode = t.mode || "shared_db";
                    return (
                      <div>
                        <select
                          className="cbms-select"
                          disabled={isBusy}
                          value={currentMode}
                          onChange={(e) => {
                            const nextMode = e.target.value as "shared_db" | "isolated_schema" | "dedicated_db";
                            handleUpdateTenant(
                              t,
                              { mode: nextMode },
                              `changed database mode to ${ISOLATION_MODE_LABELS[nextMode]?.label || nextMode}`
                            );
                          }}
                          style={{ fontSize: "0.78rem", padding: "4px 8px" }}
                        >
                          <option value="shared_db">Shared RDBMS (RLS Row Filter)</option>
                          <option value="isolated_schema">Isolated Schema (brgy_* namespace)</option>
                          <option value="dedicated_db">Dedicated DB Instance</option>
                        </select>
                        <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>
                          {ISOLATION_MODE_LABELS[currentMode]?.desc}
                        </div>
                      </div>
                    );
                  },
                },
                {
                  key: "status",
                  header: "Operational State",
                  width: 130,
                  render: (t: TenantInfo) => {
                    const isBusy = updatingId === t.id;
                    const isActive = t.status === "active";
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <StatusChip status={t.status || "active"} />
                        <Button
                          size="sm"
                          variant={isActive ? "secondary" : "primary"}
                          disabled={isBusy}
                          onClick={() => {
                            const nextStatus = isActive ? "suspended" : "active";
                            handleUpdateTenant(
                              t,
                              { status: nextStatus },
                              nextStatus === "active" ? "reactivated operational fleet" : "suspended tenant operations"
                            );
                          }}
                          style={{ fontSize: "0.72rem", padding: "2px 6px" }}
                        >
                          {isBusy ? "Updating…" : isActive ? "Pause Fleet" : "Activate"}
                        </Button>
                      </div>
                    );
                  },
                },
                {
                  key: "actions",
                  header: "Workspace Actions",
                  align: "right",
                  width: 200,
                  render: (t: TenantInfo) => {
                    const isCurrent = activeTenant?.id === t.id;
                    return (
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                        {!isCurrent && (
                          <Button
                            size="sm"
                            variant="primary"
                            type="button"
                            onClick={() => handleWorkspaceSwitch(t)}
                            style={{ fontSize: "0.76rem", padding: "4px 10px" }}
                          >
                            Switch Workspace
                          </Button>
                        )}
                        <a
                          className="cbms-btn cbms-btn--sm"
                          href={`http://localhost:3000/?psgc=${t.psgcCode || "137402001"}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Open resident public portal"
                          style={{ fontSize: "0.76rem", padding: "4px 8px" }}
                        >
                          Public ↗
                        </a>
                      </div>
                    );
                  },
                },
              ]}
              rows={filteredTenants}
              empty="No matching barangay tenants found."
            />
          </Async>
        </Panel>
      )}

      {mode === "provision" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <button
              type="button"
              onClick={() => setMode("list")}
              className="cbms-btn cbms-btn--secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            >
              <span>←</span>
              <span>Back to Onboarded Barangays List</span>
            </button>
            <span style={{ fontSize: "0.85rem", color: "var(--cbms-muted)", fontWeight: 600 }}>
              Step {step} of 4: New Barangay Onboarding Wizard
            </span>
          </div>
          {/* Stepper Indicator - Connected Line with Circles */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              padding: "24px 20px 22px",
              marginBottom: 24,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              overflowX: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                minWidth: 640,
                position: "relative",
              }}
            >
              {[
                {
                  num: 1 as const,
                  title: "Identity & Routing",
                  sub: "Barangay Name, Subdomain & DB",
                },
                {
                  num: 2 as const,
                  title: "Executive Leadership",
                  sub: "Punong Barangay & Credentials",
                },
                {
                  num: 3 as const,
                  title: "Statutory Defaults",
                  sub: "Hall Office, Puroks & Fees",
                },
                {
                  num: 4 as const,
                  title: "Provision & Handover",
                  sub: "Tenant Creation & Dossier",
                },
              ].map((s, idx, arr) => {
                const isCompleted = step > s.num || (s.num === 4 && !!dossier);
                const isActive = step === s.num;
                const isLast = idx === arr.length - 1;

                return (
                  <React.Fragment key={s.num}>
                    {/* Circle Node & Labels */}
                    <button
                      type="button"
                      onClick={() => setStep(s.num)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: 145,
                        flexShrink: 0,
                        textAlign: "center",
                        position: "relative",
                        zIndex: 2,
                      }}
                    >
                      {/* Circle */}
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: isCompleted ? "1.05rem" : "0.95rem",
                          transition: "all 0.25s ease-in-out",
                          background: isCompleted
                            ? "#16a34a"
                            : isActive
                              ? "#1e3a8a"
                              : "#ffffff",
                          color: isCompleted || isActive ? "#ffffff" : "#64748b",
                          border: isCompleted
                            ? "2px solid #16a34a"
                            : isActive
                              ? "2px solid #1e3a8a"
                              : "2px solid #cbd5e1",
                          boxShadow: isActive
                            ? "0 0 0 4px #dbeafe, 0 4px 6px -1px rgba(30, 58, 138, 0.2)"
                            : isCompleted
                              ? "0 2px 4px rgba(22, 163, 74, 0.25)"
                              : "none",
                        }}
                      >
                        {isCompleted ? "✓" : s.num}
                      </div>

                      {/* Step Title & Subtitle */}
                      <div
                        style={{
                          marginTop: 10,
                          fontSize: "0.84rem",
                          fontWeight: isActive ? 800 : isCompleted ? 700 : 600,
                          color: isActive ? "#1e3a8a" : isCompleted ? "#15803d" : "#334155",
                          lineHeight: 1.3,
                        }}
                      >
                        {s.title}
                      </div>
                      <div
                        style={{
                          marginTop: 3,
                          fontSize: "0.72rem",
                          color: isActive ? "#2563eb" : "#94a3b8",
                          fontWeight: isActive ? 600 : 400,
                        }}
                      >
                        {s.sub}
                      </div>
                    </button>

                    {/* Connecting Line Segment between nodes */}
                    {!isLast && (
                      <div
                        style={{
                          flex: 1,
                          height: 3,
                          marginTop: 19,
                          marginLeft: -8,
                          marginRight: -8,
                          background: step > s.num ? "#16a34a" : "#e2e8f0",
                          transition: "background 0.3s ease",
                          position: "relative",
                          zIndex: 1,
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {!canProvisionNewBarangay && (
            <div style={{ marginBottom: 14 }}>
              <Alert tone="danger">
                <strong>Access Restricted to ORCHA Platform Operations:</strong> Barangay tenant provisioning, PostgreSQL cluster partitioning, and initial credential issuance are managed exclusively by the ORCHA cloud engineering team. Client Barangays and local officials cannot provision new tenants.
              </Alert>
            </div>
          )}

          {step === 1 && (
            <Panel title="Step 1 — Barangay Identity, PSGC & Multi-Tenant Routing">
              <div className="cbms-grid-2" style={{ gap: 14 }}>
                <Field
                  label="Official Barangay Name"
                  hint="Enter the barangay name (e.g., San Isidro, Sta. Teresita)."
                >
                  <input
                    className="cbms-input"
                    placeholder="e.g. San Isidro"
                    value={brgyName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </Field>

                <Field
                  label="Official Tenant Code"
                  hint="Unique uppercase identifier used in audit trails and statutory exports."
                >
                  <input
                    className="cbms-input"
                    placeholder="e.g. SAN_ISIDRO"
                    value={brgyCode}
                    onChange={(e) => setBrgyCode(e.target.value.toUpperCase())}
                    required
                  />
                </Field>

                <Field
                  label="Subdomain Slug (<subdomain>.cbms.gov.ph)"
                  hint="Checked live against GET /api/tenants/check-availability."
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      className="cbms-input"
                      placeholder="sanisidro"
                      value={subdomain}
                      onChange={(e) =>
                        setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                      }
                      required
                    />
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: "#475569",
                        whiteSpace: "nowrap",
                      }}
                    >
                      .cbms.gov.ph
                    </span>
                  </div>
                  {subdomain.trim().length >= 2 && (
                    <div style={{ marginTop: 6, fontSize: "0.76rem", fontWeight: 600 }}>
                      {checkingSubdomain ? (
                        <span style={{ color: "#64748b" }}>⏳ Checking availability…</span>
                      ) : subdomainStatus ? (
                        subdomainStatus.available ? (
                          <span style={{ color: "#15803d" }}>
                            ✅ Available: <code>{subdomainStatus.subdomain}.cbms.gov.ph</code> (ID:{" "}
                            <code>tnt-{subdomainStatus.subdomain}</code>)
                          </span>
                        ) : (
                          <span style={{ color: "#dc2626" }}>
                            ❌ Unavailable: {subdomainStatus.reason || "Subdomain already in use."}
                          </span>
                        )
                      ) : null}
                    </div>
                  )}
                </Field>

                <Field
                  label="Philippine Standard Geographic Code (PSGC)"
                  hint="10-digit PSA/DILG geographic code for LGUSS-BIMS synchronization."
                >
                  <input
                    className="cbms-input"
                    placeholder="137402017"
                    value={psgcCode}
                    onChange={(e) => setPsgcCode(e.target.value)}
                  />
                </Field>

                <Field
                  label="Parent City / Municipality LGU ID"
                  hint="Binds the barangay to the City Hub roll-up and DILG scorecard."
                >
                  <input
                    className="cbms-input"
                    value={cityId}
                    onChange={(e) => setCityId(e.target.value)}
                  />
                </Field>

                <Field
                  label="Optional Custom Government Domain"
                  hint="e.g., barangaysanisidro.marikina.gov.ph (leave blank if using subdomain)."
                >
                  <input
                    className="cbms-input"
                    placeholder="Optional custom domain"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                  />
                </Field>
              </div>

              <div style={{ marginTop: 16 }}>
                <div
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: 8,
                  }}
                >
                  Database Multi-Tenancy Isolation Architecture
                </div>
                <div className="cbms-grid-3" style={{ gap: 12 }}>
                  {[
                    {
                      id: "shared_db" as const,
                      title: "Shared DB · Row-Level Tenant Guard (Recommended)",
                      desc: "Fastest provisioning. Enforces strict tenant_id & barangay_id GORM scopes on every query.",
                    },
                    {
                      id: "isolated_schema" as const,
                      title: "Isolated PostgreSQL Schema",
                      desc: "Dedicated PostgreSQL schema per barangay within the central LGU database cluster.",
                    },
                    {
                      id: "dedicated_db" as const,
                      title: "Dedicated Database Instance",
                      desc: "Full physical database isolation for high-population urban barangays.",
                    },
                  ].map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setDbMode(m.id)}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        border: dbMode === m.id ? "2px solid #1d4ed8" : "1px solid #cbd5e1",
                        background: dbMode === m.id ? "#eff6ff" : "#f8fafc",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#0f172a" }}>
                        {dbMode === m.id ? "🔘 " : "⚪ "}
                        {m.title}
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "#475569", marginTop: 4 }}>
                        {m.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  marginTop: 18,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                }}
              >
                <Button
                  type="button"
                  variant="primary"
                  disabled={!brgyName.trim() || !subdomain.trim() || subdomainStatus?.available === false}
                  onClick={() => setStep(2)}
                >
                  Next: Executive Leadership →
                </Button>
              </div>
            </Panel>
          )}

          {step === 2 && (
            <Panel title="Step 2 — Initial Executive & Staff Onboarding Strategy">
              <p className="cbms-page-sub" style={{ marginBottom: 14 }}>
                Choose how the new Barangay’s leadership will access their workspace. Our{" "}
                <strong>Hybrid Onboarding</strong> model lets you provision the Punong Barangay’s
                account immediately AND generate a 7-day single-use Onboarding Token for the
                Barangay Secretary.
              </p>

              <div className="cbms-grid-3" style={{ gap: 12, marginBottom: 16 }}>
                {[
                  {
                    id: "both" as const,
                    title: "⭐ Hybrid: Direct Executive + Secretary Invite Link",
                    desc: "Creates the Punong Barangay account immediately AND generates a 7-day onboarding link for the Barangay Secretary.",
                  },
                  {
                    id: "direct" as const,
                    title: "👤 Direct Account Provisioning Only",
                    desc: "Immediately creates the primary official account with a temporary password ready for sign-in.",
                  },
                  {
                    id: "invite" as const,
                    title: "✉️ Self-Service Token Invitation Only",
                    desc: "Issues a 7-day single-use invite token so the Punong Barangay sets their own name & password on /login.",
                  },
                ].map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setLeadershipMode(opt.id)}
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      border:
                        leadershipMode === opt.id ? "2px solid #1d4ed8" : "1px solid #cbd5e1",
                      background: leadershipMode === opt.id ? "#eff6ff" : "#f8fafc",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#0f172a" }}>
                      {opt.title}
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "#475569", marginTop: 4 }}>
                      {opt.desc}
                    </div>
                  </div>
                ))}
              </div>

              <div className="cbms-grid-2" style={{ gap: 14 }}>
                <Field label="Primary Official Full Name (Punong Barangay / Admin)">
                  <input
                    className="cbms-input"
                    placeholder="Hon. Roberto Cruz"
                    value={execName}
                    onChange={(e) => setExecName(e.target.value)}
                  />
                </Field>

                <Field label="Primary Official Government Email">
                  <input
                    className="cbms-input"
                    type="email"
                    placeholder="kapitan@sanisidro.gov.ph"
                    value={execEmail}
                    onChange={(e) => setExecEmail(e.target.value)}
                  />
                </Field>

                <Field label="Assigned Statutory Role (DILG MC 2025-104)">
                  <select
                    className="cbms-select"
                    value={execRole}
                    onChange={(e) => setExecRole(e.target.value)}
                  >
                    {Object.entries(ROLE_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label} ({k})
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Official Contact Number">
                  <input
                    className="cbms-input"
                    value={execPhone}
                    onChange={(e) => setExecPhone(e.target.value)}
                  />
                </Field>

                {leadershipMode !== "invite" && (
                  <Field
                    label="Initial Temporary Password"
                    hint="The official can rotate this password upon first sign-in."
                  >
                    <input
                      className="cbms-input"
                      value={execPassword}
                      onChange={(e) => setExecPassword(e.target.value)}
                    />
                  </Field>
                )}

                {leadershipMode === "both" && (
                  <>
                    <Field
                      label="Secondary Official Invite Email (7-Day Token)"
                      hint="Generates a shareable /login?invite=<token> onboarding link."
                    >
                      <input
                        className="cbms-input"
                        type="email"
                        placeholder="secretary@sanisidro.gov.ph"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </Field>
                    <Field label="Secondary Invite Pre-Assigned Role">
                      <select
                        className="cbms-select"
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                      >
                        {Object.entries(ROLE_LABELS).map(([k, label]) => (
                          <option key={k} value={k}>
                            {label} ({k})
                          </option>
                        ))}
                      </select>
                    </Field>
                  </>
                )}
              </div>

              <div
                style={{
                  marginTop: 18,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <Button type="button" onClick={() => setStep(1)}>
                  ← Back: Identity
                </Button>
                <Button type="button" variant="primary" onClick={() => setStep(3)}>
                  Next: Statutory Defaults →
                </Button>
              </div>
            </Panel>
          )}

          {step === 3 && (
            <Panel title="Step 3 — Workspace Initialization & DILG Statutory Defaults">
              <div className="cbms-grid-2" style={{ gap: 14 }}>
                <Field label="Barangay Hall Official Address">
                  <input
                    className="cbms-input"
                    value={hallAddress}
                    onChange={(e) => setHallAddress(e.target.value)}
                  />
                </Field>

                <Field label="Barangay Hall Landline / Desk Telephone">
                  <input
                    className="cbms-input"
                    value={hallPhone}
                    onChange={(e) => setHallPhone(e.target.value)}
                  />
                </Field>

                <Field label="24/7 DRRM & Tanod Emergency Dispatch Hotline">
                  <input
                    className="cbms-input"
                    value={emergencyHotline}
                    onChange={(e) => setEmergencyHotline(e.target.value)}
                  />
                </Field>

                <Field label="Number of Territorial Puroks / Zones">
                  <input
                    className="cbms-input"
                    type="number"
                    min={1}
                    max={50}
                    value={purokCount}
                    onChange={(e) => setPurokCount(Number(e.target.value) || 7)}
                  />
                </Field>

                <Field label="Barangay Clearance Fee (₱)">
                  <input
                    className="cbms-input"
                    type="number"
                    min={0}
                    value={clearanceFee}
                    onChange={(e) => setClearanceFee(Number(e.target.value) || 0)}
                  />
                </Field>

                <Field label="Certificate of Residency Fee (₱)">
                  <input
                    className="cbms-input"
                    type="number"
                    min={0}
                    value={residencyFee}
                    onChange={(e) => setResidencyFee(Number(e.target.value) || 0)}
                  />
                </Field>

                <Field label="Business Permit Barangay Clearance Fee (₱)">
                  <input
                    className="cbms-input"
                    type="number"
                    min={0}
                    value={businessClearanceFee}
                    onChange={(e) => setBusinessClearanceFee(Number(e.target.value) || 0)}
                  />
                </Field>

                <Field label="Certificate of Indigency & RA 11261 First-Time Jobseeker">
                  <input
                    className="cbms-input"
                    value="₱0.00 (Statutorily Exempt / Free)"
                    disabled
                  />
                </Field>
              </div>

              <div
                style={{
                  marginTop: 18,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <Button type="button" onClick={() => setStep(2)}>
                  ← Back: Leadership
                </Button>
                <Button type="button" variant="primary" onClick={() => setStep(4)}>
                  Next: Review & Provision →
                </Button>
              </div>
            </Panel>
          )}

          {step === 4 && (
            <Panel
              title={
                dossier
                  ? `✅ Official Onboarding Handover Dossier — Barangay ${dossier.tenant.name}`
                  : "Step 4 — Review & Execute Multi-Tenant Provisioning"
              }
            >
              {!dossier ? (
                <>
                  <p className="cbms-page-sub" style={{ marginBottom: 14 }}>
                    Verify the parameters below. Clicking{" "}
                    <strong>Provision Barangay Workspace Now</strong> will create the tenant in
                    PostgreSQL (<code>POST /api/tenants</code>), bind the executive account, and
                    generate the onboarding handover package.
                  </p>

                  <div className="cbms-grid-2" style={{ gap: 16, marginBottom: 18 }}>
                    <div
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 10,
                        padding: 14,
                        background: "#f8fafc",
                      }}
                    >
                      <h4 style={{ margin: "0 0 10px", color: "#0f172a" }}>
                        🏛️ Tenant & Routing Specification
                      </h4>
                      <KeyValue
                        items={[
                          ["Barangay Name", brgyName || "—"],
                          ["Tenant Code", brgyCode || "—"],
                          ["Target Tenant ID", `tnt-${subdomain || "new"}`],
                          ["Subdomain", `${subdomain || "new"}.cbms.gov.ph`],
                          ["PSGC Code", psgcCode || "—"],
                          ["Database Mode", dbMode],
                        ]}
                      />
                    </div>

                    <div
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 10,
                        padding: 14,
                        background: "#f8fafc",
                      }}
                    >
                      <h4 style={{ margin: "0 0 10px", color: "#0f172a" }}>
                        👤 Leadership & Statutory Defaults
                      </h4>
                      <KeyValue
                        items={[
                          ["Onboarding Strategy", leadershipMode.toUpperCase()],
                          [
                            "Primary Official",
                            `${execName || "Punong Barangay"} (${execEmail || "—"})`,
                          ],
                          ["Primary Role", ROLE_LABELS[execRole] ?? execRole],
                          [
                            "Secondary Invite",
                            leadershipMode === "both"
                              ? `${inviteEmail} (${inviteRole})`
                              : "None",
                          ],
                          ["Territorial Puroks", `${purokCount} Puroks`],
                          [
                            "Clearance / Business Fee",
                            `₱${clearanceFee} / ₱${businessClearanceFee}`,
                          ],
                        ]}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Button type="button" onClick={() => setStep(3)}>
                      ← Back: Statutory Defaults
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      disabled={provisioning || !brgyName.trim() || !subdomain.trim()}
                      onClick={handleProvisionSubmit}
                    >
                      {provisioning
                        ? "Provisioning Tenant & Accounts…"
                        : "🚀 Provision Barangay Workspace Now"}
                    </Button>
                  </div>
                </>
              ) : (
                <div>
                  <Alert tone="info">
                    <strong>Barangay {dossier.tenant.name}</strong> is now live in PostgreSQL!
                    Share the credentials or single-use invitation link below with the Barangay
                    leadership, or switch your console directly into the new workspace.
                  </Alert>

                  <div className="cbms-grid-2" style={{ gap: 16, marginTop: 16 }}>
                    <div
                      style={{
                        border: "1px solid #bbf7d0",
                        borderRadius: 10,
                        padding: 16,
                        background: "#f0fdf4",
                      }}
                    >
                      <h4 style={{ margin: "0 0 10px", color: "#14532d" }}>
                        🏛️ Provisioned Tenant Metadata
                      </h4>
                      <KeyValue
                        items={[
                          ["Tenant ID", <code key="tid">{dossier.tenant.id}</code>],
                          ["Barangay ID", <code key="bid">{dossier.tenant.barangayId}</code>],
                          ["Official Name", `Barangay ${dossier.tenant.name}`],
                          [
                            "Subdomain Portal",
                            <code key="sub">https://{dossier.tenant.subdomain}.cbms.gov.ph</code>,
                          ],
                          ["PSGC Code", dossier.tenant.psgcCode || "137402017"],
                          [
                            "Tenancy Mode",
                            <Chip key="mode" tone="green">
                              {dossier.tenant.mode}
                            </Chip>,
                          ],
                        ]}
                      />
                    </div>

                    <div
                      style={{
                        border: "1px solid #bfdbfe",
                        borderRadius: 10,
                        padding: 16,
                        background: "#eff6ff",
                      }}
                    >
                      <h4 style={{ margin: "0 0 10px", color: "#1e3a8a" }}>
                        🔐 Executive Access & Handover Credentials
                      </h4>
                      {dossier.primaryMember ? (
                        <KeyValue
                          items={[
                            ["Official Name", dossier.primaryMember.name],
                            [
                              "Login Email",
                              <code key="em">{dossier.primaryMember.email}</code>,
                            ],
                            [
                              "Assigned Role",
                              <Chip key="rl" tone="navy">
                                {ROLE_LABELS[dossier.primaryMember.role] ??
                                  dossier.primaryMember.role}
                              </Chip>,
                            ],
                            [
                              "Temporary Password",
                              <code key="pw">{dossier.primaryMember.tempPassword}</code>,
                            ],
                            ["CRUD Privileges", "✓ Create · ✓ Read · ✓ Update · ✓ Delete"],
                          ]}
                        />
                      ) : (
                        <p style={{ fontSize: "0.82rem", color: "#1e3a8a" }}>
                          Token-only onboarding selected. Use the invitation link below to activate
                          the primary account.
                        </p>
                      )}

                      {dossier.inviteLink && (
                        <div
                          style={{
                            marginTop: 12,
                            paddingTop: 12,
                            borderTop: "1px solid #bfdbfe",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.76rem",
                              fontWeight: 700,
                              color: "#1e3a8a",
                              marginBottom: 4,
                            }}
                          >
                            ✉️ 7-Day Single-Use Onboarding Link ({dossier.inviteEmail} ·{" "}
                            {dossier.inviteRole}):
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "center",
                              background: "#ffffff",
                              padding: "6px 10px",
                              borderRadius: 6,
                              border: "1px solid #93c5fd",
                            }}
                          >
                            <code
                              style={{
                                fontSize: "0.74rem",
                                wordBreak: "break-all",
                                flex: 1,
                                color: "#1d4ed8",
                              }}
                            >
                              {dossier.inviteLink}
                            </code>
                            <Button
                              size="sm"
                              type="button"
                              onClick={() => copyText("invite", dossier.inviteLink!)}
                            >
                              {copiedKey === "invite" ? "✓ Copied" : "Copy Link"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 18,
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                    }}
                  >
                    <Button
                      type="button"
                      onClick={() => {
                        setDossier(null);
                        setBrgyName("");
                        setBrgyCode("");
                        setSubdomain("");
                        setStep(1);
                      }}
                    >
                      ➕ Provision Another Barangay
                    </Button>

                    <div style={{ display: "flex", gap: 10 }}>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => {
                          setActiveTenant(dossier.tenant);
                          setMode("workspace-setup");
                        }}
                      >
                        🔄 Switch Console to Barangay {dossier.tenant.name} & Configure →
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Panel>
          )}
        </>
      )}

      {mode === "workspace-setup" && (
        /* TAB 2: CURRENT BARANGAY WORKSPACE SETUP & READINESS CHECKLIST */
        <div className="cbms-grid-2" style={{ gap: 16, alignItems: "start" }}>
          <Panel
            title={`✅ DILG MC 2025-104 Onboarding Readiness — Barangay ${activeTenant?.name || currentTenantId}`}
          >
            <p className="cbms-page-sub" style={{ marginBottom: 14 }}>
              When a Barangay is onboarded, the Punong Barangay, Barangay Secretary, or IT Officer
              completes this 6-point operational readiness checklist.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {readinessChecks.map((chk) => (
                <div
                  key={chk.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: chk.done ? "1px solid #bbf7d0" : "1px solid #fde68a",
                    background: chk.done ? "#f0fdf4" : "#fefce8",
                  }}
                >
                  <span style={{ fontSize: "1rem" }}>{chk.done ? "✅" : "⏳"}</span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.83rem",
                        color: chk.done ? "#14532d" : "#854d0e",
                      }}
                    >
                      {chk.label}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#475569", marginTop: 2 }}>
                      {chk.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18 }}>
              <h4 style={{ margin: "0 0 8px", fontSize: "0.88rem", color: "#0f172a" }}>
                ✉️ Active Onboarding Invitations ({currentInvitations.length})
              </h4>
              <Async
                loading={invitationsQuery.isLoading}
                error={
                  invitationsQuery.error
                    ? { message: (invitationsQuery.error as Error).message }
                    : null
                }
              >
                <DataTable
                  columns={[
                    {
                      key: "email",
                      header: "Invited Official",
                      render: (inv: any) => (
                        <>
                          <div className="cbms-table__primary">{inv.email}</div>
                          <div className="cbms-table__muted">
                            {ROLE_LABELS[inv.role] ?? inv.role}
                          </div>
                        </>
                      ),
                    },
                    {
                      key: "status",
                      header: "Status",
                      width: 100,
                      render: (inv: any) => (
                        <StatusChip
                          status={inv.status}
                          tone={inv.status === "pending" ? "gold" : "green"}
                        />
                      ),
                    },
                    {
                      key: "actions",
                      header: "Invite Link",
                      align: "right",
                      width: 170,
                      render: (inv: any) => {
                        const url =
                          typeof window !== "undefined"
                            ? `${window.location.origin}/login?invite=${inv.token}`
                            : inv.token;
                        return (
                          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                            <Button
                              size="sm"
                              type="button"
                              onClick={() => copyText(inv.id, url)}
                            >
                              {copiedKey === inv.id ? "✓ Copied" : "Copy"}
                            </Button>
                            {inv.status === "pending" && (
                              <Button
                                size="sm"
                                variant="danger"
                                type="button"
                                disabled={revokeInviteMutation.isPending}
                                onClick={() => revokeInviteMutation.mutate(inv.id)}
                              >
                                Revoke
                              </Button>
                            )}
                          </div>
                        );
                      },
                    },
                  ]}
                  rows={currentInvitations}
                  empty="No onboarding invitations generated for this tenant yet."
                />
              </Async>
            </div>
          </Panel>

          <Panel
            title={`⚙️ Configure Barangay Workspace (${activeTenant?.name || currentTenantId})`}
          >
            <form
              onSubmit={handleSaveWorkspaceSettings}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <Field label="Barangay Hall Official Address">
                <input
                  className="cbms-input"
                  value={wsAddress}
                  onChange={(e) => setWsAddress(e.target.value)}
                  required
                />
              </Field>

              <Field label="24/7 Emergency & Tanod Dispatch Hotline">
                <input
                  className="cbms-input"
                  value={wsHotline}
                  onChange={(e) => setWsHotline(e.target.value)}
                  required
                />
              </Field>

              <Field label="Number of Territorial Puroks / Zones">
                <input
                  className="cbms-input"
                  type="number"
                  min={1}
                  max={50}
                  value={wsPuroks}
                  onChange={(e) => setWsPuroks(Number(e.target.value) || 7)}
                />
              </Field>

              <Field label="Default Barangay Clearance Fee (₱)">
                <input
                  className="cbms-input"
                  type="number"
                  min={0}
                  value={wsClearanceFee}
                  onChange={(e) => setWsClearanceFee(Number(e.target.value) || 0)}
                />
              </Field>

              <Field
                label="Custom Domain Binding"
                hint={`Default Subdomain: ${activeTenant?.subdomain || "barangka"}.cbms.gov.ph`}
              >
                <input
                  className="cbms-input"
                  placeholder="e.g. barangka.marikina.gov.ph"
                  value={wsCustomDomain}
                  onChange={(e) => setWsCustomDomain(e.target.value)}
                />
              </Field>

              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={updateTenantMutation.isPending}
                >
                  {updateTenantMutation.isPending
                    ? "Saving Configuration…"
                    : "💾 Save Barangay Workspace Settings"}
                </Button>
                <Link href="/audit/users" className="cbms-btn cbms-btn--secondary">
                  👥 Manage Staff & Invite Tokens →
                </Link>
              </div>
            </form>
          </Panel>
        </div>
      )}
    </>
  );
}
