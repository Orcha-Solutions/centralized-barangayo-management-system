"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@cbms/api-client";
import {
  Alert,
  Button,
  Chip,
  PageHead,
  Panel,
  dateTime,
  pesoAmount,
  titleize,
} from "@cbms/ui";
import { Async, EmptyNote } from "../../../../../components/common";
import type { LedgerEntry } from "../../../../../lib/types";

export default function LedgerEntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String((params as Record<string, string | string[]>)?.id ?? "");

  const entry = useApi<LedgerEntry>(id ? `/finance/ledger/${id}` : null);
  const r = entry.data;

  const isCredit = r?.direction === "credit";

  return (
    <>
      <PageHead
        title={r ? `Journal Entry Voucher (${r.id.toUpperCase()})` : "Journal Entry Voucher"}
        subtitle="Barangay Financial Management System · Commission on Audit (COA) Accounting Rules"
        breadcrumb="Finance / General Ledger / Entry Details"
        parity="BFMS"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="default" onClick={() => router.push("/finance")}>
              ← Back to Finance
            </Button>
            {r && (
              <Button variant="default" onClick={() => window.print()}>
                🖨️ Print JEV Voucher
              </Button>
            )}
          </div>
        }
      />

      <Async loading={entry.loading} error={entry.error}>
        {!r ? (
          <EmptyNote>Ledger entry record not found.</EmptyNote>
        ) : (
          <div style={{ maxWidth: 880, margin: "0 auto" }}>
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
                    JOURNAL ENTRY VOUCHER (JEV)
                  </div>
                </div>

                {/* Voucher Meta Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 16,
                    marginBottom: 20,
                    padding: "12px 16px",
                    background: "rgba(0, 0, 0, 0.02)",
                    borderRadius: 6,
                  }}
                >
                  <div>
                    <div className="cbms-label">JEV Entry No.</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "var(--cbms-navy)" }}>
                      {r.id.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="cbms-label">Date Posted</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{dateTime(r.postedAt)}</div>
                  </div>
                  <div>
                    <div className="cbms-label">Fund Classification</div>
                    <Chip tone="navy">{r.fund.toUpperCase()} FUND</Chip>
                  </div>
                </div>

                {/* Accounting Transaction Table */}
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
                      <th style={{ background: "rgba(0,0,0,0.03)" }}>Account Code</th>
                      <th style={{ background: "rgba(0,0,0,0.03)" }}>Account Title & Particulars</th>
                      <th style={{ width: 140, textAlign: "right", background: "rgba(0,0,0,0.03)" }}>
                        Debit (PHP)
                      </th>
                      <th style={{ width: 140, textAlign: "right", background: "rgba(0,0,0,0.03)" }}>
                        Credit (PHP)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontFamily: "monospace", fontWeight: 700, verticalAlign: "top" }}>
                        {r.accountCode}
                      </td>
                      <td style={{ verticalAlign: "top" }}>
                        <div style={{ fontWeight: 600, color: "var(--cbms-navy)" }}>
                          {r.description}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--cbms-muted)", marginTop: 4 }}>
                          Reference: <strong>{r.orNumber ?? r.dvNumber ?? r.refType ?? "—"}</strong>
                        </div>
                        <div style={{ fontSize: 11, color: "var(--cbms-muted)", marginTop: 2 }}>
                          Fund Source: {r.fund.toUpperCase()} · Direction: {titleize(r.direction)}
                        </div>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, verticalAlign: "middle" }}>
                        {!isCredit ? pesoAmount(r.amount) : "—"}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, verticalAlign: "middle" }}>
                        {isCredit ? pesoAmount(r.amount) : "—"}
                      </td>
                    </tr>
                    <tr style={{ background: "rgba(0, 0, 0, 0.02)", fontWeight: 800 }}>
                      <td colSpan={2} style={{ textAlign: "right", padding: "10px 14px" }}>
                        TOTAL
                      </td>
                      <td style={{ textAlign: "right", padding: "10px 14px" }}>
                        {!isCredit ? pesoAmount(r.amount) : "—"}
                      </td>
                      <td style={{ textAlign: "right", padding: "10px 14px" }}>
                        {isCredit ? pesoAmount(r.amount) : "—"}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Additional Reference Details */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    padding: "12px 16px",
                    background: "rgba(0,0,0,0.015)",
                    borderRadius: 6,
                    marginBottom: 24,
                    fontSize: 13,
                  }}
                >
                  <div>
                    <span className="cbms-label">Official Reference Type:</span>{" "}
                    <strong>{r.orNumber ? "Official Receipt (OR)" : r.dvNumber ? "Disbursement Voucher (DV)" : "Manual Entry"}</strong>
                  </div>
                  <div>
                    <span className="cbms-label">Reference Number:</span>{" "}
                    <strong>{r.orNumber ?? r.dvNumber ?? "—"}</strong>
                  </div>
                </div>

                {/* Signatories Block */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 40,
                    marginTop: 32,
                    paddingTop: 20,
                    borderTop: "1px solid var(--cbms-border)",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: "var(--cbms-muted)", marginBottom: 36 }}>
                      PREPARED BY:
                    </div>
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
                      Barangay Treasurer
                    </div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: "var(--cbms-muted)", marginBottom: 36 }}>
                      APPROVED BY:
                    </div>
                    <div
                      style={{
                        borderBottom: "1px solid #000",
                        fontWeight: 700,
                        fontSize: 14,
                        paddingBottom: 4,
                      }}
                    >
                      Hon. Punong Barangay
                    </div>
                    <div style={{ fontSize: 12, color: "var(--cbms-muted)", marginTop: 2 }}>
                      Barangay Captain / Head of Agency
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
                  CERTIFICATION: I hereby certify that the accounting entries recorded above are true, complete,
                  and based on valid supporting documents examined in compliance with COA rules and regulations.
                </div>
              </div>
            </Panel>
          </div>
        )}
      </Async>
    </>
  );
}
