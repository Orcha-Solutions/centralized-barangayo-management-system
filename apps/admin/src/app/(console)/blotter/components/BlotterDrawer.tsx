"use client";

import * as React from "react";
import { Button, Field } from "@cbms/ui";
import { BLOTTER_CATEGORIES } from "../../../../lib/labels";
import { InhabitantSelectDropdown } from "./InhabitantSelectDropdown";
import type { BlotterEntry, Inhabitant } from "../../../../lib/types";

export interface BlotterDrawerFormData {
  entryNo?: string;
  category: string;
  incidentAt: string;
  location: string;
  narrative: string;
  reportedBy: string;
  complainantInhabitantId?: string;
  complainantPhone?: string;
  respondentName?: string;
  isConfidential: boolean;
  status: string;
}

export interface BlotterDrawerProps {
  open: boolean;
  busy: boolean;
  editingEntry: BlotterEntry | null;
  onClose: () => void;
  onSubmit: (data: BlotterDrawerFormData) => Promise<void>;
  mayVawc?: boolean;
}

export function BlotterDrawer({
  open,
  busy,
  editingEntry,
  onClose,
  onSubmit,
  mayVawc,
}: BlotterDrawerProps) {
  const [form, setForm] = React.useState<BlotterDrawerFormData>({
    category: "dispute",
    incidentAt: new Date().toISOString().slice(0, 16),
    location: "",
    narrative: "",
    reportedBy: "",
    complainantInhabitantId: "",
    complainantPhone: "",
    respondentName: "",
    isConfidential: false,
    status: "active",
  });
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [isManualComplainant, setIsManualComplainant] = React.useState(false);
  const [selectedInhabitantId, setSelectedInhabitantId] = React.useState<string>("");

  React.useEffect(() => {
    if (editingEntry) {
      setForm({
        entryNo: editingEntry.entryNo,
        category: editingEntry.category || "dispute",
        incidentAt: editingEntry.incidentAt ? new Date(editingEntry.incidentAt).toISOString().slice(0, 16) : "",
        location: editingEntry.location || "",
        narrative: editingEntry.narrative || "",
        reportedBy: editingEntry.reportedBy || "",
        complainantInhabitantId: (editingEntry as any).complainantInhabitantId || "",
        complainantPhone: (editingEntry as any).complainantPhone || "",
        respondentName: editingEntry.respondentName || "",
        isConfidential: !!editingEntry.isConfidential,
        status: editingEntry.status || "active",
      });
      setIsManualComplainant(true);
      setSelectedInhabitantId((editingEntry as any).complainantInhabitantId || "");
    } else {
      setForm({
        category: "dispute",
        incidentAt: new Date().toISOString().slice(0, 16),
        location: "",
        narrative: "",
        reportedBy: "",
        complainantInhabitantId: "",
        complainantPhone: "",
        respondentName: "",
        isConfidential: false,
        status: "active",
      });
      setIsManualComplainant(false);
      setSelectedInhabitantId("");
    }
    setValidationError(null);
  }, [editingEntry, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!form.incidentAt) {
      setValidationError("Incident date and time are required.");
      return;
    }
    if (!form.location.trim()) {
      setValidationError("Incident location is required.");
      return;
    }
    if (!form.reportedBy.trim()) {
      setValidationError("Complainant / Reported By name is required.");
      return;
    }
    if (!form.narrative.trim()) {
      setValidationError("Incident narrative details are required.");
      return;
    }

    try {
      await onSubmit(form);
    } catch (err: any) {
      setValidationError(err?.message || "Failed to submit blotter entry.");
    }
  };

  const allowedCategories = BLOTTER_CATEGORIES.filter((c) => c !== "vawc" || mayVawc);

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
        aria-labelledby="blotter-drawer-title"
        style={{
          width: "100%",
          maxWidth: "720px",
          height: "100%",
          backgroundColor: "var(--color-bg-card, #ffffff)",
          borderLeft: "1px solid var(--color-border, #e2e8f0)",
          boxShadow: "-8px 0 24px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--color-border, #e2e8f0)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "var(--color-bg-hover, #f8fafc)",
          }}
        >
          <div>
            <h2
              id="blotter-drawer-title"
              style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--color-text, #1b2430)" }}
            >
              {editingEntry ? `✏️ Edit Blotter Entry ${editingEntry.entryNo}` : "📋 Log Incident Blotter"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--cbms-muted, #64748b)" }}>
              Official Katarungang Pambarangay Incident Entry (KPISBH Form)
            </p>
          </div>
          <button
            type="button"
            className="cbms-btn"
            disabled={busy}
            onClick={onClose}
            style={{ padding: "0.25rem 0.6rem", fontSize: "1rem" }}
          >
            ✕
          </button>
        </div>

        {/* Drawer Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {validationError && (
            <div
              style={{
                padding: "10px 14px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "6px",
                color: "#b91c1c",
                fontSize: "12.5px",
                fontWeight: 500,
              }}
            >
              ⚠️ {validationError}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Field label="Category" hint="Incident classification">
              <select
                className="cbms-select"
                disabled={busy}
                value={form.category}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((p) => ({
                    ...p,
                    category: val,
                    isConfidential: val === "vawc" ? true : p.isConfidential,
                  }));
                }}
              >
                {allowedCategories.map((c) => (
                  <option key={c} value={c} style={{ textTransform: "capitalize" }}>
                    {c.replace("_", " ")}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Status" hint="Case resolution status">
              <select
                className="cbms-select"
                disabled={busy}
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
                <option value="endorsed">Endorsed to Lupon</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </Field>
          </div>

          <Field label="Incident Date & Time *" hint="When the event occurred">
            <input
              type="datetime-local"
              className="cbms-input"
              disabled={busy}
              value={form.incidentAt}
              onChange={(e) => setForm((p) => ({ ...p, incidentAt: e.target.value }))}
              required
            />
          </Field>

          <Field label="Incident Location *" hint="Exact street, purok, or landmark">
            <input
              type="text"
              className="cbms-input"
              placeholder="e.g. Purok 3 near Barangay Hall, Katipunan St."
              disabled={busy}
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              required
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label className="cbms-field__label" style={{ fontWeight: 600, fontSize: "13px" }}>
                  Complainant / Reported By *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const nextMode = !isManualComplainant;
                    setIsManualComplainant(nextMode);
                    if (nextMode) {
                      setSelectedInhabitantId("");
                    }
                  }}
                  className="cbms-btn cbms-btn--sm"
                  style={{
                    padding: "2px 8px",
                    fontSize: "11px",
                    fontWeight: 500,
                    backgroundColor: isManualComplainant ? "#eff6ff" : "#f1f5f9",
                    color: isManualComplainant ? "#1d4ed8" : "#475569",
                    border: "1px solid",
                    borderColor: isManualComplainant ? "#bfdbfe" : "#cbd5e1",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  title="Toggle between choosing a registered barangay inhabitant or typing a non-resident name manually"
                >
                  {isManualComplainant ? "👥 Choose Inhabitant" : "✏️ Type Manually"}
                </button>
              </div>

              {!isManualComplainant ? (
                <div>
                  <InhabitantSelectDropdown
                    value={form.reportedBy}
                    selectedInhabitantId={selectedInhabitantId}
                    disabled={busy}
                    onSelect={(inh) => {
                      const fullName = `${inh.firstName} ${inh.middleName ? inh.middleName[0] + ". " : ""}${inh.lastName}${inh.suffix ? " " + inh.suffix : ""}`.trim();
                      const phone = inh.contactPhone || inh.telephoneNumber || "";
                      setSelectedInhabitantId(inh.id);
                      setForm((p) => ({
                        ...p,
                        reportedBy: fullName,
                        complainantInhabitantId: inh.id,
                        complainantPhone: phone || p.complainantPhone,
                      }));
                    }}
                    onClear={() => {
                      setSelectedInhabitantId("");
                      setForm((p) => ({
                        ...p,
                        reportedBy: "",
                        complainantInhabitantId: undefined,
                      }));
                    }}
                  />
                  <div style={{ fontSize: "11px", color: "var(--cbms-muted, #64748b)", marginTop: "4px" }}>
                    Search and pick a registered resident (auto-fills their phone number).
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    className="cbms-input"
                    placeholder="e.g. Juan Dela Cruz (Non-resident / Walk-in)"
                    disabled={busy}
                    value={form.reportedBy}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        reportedBy: e.target.value,
                        complainantInhabitantId: undefined,
                      }))
                    }
                    required
                  />
                  <div style={{ fontSize: "11px", color: "var(--cbms-muted, #64748b)", marginTop: "4px" }}>
                    Manual entry mode for transient or non-registered complainants.
                  </div>
                </div>
              )}
            </div>

            <Field label="Complainant Phone" hint="Contact number (auto-populated when resident is selected)">
              <input
                type="tel"
                className="cbms-input"
                placeholder="0917XXXXXXX"
                disabled={busy}
                value={form.complainantPhone || ""}
                onChange={(e) => setForm((p) => ({ ...p, complainantPhone: e.target.value }))}
              />
            </Field>
          </div>

          <Field label="Respondent / Accused Party" hint="Name of respondent (if identified)">
            <input
              type="text"
              className="cbms-input"
              placeholder="e.g. Pedro Santos (or Unknown)"
              disabled={busy}
              value={form.respondentName || ""}
              onChange={(e) => setForm((p) => ({ ...p, respondentName: e.target.value }))}
            />
          </Field>

          <Field label="Incident Narrative *" hint="Detailed statement of facts, timeline, and claims">
            <textarea
              className="cbms-input"
              rows={5}
              placeholder="Provide a comprehensive narrative of the incident as reported by the complainant…"
              disabled={busy}
              value={form.narrative}
              onChange={(e) => setForm((p) => ({ ...p, narrative: e.target.value }))}
              required
              style={{ resize: "vertical" }}
            />
          </Field>

          <div
            style={{
              padding: "10px 14px",
              backgroundColor: form.isConfidential ? "#fff1f2" : "#f8fafc",
              border: `1px solid ${form.isConfidential ? "#fecdd3" : "#e2e8f0"}`,
              borderRadius: "6px",
            }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input
                type="checkbox"
                disabled={busy}
                checked={form.isConfidential}
                onChange={(e) => setForm((p) => ({ ...p, isConfidential: e.target.checked }))}
              />
              <span style={{ fontSize: "12.5px", fontWeight: 600, color: form.isConfidential ? "#be123c" : "#334155" }}>
                🔒 Mark as Confidential (RA 9262 / VAWC / Child Protection)
              </span>
            </label>
            <p style={{ margin: "4px 0 0 24px", fontSize: "11px", color: "var(--cbms-muted, #64748b)" }}>
              Confidential records are redacted from public blotter lists and accessible only to authorized VAW Desk officers and the Punong Barangay.
            </p>
          </div>

          {/* Drawer Footer Actions */}
          <div
            style={{
              marginTop: "auto",
              paddingTop: "1.25rem",
              borderTop: "1px solid var(--color-border, #e2e8f0)",
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
            }}
          >
            <Button variant="secondary" type="button" disabled={busy} onClick={onClose}>
              Cancel
            </Button>
            <button
              type="submit"
              className="cbms-btn cbms-btn--primary"
              disabled={busy}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "0.5rem 1.25rem",
                fontWeight: 600,
              }}
            >
              {busy ? (
                <>
                  <span className="cbms-spinner" style={{ width: 14, height: 14 }} />
                  <span>Saving…</span>
                </>
              ) : (
                <span>{editingEntry ? "Update Entry" : "Save Blotter Entry"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
