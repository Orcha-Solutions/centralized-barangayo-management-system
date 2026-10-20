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

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && showNew) {
        setShowNew(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showNew]);

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
            <Button variant="primary" onClick={() => setShowNew(true)}>
              + Book
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

      {/* ========================================================================= */}
      {/* CONTENT DRAWER: BOOK AN APPOINTMENT (SLIDE-OVER FROM RIGHT) */}
      {/* ========================================================================= */}
      {showNew && mayEncode && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            zIndex: 1500,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setShowNew(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              backgroundColor: "var(--cbms-surface, #ffffff)",
              height: "100%",
              boxShadow: "-6px 0 25px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--cbms-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.02)",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--cbms-navy)" }}>
                  📅 Book an Appointment
                </h3>
                <span style={{ fontSize: "0.8rem", color: "var(--cbms-muted)" }}>
                  Schedule counter transaction · Republic Act 11032 Citizen&apos;s Charter
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowNew(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "var(--cbms-muted)",
                  padding: "4px 8px",
                  lineHeight: 1,
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Drawer Form Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              <form onSubmit={book} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Field label="Service" hint="Category of transaction requested at the hall">
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
                  hint="The queue ticket number is assigned by the hall on the day."
                >
                  <input
                    className="cbms-input"
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                    required
                  />
                </Field>

                <Field
                  label="Resident (optional)"
                  hint="Leave blank for a walk-in booked at the counter without a resident record."
                >
                  {picked ? (
                    <div className="adm-row" style={{ marginTop: 4 }}>
                      <Chip tone="navy">{fullName(picked)}</Chip>
                      <Button size="sm" type="button" onClick={() => setPicked(null)}>
                        Clear
                      </Button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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

                      {personSearch && (
                        <div className="adm-chiprow" style={{ marginTop: 4, flexWrap: "wrap" }}>
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
                    </div>
                  )}
                </Field>

                <div
                  style={{
                    backgroundColor: "rgba(0,0,0,0.02)",
                    border: "1px solid var(--cbms-border)",
                    borderRadius: 6,
                    padding: "12px 14px",
                    fontSize: "0.82rem",
                    color: "var(--cbms-muted)",
                    lineHeight: 1.4,
                  }}
                >
                  ℹ️ <strong>RA 11032 Queue Discipline:</strong> Booked appointments generate an auditable queue ticket upon arrival. The check-in timestamp marks the start of the service clock for Anti-Red Tape Authority (ARTA) compliance.
                </div>

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                  <Button type="button" onClick={() => setShowNew(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={busy || !form.scheduledAt}>
                    {busy ? "Booking…" : "Book appointment"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
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
