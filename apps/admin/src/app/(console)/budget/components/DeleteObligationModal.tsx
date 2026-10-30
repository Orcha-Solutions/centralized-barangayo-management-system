"use client";

import * as React from "react";
import type { ObligationItem } from "./BudgetTable";

export interface DeleteObligationModalProps {
  open: boolean;
  busy: boolean;
  item: ObligationItem | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteObligationModal({
  open,
  busy,
  item,
  onCancel,
  onConfirm,
}: DeleteObligationModalProps) {
  const [typedConfirmation, setTypedConfirmation] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setTypedConfirmation("");
    }
  }, [open]);

  if (!open || !item) return null;

  // The user can type the ppaCode (e.g. "2000-01") or "DELETE"
  const targetCode = item.ppaCode || "DELETE";
  const isMatch =
    typedConfirmation.trim().toLowerCase() === targetCode.toLowerCase() ||
    typedConfirmation.trim().toUpperCase() === "DELETE" ||
    typedConfirmation.trim().toLowerCase() === item.title.trim().toLowerCase();

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
        aria-labelledby="delete-obligation-title"
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
              id="delete-obligation-title"
              style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#991b1b" }}
            >
              Cancel Statutory Obligation
            </h3>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
              Budget authorization cancellation & de-obligation
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
          <strong>Warning:</strong> You are about to cancel obligation{" "}
          <code style={{ fontWeight: 700 }}>{item.ppaCode}</code> ({item.title}) for{" "}
          <strong>₱{item.obligatedAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</strong>.
          This will restore the unobligated balance back to the sector fund.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
            Type <code style={{ color: "#991b1b", fontWeight: 700 }}>{targetCode}</code> or{" "}
            <code>DELETE</code> to confirm:
          </label>
          <input
            type="text"
            className="cbms-input"
            value={typedConfirmation}
            onChange={(e) => setTypedConfirmation(e.target.value)}
            disabled={busy}
            placeholder={`Type "${targetCode}" to confirm...`}
            autoFocus
            style={{ borderColor: isMatch ? "#16a34a" : "#cbd5e1" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
          <button
            type="button"
            className="cbms-btn cbms-btn--secondary"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="cbms-btn cbms-btn--danger"
            onClick={onConfirm}
            disabled={!isMatch || busy}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: isMatch && !busy ? "#dc2626" : "#fca5a5",
              color: "#ffffff",
              cursor: isMatch && !busy ? "pointer" : "not-allowed",
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              fontWeight: 600,
            }}
          >
            {busy && (
              <span
                style={{
                  display: "inline-block",
                  width: "14px",
                  height: "14px",
                  border: "2px solid #ffffff",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "cbms-spin 0.8s linear infinite",
                }}
              />
            )}
            <span>{busy ? "Cancelling..." : "Confirm De-Obligation"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
