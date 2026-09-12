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
import { ActionResult, Async, BarRow, EmptyNote } from "../../../components/common";
import { downloadText, toCsv } from "../../../lib/download";
import {
  REPORT_SAMPLES,
  downloadSampleReport,
  type ReportSample,
} from "../../../lib/reportSamples";
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

  const [sampleCategory, setSampleCategory] = React.useState<string>("ALL");
  const [sampleSearch, setSampleSearch] = React.useState<string>("");
  const [downloadMsg, setDownloadMsg] = React.useState<string | null>(null);

  function exportQuarterly() {
    if (!q) return;
    const csv = toCsv(
      QUARTERLY_FIELDS.map(([h]) => h),
      [QUARTERLY_FIELDS.map(([, get]) => get(q))],
    );
    downloadText(csv, `quarterly-${q.period}.csv`, "text/csv;charset=utf-8;");
    setDownloadMsg(`Downloaded quarterly rollup report for period ${q.period}.`);
  }

  function handleDownloadCsv(sample: ReportSample) {
    downloadSampleReport(sample);
    setDownloadMsg(`Downloaded sample “${sample.filename}” (${sample.recordCount} sample records).`);
  }

  const filteredSamples = REPORT_SAMPLES.filter((s) => {
    if (sampleCategory !== "ALL" && s.category !== sampleCategory) return false;
    if (sampleSearch.trim()) {
      const q = sampleSearch.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.complianceTag.toLowerCase().includes(q) ||
        s.filename.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const distribution = [...(c?.distribution ?? [])].sort((a, b) => b.star - a.star);
  const maxCount = distribution.reduce((m, d) => Math.max(m, d.count), 0);

  return (
    <>
      <PageHead
        title="Reports & Compliance"
        subtitle="The quarterly statistical rollup aligned to DILG NBOO standards, official downloadable reporting templates, and the RA 11032 Citizen Satisfaction Measurement."
        breadcrumb="Admin"
        exclusive
        actions={
          <Button variant="primary" onClick={exportQuarterly} disabled={!q}>
            ⬇ CSV
          </Button>
        }
      />

      <ActionResult success={downloadMsg} />

      {/* Downloadable DILG Samples & Templates */}
      <Panel
        title="📥 Downloadable Report Samples & Official DILG Templates"
        actions={
          <span className="adm-muted" style={{ fontSize: "0.85rem" }}>
            {filteredSamples.length} template sample(s) available
          </span>
        }
      >
        <div style={{ marginBottom: "1rem" }}>
          <p style={{ margin: "0 0 1rem 0", fontSize: 13.5, lineHeight: 1.6, color: "var(--color-text, #1b2430)" }}>
            Download pre-formatted, DILG-compliant sample datasets and intake templates for BIPS inhabitants profiling, BDP multi-year investments, Katarungang Pambarangay caseloads, GAD budget matrices, and ARTA citizen feedback.
          </p>

          <Toolbar>
            <select
              className="cbms-select"
              value={sampleCategory}
              onChange={(e) => setSampleCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="BIPS">DILG BIPS Profiling (Forms A1, A2, A4)</option>
              <option value="BDP">Barangay Development Plan (BDP / AIP)</option>
              <option value="KP">Katarungang Pambarangay (KPISBH)</option>
              <option value="GAD">Gender & Development (BGADPBMS)</option>
              <option value="CSM">Citizen Satisfaction (RA 11032)</option>
              <option value="OFFICIALS">Barangay Officials Roster</option>
            </select>

            <input
              className="cbms-input"
              type="search"
              placeholder="Search templates or compliance tag…"
              style={{ maxWidth: 300 }}
              value={sampleSearch}
              onChange={(e) => setSampleSearch(e.target.value)}
            />
          </Toolbar>
        </div>

        <DataTable
          columns={[
            {
              key: "title",
              header: "Report / Form Title",
              render: (s: ReportSample) => (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span className="cbms-table__primary" style={{ fontWeight: 600 }}>
                      {s.title}
                    </span>
                    <Chip tone="navy">{s.complianceTag}</Chip>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.25rem", lineHeight: 1.4 }}>
                    {s.description}
                  </div>
                </div>
              ),
            },
            {
              key: "category",
              header: "Category",
              width: 120,
              render: (s: ReportSample) => (
                <Chip
                  tone={
                    s.category === "BIPS"
                      ? "blue"
                      : s.category === "BDP"
                      ? "green"
                      : s.category === "KP"
                      ? "red"
                      : s.category === "GAD"
                      ? "gold"
                      : "gray"
                  }
                >
                  {s.category}
                </Chip>
              ),
            },
            {
              key: "recordCount",
              header: "Sample Size",
              align: "right",
              width: 120,
              render: (s: ReportSample) => (
                <span style={{ fontSize: "0.85rem", color: "#475569" }}>
                  {num(s.recordCount)} records
                </span>
              ),
            },
            {
              key: "actions",
              header: "Download",
              align: "right",
              width: 100,
              render: (s: ReportSample) => (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleDownloadCsv(s)}
                  title={`Download ${s.filename}`}
                  style={{ padding: "0.25rem 0.65rem" }}
                >
                  ⬇ CSV
                </Button>
              ),
            },
          ]}
          rows={filteredSamples}
          empty="No sample reports match your search filter."
        />
      </Panel>

      <div style={{ height: 20 }} />

      <Panel title="Quarterly statistical report (DILG NBOO Rollup)">
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
