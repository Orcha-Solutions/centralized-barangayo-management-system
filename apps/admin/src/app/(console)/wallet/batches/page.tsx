"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError, post, del, useApi } from "@cbms/api-client";
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
  StatusChip,
  Toolbar,
  dateTime,
  num,
  peso,
  titleize,
} from "@cbms/ui";
import { ActionResult, Async } from "../../../../components/common";
import { useConsole } from "../../../../components/Shell";
import type { Bag, DisbursementBatch } from "../../../../lib/types";

export default function BatchesPage() {
  const router = useRouter();
  const { can, user, reloadDashboard } = useConsole();
  const [status, setStatus] = React.useState("all");
  const [fund, setFund] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [q, setQ] = React.useState("");

  const [selectedBatch, setSelectedBatch] = React.useState<DisbursementBatch | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const list = useApi<Bag<DisbursementBatch>>("/wallet/batches");
  const all = list.data?.items ?? [];

  // Keep selectedBatch synced with latest data
  React.useEffect(() => {
    if (selectedBatch) {
      const found = all.find((b) => b.id === selectedBatch.id);
      if (found) setSelectedBatch(found);
    }
  }, [all]);

  const rows = all.filter((b) => {
    const matchesStatus = status === "all" || b.status === status;
    const matchesFund = fund === "all" || b.fund === fund;
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      b.batchNo.toLowerCase().includes(query) ||
      b.title.toLowerCase().includes(query) ||
      b.kind.toLowerCase().includes(query);
    return matchesStatus && matchesFund && matchesSearch;
  });

  const forApproval = all.filter((b) => b.status === "for_approval");
  const completed = all.filter((b) => b.status === "completed");
  const totalDisbursed = completed.reduce((s, b) => {
    const clean = String(b.totalCentavos || "0").replace(/n$/, "").trim();
    const val = Number(clean);
    return s + (isNaN(val) ? 0n : BigInt(Math.round(val)));
  }, 0n);

  const mayApprove = can("wallet:approve");
  const isPreparer =
    !!selectedBatch?.preparedById &&
    !!user?.id &&
    selectedBatch.preparedById === user.id;
  const isForApproval = selectedBatch?.status === "for_approval";
  const canExecuteInDrawer = mayApprove && !isPreparer && isForApproval && !busy;

  async function handleApproveInDrawer(batchId: string) {
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const out = await post<{
        paid: number;
        failed: number;
        otcFallback: number;
        totalPaidCentavos: string;
        dvNumber?: string;
      }>(`/wallet/batches/${batchId}/approve`);
      setOk(
        `Disbursement executed successfully! DV #${out.dvNumber || "DV-2026"} issued: ${out.paid} paid (${peso(
          out.totalPaidCentavos
        )}), ${out.otcFallback} queued for over-the-counter release.`
      );
      list.reload();
      reloadDashboard();
    } catch (err) {
      const e = err as ApiError;
      setError(e?.message ?? "Disbursement approval failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteInDrawer(batchId: string) {
    if (!selectedBatch) return;
    const confirmed = window.confirm(
      `Are you sure you want to cancel and delete batch ${selectedBatch.batchNo}? This cannot be undone.`
    );
    if (!confirmed) return;
    setBusy(true);
    setError(null);
    try {
      await del(`/wallet/batches/${batchId}`);
      setSelectedBatch(null);
      setOk(`Batch ${selectedBatch.batchNo} cancelled and removed.`);
      list.reload();
      reloadDashboard();
    } catch (err) {
      const e = err as ApiError;
      setError(e?.message ?? "Failed to delete batch.");
    } finally {
      setBusy(false);
    }
  }

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

      <ActionResult error={error} success={ok} />

      <StatGrid>
        <StatCard label="Total Batches" value={num(all.length)} icon="💸" />
        <StatCard
          label="For Approval"
          value={num(forApproval.length)}
          icon="✍️"
          tone={forApproval.length ? "gold" : "navy"}
          hint="Awaiting punong barangay review"
        />
        <StatCard label="Completed Batches" value={num(completed.length)} icon="✅" tone="green" />
        <StatCard
          label="Value Disbursed"
          value={peso(totalDisbursed.toString())}
          icon="🏦"
          hint="Completed payouts via e-wallet"
        />
      </StatGrid>

      <Panel padded={false}>
        <Toolbar>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(q.trim());
            }}
            style={{ display: "flex", gap: 8 }}
          >
            <input
              className="cbms-input cbms-input--search"
              placeholder="Search batch number, title or kind…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ minWidth: 260 }}
            />
            <Button type="submit">Search</Button>
          </form>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                )
              )}
            </select>

            <select
              className="cbms-select"
              value={fund}
              onChange={(e) => setFund(e.target.value)}
            >
              <option value="all">All funds</option>
              <option value="general">General Fund</option>
              <option value="sk">SK Fund</option>
              <option value="gad">GAD Fund</option>
              <option value="disaster">Disaster / LDRRM</option>
              <option value="trust">Trust Fund</option>
            </select>
          </div>

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
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--cbms-navy)" }}>{b.batchNo}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--cbms-muted)" }}>{b.title}</div>
                  </div>
                ),
              },
              { key: "kind", header: "Kind", render: (b) => <StatusChip status={b.kind} /> },
              { key: "fund", header: "Fund", render: (b) => <Chip tone="navy">{titleize(b.fund)}</Chip> },
              {
                key: "itemCount",
                header: "Payees",
                align: "right",
                render: (b) => <strong>{num(b.itemCount || b._count?.items || 0)}</strong>,
              },
              {
                key: "totalCentavos",
                header: "Total",
                align: "right",
                render: (b) => <strong style={{ color: "var(--cbms-navy)" }}>{peso(b.totalCentavos)}</strong>,
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
            rowKey={(b) => b.id}
            empty="No disbursement batches found."
            onRowClick={(b) => setSelectedBatch(b)}
          />
        </Async>
      </Panel>

      {/* ========================================================================= */}
      {/* CONTENT DRAWER: VIEW DISBURSEMENT BATCH (APPEARING ON THE RIGHT) */}
      {/* ========================================================================= */}
      {selectedBatch && (
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
          onClick={() => setSelectedBatch(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "600px",
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
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--cbms-navy)" }}>
                    💸 {selectedBatch.batchNo}
                  </h3>
                  <StatusChip status={selectedBatch.status} />
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--cbms-muted)" }}>
                  {selectedBatch.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBatch(null)}
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

            {/* Quick Action Bar */}
            <div
              style={{
                padding: "10px 20px",
                backgroundColor: "var(--cbms-bg)",
                borderBottom: "1px solid var(--cbms-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  type="button"
                  className="cbms-btn cbms-btn--sm"
                  onClick={() => router.push(`/wallet/batches/${selectedBatch.id}`)}
                >
                  Open Full Page ↗
                </button>
                {selectedBatch.dvNumber && (
                  <button
                    type="button"
                    className="cbms-btn cbms-btn--sm cbms-btn--gold"
                    onClick={() => router.push(`/finance/ledger?q=${selectedBatch.dvNumber}`)}
                  >
                    🧾 View Ledger Voucher ({selectedBatch.dvNumber})
                  </button>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {isForApproval && (
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={!canExecuteInDrawer}
                    onClick={() => handleApproveInDrawer(selectedBatch.id)}
                  >
                    {busy ? "Disbursing…" : "✔ Approve & Disburse"}
                  </Button>
                )}
                {selectedBatch.status !== "completed" && (
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={busy}
                    onClick={() => handleDeleteInDrawer(selectedBatch.id)}
                  >
                    🗑️ Cancel
                  </Button>
                )}
              </div>
            </div>

            {/* Drawer Body */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Batch Overview Summary Card */}
              <div
                style={{
                  border: "1px solid var(--cbms-border)",
                  borderRadius: 8,
                  padding: 16,
                  background: "var(--cbms-bg)",
                }}
              >
                <div style={{ fontSize: 11, color: "var(--cbms-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                  BATCH ATTRIBUTES & MAKER-CHECKER
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--cbms-muted)" }}>Total Appropriation</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "var(--cbms-navy)" }}>
                      {peso(selectedBatch.totalCentavos)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--cbms-muted)" }}>Total Payees</div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>
                      {num(selectedBatch.itemCount || selectedBatch.items?.length || 0)} beneficiaries
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--cbms-muted)" }}>Fund Classification</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{titleize(selectedBatch.fund)} Fund</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--cbms-muted)" }}>Disbursement Kind</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{titleize(selectedBatch.kind)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--cbms-muted)" }}>Prepared Date</div>
                    <div style={{ fontSize: 12 }}>{dateTime(selectedBatch.createdAt)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--cbms-muted)" }}>Execution Timestamp</div>
                    <div style={{ fontSize: 12 }}>
                      {selectedBatch.executedAt ? dateTime(selectedBatch.executedAt) : "Pending approval"}
                    </div>
                  </div>
                  {selectedBatch.dvNumber && (
                    <div>
                      <div style={{ fontSize: 11, color: "var(--cbms-muted)" }}>Disbursement Voucher</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--cbms-navy)" }}>
                        {selectedBatch.dvNumber}
                      </div>
                    </div>
                  )}
                </div>

                {selectedBatch.sourceNote && (
                  <div style={{ marginTop: 12, borderTop: "1px dashed var(--cbms-border)", paddingTop: 8, fontSize: 12 }}>
                    <span style={{ color: "var(--cbms-muted)" }}>Source / Authority Note:</span>{" "}
                    <em>{selectedBatch.sourceNote}</em>
                  </div>
                )}
              </div>

              {/* Notice / Maker Checker Guidance */}
              {isForApproval && (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    background: "rgba(245, 158, 11, 0.08)",
                    border: "1px solid var(--cbms-gold)",
                    fontSize: 12,
                  }}
                >
                  <strong style={{ color: "var(--cbms-gold)" }}>Maker–Checker Verification:</strong>{" "}
                  {isPreparer
                    ? "You prepared this batch. Under Local Government Code rules, approval is reserved for another authorized officer."
                    : "This batch is ready for sign-off. Approving triggers payout via the digital e-money rail and logs a Disbursement Voucher in the General Ledger."}
                </div>
              )}

              {/* Payees List Section */}
              <div
                style={{
                  border: "1px solid var(--cbms-border)",
                  borderRadius: 8,
                  background: "var(--cbms-surface)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "10px 16px",
                    borderBottom: "1px solid var(--cbms-border)",
                    backgroundColor: "rgba(0,0,0,0.02)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--cbms-navy)", textTransform: "uppercase" }}>
                    Beneficiary Payees ({selectedBatch.items?.length ?? selectedBatch.itemCount})
                  </span>
                </div>

                {!selectedBatch.items || selectedBatch.items.length === 0 ? (
                  <div style={{ padding: 16, textAlign: "center", color: "var(--cbms-muted)", fontSize: 13 }}>
                    No itemized payees recorded for this batch.
                  </div>
                ) : (
                  <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                    <table className="cbms-table" style={{ fontSize: 13 }}>
                      <thead>
                        <tr>
                          <th>Payee</th>
                          <th>Channel</th>
                          <th style={{ textAlign: "right" }}>Amount</th>
                          <th style={{ textAlign: "center" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBatch.items.map((item, idx) => (
                          <tr key={item.id || idx}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{item.payeeName}</div>
                              {item.remarks && (
                                <div style={{ fontSize: 11, color: "var(--cbms-muted)" }}>{item.remarks}</div>
                              )}
                            </td>
                            <td>
                              {item.walletId ? (
                                <Chip tone="green">E-Wallet</Chip>
                              ) : (
                                <Chip tone="gold">Over the counter</Chip>
                              )}
                            </td>
                            <td style={{ textAlign: "right", fontWeight: 700 }}>
                              {peso(item.amountCentavos)}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <StatusChip status={item.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
