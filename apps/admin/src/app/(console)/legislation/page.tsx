"use client";

import * as React from "react";
import { ApiError, patch, post, qs, useApi } from "@cbms/api-client";
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
  date,
  num,
  titleize,
} from "@cbms/ui";
import { ActionResult, Async, Hint } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import { LEGISLATION_KINDS, LEGISLATION_STATUSES } from "../../../lib/labels";
import type { Legislation, Paged } from "../../../lib/types";

const KIND_LABEL: Record<string, string> = {
  ordinance: "Ordinance",
  resolution: "Resolution",
  executive_order: "Executive Order",
};

/** "Ordinance No. 01 s.2026" — the citation form used in the minutes. */
function citation(l: Legislation): string {
  return `${KIND_LABEL[l.kind] ?? titleize(l.kind)} No. ${l.number} s.${l.series}`;
}

export default function LegislationPage() {
  const { can } = useConsole();
  const mayEncode = can("legislation:encode");

  const [q, setQ] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [kind, setKind] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [showNew, setShowNew] = React.useState(false);
  const pageSize = 25;

  const list = useApi<Paged<Legislation>>(
    `/legislation${qs({ q: search, kind, status, page, pageSize })}`,
  );
  // Unfiltered slice used only for the counters above the table.
  const all = useApi<Paged<Legislation>>("/legislation?pageSize=200");

  const thisYear = new Date().getFullYear();
  const [form, setForm] = React.useState({
    kind: "ordinance",
    number: "",
    series: String(thisYear),
    title: "",
    body: "",
    sponsors: "",
  });
  const [busy, setBusy] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const corpus = all.data?.items ?? [];
  const enacted = corpus.filter((l) => l.status === "enacted").length;
  const drafts = corpus.filter((l) => l.status === "draft").length;
  const published = corpus.filter((l) => l.isPublished && l.status === "enacted").length;

  function refresh() {
    list.reload();
    all.reload();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const sponsors = form.sponsors
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const created = await post<Legislation>("/legislation", {
        kind: form.kind,
        number: form.number.trim(),
        series: Number(form.series),
        title: form.title.trim(),
        ...(form.body.trim() ? { body: form.body.trim() } : {}),
        sponsors,
      });
      setOk(`${citation(created)} filed as a draft.`);
      setForm({
        kind: "ordinance",
        number: "",
        series: String(thisYear),
        title: "",
        body: "",
        sponsors: "",
      });
      setShowNew(false);
      refresh();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not file the measure.");
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish(l: Legislation) {
    setBusyId(l.id);
    setError(null);
    setOk(null);
    try {
      await patch(`/legislation/${l.id}`, { isPublished: !l.isPublished });
      setOk(
        l.isPublished
          ? `${citation(l)} withdrawn from the public website.`
          : `${citation(l)} published to the public website.`,
      );
      refresh();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not change the publication state.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <PageHead
        title="Ordinances & Resolutions"
        subtitle="The Sangguniang Barangay record of ordinances, resolutions and executive orders. Enacted measures marked as published appear on the barangay's public website."
        breadcrumb="Governance"
        parity="BORIS"
        actions={
          mayEncode ? (
            <Button variant="primary" onClick={() => setShowNew((v) => !v)}>
              {showNew ? "Close" : "+ New measure"}
            </Button>
          ) : undefined
        }
      />

      <ActionResult error={error} success={ok} />

      <StatGrid>
        <StatCard
          label="Measures on file"
          value={num(all.data?.total)}
          icon="📜"
          hint="Ordinances, resolutions and EOs"
        />
        <StatCard
          label="Enacted"
          value={num(enacted)}
          icon="✅"
          tone="green"
          hint="Approved and in force"
        />
        <StatCard
          label="Drafts pending"
          value={num(drafts)}
          icon="✍️"
          tone={drafts > 0 ? "gold" : "navy"}
          hint="Awaiting deliberation"
        />
        <StatCard
          label="On the public site"
          value={num(published)}
          icon="🌐"
          hint="Enacted and published for residents"
        />
      </StatGrid>

      {showNew && mayEncode && (
        <>
          <Panel title="File a new measure">
            <form onSubmit={submit}>
              <div className="adm-form-grid">
                <Field label="Kind">
                  <select
                    className="cbms-select"
                    value={form.kind}
                    onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value }))}
                  >
                    {LEGISLATION_KINDS.map((k) => (
                      <option key={k} value={k}>
                        {KIND_LABEL[k] ?? titleize(k)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Number" hint="As written in the minutes, e.g. 01.">
                  <input
                    className="cbms-input"
                    value={form.number}
                    onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
                    placeholder="01"
                    required
                  />
                </Field>
                <Field label="Series">
                  <input
                    className="cbms-input"
                    type="number"
                    value={form.series}
                    onChange={(e) => setForm((f) => ({ ...f, series: e.target.value }))}
                    required
                  />
                </Field>
                <Field
                  label="Sponsors"
                  hint="Comma-separated, e.g. Hon. Maria L. Reyes, Hon. Alfredo P. Cruz."
                >
                  <input
                    className="cbms-input"
                    value={form.sponsors}
                    onChange={(e) => setForm((f) => ({ ...f, sponsors: e.target.value }))}
                    placeholder="Hon. Maria L. Reyes"
                  />
                </Field>
              </div>
              <Field label="Title" hint="Minimum 5 characters — the full enacting title.">
                <input
                  className="cbms-input"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  minLength={5}
                  placeholder="An Ordinance Regulating…"
                  required
                />
              </Field>
              <Field label="Text of the measure (optional)" hint="Whereas clauses and the enacting body.">
                <textarea
                  className="cbms-textarea"
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  placeholder="WHEREAS, …"
                />
              </Field>
              <Alert tone="info">
                New measures are filed as <strong>drafts</strong>. Set the status to{" "}
                <em>enacted</em> and publish it before it reaches the public website.
              </Alert>
              <Button type="submit" variant="primary" disabled={busy}>
                {busy ? "Filing…" : "File measure"}
              </Button>
            </form>
          </Panel>
          <div style={{ height: 16 }} />
        </>
      )}

      <Panel padded={false}>
        <Toolbar>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setSearch(q.trim());
            }}
            style={{ display: "flex", gap: 8 }}
          >
            <input
              className="cbms-input cbms-input--search"
              placeholder="Search title or number…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Button type="submit">Search</Button>
          </form>
          <select
            className="cbms-select"
            value={kind}
            onChange={(e) => {
              setKind(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All kinds</option>
            {LEGISLATION_KINDS.map((k) => (
              <option key={k} value={k}>
                {KIND_LABEL[k] ?? titleize(k)}
              </option>
            ))}
          </select>
          <select
            className="cbms-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            {LEGISLATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {titleize(s)}
              </option>
            ))}
          </select>
          <div className="cbms-toolbar__spacer" />
          <span className="adm-muted">{num(list.data?.total)} measure(s)</span>
        </Toolbar>

        <Async loading={list.loading} error={list.error}>
          <DataTable
            columns={[
              {
                key: "number",
                header: "Number",
                render: (l) => <span className="cbms-table__primary">{citation(l)}</span>,
              },
              {
                key: "title",
                header: "Title",
                render: (l) => (
                  <span title={l.title}>
                    {l.title.length > 110 ? `${l.title.slice(0, 110)}…` : l.title}
                  </span>
                ),
              },
              {
                key: "sponsors",
                header: "Sponsors",
                render: (l) =>
                  l.sponsors?.length ? (
                    l.sponsors.join(", ")
                  ) : (
                    <span className="cbms-table__muted">—</span>
                  ),
              },
              { key: "status", header: "Status", render: (l) => <StatusChip status={l.status} /> },
              { key: "enactedAt", header: "Enacted", render: (l) => date(l.enactedAt) },
              {
                key: "isPublished",
                header: "Published",
                render: (l) =>
                  l.isPublished ? (
                    <span className="adm-chiprow">
                      <Chip tone="green">Public</Chip>
                      {l.status !== "enacted" && (
                        <Hint text="The public website only lists enacted measures, so this one stays hidden until its status is 'enacted'.">
                          <Chip tone="gold">Not yet enacted</Chip>
                        </Hint>
                      )}
                    </span>
                  ) : (
                    <Chip tone="gray">Internal</Chip>
                  ),
              },
              {
                key: "action",
                header: "Action",
                render: (l) => {
                  if (!mayEncode) return <span className="cbms-table__muted">—</span>;
                  return (
                    <Button
                      size="sm"
                      variant={l.isPublished ? "default" : "primary"}
                      disabled={busyId === l.id}
                      onClick={() => togglePublish(l)}
                    >
                      {busyId === l.id ? "Saving…" : l.isPublished ? "Unpublish" : "Publish"}
                    </Button>
                  );
                },
              },
            ]}
            rows={list.data?.items ?? []}
            empty="No measures match this filter."
          />
        </Async>

        <Pagination page={page} pageSize={pageSize} total={list.data?.total ?? 0} onPage={setPage} />
      </Panel>
    </>
  );
}
