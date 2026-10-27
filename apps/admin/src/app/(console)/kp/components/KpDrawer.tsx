"use client";

import * as React from "react";
import { Alert, Field } from "@cbms/ui";

export interface KpDrawerFormData {
  subject: string;
  description: string;
  respondentName?: string;
  complainantName?: string;
  isConfidential: boolean;
}

export interface KpDrawerProps {
  open: boolean;
  busy: boolean;
  canVawc: boolean;
  onClose: () => void;
  onSubmit: (data: KpDrawerFormData) => Promise<void>;
}

export function KpDrawer({
  open,
  busy,
  canVawc,
  onClose,
  onSubmit,
}: KpDrawerProps) {
  const [subject, setSubject] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [complainantName, setComplainantName] = React.useState("");
  const [respondentName, setRespondentName] = React.useState("");
  const [isConfidential, setIsConfidential] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setSubject("");
      setDescription("");
      setComplainantName("");
      setRespondentName("");
      setIsConfidential(false);
      setErrorMsg(null);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.trim().length < 3) {
      setErrorMsg("Subject must be at least 3 characters.");
      return;
    }
    if (description.trim().length < 10) {
      setErrorMsg("Description must be at least 10 characters detailing the dispute.");
      return;
    }

    setErrorMsg(null);
    try {
      await onSubmit({
        subject: subject.trim(),
        description: description.trim(),
        complainantName: complainantName.trim() || undefined,
        respondentName: respondentName.trim() || undefined,
        isConfidential,
      });
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to file KP case.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(2px)",
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          height: "100%",
          backgroundColor: "var(--cbms-white, #ffffff)",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--color-border, #e2e8f0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "var(--color-bg-subtle, #f8fafc)",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--cbms-navy, #0a2463)" }}>
              ⚖️ File a New KP Case
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#64748b" }}>
              Republic Act 7160 §410 Statutory Mediation Docket
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.2rem",
              color: "#94a3b8",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.1rem", flex: 1 }}>
          {errorMsg && (
            <Alert tone="danger">
              {errorMsg}
            </Alert>
          )}

          {/* Subject Field */}
          <Field label="Subject of Dispute" hint="Concise summary (e.g. Boundary Encroachment, Noise Violation, Unpaid Debt)">
            <input
              type="text"
              className="cbms-input"
              placeholder="e.g. Boundary Fence Dispute"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              minLength={3}
              required
              disabled={busy}
            />
          </Field>

          {/* Complainant & Respondent Names */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Field label="Complainant Name" hint="Filing party">
              <input
                type="text"
                className="cbms-input"
                placeholder="Juan Dela Cruz"
                value={complainantName}
                onChange={(e) => setComplainantName(e.target.value)}
                disabled={busy}
              />
            </Field>

            <Field label="Respondent Name" hint="Opposing party">
              <input
                type="text"
                className="cbms-input"
                placeholder="Pedro Santos"
                value={respondentName}
                onChange={(e) => setRespondentName(e.target.value)}
                disabled={busy}
              />
            </Field>
          </div>

          {/* Narrative Description */}
          <Field label="Narrative Description" hint="Detailed facts of dispute (Minimum 10 characters). Encrypted at rest.">
            <textarea
              className="cbms-textarea"
              placeholder="Provide a chronological account of the incident, prior demands made, and requested settlement..."
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minLength={10}
              required
              disabled={busy}
            />
          </Field>

          {/* Statutory Clock Notice */}
          <div
            style={{
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "0.375rem",
              padding: "0.75rem 1rem",
              fontSize: "0.78rem",
              color: "#166534",
            }}
          >
            ⏱️ <strong>Statutory 15-Day Mediation Clock:</strong> Filing this case automatically establishes the mediation period under the Punong Barangay conforming to DILG KPISBH standards.
          </div>

          {/* Confidential Track Checkbox (VAWC) */}
          {canVawc && (
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
                fontSize: "0.82rem",
                color: "#1b2430",
                cursor: "pointer",
                padding: "0.5rem 0",
              }}
            >
              <input
                type="checkbox"
                checked={isConfidential}
                onChange={(e) => setIsConfidential(e.target.checked)}
                disabled={busy}
                style={{ marginTop: 2 }}
              />
              <span>
                <strong>Restricted (VAWC/VAC Confidential Track):</strong> Restrict visibility strictly to the VAW Desk Officer and Punong Barangay.
              </span>
            </label>
          )}

          {/* Actions Footer */}
          <div
            style={{
              marginTop: "auto",
              paddingTop: "1rem",
              borderTop: "1px solid var(--color-border, #e2e8f0)",
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
            }}
          >
            <button
              type="button"
              className="cbms-btn cbms-btn--subtle"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cbms-btn cbms-btn--primary"
              disabled={busy}
              style={{ minWidth: 130, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}
            >
              {busy ? (
                <>
                  <span className="cbms-spinner" style={{ width: 14, height: 14 }} />
                  <span>Filing...</span>
                </>
              ) : (
                <span>File KP Case</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
