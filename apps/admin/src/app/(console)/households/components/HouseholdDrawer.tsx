"use client";

import * as React from "react";
import { Alert, Field } from "@cbms/ui";
import { useCreateHouseholdMutation } from "../../../../lib/households-queries";
import type { Household } from "../../../../lib/types";

export interface HouseholdDrawerProps {
  open: boolean;
  onClose: () => void;
  puroksList: string[];
  onSuccess: (created: Household) => void;
}

export function HouseholdDrawer({
  open,
  onClose,
  puroksList,
  onSuccess,
}: HouseholdDrawerProps) {
  const [form, setForm] = React.useState({
    householdNo: "",
    householdName: "",
    householdType: "nuclear",
    tenureStatus: "owner",
    housingUnit: "single_house",
    monthlyIncome: "",
    purok: puroksList[0] || "Purok 1",
    sitio: "",
    houseNo: "",
    blockNo: "",
    lotNo: "",
    street: "",
    addressLine: "",
    latitude: "",
    longitude: "",
  });

  const [formError, setFormError] = React.useState<string | null>(null);

  const createMutation = useCreateHouseholdMutation();
  const busy = createMutation.isPending;

  React.useEffect(() => {
    if (open) {
      setFormError(null);
      setForm({
        householdNo: "",
        householdName: "",
        householdType: "nuclear",
        tenureStatus: "owner",
        housingUnit: "single_house",
        monthlyIncome: "",
        purok: puroksList[0] || "Purok 1",
        sitio: "",
        houseNo: "",
        blockNo: "",
        lotNo: "",
        street: "",
        addressLine: "",
        latitude: "",
        longitude: "",
      });
    }
  }, [open, puroksList]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const hhNo = form.householdNo.trim();
    if (!hhNo) {
      setFormError("Household Number is required (DILG BIMS Form A1)");
      return;
    }

    try {
      const addressParts: string[] = [];
      if (form.houseNo.trim()) addressParts.push(`#${form.houseNo.trim()}`);
      if (form.blockNo.trim()) addressParts.push(`Blk ${form.blockNo.trim()}`);
      if (form.lotNo.trim()) addressParts.push(`Lot ${form.lotNo.trim()}`);
      if (form.street.trim()) addressParts.push(form.street.trim());
      if (form.sitio.trim()) addressParts.push(form.sitio.trim());
      if (form.purok.trim()) addressParts.push(form.purok.trim());
      const fallbackAddress = addressParts.join(", ") || form.purok;

      const payload: Partial<Household> = {
        householdNo: hhNo,
        householdName: form.householdName.trim() || undefined,
        householdType: form.householdType,
        tenureStatus: form.tenureStatus,
        housingUnit: form.housingUnit,
        monthlyIncome: form.monthlyIncome ? parseFloat(form.monthlyIncome) : 0,
        purok: form.purok,
        sitio: form.sitio.trim() || undefined,
        houseNo: form.houseNo.trim() || undefined,
        blockNo: form.blockNo.trim() || undefined,
        lotNo: form.lotNo.trim() || undefined,
        street: form.street.trim() || undefined,
        addressLine: form.addressLine.trim() || fallbackAddress,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      };

      const result = await createMutation.mutateAsync(payload);
      onSuccess(result);
      onClose();
    } catch (err: any) {
      setFormError(err?.message || "Failed to create household record.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
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
          maxWidth: "480px",
          height: "100%",
          backgroundColor: "var(--color-bg-card, #ffffff)",
          boxShadow: "-8px 0 25px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
        }}
      >
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
            <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--cbms-navy, #0a2463)" }}>
              🏠 Register New Household
            </h2>
            <p style={{ margin: "3px 0 0 0", fontSize: "0.82rem", color: "var(--cbms-muted, #64748b)" }}>
              DILG BIMS Form A1 Domestic Registry
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              lineHeight: 1,
              cursor: busy ? "not-allowed" : "pointer",
              color: "#94a3b8",
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {formError && <Alert tone="danger">{formError}</Alert>}

            <Field label="Household Control No.*" hint="Official unique household identifier">
              <input
                className="cbms-input"
                placeholder="e.g. HH-2026-0042"
                value={form.householdNo}
                disabled={busy}
                onChange={(e) => setForm({ ...form, householdNo: e.target.value })}
                required
              />
            </Field>

            <Field label="Household / Family Name" hint="e.g. Dela Cruz Family">
              <input
                className="cbms-input"
                placeholder="Family or Head surname"
                value={form.householdName}
                disabled={busy}
                onChange={(e) => setForm({ ...form, householdName: e.target.value })}
              />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <Field label="Household Type">
                <select
                  className="cbms-select"
                  value={form.householdType}
                  disabled={busy}
                  onChange={(e) => setForm({ ...form, householdType: e.target.value })}
                >
                  <option value="nuclear">Nuclear Family</option>
                  <option value="extended">Extended Family</option>
                  <option value="single">Single Person</option>
                  <option value="composite">Composite</option>
                  <option value="joint">Joint Family</option>
                  <option value="other">Other</option>
                </select>
              </Field>

              <Field label="Tenure Status">
                <select
                  className="cbms-select"
                  value={form.tenureStatus}
                  disabled={busy}
                  onChange={(e) => setForm({ ...form, tenureStatus: e.target.value })}
                >
                  <option value="owner">Owner</option>
                  <option value="renter">Renter</option>
                  <option value="sharer">Sharer</option>
                  <option value="informal_settler">Informal Settler</option>
                  <option value="caretaker">Caretaker</option>
                  <option value="other">Other</option>
                </select>
              </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <Field label="Housing Unit">
                <select
                  className="cbms-select"
                  value={form.housingUnit}
                  disabled={busy}
                  onChange={(e) => setForm({ ...form, housingUnit: e.target.value })}
                >
                  <option value="single_house">Single House</option>
                  <option value="duplex">Duplex</option>
                  <option value="multi_unit">Multi-Unit / Apartment</option>
                  <option value="commercial">Commercial Unit</option>
                  <option value="makeshift">Makeshift</option>
                  <option value="other">Other</option>
                </select>
              </Field>

              <Field label="Purok / Zone*">
                <select
                  className="cbms-select"
                  value={form.purok}
                  disabled={busy}
                  onChange={(e) => setForm({ ...form, purok: e.target.value })}
                >
                  {puroksList.length > 0 ? (
                    puroksList.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Purok 1">Purok 1</option>
                      <option value="Purok 2">Purok 2</option>
                      <option value="Purok 3">Purok 3</option>
                    </>
                  )}
                </select>
              </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <Field label="Subzone / Sitio">
                <input
                  className="cbms-input"
                  placeholder="e.g. Sitio Riverside"
                  value={form.sitio}
                  disabled={busy}
                  onChange={(e) => setForm({ ...form, sitio: e.target.value })}
                />
              </Field>

              <Field label="Street Address">
                <input
                  className="cbms-input"
                  placeholder="e.g. Bonifacio St."
                  value={form.street}
                  disabled={busy}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                />
              </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
              <Field label="House No.">
                <input
                  className="cbms-input"
                  placeholder="e.g. 142"
                  value={form.houseNo}
                  disabled={busy}
                  onChange={(e) => setForm({ ...form, houseNo: e.target.value })}
                />
              </Field>
              <Field label="Block No.">
                <input
                  className="cbms-input"
                  placeholder="e.g. 12"
                  value={form.blockNo}
                  disabled={busy}
                  onChange={(e) => setForm({ ...form, blockNo: e.target.value })}
                />
              </Field>
              <Field label="Lot No.">
                <input
                  className="cbms-input"
                  placeholder="e.g. 8"
                  value={form.lotNo}
                  disabled={busy}
                  onChange={(e) => setForm({ ...form, lotNo: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Full Address Line" hint="Leave blank to auto-compose from components">
              <input
                className="cbms-input"
                placeholder="e.g. #142 Bonifacio St., Sitio Riverside, Purok 1"
                value={form.addressLine}
                disabled={busy}
                onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
              />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <Field label="GPS Latitude">
                <input
                  type="number"
                  step="any"
                  className="cbms-input"
                  placeholder="e.g. 14.6507"
                  value={form.latitude}
                  disabled={busy}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                />
              </Field>
              <Field label="GPS Longitude">
                <input
                  type="number"
                  step="any"
                  className="cbms-input"
                  placeholder="e.g. 121.0825"
                  value={form.longitude}
                  disabled={busy}
                  onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Estimated Monthly Income (PHP)">
              <input
                type="number"
                min="0"
                step="500"
                className="cbms-input"
                placeholder="e.g. 25000"
                value={form.monthlyIncome}
                disabled={busy}
                onChange={(e) => setForm({ ...form, monthlyIncome: e.target.value })}
              />
            </Field>
          </div>

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
              disabled={busy}
              onClick={onClose}
              className="cbms-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="cbms-btn cbms-btn--primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                opacity: busy ? 0.75 : 1,
                cursor: busy ? "not-allowed" : "pointer",
              }}
            >
              {busy ? (
                <>
                  <svg
                    style={{
                      width: 14,
                      height: 14,
                      animation: "cbms-spin 0.75s linear infinite",
                      flexShrink: 0,
                    }}
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeOpacity="0.3"
                    />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Saving Household…</span>
                </>
              ) : (
                <span>Save Household</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
