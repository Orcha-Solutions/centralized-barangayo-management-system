"use client";

import * as React from "react";
import { ApiError, patch, post, qs, useApi } from "@cbms/api-client";
import {
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
  type ChipTone,
} from "@cbms/ui";
import { ActionResult, Async, EmptyNote } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import { TICKET_STATUSES } from "../../../lib/labels";
import type { Paged, Ticket } from "../../../lib/types";

const CATEGORIES = ["technical", "access", "data_correction", "training", "other"] as const;
const PRIORITIES = ["low", "normal", "high", "urgent"] as const;

const PRIORITY_TONE: Record<string, ChipTone> = {
  urgent: "red",
  high: "gold",
  normal: "blue",
  low: "gray",
};

/** Handling flow: open → in_progress → resolved → closed (escalated rejoins at resolve). */
const NEXT_STEP: Record<string, { value: string; label: string }> = {
  open: { value: "in_progress", label: "Start work" },
  in_progress: { value: "resolved", label: "Resolve" },
  escalated: { value: "resolved", label: "Resolve" },
  resolved: { value: "closed", label: "Close" },
};

export default function TicketsPage() {
  const { can } = useConsole();
  const mayEncode = can("admin:encode");

  const [status, setStatus] = React.useState("all");
  const [category, setCategory] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [showNew, setShowNew] = React.useState(false);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const pageSize = 25;

  const list = useApi<Paged<Ticket>>(`/tickets${qs({ status, category, page, pageSize })}`);
  const detail = useApi<Ticket>(expanded ? `/tickets/${expanded}` : null);

  const [form, setForm] = React.useState({
    subject: "",
    body: "",
    category: "technical",
    priority: "normal",
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const created = await post<Ticket>("/tickets", {
        subject: form.subject.trim(),
        body: form.body.trim(),
        category: form.category,
        priority: form.priority,
      });
      setOk(`Ticket “${created.subject}” raised with the platform desk.`);
      setForm({ subject: "", body: "", category: "technical", priority: "normal" });
      setShowNew(false);
      list.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not raise the ticket.");
    } finally {
      setBusy(false);
    }
  }

  async function move(t: Ticket, to: string) {
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await patch(`/tickets/${t.id}`, { status: to });
      setOk(`“${t.subject}” moved to “${titleize(to)}”.`);
      list.reload();
      if (expanded === t.id) detail.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not update the ticket.");
    } finally {
      setBusy(false);
    }
  }

  const rows = list.data?.items ?? [];
  const open = rows.filter((t) => t.status === "open").length;
  const inProgress = rows.filter((t) => t.status === "in_progress").length;
  const escalated = rows.filter((t) => t.status === "escalated").length;
  const resolved = rows.filter((t) => t.status === "resolved" || t.status === "closed").length;

  // `detail.data` keeps the previous ticket while the next one is in flight — only
  // trust it once its id matches the row that is actually open.
  const fresh = detail.data?.id === expanded ? detail.data : null;
  const openTicket = expanded ? (fresh ?? rows.find((t) => t.id === expanded) ?? null) : null;

  function responseCount(t: Ticket): number | undefined {
    if (t.id === expanded && fresh?.responses) return fresh.responses.length;
    return t.responses?.length;
  }

  return (
    <>
      <PageHead
        title="IT Support & Incident Tickets"
        subtitle="IT Help Desk: Technical issues, system defects, account access requests, hardware faults, and data correction requests raised by barangay staff against the system."
        breadcrumb="Application Management"
        actions={
          mayEncode ? (
            <Button variant="primary" onClick={() => setShowNew((v) => !v)}>
              {showNew ? "Close" : "+ Raise ticket"}
            </Button>
          ) : undefined
        }
      />

      <ActionResult error={error} success={ok} />

      <StatGrid>
        <StatCard label="Open" value={num(open)} hint="Not yet picked up" icon="📬" />
        <StatCard
          label="In progress"
          value={num(inProgress)}
          hint="Being worked on"
          icon="🔧"
          tone="gold"
        />
        <StatCard
          label="Escalated"
          value={num(escalated)}
          hint="Raised to the platform team"
          icon="⏫"
          tone={escalated > 0 ? "red" : "navy"}
        />
        <StatCard
          label="Resolved / closed"
          value={num(resolved)}
          hint="On this page"
          icon="✅"
          tone="green"
        />
      </StatGrid>

      {showNew && mayEncode && (
        <>
          <Panel title="Raise a ticket">
            <form onSubmit={submit}>
              <Field label="Subject">
                <input
                  className="cbms-input"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="Printer not detected when releasing certificates"
                  required
                />
              </Field>
              <Field
                label="Description"
                hint="What you were doing, what you expected and what happened instead."
              >
                <textarea
                  className="cbms-textarea"
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  minLength={10}
                  required
                />
              </Field>
              <div className="adm-form-grid">
                <Field label="Category">
                  <select
                    className="cbms-select"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {titleize(c)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Priority" hint="Urgent is for anything blocking front-line service.">
                  <select
                    className="cbms-select"
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {titleize(p)}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Button
                type="submit"
                variant="primary"
                disabled={busy || !form.subject.trim() || form.body.trim().length < 10}
              >
                {busy ? "Saving…" : "Raise ticket"}
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
              setExpanded(null);
            }}
          >
            <option value="all">All statuses</option>
            {TICKET_STATUSES.map((s) => (
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
              setExpanded(null);
            }}
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {titleize(c)}
              </option>
            ))}
          </select>
          <div className="cbms-toolbar__spacer" />
          <span className="adm-muted">
            {num(list.data?.total)} ticket(s) · click a row to open the thread
          </span>
        </Toolbar>

        <Async loading={list.loading} error={list.error}>
          <DataTable
            columns={[
              {
                key: "subject",
                header: "Subject",
                render: (t) => (
                  <span className="adm-chiprow">
                    <span aria-hidden>{t.id === expanded ? "▾" : "▸"}</span>
                    <span className="cbms-table__primary">{t.subject}</span>
                  </span>
                ),
              },
              { key: "category", header: "Category", render: (t) => titleize(t.category) },
              {
                key: "priority",
                header: "Priority",
                render: (t) => (
                  <Chip tone={PRIORITY_TONE[t.priority] ?? "gray"}>{titleize(t.priority)}</Chip>
                ),
              },
              { key: "status", header: "Status", render: (t) => <StatusChip status={t.status} /> },
              {
                key: "createdAt",
                header: "Created",
                render: (t) => <span title={dateTime(t.createdAt)}>{relative(t.createdAt)}</span>,
              },
              {
                key: "responses",
                header: "Replies",
                align: "right",
                render: (t) => {
                  const n = responseCount(t);
                  return n === undefined ? (
                    <span className="cbms-table__muted" title="Open the ticket to load the thread">
                      —
                    </span>
                  ) : (
                    <Chip tone={n > 0 ? "navy" : "gray"}>{num(n)}</Chip>
                  );
                },
              },
              {
                key: "action",
                header: "Action",
                render: (t) => {
                  if (!mayEncode) return <span className="cbms-table__muted">—</span>;
                  const next = NEXT_STEP[t.status];
                  const mayEscalate = t.status === "open" || t.status === "in_progress";
                  if (!next && !mayEscalate) return <span className="cbms-table__muted">—</span>;
                  return (
                    <span
                      className="adm-chiprow"
                      onClick={(e) => e.stopPropagation()}
                      role="presentation"
                    >
                      {next && (
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={busy}
                          onClick={() => move(t, next.value)}
                        >
                          {next.label}
                        </Button>
                      )}
                      {mayEscalate && (
                        <Button size="sm" disabled={busy} onClick={() => move(t, "escalated")}>
                          Escalate
                        </Button>
                      )}
                    </span>
                  );
                },
              },
            ]}
            rows={rows}
            onRowClick={(t) => setExpanded((cur) => (cur === t.id ? null : t.id))}
            empty="No tickets match this filter."
          />
        </Async>

        {openTicket && (
          <div
            style={{
              borderTop: "1px solid var(--cbms-line)",
              padding: "16px 18px",
              background: "var(--cbms-ice, #f8fafc)",
            }}
          >
            <div className="adm-row" style={{ marginBottom: 10 }}>
              <strong style={{ fontSize: 14, color: "var(--cbms-navy)" }}>
                {openTicket.subject}
              </strong>
              <StatusChip status={openTicket.status} />
              <Chip tone={PRIORITY_TONE[openTicket.priority] ?? "gray"}>
                {titleize(openTicket.priority)}
              </Chip>
              <Chip tone="gray">{titleize(openTicket.category)}</Chip>
              <div className="adm-spacer" />
              <Button size="sm" onClick={() => setExpanded(null)}>
                Close
              </Button>
            </div>

            <p style={{ fontSize: 13.5, margin: "0 0 14px", whiteSpace: "pre-wrap" }}>
              {openTicket.body}
            </p>

            <div className="cbms-label">Thread</div>
            <Async loading={detail.loading && !fresh} error={detail.error}>
              {fresh?.responses?.length ? (
                <ul className="adm-timeline" style={{ marginTop: 10 }}>
                  {fresh.responses.map((r) => (
                    <li key={r.id}>
                      <div className="adm-timeline__when">{dateTime(r.createdAt)}</div>
                      <div className="adm-timeline__what" style={{ whiteSpace: "pre-wrap" }}>
                        {r.body}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyNote>
                  No replies yet — the platform desk has not answered this ticket.
                </EmptyNote>
              )}
            </Async>
          </div>
        )}

        <Pagination page={page} pageSize={pageSize} total={list.data?.total ?? 0} onPage={setPage} />
      </Panel>
    </>
  );
}
