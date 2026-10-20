"use client";

import * as React from "react";
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
  num,
} from "@cbms/ui";
import { ActionResult, Async } from "../../../../components/common";
import { useConsole } from "../../../../components/Shell";
import { ROLE_LABELS } from "../../../../lib/labels";
import { useRbacStore } from "../../../../lib/rbac-store";
import {
  useCreateInvitationMutation,
  useRbacPermissionsQuery,
  useRbacRolesQuery,
  useRecruitTenantMemberMutation,
  useTenantMembersQuery,
  useUpdateTenantMemberMutation,
  type TenantMemberSecurityRow,
} from "../../../../lib/rbac-queries";

export default function UserCrudControlPage() {
  const { user: currentUser } = useConsole();
  const activeTenantId = useRbacStore((s) => s.activeTenant?.id) || currentUser?.tenantId || "tnt-barangka";
  const can = useRbacStore((s) => s.can);
  const canCrud = useRbacStore((s) => s.canCrud);
  const hasRole = useRbacStore((s) => s.hasRole);

  const isItOrAdmin =
    hasRole("IT_OFFICER", "SYSTEM_ADMIN", "LGU_ADMIN", "PUNONG_BARANGAY", "BARANGAY_CAPTAIN") ||
    can("users.manage") ||
    currentUser?.email?.toLowerCase().startsWith("it@") ||
    currentUser?.email?.toLowerCase().includes("kapitan") ||
    false;

  const canModifyUsers = isItOrAdmin && canCrud("update");
  const canRecruitUsers = isItOrAdmin && canCrud("create");

  // TanStack React Query hooks
  const membersQuery = useTenantMembersQuery(activeTenantId);
  const rolesQuery = useRbacRolesQuery();
  const permissionsQuery = useRbacPermissionsQuery();
  const updateMemberMutation = useUpdateTenantMemberMutation(activeTenantId);
  const recruitMutation = useRecruitTenantMemberMutation(activeTenantId);
  const inviteMutation = useCreateInvitationMutation(activeTenantId);

  const [activeTab, setActiveTab] = React.useState<"staff" | "dilg-matrix">("staff");
  const [selectedDilgRole, setSelectedDilgRole] = React.useState<string>("PUNONG_BARANGAY");
  const [q, setQ] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [actionResult, setActionResult] = React.useState<{ ok: boolean; message: string } | null>(null);
  const [updatingField, setUpdatingField] = React.useState<string | null>(null);

  // Multitenancy Recruitment & Invitation State
  const [showRecruit, setShowRecruit] = React.useState(false);
  const [showInvite, setShowInvite] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");
  const [newRole, setNewRole] = React.useState("BARANGAY_SECRETARY");
  const [newPassword, setNewPassword] = React.useState("Password123!");
  const [generatedInviteLink, setGeneratedInviteLink] = React.useState<string | null>(null);

  const userList = React.useMemo<TenantMemberSecurityRow[]>(
    () => membersQuery.data?.items ?? [],
    [membersQuery.data]
  );
  const dilgRoles = React.useMemo(() => rolesQuery.data ?? [], [rolesQuery.data]);
  const dilgPermissions = React.useMemo(
    () => permissionsQuery.data?.permissions ?? [],
    [permissionsQuery.data]
  );
  const dilgPermissionsByModule = React.useMemo(
    () => permissionsQuery.data?.byModule ?? {},
    [permissionsQuery.data]
  );

  async function handleRecruitSubmit(e: React.FormEvent) {
    e.preventDefault();
    setActionResult(null);
    try {
      await recruitMutation.mutateAsync({
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        password: newPassword,
        role: newRole,
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: newRole === "PUNONG_BARANGAY" || newRole === "BARANGAY_SECRETARY",
      });
      setActionResult({
        ok: true,
        message: `Recruited ${newName} (${newEmail}) as ${newRole} in tenant ${activeTenantId}.`,
      });
      setNewName("");
      setNewEmail("");
      setShowRecruit(false);
    } catch (err: any) {
      setActionResult({
        ok: false,
        message: err?.message || "Failed to recruit staff member.",
      });
    }
  }

  async function handleInviteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setActionResult(null);
    setGeneratedInviteLink(null);
    try {
      const res = await inviteMutation.mutateAsync({
        email: newEmail.trim().toLowerCase(),
        role: newRole,
        expiresDays: 7,
      });
      const token = res?.invitation?.token;
      const link =
        typeof window !== "undefined" && token
          ? `${window.location.origin}/login?invite=${token}`
          : res?.inviteUrl || token;
      setGeneratedInviteLink(link);
      setActionResult({
        ok: true,
        message: `Generated single-use onboarding token for ${newEmail} (${newRole}).`,
      });
    } catch (err: any) {
      setActionResult({
        ok: false,
        message: err?.message || "Failed to generate invitation token.",
      });
    }
  }

  async function togglePermission(
    targetUser: TenantMemberSecurityRow,
    permType: "create" | "read" | "update" | "delete" | "active"
  ) {
    const fieldKey = `${targetUser.id}:${permType}`;
    setUpdatingField(fieldKey);
    try {
      const payload: Record<string, any> = {
        fullName: targetUser.fullName,
        email: targetUser.email,
        role: targetUser.role,
      };

      let actionDesc = "";
      if (permType === "create") {
        const nextVal = targetUser.canCreate === false ? true : false;
        payload.canCreate = nextVal;
        actionDesc = `${nextVal ? "enabled" : "disabled"} CREATE actions for`;
      } else if (permType === "read") {
        const nextVal = targetUser.canRead === false ? true : false;
        payload.canRead = nextVal;
        actionDesc = `${nextVal ? "enabled" : "disabled"} READ actions for`;
      } else if (permType === "update") {
        const nextVal = targetUser.canUpdate === false ? true : false;
        payload.canUpdate = nextVal;
        actionDesc = `${nextVal ? "enabled" : "disabled"} UPDATE actions for`;
      } else if (permType === "delete") {
        const nextVal = targetUser.canDelete === false ? true : false;
        payload.canDelete = nextVal;
        actionDesc = `${nextVal ? "enabled" : "disabled"} DELETE actions for`;
      } else if (permType === "active") {
        const nextVal = !targetUser.isActive;
        payload.isActive = nextVal;
        actionDesc = `${nextVal ? "re-activated" : "suspended the entire account of"}`;
      }

      await updateMemberMutation.mutateAsync({
        userId: targetUser.id,
        payload,
      });
      setActionResult({
        ok: true,
        message: `Successfully ${actionDesc} ${targetUser.fullName}.`,
      });
    } catch (err: any) {
      setActionResult({
        ok: false,
        message: err.message || "Failed to update authorization setting.",
      });
    } finally {
      setUpdatingField(null);
    }
  }

  async function handleRoleChange(targetUser: TenantMemberSecurityRow, nextRole: string) {
    const fieldKey = `${targetUser.id}:role`;
    setUpdatingField(fieldKey);
    try {
      await updateMemberMutation.mutateAsync({
        userId: targetUser.id,
        payload: {
          fullName: targetUser.fullName,
          email: targetUser.email,
          role: nextRole,
        },
      });
      setActionResult({
        ok: true,
        message: `Reassigned ${targetUser.fullName} to DILG role ${ROLE_LABELS[nextRole] ?? nextRole}.`,
      });
    } catch (err: any) {
      setActionResult({
        ok: false,
        message: err?.message || "Failed to update staff role.",
      });
    } finally {
      setUpdatingField(null);
    }
  }

  const filteredUsers = React.useMemo(() => {
    return userList.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!q.trim()) return true;
      const needle = q.trim().toLowerCase();
      return (
        u.fullName.toLowerCase().includes(needle) ||
        u.email.toLowerCase().includes(needle) ||
        u.role.toLowerCase().includes(needle)
      );
    });
  }, [userList, q, roleFilter]);

  const activeCount = userList.filter((u) => u.isActive).length;
  const disabledCount = userList.filter((u) => !u.isActive).length;

  const activeDilgRoleObj = React.useMemo(
    () => dilgRoles.find((r) => r.role === selectedDilgRole) ?? dilgRoles[0],
    [dilgRoles, selectedDilgRole]
  );

  return (
    <>
      <PageHead
        title="RBAC Policy Engine & Multi-Tenant Staff Roster"
        subtitle={`Active Tenant Workspace: ${currentUser?.barangay?.name ? `Barangay ${currentUser.barangay.name}` : activeTenantId} (${activeTenantId}) — Powered by Zustand + TanStack Query & DILG MC 2025-104 RBAC Catalog.`}
        breadcrumb="Security & RBAC"
        actions={
          canRecruitUsers ? (
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                type="button"
                onClick={() => {
                  setShowInvite((v) => !v);
                  setShowRecruit(false);
                }}
              >
                ✉️ Send Invite Token
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  setShowRecruit((v) => !v);
                  setShowInvite(false);
                }}
              >
                ➕ Recruit Official / Staff
              </Button>
            </div>
          ) : undefined
        }
      />

      <ActionResult
        error={actionResult && !actionResult.ok ? actionResult.message : undefined}
        success={actionResult && actionResult.ok ? actionResult.message : undefined}
      />

      {showRecruit && (
        <Panel title={`➕ Direct Recruit Staff to Tenant (${activeTenantId})`}>
          <form onSubmit={handleRecruitSubmit} className="cbms-grid-2" style={{ gap: 12 }}>
            <Field label="Full Name">
              <input
                className="cbms-input"
                placeholder="Hon. Maria Clara"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </Field>
            <Field label="Official Email">
              <input
                className="cbms-input"
                type="email"
                placeholder="official@barangka.gov.ph"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </Field>
            <Field label="Assigned Barangay Role (DILG MC 2025-104)">
              <select
                className="cbms-select"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                {(dilgRoles.length > 0
                  ? dilgRoles.map((r) => [r.role, r.title] as const)
                  : Object.entries(ROLE_LABELS)
                ).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label} ({k})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Initial Password">
              <input
                className="cbms-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </Field>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Button type="submit" variant="primary" disabled={recruitMutation.isPending}>
                {recruitMutation.isPending ? "Provisioning…" : "Create & Bind to Tenant"}
              </Button>
              <Button type="button" onClick={() => setShowRecruit(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Panel>
      )}

      {showInvite && (
        <Panel title={`✉️ Generate Token-Based Staff Invitation (${activeTenantId})`}>
          <form onSubmit={handleInviteSubmit} className="cbms-grid-2" style={{ gap: 12 }}>
            <Field label="Recipient Official Email">
              <input
                className="cbms-input"
                type="email"
                placeholder="new.staff@barangka.gov.ph"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </Field>
            <Field label="Pre-Assigned Role (DILG MC 2025-104)">
              <select
                className="cbms-select"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                {(dilgRoles.length > 0
                  ? dilgRoles.map((r) => [r.role, r.title] as const)
                  : Object.entries(ROLE_LABELS)
                ).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label} ({k})
                  </option>
                ))}
              </select>
            </Field>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Button type="submit" variant="primary" disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? "Generating…" : "Generate 7-Day Invite Link"}
              </Button>
              <Button type="button" onClick={() => setShowInvite(false)}>
                Close
              </Button>
            </div>
          </form>
          {generatedInviteLink && (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: 8,
                fontSize: 12.5,
              }}
            >
              <strong>Shareable Onboarding Link:</strong>
              <div style={{ marginTop: 4 }}>
                <code style={{ wordBreak: "break-all", color: "#1d4ed8", fontWeight: 700 }}>
                  {generatedInviteLink}
                </code>
              </div>
            </div>
          )}
        </Panel>
      )}

      <StatGrid>
        <StatCard
          label="Registered Personnel"
          value={num(userList.length)}
          hint={`Bound to ${activeTenantId}`}
          icon="👥"
        />
        <StatCard
          label="Active Accounts"
          value={num(activeCount)}
          hint="Operational access granted"
          icon="🟢"
          tone="green"
        />
        <StatCard
          label="Suspended Accounts"
          value={num(disabledCount)}
          hint="Locked by IT policy"
          icon="🔒"
          tone={disabledCount > 0 ? "red" : "navy"}
        />
        <StatCard
          label="DILG RBAC Catalog"
          value={`${dilgRoles.length || 13} Roles / ${dilgPermissions.length || 26} Perms`}
          hint="DILG MC 2025-104 Standard"
          icon="🛡️"
          tone="gold"
        />
      </StatGrid>

      {/* Mode Switcher Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: 10,
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("staff")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: "0.84rem",
            fontWeight: 700,
            border: activeTab === "staff" ? "1px solid #1e3a8a" : "1px solid #cbd5e1",
            background: activeTab === "staff" ? "#1e3a8a" : "#ffffff",
            color: activeTab === "staff" ? "#ffffff" : "#334155",
            cursor: "pointer",
          }}
        >
          👥 Tenant Staff & Granular CRUD Matrix ({userList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("dilg-matrix")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: "0.84rem",
            fontWeight: 700,
            border: activeTab === "dilg-matrix" ? "1px solid #1e3a8a" : "1px solid #cbd5e1",
            background: activeTab === "dilg-matrix" ? "#1e3a8a" : "#ffffff",
            color: activeTab === "dilg-matrix" ? "#ffffff" : "#334155",
            cursor: "pointer",
          }}
        >
          🛡️ DILG MC 2025-104 Role & Permission Catalog ({dilgRoles.length || 13} Roles)
        </button>
      </div>

      {activeTab === "staff" ? (
        <Panel title="User Account CRUD & Role Assignment Matrix">
          <p className="cbms-page-sub" style={{ marginBottom: "1rem" }}>
            IT Personnel Granular Control: Independently permit or restrict <strong>Create</strong>,{" "}
            <strong>Read</strong>, <strong>Update</strong>, and <strong>Delete</strong> actions,
            reassign DILG roles, or suspend accounts for security audits. Changes synchronize
            immediately with React Query and Zustand RBAC state.
          </p>

          {!canModifyUsers && (
            <div style={{ marginBottom: "1rem" }}>
              <Alert tone="warn">
                You are currently viewing this in read-only mode. Only{" "}
                <strong>IT Officers</strong>, <strong>Punong Barangay</strong>, and{" "}
                <strong>System Administrators</strong> with active <code>UPDATE</code> CRUD
                privileges may modify staff roles or security locks.
              </Alert>
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: "1.25rem",
              padding: "0.75rem",
              backgroundColor: "var(--color-bg-subtle, #f8fafc)",
              borderRadius: "0.5rem",
              border: "1px solid var(--color-border, #e2e8f0)",
            }}
          >
            <input
              className="cbms-input"
              placeholder="Search accounts by name or email…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ maxWidth: 280, fontSize: "0.85rem" }}
            />

            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
              <span
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                }}
              >
                Filter Role:
              </span>
              {[
                { id: "all", label: "All Roles" },
                { id: "PUNONG_BARANGAY", label: "Punong Barangay" },
                { id: "BARANGAY_SECRETARY", label: "Secretary" },
                { id: "BARANGAY_TREASURER", label: "Treasurer" },
                { id: "IT_OFFICER", label: "IT Officer" },
                { id: "BARANGAY_TANOD", label: "Tanod" },
              ].map((rf) => (
                <button
                  key={rf.id}
                  type="button"
                  onClick={() => setRoleFilter(rf.id)}
                  style={{
                    padding: "3px 9px",
                    borderRadius: "9999px",
                    fontSize: "0.74rem",
                    fontWeight: 600,
                    border: roleFilter === rf.id ? "1px solid #2563eb" : "1px solid #cbd5e1",
                    backgroundColor: roleFilter === rf.id ? "#eff6ff" : "#ffffff",
                    color: roleFilter === rf.id ? "#1d4ed8" : "#475569",
                    cursor: "pointer",
                  }}
                >
                  {rf.label}
                </button>
              ))}
            </div>
          </div>

          <Async
            loading={membersQuery.isLoading}
            error={membersQuery.error ? { message: (membersQuery.error as Error).message } : null}
          >
            <DataTable
              columns={[
                {
                  key: "fullName",
                  header: "Staff Member / Account",
                  width: 210,
                  render: (u: TenantMemberSecurityRow) => (
                    <>
                      <div className="cbms-table__primary">{u.fullName}</div>
                      <div className="cbms-table__muted">{u.email}</div>
                    </>
                  ),
                },
                {
                  key: "role",
                  header: "Assigned DILG Role",
                  width: 210,
                  render: (u: TenantMemberSecurityRow) => {
                    const busyRole = updatingField === `${u.id}:role`;
                    return canModifyUsers ? (
                      <select
                        className="cbms-select"
                        disabled={busyRole}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                        style={{ fontSize: "0.76rem", padding: "4px 8px" }}
                      >
                        {(dilgRoles.length > 0
                          ? dilgRoles.map((r) => [r.role, r.title] as const)
                          : Object.entries(ROLE_LABELS)
                        ).map(([k, label]) => (
                          <option key={k} value={k}>
                            {label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="adm-chiprow">
                        <Chip tone="navy">{ROLE_LABELS[u.role] ?? u.role}</Chip>
                      </span>
                    );
                  },
                },
                {
                  key: "accountStatus",
                  header: "Account State",
                  width: 110,
                  render: (u: TenantMemberSecurityRow) =>
                    u.isActive ? (
                      <StatusChip status="active" tone="green" />
                    ) : (
                      <StatusChip status="disabled" tone="red" />
                    ),
                },
                {
                  key: "crudFlags",
                  header: "Granular CRUD Permissions (C · R · U · D)",
                  render: (u: TenantMemberSecurityRow) => {
                    const c = u.canCreate !== false;
                    const r = u.canRead !== false;
                    const up = u.canUpdate !== false;
                    const d = u.canDelete !== false;

                    const busyC = updatingField === `${u.id}:create`;
                    const busyR = updatingField === `${u.id}:read`;
                    const busyU = updatingField === `${u.id}:update`;
                    const busyD = updatingField === `${u.id}:delete`;

                    return (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                          alignItems: "center",
                        }}
                      >
                        <Button
                          size="sm"
                          variant={c ? "primary" : "secondary"}
                          disabled={busyC || !canModifyUsers}
                          onClick={() => togglePermission(u, "create")}
                          title={
                            c
                              ? "Click to revoke CREATE permissions"
                              : "Click to grant CREATE permissions"
                          }
                          style={{
                            padding: "3px 8px",
                            fontSize: "0.74rem",
                            border: c ? "1px solid #16a34a" : "1px dashed #cbd5e1",
                            background: c ? "#f0fdf4" : "transparent",
                            color: c ? "#15803d" : "#94a3b8",
                          }}
                        >
                          {busyC ? "…" : c ? "✓ Create" : "✕ Create"}
                        </Button>

                        <Button
                          size="sm"
                          variant={r ? "primary" : "secondary"}
                          disabled={busyR || !canModifyUsers}
                          onClick={() => togglePermission(u, "read")}
                          title={
                            r
                              ? "Click to revoke READ permissions"
                              : "Click to grant READ permissions"
                          }
                          style={{
                            padding: "3px 8px",
                            fontSize: "0.74rem",
                            border: r ? "1px solid #2563eb" : "1px dashed #cbd5e1",
                            background: r ? "#eff6ff" : "transparent",
                            color: r ? "#1d4ed8" : "#94a3b8",
                          }}
                        >
                          {busyR ? "…" : r ? "✓ Read" : "✕ Read"}
                        </Button>

                        <Button
                          size="sm"
                          variant={up ? "primary" : "secondary"}
                          disabled={busyU || !canModifyUsers}
                          onClick={() => togglePermission(u, "update")}
                          title={
                            up
                              ? "Click to revoke UPDATE permissions"
                              : "Click to grant UPDATE permissions"
                          }
                          style={{
                            padding: "3px 8px",
                            fontSize: "0.74rem",
                            border: up ? "1px solid #eab308" : "1px dashed #cbd5e1",
                            background: up ? "#fefce8" : "transparent",
                            color: up ? "#a16207" : "#94a3b8",
                          }}
                        >
                          {busyU ? "…" : up ? "✓ Update" : "✕ Update"}
                        </Button>

                        <Button
                          size="sm"
                          variant={d ? "primary" : "secondary"}
                          disabled={busyD || !canModifyUsers}
                          onClick={() => togglePermission(u, "delete")}
                          title={
                            d
                              ? "Click to revoke DELETE permissions"
                              : "Click to grant DELETE permissions"
                          }
                          style={{
                            padding: "3px 8px",
                            fontSize: "0.74rem",
                            border: d ? "1px solid #dc2626" : "1px dashed #cbd5e1",
                            background: d ? "#fef2f2" : "transparent",
                            color: d ? "#b91c1c" : "#94a3b8",
                          }}
                        >
                          {busyD ? "…" : d ? "✓ Delete" : "✕ Delete"}
                        </Button>
                      </div>
                    );
                  },
                },
                {
                  key: "accountLock",
                  header: "Account Lock",
                  align: "right",
                  width: 160,
                  render: (u: TenantMemberSecurityRow) => {
                    const isBusy = updatingField === `${u.id}:active`;
                    return (
                      <Button
                        size="sm"
                        variant={u.isActive ? "danger" : "primary"}
                        disabled={isBusy || !canModifyUsers}
                        onClick={() => togglePermission(u, "active")}
                        style={{ padding: "4px 10px", fontSize: "0.76rem" }}
                      >
                        {isBusy
                          ? "Updating…"
                          : u.isActive
                          ? "🔒 Disable Account"
                          : "🔓 Enable Account"}
                      </Button>
                    );
                  },
                },
              ]}
              rows={filteredUsers}
              empty="No registered user accounts match the filter criteria."
            />
          </Async>
        </Panel>
      ) : (
        <Panel title="DILG MC 2025-104 Statutory Role & Permission Matrix (Live Backend Catalog)">
          <p className="cbms-page-sub" style={{ marginBottom: "1rem" }}>
            Select any of the 13 statutory Barangay & City LGU roles defined in{" "}
            <code>GET /api/rbac/roles</code> and <code>GET /api/rbac/permissions</code> to inspect
            its statutory scope, MFA requirements, and granted module capabilities.
          </p>

          <Async
            loading={rolesQuery.isLoading || permissionsQuery.isLoading}
            error={
              rolesQuery.error
                ? { message: (rolesQuery.error as Error).message }
                : permissionsQuery.error
                ? { message: (permissionsQuery.error as Error).message }
                : null
            }
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(250px, 310px) 1fr",
                gap: 16,
                alignItems: "start",
              }}
            >
              {/* Role List Column */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  background: "#f8fafc",
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                }}
              >
                {dilgRoles.map((r) => {
                  const selected = activeDilgRoleObj?.role === r.role;
                  return (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setSelectedDilgRole(r.role)}
                      style={{
                        textAlign: "left",
                        padding: "9px 12px",
                        borderRadius: 8,
                        border: selected ? "1px solid #1e3a8a" : "1px solid transparent",
                        background: selected ? "#1e3a8a" : "#ffffff",
                        color: selected ? "#ffffff" : "#1e293b",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                        }}
                      >
                        <span>{r.title}</span>
                        <span
                          style={{
                            fontSize: "0.68rem",
                            padding: "1px 6px",
                            borderRadius: 99,
                            background: selected ? "rgba(255,255,255,0.2)" : "#e2e8f0",
                            color: selected ? "#ffffff" : "#475569",
                          }}
                        >
                          {r.permissions.length} perms
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          opacity: selected ? 0.85 : 0.65,
                          fontFamily: "monospace",
                        }}
                      >
                        {r.role} · {r.scope}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Role Detail & Module Matrix */}
              {activeDilgRoleObj && (
                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: 16,
                    background: "#ffffff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: 8,
                      borderBottom: "1px solid #f1f5f9",
                      paddingBottom: 12,
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#0f172a" }}>
                        {activeDilgRoleObj.title}{" "}
                        <code
                          style={{
                            fontSize: "0.78rem",
                            color: "#1d4ed8",
                            background: "#eff6ff",
                            padding: "2px 6px",
                            borderRadius: 4,
                          }}
                        >
                          {activeDilgRoleObj.role}
                        </code>
                      </h3>
                      <p style={{ margin: "4px 0 0", fontSize: "0.83rem", color: "#475569" }}>
                        {activeDilgRoleObj.description}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Chip tone="navy">Scope: {activeDilgRoleObj.scope}</Chip>
                      <Chip tone={activeDilgRoleObj.requiresMfa ? "gold" : undefined}>
                        {activeDilgRoleObj.requiresMfa ? "🔐 MFA Required" : "Standard Auth"}
                      </Chip>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {Object.entries(dilgPermissionsByModule).map(([modName, perms]) => (
                      <div
                        key={modName}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                          padding: 10,
                          background: "#f8fafc",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            color: "#334155",
                            marginBottom: 8,
                            borderBottom: "1px solid #e2e8f0",
                            paddingBottom: 4,
                          }}
                        >
                          📦 {modName}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {perms.map((p) => {
                            const granted = activeDilgRoleObj.permissions.includes(p.key);
                            return (
                              <div
                                key={p.key}
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: 6,
                                  fontSize: "0.76rem",
                                  color: granted ? "#0f172a" : "#94a3b8",
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: 800,
                                    color: granted ? "#16a34a" : "#cbd5e1",
                                  }}
                                >
                                  {granted ? "✓" : "✕"}
                                </span>
                                <div>
                                  <div style={{ fontWeight: granted ? 700 : 500 }}>
                                    <code>{p.key}</code>
                                  </div>
                                  <div style={{ fontSize: "0.7rem", opacity: 0.85 }}>
                                    {p.description}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Async>
        </Panel>
      )}
    </>
  );
}

