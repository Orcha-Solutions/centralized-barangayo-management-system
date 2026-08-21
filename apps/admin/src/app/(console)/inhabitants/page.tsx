"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { qs, useApi } from "@cbms/api-client";
import {
  Alert,
  Button,
  DataTable,
  PageHead,
  Pagination,
  Panel,
  StatCard,
  StatGrid,
  Toolbar,
  age,
  fullName,
  num,
} from "@cbms/ui";
import { Async, SectorChips, SourceChip } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import { downloadFromApi } from "../../../lib/download";
import { SECTORS } from "../../../lib/labels";
import type { Household, Inhabitant, Paged } from "../../../lib/types";

interface InhabitantStats {
  total: number;
  households: number;
  seniors: number;
  pwd: number;
  fourPs: number;
  soloParent: number;
  voters: number;
}

export default function InhabitantsPage() {
  const router = useRouter();
  const { can } = useConsole();
  const [q, setQ] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [purok, setPurok] = React.useState("all");
  const [sector, setSector] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [exporting, setExporting] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);

  const pageSize = 25;
  const stats = useApi<InhabitantStats>("/inhabitants/stats");
  const list = useApi<Paged<Inhabitant>>(
    `/inhabitants${qs({ q: search, purok, sector, page, pageSize })}`,
  );
  const households = useApi<Paged<Household>>("/households?pageSize=200");

  const puroks = React.useMemo(() => {
    const set = new Set<string>();
    for (const h of households.data?.items ?? []) if (h.purok) set.add(h.purok);
    return Array.from(set).sort();
  }, [households.data]);

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(q.trim());
  }

  async function exportRbi() {
    setExporting(true);
    setExportError(null);
    try {
      await downloadFromApi("/inhabitants/export/rbi", "rbi-export.csv");
    } catch (err) {
      setExportError((err as Error).message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <PageHead
        title="Inhabitants"
        subtitle="Record of Barangay Inhabitants (RBI). Records sourced from LGUSS-BIMS are marked BIMS and remain under DILG custody."
        breadcrumb="Residents"
        parity="BIPS"
        actions={
          <>
            <Button onClick={exportRbi} disabled={exporting}>
              {exporting ? "Exporting…" : "⬇ Export RBI (CSV)"}
            </Button>
            {can("inhabitants:encode") && (
              <Link href="/inhabitants/new" className="cbms-btn cbms-btn--primary">
                + New inhabitant
              </Link>
            )}
          </>
        }
      />

      {exportError && <Alert tone="danger">{exportError}</Alert>}

      <StatGrid>
        <StatCard label="Total inhabitants" value={num(stats.data?.total)} icon="👥" />
        <StatCard label="Households" value={num(stats.data?.households)} icon="🏠" />
        <StatCard label="Senior citizens" value={num(stats.data?.seniors)} icon="🧓" tone="gold" />
        <StatCard label="PWD" value={num(stats.data?.pwd)} icon="♿" tone="green" />
        <StatCard label="4Ps beneficiaries" value={num(stats.data?.fourPs)} icon="🤝" />
        <StatCard label="Registered voters" value={num(stats.data?.voters)} icon="🗳️" />
      </StatGrid>

      <Panel padded={false}>
        <Toolbar>
          <form onSubmit={applySearch} style={{ display: "flex", gap: 8 }}>
            <input
              className="cbms-input cbms-input--search"
              placeholder="Search name or PhilSys number…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Button type="submit">Search</Button>
          </form>
          <select
            className="cbms-select"
            value={purok}
            onChange={(e) => {
              setPurok(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All puroks</option>
            {puroks.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            className="cbms-select"
            value={sector}
            onChange={(e) => {
              setSector(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All sectors</option>
            {SECTORS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <div className="cbms-toolbar__spacer" />
          <span className="adm-muted">{num(list.data?.total)} record(s)</span>
        </Toolbar>

        <Async loading={list.loading} error={list.error}>
          <DataTable
            columns={[
              {
                key: "name",
                header: "Name",
                render: (r) => (
                  <>
                    <div className="cbms-table__primary">{fullName(r)}</div>
                    <div className="cbms-table__muted">
                      {r.philsysNo ? `PCN ${r.philsysNo}` : "No PhilSys on file"}
                    </div>
                  </>
                ),
              },
              {
                key: "age",
                header: "Age / Sex",
                render: (r) => `${age(r.birthDate) ?? "—"} · ${r.sex === "male" ? "M" : "F"}`,
              },
              {
                key: "purok",
                header: "Purok",
                render: (r) => r.household?.purok ?? "—",
              },
              {
                key: "household",
                header: "Household",
                render: (r) =>
                  r.household ? (
                    <>
                      <div>{r.household.householdNo}</div>
                      <div className="cbms-table__muted">{r.household.addressLine ?? ""}</div>
                    </>
                  ) : (
                    <span className="cbms-table__muted">Unassigned</span>
                  ),
              },
              { key: "sectors", header: "Sectoral", render: (r) => <SectorChips row={r} /> },
              { key: "source", header: "Source", render: (r) => <SourceChip source={r.source} /> },
            ]}
            rows={list.data?.items ?? []}
            empty="No inhabitants match this filter."
            onRowClick={(r) => router.push(`/inhabitants/${r.id}`)}
          />
        </Async>

        <Pagination
          page={page}
          pageSize={pageSize}
          total={list.data?.total ?? 0}
          onPage={setPage}
        />
      </Panel>
    </>
  );
}
