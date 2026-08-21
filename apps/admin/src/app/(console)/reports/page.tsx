"use client";

import * as React from "react";
import { useApi } from "@cbms/api-client";
import {
  Alert,
  Button,
  Chip,
  DataTable,
  KeyValue,
  PageHead,
  Panel,
  StatCard,
  StatGrid,
  Toolbar,
  num,
  peso,
  titleize,
} from "@cbms/ui";
import { Async, BarRow, EmptyNote } from "../../../components/common";
import { downloadText, toCsv } from "../../../lib/download";
import type { CsmSummary, QuarterlyReport } from "../../../lib/types";

const QUARTERLY_FIELDS: Array<[string, (r: QuarterlyReport) => string | number]> = [
  ["PERIOD", (r) => r.period],
  ["BARANGAYS_COVERED", (r) => r.barangaysCovered],
  ["REGISTERED_INHABITANTS", (r) => r.registeredInhabitants],
  ["CERTIFICATES_ISSUED", (r) => r.certificatesIssued],
  ["KP_CASES_FILED", (r) => r.kpCasesFiled],
  ["CONCERNS_RECEIVED", (r) => r.concernsReceived],
  ["DISBURSEMENT_COUNT", (r) => r.disbursementCount],
  ["DISBURSEMENT_TOTAL_PESOS", (r) => (Number(r.disbursementTotalCentavos) / 100).toFixed(2)],
  ["CSM_RESPONSES", (r) => r.csmResponses],
  ["CSM_AVERAGE", (r) => r.csmAverage],
];

