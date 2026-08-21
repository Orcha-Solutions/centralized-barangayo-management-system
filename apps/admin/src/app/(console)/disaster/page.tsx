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
  date,
  dateTime,
  num,
  relative,
  titleize,
  type ChipTone,
} from "@cbms/ui";
import { ActionResult, Async, Tabs } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import { DISASTER_STATUSES } from "../../../lib/labels";
import type { DisasterEvent, EvacuationCenter, Hazard, Paged } from "../../../lib/types";

type TabKey = "events" | "centers" | "hazards";

const HAZARD_TYPES = ["flood", "landslide", "fire", "earthquake", "storm_surge"] as const;
const RISK_LEVELS = ["low", "medium", "high"] as const;

const HAZARD_ICON: Record<string, string> = {
  flood: "🌊",
  landslide: "⛰",
  fire: "🔥",
  earthquake: "🌋",
  storm_surge: "🌀",
};

const RISK_TONE: Record<string, ChipTone> = { high: "red", medium: "gold", low: "green" };

/** RA 10121 operational escalation: monitoring → active → recovery → closed. */
function nextStatus(status: string): { value: string; label: string } | null {
  switch (status) {
    case "monitoring":
      return { value: "active", label: "Activate" };
    case "active":
      return { value: "recovery", label: "To recovery" };
    case "recovery":
      return { value: "closed", label: "Close event" };
    default:
      return null;
  }
}

