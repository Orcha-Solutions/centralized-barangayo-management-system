"use client";

import * as React from "react";
import { Alert, Button, Chip, Field, Loading, dateTime } from "@cbms/ui";
import { post } from "@cbms/api-client";
import { Card, Muted, Shell } from "@/components/Shell";
import { useT } from "@/i18n";
import { SOS_KINDS } from "@/lib/labels";
import { errorMessage, useResidentSession } from "@/lib/session";
import type { SosAlert } from "@/lib/types";

export default function SosPage() {
  const { t, lang } = useT();
  const { ready } = useResidentSession();

  const [kind, setKind] = React.useState("medical");
  const [note, setNote] = React.useState("");
  const [isTest, setIsTest] = React.useState(false);
  const [coords, setCoords] = React.useState<{ latitude: number; longitude: number } | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState<SosAlert | null>(null);

  // Warm up the location up front so the SOS itself is a single tap.
  React.useEffect(() => {
    if (!ready) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCoords({
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        }),
      () => setCoords(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 120000 },
    );
  }, [ready]);

  if (!ready) return <Loading label={t("loading")} />;

  async function send() {
    setBusy(true);
    setError(null);
    try {
      const alert = await post<SosAlert>("/sos", {
        kind,
        isTest,
        ...(note.trim() ? { note: note.trim() } : {}),
        ...(coords ?? {}),
      });
      setSent(alert);
    } catch (err) {
      setError(errorMessage(err, lang));
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <Shell title={t("sos_title")} subtitle={t("sos_sub")} back="/" exclusive>
        <Alert tone={sent.isTest ? "info" : "success"}>
          {sent.isTest ? t("sos_sent_test") : t("sos_sent_live")}
        </Alert>

        <Card title={t("sos_reference")}>
          <div
            style={{
              fontFamily: "ui-monospace, Consolas, monospace",
              fontSize: 16,
              fontWeight: 800,
              color: "var(--cbms-navy)",
              wordBreak: "break-all",
            }}
          >
            SOS-{sent.id.slice(-10).toUpperCase()}
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Chip tone={sent.isTest ? "gray" : "red"}>
              {sent.isTest ? t("sos_test_mode") : t("sos_title")}
            </Chip>
            <Chip tone="navy">
              {t(SOS_KINDS.find((k) => k.value === sent.kind)?.key ?? "kind_medical")}
            </Chip>
          </div>
          <Muted>{dateTime(sent.createdAt)}</Muted>
          <Muted>
            {sent.latitude !== null && sent.longitude !== null
              ? t("sos_location_used")
              : t("sos_location_missing")}
          </Muted>
        </Card>

        <Alert tone="warn">{t("sos_call_hint")}</Alert>

        <Button
          onClick={() => {
            setSent(null);
            setNote("");
          }}
          style={{ width: "100%" }}
        >
          {t("sos_another")}
        </Button>
      </Shell>
    );
  }

  return (
    <Shell title={t("sos_title")} subtitle={t("sos_sub")} back="/" exclusive>
      {error && <Alert tone="danger">{error}</Alert>}

      <Card title={t("sos_kind")}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {SOS_KINDS.map((k) => {
            const active = k.value === kind;
            return (
              <button
                key={k.value}
                type="button"
                className="cbms-tile"
                onClick={() => setKind(k.value)}
                aria-pressed={active}
                style={{
                  borderColor: active ? "var(--cbms-red)" : undefined,
                  borderWidth: active ? 2 : 1,
                  background: active ? "#fdeaec" : undefined,
                }}
              >
                <span className="cbms-tile__icon" aria-hidden="true">
                  {k.icon}
                </span>
                <span className="cbms-tile__label">{t(k.key)}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <Field label={`${t("sos_note")} (${t("optional")})`}>
          <textarea
            className="cbms-textarea"
            style={{ width: "100%" }}
            rows={2}
            placeholder={t("sos_note_ph")}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>

        {/* Test mode must be unmistakable — a mislabelled drill wastes responders. */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            border: `2px solid ${isTest ? "var(--cbms-navy)" : "var(--cbms-line)"}`,
            borderRadius: "var(--cbms-radius)",
            background: isTest ? "var(--cbms-card)" : "#fff",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={isTest}
            onChange={(e) => setIsTest(e.target.checked)}
            style={{ width: 20, height: 20 }}
          />
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--cbms-navy)" }}>
            {t("sos_test_mode")}
          </span>
        </label>

        <div style={{ marginTop: 10 }}>
          <Alert tone={isTest ? "info" : "danger"}>
            {isTest ? t("sos_test_hint") : t("sos_live_hint")}
          </Alert>
        </div>
      </Card>

      <button
        type="button"
        className="cbms-sos"
        disabled={busy}
        onClick={() => void send()}
        style={{
          opacity: busy ? 0.6 : 1,
          background: isTest ? "var(--cbms-navy)" : undefined,
        }}
      >
        {busy ? t("sos_sending") : isTest ? t("sos_send_test") : `🚨 ${t("sos_send")}`}
      </button>

      <Muted>{coords ? t("sos_location_used") : t("sos_location_missing")}</Muted>
      <Muted>{t("sos_call_hint")}</Muted>
    </Shell>
  );
}
