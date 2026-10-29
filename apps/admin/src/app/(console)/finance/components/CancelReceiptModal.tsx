"use client";

import * as React from "react";
import type { OfficialReceipt } from "../../../../lib/types";

export interface CancelReceiptModalProps {
  open: boolean;
  busy: boolean;
  receipt: OfficialReceipt | null;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

export function CancelReceiptModal({
  open,
  busy,
  receipt,
  onCancel,
  onConfirm,
}: CancelReceiptModalProps) {
  const [reason, setReason] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open]);

  if (!open || !receipt) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  };

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
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-receipt-title"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          border: "1px solid #fee2e2",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
          width: "100%",
          maxWidth: "460px",
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
              id="cancel-receipt-title"
              style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#991b1b" }}
            >
              Void Official Receipt
            </h3>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
              OR #{receipt.orNumber} — {receipt.payorName}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="cancel-receipt-reason" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
              Reason for Cancellation / Voiding *
            </label>
            <textarea
              id="cancel-receipt-reason"
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={busy}
              placeholder="e.g. Erroneous encoding, printer jam, spoiled paper, payment returned..."
              className="cbms-textarea"
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
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
              type="submit"
              disabled={!reason.trim() || busy}
              className="cbms-button cbms-button--danger"
              style={{
                padding: "8px 18px",
                backgroundColor: reason.trim() && !busy ? "#dc2626" : "#fca5a5",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontWeight: 600,
                cursor: reason.trim() && !busy ? "pointer" : "not-allowed",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {busy ? (
                <>
                  <span className="cbms-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  <span>Voiding…</span>
                </>
              ) : (
                <span>Confirm Void</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
