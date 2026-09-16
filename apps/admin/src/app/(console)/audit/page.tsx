"use client";

import * as React from "react";
import { patch, post, useApi } from "@cbms/api-client";
import {
  Alert,
  Button,
  Chip,
  DataTable,
  PageHead,
  Pagination,
  Panel,
  StatCard,
  StatGrid,
  StatusChip,
  Toolbar,
  dateTime,
  num,
  relative,
} from "@cbms/ui";
import { ActionResult, Async } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import { downloadText, toCsv } from "../../../lib/download";
import { ROLE_LABELS } from "../../../lib/labels";
import type { AuditRow, Bag } from "../../../lib/types";

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

export default function AuditPage() {
  const { user: currentUser } = useConsole();
  const isItOrAdmin = currentUser?.roles?.some(r => r === "IT_OFFICER" || r === "SYSTEM_ADMIN" || r === "LGU_ADMIN") || false;

  const [activeTab, setActiveTab] = React.useState<"logs" | "users">("logs");
  const log = useApi<Bag<AuditRow>>("/audit");
  const usersApi = useApi<Bag<UserSecurityRow>>("/users");

  const [q, setQ] = React.useState("");
  const [aiOnly, setAiOnly] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [actionResult, setActionResult] = React.useState<{ ok: boolean; message: string } | null>(null);
  const [updatingField, setUpdatingField] = React.useState<string | null>(null);
  const pageSize = 25;

  const all = React.useMemo(() => log.data?.items ?? [], [log.data]);
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
        actionDesc = `${nextVal ? "re-activated" : "disabled the entire account of"}`;
      }

      await patch(`/users/${targetUser.id}/status`, payload);
      setActionResult({
        ok: true,
        message: `Successfully ${actionDesc} ${targetUser.fullName}.`,
      });
      usersApi.reload();
      log.reload();
    } catch (err: any) {
      setActionResult({
        ok: false,
        message: err.message || "Failed to update authorization setting.",
      });
    } finally {
      setUpdatingField(null);
    }
  }

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((r) => {
      if (aiOnly && !r.isAiAction) return false;
      if (!needle) return true;
      const hay = [
        r.action,
        r.entity,
        r.entityId ?? "",
        r.actor?.fullName ?? "System",
        r.actor?.email ?? "",
        r.actorRole ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [all, q, aiOnly]);

  // Reset to the first page whenever the filter narrows the set.
  React.useEffect(() => {
    setPage(1);
  }, [q, aiOnly]);

  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const aiActions = filtered.filter((r) => r.isAiAction).length;
  const actors = new Set(filtered.map((r) => r.actor?.fullName ?? "System")).size;
  const entities = new Set(filtered.map((r) => r.entity)).size;

  function exportFiltered() {
    downloadText(
      toCsv(
        ["WHEN", "ACTOR", "ROLE", "ACTION", "ENTITY", "ENTITY_ID", "IP", "AI_ACTION"],
        filtered.map((r) => [
          new Date(r.createdAt).toISOString(),
          r.actor?.fullName ?? "System",
          r.actorRole ?? "",
          r.action,
          r.entity,
          r.entityId ?? "",
          r.ip ?? "",
          r.isAiAction ? "yes" : "no",
        ]),
      ),
      "audit-log.csv",
      "text/csv;charset=utf-8;",
    );
  }

  return (
    <>
      <PageHead
        title="Audit Log & Security Center"
        subtitle="Monitors transaction and operational audit trails, and provides IT authorization controls to enable or suspend user CRUD privileges."
        breadcrumb="Admin"
        actions={
          activeTab === "logs" ? (
            <Button onClick={exportFiltered} disabled={!filtered.length}>
              ⬇ Export filtered (CSV)
            </Button>
          ) : undefined
        }
      />

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", borderBottom: "1px solid var(--color-border, #e2e8f0)", paddingBottom: "0.5rem" }}>
        <Button
          variant={activeTab === "logs" ? "primary" : "secondary"}
          onClick={() => setActiveTab("logs")}
        >
          🧾 Transaction & Audit Logs ({num(all.length)})
        </Button>
        <Button
          variant={activeTab === "users" ? "primary" : "secondary"}
          onClick={() => setActiveTab("users")}
        >
          🛡️ User CRUD Access Controls ({num(userList.length)})
        </Button>
      </div>

      <ActionResult
        error={actionResult && !actionResult.ok ? actionResult.message : undefined}
        success={actionResult && actionResult.ok ? actionResult.message : undefined}
      />

      {activeTab === "logs" && (
        <>
          <StatGrid>
            <StatCard
              label="Entries shown"
              value={num(filtered.length)}
              hint={`of ${num(all.length)} most recent`}
              icon="🧾"
            />
            <StatCard
              label="AI actions"
              value={num(aiActions)}
              hint="Taken by an assistant, not a person"
              icon="🤖"
              tone={aiActions > 0 ? "gold" : "navy"}
            />
            <StatCard
              label="Distinct actors"
              value={num(actors)}
              hint="Users and system processes"
              icon="👤"
            />
            <StatCard
              label="Entities touched"
              value={num(entities)}
              hint="Record types written to"
              icon="🗂"
            />
          </StatGrid>

          <Panel padded={false}>
            <Toolbar>
              <input
                className="cbms-input cbms-input--search"
                placeholder="Filter by action, entity or actor…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <label
                style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 13, cursor: "pointer" }}
              >
                <input
                  type="checkbox"
                  checked={aiOnly}
                  onChange={(e) => setAiOnly(e.target.checked)}
                />
                AI actions only
              </label>
              <div className="cbms-toolbar__spacer" />
              <span className="adm-muted">{num(filtered.length)} entr(ies)</span>
            </Toolbar>

            <Async loading={log.loading} error={log.error}>
              <DataTable
                columns={[
                  {
                    key: "createdAt",
                    header: "When",
                    width: 130,
                    render: (r) => <span title={dateTime(r.createdAt)}>{relative(r.createdAt)}</span>,
                  },
                  {
                    key: "actor",
                    header: "Actor",
                    render: (r) => (
                      <>
                        <div className="cbms-table__primary">{r.actor?.fullName ?? "System"}</div>
                        <div className="cbms-table__muted">
                          {r.actorRole ? (ROLE_LABELS[r.actorRole] ?? r.actorRole) : "Automated"}
                        </div>
                      </>
                    ),
                  },
                  {
                    key: "action",
                    header: "Action",
                    render: (r) => (
                      <span className="adm-chiprow">
                        <strong>{r.action}</strong>
                        {r.isAiAction && <Chip tone="gold">AI</Chip>}
                      </span>
                    ),
                  },
                  {
                    key: "entity",
                    header: "Entity",
                    render: (r) => (
                      <>
                        <div>{r.entity}</div>
                        {r.entityId && (
                          <div className="cbms-table__muted" title={r.entityId}>
                            {r.entityId.slice(0, 8)}…
                          </div>
                        )}
                      </>
                    ),
                  },
                  {
                    key: "ip",
                    header: "IP / Source",
                    render: (r) => r.ip ?? <span className="cbms-table__muted">—</span>,
                  },
                ]}
                rows={rows}
                empty="No audit entries match this filter."
              />
            </Async>

            <Pagination page={page} pageSize={pageSize} total={filtered.length} onPage={setPage} />
          </Panel>
        </>
      )}

      {activeTab === "users" && (
        <Panel title="User CRUD & Security Management">
          <p className="cbms-page-sub" style={{ marginBottom: "1rem" }}>
            IT Personnel Granular Control: Independently permit or restrict <strong>Create</strong>, <strong>Read</strong>, <strong>Update</strong>, and <strong>Delete</strong> actions, or suspend the entire account for security audits, scheduled maintenance, or anomaly containment.
          </p>
          {!isItOrAdmin && (
            <Alert tone="warn">
              You are currently viewing this with limited permissions. Only <strong>IT Officers</strong> and <strong>Administrators</strong> may configure user action permissions and security locks.
            </Alert>
          )}

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
                  width: 150,
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
                  render: (u: UserSecurityRow) => (
                    u.isActive ? (
                      <StatusChip status="active" tone="green" />
                    ) : (
                      <StatusChip status="disabled" tone="red" />
                    )
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
                            color: c ? "#15803d" : "#94a3b8"
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
                            color: r ? "#1d4ed8" : "#94a3b8"
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
                            color: up ? "#a16207" : "#94a3b8"
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
                            color: d ? "#b91c1c" : "#94a3b8"
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
              rows={userList}
              empty="No registered user accounts found."
            />
          </Async>
        </Panel>
      )}
    </>
  );
}
