"use client";

import * as React from "react";
import { Alert, Chip, Loading, date, titleize } from "@cbms/ui";
import { useApi } from "@cbms/api-client";
import { Card, Muted, Shell } from "@/components/Shell";
import { useT } from "@/i18n";
import { JOB_KINDS } from "@/lib/labels";
import { errorMessage, useResidentSession } from "@/lib/session";
import type { JobPost, ListResponse } from "@/lib/types";

export default function JobsPage() {
  const { t, lang } = useT();
  const { ready } = useResidentSession();
  const jobsReq = useApi<ListResponse<JobPost>>(ready ? "/jobs" : null);

  if (!ready) return <Loading label={t("loading")} />;

  const jobs = (jobsReq.data?.items ?? []).filter((j) => j.isActive);

  return (
    <Shell title={t("jobs_title")} subtitle={t("jobs_sub")} back="/" exclusive>
      {jobsReq.error && <Alert tone="danger">{errorMessage(jobsReq.error, lang)}</Alert>}

      {jobsReq.loading ? (
        <Muted>{t("loading")}</Muted>
      ) : jobs.length === 0 ? (
        <Card>
          <Muted>{t("jobs_none")}</Muted>
        </Card>
      ) : (
        jobs.map((job) => (
          <Card
            key={job.id}
            title={job.title}
            right={
              <Chip tone="navy">
                {JOB_KINDS[job.kind] ? t(JOB_KINDS[job.kind]!) : titleize(job.kind)}
              </Chip>
            }
          >
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>{job.description}</div>
            <div style={{ marginTop: 10, fontSize: 12.5, color: "var(--cbms-muted)" }}>
              <div>
                <strong>{t("jobs_employer")}:</strong> {job.employer}
              </div>
              {job.location && (
                <div>
                  <strong>{t("jobs_location")}:</strong> {job.location}
                </div>
              )}
              {job.salaryRange && (
                <div>
                  <strong>{t("jobs_salary")}:</strong> {job.salaryRange}
                </div>
              )}
              {job.contact && (
                <div>
                  <strong>{t("jobs_contact")}:</strong> {job.contact}
                </div>
              )}
              {job.closesAt && <div>{t("jobs_closes", { when: date(job.closesAt) })}</div>}
            </div>
          </Card>
        ))
      )}
    </Shell>
  );
}
