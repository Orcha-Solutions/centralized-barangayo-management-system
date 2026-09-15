"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError, post, qs, useApi } from "@cbms/api-client";
import {
  Alert,
  Button,
  Chip,
  DataTable,
  Field,
  PageHead,
  Pagination,
  Panel,
  StatusChip,
  Toolbar,
  dateTime,
  num,
  titleize,
} from "@cbms/ui";
import { ActionResult, Async } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import { BLOTTER_CATEGORIES } from "../../../lib/labels";
import type { BlotterEntry, Paged } from "../../../lib/types";
import { BlotterTourGuide, BlotterGuideToggle } from "./BlotterTourGuide";

export default function BlotterPage() {
  const router = useRouter();
  const { can } = useConsole();
  const [q, setQ] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [showNew, setShowNew] = React.useState(false);
  const pageSize = 25;

  // Guide State (defaults to true on first visit, persisted in localStorage)
  const [tourEnabled, setTourEnabled] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("cbms.blotter_guide_enabled");
      if (stored === null) {
        setTourEnabled(true);
      } else {
        setTourEnabled(stored === "true");
      }
    } catch {
      setTourEnabled(true);
    }
  }, []);

  const handleToggleTour = (next: boolean) => {
    setTourEnabled(next);
    try {
      localStorage.setItem("cbms.blotter_guide_enabled", String(next));
    } catch {
      // ignore
    }
  };

  const list = useApi<Paged<BlotterEntry>>(
    `/blotter${qs({ q: search, category, page, pageSize })}`,
  );

  const mayEncode = can("blotter:create") || can("kp:encode") || can("vawc:encode");
  const mayVawc = can("vawc:encode") || can("vawc:view");

  const [form, setForm] = React.useState({
    category: "dispute",
    incidentAt: "",
    location: "",
    narrative: "",
    reportedBy: "",
    respondentName: "",
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
      const created = await post<BlotterEntry>("/blotter", {
        category: form.category,
        incidentAt: new Date(form.incidentAt).toISOString(),
        location: form.location.trim(),
        narrative: form.narrative.trim(),
        reportedBy: form.reportedBy.trim(),
        ...(form.respondentName.trim() ? { respondentName: form.respondentName.trim() } : {}),
      });
      setOk(
        `Blotter entry ${created.entryNo} recorded${
          created.isConfidential ? " as a restricted VAWC record" : ""
        }.`,
      );
      setForm({
        category: "dispute",
        incidentAt: "",
        location: "",
        narrative: "",
        reportedBy: "",
        respondentName: "",
      });
      setShowNew(false);
      list.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not record the entry.");
    } finally {
      setBusy(false);
    }
  }

  const categories = BLOTTER_CATEGORIES.filter((c) => c !== "vawc" || mayVawc);

  return (
    <>
      <div id="tour-blotter-head">
        <PageHead
          title="Blotter"
          subtitle="Incident record book. VAWC/VAC entries are confidential — narratives are redacted in the list and are visible only to the VAW desk and the Punong Barangay."
          breadcrumb="Justice & Safety"
          parity="KPISBH"
          actions={
            mayEncode ? (
              <Button id="tour-blotter-new-btn" variant="primary" onClick={() => setShowNew((v) => !v)}>
                {showNew ? "Close" : "+ New blotter entry"}
              </Button>
            ) : undefined
          }
        />
      </div>

      <ActionResult error={error} success={ok} />

      {showNew && mayEncode && (
        <div id="tour-blotter-encode-panel">
          <Panel title="New blotter entry">
            <form onSubmit={submit}>
              <div className="adm-form-grid">
                <Field
                  label="Category"
                  hint={
                    mayVawc
                      ? "VAWC entries are automatically flagged confidential."
                      : "VAWC is unavailable — it requires the VAW desk role."
                  }
                >
                  <select
                    className="cbms-select"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {titleize(c)}
                        {c === "vawc" ? " (restricted)" : ""}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Date & time of incident">
                  <input
                    className="cbms-input"
                    type="datetime-local"
                    value={form.incidentAt}
                    onChange={(e) => setForm((f) => ({ ...f, incidentAt: e.target.value }))}
                    required
                  />
                </Field>
                <Field label="Location">
                  <input
                    className="cbms-input"
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="Purok, street, or landmark"
                    required
                  />
                </Field>
                <Field label="Reported by">
                  <input
                    className="cbms-input"
                    value={form.reportedBy}
                    onChange={(e) => setForm((f) => ({ ...f, reportedBy: e.target.value }))}
                    required
                  />
                </Field>
                <Field label="Respondent (optional)">
                  <input
                    className="cbms-input"
                    value={form.respondentName}
                    onChange={(e) => setForm((f) => ({ ...f, respondentName: e.target.value }))}
                  />
                </Field>
              </div>
              <Field label="Narrative" hint="Encrypted at rest. Minimum 10 characters.">
                <textarea
                  className="cbms-textarea"
                  value={form.narrative}
                  onChange={(e) => setForm((f) => ({ ...f, narrative: e.target.value }))}
                  minLength={10}
                  required
                />
              </Field>
              {form.category === "vawc" && (
                <Alert tone="warn">
                  🔒 This entry will be stored as a restricted VAWC record: hidden from every role
                  except the VAW desk and the Punong Barangay, and every read is audited.
                </Alert>
              )}
              <Button type="submit" variant="primary" disabled={busy}>
                {busy ? "Saving…" : "Record entry"}
              </Button>
            </form>
          </Panel>
          <div style={{ height: 16 }} />
        </div>
      )}

      <Panel padded={false}>
        <div id="tour-blotter-toolbar">
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
                placeholder="Search entry no., location or reporter…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Button type="submit">Search</Button>
            </form>
            <select
              className="cbms-select"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All categories</option>
              {BLOTTER_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {titleize(c)}
                </option>
              ))}
            </select>
            <div className="cbms-toolbar__spacer" />
            <span className="adm-muted">{num(list.data?.total)} entr(ies)</span>
          </Toolbar>
        </div>

        <div id="tour-blotter-table">
          <Async loading={list.loading} error={list.error}>
            <DataTable
              columns={[
                {
                  key: "entryNo",
                  header: "Entry",
                  render: (b) => (
                    <span className="adm-chiprow">
                      {b.isConfidential && <span title="Restricted record">🔒</span>}
                      <Link
                        href={`/blotter/${b.id}`}
                        className="cbms-table__primary"
                        style={{ fontWeight: 600, textDecoration: "underline" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {b.entryNo}
                      </Link>
                    </span>
                  ),
                },
                {
                  key: "category",
                  header: "Category",
                  render: (b) => (
                    <span className="adm-chiprow">
                      <StatusChip status={b.category} />
                      {b.isConfidential && <Chip tone="red">Restricted</Chip>}
                    </span>
                  ),
                },
                { key: "incidentAt", header: "Incident", render: (b) => dateTime(b.incidentAt) },
                { key: "location", header: "Location" },
                {
                  key: "narrative",
                  header: "Narrative",
                  render: (b) =>
                    b.isConfidential ? (
                      <span className="adm-muted">[RESTRICTED — open the case to view]</span>
                    ) : (
                      <span className="cbms-table__muted">
                        {b.narrative.length > 90 ? `${b.narrative.slice(0, 90)}…` : b.narrative}
                      </span>
                    ),
                },
                { key: "reportedBy", header: "Reported by" },
                {
                  key: "kpCase",
                  header: "KP case",
                  render: (b) =>
                    b.kpCase ? (
                      <a
                        href={`/kp/${b.kpCase.id}`}
                        className="adm-strong"
                        style={{ textDecoration: "underline" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {b.kpCase.caseNo}
                      </a>
                    ) : (
                      <span className="cbms-table__muted">—</span>
                    ),
                },
              ]}
              rows={list.data?.items ?? []}
              rowKey={(b) => b.id}
              onRowClick={(b) => {
                router.push(`/blotter/${b.id}`);
              }}
              empty="No blotter entries match this filter."
            />
          </Async>

          <Pagination page={page} pageSize={pageSize} total={list.data?.total ?? 0} onPage={setPage} />
        </div>
      </Panel>

      {/* Interactive Tour Guide & Static Floating Toggle */}
      <BlotterTourGuide
        enabled={tourEnabled}
        onToggle={handleToggleTour}
        onOpenNew={() => setShowNew(true)}
        onCloseNew={() => setShowNew(false)}
        isNewOpen={showNew}
      />
      <BlotterGuideToggle
        enabled={tourEnabled}
        onToggle={handleToggleTour}
      />
    </>
  );
}
