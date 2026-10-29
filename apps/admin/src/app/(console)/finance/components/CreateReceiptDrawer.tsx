"use client";

import * as React from "react";
import { Button } from "@cbms/ui";
import type { CreateReceiptPayload } from "../../../../lib/finance-queries";

export interface CreateReceiptDrawerProps {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateReceiptPayload) => void;
}

export function CreateReceiptDrawer({
  open,
  busy,
  onClose,
  onSubmit,
}: CreateReceiptDrawerProps) {
  const [orNumber, setOrNumber] = React.useState("");
  const [payorName, setPayorName] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [particulars, setParticulars] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("cash");
  const [refType, setRefType] = React.useState("general");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setOrNumber(`OR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`);
      setPayorName("");
      setAmount("");
      setParticulars("");
      setPaymentMethod("cash");
      setRefType("general");
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid receipt amount greater than zero.");
      return;
    }
    if (!orNumber.trim()) {
      setError("Official Receipt (OR#) number is required.");
      return;
    }
    if (!payorName.trim()) {
      setError("Payor name is required.");
      return;
    }
    if (!particulars.trim()) {
      setError("Particulars / reason for collection is required.");
      return;
    }

    onSubmit({
      orNumber: orNumber.trim(),
      payorName: payorName.trim(),
      amount: parsedAmount,
      particulars: particulars.trim(),
      paymentMethod,
      refType,
      issuedAt: new Date().toISOString(),
    });
  };

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
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Issue Official Receipt"
        style={{
          width: "100%",
          maxWidth: "480px",
          height: "100%",
          backgroundColor: "#ffffff",
          boxShadow: "-8px 0 24px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
          animation: "slideInRight 0.25s ease-out",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0a2463" }}>
              Issue Official Receipt (OR)
            </h3>
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
              Auto-records credit in General Ledger
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.25rem",
              cursor: busy ? "not-allowed" : "pointer",
              color: "#64748b",
            }}
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            padding: "20px",
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {error && (
            <div
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                padding: "10px 12px",
                borderRadius: "6px",
                fontSize: "0.85rem",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
              Official Receipt Number (OR#) *
            </label>
            <input
              type="text"
              required
              value={orNumber}
              onChange={(e) => setOrNumber(e.target.value)}
              disabled={busy}
              className="cbms-input"
              style={{ fontFamily: "monospace", fontWeight: 700 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
              Payor / Resident / Business Name *
            </label>
            <input
              type="text"
              required
              value={payorName}
              onChange={(e) => setPayorName(e.target.value)}
              disabled={busy}
              placeholder="e.g. Juan Dela Cruz or Barangka Enterprise"
              className="cbms-input"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
              Amount (PHP ₱) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={busy}
              placeholder="0.00"
              className="cbms-input"
              style={{ fontSize: "1.05rem", fontWeight: 700 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
              Particulars / Collection Nature *
            </label>
            <textarea
              required
              rows={3}
              value={particulars}
              onChange={(e) => setParticulars(e.target.value)}
              disabled={busy}
              placeholder="e.g. Walk-in Barangay Clearance fee, Covered court rental evening slot..."
              className="cbms-textarea"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={busy}
                className="cbms-select"
              >
                <option value="cash">Cash (OTC)</option>
                <option value="gcash">GCash</option>
                <option value="maya">Maya</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
                Collection Category
              </label>
              <select
                value={refType}
                onChange={(e) => setRefType(e.target.value)}
                disabled={busy}
                className="cbms-select"
              >
                <option value="general">General Fee</option>
                <option value="certificate">Barangay Clearance</option>
                <option value="facility_rent">Facility / Gym Rent</option>
                <option value="business_clearance">Business Clearance</option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "auto",
              paddingTop: "16px",
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <Button variant="secondary" type="button" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <button
              type="submit"
              disabled={busy}
              className="cbms-btn cbms-btn--primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 20px",
                fontWeight: 600,
                opacity: busy ? 0.75 : 1,
                cursor: busy ? "not-allowed" : "pointer",
              }}
            >
              {busy ? (
                <>
                  <span className="cbms-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  <span>Issuing…</span>
                </>
              ) : (
                <span>Issue Official Receipt</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
