"use client";

import * as React from "react";
import Link from "next/link";
import { useApi } from "@cbms/api-client";
import {
  Alert,
  Chip,
  Loading,
  PageHead,
  Panel,
  StatusChip,
  num,
  peso,
  titleize,
} from "@cbms/ui";
import { rateTone, type ScorecardRow, type HubScorecard } from "@/lib/hubTypes";

type SortKey = keyof ScorecardRow;
type SortDir = "asc" | "desc";

interface ColumnDef {
  key: SortKey;
  header: string;
  align?: "left" | "right" | "center";
  /** Sorted as a BigInt-valued string rather than a number. */
  bigint?: boolean;
  render: (row: ScorecardRow) => React.ReactNode;
}

const COLUMNS: ColumnDef[] = [
  {
    key: "name",
    header: "Barangay",
    render: (r) => (
      <span>
        <span className="cbms-table__primary">{r.name}</span>
        <span className="cbms-table__muted" style={{ display: "block", fontSize: 11 }}>
          PSGC {r.psgcCode}
        </span>
      </span>
    ),
  },
  { key: "status", header: "Status", render: (r) => <StatusChip status={r.status} /> },
  {
    key: "mode",
    header: "Mode",
    render: (r) => (
      <Chip tone={r.mode === "companion" ? "blue" : "navy"}>{titleize(r.mode)}</Chip>
    ),
  },
  { key: "population", header: "Population", align: "right", render: (r) => num(r.population) },
  {
    key: "registeredWallets",
    header: "Registered",
    align: "right",
    render: (r) => num(r.registeredWallets),
  },
  {
    key: "registrationRate",
    header: "Registration %",
    align: "right",
    render: (r) => (
      <Chip tone={rateTone(r.registrationRate)}>{r.registrationRate.toFixed(1)}%</Chip>
    ),
  },
  { key: "merchants", header: "Merchants", align: "right", render: (r) => num(r.merchants) },
  { key: "cashPoints", header: "Cash points", align: "right", render: (r) => num(r.cashPoints) },
  {
    key: "transactions30d",
    header: "Txns 30d",
    align: "right",
    render: (r) => num(r.transactions30d),
  },
  {
    key: "volume30dCentavos",
    header: "Volume 30d",
    align: "right",
    bigint: true,
    render: (r) => peso(r.volume30dCentavos),
  },
  {
    key: "certificates",
    header: "Certificates",
    align: "right",
    render: (r) => num(r.certificates),
  },
  {
    key: "satisfaction",
    header: "Satisfaction",
    align: "right",
    render: (r) =>
      r.satisfaction > 0 ? (
        <span>
          {r.satisfaction.toFixed(2)} <span style={{ color: "var(--cbms-gold)" }}>★</span>
        </span>
      ) : (
        <span className="cbms-table__muted">—</span>
      ),
  },
];

function compare(a: ScorecardRow, b: ScorecardRow, col: ColumnDef): number {
  if (col.bigint) {
    const av = BigInt((a[col.key] as string) || "0");
    const bv = BigInt((b[col.key] as string) || "0");
    return av < bv ? -1 : av > bv ? 1 : 0;
  }
  const av = a[col.key];
  const bv = b[col.key];
  if (typeof av === "number" && typeof bv === "number") return av - bv;
  return String(av ?? "").localeCompare(String(bv ?? ""), "en");
}

export default function HubScorecardPage() {
  const { data, error, loading } = useApi<HubScorecard>("/hub/scorecard");
  const [sortKey, setSortKey] = React.useState<SortKey>("registrationRate");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  const rows = React.useMemo(() => {
    if (!data?.rows) return [];
    const col = COLUMNS.find((c) => c.key === sortKey);
    if (!col) return data.rows;
    const sorted = [...data.rows].sort((a, b) => compare(a, b, col));
    return sortDir === "desc" ? sorted.reverse() : sorted;
  }, [data, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" || key === "status" || key === "mode" ? "asc" : "desc");
    }
  }

  if (loading) return <Loading label="Loading adoption scorecard…" />;

  if (error) {
    return (
      <>
        <PageHead title="Adoption scorecard" exclusive />
        <Alert tone="danger">
          Could not load <code>/hub/scorecard</code> — {error.message}
        </Alert>
      </>
    );
  }

  if (!data) return <Alert tone="warn">No scorecard data available.</Alert>;

  const targets = data.targets || {
    registrationRate: "≥ 80%",
    activeRate: "≥ 50%",
    merchants: "25 per barangay",
    cashPointCoverage: "100%",
  };

  return (
    <>
      <PageHead
        title="Adoption scorecard"
        breadcrumb="Hub / Scorecard"
        subtitle={`E-wallet and service-delivery adoption across ${num(
          data.barangayCount || 0,
        )} barangays. Click any column heading to sort.`}
        exclusive
        actions={
          <Link href="/hub/quarterly" className="cbms-btn">
            Quarterly report
          </Link>
        }
      />

      <div style={{ marginBottom: 16 }}>
        <Alert tone="info">
          <strong>Programme targets</strong> — registration {targets.registrationRate} ·
          active users {targets.activeRate} · merchants {targets.merchants} · cash-in/out
          coverage {targets.cashPointCoverage}. Registration % is shaded{" "}
          <Chip tone="green">green ≥ 80</Chip> <Chip tone="gold">gold 50–79</Chip>{" "}
          <Chip tone="red">red &lt; 50</Chip>.
        </Alert>
      </div>

      <Panel padded={false}>
        <div className="cbms-table-wrap">
          <table className="cbms-table">
            <thead>
              <tr>
                {COLUMNS.map((c) => {
                  const active = c.key === sortKey;
                  return (
                    <th
                      key={c.key}
                      onClick={() => toggleSort(c.key)}
                      aria-sort={
                        active ? (sortDir === "asc" ? "ascending" : "descending") : "none"
                      }
                      title={`Sort by ${c.header}`}
                      style={{
                        textAlign: c.align ?? "left",
                        cursor: "pointer",
                        userSelect: "none",
                        whiteSpace: "nowrap",
                        color: active ? "var(--cbms-navy)" : undefined,
                      }}
                    >
                      {c.header}
                      <span
                        aria-hidden="true"
                        style={{
                          marginLeft: 5,
                          opacity: active ? 1 : 0.25,
                          fontSize: 10,
                        }}
                      >
                        {active ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="cbms-table__empty" colSpan={COLUMNS.length}>
                    No barangays onboarded yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.barangayId}>
                    {COLUMNS.map((c) => (
                      <td key={c.key} style={{ textAlign: c.align ?? "left" }}>
                        {c.render(r)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <p style={{ fontSize: 11.5, color: "var(--cbms-muted)", marginTop: 12, maxWidth: "80ch" }}>
        Registration % is measured against an adult-population proxy (65% of recorded
        inhabitants), consistent with the API&apos;s scorecard calculation. Volume covers
        completed wallet transactions in the trailing 30 days.
      </p>
    </>
  );
}
