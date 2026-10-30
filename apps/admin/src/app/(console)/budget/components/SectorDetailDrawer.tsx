"use client";

import * as React from "react";
import { pesoAmount, dateTime } from "@cbms/ui";
import { useSectorDisbursements } from "../../../../lib/budget-queries";
import type { StatutoryFundItem } from "./BudgetFloorGauges";

export interface SectorDetailDrawerProps {
  open: boolean;
  fund: StatutoryFundItem | null;
  onClose: () => void;
}

export function SectorDetailDrawer({
  open,
  fund,
  onClose,
}: SectorDetailDrawerProps) {
  const fundId = fund?.id || "";
  const { data: disbursementsData, isLoading } = useSectorDisbursements(open && fundId ? fundId : "");
  const items = disbursementsData?.data || [];

  if (!open || !fund) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(2px)",
        zIndex: 2200,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sector Details & Disbursements"
        style={{
          width: "100%",
          maxWidth: "560px",
          height: "100%",
          backgroundColor: "#ffffff",
          boxShadow: "-8px 0 24px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
          animation: "slideInRight 0.25s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.5rem" }}>{fund.icon || "🏛️"}</span>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0a2463" }}>
                {fund.name}
              </h3>
              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                Code: {fund.code} · {fund.statutoryRule}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.25rem",
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Statutory KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Total Allotment</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", fontFamily: "monospace", marginTop: "2px" }}>
                {pesoAmount(fund.appropriatedAmount)}
              </div>
            </div>
            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <div style={{ fontSize: "0.75rem", color: "#166534", fontWeight: 600 }}>Unobligated Balance</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#15803d", fontFamily: "monospace", marginTop: "2px" }}>
                {pesoAmount(fund.balanceAmount)}
              </div>
            </div>
          </div>

          {/* Burn rate */}
          <div style={{ padding: "12px 14px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 600, marginBottom: "6px" }}>
              <span style={{ color: "#475569" }}>Obligation Burn Rate</span>
              <span style={{ color: "#0a2463" }}>{fund.utilizationPct}% utilized</span>
            </div>
            <div style={{ height: "8px", borderRadius: "4px", backgroundColor: "#e2e8f0", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(100, fund.utilizationPct)}%`,
                  backgroundColor: fund.utilizationPct >= 85 ? "#d97706" : "#1d4ed8",
                }}
              />
            </div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "6px" }}>
              Legal Basis: {fund.legalBasis}
            </div>
          </div>

          {/* Actual Ledger Debit Disbursements Table */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#1e293b" }}>
                Ledger Disbursements Charged ({items.length})
              </h4>
              <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 600 }}>
                Live Treasury Sync
              </span>
            </div>

            {isLoading ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>
                Loading ledger disbursement records...
              </div>
            ) : items.length === 0 ? (
              <div
                style={{
                  padding: "24px",
                  borderRadius: "8px",
                  border: "1px dashed #cbd5e1",
                  textAlign: "center",
                  color: "#64748b",
                  fontSize: "0.85rem",
                  backgroundColor: "#fafafa",
                }}
              >
                No disbursements posted against this sector fund yet.
                <div style={{ fontSize: "0.75rem", marginTop: "4px", color: "#94a3b8" }}>
                  Disbursements encoded in Treasury & Ledger tagged to this fund will appear here.
                </div>
              </div>
            ) : (
              <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f1f5f9", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "8px 10px", color: "#475569" }}>DV Number</th>
                      <th style={{ padding: "8px 10px", color: "#475569" }}>Particulars / Payee</th>
                      <th style={{ padding: "8px 10px", color: "#475569", textAlign: "right" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((disb) => (
                      <tr key={disb.ledgerId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "8px 10px", fontFamily: "monospace", fontWeight: 600, color: "#1d4ed8" }}>
                          {disb.dvNumber || "DV-UNASSIGNED"}
                          <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
                            {disb.postedAt ? dateTime(disb.postedAt) : "—"}
                          </div>
                        </td>
                        <td style={{ padding: "8px 10px" }}>
                          <div style={{ fontWeight: 600, color: "#0f172a" }}>{disb.description}</div>
                          <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Payee: {disb.payee || "N/A"}</div>
                        </td>
                        <td style={{ padding: "8px 10px", textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: "#b91c1c" }}>
                          -{pesoAmount(disb.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="cbms-btn cbms-btn--secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
