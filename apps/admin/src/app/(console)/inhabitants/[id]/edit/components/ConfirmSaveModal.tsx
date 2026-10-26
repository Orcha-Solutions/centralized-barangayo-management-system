"use client";

import * as React from "react";

interface ConfirmSaveModalProps {
  open: boolean;
  busy: boolean;
  inhabitantName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmSaveModal({
  open,
  busy,
  inhabitantName,
  onCancel,
  onConfirm,
}: ConfirmSaveModalProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 2000,
        display: "grid",
        placeItems: "center",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-save-title"
        style={{
          backgroundColor: "var(--color-bg-card, #ffffff)",
          border: "1px solid var(--color-border, #e2e8f0)",
          borderRadius: "0.5rem",
          padding: "1.5rem",
          width: "100%",
          maxWidth: "440px",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3
            id="confirm-save-title"
            style={{
              margin: "0 0 0.5rem 0",
              fontSize: "1.1rem",
              fontWeight: "bold",
              color: "var(--cbms-navy, #0a2463)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>💾 Confirm Profile Changes</span>
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "0.9rem",
              color: "var(--cbms-muted, #64748b)",
              lineHeight: "1.45",
            }}
          >
            Are you sure you want to confirm the changes to{" "}
            <strong style={{ color: "var(--color-text, #1b2430)" }}>
              {inhabitantName || "this inhabitant"}
            </strong>
            's profile?
          </p>
          <div
            style={{
              marginTop: "0.75rem",
              padding: "10px 12px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              fontSize: "0.8rem",
              color: "#475569",
              lineHeight: 1.4,
            }}
          >
            ℹ️ All modifications will be updated in the official Registry of Barangay Inhabitants (RBI / BIMS Form A2) and recorded in the audit trail.
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="cbms-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="cbms-btn cbms-btn--primary"
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
                <span>Saving Changes…</span>
              </>
            ) : (
              <span>Confirm & Save</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
