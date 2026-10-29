"use client";

import * as React from "react";
import Link from "next/link";
import { Chip, StatusChip, dateTime, pesoAmount, titleize } from "@cbms/ui";
import type { RptPropertyItem, RptTaxDueItem, PayRptTaxPayload } from "../../../../lib/rpt-queries";
import { printRptDossier } from "./printRptDossier";

export interface RptDetailDrawerProps {
  property: RptPropertyItem | null;
  due: RptTaxDueItem | null;
  payingBusy: boolean;
  mayCollect: boolean;
  mayEdit: boolean;
  mayDelete: boolean;
  onClose: () => void;
  onEdit: (prop: RptPropertyItem) => void;
  onDelete: (prop: RptPropertyItem) => void;
  onPayTax: (propertyId: string, payload: PayRptTaxPayload) => void;
}

export function RptDetailDrawer({
  property,
  due,
  payingBusy,
  mayCollect,
  mayEdit,
  mayDelete,
  onClose,
  onEdit,
  onDelete,
  onPayTax,
}: RptDetailDrawerProps) {
  const [paymentMethod, setPaymentMethod] = React.useState("cash");
  const [customOrNumber, setCustomOrNumber] = React.useState("");

  React.useEffect(() => {
    setPaymentMethod("cash");
    setCustomOrNumber("");
  }, [property?.id]);

  if (!property) return null;

  const status = due?.paymentStatus || "unpaid";
  const basicTax = due ? due.basicTaxAmount : Math.round(property.assessedValue * 0.01);
  const sefTax = due ? due.sefTaxAmount : Math.round(property.assessedValue * 0.01);
  const brgyShare = due ? due.barangayShareAmount : Math.round(basicTax * 0.25);
  const penalty = due ? due.penaltyAmount : 0;
  const discount = due ? due.discountAmount : 0;
  const netPayable = due ? due.totalAmount : basicTax + sefTax;
  const taxYear = due?.taxYear || new Date().getFullYear();

  const handleCollect = (e: React.FormEvent) => {
    e.preventDefault();
    onPayTax(property.id, {
      taxYear,
      paymentMethod,
      orNumber: customOrNumber.trim() || undefined,
      paidBy: property.ownerName,
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.5)",
        backdropFilter: "blur(2px)",
        zIndex: 1900,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !payingBusy) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width: "100%",
          maxWidth: "560px",
          backgroundColor: "#ffffff",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.18)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#f8fafc",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span
                style={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  color: "#0f172a",
                }}
              >
                {property.taxDeclarationNo}
              </span>
              <Chip tone="blue">{titleize(property.propertyType)}</Chip>
              <StatusChip status={status} />
            </div>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "#64748b" }}>
              Real Property Tax Dossier · FY {taxYear} Assessment
            </p>
          </div>
          <button
            type="button"
            disabled={payingBusy}
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.25rem",
              color: "#64748b",
              cursor: payingBusy ? "not-allowed" : "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "20px 24px",
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {/* Property Metadata Card */}
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "14px 16px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              fontSize: "0.85rem",
            }}
          >
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                REGISTERED OWNER / TAXPAYER
              </div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                {property.ownerName}
              </div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                PROPERTY LOCATION
              </div>
              <div style={{ fontWeight: 500, color: "#1e293b" }}>
                {property.addressLine} · <strong>{property.purok}</strong>
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                CADASTRAL LOT / BLOCK
              </div>
              <div style={{ fontFamily: "monospace", fontWeight: 600 }}>
                Lot {property.lotNo || "—"}, Blk {property.blockNo || "—"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                DECLARED / UPDATED
              </div>
              <div>{property.createdAt ? dateTime(property.createdAt) : "—"}</div>
            </div>
          </div>

          {/* Valuation & Tax Breakdown Card */}
          <div
            style={{
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "16px",
              backgroundColor: "#f8fafc",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: "0.88rem",
                color: "#0f172a",
                marginBottom: "12px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Statutory Valuation & Tax Computation (FY {taxYear})</span>
              <span style={{ fontSize: "0.75rem", color: "#475569" }}>RA 7160 §233 & §271</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
              <Row label="Fair Market Value" value={pesoAmount(property.marketValue)} />
              <Row label="Assessed Value (Taxable Base)" value={pesoAmount(property.assessedValue)} bold />
              <div style={{ height: 1, backgroundColor: "#e2e8f0", margin: "4px 0" }} />
              <Row label="Basic Real Property Tax (1%)" value={pesoAmount(basicTax)} />
              <Row label="Special Education Fund — SEF (1%)" value={pesoAmount(sefTax)} />
              {penalty > 0 && <Row label="Delinquency Penalty / Interest" value={`+${pesoAmount(penalty)}`} color="#b91c1c" />}
              {discount > 0 && <Row label="Prompt Payment Discount" value={`-${pesoAmount(discount)}`} color="#15803d" />}
              <div style={{ height: 1, backgroundColor: "#cbd5e1", margin: "4px 0" }} />
              <Row label="Net Annual RPT Payable" value={pesoAmount(netPayable)} bold />
              <div
                style={{
                  marginTop: "6px",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  backgroundColor: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: "#065f46", fontSize: "0.85rem" }}>
                    25% Barangay RPT Share (RA 7160 §271)
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#047857" }}>
                    Credited to Barangay General Fund (Account 4-01-02-040)
                  </div>
                </div>
                <div style={{ fontFamily: "monospace", fontWeight: 800, fontSize: "1.05rem", color: "#047857" }}>
                  +{pesoAmount(brgyShare)}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status / Collection Box */}
          {status === "fully_paid" ? (
            <div
              style={{
                padding: "14px 16px",
                borderRadius: "8px",
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#166534",
                fontSize: "0.85rem",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: "4px" }}>
                ✓ FY {taxYear} Real Property Tax Settled
              </div>
              <div>
                Official Receipt: <strong style={{ fontFamily: "monospace" }}>{due?.orNumber || "Issued"}</strong>
                {due?.paidAt ? ` · Paid on ${dateTime(due.paidAt)}` : ""}
              </div>
              <div style={{ marginTop: "8px" }}>
                <Link
                  href="/finance"
                  style={{ color: "#15803d", fontWeight: 600, textDecoration: "underline", fontSize: "0.8rem" }}
                >
                  View posted credit in Treasury & General Ledger →
                </Link>
              </div>
            </div>
          ) : (
            mayCollect && (
              <form
                onSubmit={handleCollect}
                style={{
                  border: "1px solid #bfdbfe",
                  backgroundColor: "#eff6ff",
                  borderRadius: "8px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1e3a8a" }}>
                  💳 Record RPT Share Collection & Post to General Ledger
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#1e40af", marginBottom: 4 }}>
                      Payment Method
                    </label>
                    <select
                      className="cbms-select"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      disabled={payingBusy}
                      style={{ width: "100%", backgroundColor: "#ffffff" }}
                    >
                      <option value="cash">Cash (Over-the-Counter)</option>
                      <option value="check">LGU Treasury Check /remittance</option>
                      <option value="gcash">GCash Digital</option>
                      <option value="maya">Maya Digital</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#1e40af", marginBottom: 4 }}>
                      OR Number (Optional Auto)
                    </label>
                    <input
                      className="cbms-input"
                      value={customOrNumber}
                      onChange={(e) => setCustomOrNumber(e.target.value)}
                      disabled={payingBusy}
                      placeholder="Auto-generated if blank"
                      style={{ width: "100%", backgroundColor: "#ffffff" }}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={payingBusy}
                  className="cbms-button cbms-button--primary"
                  style={{
                    padding: "9px 16px",
                    backgroundColor: payingBusy ? "#93c5fd" : "#1d4ed8",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: 600,
                    cursor: payingBusy ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {payingBusy ? (
                    <>
                      <span className="cbms-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                      <span>Posting Collection & Issuing OR…</span>
                    </>
                  ) : (
                    <span>Post to Ledger & Issue Official Receipt ({pesoAmount(brgyShare)})</span>
                  )}
                </button>
              </form>
            )
          )}
        </div>

        {/* Footer Actions: Edit & Red Delete Record Button */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {mayDelete ? (
            <button
              type="button"
              disabled={payingBusy}
              onClick={() => onDelete(property)}
              style={{
                padding: "8px 14px",
                backgroundColor: "#dc2626",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: payingBusy ? "not-allowed" : "pointer",
              }}
            >
              Delete Record
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              disabled={payingBusy}
              onClick={() => printRptDossier(property, due)}
              className="cbms-button cbms-button--outline"
              style={{
                padding: "8px 14px",
                fontWeight: 600,
                fontSize: "0.85rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                cursor: payingBusy ? "not-allowed" : "pointer",
              }}
            >
              <span>🖨️</span>
              <span>Print</span>
            </button>
            {mayEdit && (
              <button
                type="button"
                disabled={payingBusy}
                onClick={() => onEdit(property)}
                className="cbms-button cbms-button--primary"
                style={{
                  padding: "8px 16px",
                  backgroundColor: "var(--color-primary, #1d4ed8)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: payingBusy ? "not-allowed" : "pointer",
                }}
              >
                Edit Assessment
              </button>
            )}
            <button
              type="button"
              disabled={payingBusy}
              onClick={onClose}
              className="cbms-button cbms-button--outline"
              style={{ padding: "8px 16px" }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  color,
}: {
  label: string;
  value: string;
  bold?: boolean;
  color?: string;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "#475569", fontWeight: bold ? 700 : 500 }}>{label}</span>
      <span
        style={{
          fontFamily: "monospace",
          fontWeight: bold ? 700 : 600,
          color: color || "#0f172a",
        }}
      >
        {value}
      </span>
    </div>
  );
}
