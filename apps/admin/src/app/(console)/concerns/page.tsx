"use client";

import * as React from "react";
import { ApiError, patch, qs, useApi } from "@cbms/api-client";
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
  dateTime,
  num,
  relative,
  titleize,
} from "@cbms/ui";
import { ActionResult, Async } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import { CONCERN_CATEGORIES, CONCERN_STATUSES } from "../../../lib/labels";
import type { Concern, Paged } from "../../../lib/types";

const OPEN_STATUSES = ["submitted", "acknowledged", "in_progress"];

/** Next status in the handling flow, or null when the concern is closed. */
function nextStatus(status: string): { value: string; label: string } | null {
  switch (status) {
    case "submitted":
      return { value: "acknowledged", label: "Acknowledge" };
    case "acknowledged":
      return { value: "in_progress", label: "Start work" };
    case "in_progress":
      return { value: "resolved", label: "Resolve" };
    default:
      return null;
  }
}

export default function ConcernsPage() {
  const { can } = useConsole();
  // Front-line staff (Secretary, BHW, Tanod) hold concerns:encode; the Punong
  // Barangay holds concerns:approve. Either may move a concern along.
  const mayEncode = can("concerns:encode") || can("concerns:approve");

  const [status, setStatus] = React.useState("all");
  const [category, setCategory] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 25;

  const list = useApi<Paged<Concern>>(
    `/concerns${qs({ status, category, page, pageSize })}`,
  );

  // Resolution dialog state
  const [resolving, setResolving] = React.useState<Concern | null>(null);
  const [note, setNote] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const rows = list.data?.items ?? [];
  const openCount = rows.filter((c) => OPEN_STATUSES.includes(c.status)).length;
  const breached = rows.filter((c) => c.slaBreached).length;
  const resolved = rows.filter((c) => c.status === "resolved").length;

  async function advance(c: Concern, to: string, resolutionNote?: string) {
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await patch(`/concerns/${c.id}`, {
        status: to,
        ...(resolutionNote ? { resolutionNote } : {}),
      });
      setOk(`${c.referenceNo} moved to “${titleize(to)}”.`);
      setResolving(null);
      setNote("");
      list.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not update the concern.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title="Report a Concern (311)"
        subtitle="Resident-reported issues — streetlights, flooding, garbage, potholes. Each one carries a 3-working-day service clock under the Ease of Doing Business Act (RA 11032)."
        breadcrumb="Services"
        exclusive
      />

      <ActionResult error={error} success={ok} />

      <StatGrid>
        <StatCard
          label="Open on this page"
          value={num(openCount)}
          hint="Submitted, acknowledged or in progress"
          icon="📣"
        />
        <StatCard
          label="SLA breached"
          value={num(breached)}
          hint="Past the RA 11032 clock"
          icon="⏰"
          tone={breached > 0 ? "red" : "green"}
        />
        <StatCard
          label="Resolved on this page"
          value={num(resolved)}
          hint="Closed with a resolution note"
          icon="✅"
          tone="green"
        />
        <StatCard
          label="Total matching"
          value={num(list.data?.total)}
          hint="Across every page of this filter"
          icon="🗂"
        />
      </StatGrid>

      {breached > 0 && (
        <Alert tone="warn">
          <strong>{breached}</strong> concern{breached === 1 ? "" : "s"} on this page{" "}
          {breached === 1 ? "has" : "have"} passed the 3-working-day response window. These are
          the ones that show up in the Client Satisfaction Measurement.
        </Alert>
      )}

      {resolving && (
        <>
          <Panel title={`Resolve ${resolving.referenceNo}`}>
            <p className="adm-muted" style={{ marginTop: 0 }}>
              {resolving.description}
            </p>
            <Field
              label="Resolution note"
              hint="Written in plain language — the resident sees this in their app."
            >
              <textarea
                className="cbms-textarea"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Halimbawa: Naayos na ng maintenance team noong Martes."
              />
            </Field>
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                variant="primary"
                disabled={busy || note.trim().length < 3}
                onClick={() => advance(resolving, "resolved", note.trim())}
              >
                {busy ? "Saving…" : "Mark resolved"}
              </Button>
              <Button onClick={() => setResolving(null)} disabled={busy}>
                Cancel
              </Button>
            </div>
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
            {CONCERN_STATUSES.map((s) => (
              <option key={s} value={s}>
                {titleize(s)}
              </option>
            ))}
          </select>
          <select
            className="cbms-select"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All categories</option>
            {CONCERN_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {titleize(c)}
              </option>
            ))}
          </select>
          <div className="cbms-toolbar__spacer" />
          <span className="adm-muted">{num(list.data?.total)} concern(s)</span>
        </Toolbar>

        <Async loading={list.loading} error={list.error}>
          <DataTable
            columns={[
              {
                key: "referenceNo",
                header: "Reference",
                render: (c) => (
                  <span className="adm-chiprow">
                    <span className="cbms-table__primary">{c.referenceNo}</span>
                    {c.slaBreached && <Chip tone="red">SLA breached</Chip>}
                  </span>
                ),
              },
              {
                key: "category",
                header: "Category",
                render: (c) => <StatusChip status={c.category} />,
              },
              {
                key: "description",
                header: "Concern",
                render: (c) => (
                  <span className="cbms-table__muted">
                    {c.description.length > 80 ? `${c.description.slice(0, 80)}…` : c.description}
                  </span>
                ),
              },
              {
                key: "purok",
                header: "Purok",
                render: (c) => c.purok ?? <span className="cbms-table__muted">—</span>,
              },
              {
                key: "reporter",
                header: "Reported by",
                render: (c) =>
                  c.inhabitant ? (
                    `${c.inhabitant.firstName} ${c.inhabitant.lastName}`
                  ) : (
                    <span className="cbms-table__muted">Anonymous</span>
                  ),
              },
              {
                key: "createdAt",
                header: "Filed",
                render: (c) => (
                  <span title={dateTime(c.createdAt)}>{relative(c.createdAt)}</span>
                ),
              },
              {
                key: "sla",
                header: "Response clock",
                render: (c) => {
                  if (c.status === "resolved") {
                    return <Chip tone="green">Closed {relative(c.resolvedAt)}</Chip>;
                  }
                  if (c.status === "rejected") return <Chip tone="gray">Rejected</Chip>;
                  if (!c.slaDueAt) return <span className="cbms-table__muted">—</span>;
                  const days = Math.ceil(
                    (new Date(c.slaDueAt).getTime() - Date.now()) / 86_400_000,
                  );
                  return c.slaBreached ? (
                    <Chip tone="red">Breached by {Math.abs(days)}d</Chip>
                  ) : (
                    <Chip tone={days <= 1 ? "gold" : "green"}>{days}d left</Chip>
                  );
                },
              },
              {
                key: "status",
                header: "Status",
                render: (c) => <StatusChip status={c.status} />,
              },
              {
                key: "action",
                header: "Action",
                render: (c) => {
                  if (!mayEncode) return <span className="cbms-table__muted">—</span>;
                  const next = nextStatus(c.status);
                  if (!next) return <span className="cbms-table__muted">—</span>;
                  if (next.value === "resolved") {
                    return (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setResolving(c);
                          setNote("");
                        }}
                      >
                        Resolve…
                      </Button>
                    );
                  }
                  return (
                    <Button size="sm" disabled={busy} onClick={() => advance(c, next.value)}>
                      {next.label}
                    </Button>
                  );
                },
              },
            ]}
            rows={rows}
            empty="No concerns match this filter."
          />
        </Async>

        <Pagination page={page} pageSize={pageSize} total={list.data?.total ?? 0} onPage={setPage} />
      </Panel>
    </>
  );
}
