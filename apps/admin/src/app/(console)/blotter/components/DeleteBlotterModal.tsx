"use client";

import * as React from "react";
import type { BlotterEntry } from "../../../../lib/types";

export interface DeleteBlotterModalProps {
  open: boolean;
  busy: boolean;
  entry: BlotterEntry | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteBlotterModal({
  open,
  busy,
  entry,
  onCancel,
  onConfirm,
}: DeleteBlotterModalProps) {
  const [typedConfirmation, setTypedConfirmation] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setTypedConfirmation("");
    }
  }, [open]);

  if (!open || !entry) return null;

  const targetIdentifier = entry.entryNo.trim();
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
        aria-labelledby="delete-blotter-title"
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
            id="delete-blotter-title"
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
            <span>⚠️ Delete Incident Blotter</span>
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
                fontSize: "0.85rem",
                color: "#991b1b",
                lineHeight: "1.45",
              }}
            >
              <strong>Warning:</strong> You are about to permanently delete blotter entry{" "}
              <strong>{entry.entryNo}</strong> (Complainant: <em>{entry.reportedBy}</em>). This will permanently purge the official incident narrative and records from the barangay docket.
            </p>
          </div>

          <label
            htmlFor="delete-confirm-input"
            style={{
              display: "block",
              fontSize: "0.85rem",
              fontWeight: 500,
              marginBottom: "0.5rem",
              color: "var(--color-text, #1b2430)",
            }}
          >
            Please type <strong>{targetIdentifier}</strong> to confirm:
          </label>

          <input
            id="delete-confirm-input"
            type="text"
            className="cbms-input"
            disabled={busy}
            placeholder={targetIdentifier}
            value={typedConfirmation}
            onChange={(e) => setTypedConfirmation(e.target.value)}
            style={{ width: "100%" }}
            autoFocus
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
            borderTop: "1px solid var(--color-border, #e2e8f0)",
            paddingTop: "1rem",
          }}
        >
          <button
            type="button"
            className="cbms-btn"
            disabled={busy}
            onClick={onCancel}
            style={{ padding: "0.5rem 1rem" }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="cbms-btn"
            disabled={!isMatch || busy}
            onClick={onConfirm}
            style={{
              padding: "0.5rem 1.25rem",
              backgroundColor: isMatch ? "var(--cbms-red, #ce1126)" : "#fca5a5",
              color: "#ffffff",
              cursor: isMatch && !busy ? "pointer" : "not-allowed",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {busy ? (
              <>
                <span className="cbms-spinner" style={{ width: 14, height: 14 }} />
                <span>Deleting…</span>
              </>
            ) : (
              <span>Permanently Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
