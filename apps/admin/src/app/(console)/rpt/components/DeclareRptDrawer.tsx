"use client";

import * as React from "react";
import { Field, pesoAmount } from "@cbms/ui";
import type {
  CreateRptPropertyPayload,
  RptPropertyItem,
  RptPropertyType,
} from "../../../../lib/rpt-queries";
import { RPT_PUROKS } from "./RptFilterPopover";
import { ConfirmRptDeclarationModal } from "./ConfirmRptDeclarationModal";

export interface DeclareRptDrawerProps {
  open: boolean;
  busy: boolean;
  editingProperty?: RptPropertyItem | null;
  nextTdnSuggestion?: string;
  onClose: () => void;
  onSubmit: (payload: CreateRptPropertyPayload) => void;
}

const ASSESSMENT_LEVELS: Record<RptPropertyType, number> = {
  residential: 0.2,
  commercial: 0.5,
  industrial: 0.5,
  agricultural: 0.4,
  special: 0.1,
};

export function DeclareRptDrawer({
  open,
  busy,
  editingProperty,
  nextTdnSuggestion = "TD-2026-0115",
  onClose,
  onSubmit,
}: DeclareRptDrawerProps) {
  const isEdit = Boolean(editingProperty);

  const [taxDeclarationNo, setTaxDeclarationNo] = React.useState(nextTdnSuggestion);
  const [ownerName, setOwnerName] = React.useState("");
  const [propertyType, setPropertyType] = React.useState<RptPropertyType>("residential");
  const [marketValuePesos, setMarketValuePesos] = React.useState("1800000");
  const [assessedValuePesos, setAssessedValuePesos] = React.useState("360000");
  const [addressLine, setAddressLine] = React.useState("");
  const [purok, setPurok] = React.useState("Purok 1");
  const [lotNo, setLotNo] = React.useState("");
  const [blockNo, setBlockNo] = React.useState("");
  const [taxYear, setTaxYear] = React.useState(String(new Date().getFullYear()));
  const [formError, setFormError] = React.useState<string | null>(null);
  const [pendingPayload, setPendingPayload] = React.useState<CreateRptPropertyPayload | null>(null);

  React.useEffect(() => {
    if (!open) {
      setPendingPayload(null);
      return;
    }
    setFormError(null);
    setPendingPayload(null);
    if (editingProperty) {
      setTaxDeclarationNo(editingProperty.taxDeclarationNo);
      setOwnerName(editingProperty.ownerName);
      setPropertyType(editingProperty.propertyType);
      setMarketValuePesos(String(editingProperty.marketValue || 0));
      setAssessedValuePesos(String(editingProperty.assessedValue || 0));
      setAddressLine(editingProperty.addressLine);
      setPurok(editingProperty.purok || "Purok 1");
      setLotNo(editingProperty.lotNo || "");
      setBlockNo(editingProperty.blockNo || "");
    } else {
      setTaxDeclarationNo(nextTdnSuggestion);
      setOwnerName("");
      setPropertyType("residential");
      setMarketValuePesos("1800000");
      setAssessedValuePesos("360000");
      setAddressLine("");
      setPurok("Purok 1");
      setLotNo("");
      setBlockNo("");
      setTaxYear(String(new Date().getFullYear()));
    }
  }, [open, editingProperty, nextTdnSuggestion]);

  if (!open) return null;

  const handleMarketValueChange = (val: string) => {
    setMarketValuePesos(val);
    const mv = Number(val) || 0;
    const rate = ASSESSMENT_LEVELS[propertyType] ?? 0.2;
    setAssessedValuePesos(String(Math.round(mv * rate)));
  };

  const handleTypeChange = (nextType: RptPropertyType) => {
    setPropertyType(nextType);
    const mv = Number(marketValuePesos) || 0;
    const rate = ASSESSMENT_LEVELS[nextType] ?? 0.2;
    setAssessedValuePesos(String(Math.round(mv * rate)));
  };

  const avNum = Number(assessedValuePesos) || 0;
  const mvNum = Number(marketValuePesos) || 0;
  const estBasicTax = Math.round(avNum * 0.01);
  const estSefTax = Math.round(avNum * 0.01);
  const estBrgyShare = Math.round(estBasicTax * 0.25);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (taxDeclarationNo.trim().length < 3) {
      setFormError("Tax Declaration No. must be at least 3 characters.");
      return;
    }
    if (ownerName.trim().length < 2) {
      setFormError("Registered Owner Name is required.");
      return;
    }
    if (!addressLine.trim()) {
      setFormError("Property Street / Address Line is required.");
      return;
    }
    if (avNum <= 0) {
      setFormError("Assessed Value must be greater than ₱0.");
      return;
    }

    setPendingPayload({
      taxDeclarationNo: taxDeclarationNo.trim(),
      ownerName: ownerName.trim(),
      propertyType,
      addressLine: addressLine.trim(),
      purok,
      assessedValueCentavos: Math.round(avNum * 100),
      marketValueCentavos: Math.round(Math.max(mvNum, avNum) * 100),
      lotNo: lotNo.trim() || null,
      blockNo: blockNo.trim() || null,
      taxYear: Number(taxYear) || new Date().getFullYear(),
    });
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    onSubmit(pendingPayload);
  };

  return (
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
          maxWidth: "540px",
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
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
              {isEdit ? `Edit Declaration — ${editingProperty?.taxDeclarationNo}` : "Declare Real Property (RA 7160)"}
            </h3>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
              {isEdit
                ? "Update property classification, owner, or assessed valuation"
                : "Encode Tax Declaration Number (TDN) and compute 25% Barangay RPT Share"}
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.25rem",
              color: "#64748b",
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "20px 24px",
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {formError && (
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
              {formError}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "12px" }}>
            <Field label="Tax Declaration No. (TDN) *">
              <input
                className="cbms-input"
                value={taxDeclarationNo}
                onChange={(e) => setTaxDeclarationNo(e.target.value)}
                disabled={busy}
                placeholder="e.g. TD-2026-0115"
                required
              />
            </Field>
            <Field label="Assessment Year *">
              <input
                type="number"
                className="cbms-input"
                value={taxYear}
                onChange={(e) => setTaxYear(e.target.value)}
                disabled={busy || isEdit}
                min={2000}
                max={2099}
              />
            </Field>
          </div>

          <Field label="Registered Property Owner / Taxpayer *">
            <input
              className="cbms-input"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              disabled={busy}
              placeholder="e.g. Sps. Roberto & Elena Cruz or Corp. Name"
              required
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
            <Field label="Property Classification (RA 7160 §215) *">
              <select
                className="cbms-select"
                value={propertyType}
                onChange={(e) => handleTypeChange(e.target.value as RptPropertyType)}
                disabled={busy}
              >
                <option value="residential">Residential (20% Level)</option>
                <option value="commercial">Commercial (50% Level)</option>
                <option value="industrial">Industrial (50% Level)</option>
                <option value="agricultural">Agricultural (40% Level)</option>
                <option value="special">Special Class (10% Level)</option>
              </select>
            </Field>

            <Field label="Purok / Zone *">
              <select
                className="cbms-select"
                value={purok}
                onChange={(e) => setPurok(e.target.value)}
                disabled={busy}
              >
                {RPT_PUROKS.filter((p) => p.value !== "all").map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Street Address / Location *">
            <input
              className="cbms-input"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              disabled={busy}
              placeholder="e.g. 42 A. Bonifacio Ave., Brgy. Barangka"
              required
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Lot Number">
              <input
                className="cbms-input"
                value={lotNo}
                onChange={(e) => setLotNo(e.target.value)}
                disabled={busy}
                placeholder="e.g. 12-A"
              />
            </Field>
            <Field label="Block Number">
              <input
                className="cbms-input"
                value={blockNo}
                onChange={(e) => setBlockNo(e.target.value)}
                disabled={busy}
                placeholder="e.g. 4"
              />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Fair Market Value (PHP) *">
              <input
                type="number"
                className="cbms-input"
                value={marketValuePesos}
                onChange={(e) => handleMarketValueChange(e.target.value)}
                disabled={busy}
                min={1}
                required
              />
            </Field>
            <Field label="Assessed Value (PHP) *">
              <input
                type="number"
                className="cbms-input"
                value={assessedValuePesos}
                onChange={(e) => setAssessedValuePesos(e.target.value)}
                disabled={busy}
                min={1}
                required
              />
            </Field>
          </div>

          {/* Statutory RPT Preview Box */}
          <div
            style={{
              backgroundColor: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: "8px",
              padding: "12px 14px",
              fontSize: "0.82rem",
              color: "#0c4a6e",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: "6px" }}>
              📊 Statutory Assessment Preview (RA 7160 §233, §235, §271)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              <div>Basic RPT (1%): <strong>{pesoAmount(estBasicTax)}</strong></div>
              <div>SEF Tax (1%): <strong>{pesoAmount(estSefTax)}</strong></div>
              <div>Total Annual Due: <strong>{pesoAmount(estBasicTax + estSefTax)}</strong></div>
              <div style={{ color: "#047857" }}>
                25% Brgy Share: <strong>+{pesoAmount(estBrgyShare)}</strong>
              </div>
            </div>
          </div>

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
              disabled={busy}
              className="cbms-button cbms-button--primary"
              style={{
                padding: "8px 18px",
                backgroundColor: busy ? "#93c5fd" : "#1d4ed8",
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
                <span>{isEdit ? "Save Assessment Changes" : "Declare Property"}</span>
              )}
            </button>
          </div>
        </form>
      </div>

      <ConfirmRptDeclarationModal
        open={Boolean(pendingPayload)}
        busy={busy}
        isEdit={isEdit}
        payload={pendingPayload}
        existingProperty={editingProperty}
        onCancel={() => setPendingPayload(null)}
        onConfirm={handleConfirmSubmit}
      />
    </div>
  );
}
