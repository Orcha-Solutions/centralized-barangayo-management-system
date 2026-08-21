"use client";

import * as React from "react";
import { Alert, Button, Chip, Field, Loading, dateTime } from "@cbms/ui";
import { post, useApi } from "@cbms/api-client";
import { Card, Muted, SectionTitle, Shell } from "@/components/Shell";
import { useT } from "@/i18n";
import { APPOINTMENT_SERVICES, APPOINTMENT_STATUS } from "@/lib/labels";
import { errorMessage, useResidentSession } from "@/lib/session";
import type { Appointment, ListResponse } from "@/lib/types";

export default function AppointmentsPage() {
  const { t, lang } = useT();
  const { ready, inhabitantId } = useResidentSession();
  const mineReq = useApi<ListResponse<Appointment>>(ready ? "/appointments" : null);

  const [service, setService] = React.useState("certificate");
  const [when, setWhen] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  if (!ready) return <Loading label={t("loading")} />;

  async function book(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    if (!when) {
      setError(t("appt_pick_time"));
      return;
    }
    setBusy(true);
    try {
      await post("/appointments", {
        service,
        scheduledAt: new Date(when).toISOString(),
        ...(inhabitantId ? { inhabitantId } : {}),
      });
      setOk(t("appt_booked"));
      setWhen("");
      mineReq.reload();
    } catch (err) {
      setError(errorMessage(err, lang));
    } finally {
      setBusy(false);
    }
  }

  const mine = mineReq.data?.items ?? [];

  return (
    <Shell title={t("appt_title")} subtitle={t("appt_sub")} back="/" exclusive>
      {ok && <Alert tone="success">{ok}</Alert>}
      {error && <Alert tone="danger">{error}</Alert>}

      <form onSubmit={book}>
        <Card title={t("appt_book")}>
          <Field label={t("appt_service")}>
            <select
              className="cbms-select"
              style={{ width: "100%" }}
              value={service}
              onChange={(e) => setService(e.target.value)}
            >
              {APPOINTMENT_SERVICES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.icon} {t(s.key)}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t("appt_when")}>
            <input
              className="cbms-input"
              style={{ width: "100%" }}
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              required
            />
          </Field>

          <Button
            type="submit"
            variant="primary"
            disabled={busy}
            style={{ width: "100%", height: 44 }}
          >
            {busy ? t("sending") : t("appt_submit")}
          </Button>
        </Card>
      </form>

      <SectionTitle>{t("appt_mine")}</SectionTitle>
      {mineReq.loading ? (
        <Muted>{t("loading")}</Muted>
      ) : mine.length === 0 ? (
        <Card>
          <Muted>{t("appt_none")}</Muted>
        </Card>
      ) : (
        mine.map((appt) => {
          const svc = APPOINTMENT_SERVICES.find((s) => s.value === appt.service);
          const statusMeta = APPOINTMENT_STATUS[appt.status];
          return (
            <Card
              key={appt.id}
              title={svc ? `${svc.icon} ${t(svc.key)}` : appt.service}
              right={
                <Chip tone={statusMeta ? statusMeta.tone : "gray"}>
                  {statusMeta ? t(statusMeta.key) : appt.status}
                </Chip>
              }
            >
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{dateTime(appt.scheduledAt)}</div>
              {appt.queueNumber && (
                <div style={{ marginTop: 8 }}>
                  <Chip tone="navy">
                    {t("appt_queue")} {appt.queueNumber}
                  </Chip>
                </div>
              )}
            </Card>
          );
        })
      )}
    </Shell>
  );
}
