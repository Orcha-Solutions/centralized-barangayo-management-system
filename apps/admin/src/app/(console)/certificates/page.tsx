"use client";

import * as React from "react";
import Link from "next/link";
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
  StatusChip,
  Toolbar,
  date,
  fullName,
  num,
  pesoAmount,
  titleize,
} from "@cbms/ui";
import { Async, SourceChip } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import { CERT_STATUSES } from "../../../lib/labels";
import type { CertificateRequest, CertificateStats, Paged } from "../../../lib/types";

export default function CertificatesPage() {
  const router = useRouter();
  const { can } = useConsole();
  const [q, setQ] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 25;

  React.useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("status");
    if (s) setStatus(s);
  }, []);

  const stats = useApi<CertificateStats>("/certificates/stats");
  const list = useApi<Paged<CertificateRequest>>(
    `/certificates${qs({ q: search, status, page, pageSize })}`,
  );

  const s = stats.data;

  return (
    <>
      <PageHead
        title="Certificates & clearances"
        subtitle="Issuance management — intake, fee collection, approval by a human signatory, and release with a public verification code."
        breadcrumb="Services"
        parity="BCIS"
        actions={
          can("issuance:encode") ? (
            <Link href="/certificates/new" className="cbms-btn cbms-btn--primary">
              + New request
            </Link>
          ) : undefined
        }
      />

      <StatGrid>
        <StatCard label="Total requests" value={num(s?.total)} icon="📄" />
        <StatCard
          label="For approval"
          value={num(s?.pendingApproval)}
          icon="✍️"
          tone={s?.pendingApproval ? "red" : "navy"}
          hint="A human always signs"
        />
        <StatCard label="Awaiting payment" value={num(s?.awaitingPayment)} icon="💳" tone="gold" />
        <StatCard label="Released" value={num(s?.released)} icon="✅" tone="green" />
        <StatCard
          label="Median processing"
          value={`${s?.medianProcessingHours ?? 0} h`}
          icon="⏱️"
          hint="Released in the last 30 days"
        />
        <StatCard
          label="RA 11032"
          value={
            s ? (
              <Chip tone={s.ra11032Compliant ? "green" : "red"}>
                {s.ra11032Compliant ? "Compliant" : "Breaching"}
              </Chip>
            ) : (
              "—"
            )
          }
          icon="⚖️"
          tone={s?.ra11032Compliant ? "green" : "red"}
          hint="Simple transactions ≤ 3 working days"
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
              placeholder="Search reference, purpose or surname…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Button type="submit">Search</Button>
          </form>
          <select
            className="cbms-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            {CERT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {titleize(st)}
              </option>
            ))}
          </select>
          <div className="cbms-toolbar__spacer" />
          <span className="adm-muted">{num(list.data?.total)} request(s)</span>
        </Toolbar>

        <Async loading={list.loading} error={list.error}>
          <DataTable
            columns={[
              {
                key: "referenceNo",
                header: "Reference",
                render: (r) => (
                  <>
                    <div className="cbms-table__primary">{r.referenceNo}</div>
                    <div className="cbms-table__muted">{date(r.createdAt)}</div>
                  </>
                ),
              },
              { key: "type", header: "Certificate", render: (r) => r.type?.name ?? "—" },
              {
                key: "resident",
                header: "Resident",
                render: (r) => (r.inhabitant ? fullName(r.inhabitant) : "—"),
              },
              { key: "purpose", header: "Purpose" },
              {
                key: "fee",
                header: "Fee",
                align: "right",
                render: (r) => (Number(r.fee) === 0 ? "Free" : pesoAmount(r.fee)),
              },
              { key: "status", header: "Status", render: (r) => <StatusChip status={r.status} /> },
              { key: "source", header: "Source", render: (r) => <SourceChip source={r.source} /> },
            ]}
            rows={list.data?.items ?? []}
            empty="No certificate requests match this filter."
            onRowClick={(r) => router.push(`/certificates/${r.id}`)}
          />
        </Async>

        <Pagination page={page} pageSize={pageSize} total={list.data?.total ?? 0} onPage={setPage} />
      </Panel>
    </>
  );
}
