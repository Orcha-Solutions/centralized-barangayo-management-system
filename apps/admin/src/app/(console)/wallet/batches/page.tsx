"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApi } from "@cbms/api-client";
import {
  DataTable,
  PageHead,
  Panel,
  StatCard,
  StatGrid,
  StatusChip,
  Toolbar,
  dateTime,
  num,
  peso,
  titleize,
} from "@cbms/ui";
import { Async } from "../../../../components/common";
import { useConsole } from "../../../../components/Shell";
import type { Bag, DisbursementBatch } from "../../../../lib/types";

export default function BatchesPage() {
  const router = useRouter();
  const { can } = useConsole();
  const [status, setStatus] = React.useState("all");

  const list = useApi<Bag<DisbursementBatch>>("/wallet/batches");
  const all = list.data?.items ?? [];
  const rows = status === "all" ? all : all.filter((b) => b.status === status);

  const forApproval = all.filter((b) => b.status === "for_approval");
  const completed = all.filter((b) => b.status === "completed");
  const totalDisbursed = completed.reduce((s, b) => s + BigInt(b.totalCentavos || "0"), 0n);

  return (
    <>
      <PageHead
        title="Disbursements"
        subtitle="Payroll, allowances and ayuda paid through the barangay e-wallet. Every batch is maker–checker: whoever prepares it cannot approve it."
        breadcrumb="Finance / E-Wallet"
        exclusive
        actions={
          can("wallet:encode") ? (
            <Link href="/wallet/batches/new" className="cbms-btn cbms-btn--primary">
              + Prepare batch
            </Link>
          ) : undefined
        }
      />

      <StatGrid>
        <StatCard label="Batches" value={num(all.length)} icon="💸" />
        <StatCard
          label="For approval"
          value={num(forApproval.length)}
          icon="✍️"
          tone={forApproval.length ? "gold" : "navy"}
          hint="Waiting for a checker"
        />
        <StatCard label="Completed" value={num(completed.length)} icon="✅" tone="green" />
        <StatCard
          label="Value disbursed"
          value={peso(totalDisbursed.toString())}
          icon="🏦"
          hint="Completed batches"
        />
      </StatGrid>

      <Panel padded={false}>
        <Toolbar>
          <select
            className="cbms-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            {["draft", "for_approval", "approved", "executing", "completed", "failed", "cancelled"].map(
              (s) => (
                <option key={s} value={s}>
                  {titleize(s)}
                </option>
              ),
            )}
          </select>
          <div className="cbms-toolbar__spacer" />
          <span className="adm-muted">{num(rows.length)} batch(es)</span>
        </Toolbar>

        <Async loading={list.loading} error={list.error}>
          <DataTable
            columns={[
              {
                key: "batchNo",
                header: "Batch",
                render: (b) => (
                  <>
                    <div className="cbms-table__primary">{b.batchNo}</div>
                    <div className="cbms-table__muted">{b.title}</div>
                  </>
                ),
              },
              { key: "kind", header: "Kind", render: (b) => <StatusChip status={b.kind} /> },
              { key: "fund", header: "Fund", render: (b) => titleize(b.fund) },
              {
                key: "itemCount",
                header: "Payees",
                align: "right",
                render: (b) => num(b.itemCount || b._count?.items || 0),
              },
              {
                key: "totalCentavos",
                header: "Total",
                align: "right",
                render: (b) => <strong>{peso(b.totalCentavos)}</strong>,
              },
              { key: "status", header: "Status", render: (b) => <StatusChip status={b.status} /> },
              { key: "createdAt", header: "Prepared", render: (b) => dateTime(b.createdAt) },
              {
                key: "executedAt",
                header: "Executed",
                render: (b) => (b.executedAt ? dateTime(b.executedAt) : "—"),
              },
            ]}
            rows={rows}
            empty="No disbursement batches yet."
            onRowClick={(b) => router.push(`/wallet/batches/${b.id}`)}
          />
        </Async>
      </Panel>
    </>
  );
}
