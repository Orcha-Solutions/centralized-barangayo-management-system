"use client";

import * as React from "react";
import { Alert, Field, pesoAmount } from "@cbms/ui";
import { InhabitantSearchDropdown } from "./InhabitantSearchDropdown";
import type { CertificateType, Inhabitant } from "../../../../lib/types";

export interface CertificateDrawerFormData {
  inhabitantId: string;
  typeId: string;
  purpose: string;
  fee: number;
  paymentMethod: string;
  orNumber: string;
  remarks: string;
}

export interface CertificateDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: CertificateDrawerFormData) => Promise<void>;
  busy: boolean;
  error: string | null;
  certificateTypes: CertificateType[];
  inhabitants?: Inhabitant[];
}

export function CertificateDrawer({
  open,
  onClose,
  onSubmit,
  busy,
  error,
  certificateTypes,
}: CertificateDrawerProps) {
  const [selectedInhabitant, setSelectedInhabitant] = React.useState<Inhabitant | null>(null);
  const [inhabitantId, setInhabitantId] = React.useState("");
  const [typeId, setTypeId] = React.useState(certificateTypes[0]?.id || "ct-clearance");
  const [purpose, setPurpose] = React.useState("");
  const [fee, setFee] = React.useState(certificateTypes[0]?.fee ?? 50);
  const [paymentMethod, setPaymentMethod] = React.useState("otc_cash");
  const [orNumber, setOrNumber] = React.useState("");
  const [remarks, setRemarks] = React.useState("");

  // Reset form when drawer closes
  React.useEffect(() => {
    if (!open) {
      setSelectedInhabitant(null);
      setInhabitantId("");
      setPurpose("");
      setOrNumber("");
      setRemarks("");
    }
  }, [open]);

  // Sync fee when certificate type changes
  const handleTypeChange = (selectedTypeId: string) => {
    setTypeId(selectedTypeId);
    const found = certificateTypes.find((t) => t.id === selectedTypeId);
    if (found) {
      setFee(found.fee);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inhabitantId) return;
    await onSubmit({
      inhabitantId,
      typeId,
      purpose: purpose.trim(),
      fee: Number(fee) || 0,
      paymentMethod,
      orNumber: orNumber.trim(),
      remarks: remarks.trim(),
    });
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.45)",
        zIndex: 1500,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "540px",
          backgroundColor: "#ffffff",
          height: "100%",
          boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--color-border, #e2e8f0)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold", color: "#1b2430" }}>
              📄 New Clearance Request
            </h3>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
              Official Citizen Certificate Issuance
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            ×
          </button>
        </div>

        {/* Form Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {error && (
            <div style={{ marginBottom: "1rem" }}>
              <Alert tone="danger">{error}</Alert>
            </div>
          )}

          <form id="cert-form" onSubmit={handleSubmit}>
            {/* Applicant Citizen Selection with Lazy-Loaded Search */}
            <Field
              label="Applicant Resident / Inhabitant *"
              hint="Search by resident name, PhilSys Card Number (PCN), or contact phone"
            >
              <div style={{ marginTop: "0.25rem" }}>
                <InhabitantSearchDropdown
                  selectedInhabitant={selectedInhabitant}
                  onSelect={(inh) => {
                    setSelectedInhabitant(inh);
                    setInhabitantId(inh.id);
                  }}
                  onClear={() => {
                    setSelectedInhabitant(null);
                    setInhabitantId("");
                  }}
                  disabled={busy}
                />
              </div>
            </Field>

            {/* Certificate Type */}
            <div style={{ marginTop: "1rem" }}>
              <Field label="Document / Certificate Type *">
                <select
                  className="cbms-select"
                  value={typeId}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  style={{ width: "100%" }}
                >
                  {certificateTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({pesoAmount(t.fee)})
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Purpose */}
            <div style={{ marginTop: "1rem" }}>
              <Field label="Purpose *">
                <input
                  type="text"
                  className="cbms-input"
                  placeholder="e.g., Employment, Scholarship, Postal ID, Bank Account..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                  minLength={3}
                  style={{ width: "100%" }}
                />
              </Field>
            </div>

            {/* Fee & Payment Method Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
              <Field label="Assessed Fee (₱)">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="cbms-input"
                  value={fee}
                  onChange={(e) => setFee(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
              </Field>
              <Field label="Payment Method">
                <select
                  className="cbms-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ width: "100%" }}
                >
                  <option value="otc_cash">Over-the-Counter (Cash)</option>
                  <option value="wallet">Barangay E-Wallet</option>
                  <option value="waived">Statutory Waived (Indigent / First Time Jobseeker)</option>
                </select>
              </Field>
            </div>

            {/* Official Receipt Number */}
            <div style={{ marginTop: "1rem" }}>
              <Field label="Official Receipt (OR) Number" hint="Optional if fee is waived or collected later">
                <input
                  type="text"
                  className="cbms-input"
                  placeholder="e.g. OR-2026-94812"
                  value={orNumber}
                  onChange={(e) => setOrNumber(e.target.value)}
                  style={{ width: "100%" }}
                />
              </Field>
            </div>

            {/* Remarks */}
            <div style={{ marginTop: "1rem" }}>
              <Field label="Remarks / Special Notes">
                <textarea
                  className="cbms-input"
                  rows={3}
                  placeholder="Optional internal remarks or compliance instructions..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  style={{ width: "100%" }}
                />
              </Field>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid var(--color-border, #e2e8f0)",
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
          }}
        >
          <button
            type="button"
            className="cbms-btn"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="cert-form"
            className="cbms-btn cbms-btn--primary"
            disabled={!inhabitantId || purpose.trim().length < 3 || busy}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            {busy && <span style={{ animation: "spin 1s linear infinite" }}>🔄</span>}
            {busy ? "Submitting..." : "Submit Clearance Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
