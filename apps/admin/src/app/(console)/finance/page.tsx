"use client";

import * as React from "react";
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
  date,
  dateTime,
  num,
  pesoAmount,
  titleize,
} from "@cbms/ui";
import { Async, EmptyNote, Progress, Tabs } from "../../../components/common";
import { downloadCsv } from "../../../lib/download";
import { FUNDS } from "../../../lib/labels";
import type { Budget, LedgerEntry, OfficialReceipt, Paged } from "../../../lib/types";

type Tab = "ledger" | "receipts" | "budget";

export default function FinancePage() {
  const [tab, setTab] = React.useState<Tab>("ledger");

  const [fund, setFund] = React.useState("all");
  const [direction, setDirection] = React.useState("all");
  const [q, setQ] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 25;

  const ledger = useApi<Paged<LedgerEntry>>(
    `/finance/ledger${qs({ fund, direction, q: search, page, pageSize })}`,
  );
  const receipts = useApi<Paged<OfficialReceipt>>("/finance/receipts?pageSize=50");
  const budgets = useApi<Paged<Budget>>("/finance/budgets?pageSize=20");

  const [budgetId, setBudgetId] = React.useState<string>("");
  const chosenId = budgetId || budgets.data?.items?.[0]?.id || "";
  const budget = useApi<Budget>(chosenId ? `/finance/budgets/${chosenId}` : null, [chosenId]);

  const rows = ledger.data?.items ?? [];
  const credits = rows.filter((r) => r.direction === "credit").reduce((s, r) => s + Number(r.amount), 0);
  const debits = rows.filter((r) => r.direction === "debit").reduce((s, r) => s + Number(r.amount), 0);
  const receiptTotal = (receipts.data?.items ?? []).reduce((s, r) => s + Number(r.amount), 0);

  const lines = budget.data?.lines ?? [];
  const lineTotal = lines.reduce((s, l) => s + Number(l.amount), 0);
  const obligated = lines.reduce((s, l) => s + Number(l.obligated), 0);
  const disbursed = lines.reduce((s, l) => s + Number(l.disbursed), 0);

  function exportLedger() {
    downloadCsv(
      "ledger.csv",
      ["POSTED_AT", "FUND", "ACCOUNT_CODE", "DESCRIPTION", "DIRECTION", "AMOUNT", "OR", "DV"],
      rows.map((r) => [
        new Date(r.postedAt).toISOString().slice(0, 10),
        r.fund,
        r.accountCode,
        r.description,
        r.direction,
        r.amount,
        r.orNumber ?? "",
        r.dvNumber ?? "",
      ]),
    );
  }

  return (
    <>
      <PageHead
        title="Treasury & Ledger"
        subtitle="Barangay financial management: a double-entry ledger, official receipts and the annual appropriation with utilisation tracking."
        breadcrumb="Finance"
        parity="BFMS"
        actions={
          tab === "ledger" ? <Button onClick={exportLedger}>⬇ Export page (CSV)</Button> : undefined
        }
      />

      <StatGrid>
        <StatCard
          label="Credits (this page)"
          value={pesoAmount(credits)}
          icon="⬆️"
          tone="green"
          hint="Collections"
        />
        <StatCard
          label="Debits (this page)"
          value={pesoAmount(debits)}
          icon="⬇️"
          tone="red"
          hint="Disbursements"
        />
        <StatCard
          label="Official receipts"
          value={pesoAmount(receiptTotal)}
          icon="🧾"
          hint={`${num(receipts.data?.total)} OR(s) on file`}
        />
        <StatCard
          label="Appropriation"
          value={pesoAmount(budget.data?.totalAmount ?? 0)}
          icon="📘"
          hint={budget.data ? `FY ${budget.data.year}` : "—"}
        />
      </StatGrid>

      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "ledger", label: "General ledger" },
          { value: "receipts", label: "Official receipts" },
          { value: "budget", label: "Budget & utilisation" },
        ]}
      />

      {tab === "ledger" && (
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
                placeholder="Search description, account, OR/DV…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Button type="submit">Search</Button>
            </form>
            <select
              className="cbms-select"
              value={fund}
              onChange={(e) => {
                setFund(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All funds</option>
              {FUNDS.map((f) => (
                <option key={f} value={f}>
                  {f.toUpperCase()}
                </option>
              ))}
            </select>
            <select
              className="cbms-select"
              value={direction}
              onChange={(e) => {
                setDirection(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">Debit & credit</option>
              <option value="debit">Debit</option>
              <option value="credit">Credit</option>
            </select>
            <div className="cbms-toolbar__spacer" />
            <span className="adm-muted">{num(ledger.data?.total)} entries</span>
          </Toolbar>

          <Async loading={ledger.loading} error={ledger.error}>
            <DataTable
              columns={[
                { key: "postedAt", header: "Posted", render: (r) => date(r.postedAt) },
                { key: "fund", header: "Fund", render: (r) => <Chip tone="navy">{r.fund.toUpperCase()}</Chip> },
                { key: "accountCode", header: "Account" },
                { key: "description", header: "Description" },
                {
                  key: "direction",
                  header: "Dr/Cr",
                  render: (r) => (
                    <Chip tone={r.direction === "credit" ? "green" : "red"}>
                      {titleize(r.direction)}
                    </Chip>
                  ),
                },
                {
                  key: "amount",
                  header: "Amount",
                  align: "right",
                  render: (r) => <strong>{pesoAmount(r.amount)}</strong>,
                },
                {
                  key: "ref",
                  header: "Reference",
                  render: (r) => r.orNumber ?? r.dvNumber ?? "—",
                },
              ]}
              rows={rows}
              empty="No ledger entries match this filter."
            />
          </Async>

          <Pagination page={page} pageSize={pageSize} total={ledger.data?.total ?? 0} onPage={setPage} />
        </Panel>
      )}

      {tab === "receipts" && (
        <Panel padded={false}>
          <Async loading={receipts.loading} error={receipts.error}>
            <DataTable
              columns={[
                { key: "orNumber", header: "OR number" },
                { key: "payorName", header: "Payor" },
                { key: "particulars", header: "Particulars" },
                {
                  key: "amount",
                  header: "Amount",
                  align: "right",
                  render: (r) => <strong>{pesoAmount(r.amount)}</strong>,
                },
                { key: "issuedAt", header: "Issued", render: (r) => dateTime(r.issuedAt) },
              ]}
              rows={receipts.data?.items ?? []}
              empty="No official receipts issued."
            />
          </Async>
        </Panel>
      )}

      {tab === "budget" && (
        <Panel
          title="Annual appropriation"
          actions={
            <select
              className="cbms-select"
              value={chosenId}
              onChange={(e) => setBudgetId(e.target.value)}
            >
              {(budgets.data?.items ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  FY {b.year} · {titleize(b.status)}
                </option>
              ))}
            </select>
          }
        >
          <Async loading={budget.loading || budgets.loading} error={budget.error ?? budgets.error}>
            {!budget.data ? (
              <EmptyNote>No budget on file.</EmptyNote>
            ) : (
              <>
                <div className="cbms-grid-3" style={{ marginBottom: 18 }}>
                  <div>
                    <div className="cbms-label">Total appropriation</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "var(--cbms-navy)" }}>
                      {pesoAmount(budget.data.totalAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="cbms-label">SK fund (10%)</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "var(--cbms-navy)" }}>
                      {pesoAmount(budget.data.skFundAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="cbms-label">Status</div>
                    <Chip tone={budget.data.status === "enacted" ? "green" : "gold"}>
                      {titleize(budget.data.status)}
                    </Chip>
                  </div>
                </div>

                <div className="cbms-grid-2" style={{ marginBottom: 18 }}>
                  <div>
                    <div className="cbms-label">
                      Obligated — {pesoAmount(obligated)} of {pesoAmount(lineTotal)}
                    </div>
                    <Progress
                      value={lineTotal ? (obligated / lineTotal) * 100 : 0}
                      tone="gold"
                      label={`${lineTotal ? Math.round((obligated / lineTotal) * 100) : 0}% obligated`}
                    />
                  </div>
                  <div>
                    <div className="cbms-label">
                      Disbursed — {pesoAmount(disbursed)} of {pesoAmount(lineTotal)}
                    </div>
                    <Progress
                      value={lineTotal ? (disbursed / lineTotal) * 100 : 0}
                      tone="green"
                      label={`${lineTotal ? Math.round((disbursed / lineTotal) * 100) : 0}% disbursed`}
                    />
                  </div>
                </div>

                <DataTable
                  columns={[
                    {
                      key: "expenseClass",
                      header: "Class",
                      render: (l) => <Chip tone="navy">{l.expenseClass}</Chip>,
                    },
                    { key: "accountCode", header: "Account" },
                    { key: "description", header: "Description" },
                    {
                      key: "amount",
                      header: "Appropriated",
                      align: "right",
                      render: (l) => pesoAmount(l.amount),
                    },
                    {
                      key: "obligated",
                      header: "Obligated",
                      align: "right",
                      render: (l) => pesoAmount(l.obligated),
                    },
                    {
                      key: "disbursed",
                      header: "Disbursed",
                      align: "right",
                      render: (l) => pesoAmount(l.disbursed),
                    },
                    {
                      key: "util",
                      header: "Utilisation",
                      width: 190,
                      render: (l) => (
                        <Progress
                          value={Number(l.amount) ? (Number(l.disbursed) / Number(l.amount)) * 100 : 0}
                          tone={
                            Number(l.amount) && Number(l.disbursed) / Number(l.amount) > 0.9
                              ? "red"
                              : "navy"
                          }
                          label={`${
                            Number(l.amount)
                              ? Math.round((Number(l.disbursed) / Number(l.amount)) * 100)
                              : 0
                          }%`}
                        />
                      ),
                    },
                  ]}
                  rows={lines}
                  empty="No budget lines recorded."
                />
              </>
            )}
          </Async>
        </Panel>
      )}
    </>
  );
}
