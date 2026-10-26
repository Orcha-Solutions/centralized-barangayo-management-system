"use client";

import * as React from "react";
import { Alert, Field } from "@cbms/ui";
import { DILG_CAUSE_OF_DEATH_CATEGORIES } from "@cbms/api-client";

interface DeceasedModalProps {
  open: boolean;
  name: string;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (data: {
    dateOfDeath: string;
    immediateCause: string;
    underlyingCause: string;
  }) => Promise<void>;
}

export function DeceasedModal({
  open,
  name,
  busy,
  error,
  onClose,
  onSubmit,
}: DeceasedModalProps) {
  const [deceasedDate, setDeceasedDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [immediateCause, setImmediateCause] = React.useState("");
  const [underlyingCause, setUnderlyingCause] = React.useState(
    DILG_CAUSE_OF_DEATH_CATEGORIES[0] ?? "Diseases of the circulatory system"
  );
  const [deceasedConsent, setDeceasedConsent] = React.useState(true);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!deceasedConsent) return;
    await onSubmit({
      dateOfDeath: deceasedDate,
      immediateCause,
      underlyingCause,
    });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "var(--color-bg-card, #ffffff)",
          borderRadius: "0.5rem",
          padding: "1.5rem",
          maxWidth: "500px",
          width: "100%",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: "0 0 0.5rem 0", color: "#ef4444" }}>
          ✝ Deceased Profile (BIMS Form A3)
        </h3>
        <p style={{ margin: "0 0 1rem 0", fontSize: "0.85rem", color: "#64748b" }}>
          Record death certificate details for {name} per DILG BIMS standard.
        </p>

        {error && <Alert tone="danger">{error}</Alert>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Date of Death">
            <input
              className="cbms-input"
              type="date"
              value={deceasedDate}
              onChange={(e) => setDeceasedDate(e.target.value)}
              required
            />
          </Field>

          <Field label="Immediate Cause of Death" hint='As declared in death certificate (e.g. "Cardiopulmonary Arrest")'>
            <input
              className="cbms-input"
              value={immediateCause}
              onChange={(e) => setImmediateCause(e.target.value)}
              placeholder="e.g. Cardiopulmonary Arrest"
              required
            />
          </Field>

          <Field label="Underlying Cause of Death (DILG Classification)">
            <select
              className="cbms-select"
              value={underlyingCause}
              onChange={(e) => setUnderlyingCause(e.target.value)}
              required
            >
              {DILG_CAUSE_OF_DEATH_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </Field>

          <div style={{ marginTop: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem" }}>
              <input
                type="checkbox"
                checked={deceasedConsent}
                onChange={(e) => setDeceasedConsent(e.target.checked)}
                required
              />
              I certify that the above information is accurate and verified with civil registry records.
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
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
              disabled={busy}
              className="cbms-btn cbms-btn--danger"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                cursor: busy ? "not-allowed" : "pointer",
                opacity: busy ? 0.85 : 1,
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
                  <span>Saving…</span>
                </>
              ) : (
                <span>Confirm Deceased Record</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
