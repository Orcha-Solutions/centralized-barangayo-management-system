"use client";

import * as React from "react";
import { Field, pesoAmount } from "@cbms/ui";
import type { StatutoryFundItem } from "./BudgetFloorGauges";

export interface CreateObligationPayload {
  ppaCode: string;
  title: string;
  fund: "bdf" | "bdrrmf" | "sk" | "gad" | "general";
  particulars: string;
  payee: string;
  amount: number;
}

export function CreateObligationDrawer({
  open,
  busy = false,
  funds,
  onClose,
  onSubmit,
}: {
  open: boolean;
  busy?: boolean;
  funds: StatutoryFundItem[];
  onClose: () => void;
  onSubmit: (payload: CreateObligationPayload) => void;
}) {
  const [ppaCode, setPpaCode] = React.useState("2000-05");
  const [title, setTitle] = React.useState("");
  const [fund, setFund] = React.useState<"bdf" | "bdrrmf" | "sk" | "gad" | "general">("bdf");
  const [payee, setPayee] = React.useState("");
  const [particulars, setParticulars] = React.useState("");
  const [amountStr, setAmountStr] = React.useState("");
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setTitle("");
      setPayee("");
      setParticulars("");
      setAmountStr("");
      setError(null);
      setShowConfirmModal(false);
    }
  }, [open]);

  if (!open) return null;

  const currentFund = funds.find((f) => f.id === fund);
  const availableBal = currentFund?.balanceAmount ?? 0;
  const numAmount = Number(amountStr) || 0;
  const isOverCeiling = numAmount > availableBal && availableBal > 0;

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Project / Activity Title is required.");
      return;
    }
    if (!payee.trim()) {
      setError("Payee / Supplier Name is required.");
      return;
    }
    if (numAmount <= 0) {
      setError("Obligation Amount must be greater than ₱0.");
      return;
    }
    if (isOverCeiling) {
      setError(`Amount exceeds the remaining statutory balance of ${pesoAmount(availableBal)} for ${currentFund?.name}.`);
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    onSubmit({
      ppaCode: ppaCode.trim(),
      title: title.trim(),
      fund,
      particulars: particulars.trim(),
      payee: payee.trim(),
      amount: numAmount,
    });
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.5)",
          backdropFilter: "blur(2px)",
          zIndex: 2000,
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
          style={{
            width: "100%",
            maxWidth: "520px",
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
              padding: "16px 20px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#f8fafc",
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
                Record Statutory Obligation (RAAO)
              </h3>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                Obligate and commit funds pursuant to RA 7160 §324-325
              </p>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={onClose}
              style={{ background: "none", border: "none", fontSize: "1.25rem", color: "#64748b", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>

          {/* Form Body */}
          <form
            onSubmit={handlePreSubmit}
            style={{ padding: "20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {error && (
              <div
                style={{
                  padding: "10px 12px",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "6px",
                  color: "#991b1b",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "12px" }}>
              <Field label="PPA / Ref Code *">
                <input
                  className="cbms-input"
                  value={ppaCode}
                  onChange={(e) => setPpaCode(e.target.value)}
                  placeholder="e.g. 2000-05"
                  required
                />
              </Field>
              <Field label="Statutory Fund *">
                <select
                  className="cbms-select"
                  value={fund}
                  onChange={(e) => setFund(e.target.value as any)}
                >
                  <option value="bdf">20% Development Fund (BDF)</option>
                  <option value="bdrrmf">5% Disaster Management (BDRRMF)</option>
                  <option value="sk">10% Sangguniang Kabataan (SK)</option>
                  <option value="gad">5% Gender & Development (GAD)</option>
                  <option value="general">General Fund (PS / MOOE)</option>
                </select>
              </Field>
            </div>

            {/* Statutory Ceiling Warning Box */}
            <div
              style={{
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid",
                borderColor: isOverCeiling ? "#fca5a5" : "#bae6fd",
                backgroundColor: isOverCeiling ? "#fef2f2" : "#f0f9ff",
                color: isOverCeiling ? "#991b1b" : "#0369a1",
                fontSize: "0.82rem",
              }}
            >
              <div style={{ fontWeight: 600 }}>
                {isOverCeiling ? "⚠️ Budget Ceiling Exceeded!" : "✓ Statutory Ceiling Status:"}
              </div>
              <div style={{ marginTop: "2px" }}>
                Remaining Available Balance in {currentFund?.name}:{" "}
                <strong style={{ fontFamily: "monospace" }}>{pesoAmount(availableBal)}</strong>
              </div>
            </div>

            <Field label="Program / Project / Activity Title *">
              <input
                className="cbms-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Installation of Solar Streetlights along Bonifacio St."
                required
              />
            </Field>

            <Field label="Payee / Contractor / Supplier *">
              <input
                className="cbms-input"
                value={payee}
                onChange={(e) => setPayee(e.target.value)}
                placeholder="e.g. Enercon Solar Systems Corp."
                required
              />
            </Field>

            <Field label="Obligation Amount (PHP ₱) *">
              <input
                type="number"
                step="0.01"
                min="1"
                className="cbms-input"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0.00"
                style={{ fontSize: "1rem", fontWeight: 700 }}
                required
              />
            </Field>

            <Field label="Particulars / Specifications">
              <textarea
                className="cbms-input"
                rows={3}
                value={particulars}
                onChange={(e) => setParticulars(e.target.value)}
                placeholder="Provide procurement details, resolution number, or milestone..."
                style={{ resize: "vertical" }}
              />
            </Field>

            {/* Footer Buttons */}
            <div
              style={{
                marginTop: "auto",
                paddingTop: "16px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="cbms-button cbms-button--outline"
                style={{ padding: "8px 16px" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy || isOverCeiling}
                className="cbms-button cbms-button--primary"
                style={{
                  padding: "8px 18px",
                  backgroundColor: isOverCeiling ? "#94a3b8" : "var(--color-primary, #1d4ed8)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: 600,
                  cursor: isOverCeiling ? "not-allowed" : "pointer",
                }}
              >
                Commit & Obligate
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Warning Confirmation Popup */}
      {showConfirmModal && (
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
            if (e.target === e.currentTarget && !busy) setShowConfirmModal(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "10px",
              border: "1px solid #fde68a",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.25)",
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
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#92400e" }}>
                  Confirm Statutory Obligation
                </h3>
                <p style={{ margin: "2px 0 0 0", fontSize: "0.82rem", color: "#64748b" }}>
                  Commitment against Barangay Appropriation
                </p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "0.84rem",
                color: "#92400e",
              }}
            >
              <strong>Warning:</strong> You are about to obligate{" "}
              <strong>{pesoAmount(numAmount)}</strong> from the{" "}
              <strong>{currentFund?.name}</strong>. This commitment will legally deduct from the remaining available appropriation.
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                fontSize: "0.85rem",
                backgroundColor: "#f8fafc",
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div>Project: <strong>{title}</strong></div>
              <div>Payee: <strong>{payee}</strong></div>
              <div>New Remaining Balance: <strong style={{ color: "#059669" }}>{pesoAmount(availableBal - numAmount)}</strong></div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={busy}
                className="cbms-button cbms-button--outline"
                style={{ padding: "8px 16px" }}
              >
                Back to Form
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={busy}
                className="cbms-button cbms-button--primary"
                style={{
                  padding: "8px 18px",
                  backgroundColor: "var(--color-primary, #1d4ed8)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {busy ? "Saving…" : "Confirm & Save Obligation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
