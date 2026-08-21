"use client";

import * as React from "react";
import { Alert, Button, Chip, Field, Loading, dateTime, relative } from "@cbms/ui";
import { post, useApi } from "@cbms/api-client";
import { Card, Muted, SectionTitle, Shell } from "@/components/Shell";
import { useT } from "@/i18n";
import { CONCERN_CATEGORIES, CONCERN_STATUS } from "@/lib/labels";
import { errorMessage, useResidentSession } from "@/lib/session";
import type { Concern, ListResponse } from "@/lib/types";

interface Coords {
  latitude: number;
  longitude: number;
}

export default function ReportPage() {
  const { t, lang } = useT();
  const { ready } = useResidentSession();
  const mineReq = useApi<ListResponse<Concern>>(ready ? "/me/concerns" : null);

  const [category, setCategory] = React.useState<string>("streetlight");
  const [description, setDescription] = React.useState("");
  const [purok, setPurok] = React.useState("");
  const [coords, setCoords] = React.useState<Coords | null>(null);
  const [locating, setLocating] = React.useState(false);
  const [locationNote, setLocationNote] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState<string | null>(null);

  if (!ready) return <Loading label={t("loading")} />;

  function requestLocation() {
    setLocationNote(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationNote(t("rep_location_unsupported"));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = {
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        };
        setCoords(next);
        setLocationNote(
          t("rep_location_set", { lat: next.latitude, lng: next.longitude }),
        );
        setLocating(false);
      },
      () => {
        setCoords(null);
        setLocationNote(t("rep_location_denied"));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSent(null);
    if (description.trim().length < 5) {
      setError(t("rep_description_short"));
      return;
    }
    setBusy(true);
    try {
      const created = await post<Concern>("/concerns", {
        category,
        description: description.trim(),
        ...(purok.trim() ? { purok: purok.trim() } : {}),
        ...(coords ?? {}),
      });
      setSent(t("rep_sent", { ref: created.referenceNo }));
      setDescription("");
      setPurok("");
      setCoords(null);
      setLocationNote(null);
      mineReq.reload();
    } catch (err) {
      setError(errorMessage(err, lang));
    } finally {
      setBusy(false);
    }
  }

  const mine = mineReq.data?.items ?? [];

  return (
    <Shell title={t("report_title")} subtitle={t("report_sub")} exclusive>
      {sent && <Alert tone="success">{sent}</Alert>}
      {error && <Alert tone="danger">{error}</Alert>}

      <form onSubmit={submit}>
        <Card title={t("rep_category")}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {CONCERN_CATEGORIES.map((c) => {
              const active = c.value === category;
              return (
                <button
                  key={c.value}
                  type="button"
                  className="cbms-tile"
                  onClick={() => setCategory(c.value)}
                  aria-pressed={active}
                  style={{
                    borderColor: active ? "var(--cbms-navy)" : undefined,
                    borderWidth: active ? 2 : 1,
                    background: active ? "var(--cbms-card)" : undefined,
                  }}
                >
                  <span className="cbms-tile__icon" aria-hidden="true">
                    {c.icon}
                  </span>
                  <span className="cbms-tile__label">{t(c.key)}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <Field label={t("rep_description")}>
            <textarea
              className="cbms-textarea"
              style={{ width: "100%" }}
              rows={4}
              placeholder={t("rep_description_ph")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Field>

          <Field label={`${t("rep_purok")} (${t("optional")})`}>
            <input
              className="cbms-input"
              style={{ width: "100%" }}
              placeholder={t("rep_purok_ph")}
              value={purok}
              onChange={(e) => setPurok(e.target.value)}
            />
          </Field>

          <Button
            type="button"
            onClick={requestLocation}
            disabled={locating}
            style={{ width: "100%" }}
          >
            📍 {locating ? t("rep_locating") : t("rep_use_location")}
          </Button>
          {locationNote && (
            <div style={{ marginTop: 8 }}>
              <Alert tone={coords ? "success" : "warn"}>{locationNote}</Alert>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={busy}
            style={{ width: "100%", height: 44, marginTop: 12 }}
          >
            {busy ? t("sending") : t("rep_submit")}
          </Button>
        </Card>
      </form>

      <SectionTitle>{t("rep_my_concerns")}</SectionTitle>
      {mineReq.loading ? (
        <Muted>{t("loading")}</Muted>
      ) : mine.length === 0 ? (
        <Card>
          <Muted>{t("rep_none")}</Muted>
        </Card>
      ) : (
        mine.map((c) => <ConcernCard key={c.id} concern={c} />)
      )}
    </Shell>
  );
}

function ConcernCard({ concern }: { concern: Concern }) {
  const { t } = useT();
  const meta = CONCERN_STATUS[concern.status];
  const catLabel = CONCERN_CATEGORIES.find((c) => c.value === concern.category);

  const open = concern.status !== "resolved" && concern.status !== "rejected";
  const breached =
    concern.slaBreached ??
    (open && !!concern.slaDueAt && new Date(concern.slaDueAt).getTime() < Date.now());

  return (
    <Card
      title={catLabel ? t(catLabel.key) : concern.category}
      right={meta ? <Chip tone={meta.tone}>{t(meta.key)}</Chip> : null}
    >
      <div style={{ fontSize: 12.5, color: "var(--cbms-muted)" }}>
        {concern.referenceNo} · {relative(concern.createdAt)}
      </div>
      <div style={{ fontSize: 13.5, marginTop: 6, lineHeight: 1.5 }}>{concern.description}</div>

      {concern.purok && (
        <div style={{ marginTop: 8 }}>
          <Chip tone="gray">
            {t("rep_purok")}: {concern.purok}
          </Chip>
        </div>
      )}

      <div style={{ marginTop: 10 }}>
        {concern.resolvedAt ? (
          <Chip tone="green">{t("rep_resolved_on", { when: dateTime(concern.resolvedAt) })}</Chip>
        ) : breached ? (
          <Chip tone="red">{t("rep_sla_breached")}</Chip>
        ) : concern.slaDueAt ? (
          <Chip tone="gold">{t("rep_sla_due", { when: dateTime(concern.slaDueAt) })}</Chip>
        ) : null}
      </div>

      {concern.resolutionNote && (
        <div style={{ marginTop: 10, fontSize: 13 }}>
          <strong>{t("rep_resolution")}:</strong> {concern.resolutionNote}
        </div>
      )}
    </Card>
  );
}
