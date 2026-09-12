"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { post, useApi, useSession } from "@cbms/api-client";
import {
  Alert,
  Button,
  Chip,
  Field,
  PageHead,
  Panel,
  dateTime,
  pesoAmount,
} from "@cbms/ui";
import { Async, EmptyNote } from "../../../../../components/common";
import type { OfficialReceipt } from "../../../../../lib/types";

interface ExtendedReceipt extends OfficialReceipt {
  status?: string;
  cancellationReason?: string;
  cancelledAt?: string;
}

export default function OfficialReceiptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const session = useSession();
  const id = String((params as Record<string, string | string[]>)?.id ?? "");

  const receipt = useApi<ExtendedReceipt>(id ? `/finance/receipts/${id}` : null);
  const r = receipt.data;

  const [cancelModal, setCancelModal] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  async function handleCancelReceipt(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please specify a reason for cancelling this official receipt.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await post(`/finance/receipts/${id}/cancel`, { reason: reason.trim() });
      setSuccess("Official receipt has been cancelled and marked in the audit ledger.");
      setCancelModal(false);
      setReason("");
      receipt.reload();
    } catch (err: any) {
      setError(err?.message || "Failed to cancel official receipt.");
    } finally {
      setBusy(false);
    }
  }

  const isCancelled = r?.status === "cancelled";

  return (
    <>
      <PageHead
        title={r ? `Official Receipt ${r.orNumber}` : "Official Receipt"}
        subtitle="Accountable Form No. 51 (Revised) · Bureau of Local Government Finance / Commission on Audit"
        breadcrumb="Finance / Official Receipts / Details"
        parity="BFMS"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="default" onClick={() => router.push("/finance")}>
              ← Back to Finance
            </Button>
            {r && !isCancelled && (
              <>
                <Button variant="default" onClick={() => window.print()}>
                  🖨️ Print Receipt
                </Button>
                <Button variant="default" onClick={() => setCancelModal(true)}>
                  Void / Cancel OR
                </Button>
              </>
            )}
          </div>
        }
      />

      {success && (
        <div style={{ marginBottom: 16 }}>
          <Alert tone="success">{success}</Alert>
        </div>
      )}

      {error && (
        <div style={{ marginBottom: 16 }}>
          <Alert tone="danger">{error}</Alert>
        </div>
      )}

      <Async loading={receipt.loading} error={receipt.error}>
        {!r ? (
          <EmptyNote>Official Receipt record not found.</EmptyNote>
        ) : (
          <div style={{ maxWidth: 840, margin: "0 auto" }}>
            {/* Accountable Form 51 Mock Printable Voucher Card */}
            <Panel>
              <div
                style={{
                  border: "2px solid var(--cbms-border)",
                  borderRadius: 8,
                  padding: "24px 28px",
                  background: "var(--cbms-bg)",
                  fontFamily: "var(--cbms-font-sans, inherit)",
                }}
              >
                {/* Header Stamp */}
                <div
                  style={{
                    textAlign: "center",
                    borderBottom: "2px dashed var(--cbms-border)",
                    paddingBottom: 16,
                    marginBottom: 20,
                  }}
                >
                  <div style={{ fontSize: 11, letterSpacing: 1.5, color: "var(--cbms-muted)", textTransform: "uppercase" }}>
                    Republic of the Philippines · City of Marikina
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--cbms-navy)", marginTop: 2 }}>
                    BARANGAY BARANGKA
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cbms-muted)" }}>
                    OFFICE OF THE BARANGAY TREASURER
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      marginTop: 10,
                      padding: "4px 14px",
                      background: "rgba(0, 48, 135, 0.08)",
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--cbms-navy)",
                      letterSpacing: 1,
                    }}
                  >
                    OFFICIAL RECEIPT (ACCOUNTABLE FORM NO. 51)
                  </div>
                </div>

                {/* Top Details Row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 20,
                    padding: "12px 16px",
                    background: "rgba(0, 0, 0, 0.02)",
                    borderRadius: 6,
                  }}
                >
                  <div>
                    <div className="cbms-label">Official Receipt No.</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--cbms-navy)" }}>
                      {r.orNumber}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="cbms-label">Date & Time Issued</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{dateTime(r.issuedAt)}</div>
                    <div style={{ marginTop: 4 }}>
                      <Chip tone={isCancelled ? "red" : "green"}>
                        {isCancelled ? "CANCELLED / VOID" : "VALID & POSTED"}
                      </Chip>
                    </div>
                  </div>
                </div>

                {isCancelled && r.cancellationReason && (
                  <div style={{ marginBottom: 20 }}>
                    <Alert tone="danger">
                      <strong>Cancellation Notice:</strong> This receipt was marked void on{" "}
                      {r.cancelledAt ? dateTime(r.cancelledAt) : "record"}. Reason: {r.cancellationReason}
                    </Alert>
                  </div>
                )}

                {/* Main Particulars Table */}
                <table
                  className="cbms-table"
                  style={{
                    marginBottom: 24,
                    border: "1px solid var(--cbms-border)",
                    borderRadius: 4,
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ background: "rgba(0,0,0,0.03)" }}>Payor Information & Particulars</th>
                      <th style={{ width: 180, textAlign: "right", background: "rgba(0,0,0,0.03)" }}>
                        Amount (PHP)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "16px 14px" }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--cbms-navy)" }}>
                          {r.payorName}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--cbms-muted)", marginTop: 4 }}>
                          Particulars: <strong>{r.particulars}</strong>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--cbms-muted)", marginTop: 2 }}>
                          Collection Classification: Regulatory & Clearance Fees (Account 4-02-01-040)
                        </div>
                      </td>
                      <td style={{ textAlign: "right", verticalAlign: "middle", padding: "16px 14px" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--cbms-navy)" }}>
                          {pesoAmount(r.amount)}
                        </div>
                      </td>
                    </tr>
                    <tr style={{ background: "rgba(0, 0, 0, 0.02)", fontWeight: 700 }}>
                      <td style={{ textAlign: "right", padding: "10px 14px" }}>TOTAL AMOUNT PAID</td>
                      <td style={{ textAlign: "right", padding: "10px 14px", fontSize: 16 }}>
                        {pesoAmount(r.amount)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Signatures & Certification */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 32,
                    marginTop: 32,
                    paddingTop: 20,
                    borderTop: "1px solid var(--cbms-border)",
                  }}
                >
                  <div>
                    <div className="cbms-label">Payment Mode</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Cash / Over-the-Counter Collection</div>
                    <div style={{ fontSize: 11, color: "var(--cbms-muted)", marginTop: 4 }}>
                      Direct Treasury Window Collection · Barangka Hall
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ height: 40 }} />
                    <div
                      style={{
                        borderBottom: "1px solid #000",
                        fontWeight: 700,
                        fontSize: 14,
                        paddingBottom: 4,
                      }}
                    >
                      Teresa Morales
                    </div>
                    <div style={{ fontSize: 12, color: "var(--cbms-muted)", marginTop: 2 }}>
                      Barangay Treasurer · Collecting Officer
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 24,
                    paddingTop: 12,
                    borderTop: "1px dashed var(--cbms-border)",
                    fontSize: 11,
                    color: "var(--cbms-muted)",
                    textAlign: "center",
                  }}
                >
                  NOTICE: This official receipt is non-transferable and serves as valid proof of payment for
                  LGU and regulatory clearances under Section 133 of the Local Government Code of 1991.
                </div>
              </div>
            </Panel>
          </div>
        )}
      </Async>

      {/* Cancel Modal */}
      {cancelModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
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
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </Field>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                <Button variant="default" type="button" onClick={() => setCancelModal(false)}>
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
    </>
  );
}
