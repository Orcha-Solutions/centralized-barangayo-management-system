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
  dateTime,
  fullName,
  num,
  titleize,
} from "@cbms/ui";
import { ActionResult, Async } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import { APPOINTMENT_STATUSES } from "../../../lib/labels";
import type { Appointment, Inhabitant, Paged } from "../../../lib/types";

const SERVICES = ["certificate", "kp_hearing", "health", "general"] as const;

const SERVICE_LABELS: Record<string, string> = {
  certificate: "Certificate / clearance",
  kp_hearing: "KP hearing",
  health: "Health service",
  general: "General transaction",
};

/** Queue discipline: booked → checked_in → serving → completed. */
const NEXT_STEP: Record<string, { value: string; label: string }> = {
  booked: { value: "checked_in", label: "Check in" },
  checked_in: { value: "serving", label: "Start serving" },
  serving: { value: "completed", label: "Complete" },
};

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function AppointmentsPage() {
  const { can } = useConsole();
  const mayEncode = can("appointments:encode");

  const [status, setStatus] = React.useState("all");
  const [service, setService] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [showNew, setShowNew] = React.useState(false);
  const pageSize = 25;

  const list = useApi<Paged<Appointment>>(
    `/appointments${qs({ status, service, page, pageSize })}`,
  );

  // ---- booking form -------------------------------------------------------
  const [form, setForm] = React.useState({ service: "certificate", scheduledAt: "" });
  const [personQ, setPersonQ] = React.useState("");
  const [personSearch, setPersonSearch] = React.useState("");
  const [picked, setPicked] = React.useState<Inhabitant | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const people = useApi<Paged<Inhabitant>>(
    personSearch ? `/inhabitants${qs({ q: personSearch, pageSize: 6 })}` : null,
  );

  async function book(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await post<Appointment>("/appointments", {
        service: form.service,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        ...(picked ? { inhabitantId: picked.id } : {}),
      });
      setOk(
        `Booked ${SERVICE_LABELS[form.service] ?? titleize(form.service)}${
          picked ? ` for ${fullName(picked)}` : ""
        }.`,
      );
      setForm({ service: "certificate", scheduledAt: "" });
      setPicked(null);
      setPersonQ("");
      setPersonSearch("");
      setShowNew(false);
      list.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not book the appointment.");
    } finally {
      setBusy(false);
    }
  }

  async function move(a: Appointment, to: string) {
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await patch(`/appointments/${a.id}`, { status: to });
      setOk(
        `${a.queueNumber ?? "Appointment"} moved to “${titleize(to)}”.`,
      );
      list.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not update the appointment.");
    } finally {
      setBusy(false);
    }
  }

  const rows = list.data?.items ?? [];
  const bookedToday = rows.filter((a) => a.status === "booked" && isToday(a.scheduledAt)).length;
  const checkedIn = rows.filter((a) => a.status === "checked_in" || a.status === "serving").length;
  const completed = rows.filter((a) => a.status === "completed").length;
  const noShows = rows.filter((a) => a.status === "no_show").length;

  return (
    <>
      <PageHead
        title="Appointments & Queue"
        subtitle="Scheduled transactions at the barangay hall. Check-in starts the service clock and completion stops it — this queue is where processing times come from."
        breadcrumb="Services"
        exclusive
        actions={
          mayEncode ? (
            <Button variant="primary" onClick={() => setShowNew((v) => !v)}>
              {showNew ? "Close" : "+ Book"}
            </Button>
          ) : undefined
        }
      />

      <ActionResult error={error} success={ok} />

      <StatGrid>
        <StatCard
          label="Booked today"
          value={num(bookedToday)}
          hint="Awaiting arrival at the hall"
          icon="📅"
        />
        <StatCard
          label="At the counter"
          value={num(checkedIn)}
          hint="Checked in or being served"
          icon="🧍"
          tone="gold"
        />
        <StatCard
          label="Completed on this page"
          value={num(completed)}
          hint="Clock stopped — counts towards CSM"
          icon="✅"
          tone="green"
        />
        <StatCard
          label="No-shows"
          value={num(noShows)}
          hint="Slots released back to the queue"
          icon="🚫"
          tone={noShows > 0 ? "red" : "navy"}
        />
      </StatGrid>

      <Alert tone="info">
        <strong>RA 11032 queue.</strong> The Ease of Doing Business Act requires a published,
        auditable order of service. Every state change here is timestamped and audited, so the
        queue doubles as the processing-time source behind the Citizen&apos;s Charter and the
        Client Satisfaction Measurement — and it removes the fixer&apos;s only product, which is
        jumping the line.
      </Alert>

      {showNew && mayEncode && (
        <>
          <div style={{ height: 16 }} />
          <Panel title="Book an appointment">
            <form onSubmit={book}>
              <div className="adm-form-grid">
                <Field label="Service">
                  <select
                    className="cbms-select"
                    value={form.service}
                    onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                  >
                    {SERVICES.map((s) => (
                      <option key={s} value={s}>
                        {SERVICE_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field
                  label="Date & time"
                  hint="The queue number is assigned by the hall on the day."
                >
                  <input
                    className="cbms-input"
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                    required
                  />
                </Field>
              </div>

              <Field
                label="Resident (optional)"
                hint="Leave blank for a walk-in booked at the counter without a resident record."
              >
                {picked ? (
                  <div className="adm-row">
                    <Chip tone="navy">{fullName(picked)}</Chip>
                    <Button size="sm" type="button" onClick={() => setPicked(null)}>
                      Clear
                    </Button>
                  </div>
                ) : (
                  <div className="adm-row">
                    <input
                      className="cbms-input cbms-input--search"
                      placeholder="Search resident by name or PhilSys no.…"
                      value={personQ}
                      onChange={(e) => setPersonQ(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          setPersonSearch(personQ.trim());
                        }
                      }}
                    />
                    <Button size="sm" type="button" onClick={() => setPersonSearch(personQ.trim())}>
                      Search
                    </Button>
                  </div>
                )}
              </Field>

              {!picked && personSearch && (
                <div className="adm-chiprow" style={{ marginBottom: 12 }}>
                  {people.loading && <span className="adm-muted">Searching…</span>}
                  {!people.loading && !people.data?.items.length && (
                    <span className="adm-muted">No resident matches “{personSearch}”.</span>
                  )}
                  {(people.data?.items ?? []).map((p) => (
                    <Button
                      key={p.id}
                      size="sm"
                      type="button"
                      onClick={() => {
                        setPicked(p);
                        setPersonSearch("");
                      }}
                    >
                      {fullName(p)}
                    </Button>
                  ))}
                </div>
              )}

              <Button type="submit" variant="primary" disabled={busy || !form.scheduledAt}>
                {busy ? "Booking…" : "Book appointment"}
              </Button>
            </form>
          </Panel>
        </>
      )}

      <div style={{ height: 16 }} />

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
            {APPOINTMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {titleize(s)}
              </option>
            ))}
          </select>
          <select
            className="cbms-select"
            value={service}
            onChange={(e) => {
              setService(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All services</option>
            {SERVICES.map((s) => (
              <option key={s} value={s}>
                {SERVICE_LABELS[s]}
              </option>
            ))}
          </select>
          <div className="cbms-toolbar__spacer" />
          <span className="adm-muted">{num(list.data?.total)} appointment(s)</span>
        </Toolbar>

        <Async loading={list.loading} error={list.error}>
          <DataTable
            columns={[
              {
                key: "queueNumber",
                header: "Queue",
                width: 90,
                render: (a) =>
                  a.queueNumber ? (
                    <span className="cbms-table__primary">{a.queueNumber}</span>
                  ) : (
                    <span className="cbms-table__muted">Unassigned</span>
                  ),
              },
              {
                key: "resident",
                header: "Resident",
                render: (a) =>
                  a.inhabitant ? (
                    `${a.inhabitant.firstName} ${a.inhabitant.lastName}`
                  ) : (
                    <span className="cbms-table__muted">—</span>
                  ),
              },
              {
                key: "service",
                header: "Service",
                render: (a) => SERVICE_LABELS[a.service] ?? titleize(a.service),
              },
              { key: "scheduledAt", header: "Scheduled", render: (a) => dateTime(a.scheduledAt) },
              { key: "status", header: "Status", render: (a) => <StatusChip status={a.status} /> },
              {
                key: "action",
                header: "Action",
                render: (a) => {
                  if (!mayEncode) return <span className="cbms-table__muted">—</span>;
                  const next = NEXT_STEP[a.status];
                  if (!next) return <span className="cbms-table__muted">—</span>;
                  return (
                    <span className="adm-chiprow">
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={busy}
                        onClick={() => move(a, next.value)}
                      >
                        {next.label}
                      </Button>
                      <Button size="sm" disabled={busy} onClick={() => move(a, "no_show")}>
                        No show
                      </Button>
                    </span>
                  );
                },
              },
            ]}
            rows={rows}
            empty="No appointments match this filter."
          />
        </Async>

        <Pagination page={page} pageSize={pageSize} total={list.data?.total ?? 0} onPage={setPage} />
      </Panel>
    </>
  );
}
