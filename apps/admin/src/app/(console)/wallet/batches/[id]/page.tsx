"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ApiError, post, useApi } from "@cbms/api-client";
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
  dateTime,
  num,
  peso,
  titleize,
} from "@cbms/ui";
import { ActionResult, Async, EmptyNote, Hint } from "../../../../../components/common";
import { useConsole } from "../../../../../components/Shell";
import type { DisbursementBatch } from "../../../../../lib/types";

export default function BatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { can, user, reloadDashboard } = useConsole();
  const id = String((params as Record<string, string | string[]>)?.id ?? "");

  const res = useApi<DisbursementBatch>(id ? `/wallet/batches/${id}` : null);
  const b = res.data;

  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const mayApprove = can("wallet:approve");
  const isPreparer = !!b?.preparedById && !!user?.id && b.preparedById === user.id;
  const isForApproval = b?.status === "for_approval";
  const disabled = !mayApprove || isPreparer || !isForApproval || busy;

  const tooltip = !mayApprove
    ? "Your role cannot approve disbursements. Approval is reserved for the Punong Barangay."
    : isPreparer
      ? "Maker–checker: you prepared this batch, so you cannot approve it. Another officer must sign off (LGC §375)."
      : !isForApproval
        ? `This batch is '${titleize(b?.status ?? "")}' — only batches for approval can be executed.`
        : "Approve and release the payouts through the e-money rail.";

  const items = b?.items ?? [];
  const paid = items.filter((i) => i.status === "paid");
  const otc = items.filter((i) => i.status === "otc_fallback");
  const failed = items.filter((i) => i.status === "failed");

  async function approve() {
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const out = await post<{
        paid: number;
        failed: number;
        otcFallback: number;
        totalPaidCentavos: string;
      }>(`/wallet/batches/${id}/approve`);
      setOk(
        `Executed: ${out.paid} paid (${peso(out.totalPaidCentavos)}), ${out.otcFallback} for over-the-counter release, ${out.failed} failed.`,
      );
      res.reload();
      reloadDashboard();
    } catch (err) {
      const e = err as ApiError;
      setError(e?.message ?? "Approval failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title={b ? b.batchNo : "Disbursement batch"}
        subtitle={b?.title}
        breadcrumb="Finance / Disbursements"
        exclusive
        actions={
          <button
            type="button"
            className="cbms-btn"
            onClick={() => router.push("/wallet/batches")}
          >
            ← Back
          </button>
        }
      />

      <ActionResult error={error} success={ok} />

      <Async loading={res.loading} error={res.error}>
        {!b ? (
          <EmptyNote>Batch not found.</EmptyNote>
        ) : (
          <div className="adm-stack">
            <StatGrid>
              <StatCard label="Payees" value={num(items.length || b.itemCount)} icon="👥" />
              <StatCard label="Total" value={peso(b.totalCentavos)} icon="🏦" />
              <StatCard label="Paid to wallet" value={num(paid.length)} icon="✅" tone="green" />
              <StatCard
                label="Over-the-counter"
                value={num(otc.length)}
                icon="💵"
                tone="gold"
                hint="No wallet on file — cash always works"
              />
              <StatCard
                label="Failed"
                value={num(failed.length)}
                icon="⚠️"
                tone={failed.length ? "red" : "navy"}
              />
            </StatGrid>

            <div className="cbms-grid-2">
              <Panel title="Batch">
                <KeyValue
                  items={[
                    ["Batch number", b.batchNo],
                    ["Title", b.title],
                    ["Kind", <StatusChip key="k" status={b.kind} />],
                    ["Fund", titleize(b.fund)],
                    ["Status", <StatusChip key="s" status={b.status} />],
                    ["Prepared", dateTime(b.createdAt)],
                    ["Approved", b.approvedAt ? dateTime(b.approvedAt) : "—"],
                    ["Executed", b.executedAt ? dateTime(b.executedAt) : "—"],
                    ["Source note", b.sourceNote ?? "—"],
                  ]}
                />
              </Panel>

              <Panel title="Approve & disburse">
                <p style={{ fontSize: 13.5, marginTop: 0 }}>
                  Maker–checker is enforced by the API, not just the button: the preparer of a batch
                  is rejected with <code>403</code> if they attempt to approve it.
                </p>
                {isPreparer && (
                  <Alert tone="warn">
                    You prepared this batch. A different officer must approve it.
                  </Alert>
                )}
                <Hint text={tooltip}>
                  <Button variant="primary" disabled={disabled} onClick={() => void approve()}>
                    {busy ? "Disbursing…" : "✔ Approve & disburse"}
                  </Button>
                </Hint>
                <div className="adm-kpi-note">{tooltip}</div>
              </Panel>
            </div>

            <Panel title="Payees" padded={false}>
              <DataTable
                columns={[
                  {
                    key: "payeeName",
                    header: "Payee",
                    render: (i) => (
                      <>
                        <div className="cbms-table__primary">{i.payeeName}</div>
                        <div className="cbms-table__muted">
                          {i.inhabitant
                            ? `${i.inhabitant.firstName} ${i.inhabitant.lastName}`
                            : "Not linked to a resident record"}
                        </div>
                      </>
                    ),
                  },
                  {
                    key: "wallet",
                    header: "Channel",
                    render: (i) =>
                      i.walletId ? (
                        <Chip tone="green">E-wallet</Chip>
                      ) : (
                        <Chip tone="gold">Over the counter</Chip>
                      ),
                  },
                  {
                    key: "amountCentavos",
                    header: "Amount",
                    align: "right",
                    render: (i) => <strong>{peso(i.amountCentavos)}</strong>,
                  },
                  { key: "status", header: "Status", render: (i) => <StatusChip status={i.status} /> },
                  {
                    key: "paidAt",
                    header: "Paid",
                    render: (i) => (i.paidAt ? dateTime(i.paidAt) : "—"),
                  },
                  { key: "remarks", header: "Remarks", render: (i) => i.remarks ?? "—" },
                ]}
                rows={items}
                empty="This batch has no payees."
              />
            </Panel>
          </div>
        )}
      </Async>
    </>
  );
}