export default function ReportsPage() {
  const quarterly = useApi<QuarterlyReport>("/reports/quarterly");
  const csm = useApi<CsmSummary>("/feedback/csm");

  const q = quarterly.data;
  const c = csm.data;

  function exportQuarterly() {
    if (!q) return;
    const csv = toCsv(
      QUARTERLY_FIELDS.map(([h]) => h),
      [QUARTERLY_FIELDS.map(([, get]) => get(q))],
    );
    downloadText(csv, `quarterly-${q.period}.csv`, "text/csv;charset=utf-8;");
  }

  const distribution = [...(c?.distribution ?? [])].sort((a, b) => b.star - a.star);
  const maxCount = distribution.reduce((m, d) => Math.max(m, d.count), 0);

  return (
    <>
      <PageHead
        title="Reports"
        subtitle="The quarterly statistical rollup aligned to NBOO quarterly reporting, plus the Client Satisfaction Measurement that RA 11032 requires every service office to publish."
        breadcrumb="Admin"
        exclusive
        actions={
          <Button variant="primary" onClick={exportQuarterly} disabled={!q}>
            ⬇ Download CSV
          </Button>
        }
      />

      <Panel title="Quarterly statistical report">
        <Async loading={quarterly.loading} error={quarterly.error}>
          {q ? (
            <>
              <div className="adm-row" style={{ marginBottom: 12 }}>
                <Chip tone="navy">{q.period}</Chip>
                <Chip tone="gray">
                  {num(q.barangaysCovered)} barangay{q.barangaysCovered === 1 ? "" : "s"} in scope
                </Chip>
              </div>
              <KeyValue
                items={[
                  ["Period", q.period],
                  ["Barangays covered", num(q.barangaysCovered)],
                  ["Registered inhabitants", num(q.registeredInhabitants)],
                  ["Certificates issued", num(q.certificatesIssued)],
                  ["KP cases filed", num(q.kpCasesFiled)],
                  ["Concerns received", num(q.concernsReceived)],
                  ["Disbursements", `${num(q.disbursementCount)} transaction(s)`],
                  ["Disbursement total", peso(q.disbursementTotalCentavos)],
                  ["CSM responses", num(q.csmResponses)],
                  ["CSM average", `${q.csmAverage.toFixed(2)} / 5.00`],
                ]}
              />
              {q.note && (
                <div style={{ marginTop: 14 }}>
                  <Alert tone="info">{q.note}</Alert>
                </div>
              )}
            </>
          ) : (
            <EmptyNote>No quarterly figures are available for this scope.</EmptyNote>
          )}
        </Async>
      </Panel>

      <div style={{ height: 16 }} />

      <StatGrid>
        <StatCard
          label="CSM responses"
          value={num(c?.responses)}
          hint="Last 90 days"
          icon="🗳"
        />
        <StatCard
          label="Average rating"
          value={`${(c?.averageRating ?? 0).toFixed(2)} / 5`}
          hint="All services"
          icon="⭐"
          tone={(c?.averageRating ?? 0) >= 4 ? "green" : "gold"}
        />
        <StatCard
          label="Satisfaction rate"
          value={`${c?.satisfactionRate ?? 0}%`}
          hint="Share rating 4 or 5"
          icon="😊"
          tone={(c?.satisfactionRate ?? 0) >= 80 ? "green" : "gold"}
        />
        <StatCard
          label="Grievances"
          value={num(c?.grievances)}
          hint="Flagged for the grievance desk"
          icon="⚠️"
          tone={(c?.grievances ?? 0) > 0 ? "red" : "navy"}
        />
      </StatGrid>

      <div className="cbms-grid-2">
        <Panel title="Rating distribution">
          <Async loading={csm.loading} error={csm.error}>
            {distribution.length ? (
              <div className="adm-bars">
                {distribution.map((d) => (
                  <BarRow
                    key={d.star}
                    label={`${"★".repeat(d.star)}${"☆".repeat(5 - d.star)}`}
                    value={d.count}
                    max={maxCount}
                    tone={d.star >= 4 ? "green" : d.star === 3 ? "gold" : "red"}
                  />
                ))}
              </div>
            ) : (
              <EmptyNote>No feedback has been submitted in the last 90 days.</EmptyNote>
            )}
          </Async>
          <div className="adm-kpi-note">
            RA 11032 counts a rating of 4 or 5 as satisfied. Ratings of 1 and 2 are routed to the
            grievance desk with the transaction that produced them.
          </div>
        </Panel>

        <Panel title="What these numbers are for">
          <p style={{ fontSize: 13.5, marginTop: 0 }}>
            The quarterly rollup is the statistical return the barangay owes upward — population,
            issuance, justice and disbursement volumes for the current quarter, aligned to NBOO
            quarterly reporting. It is aggregate only: no resident-level data leaves this screen.
          </p>
          <ul style={{ fontSize: 13, paddingLeft: 18, lineHeight: 1.8 }}>
            <li>
              <strong>Certificates issued</strong> — front-line throughput, paired with the queue
              for processing time.
            </li>
            <li>
              <strong>KP cases filed</strong> — Katarungang Pambarangay caseload for the quarter.
            </li>
            <li>
              <strong>Disbursement total</strong> — value moved through the e-wallet rail, in
              centavos at source.
            </li>
            <li>
              <strong>CSM average</strong> — the RA 11032 satisfaction measure, computed from the
              same feedback shown on the left.
            </li>
          </ul>
          <div className="adm-kpi-note">
            Download the CSV to attach the figures to the quarterly submission.
          </div>
        </Panel>
      </div>

      <div style={{ height: 16 }} />

      <Panel padded={false}>
        <Toolbar>
          <strong style={{ fontSize: 13.5, color: "var(--cbms-navy)" }}>
            Satisfaction by service
          </strong>
          <div className="cbms-toolbar__spacer" />
          <span className="adm-muted">{num(c?.byService?.length)} service(s) rated</span>
        </Toolbar>

        <Async loading={csm.loading} error={csm.error}>
          <DataTable
            columns={[
              {
                key: "service",
                header: "Service",
                render: (r) => <span className="cbms-table__primary">{titleize(r.service)}</span>,
              },
              {
                key: "average",
                header: "Average rating",
                align: "right",
                render: (r) => (
                  <Chip tone={r.average >= 4 ? "green" : r.average >= 3 ? "gold" : "red"}>
                    {r.average.toFixed(2)} / 5
                  </Chip>
                ),
              },
              {
                key: "responses",
                header: "Responses",
                align: "right",
                render: (r) => num(r.responses),
              },
            ]}
            rows={c?.byService ?? []}
            rowKey={(r) => r.service}
            empty="No service has been rated in the last 90 days."
          />
        </Async>
      </Panel>
    </>
  );
}
