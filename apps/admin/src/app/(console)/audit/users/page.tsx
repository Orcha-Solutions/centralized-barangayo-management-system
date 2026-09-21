"use client";

import * as React from "react";
import { patch, useApi } from "@cbms/api-client";
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
  num,
} from "@cbms/ui";
import { ActionResult, Async } from "../../../../components/common";
import { useConsole } from "../../../../components/Shell";
import { ROLE_LABELS } from "../../../../lib/labels";
import type { Bag } from "../../../../lib/types";

interface UserSecurityRow {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  canCreate?: boolean;
  canRead?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function UserCrudControlPage() {
  const { user: currentUser } = useConsole();
  const isItOrAdmin =
    currentUser?.roles?.some(
      (r) => r === "IT_OFFICER" || r === "SYSTEM_ADMIN" || r === "LGU_ADMIN"
    ) ||
    currentUser?.email?.toLowerCase().includes("it") ||
    false;

  const usersApi = useApi<Bag<UserSecurityRow>>("/users");
  const [q, setQ] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [actionResult, setActionResult] = React.useState<{ ok: boolean; message: string } | null>(null);
  const [updatingField, setUpdatingField] = React.useState<string | null>(null);

  const userList = React.useMemo(() => usersApi.data?.items ?? [], [usersApi.data]);

  async function togglePermission(
    targetUser: UserSecurityRow,
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

      await patch(`/users/${targetUser.id}/status`, payload);
      setActionResult({
        ok: true,
        message: `Successfully ${actionDesc} ${targetUser.fullName}.`,
      });
      usersApi.reload();
    } catch (err: any) {
      setActionResult({
        ok: false,
        message: err.message || "Failed to update authorization setting.",
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
  const adminRolesCount = userList.filter((u) =>
    ["PUNONG_BARANGAY", "SYSTEM_ADMIN", "IT_OFFICER", "BARANGAY_SECRETARY", "BARANGAY_TREASURER"].includes(u.role)
  ).length;

  return (
    <>
      <PageHead
        title="User CRUD & Security Management"
        subtitle="IT Authorization Controls: Individually permit or restrict Create, Read, Update, and Delete actions, or lock accounts to enforce security policies and protect audit integrity."
        breadcrumb="Application Management"
      />

      <ActionResult
        error={actionResult && !actionResult.ok ? actionResult.message : undefined}
        success={actionResult && actionResult.ok ? actionResult.message : undefined}
      />

      <StatGrid>
        <StatCard
          label="Registered Personnel"
          value={num(userList.length)}
          hint="All system accounts"
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
          label="Executive & Admin Roles"
          value={num(adminRolesCount)}
          hint="High-privilege operators"
          icon="🛡️"
          tone="gold"
        />
      </StatGrid>

      <Panel title="User Account CRUD Matrix">
        <p className="cbms-page-sub" style={{ marginBottom: "1rem" }}>
          IT Personnel Granular Control: Independently permit or restrict <strong>Create</strong>, <strong>Read</strong>, <strong>Update</strong>, and <strong>Delete</strong> actions, or suspend the entire account for security audits, scheduled maintenance, or anomaly containment.
        </p>

        {!isItOrAdmin && (
          <div style={{ marginBottom: "1rem" }}>
            <Alert tone="warn">
              You are currently viewing this with limited permissions. Only <strong>IT Officers</strong> and <strong>Administrators</strong> may configure user action permissions and security locks.
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
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
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

        <Async loading={usersApi.loading} error={usersApi.error}>
          <DataTable
            columns={[
              {
                key: "fullName",
                header: "Staff Member / Account",
                width: 210,
                render: (u: UserSecurityRow) => (
                  <>
                    <div className="cbms-table__primary">{u.fullName}</div>
                    <div className="cbms-table__muted">{u.email}</div>
                  </>
                ),
              },
              {
                key: "role",
                header: "Role",
                width: 170,
                render: (u: UserSecurityRow) => (
                  <span className="adm-chiprow">
                    <Chip tone="navy">{ROLE_LABELS[u.role] ?? u.role}</Chip>
                  </span>
                ),
              },
              {
                key: "accountStatus",
                header: "Account State",
                width: 110,
                render: (u: UserSecurityRow) =>
                  u.isActive ? (
                    <StatusChip status="active" tone="green" />
                  ) : (
                    <StatusChip status="disabled" tone="red" />
                  ),
              },
              {
                key: "crudFlags",
                header: "Granular CRUD Permissions (C · R · U · D)",
                render: (u: UserSecurityRow) => {
                  const c = u.canCreate !== false;
                  const r = u.canRead !== false;
                  const up = u.canUpdate !== false;
                  const d = u.canDelete !== false;

                  const busyC = updatingField === `${u.id}:create`;
                  const busyR = updatingField === `${u.id}:read`;
                  const busyU = updatingField === `${u.id}:update`;
                  const busyD = updatingField === `${u.id}:delete`;

                  return (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                      {/* CREATE BUTTON */}
                      <Button
                        size="sm"
                        variant={c ? "primary" : "secondary"}
                        disabled={busyC || !isItOrAdmin}
                        onClick={() => togglePermission(u, "create")}
                        title={c ? "Click to revoke CREATE permissions" : "Click to grant CREATE permissions"}
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

                      {/* READ BUTTON */}
                      <Button
                        size="sm"
                        variant={r ? "primary" : "secondary"}
                        disabled={busyR || !isItOrAdmin}
                        onClick={() => togglePermission(u, "read")}
                        title={r ? "Click to revoke READ permissions" : "Click to grant READ permissions"}
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

                      {/* UPDATE BUTTON */}
                      <Button
                        size="sm"
                        variant={up ? "primary" : "secondary"}
                        disabled={busyU || !isItOrAdmin}
                        onClick={() => togglePermission(u, "update")}
                        title={up ? "Click to revoke UPDATE permissions" : "Click to grant UPDATE permissions"}
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

                      {/* DELETE BUTTON */}
                      <Button
                        size="sm"
                        variant={d ? "primary" : "secondary"}
                        disabled={busyD || !isItOrAdmin}
                        onClick={() => togglePermission(u, "delete")}
                        title={d ? "Click to revoke DELETE permissions" : "Click to grant DELETE permissions"}
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
                render: (u: UserSecurityRow) => {
                  const isBusy = updatingField === `${u.id}:active`;
                  return (
                    <Button
                      size="sm"
                      variant={u.isActive ? "danger" : "primary"}
                      disabled={isBusy || !isItOrAdmin}
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
    </>
  );
}
