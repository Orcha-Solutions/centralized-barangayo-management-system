"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { post, qs, useApi } from "@cbms/api-client";
import {
  Alert,
  Button,
  Chip,
  DataTable,
  Field,
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
import { FinanceTourGuide, FinanceGuideToggle } from "./FinanceTourGuide";

type Tab = "ledger" | "receipts" | "budget";

interface ExtendedReceipt extends OfficialReceipt {
  status?: string;
  cancellationReason?: string;
  cancelledAt?: string;
}

export default function FinancePage() {
  const router = useRouter();
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
  const receipts = useApi<Paged<ExtendedReceipt>>("/finance/receipts?pageSize=50");
  const budgets = useApi<Paged<Budget>>("/finance/budgets?pageSize=20");

  const [budgetId, setBudgetId] = React.useState<string>("");
  const chosenId = budgetId || budgets.data?.items?.[0]?.id || "";
  const budget = useApi<Budget>(chosenId ? `/finance/budgets/${chosenId}` : null, [chosenId]);

  // Content Drawers State
  const [selectedLedgerEntry, setSelectedLedgerEntry] = React.useState<LedgerEntry | null>(null);
  const [recordDrawerOpen, setRecordDrawerOpen] = React.useState(false);

  const [selectedReceipt, setSelectedReceipt] = React.useState<ExtendedReceipt | null>(null);
  const [receiptDrawerOpen, setReceiptDrawerOpen] = React.useState(false);

  // Tour Guide State
  const [tourEnabled, setTourEnabled] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("cbms.finance_guide_enabled");
      if (stored === null) {
        setTourEnabled(true);
      } else {
        setTourEnabled(stored === "true");
      }
    } catch {
      setTourEnabled(true);
    }
  }, []);

  const handleToggleTour = (next: boolean) => {
    setTourEnabled(next);
    try {
      localStorage.setItem("cbms.finance_guide_enabled", String(next));
    } catch {
      // ignore
    }
  };

  // Form inputs for recording ledger entry
  const [newFund, setNewFund] = React.useState("general");
  const [newAccountCode, setNewAccountCode] = React.useState("4-02-01-040");
  const [newDescription, setNewDescription] = React.useState("");
  const [newDirection, setNewDirection] = React.useState<"credit" | "debit">("credit");
  const [newAmount, setNewAmount] = React.useState("");
  const [newRef, setNewRef] = React.useState("");

  // Form inputs for issuing official receipt
  const [newPayorName, setNewPayorName] = React.useState("");
  const [newParticulars, setNewParticulars] = React.useState("");
  const [newReceiptAmount, setNewReceiptAmount] = React.useState("");

  // Cancel receipt modal
  const [cancelModalOpen, setCancelModalOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");

  const [busy, setBusy] = React.useState(false);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);
  const [errMsg, setErrMsg] = React.useState<string | null>(null);

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

  async function handleCreateLedgerEntry(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrMsg(null);
    setOkMsg(null);
    try {
      const res = await post<LedgerEntry>("/finance/ledger", {
        fund: newFund,
        accountCode: newAccountCode,
        description: newDescription.trim(),
        direction: newDirection,
        amount: parseFloat(newAmount) || 0,
        orNumber: newRef.startsWith("OR-") ? newRef.trim() : null,
        dvNumber: newRef.startsWith("DV-") ? newRef.trim() : null,
        refType: newRef ? "manual" : undefined,
      });
      setOkMsg(`Journal entry ${res.id.toUpperCase()} successfully posted to the general ledger.`);
      setRecordDrawerOpen(false);
      setNewDescription("");
      setNewAmount("");
      setNewRef("");
      ledger.reload();
      setSelectedLedgerEntry(res);
    } catch (err: any) {
      setErrMsg(err?.message || "Failed to post ledger entry.");
    } finally {
      setBusy(false);
    }
  }

  async function handleIssueReceipt(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrMsg(null);
    setOkMsg(null);
    try {
      const res = await post<ExtendedReceipt>("/finance/receipts", {
        payorName: newPayorName.trim(),
        particulars: newParticulars.trim(),
        amount: parseFloat(newReceiptAmount) || 0,
      });
      setOkMsg(`Official Receipt ${res.orNumber} issued successfully.`);
      setReceiptDrawerOpen(false);
      setNewPayorName("");
      setNewParticulars("");
      setNewReceiptAmount("");
      receipts.reload();
      ledger.reload();
      setSelectedReceipt(res);
    } catch (err: any) {
      setErrMsg(err?.message || "Failed to issue official receipt.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCancelReceipt(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedReceipt) return;
    setBusy(true);
    setErrMsg(null);
    try {
      await post(`/finance/receipts/${selectedReceipt.id}/cancel`, {
        reason: cancelReason.trim() || "Cancelled by Treasurer",
      });
      setOkMsg(`Official Receipt ${selectedReceipt.orNumber} marked void in audit ledger.`);
      setCancelModalOpen(false);
      setCancelReason("");
      setSelectedReceipt(null);
      receipts.reload();
    } catch (err: any) {
      setErrMsg(err?.message || "Failed to cancel receipt.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title="Treasury & Ledger"
        subtitle="Barangay financial management: a double-entry ledger, official receipts and the annual appropriation with utilisation tracking."
        breadcrumb="Finance"
        parity="BFMS"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            {tab === "ledger" && (
              <>
                <Button id="tour-finance-record-btn" onClick={() => setRecordDrawerOpen(true)}>
                  + Record Journal Entry
                </Button>
                <Button id="tour-finance-export-btn" variant="default" onClick={exportLedger}>
                  ⬇ Export page (CSV)
                </Button>
              </>
            )}
            {tab === "receipts" && (
              <Button id="tour-finance-receipt-btn" onClick={() => setReceiptDrawerOpen(true)}>
                + Issue Official Receipt
              </Button>
            )}
          </div>
        }
      />

      {okMsg && (
        <div style={{ marginBottom: 16 }}>
          <Alert tone="success">{okMsg}</Alert>
        </div>
      )}

      {errMsg && (
        <div style={{ marginBottom: 16 }}>
          <Alert tone="danger">{errMsg}</Alert>
        </div>
      )}

      <div id="tour-finance-stats">
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
      </div>

      <div id="tour-finance-tabs">
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "ledger", label: "General ledger" },
            { value: "receipts", label: "Official receipts" },
            { value: "budget", label: "Budget & utilisation" },
          ]}
        />
      </div>

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

          <div id="tour-finance-table">
            <Async loading={ledger.loading} error={ledger.error}>
              <DataTable
                columns={[
                  { key: "postedAt", header: "Posted", render: (r) => date(r.postedAt) },
                  { key: "fund", header: "Fund", render: (r) => <Chip tone="navy">{r.fund.toUpperCase()}</Chip> },
                  { key: "accountCode", header: "Account" },
                  {
                    key: "description",
                    header: "Description",
                    render: (r) => (
                      <span
                        style={{ fontWeight: 600, color: "var(--cbms-navy)", textDecoration: "underline" }}
                      >
                        {r.description}
                      </span>
                    ),
                  },
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
                    render: (r) => (
                      <span style={{ fontFamily: "monospace", fontSize: 12 }}>
                        {r.orNumber ?? r.dvNumber ?? r.refType ?? "—"}
                      </span>
                    ),
                  },
                ]}
                rows={rows}
                rowKey={(r) => r.id}
                onRowClick={(r) => setSelectedLedgerEntry(r)}
                empty="No ledger entries match this filter."
              />
            </Async>

            <Pagination page={page} pageSize={pageSize} total={ledger.data?.total ?? 0} onPage={setPage} />
          </div>
        </Panel>
      )}

      {tab === "receipts" && (
        <Panel padded={false}>
          <Async loading={receipts.loading} error={receipts.error}>
            <DataTable
              columns={[
                {
                  key: "orNumber",
                  header: "OR number",
                  render: (r) => (
                    <span
                      style={{ fontWeight: 700, color: "var(--cbms-navy)", textDecoration: "underline" }}
                    >
                      {r.orNumber}
                    </span>
                  ),
                },
                { key: "payorName", header: "Payor", render: (r) => <strong>{r.payorName}</strong> },
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
              rowKey={(r) => r.id}
              onRowClick={(r) => setSelectedReceipt(r)}
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

      {/* ========================================================================= */}
      {/* 1. CONTENT DRAWER: VIEW JOURNAL RECORD (APPEARING ON THE RIGHT) */}
      {/* ========================================================================= */}
      {selectedLedgerEntry && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            zIndex: 1500,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setSelectedLedgerEntry(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "560px",
              backgroundColor: "var(--cbms-surface, #ffffff)",
              height: "100%",
              boxShadow: "-6px 0 25px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--cbms-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.02)",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--cbms-navy)" }}>
                  📑 Journal Entry Voucher
                </h3>
                <span style={{ fontSize: "0.8rem", color: "var(--cbms-muted)" }}>
                  Entry ID: {selectedLedgerEntry.id.toUpperCase()} · General Ledger
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLedgerEntry(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "var(--cbms-muted)",
                  padding: "4px 8px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              <div
                style={{
                  border: "1px solid var(--cbms-border)",
                  borderRadius: 8,
                  padding: 20,
                  background: "var(--cbms-bg)",
                }}
              >
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "var(--cbms-muted)", textTransform: "uppercase", letterSpacing: 1 }}>
                    Republic of the Philippines · City of Marikina
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--cbms-navy)" }}>
                    BARANGAY BARANGKA
                  </div>
                  <div style={{ fontSize: 12, color: "var(--cbms-muted)" }}>
                    OFFICE OF THE BARANGAY TREASURER
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    padding: "12px",
                    background: "rgba(0,0,0,0.02)",
                    borderRadius: 6,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div className="cbms-label">Fund Classification</div>
                    <Chip tone="navy">{selectedLedgerEntry.fund.toUpperCase()} FUND</Chip>
                  </div>
                  <div>
                    <div className="cbms-label">Transaction Flow</div>
                    <Chip tone={selectedLedgerEntry.direction === "credit" ? "green" : "red"}>
                      {selectedLedgerEntry.direction === "credit" ? "CREDIT (COLLECTION)" : "DEBIT (DISBURSEMENT)"}
                    </Chip>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div className="cbms-label">Total Transaction Amount</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "var(--cbms-navy)" }}>
                    {pesoAmount(selectedLedgerEntry.amount)}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
                  <div>
                    <span className="cbms-label">COA Account Code:</span>{" "}
                    <strong style={{ fontFamily: "monospace" }}>{selectedLedgerEntry.accountCode}</strong>
                  </div>
                  <div>
                    <span className="cbms-label">Description / Particulars:</span>
                    <div style={{ fontWeight: 600, marginTop: 2 }}>{selectedLedgerEntry.description}</div>
                  </div>
                  <div>
                    <span className="cbms-label">Reference Number:</span>{" "}
                    <strong style={{ fontFamily: "monospace" }}>
                      {selectedLedgerEntry.orNumber ?? selectedLedgerEntry.dvNumber ?? selectedLedgerEntry.refType ?? "—"}
                    </strong>
                  </div>
                  <div>
                    <span className="cbms-label">Date & Time Posted:</span>{" "}
                    <span>{dateTime(selectedLedgerEntry.postedAt)}</span>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 20,
                    paddingTop: 16,
                    borderTop: "1px dashed var(--cbms-border)",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    fontSize: 12,
                    textAlign: "center",
                  }}
                >
                  <div>
                    <div style={{ color: "var(--cbms-muted)", marginBottom: 20 }}>PREPARED BY:</div>
                    <div style={{ borderBottom: "1px solid #000", fontWeight: 700 }}>Teresa Morales</div>
                    <div style={{ color: "var(--cbms-muted)", fontSize: 11 }}>Barangay Treasurer</div>
                  </div>
                  <div>
                    <div style={{ color: "var(--cbms-muted)", marginBottom: 20 }}>APPROVED BY:</div>
                    <div style={{ borderBottom: "1px solid #000", fontWeight: 700 }}>Hon. Punong Barangay</div>
                    <div style={{ color: "var(--cbms-muted)", fontSize: 11 }}>Barangay Captain</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid var(--cbms-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--cbms-surface, #fff)",
              }}
            >
              <Button
                variant="default"
                onClick={() => router.push(`/finance/ledger/${selectedLedgerEntry.id}`)}
              >
                Open Full Page ↗
              </Button>
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="default" onClick={() => window.print()}>
                  🖨️ Print
                </Button>
                <Button variant="default" onClick={() => setSelectedLedgerEntry(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CONTENT DRAWER: RECORD JOURNAL ENTRY (APPEARING ON THE RIGHT) */}
      {/* ========================================================================= */}
      {recordDrawerOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            zIndex: 1500,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setRecordDrawerOpen(false)}
        >
          <div
            id="tour-finance-record-drawer"
            style={{
              width: "100%",
              maxWidth: "540px",
              backgroundColor: "var(--cbms-surface, #ffffff)",
              height: "100%",
              boxShadow: "-6px 0 25px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--cbms-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.02)",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--cbms-navy)" }}>
                  📝 Record Journal Entry
                </h3>
                <span style={{ fontSize: "0.8rem", color: "var(--cbms-muted)" }}>
                  Double-entry posting to General Ledger · COA Accounting Rules
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRecordDrawerOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "var(--cbms-muted)",
                  padding: "4px 8px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Drawer Body / Form */}
            <form
              onSubmit={handleCreateLedgerEntry}
              style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
            >
              <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Fund Classification">
                    <select
                      className="cbms-select"
                      style={{ width: "100%" }}
                      value={newFund}
                      onChange={(e) => setNewFund(e.target.value)}
                    >
                      {FUNDS.map((f) => (
                        <option key={f} value={f}>
                          {f.toUpperCase()} FUND
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Transaction Direction">
                    <select
                      className="cbms-select"
                      style={{ width: "100%" }}
                      value={newDirection}
                      onChange={(e) => setNewDirection(e.target.value as "credit" | "debit")}
                    >
                      <option value="credit">Credit (Collection / Inflow)</option>
                      <option value="debit">Debit (Disbursement / Outflow)</option>
                    </select>
                  </Field>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="COA Account Code">
                    <input
                      type="text"
                      className="cbms-input"
                      required
                      placeholder="e.g. 4-02-01-040"
                      value={newAccountCode}
                      onChange={(e) => setNewAccountCode(e.target.value)}
                    />
                  </Field>

                  <Field label="Amount (PHP)">
                    <input
                      type="number"
                      step="0.01"
                      className="cbms-input"
                      required
                      placeholder="0.00"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                    />
                  </Field>
                </div>

                <Field label="Description / Particulars">
                  <textarea
                    className="cbms-input"
                    rows={3}
                    required
                    placeholder="Describe transaction particulars, vendor, payee, or regulatory basis..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </Field>

                <Field label="Reference Number (OR or DV, Optional)">
                  <input
                    type="text"
                    className="cbms-input"
                    placeholder="e.g. OR-2026-00119 or DV-2026-09-005"
                    value={newRef}
                    onChange={(e) => setNewRef(e.target.value)}
                  />
                </Field>

                <div
                  style={{
                    padding: 12,
                    background: "rgba(0, 48, 135, 0.04)",
                    borderRadius: 6,
                    borderLeft: "3px solid var(--cbms-navy)",
                    fontSize: 12,
                    color: "var(--cbms-muted)",
                  }}
                >
                  Transactions posted here become part of the immutable double-entry trial balance in accordance with
                  the Government Accounting Manual for LGUs.
                </div>
              </div>

              {/* Drawer Footer */}
              <div
                style={{
                  padding: "14px 20px",
                  borderTop: "1px solid var(--cbms-border)",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  background: "var(--cbms-surface, #fff)",
                }}
              >
                <Button variant="default" type="button" onClick={() => setRecordDrawerOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busy}>
                  {busy ? "Posting..." : "Post to Ledger"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CONTENT DRAWER: VIEW OFFICIAL RECEIPT (APPEARING ON THE RIGHT) */}
      {/* ========================================================================= */}
      {selectedReceipt && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            zIndex: 1500,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setSelectedReceipt(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "560px",
              backgroundColor: "var(--cbms-surface, #ffffff)",
              height: "100%",
              boxShadow: "-6px 0 25px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--cbms-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.02)",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--cbms-navy)" }}>
                  🧾 Official Receipt Details
                </h3>
                <span style={{ fontSize: "0.8rem", color: "var(--cbms-muted)" }}>
                  Accountable Form No. 51 · {selectedReceipt.orNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "var(--cbms-muted)",
                  padding: "4px 8px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              <div
                style={{
                  border: "1px solid var(--cbms-border)",
                  borderRadius: 8,
                  padding: 20,
                  background: "var(--cbms-bg)",
                }}
              >
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "var(--cbms-muted)", textTransform: "uppercase" }}>
                    Republic of the Philippines · City of Marikina
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--cbms-navy)" }}>
                    BARANGAY BARANGKA
                  </div>
                  <div style={{ fontSize: 12, color: "var(--cbms-muted)" }}>
                    OFFICE OF THE BARANGAY TREASURER
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    padding: "12px",
                    background: "rgba(0,0,0,0.02)",
                    borderRadius: 6,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div className="cbms-label">Official Receipt No.</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "var(--cbms-navy)" }}>
                      {selectedReceipt.orNumber}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="cbms-label">Status</div>
                    <Chip tone={selectedReceipt.status === "cancelled" ? "red" : "green"}>
                      {selectedReceipt.status === "cancelled" ? "CANCELLED" : "VALID & POSTED"}
                    </Chip>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div className="cbms-label">Amount Paid</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "var(--cbms-navy)" }}>
                    {pesoAmount(selectedReceipt.amount)}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
                  <div>
                    <span className="cbms-label">Payor Name:</span>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--cbms-navy)" }}>
                      {selectedReceipt.payorName}
                    </div>
                  </div>
                  <div>
                    <span className="cbms-label">Particulars:</span>
                    <div style={{ fontWeight: 600 }}>{selectedReceipt.particulars}</div>
                  </div>
                  <div>
                    <span className="cbms-label">Date & Time Issued:</span>{" "}
                    <span>{dateTime(selectedReceipt.issuedAt)}</span>
                  </div>
                  <div>
                    <span className="cbms-label">Collecting Officer:</span>{" "}
                    <strong>Teresa Morales (Barangay Treasurer)</strong>
                  </div>
                </div>

                {selectedReceipt.status === "cancelled" && selectedReceipt.cancellationReason && (
                  <div style={{ marginTop: 16 }}>
                    <Alert tone="danger">
                      <strong>Cancellation Reason:</strong> {selectedReceipt.cancellationReason}
                    </Alert>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid var(--cbms-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--cbms-surface, #fff)",
              }}
            >
              <Button
                variant="default"
                onClick={() => router.push(`/finance/receipts/${selectedReceipt.id}`)}
              >
                Open Full Voucher ↗
              </Button>
              <div style={{ display: "flex", gap: 8 }}>
                {selectedReceipt.status !== "cancelled" && (
                  <Button variant="default" onClick={() => setCancelModalOpen(true)}>
                    Void OR
                  </Button>
                )}
                <Button variant="default" onClick={() => window.print()}>
                  🖨️ Print
                </Button>
                <Button variant="default" onClick={() => setSelectedReceipt(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CONTENT DRAWER: ISSUE OFFICIAL RECEIPT (APPEARING ON THE RIGHT) */}
      {/* ========================================================================= */}
      {receiptDrawerOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            zIndex: 1500,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setReceiptDrawerOpen(false)}
        >
          <div
            id="tour-finance-receipt-drawer"
            style={{
              width: "100%",
              maxWidth: "540px",
              backgroundColor: "var(--cbms-surface, #ffffff)",
              height: "100%",
              boxShadow: "-6px 0 25px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--cbms-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.02)",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--cbms-navy)" }}>
                  🧾 Issue Official Receipt
                </h3>
                <span style={{ fontSize: "0.8rem", color: "var(--cbms-muted)" }}>
                  Accountable Form No. 51 (Revised) · Bureau of Local Government Finance
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReceiptDrawerOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "var(--cbms-muted)",
                  padding: "4px 8px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Drawer Body / Form */}
            <form
              onSubmit={handleIssueReceipt}
              style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
            >
              <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                <Field label="Payor Full Name / Registered Entity">
                  <input
                    type="text"
                    className="cbms-input"
                    required
                    placeholder="e.g. Juan C. Dela Cruz or Barangka Bakery Corp."
                    value={newPayorName}
                    onChange={(e) => setNewPayorName(e.target.value)}
                  />
                </Field>

                <Field label="Particulars / Nature of Collection">
                  <input
                    type="text"
                    className="cbms-input"
                    required
                    placeholder="e.g. Barangay Clearance for Employment / Business Permit Assessment"
                    value={newParticulars}
                    onChange={(e) => setNewParticulars(e.target.value)}
                  />
                </Field>

                <Field label="Amount to Collect (PHP)">
                  <input
                    type="number"
                    step="0.01"
                    className="cbms-input"
                    required
                    placeholder="e.g. 150.00"
                    value={newReceiptAmount}
                    onChange={(e) => setNewReceiptAmount(e.target.value)}
                  />
                </Field>

                <div
                  style={{
                    padding: 12,
                    background: "rgba(0, 48, 135, 0.04)",
                    borderRadius: 6,
                    borderLeft: "3px solid var(--cbms-navy)",
                    fontSize: 12,
                    color: "var(--cbms-muted)",
                  }}
                >
                  Submitting this form automatically allocates the next sequential accountable OR number and posts a
                  corresponding collection credit to the General Ledger.
                </div>
              </div>

              {/* Drawer Footer */}
              <div
                style={{
                  padding: "14px 20px",
                  borderTop: "1px solid var(--cbms-border)",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  background: "var(--cbms-surface, #fff)",
                }}
              >
                <Button variant="default" type="button" onClick={() => setReceiptDrawerOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busy}>
                  {busy ? "Issuing..." : "Issue Official Receipt"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Receipt Modal */}
      {cancelModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "var(--cbms-surface, #fff)",
              borderRadius: 8,
              padding: 24,
              maxWidth: 480,
              width: "100%",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 8px 0" }}>Void / Cancel Official Receipt</h3>
            <p style={{ margin: "0 0 16px 0", fontSize: 13, color: "var(--cbms-muted)" }}>
              Under Commission on Audit (COA) guidelines, cancelled accountable forms must be preserved on
              file with a documented reason.
            </p>
            <form onSubmit={handleCancelReceipt}>
              <Field label="Reason for Cancellation">
                <textarea
                  className="cbms-input"
                  rows={3}
                  required
                  placeholder="e.g. Encoded wrong payor name / Resident requested refund / Duplicate issuance..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </Field>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                <Button variant="default" type="button" onClick={() => setCancelModalOpen(false)}>
                  Dismiss
                </Button>
                <Button variant="danger" type="submit" disabled={busy}>
                  {busy ? "Cancelling..." : "Confirm Cancellation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Tour Guide & Guide Toggle */}
      <FinanceTourGuide
        enabled={tourEnabled}
        onToggle={handleToggleTour}
        onOpenRecordDrawer={() => setRecordDrawerOpen(true)}
        onCloseRecordDrawer={() => setRecordDrawerOpen(false)}
        isRecordDrawerOpen={recordDrawerOpen}
        onSelectTab={setTab}
      />
      <FinanceGuideToggle enabled={tourEnabled} onToggle={handleToggleTour} />
    </>
  );
}
