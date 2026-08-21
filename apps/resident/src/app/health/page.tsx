"use client";

import * as React from "react";
import { Alert, Chip, Loading, date, titleize } from "@cbms/ui";
import { useApi } from "@cbms/api-client";
import { Card, Muted, Shell } from "@/components/Shell";
import { useT } from "@/i18n";
import { errorMessage, useResidentSession } from "@/lib/session";
import type { HealthCampaign, ListResponse } from "@/lib/types";

export default function HealthPage() {
  const { t, lang } = useT();
  const { ready } = useResidentSession();
  const campaignsReq = useApi<ListResponse<HealthCampaign>>(
    ready ? "/health/campaigns" : null,
  );

  if (!ready) return <Loading label={t("loading")} />;

  const campaigns = campaignsReq.data?.items ?? [];

  return (
    <Shell title={t("health_title")} subtitle={t("health_sub")} back="/" exclusive>
      {campaignsReq.error && <Alert tone="danger">{errorMessage(campaignsReq.error, lang)}</Alert>}

      {campaignsReq.loading ? (
        <Muted>{t("loading")}</Muted>
      ) : campaigns.length === 0 ? (
        <Card>
          <Muted>{t("health_none")}</Muted>
        </Card>
      ) : (
        campaigns.map((c) => (
          <Card
            key={c.id}
            title={c.name}
            right={
              <Chip tone={c.isActive ? "green" : "gray"}>
                {c.isActive ? t("health_active") : t("health_ended")}
              </Chip>
            }
          >
            <Chip tone="navy">{titleize(c.kind)}</Chip>
            <div style={{ fontSize: 12.5, color: "var(--cbms-muted)", marginTop: 8 }}>
              {t("health_starts", { when: date(c.startsAt) })}
              {c.endsAt ? ` · ${t("health_until", { when: date(c.endsAt) })}` : ""}
            </div>
          </Card>
        ))
      )}
    </Shell>
  );
}
