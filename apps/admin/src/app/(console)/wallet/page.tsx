"use client";

import * as React from "react";
import Link from "next/link";
import { qs, useApi } from "@cbms/api-client";
import {
  Chip,
  DataTable,
  PageHead,
  Pagination,
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
import { Async, Progress } from "../../../components/common";
import { TXN_TYPES } from "../../../lib/labels";
import type { Paged, Wallet, WalletScorecard, WalletTransaction } from "../../../lib/types";

export default function WalletPage() {
  const [type, setType] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 25;

  const score = useApi<WalletScorecard>("/wallet/scorecard");
  const txns = useApi<Paged<WalletTransaction>>(
    `/wallet/transactions${qs({ type, status, page, pageSize })}`,
  );
  const wallets = useApi<Paged<Wallet>>("/wallets?pageSize=1");

  const s = score.data;

  return (
    <>
      <PageHead
        title="Barangay E-Wallet"
        subtitle="Adoption scorecard and the transaction ledger for the barangay e-money rail. Balances are held in centavos; the EMI connection is a mock adapter."
        breadcrumb="Finance"
        exclusive
        actions={
          <Link href="/wallet/batches" className="cbms-btn">
            💸 Disbursement batches
          </Link>
        }
      />

      <StatGrid>
        <StatCard
          label="Registered wallets"
          value={num(s?.registeredWallets)}
          icon="📱"
          hint={`of ${num(s?.adultPopulation)} adults`}
        />
        <StatCard
          label="Registration rate"
          value={`${s?.registrationRate ?? 0}%`}
          icon="📈"
          tone={(s?.registrationRate ?? 0) >= 80 ? "green" : "gold"}
          hint={`Target ${s?.targets.registrationRate ?? "80–90%"}`}
        />
        <StatCard
          label="Active (30 days)"
          value={`${s?.activeRate ?? 0}%`}
          icon="⚡"
          tone={(s?.activeRate ?? 0) >= 50 ? "green" : "gold"}
          hint={`${num(s?.active30d)} wallets · target ${s?.targets.activeRate ?? "50–65%"}`}
        />
        <StatCard
          label="Merchants accepting"
          value={num(s?.merchantsAccepting)}
          icon="🏪"
          hint={`Target ${s?.targets.merchantsAccepting ?? "8–15"} per barangay`}
        />
        <StatCard
          label="Cash-in / out points"
          value={num(s?.cashInOutPoints)}
          icon="🏧"
          hint="Agents with float on hand"
        />
        <StatCard
          label="Cash-out-only ratio"
          value={`${s?.cashOutOnlyRatio ?? 0}%`}
          icon="↩️"
          tone={(s?.cashOutOnlyRatio ?? 0) > 70 ? "red" : "green"}
          hint="Should trend DOWN over time"
        />
      </StatGrid>

      <div className="cbms-grid-2">
        <Panel title="Adoption against target">
          <div className="adm-stack">
            <div>
              <div className="cbms-label">Registration ({s?.registrationRate ?? 0}%)</div>
              <Progress
                value={s?.registrationRate ?? 0}
                tone={(s?.registrationRate ?? 0) >= 80 ? "green" : "gold"}
                label={`Target: ${s?.targets.registrationRate ?? "80–90% of adults"}`}
              />
            </div>
            <div>
              <div className="cbms-label">30-day active rate ({s?.activeRate ?? 0}%)</div>
              <Progress
                value={s?.activeRate ?? 0}
                tone={(s?.activeRate ?? 0) >= 50 ? "green" : "gold"}
                label={`Target: ${s?.targets.activeRate ?? "50–65% of registered"}`}
              />
            </div>
            <div>
              <div className="cbms-label">Cash-out-only ratio ({s?.cashOutOnlyRatio ?? 0}%)</div>
              <Progress
                value={s?.cashOutOnlyRatio ?? 0}
                tone={(s?.cashOutOnlyRatio ?? 0) > 70 ? "red" : "green"}
                label={
                  s?.targets.note ??
                  "Cash-out-only ratio should trend DOWN — it measures money leaving the digital loop immediately."
                }
              />
            </div>
          </div>
        </Panel>

        <Panel title="What this measures">
          <p style={{ fontSize: 13.5, marginTop: 0 }}>
            The e-wallet is the CBMS-exclusive layer: LGUSS-BIMS has no disbursement rail. Success
            is not the number of wallets opened — it is whether money <em>stays</em> in the local
            digital economy.
          </p>
          <ul style={{ fontSize: 13, paddingLeft: 18, lineHeight: 1.8 }}>
            <li>
              <strong>Registration rate</strong> — coverage of the adult population.
            </li>
            <li>
              <strong>Active rate</strong> — wallets that actually transacted in 30 days.
            </li>
            <li>
              <strong>Merchants accepting</strong> — somewhere to spend without cashing out.
            </li>
            <li>
              <strong>Cash-out-only ratio</strong> — share of disbursed value withdrawn immediately.
              A high figure means the rail is only a payout pipe.
            </li>
          </ul>
          <div className="adm-kpi-note">
            Cash-out of government aid is always free — fees never erode ayuda.
          </div>
        </Panel>
      </div>

      <div style={{ height: 16 }} />

      <Panel padded={false}>
        <Toolbar>
          <strong style={{ fontSize: 13.5, color: "var(--cbms-navy)" }}>Transactions</strong>
          <select
            className="cbms-select"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All types</option>
            {TXN_TYPES.map((t) => (
              <option key={t} value={t}>
                {titleize(t)}
              </option>
            ))}
          </select>
          <select
            className="cbms-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            {["pending", "completed", "failed", "reversed"].map((t) => (
              <option key={t} value={t}>
                {titleize(t)}
              </option>
            ))}
          </select>
          <div className="cbms-toolbar__spacer" />
          <span className="adm-muted">
            {num(txns.data?.total)} transaction(s) · {num(wallets.data?.total)} wallet(s) on file
          </span>
        </Toolbar>

        <Async loading={txns.loading} error={txns.error}>
          <DataTable
            columns={[
              {
                key: "reference",
                header: "Reference",
                render: (t) => (
                  <>
                    <div className="cbms-table__primary">{t.reference}</div>
                    <div className="cbms-table__muted">{t.description ?? "—"}</div>
                  </>
                ),
              },
              { key: "type", header: "Type", render: (t) => <StatusChip status={t.type} /> },
              {
                key: "counterparty",
                header: "Counterparty",
                render: (t) =>
                  t.merchant?.businessName ?? t.agent?.outletName ?? (
                    <span className="cbms-table__muted">Barangay treasury</span>
                  ),
              },
              {
                key: "amount",
                header: "Amount",
                align: "right",
                render: (t) => <strong>{peso(t.amountCentavos)}</strong>,
              },
              {
                key: "fee",
                header: "Fee",
                align: "right",
                render: (t) =>
                  t.feeCentavos === "0" ? <Chip tone="green">Free</Chip> : peso(t.feeCentavos),
              },
              { key: "status", header: "Status", render: (t) => <StatusChip status={t.status} /> },
              { key: "createdAt", header: "When", render: (t) => dateTime(t.createdAt) },
            ]}
            rows={txns.data?.items ?? []}
            empty="No transactions match this filter."
          />
        </Async>

        <Pagination page={page} pageSize={pageSize} total={txns.data?.total ?? 0} onPage={setPage} />
      </Panel>
    </>
  );
}
