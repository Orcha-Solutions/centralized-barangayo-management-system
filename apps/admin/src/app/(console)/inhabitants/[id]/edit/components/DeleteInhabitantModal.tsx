"use client";

import * as React from "react";

interface DeleteInhabitantModalProps {
  open: boolean;
  busy: boolean;
  expectedName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteInhabitantModal({
  open,
  busy,
  expectedName,
  onCancel,
  onConfirm,
}: DeleteInhabitantModalProps) {
  const [typedName, setTypedName] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setTypedName("");
    }
  }, [open]);

  if (!open) return null;

  const targetName = expectedName.trim() || "Inhabitant";
  const isMatch = typedName.trim().toLowerCase() === targetName.toLowerCase();

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
        aria-labelledby="delete-modal-title"
        style={{
          backgroundColor: "var(--color-bg-card, #ffffff)",
          border: "1px solid var(--color-border, #e2e8f0)",
          borderRadius: "0.5rem",
          padding: "1.5rem",
          width: "100%",
          maxWidth: "460px",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3
            id="delete-modal-title"
            style={{
              margin: "0 0 0.5rem 0",
              fontSize: "1.1rem",
              fontWeight: "bold",
              color: "var(--cbms-red, #ce1126)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>⚠️ Delete Inhabitant Record</span>
          </h3>

          <div
            style={{
              padding: "10px 12px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              marginBottom: "1rem",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "0.85rem",
                color: "#991b1b",
                lineHeight: "1.45",
              }}
            >
              <strong>Warning:</strong> You are about to permanently delete{" "}
              <strong>{targetName}</strong> from the citizen database (DILG BIMS / RBI Form A2). This action is <strong>irreversible</strong> and will permanently sever all household linkages and sectoral records.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              htmlFor="confirm-delete-input"
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "var(--color-text, #1b2430)",
              }}
            >
              To confirm deletion, please type "
              <span style={{ color: "var(--cbms-red, #ce1126)", userSelect: "all" }}>
                {targetName}
              </span>
              " below:
            </label>
            <input
              id="confirm-delete-input"
              className="cbms-input"
              value={typedName}
              disabled={busy}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder={`Type "${targetName}" to confirm`}
              autoFocus
              autoComplete="off"
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
              color: "#fff",
              border: "none",
              cursor: isMatch && !busy ? "pointer" : "not-allowed",
              opacity: isMatch ? (busy ? 0.8 : 1) : 0.6,
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
                <span>Deleting Record…</span>
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
