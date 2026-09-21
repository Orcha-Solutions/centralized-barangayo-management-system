"use client";

import * as React from "react";
import { useApi } from "@cbms/api-client";
import {
  Button,
  Chip,
  DataTable,
  PageHead,
  Pagination,
  Panel,
  StatCard,
  StatGrid,
  Toolbar,
  dateTime,
  num,
  relative,
} from "@cbms/ui";
import { Async } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import { downloadText, toCsv } from "../../../lib/download";
import { ROLE_LABELS } from "../../../lib/labels";
import type { AuditRow, Bag } from "../../../lib/types";

export default function AuditPage() {
  const { user: currentUser } = useConsole();
  const log = useApi<Bag<AuditRow>>("/audit");

  const [q, setQ] = React.useState("");
  const [aiOnly, setAiOnly] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const pageSize = 25;

  const all = React.useMemo(() => log.data?.items ?? [], [log.data]);

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

  // Reset to first page whenever search filter changes
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
        title="Audit Logs & Security Trail"
        subtitle="Monitors transaction and operational audit trails. Immutable records of administrative data edits, clearances issued, blotters filed, and automated AI actions."
        breadcrumb="Application Management"
        actions={
          <Button onClick={exportFiltered} disabled={!filtered.length}>
            ⬇ Export filtered (CSV)
          </Button>
        }
      />

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

      <Panel title="System Audit Stream" padded={false}>
        <Toolbar>
          <input
            className="cbms-input cbms-input--search"
            placeholder="Filter by action, entity, role or actor…"
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
  );
}
