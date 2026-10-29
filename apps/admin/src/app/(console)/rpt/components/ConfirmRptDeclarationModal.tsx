"use client";

import * as React from "react";
import { pesoAmount, titleize } from "@cbms/ui";
import type { CreateRptPropertyPayload, RptPropertyItem } from "../../../../lib/rpt-queries";

export interface ConfirmRptDeclarationModalProps {
  open: boolean;
  busy: boolean;
  isEdit: boolean;
  payload: CreateRptPropertyPayload | null;
  existingProperty?: RptPropertyItem | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmRptDeclarationModal({
  open,
  busy,
  isEdit,
  payload,
  existingProperty,
  onCancel,
  onConfirm,
}: ConfirmRptDeclarationModalProps) {
  if (!open || !payload) return null;

  const marketPesos = Math.round((payload.marketValueCentavos ?? 0) / 100);
  const assessedPesos = Math.round((payload.assessedValueCentavos ?? 0) / 100);
  const estBasicTax = Math.round(assessedPesos * 0.01);
  const estBrgyShare = Math.round(estBasicTax * 0.25);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(2px)",
        zIndex: 2600,
        display: "grid",
        placeItems: "center",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-rpt-declaration-title"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          border: "1px solid #fde68a",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.25)",
          width: "100%",
          maxWidth: "480px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Modal Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              backgroundColor: "#fef3c7",
              border: "1px solid #fde68a",
              display: "grid",
              placeItems: "center",
              fontSize: "1.35rem",
              flexShrink: 0,
            }}
          >
            ⚠️
          </div>
          <div>
            <h3
              id="confirm-rpt-declaration-title"
              style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#92400e" }}
            >
              {isEdit ? "Confirm Edit Assessment" : "Confirm Property Declaration"}
            </h3>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.82rem", color: "#64748b" }}>
              {isEdit
                ? "Official revision to the Barangay RPT Assessment Roll"
                : "Official enrollment into the Barangay RPT Assessment Roll (RA 7160)"}
            </p>
          </div>
        </div>

        {/* Warning Box */}
        <div
          style={{
            backgroundColor: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "8px",
            padding: "12px 14px",
            fontSize: "0.84rem",
            color: "#92400e",
            lineHeight: 1.5,
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>
            {isEdit
              ? "Warning: You are about to modify an official Real Property Tax assessment record. Please verify that the updated valuation and taxpayer details match the Assessor's Tax Declaration."
              : "Warning: Declaring this property will officially record the Tax Declaration Number (TDN) in the Barangay Assessment Roll and generate its statutory annual RPT tax due."}
          </p>
        </div>

        {/* Summary Details */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            fontSize: "0.84rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
            <span style={{ color: "#64748b" }}>Tax Declaration No.:</span>
            <strong style={{ color: "#0f172a", fontFamily: "monospace" }}>
              {payload.taxDeclarationNo}
            </strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
            <span style={{ color: "#64748b" }}>Registered Owner:</span>
            <strong style={{ color: "#0f172a", textAlign: "right" }}>{payload.ownerName}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
            <span style={{ color: "#64748b" }}>Classification & Purok:</span>
            <strong style={{ color: "#0f172a" }}>
              {titleize(payload.propertyType)} · {payload.purok}
            </strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
            <span style={{ color: "#64748b" }}>Fair Market Value:</span>
            <strong style={{ color: "#0f172a", fontFamily: "monospace" }}>
              {pesoAmount(marketPesos)}
            </strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
            <span style={{ color: "#64748b" }}>Assessed Value:</span>
            <strong style={{ color: "#1d4ed8", fontFamily: "monospace" }}>
              {isEdit &&
              existingProperty &&
              existingProperty.assessedValue !== assessedPesos
                ? `${pesoAmount(existingProperty.assessedValue)} → ${pesoAmount(assessedPesos)}`
                : pesoAmount(assessedPesos)}
            </strong>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "8px",
              paddingTop: "6px",
              borderTop: "1px dashed #cbd5e1",
            }}
          >
            <span style={{ color: "#047857", fontWeight: 600 }}>25% Barangay Share:</span>
            <strong style={{ color: "#047857", fontFamily: "monospace" }}>
              +{pesoAmount(estBrgyShare)} / yr
            </strong>
          </div>
        </div>

        {/* Footer Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="cbms-button cbms-button--outline"
            style={{ padding: "8px 16px" }}
          >
            Back to Form
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="cbms-button cbms-button--primary"
            style={{
              padding: "8px 18px",
              backgroundColor: busy ? "#93c5fd" : "var(--color-primary, #1d4ed8)",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontWeight: 600,
              cursor: busy ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {busy ? (
              <>
                <span className="cbms-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                <span>{isEdit ? "Saving Changes…" : "Declaring Property…"}</span>
              </>
            ) : (
              <span>{isEdit ? "Confirm & Save Assessment" : "Confirm & Declare Property"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