export default function DisasterPage() {
  const { can } = useConsole();
  const mayEncode = can("disaster:encode");

  const [tab, setTab] = React.useState<TabKey>("events");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  // ----------------------------------------------------------------- events
  const [status, setStatus] = React.useState("all");
  const [eventPage, setEventPage] = React.useState(1);
  const pageSize = 25;

  const events = useApi<Paged<DisasterEvent>>(
    tab === "events" ? `/disaster/events${qs({ status, page: eventPage, pageSize })}` : null,
  );
  /** Unfiltered roll-up so the stat cards stay meaningful while a filter is applied. */
  const eventRoll = useApi<Paged<DisasterEvent>>("/disaster/events?pageSize=200");

  const [showEvent, setShowEvent] = React.useState(false);
  const [eventForm, setEventForm] = React.useState({
    name: "",
    hazardType: "flood",
    summary: "",
  });

  const roll = eventRoll.data?.items ?? [];
  const countBy = (s: string) => roll.filter((e) => e.status === s).length;

  async function declareEvent(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const created = await post<DisasterEvent>("/disaster/events", {
        name: eventForm.name.trim(),
        hazardType: eventForm.hazardType,
        status: "monitoring",
        ...(eventForm.summary.trim() ? { summary: eventForm.summary.trim() } : {}),
      });
      setOk(`“${created.name}” declared — the BDRRMC is now on monitoring status.`);
      setEventForm({ name: "", hazardType: "flood", summary: "" });
      setShowEvent(false);
      events.reload();
      eventRoll.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not declare the event.");
    } finally {
      setBusy(false);
    }
  }

  async function advance(ev: DisasterEvent, to: string) {
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await patch(`/disaster/events/${ev.id}`, {
        status: to,
        ...(to === "closed" ? { closedAt: new Date().toISOString() } : {}),
      });
      setOk(`“${ev.name}” moved to “${titleize(to)}”.`);
      events.reload();
      eventRoll.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not update the event.");
    } finally {
      setBusy(false);
    }
  }

  // ---------------------------------------------------------------- centers
  const [centerPage, setCenterPage] = React.useState(1);
  const centers = useApi<Paged<EvacuationCenter>>(
    tab === "centers" ? `/disaster/centers${qs({ page: centerPage, pageSize })}` : null,
  );
  const [showCenter, setShowCenter] = React.useState(false);
  const [centerForm, setCenterForm] = React.useState({
    name: "",
    capacity: "100",
    addressLine: "",
  });

  const centerRows = centers.data?.items ?? [];
  const openCenters = centerRows.filter((c) => c.isOpen);
  const totalCapacity = centerRows.reduce((s, c) => s + (c.capacity ?? 0), 0);
  const openCapacity = openCenters.reduce((s, c) => s + (c.capacity ?? 0), 0);

  async function createCenter(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const created = await post<EvacuationCenter>("/disaster/centers", {
        name: centerForm.name.trim(),
        capacity: Number(centerForm.capacity) || 1,
        ...(centerForm.addressLine.trim() ? { addressLine: centerForm.addressLine.trim() } : {}),
      });
      setOk(`Evacuation centre “${created.name}” registered.`);
      setCenterForm({ name: "", capacity: "100", addressLine: "" });
      setShowCenter(false);
      centers.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not save the evacuation centre.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleCenter(c: EvacuationCenter) {
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await patch(`/disaster/centers/${c.id}`, { isOpen: !c.isOpen });
      setOk(`“${c.name}” is now ${c.isOpen ? "closed" : "open for evacuees"}.`);
      centers.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not update the evacuation centre.");
    } finally {
      setBusy(false);
    }
  }

  // ---------------------------------------------------------------- hazards
  const [hazardPage, setHazardPage] = React.useState(1);
  const hazards = useApi<Paged<Hazard>>(
    tab === "hazards" ? `/disaster/hazards${qs({ page: hazardPage, pageSize })}` : null,
  );
  const [showHazard, setShowHazard] = React.useState(false);
  const [hazardForm, setHazardForm] = React.useState({
    purok: "",
    hazardType: "flood",
    riskLevel: "medium",
    notes: "",
  });

  const hazardRows = hazards.data?.items ?? [];
  const highRisk = hazardRows.filter((h) => h.riskLevel === "high").length;

  async function createHazard(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await post<Hazard>("/disaster/hazards", {
        purok: hazardForm.purok.trim(),
        hazardType: hazardForm.hazardType,
        riskLevel: hazardForm.riskLevel,
        ...(hazardForm.notes.trim() ? { notes: hazardForm.notes.trim() } : {}),
      });
      setOk(`${hazardForm.purok.trim()} mapped as ${hazardForm.riskLevel} risk.`);
      setHazardForm({ purok: "", hazardType: "flood", riskLevel: "medium", notes: "" });
      setShowHazard(false);
      hazards.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not save the hazard entry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title="Disaster Risk Reduction"
        subtitle="BDRRMC operations under RA 10121 — declared events, the evacuation centre roster and the purok-level hazard map."
        breadcrumb="Assets & DRRM"
        parity="BDRIS"
      />

      <ActionResult error={error} success={ok} />

      <Tabs<TabKey>
        tabs={[
          { value: "events", label: "Events" },
          { value: "centers", label: "Evacuation centres" },
          { value: "hazards", label: "Hazard map" },
        ]}
        value={tab}
        onChange={(v) => {
          setTab(v);
          setError(null);
          setOk(null);
        }}
      />

      {tab === "events" && (
        <>
          <StatGrid>
            <StatCard
              label="Active events"
              value={num(countBy("active"))}
              hint="Response is running"
              icon="🚨"
              tone={countBy("active") > 0 ? "red" : "green"}
            />
            <StatCard
              label="Monitoring"
              value={num(countBy("monitoring"))}
              hint="Watched, not yet activated"
              icon="👀"
            />
            <StatCard
              label="In recovery"
              value={num(countBy("recovery"))}
              hint="Rehabilitation phase"
              icon="🛠"
              tone="gold"
            />
            <StatCard
              label="Closed"
              value={num(countBy("closed"))}
              hint="Terminated and documented"
              icon="📁"
            />
          </StatGrid>

          {showEvent && mayEncode && (
            <>
              <Panel title="Declare a disaster event">
                <form onSubmit={declareEvent}>
                  <div className="adm-form-grid">
                    <Field label="Event name">
                      <input
                        className="cbms-input"
                        value={eventForm.name}
                        onChange={(e) => setEventForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Bagyong Egay — flooding along the creek"
                        required
                      />
                    </Field>
                    <Field label="Hazard type">
                      <select
                        className="cbms-select"
                        value={eventForm.hazardType}
                        onChange={(e) =>
                          setEventForm((f) => ({ ...f, hazardType: e.target.value }))
                        }
                      >
                        {HAZARD_TYPES.map((h) => (
                          <option key={h} value={h}>
                            {titleize(h)}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field
                    label="Situation summary"
                    hint="Opens on monitoring status. Escalate to active from the table once response begins."
                  >
                    <textarea
                      className="cbms-textarea"
                      value={eventForm.summary}
                      onChange={(e) => setEventForm((f) => ({ ...f, summary: e.target.value }))}
                      placeholder="Affected puroks, initial headcount, pre-emptive evacuation…"
                    />
                  </Field>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button type="submit" variant="primary" disabled={busy}>
                      {busy ? "Saving…" : "Declare event"}
                    </Button>
                    <Button type="button" onClick={() => setShowEvent(false)} disabled={busy}>
                      Cancel
                    </Button>
                  </div>
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
                  setEventPage(1);
                }}
              >
                <option value="all">All statuses</option>
                {DISASTER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {titleize(s)}
                  </option>
                ))}
              </select>
              <div className="cbms-toolbar__spacer" />
              <span className="adm-muted">{num(events.data?.total)} event(s)</span>
              {mayEncode && (
                <Button variant="primary" onClick={() => setShowEvent((v) => !v)}>
                  {showEvent ? "Close" : "+ Declare event"}
                </Button>
              )}
            </Toolbar>

            <Async loading={events.loading} error={events.error}>
              <DataTable
                columns={[
                  {
                    key: "name",
                    header: "Event",
                    render: (e) => <span className="cbms-table__primary">{e.name}</span>,
                  },
                  {
                    key: "hazardType",
                    header: "Hazard",
                    render: (e) => (
                      <Chip tone="navy">
                        {HAZARD_ICON[e.hazardType] ?? "⚠"} {titleize(e.hazardType)}
                      </Chip>
                    ),
                  },
                  { key: "status", header: "Status", render: (e) => <StatusChip status={e.status} /> },
                  {
                    key: "declaredAt",
                    header: "Declared",
                    render: (e) => <span title={dateTime(e.declaredAt)}>{date(e.declaredAt)}</span>,
                  },
                  {
                    key: "summary",
                    header: "Situation",
                    render: (e) =>
                      e.summary ? (
                        <span className="cbms-table__muted">
                          {e.summary.length > 90 ? `${e.summary.slice(0, 90)}…` : e.summary}
                        </span>
                      ) : (
                        <span className="cbms-table__muted">—</span>
                      ),
                  },
                  {
                    key: "closedAt",
                    header: "Closed",
                    render: (e) =>
                      e.closedAt ? (
                        <span title={dateTime(e.closedAt)}>{relative(e.closedAt)}</span>
                      ) : (
                        <span className="cbms-table__muted">—</span>
                      ),
                  },
                  {
                    key: "action",
                    header: "Action",
                    render: (e) => {
                      if (!mayEncode) return <span className="cbms-table__muted">—</span>;
                      const next = nextStatus(e.status);
                      if (!next) return <span className="cbms-table__muted">Terminated</span>;
                      return (
                        <Button
                          size="sm"
                          variant={next.value === "active" ? "danger" : "default"}
                          disabled={busy}
                          onClick={() => advance(e, next.value)}
                        >
                          {next.label}
                        </Button>
                      );
                    },
                  },
                ]}
                rows={events.data?.items ?? []}
                empty="No disaster events recorded for this filter."
              />
            </Async>

            <Pagination
              page={eventPage}
              pageSize={pageSize}
              total={events.data?.total ?? 0}
              onPage={setEventPage}
            />
          </Panel>
        </>
      )}

      {tab === "centers" && (
        <>
          <StatGrid>
            <StatCard
              label="Evacuation centres"
              value={num(centers.data?.total)}
              hint="On the barangay roster"
              icon="🏫"
            />
            <StatCard
              label="Currently open"
              value={num(openCenters.length)}
              hint="Receiving evacuees now"
              icon="🚪"
              tone={openCenters.length > 0 ? "gold" : "green"}
            />
            <StatCard
              label="Total capacity"
              value={num(totalCapacity)}
              hint="Persons, across every listed centre"
              icon="👥"
            />
            <StatCard
              label="Open capacity"
              value={num(openCapacity)}
              hint="Persons that can be sheltered right now"
              icon="🛏"
            />
          </StatGrid>

          {showCenter && mayEncode && (
            <>
              <Panel title="Register an evacuation centre">
                <form onSubmit={createCenter}>
                  <div className="adm-form-grid">
                    <Field label="Centre name">
                      <input
                        className="cbms-input"
                        value={centerForm.name}
                        onChange={(e) => setCenterForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="MULTI-PURPOSE COVERED COURT"
                        required
                      />
                    </Field>
                    <Field label="Capacity" hint="Maximum number of persons that may be sheltered.">
                      <input
                        className="cbms-input"
                        type="number"
                        min={1}
                        value={centerForm.capacity}
                        onChange={(e) => setCenterForm((f) => ({ ...f, capacity: e.target.value }))}
                        required
                      />
                    </Field>
                    <Field label="Address">
                      <input
                        className="cbms-input"
                        value={centerForm.addressLine}
                        onChange={(e) =>
                          setCenterForm((f) => ({ ...f, addressLine: e.target.value }))
                        }
                      />
                    </Field>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button type="submit" variant="primary" disabled={busy}>
                      {busy ? "Saving…" : "Register centre"}
                    </Button>
                    <Button type="button" onClick={() => setShowCenter(false)} disabled={busy}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Panel>
              <div style={{ height: 16 }} />
            </>
          )}

          <Panel padded={false}>
            <Toolbar>
              <strong style={{ fontSize: 13.5, color: "var(--cbms-navy)" }}>
                Evacuation centre roster
              </strong>
              <div className="cbms-toolbar__spacer" />
              <span className="adm-muted">{num(centers.data?.total)} centre(s)</span>
              {mayEncode && (
                <Button variant="primary" onClick={() => setShowCenter((v) => !v)}>
                  {showCenter ? "Close" : "+ New centre"}
                </Button>
              )}
            </Toolbar>

            <Async loading={centers.loading} error={centers.error}>
              <DataTable
                columns={[
                  {
                    key: "name",
                    header: "Centre",
                    render: (c) => <span className="cbms-table__primary">{c.name}</span>,
                  },
                  {
                    key: "capacity",
                    header: "Capacity",
                    align: "right",
                    render: (c) => num(c.capacity),
                  },
                  {
                    key: "addressLine",
                    header: "Address",
                    render: (c) => c.addressLine ?? <span className="cbms-table__muted">—</span>,
                  },
                  {
                    key: "isOpen",
                    header: "Status",
                    render: (c) =>
                      c.isOpen ? <Chip tone="green">Open</Chip> : <Chip tone="gray">Closed</Chip>,
                  },
                  {
                    key: "action",
                    header: "Action",
                    render: (c) =>
                      mayEncode ? (
                        <Button
                          size="sm"
                          variant={c.isOpen ? "default" : "primary"}
                          disabled={busy}
                          onClick={() => toggleCenter(c)}
                        >
                          {c.isOpen ? "Close centre" : "Open centre"}
                        </Button>
                      ) : (
                        <span className="cbms-table__muted">—</span>
                      ),
                  },
                ]}
                rows={centerRows}
                empty="No evacuation centres registered yet."
              />
            </Async>

            <Pagination
              page={centerPage}
              pageSize={pageSize}
              total={centers.data?.total ?? 0}
              onPage={setCenterPage}
            />
          </Panel>
        </>
      )}

      {tab === "hazards" && (
        <>
          {showHazard && mayEncode && (
            <>
              <Panel title="Map a hazard">
                <form onSubmit={createHazard}>
                  <div className="adm-form-grid">
                    <Field label="Purok / sitio">
                      <input
                        className="cbms-input"
                        value={hazardForm.purok}
                        onChange={(e) => setHazardForm((f) => ({ ...f, purok: e.target.value }))}
                        placeholder="Purok 3"
                        required
                      />
                    </Field>
                    <Field label="Hazard type">
                      <select
                        className="cbms-select"
                        value={hazardForm.hazardType}
                        onChange={(e) =>
                          setHazardForm((f) => ({ ...f, hazardType: e.target.value }))
                        }
                      >
                        {HAZARD_TYPES.map((h) => (
                          <option key={h} value={h}>
                            {titleize(h)}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Risk level" hint="Mirrors the city hazard map classification.">
                      <select
                        className="cbms-select"
                        value={hazardForm.riskLevel}
                        onChange={(e) =>
                          setHazardForm((f) => ({ ...f, riskLevel: e.target.value }))
                        }
                      >
                        {RISK_LEVELS.map((r) => (
                          <option key={r} value={r}>
                            {titleize(r)}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field label="Notes">
                    <textarea
                      className="cbms-textarea"
                      value={hazardForm.notes}
                      onChange={(e) => setHazardForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="Households at risk, historical water level, pre-emptive evacuation trigger…"
                    />
                  </Field>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button type="submit" variant="primary" disabled={busy}>
                      {busy ? "Saving…" : "Add hazard"}
                    </Button>
                    <Button type="button" onClick={() => setShowHazard(false)} disabled={busy}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Panel>
              <div style={{ height: 16 }} />
            </>
          )}

          <Panel padded={false}>
            <Toolbar>
              <strong style={{ fontSize: 13.5, color: "var(--cbms-navy)" }}>
                Purok-level hazard map
              </strong>
              {highRisk > 0 && <Chip tone="red">{num(highRisk)} high-risk on this page</Chip>}
              <div className="cbms-toolbar__spacer" />
              <span className="adm-muted">{num(hazards.data?.total)} entr(ies)</span>
              {mayEncode && (
                <Button variant="primary" onClick={() => setShowHazard((v) => !v)}>
                  {showHazard ? "Close" : "+ New hazard"}
                </Button>
              )}
            </Toolbar>

            <Async loading={hazards.loading} error={hazards.error}>
              <DataTable
                columns={[
                  {
                    key: "purok",
                    header: "Purok",
                    render: (h) => <span className="cbms-table__primary">{h.purok}</span>,
                  },
                  {
                    key: "hazardType",
                    header: "Hazard",
                    render: (h) => (
                      <Chip tone="navy">
                        {HAZARD_ICON[h.hazardType] ?? "⚠"} {titleize(h.hazardType)}
                      </Chip>
                    ),
                  },
                  {
                    key: "riskLevel",
                    header: "Risk level",
                    render: (h) => (
                      <Chip tone={RISK_TONE[h.riskLevel] ?? "gray"}>{titleize(h.riskLevel)}</Chip>
                    ),
                  },
                  {
                    key: "notes",
                    header: "Notes",
                    render: (h) =>
                      h.notes ? (
                        <span className="cbms-table__muted">{h.notes}</span>
                      ) : (
                        <span className="cbms-table__muted">—</span>
                      ),
                  },
                ]}
                rows={hazardRows}
                empty="No hazards mapped yet."
              />
            </Async>

            <Pagination
              page={hazardPage}
              pageSize={pageSize}
              total={hazards.data?.total ?? 0}
              onPage={setHazardPage}
            />
          </Panel>
        </>
      )}
    </>
  );
}
