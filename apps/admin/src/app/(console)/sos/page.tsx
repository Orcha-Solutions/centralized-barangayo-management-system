"use client";

import * as React from "react";
import { ApiError, post, useApi } from "@cbms/api-client";
import {
  Alert,
  Button,
  Chip,
  Field,
  PageHead,
  Panel,
  StatCard,
  StatGrid,
  StatusChip,
  dateTime,
  num,
  relative,
} from "@cbms/ui";
import { ActionResult, Async, EmptyNote } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import { SOS_KIND_ICON } from "../../../lib/labels";
import type { Bag, SosAlert } from "../../../lib/types";

/** Minutes elapsed since an alert was raised. */
function minutesSince(iso: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
}

export default function SosPage() {
  const { can } = useConsole();
  const mayRespond = can("sos:encode");

  const list = useApi<Bag<SosAlert>>("/sos");

  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);
  const [noteFor, setNoteFor] = React.useState<string | null>(null);
  const [note, setNote] = React.useState("");

  // A dispatch board should not go stale while someone is watching it.
  React.useEffect(() => {
    const t = window.setInterval(() => list.reload(), 20000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const alerts = list.data?.items ?? [];
  const live = alerts.filter((a) => a.status === "active" && !a.isTest);
  const dispatched = alerts.filter((a) => a.status === "dispatched");
  const tests = alerts.filter((a) => a.isTest || a.status === "test");

  async function respond(a: SosAlert, status: string, responseNote?: string) {
    setBusyId(a.id);
    setError(null);
    setOk(null);
    try {
      await post(`/sos/${a.id}/respond`, {
        status,
        ...(responseNote ? { responseNote } : {}),
      });
      setOk(`Alert marked “${status.replace("_", " ")}”.`);
      setNoteFor(null);
      setNote("");
      list.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not update the alert.");
    } finally {
      setBusyId(null);
    }
  }

  function AlertCard({ a }: { a: SosAlert }) {
    const mins = minutesSince(a.createdAt);
    const urgent = a.status === "active" && mins >= 5 && !a.isTest;
    return (
      <div className={`adm-sos-card${urgent ? " adm-sos-card--urgent" : ""}`}>
        <div className="adm-sos-card__head">
          <span className="adm-sos-card__icon">{SOS_KIND_ICON[a.kind] ?? "🚨"}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="adm-sos-card__kind">
              {a.kind.toUpperCase()}
              {a.isTest && (
                <>
                  {" "}
                  <Chip tone="gray">TEST</Chip>
                </>
              )}
            </div>
            <div className="adm-muted">
              {a.inhabitant
                ? `${a.inhabitant.firstName} ${a.inhabitant.lastName}`
                : "Unidentified caller"}
              {a.inhabitant?.contactPhone ? ` · ${a.inhabitant.contactPhone}` : ""}
            </div>
          </div>
          <StatusChip status={a.status} />
        </div>

        <div className="adm-sos-card__meta">
          <span title={dateTime(a.createdAt)}>
            ⏱ {mins < 1 ? "just now" : `${mins} min ago`}
          </span>
          {a.latitude != null && a.longitude != null && (
            <a
              className="adm-strong"
              style={{ textDecoration: "underline" }}
              href={`https://www.google.com/maps?q=${a.latitude},${a.longitude}`}
              target="_blank"
              rel="noreferrer"
            >
              📍 {a.latitude.toFixed(5)}, {a.longitude.toFixed(5)}
            </a>
          )}
        </div>

        {a.note && <p className="adm-sos-card__note">“{a.note}”</p>}
        {a.responseNote && (
          <p className="adm-muted" style={{ marginBottom: 0 }}>
            Response: {a.responseNote}
          </p>
        )}

        {mayRespond && !["resolved", "false_alarm"].includes(a.status) && (
          <div className="adm-sos-card__actions">
            {a.status === "active" && (
              <Button
                size="sm"
                disabled={busyId === a.id}
                onClick={() => respond(a, "acknowledged")}
              >
                Acknowledge
              </Button>
            )}
            {["active", "acknowledged"].includes(a.status) && (
              <Button
                size="sm"
                variant="primary"
                disabled={busyId === a.id}
                onClick={() => respond(a, "dispatched")}
              >
                Dispatch responder
              </Button>
            )}
            <Button
              size="sm"
              variant="gold"
              disabled={busyId === a.id}
              onClick={() => {
                setNoteFor(a.id);
                setNote("");
              }}
            >
              Resolve…
            </Button>
            <Button
              size="sm"
              disabled={busyId === a.id}
              onClick={() => respond(a, "false_alarm")}
            >
              False alarm
            </Button>
          </div>
        )}

        {noteFor === a.id && (
          <div style={{ marginTop: 10 }}>
            <Field label="What happened?">
              <textarea
                className="cbms-textarea"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Tanod team responded; resident brought to the health center."
              />
            </Field>
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                size="sm"
                variant="primary"
                disabled={busyId === a.id || note.trim().length < 3}
                onClick={() => respond(a, "resolved", note.trim())}
              >
                Mark resolved
              </Button>
              <Button size="sm" onClick={() => setNoteFor(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <PageHead
        title="SOS dispatch board"
        subtitle="Live panic alerts raised from the resident app. The board refreshes every 20 seconds."
        breadcrumb="Justice & Safety"
        exclusive
        actions={<Button onClick={() => list.reload()}>↻ Refresh</Button>}
      />

      <ActionResult error={error} success={ok} />

      <StatGrid>
        <StatCard
          label="Live alerts"
          value={num(live.length)}
          hint="Awaiting acknowledgement"
          icon="🚨"
          tone={live.length > 0 ? "red" : "green"}
        />
        <StatCard
          label="Responder dispatched"
          value={num(dispatched.length)}
          hint="En route"
          icon="🚓"
          tone="gold"
        />
        <StatCard
          label="Test alerts"
          value={num(tests.length)}
          hint="Drills — not real emergencies"
          icon="🧪"
        />
        <StatCard
          label="On the board"
          value={num(alerts.length)}
          hint="Active, acknowledged and dispatched"
          icon="📋"
        />
      </StatGrid>

      {live.length > 0 && (
        <Alert tone="danger">
          <strong>{live.length}</strong> unacknowledged emergency
          {live.length === 1 ? "" : " alerts"}. Acknowledge to let the resident know help is coming.
        </Alert>
      )}

      <Async loading={list.loading} error={list.error}>
        {alerts.length === 0 ? (
          <Panel>
            <EmptyNote>
              No open alerts. Raise a <strong>test</strong> alert from the resident app to see the
              board light up.
            </EmptyNote>
          </Panel>
        ) : (
          <div className="adm-sos-grid">
            {[...alerts]
              .sort((a, b) => {
                // Real emergencies first, then oldest first.
                const rank = (x: SosAlert) =>
                  x.isTest ? 2 : x.status === "active" ? 0 : 1;
                const r = rank(a) - rank(b);
                return r !== 0
                  ? r
                  : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
              })
              .map((a) => (
                <AlertCard key={a.id} a={a} />
              ))}
          </div>
        )}
      </Async>
    </>
  );
}
