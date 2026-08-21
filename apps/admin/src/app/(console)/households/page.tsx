"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { qs, useApi } from "@cbms/api-client";
import {
  Button,
  Chip,
  DataTable,
  PageHead,
  Pagination,
  Panel,
  StatCard,
  StatGrid,
  Toolbar,
  num,
  titleize,
} from "@cbms/ui";
import { Async, SourceChip } from "../../../components/common";
import type { Household, Paged } from "../../../lib/types";

export default function HouseholdsPage() {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [purok, setPurok] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 25;

  const list = useApi<Paged<Household>>(`/households${qs({ q: search, purok, page, pageSize })}`);
  const all = useApi<Paged<Household>>("/households?pageSize=200");

  const puroks = React.useMemo(() => {
    const set = new Set<string>();
    for (const h of all.data?.items ?? []) if (h.purok) set.add(h.purok);
    return Array.from(set).sort();
  }, [all.data]);

  const withConsent = (all.data?.items ?? []).filter((h) => (h.consents?.length ?? 0) > 0).length;
  const withDisbursement = (all.data?.items ?? []).filter((h) =>
    (h.consents ?? []).some((c) => c.purpose === "DISBURSEMENT"),
  ).length;

  return (
    <>
      <PageHead
        title="Households"
        subtitle="Household folders and their standing data-privacy consents (RA 10173)."
        breadcrumb="Residents"
        parity="BIPS"
      />

      <StatGrid>
        <StatCard label="Households (sampled)" value={num(all.data?.total)} icon="🏠" />
        <StatCard label="Puroks" value={num(puroks.length)} icon="📍" />
        <StatCard
          label="With any consent"
          value={num(withConsent)}
          icon="✍️"
          tone="green"
          hint="At least one granted purpose"
        />
        <StatCard
          label="Disbursement consent"
          value={num(withDisbursement)}
          icon="💸"
          tone="gold"
          hint="Eligible for ayuda batches"
        />
      </StatGrid>

      <Panel padded={false}>
        <Toolbar>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setSearch(q.trim());
            }}
            style={{ display: "flex", gap: 8 }}
          >
            <input
              className="cbms-input cbms-input--search"
              placeholder="Search household no. or address…"
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
          <div className="cbms-toolbar__spacer" />
          <span className="adm-muted">{num(list.data?.total)} household(s)</span>
        </Toolbar>

        <Async loading={list.loading} error={list.error}>
          <DataTable
            columns={[
              {
                key: "householdNo",
                header: "Household",
                render: (h) => (
                  <>
                    <div className="cbms-table__primary">{h.householdNo}</div>
                    <div className="cbms-table__muted">{h.addressLine}</div>
                  </>
                ),
              },
              { key: "purok", header: "Purok", render: (h) => h.purok ?? "—" },
              {
                key: "members",
                header: "Members",
                align: "right",
                render: (h) => num(h._count?.members ?? h.members?.length ?? 0),
              },
              {
                key: "income",
                header: "Income band",
                render: (h) => h.monthlyIncomeBand ?? "—",
              },
              {
                key: "consents",
                header: "Consents",
                render: (h) =>
                  (h.consents?.length ?? 0) === 0 ? (
                    <Chip tone="red">None on file</Chip>
                  ) : (
                    <span className="adm-chiprow">
                      {(h.consents ?? []).map((c, i) => (
                        <Chip key={`${c.purpose}-${i}`} tone="green">
                          {titleize(c.purpose)}
                        </Chip>
                      ))}
                    </span>
                  ),
              },
              { key: "source", header: "Source", render: (h) => <SourceChip source={h.source} /> },
            ]}
            rows={list.data?.items ?? []}
            empty="No households match this filter."
            onRowClick={(h) => router.push(`/households/${h.id}`)}
          />
        </Async>

        <Pagination page={page} pageSize={pageSize} total={list.data?.total ?? 0} onPage={setPage} />
      </Panel>
    </>
  );
}
