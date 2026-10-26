"use client";

import * as React from "react";

export interface DeleteHouseholdModalProps {
  open: boolean;
  busy: boolean;
  householdNo: string;
  householdName?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteHouseholdModal({
  open,
  busy,
  householdNo,
  householdName,
  onCancel,
  onConfirm,
}: DeleteHouseholdModalProps) {
  const [typedConfirmation, setTypedConfirmation] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setTypedConfirmation("");
    }
  }, [open]);

  if (!open) return null;

  const targetIdentifier = (householdName?.trim() || householdNo).trim();
  const isMatch = typedConfirmation.trim().toLowerCase() === targetIdentifier.toLowerCase();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(2px)",
        zIndex: 2500,
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
        aria-labelledby="delete-household-title"
        style={{
          backgroundColor: "var(--color-bg-card, #ffffff)",
          border: "1px solid var(--color-border, #e2e8f0)",
          borderRadius: "8px",
          padding: "1.5rem",
          width: "90%",
          maxWidth: "480px",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3
            id="delete-household-title"
            style={{
              margin: "0 0 0.5rem 0",
              fontSize: "1.15rem",
              fontWeight: 700,
              color: "var(--cbms-red, #ce1126)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>⚠️ Delete Household Record</span>
          </h3>

          <div
            style={{
              padding: "12px 14px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              marginBottom: "1rem",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "0.86rem",
                color: "#991b1b",
                lineHeight: "1.45",
              }}
            >
              <strong>Warning:</strong> You are about to permanently delete household{" "}
              <strong>{householdNo}</strong> {householdName ? `("${householdName}")` : ""} from the registry (DILG BIMS Form A1).
              All linked inhabitant members will have their household assignment severed. This action is <strong>irreversible</strong>.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              htmlFor="confirm-delete-household-input"
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "var(--color-text, #1b2430)",
              }}
            >
              To confirm deletion, please type "
              <span style={{ color: "var(--cbms-red, #ce1126)", fontWeight: 700, userSelect: "all" }}>
                {targetIdentifier}
              </span>
              " below:
            </label>
            <input
              id="confirm-delete-household-input"
              className="cbms-input"
              value={typedConfirmation}
              disabled={busy}
              onChange={(e) => setTypedConfirmation(e.target.value)}
              placeholder={`Type "${targetIdentifier}" to confirm`}
              autoFocus
              autoComplete="off"
              style={{
                borderColor: isMatch ? "var(--cbms-red, #ce1126)" : undefined,
                outlineColor: "var(--cbms-red, #ce1126)",
              }}
            />
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
            disabled={!isMatch || busy}
            onClick={onConfirm}
            className="cbms-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: isMatch ? "var(--cbms-red, #ce1126)" : "#cbd5e1",
              color: "#ffffff",
              border: "none",
              cursor: isMatch && !busy ? "pointer" : "not-allowed",
              opacity: isMatch ? (busy ? 0.8 : 1) : 0.6,
              fontWeight: 600,
              padding: "0.55rem 1.1rem",
              borderRadius: "6px",
              transition: "all 0.15s ease",
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
                <span>Deleting Household…</span>
              </>
            ) : (
              <span>Confirm Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
