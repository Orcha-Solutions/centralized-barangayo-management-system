"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
} from "@cbms/ui";
import { api, patch, recruitTenantMember, type TenantInfo } from "@cbms/api-client";
import { ActionResult, Async } from "../../../../components/common";
import { useConsole } from "../../../../components/Shell";
import { ROLE_LABELS } from "../../../../lib/labels";
import {
  useRbacPermissionsQuery,
  useRbacRolesQuery,
  useTenantsQuery,
} from "../../../../lib/rbac-queries";
import { useRbacStore } from "../../../../lib/rbac-store";

export interface GlobalUserSecurityRow {
  id: string;
  fullName: string;
  email: string;
  role: string;
  tenantId?: string;
  isActive: boolean;
  canCreate?: boolean;
  canRead?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function SuperAdminUsersPage() {
  const { user: currentUser } = useConsole();
  const queryClient = useQueryClient();

  const tenantsQuery = useTenantsQuery();
  const rolesQuery = useRbacRolesQuery();
  const permissionsQuery = useRbacPermissionsQuery();

  const liveTenants = React.useMemo<TenantInfo[]>(
    () => tenantsQuery.data ?? [],
    [tenantsQuery.data]
  );
  const dilgRoles = React.useMemo(() => rolesQuery.data ?? [], [rolesQuery.data]);

  const [q, setQ] = React.useState("");
  const [tenantFilter, setTenantFilter] = React.useState<string>("all");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [updatingField, setUpdatingField] = React.useState<string | null>(null);
  const [actionResult, setActionResult] = React.useState<{ ok: boolean; message: string } | null>(null);

  // Recruitment modal state
  const [showRecruit, setShowRecruit] = React.useState(false);
  const [targetTenantId, setTargetTenantId] = React.useState<string>("tnt-barangka");
  const [newName, setNewName] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");
  const [newRole, setNewRole] = React.useState("BARANGAY_SECRETARY");
  const [newPassword, setNewPassword] = React.useState("Password123!");
  const [isRecruiting, setIsRecruiting] = React.useState(false);

  // Query global users
  const usersQuery = useQuery<GlobalUserSecurityRow[]>({
    queryKey: ["super-admin", "global-users", tenantFilter],
    queryFn: async () => {
      if (tenantFilter && tenantFilter !== "all") {
        try {
          const res = await api<{ members?: any[]; items?: any[] }>(
            `/tenants/${encodeURIComponent(tenantFilter)}/members`
          );
          const raw = res.members || res.items || [];
          return raw.map((m: any) => ({
            id: m.id,
            fullName: m.name || m.fullName || "Official",
            email: m.email,
            role: m.role || "BARANGAY_STAFF",
            tenantId: m.tenantId || tenantFilter,
            isActive: m.isActive !== false,
            canCreate: m.canCreate,
            canRead: m.canRead,
            canUpdate: m.canUpdate,
            canDelete: m.canDelete,
          }));
        } catch {
          // Fallback to generic /users endpoint if tenant-specific members route fails
          const res = await api<{ items?: any[] }>("/users");
          const raw = res.items || [];
          return raw.map((m: any) => ({
            id: m.id,
            fullName: m.fullName || m.name || "Official",
            email: m.email,
            role: m.role || "BARANGAY_STAFF",
            tenantId: m.tenantId || tenantFilter,
            isActive: m.isActive !== false,
            canCreate: m.canCreate,
            canRead: m.canRead,
            canUpdate: m.canUpdate,
            canDelete: m.canDelete,
          }));
        }
      }

      // Fetch from root /users endpoint which bridges tenant members
      const res = await api<{ items?: any[]; members?: any[] }>("/users");
      const raw = res.items || res.members || [];
      return raw.map((m: any) => ({
        id: m.id,
        fullName: m.fullName || m.name || "Official",
        email: m.email,
        role: m.role || "BARANGAY_STAFF",
        tenantId: m.tenantId || "tnt-barangka",
        isActive: m.isActive !== false,
        canCreate: m.canCreate,
        canRead: m.canRead,
        canUpdate: m.canUpdate,
        canDelete: m.canDelete,
      }));
    },
  });

  const allUsers = React.useMemo<GlobalUserSecurityRow[]>(
    () => usersQuery.data ?? [],
    [usersQuery.data]
  );

  const tenantMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const t of liveTenants) {
      map.set(t.id, t.name);
      if (t.code) map.set(t.code, t.name);
      if (t.barangayId) map.set(t.barangayId, t.name);
    }
    return map;
  }, [liveTenants]);

  const filteredUsers = React.useMemo(() => {
    return allUsers.filter((u) => {
      if (statusFilter === "active" && !u.isActive) return false;
      if (statusFilter === "suspended" && u.isActive) return false;
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (tenantFilter !== "all" && u.tenantId && u.tenantId !== tenantFilter) return false;
      if (!q.trim()) return true;
      const needle = q.trim().toLowerCase();
      const tenantName = (u.tenantId ? tenantMap.get(u.tenantId) : "") || "";
      return (
        u.fullName.toLowerCase().includes(needle) ||
        u.email.toLowerCase().includes(needle) ||
        u.role.toLowerCase().includes(needle) ||
        tenantName.toLowerCase().includes(needle)
      );
    });
  }, [allUsers, q, statusFilter, roleFilter, tenantFilter, tenantMap]);

  const totalUsers = allUsers.length;
  const activeCount = allUsers.filter((u) => u.isActive).length;
  const suspendedCount = allUsers.filter((u) => !u.isActive).length;

  async function handleTogglePermission(
    targetUser: GlobalUserSecurityRow,
    permType: "create" | "read" | "update" | "delete" | "active"
  ) {
    const fieldKey = `${targetUser.id}:${permType}`;
    setUpdatingField(fieldKey);
    setActionResult(null);
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
        actionDesc = `${nextVal ? "re-activated" : "suspended account of"}`;
      }

      await patch(`/users/${targetUser.id}/status`, payload);
      await queryClient.invalidateQueries({ queryKey: ["super-admin", "global-users"] });

      setActionResult({
        ok: true,
        message: `Successfully ${actionDesc} ${targetUser.fullName}.`,
      });
    } catch (err: any) {
      setActionResult({
        ok: false,
        message: err?.message || "Failed to update authorization privilege.",
      });
    } finally {
      setUpdatingField(null);
    }
  }

  async function handleRoleChange(targetUser: GlobalUserSecurityRow, nextRole: string) {
    const fieldKey = `${targetUser.id}:role`;
    setUpdatingField(fieldKey);
    setActionResult(null);
    try {
      await patch(`/users/${targetUser.id}/status`, {
        fullName: targetUser.fullName,
        email: targetUser.email,
        role: nextRole,
      });
      await queryClient.invalidateQueries({ queryKey: ["super-admin", "global-users"] });
      setActionResult({
        ok: true,
        message: `Reassigned ${targetUser.fullName} to statutory role ${ROLE_LABELS[nextRole] ?? nextRole}.`,
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

  async function handleRecruitSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsRecruiting(true);
    setActionResult(null);
    try {
      await recruitTenantMember(targetTenantId, {
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        password: newPassword,
        role: newRole,
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: newRole === "PUNONG_BARANGAY" || newRole === "BARANGAY_SECRETARY",
      });
      await queryClient.invalidateQueries({ queryKey: ["super-admin", "global-users"] });
      setActionResult({
        ok: true,
        message: `Successfully provisioned ${newName} (${newEmail}) as ${ROLE_LABELS[newRole] ?? newRole} in tenant ${targetTenantId}.`,
      });
      setNewName("");
      setNewEmail("");
      setShowRecruit(false);
    } catch (err: any) {
      setActionResult({
        ok: false,
        message: err?.message || "Failed to recruit personnel.",
      });
    } finally {
      setIsRecruiting(false);
    }
  }

  return (
    <>
      <PageHead
        title="Global Cross-Tenant Users & RBAC Directory"
        subtitle={`ORCHA Cloud Operations · Overseeing personnel and functionaries across all ${liveTenants.length || 16} client Barangay tenants.`}
        breadcrumb="ORCHA Super Admin / Global Users"
        actions={
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/super-admin" className="cbms-btn">
              ⚡ Platform Fleet Command
            </Link>
            <Button
              type="button"
              variant="primary"
              onClick={() => setShowRecruit((v) => !v)}
            >
              ➕ Provision Official / Staff
            </Button>
          </div>
        }
      />

      <ActionResult
        error={actionResult && !actionResult.ok ? actionResult.message : undefined}
        success={actionResult && actionResult.ok ? actionResult.message : undefined}
      />

      {showRecruit && (
        <Panel title="➕ Direct Provision Personnel to Any Barangay Tenant">
          <form onSubmit={handleRecruitSubmit} className="cbms-grid-2" style={{ gap: 12 }}>
            <Field label="Target Barangay Tenant">
              <select
                className="cbms-select"
                value={targetTenantId}
                onChange={(e) => setTargetTenantId(e.target.value)}
              >
                {liveTenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.subdomain}.cbms.gov.ph)
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Official Full Name">
              <input
                className="cbms-input"
                placeholder="Hon. Juan Dela Cruz"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </Field>

            <Field label="Official Email Address">
              <input
                className="cbms-input"
                type="email"
                placeholder="official@cbms.gov.ph"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </Field>

            <Field label="Statutory Role (DILG MC 2025-104)">
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

            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 24 }}>
              <Button type="submit" variant="primary" disabled={isRecruiting}>
                {isRecruiting ? "Provisioning…" : "Create & Bind to Barangay"}
              </Button>
              <Button type="button" onClick={() => setShowRecruit(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Panel>
      )}

      <StatGrid>
        <StatCard
          label="Total Registered Accounts"
          value={num(totalUsers)}
          hint="Across all multi-tenant workspaces"
          icon="👥"
          tone="navy"
        />
        <StatCard
          label="Active Accounts"
          value={num(activeCount)}
          hint="Active operational access"
          icon="🟢"
          tone="green"
        />
        <StatCard
          label="Suspended Accounts"
          value={num(suspendedCount)}
          hint="Restricted by IT security"
          icon="🔒"
          tone={suspendedCount > 0 ? "red" : "navy"}
        />
        <StatCard
          label="Governed Barangays"
          value={num(liveTenants.length || 16)}
          hint="National CBMS coverage"
          icon="🏛️"
          tone="gold"
        />
      </StatGrid>

      <Panel title="Global User Authorization & Granular CRUD Matrix">
        <p className="cbms-page-sub" style={{ marginBottom: "1.25rem" }}>
          Platform Super Administrators can manage statutory role designations, grant or restrict individual <code>Create</code>, <code>Read</code>, <code>Update</code>, and <code>Delete</code> rights, and suspend/re-activate personnel across any Barangay tenant.
        </p>

        <Toolbar>
          <input
            className="cbms-input cbms-input--search"
            type="search"
            placeholder="Search accounts by name, email, or role…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ maxWidth: 280 }}
          />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--cbms-muted)", textTransform: "uppercase" }}>
                Tenant:
              </span>
              <select
                className="cbms-select"
                value={tenantFilter}
                onChange={(e) => setTenantFilter(e.target.value)}
                style={{ fontSize: "0.78rem", padding: "4px 8px", maxWidth: 180 }}
              >
                <option value="all">All Barangays ({liveTenants.length})</option>
                {liveTenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--cbms-muted)", textTransform: "uppercase" }}>
                Role:
              </span>
              <select
                className="cbms-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ fontSize: "0.78rem", padding: "4px 8px", maxWidth: 170 }}
              >
                <option value="all">All Roles</option>
                {Object.entries(ROLE_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--cbms-muted)", textTransform: "uppercase" }}>
                Status:
              </span>
              <select
                className="cbms-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ fontSize: "0.78rem", padding: "4px 8px" }}
              >
                <option value="all">All States</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>
            </div>
          </div>

          <div className="cbms-toolbar__spacer" />
          <span style={{ fontSize: 12.5, color: "var(--cbms-muted)" }}>
            Showing {num(filteredUsers.length)} of {num(totalUsers)} accounts
          </span>
        </Toolbar>

        <Async
          loading={usersQuery.isLoading}
          error={usersQuery.error ? { message: (usersQuery.error as Error).message } : null}
        >
          <DataTable
            columns={[
              {
                key: "fullName",
                header: "Personnel Account",
                width: 220,
                render: (u: GlobalUserSecurityRow) => (
                  <div>
                    <div className="cbms-table__primary" style={{ fontWeight: 700 }}>
                      {u.fullName}
                    </div>
                    <div className="cbms-table__muted">
                      <code>{u.email}</code>
                    </div>
                  </div>
                ),
              },
              {
                key: "tenant",
                header: "Barangay Tenant",
                width: 170,
                render: (u: GlobalUserSecurityRow) => {
                  const tName = u.tenantId ? tenantMap.get(u.tenantId) : undefined;
                  const isPlatformAdmin = u.role === "SYSTEM_ADMIN" || u.email.startsWith("admin@");
                  return (
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.82rem" }}>
                        {tName || (isPlatformAdmin ? "🏛️ Platform Global" : "Barangay Barangka")}
                      </div>
                      <div className="cbms-table__muted">
                        <Chip tone={isPlatformAdmin ? "gold" : "blue"}>
                          {u.tenantId || "global"}
                        </Chip>
                      </div>
                    </div>
                  );
                },
              },
              {
                key: "role",
                header: "Statutory Role (DILG MC 2025-104)",
                width: 210,
                render: (u: GlobalUserSecurityRow) => {
                  const isBusy = updatingField === `${u.id}:role`;
                  return (
                    <select
                      className="cbms-select"
                      disabled={isBusy}
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
                  );
                },
              },
              {
                key: "status",
                header: "State",
                width: 100,
                render: (u: GlobalUserSecurityRow) =>
                  u.isActive ? (
                    <StatusChip status="active" tone="green" />
                  ) : (
                    <StatusChip status="disabled" tone="red" />
                  ),
              },
              {
                key: "crud",
                header: "Granular CRUD Access (C · R · U · D)",
                render: (u: GlobalUserSecurityRow) => {
                  const c = u.canCreate !== false;
                  const r = u.canRead !== false;
                  const up = u.canUpdate !== false;
                  const d = u.canDelete !== false;

                  const busyC = updatingField === `${u.id}:create`;
                  const busyR = updatingField === `${u.id}:read`;
                  const busyU = updatingField === `${u.id}:update`;
                  const busyD = updatingField === `${u.id}:delete`;

                  return (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      <Button
                        size="sm"
                        variant={c ? "primary" : "secondary"}
                        disabled={busyC}
                        onClick={() => handleTogglePermission(u, "create")}
                        title={c ? "Revoke Create" : "Grant Create"}
                        style={{
                          padding: "3px 8px",
                          fontSize: "0.72rem",
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
                        disabled={busyR}
                        onClick={() => handleTogglePermission(u, "read")}
                        title={r ? "Revoke Read" : "Grant Read"}
                        style={{
                          padding: "3px 8px",
                          fontSize: "0.72rem",
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
                        disabled={busyU}
                        onClick={() => handleTogglePermission(u, "update")}
                        title={up ? "Revoke Update" : "Grant Update"}
                        style={{
                          padding: "3px 8px",
                          fontSize: "0.72rem",
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
                        disabled={busyD}
                        onClick={() => handleTogglePermission(u, "delete")}
                        title={d ? "Revoke Delete" : "Grant Delete"}
                        style={{
                          padding: "3px 8px",
                          fontSize: "0.72rem",
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
                key: "lock",
                header: "Security Lock",
                align: "right",
                width: 150,
                render: (u: GlobalUserSecurityRow) => {
                  const isBusy = updatingField === `${u.id}:active`;
                  return (
                    <Button
                      size="sm"
                      variant={u.isActive ? "danger" : "primary"}
                      disabled={isBusy}
                      onClick={() => handleTogglePermission(u, "active")}
                      style={{ padding: "4px 10px", fontSize: "0.76rem" }}
                    >
                      {isBusy
                        ? "Updating…"
                        : u.isActive
                        ? "🔒 Disable"
                        : "🔓 Enable"}
                    </Button>
                  );
                },
              },
            ]}
            rows={filteredUsers}
            empty="No registered user accounts match the selected filters."
          />
        </Async>
      </Panel>
    </>
  );
}
