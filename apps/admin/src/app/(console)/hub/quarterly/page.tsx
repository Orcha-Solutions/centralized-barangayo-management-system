"use client";

import * as React from "react";
import { useApi } from "@cbms/api-client";
import {
  Alert,
  Button,
  KeyValue,
  Loading,
  PageHead,
  Panel,
  StatCard,
  StatGrid,
  num,
  peso,
} from "@cbms/ui";
import type { QuarterlyReport } from "@/lib/hubTypes";

/** "123456" (centavos) -> "1234.56" — plain decimal for spreadsheets. */
function centavosToDecimal(centavos: string): string {
  const c = BigInt(centavos || "0");
  const neg = c < 0n;
  const abs = neg ? -c : c;
  return `${neg ? "-" : ""}${abs / 100n}.${(abs % 100n).toString().padStart(2, "0")}`;
}

function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function buildCsv(r: QuarterlyReport): string {
  const rows: Array<[string, string | number]> = [
    ["Period", r.period],
    ["Barangays covered", r.barangaysCovered],
    ["Registered inhabitants", r.registeredInhabitants],
    ["Certificates issued", r.certificatesIssued],
    ["KP cases filed", r.kpCasesFiled],
    ["Concerns received", r.concernsReceived],
    ["Disbursement count", r.disbursementCount],
    ["Disbursement total (PHP)", centavosToDecimal(r.disbursementTotalCentavos)],
    ["CSM responses", r.csmResponses],
    ["CSM average rating", r.csmAverage],
    ["Note", r.note],
    ["Generated at", new Date().toISOString()],
  ];
  return [
    ["Indicator", "Value"].map(csvCell).join(","),
    ...rows.map(([k, v]) => [csvCell(k), csvCell(v)].join(",")),
  ].join("\r\n");
}

export default function HubQuarterlyPage() {
  const { data, error, loading } = useApi<QuarterlyReport>("/reports/quarterly");

  const download = React.useCallback(() => {
    if (!data) return;
    // Prepend a BOM so Excel opens the file as UTF-8.
    const blob = new Blob([`\uFEFF${buildCsv(data)}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cbms-quarterly-${data.period}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data]);

  if (loading) return <Loading label="Compiling quarterly report…" />;

  if (error) {
    return (
      <>
        <PageHead title="Quarterly report" />
        <Alert tone="danger">
          Could not load <code>/reports/quarterly</code> — {error.message}
        </Alert>
      </>
    );
  }

  if (!data) return <Alert tone="warn">No report data available.</Alert>;

  return (
    <>
      <PageHead
        title="Quarterly report"
        breadcrumb="Hub / Reports"
        subtitle={`Statistical roll-up for ${data.period}, covering ${num(
          data.barangaysCovered,
        )} barangays.`}
        actions={
          <Button variant="primary" onClick={download}>
            Download CSV
          </Button>
        }
      />

      <div style={{ marginBottom: 16 }}>
        <Alert tone="info">
          {data.note} Figures are aggregate counts only — no personally identifiable
          information is included in this report or its CSV export.
        </Alert>
      </div>

      <StatGrid>
        <StatCard label="Barangays covered" value={num(data.barangaysCovered)} icon="🏘" />
        <StatCard
          label="Registered inhabitants"
          value={num(data.registeredInhabitants)}
          icon="👥"
        />
        <StatCard
          label="Certificates issued"
          value={num(data.certificatesIssued)}
          icon="🧾"
          tone="gold"
        />
        <StatCard label="KP cases filed" value={num(data.kpCasesFiled)} icon="⚖" />
        <StatCard label="Concerns received" value={num(data.concernsReceived)} icon="📣" />
        <StatCard
          label="CSM average rating"
          value={data.csmAverage > 0 ? `${data.csmAverage.toFixed(2)} ★` : "—"}
          hint={`${num(data.csmResponses)} responses`}
          icon="★"
          tone="green"
        />
      </StatGrid>

      <div className="cbms-grid-2" style={{ marginTop: 18 }}>
        <Panel title={`Report card — ${data.period}`}>
          <KeyValue
            items={[
              ["Reporting period", data.period],
              ["Barangays covered", num(data.barangaysCovered)],
              ["Registered inhabitants (RBI)", num(data.registeredInhabitants)],
              ["Certificates issued", num(data.certificatesIssued)],
              ["KP cases filed", num(data.kpCasesFiled)],
              ["Concerns received", num(data.concernsReceived)],
              ["Disbursement batches paid", num(data.disbursementCount)],
              [
                "Disbursement total",
                <strong key="disb">{peso(data.disbursementTotalCentavos)}</strong>,
              ],
              ["CSM responses", num(data.csmResponses)],
              [
                "CSM average rating",
                data.csmAverage > 0 ? `${data.csmAverage.toFixed(2)} / 5.00` : "No responses",
              ],
            ]}
          />
        </Panel>

        <Panel title="Reporting basis">
          <div style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--cbms-ink)" }}>
            <p style={{ marginTop: 0 }}>
              This roll-up is aligned to the reporting cadence of the DILG{" "}
              <strong>National Barangay Operations Office (NBOO)</strong>. It is generated from
              CBMS operational data and is intended to <em>support</em> — never replace — the
              statutory returns a barangay files through the DILG LGUSS-BIMS.
            </p>
            <p>
              The period runs from the first day of the current calendar quarter to today.
              Inhabitant counts are point-in-time; all other figures are counts of records
              created within the period.
            </p>
            <p style={{ marginBottom: 0, color: "var(--cbms-muted)", fontSize: 12.5 }}>
              Export the CSV for onward submission or for consolidation with other cities. The
              file is built in your browser — the data never leaves this session.
            </p>
          </div>
        </Panel>
      </div>
    </>
  );
}
