"use client";

import * as React from "react";
import { Button } from "@cbms/ui";
import { COA_ACCOUNTS } from "../../../../lib/chart-of-accounts";
import type { CreateLedgerPayload } from "../../../../lib/finance-queries";

export interface CreateLedgerDrawerProps {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateLedgerPayload) => void;
}

export function CreateLedgerDrawer({
  open,
  busy,
  onClose,
  onSubmit,
}: CreateLedgerDrawerProps) {
  const [direction, setDirection] = React.useState<"credit" | "debit">("credit");
  const [fund, setFund] = React.useState("general");
  const [accountCode, setAccountCode] = React.useState("4-01-01-010");
  const [description, setDescription] = React.useState("");
  const [amount, setAmount] = React.useState<string>("");
  const [orNumber, setOrNumber] = React.useState("");
  const [dvNumber, setDvNumber] = React.useState("");
  const [checkNumber, setCheckNumber] = React.useState("");
  const [payorPayee, setPayorPayee] = React.useState("");
  const [postedAt, setPostedAt] = React.useState<string>(new Date().toISOString().slice(0, 16));
  const [error, setError] = React.useState<string | null>(null);

  const parsedAmount = parseFloat(amount || "0");

  React.useEffect(() => {
    if (open) {
      setDirection("credit");
      setFund("general");
      setAccountCode("4-02-01-040");
      setDescription("");
      setAmount("");
      setOrNumber("");
      setDvNumber("");
      setCheckNumber("");
      setPayorPayee("");
      setPostedAt(new Date().toISOString().slice(0, 16));
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  const handleDirectionChange = (newDir: "credit" | "debit") => {
    setDirection(newDir);
    if (newDir === "credit") {
      setAccountCode("4-02-01-040");
      setFund("general");
    } else {
      setAccountCode("5-01-01-010");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a description for the transaction.");
      return;
    }

    if (!accountCode.trim()) {
      setError("Account Code is required.");
      return;
    }

    onSubmit({
      postedAt: postedAt ? new Date(postedAt).toISOString() : new Date().toISOString(),
      fund,
      accountCode: accountCode.trim(),
      description: description.trim(),
      direction,
      amount: parsedAmount,
      orNumber: direction === "credit" && orNumber.trim() ? orNumber.trim() : null,
      dvNumber: direction === "debit" && dvNumber.trim() ? dvNumber.trim() : null,
      checkNumber: direction === "debit" && checkNumber.trim() ? checkNumber.trim() : null,
      refType: direction === "credit" ? "collection" : "disbursement",
      payorPayee: payorPayee.trim() || undefined,
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
        aria-label="Record New Transaction"
        style={{
          width: "100%",
          maxWidth: "520px",
          height: "100%",
          backgroundColor: "#ffffff",
          boxShadow: "-8px 0 24px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
          animation: "slideInRight 0.25s ease-out",
        }}
      >
        {/* Drawer Header */}
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
              Record Financial Transaction
            </h3>
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
              Double-Entry General Ledger Voucher Entry
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

        {/* Drawer Body Form */}
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

          {/* Transaction Flow Selection */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
              Transaction Direction
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <button
                type="button"
                onClick={() => handleDirectionChange("credit")}
                disabled={busy}
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: direction === "credit" ? "2px solid #16a34a" : "1px solid #cbd5e1",
                  backgroundColor: direction === "credit" ? "#f0fdf4" : "#ffffff",
                  color: direction === "credit" ? "#166534" : "#475569",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: busy ? "not-allowed" : "pointer",
                }}
              >
                🟢 Collection / Inflow (Credit)
              </button>
              <button
                type="button"
                onClick={() => handleDirectionChange("debit")}
                disabled={busy}
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: direction === "debit" ? "2px solid #dc2626" : "1px solid #cbd5e1",
                  backgroundColor: direction === "debit" ? "#fef2f2" : "#ffffff",
                  color: direction === "debit" ? "#991b1b" : "#475569",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: busy ? "not-allowed" : "pointer",
                }}
              >
                🔴 Spending / Outflow (Debit)
              </button>
            </div>
          </div>

          {/* Fund Source */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
              Barangay Fund Account
            </label>
            <select
              value={fund}
              onChange={(e) => setFund(e.target.value)}
              disabled={busy}
              className="cbms-select"
            >
              <option value="general">General Fund (GF)</option>
              <option value="trust">Trust Fund</option>
              <option value="special">Special Purpose Fund</option>
            </select>
          </div>

          {/* Account Category & COA Code */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
              Accounting Classification & COA Code *
            </label>
            <select
              value={accountCode}
              onChange={(e) => {
                const selectedCode = e.target.value;
                setAccountCode(selectedCode);
                const match = COA_ACCOUNTS.find((c) => c.code === selectedCode);
                if (match?.defaultFund) {
                  setFund(match.defaultFund);
                }
              }}
              disabled={busy}
              className="cbms-select"
            >
              {COA_ACCOUNTS.filter((c) => c.direction === direction).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
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
              style={{ fontSize: "1rem", fontWeight: 700 }}
            />
          </div>

          {/* Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
              Transaction Description *
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={busy}
              placeholder="e.g. Monthly tanod honoraria, streetlighting bill, court rent..."
              className="cbms-textarea"
            />
          </div>

          {/* Payee / Payor */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
              {direction === "credit" ? "Payor / Citizen" : "Payee / Supplier / Beneficiary"}
            </label>
            <input
              type="text"
              value={payorPayee}
              onChange={(e) => setPayorPayee(e.target.value)}
              disabled={busy}
              placeholder={direction === "credit" ? "Name of resident or business" : "Supplier or payee name"}
              className="cbms-input"
            />
          </div>

          {/* Document References */}
          {direction === "credit" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
                Official Receipt Number (OR#)
              </label>
              <input
                type="text"
                value={orNumber}
                onChange={(e) => setOrNumber(e.target.value)}
                disabled={busy}
                placeholder="e.g. OR-2026-88001"
                className="cbms-input"
              />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
                  Disbursement Voucher (DV#)
                </label>
                <input
                  type="text"
                  value={dvNumber}
                  onChange={(e) => setDvNumber(e.target.value)}
                  disabled={busy}
                  placeholder="e.g. DV-2026-0105"
                  className="cbms-input"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
                  Check / Reference #
                </label>
                <input
                  type="text"
                  value={checkNumber}
                  onChange={(e) => setCheckNumber(e.target.value)}
                  disabled={busy}
                  placeholder="e.g. CHK-LBP-9981"
                  className="cbms-input"
                />
              </div>
            </div>
          )}

          {/* Date & Time */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
              Transaction Date & Time
            </label>
            <input
              type="datetime-local"
              value={postedAt}
              onChange={(e) => setPostedAt(e.target.value)}
              disabled={busy}
              className="cbms-input"
            />
          </div>

          {/* Drawer Footer Buttons */}
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
                  <span>Recording…</span>
                </>
              ) : (
                <span>Post to Ledger</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
