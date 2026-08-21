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
  Toolbar,
  date,
  num,
  titleize,
  type ChipTone,
} from "@cbms/ui";
import { ActionResult, Async } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import type { Announcement, Paged } from "../../../lib/types";

const CATEGORIES = ["general", "utility", "emergency", "event"] as const;
const SEVERITIES = ["info", "warning", "critical"] as const;

const CHANNELS: Array<{ value: string; label: string; hint?: string }> = [
  { value: "in_app", label: "In-app push", hint: "Free" },
  { value: "email", label: "Email", hint: "Free" },
  {
    value: "sms",
    label: "SMS",
    hint: "SMS is charged per message — reserve it for OTP and critical alerts. Push and email are free.",
  },
];

const SEVERITY_TONE: Record<string, ChipTone> = {
  critical: "red",
  warning: "gold",
  info: "blue",
};

const CHANNEL_LABELS: Record<string, string> = {
  in_app: "in_app",
  email: "email",
  sms: "sms",
};

function withinDays(iso: string | null | undefined, days: number): boolean {
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() <= days * 86_400_000;
}

export default function AnnouncementsPage() {
  const { can } = useConsole();
  const mayEncode = can("announcements:encode");

  const [category, setCategory] = React.useState("all");
  const [severity, setSeverity] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [showNew, setShowNew] = React.useState(false);
  const pageSize = 25;

  const list = useApi<Paged<Announcement>>(
    `/announcements${qs({ category, severity, page, pageSize })}`,
  );

  const [form, setForm] = React.useState({
    title: "",
    body: "",
    category: "general",
    severity: "info",
    channels: ["in_app"] as string[],
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  function toggleChannel(value: string) {
    setForm((f) => ({
      ...f,
      channels: f.channels.includes(value)
        ? f.channels.filter((c) => c !== value)
        : [...f.channels, value],
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await post<Announcement>("/announcements", {
        title: form.title.trim(),
        body: form.body.trim(),
        category: form.category,
        severity: form.severity,
        channels: form.channels.length ? form.channels : ["in_app"],
      });
      setOk(`“${form.title.trim()}” saved as a draft. Publish it when it is cleared to go out.`);
      setForm({ title: "", body: "", category: "general", severity: "info", channels: ["in_app"] });
      setShowNew(false);
      list.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not save the announcement.");
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish(a: Announcement) {
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await patch(`/announcements/${a.id}`, {
        isPublished: !a.isPublished,
        ...(a.isPublished ? {} : { publishedAt: new Date().toISOString() }),
      });
      setOk(a.isPublished ? `“${a.title}” pulled from the feed.` : `“${a.title}” published.`);
      list.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not change the publication state.");
    } finally {
      setBusy(false);
    }
  }

  const rows = list.data?.items ?? [];
  const published = rows.filter((a) => a.isPublished).length;
  const drafts = rows.filter((a) => !a.isPublished).length;
  const critical = rows.filter((a) => a.severity === "critical").length;
  const thisWeek = rows.filter((a) => withinDays(a.publishedAt ?? a.createdAt, 7)).length;

  const smsSelected = form.channels.includes("sms");

  return (
    <>
      <PageHead
        title="Announcements"
        subtitle="Barangay-wide advisories pushed to the resident app, email and — sparingly — SMS. Emergency notices are mirrored on the public website."
        breadcrumb="Communication"
        exclusive
        actions={
          mayEncode ? (
            <Button variant="primary" onClick={() => setShowNew((v) => !v)}>
              {showNew ? "Close" : "+ Compose"}
            </Button>
          ) : undefined
        }
      />

      <ActionResult error={error} success={ok} />

      <StatGrid>
        <StatCard
          label="Published"
          value={num(published)}
          hint="Live on the resident feed"
          icon="📢"
          tone="green"
        />
        <StatCard label="Drafts" value={num(drafts)} hint="Not yet released" icon="📝" />
        <StatCard
          label="Critical"
          value={num(critical)}
          hint="Highest-severity advisories"
          icon="🚨"
          tone={critical > 0 ? "red" : "navy"}
        />
        <StatCard
          label="This week"
          value={num(thisWeek)}
          hint="Posted in the last 7 days"
          icon="🗓"
          tone="gold"
        />
      </StatGrid>

      {showNew && mayEncode && (
        <>
          <Panel title="Compose an announcement">
            <form onSubmit={submit}>
              <Field label="Title">
                <input
                  className="cbms-input"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Halimbawa: Water interruption — Purok 1 to 3"
                  required
                />
              </Field>
              <Field
                label="Body"
                hint="Plain language. Residents read this on a phone — lead with what they must do."
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
                <Field label="Severity">
                  <select
                    className="cbms-select"
                    value={form.severity}
                    onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
                  >
                    {SEVERITIES.map((s) => (
                      <option key={s} value={s}>
                        {titleize(s)}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Channels">
                <div className="adm-checks">
                  {CHANNELS.map((ch) => (
                    <label key={ch.value} title={ch.hint}>
                      <input
                        type="checkbox"
                        checked={form.channels.includes(ch.value)}
                        onChange={() => toggleChannel(ch.value)}
                      />
                      <span>
                        {ch.label}
                        {ch.value === "sms" && (
                          <span
                            className="adm-muted"
                            style={{ display: "block", lineHeight: 1.45, marginTop: 2 }}
                          >
                            SMS is charged per message — reserve it for OTP and critical alerts.
                            Push and email are free.
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </Field>

              {smsSelected && form.severity !== "critical" && (
                <Alert tone="warn">
                  You have selected SMS on a <strong>{titleize(form.severity)}</strong> advisory.
                  Every recipient costs the barangay real money — send this over in-app push and
                  email unless lives or property are at risk.
                </Alert>
              )}

              <Button
                type="submit"
                variant="primary"
                disabled={busy || !form.title.trim() || form.body.trim().length < 10}
              >
                {busy ? "Saving…" : "Save as draft"}
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
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {titleize(c)}
              </option>
            ))}
          </select>
          <select
            className="cbms-select"
            value={severity}
            onChange={(e) => {
              setSeverity(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All severities</option>
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {titleize(s)}
              </option>
            ))}
          </select>
          <div className="cbms-toolbar__spacer" />
          <span className="adm-muted">{num(list.data?.total)} announcement(s)</span>
        </Toolbar>

        <Async loading={list.loading} error={list.error}>
          <DataTable
            columns={[
              {
                key: "title",
                header: "Title",
                render: (a) => (
                  <>
                    <div className="cbms-table__primary">{a.title}</div>
                    <div className="cbms-table__muted">
                      {a.body.length > 90 ? `${a.body.slice(0, 90)}…` : a.body}
                    </div>
                  </>
                ),
              },
              {
                key: "category",
                header: "Category",
                render: (a) => <Chip tone="navy">{titleize(a.category)}</Chip>,
              },
              {
                key: "severity",
                header: "Severity",
                render: (a) => (
                  <Chip tone={SEVERITY_TONE[a.severity] ?? "gray"}>{titleize(a.severity)}</Chip>
                ),
              },
              {
                key: "channels",
                header: "Channels",
                render: (a) =>
                  a.channels?.length ? (
                    <span className="adm-chiprow">
                      {a.channels.map((c) => (
                        <Chip key={c} tone={c === "sms" ? "gold" : "gray"}>
                          {CHANNEL_LABELS[c] ?? c}
                        </Chip>
                      ))}
                    </span>
                  ) : (
                    <span className="cbms-table__muted">—</span>
                  ),
              },
              {
                key: "publishedAt",
                header: "Published",
                render: (a) =>
                  a.isPublished ? (
                    date(a.publishedAt ?? a.createdAt)
                  ) : (
                    <Chip tone="gray">Draft</Chip>
                  ),
              },
              {
                key: "action",
                header: "Action",
                render: (a) => {
                  if (!mayEncode) return <span className="cbms-table__muted">—</span>;
                  return (
                    <Button
                      size="sm"
                      variant={a.isPublished ? "default" : "primary"}
                      disabled={busy}
                      onClick={() => togglePublish(a)}
                    >
                      {a.isPublished ? "Unpublish" : "Publish"}
                    </Button>
                  );
                },
              },
            ]}
            rows={rows}
            empty="No announcements match this filter."
          />
        </Async>

        <Pagination page={page} pageSize={pageSize} total={list.data?.total ?? 0} onPage={setPage} />
      </Panel>
    </>
  );
}
