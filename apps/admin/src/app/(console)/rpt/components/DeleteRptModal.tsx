"use client";

import * as React from "react";
import { pesoAmount, titleize } from "@cbms/ui";
import type { RptPropertyItem } from "../../../../lib/rpt-queries";

export interface DeleteRptModalProps {
  open: boolean;
  busy: boolean;
  property: RptPropertyItem | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteRptModal({
  open,
  busy,
  property,
  onCancel,
  onConfirm,
}: DeleteRptModalProps) {
  const [typedConfirmation, setTypedConfirmation] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setTypedConfirmation("");
    }
  }, [open]);

  if (!open || !property) return null;

  const targetTdn = property.taxDeclarationNo.trim();
  const targetOwner = property.ownerName.trim();
  const trimmedInput = typedConfirmation.trim().toLowerCase();

  const isMatch =
    trimmedInput === targetTdn.toLowerCase() ||
    trimmedInput === targetOwner.toLowerCase();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(2px)",
        zIndex: 2500,
        display: "grid",
        placeItems: "center",
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
        aria-labelledby="delete-rpt-title"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          border: "1px solid #fee2e2",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
          width: "100%",
          maxWidth: "480px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "1.75rem" }}>⚠️</span>
          <div>
            <h3
              id="delete-rpt-title"
              style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#991b1b" }}
            >
              Confirm Property Declaration Deletion
            </h3>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
              Permanent RPT declaration & tax due removal
            </p>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            padding: "12px 14px",
            fontSize: "0.85rem",
            color: "#991b1b",
            lineHeight: 1.5,
          }}
        >
          <p style={{ margin: "0 0 6px 0", fontWeight: 600 }}>
            Warning: You are about to permanently delete this Real Property Tax declaration and all associated annual tax dues:
          </p>
          <ul style={{ margin: 0, paddingLeft: "18px" }}>
            <li>
              <strong>Tax Declaration No.:</strong> {property.taxDeclarationNo}
            </li>
            <li>
              <strong>Registered Owner:</strong> {property.ownerName}
            </li>
            <li>
              <strong>Classification & Value:</strong> {titleize(property.propertyType)} —{" "}
              {pesoAmount(property.assessedValue)}
            </li>
          </ul>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            htmlFor="confirm-rpt-delete-input"
            style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}
          >
            To confirm deletion, type <code>{targetTdn}</code> or <code>{targetOwner}</code> below:
          </label>
          <input
            id="confirm-rpt-delete-input"
            type="text"
            className="cbms-input"
            value={typedConfirmation}
            onChange={(e) => setTypedConfirmation(e.target.value)}
            placeholder={`Type "${targetTdn}"`}
            disabled={busy}
            style={{
              borderColor: isMatch ? "#16a34a" : "#cbd5e1",
              backgroundColor: isMatch ? "#f0fdf4" : "#ffffff",
              padding: "8px 12px",
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="cbms-button cbms-button--outline"
            style={{ padding: "8px 16px" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!isMatch || busy}
            className="cbms-button cbms-button--danger"
            style={{
              padding: "8px 18px",
              backgroundColor: isMatch && !busy ? "#dc2626" : "#fca5a5",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontWeight: 600,
              cursor: isMatch && !busy ? "pointer" : "not-allowed",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {busy ? (
              <>
                <span className="cbms-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                <span>Deleting…</span>
              </>
            ) : (
              <span>Permanently Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
