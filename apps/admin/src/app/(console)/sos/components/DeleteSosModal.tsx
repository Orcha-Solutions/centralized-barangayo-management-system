"use client";

import * as React from "react";
import type { SosAlert } from "../../../../lib/types";

export interface DeleteSosModalProps {
  open: boolean;
  busy: boolean;
  alert: SosAlert | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteSosModal({
  open,
  busy,
  alert,
  onCancel,
  onConfirm,
}: DeleteSosModalProps) {
  const [typedConfirmation, setTypedConfirmation] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setTypedConfirmation("");
    }
  }, [open]);

  if (!open || !alert) return null;

  const targetIdentifier = alert.id ? `SOS-${alert.id.slice(0, 8)}` : "SOS-ALERT";
  const isMatch =
    typedConfirmation.trim().toUpperCase() === targetIdentifier.toUpperCase() ||
    typedConfirmation.trim().toUpperCase() === "DELETE" ||
    (alert.id && typedConfirmation.trim().toLowerCase() === alert.id.toLowerCase());

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
        aria-labelledby="delete-sos-title"
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
            id="delete-sos-title"
            style={{
              margin: "0 0 0.5rem 0",
              fontSize: "1.15rem",
              fontWeight: 700,
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>⚠️ Delete Emergency SOS Alert</span>
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
              <strong>Warning:</strong> You are about to permanently purge emergency dispatch record{" "}
              <strong>#{(alert.id || "").slice(0, 8)}</strong> ({(alert.kind || "general").toUpperCase()} - {alert.inhabitant ? `${alert.inhabitant.firstName} ${alert.inhabitant.lastName}` : "Resident"}).
              This action cannot be undone and will remove all response audit logs from the system.
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
            autoFocus
            value={typedConfirmation}
            onChange={(e) => setTypedConfirmation(e.target.value)}
            placeholder={`Type ${targetIdentifier}`}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button
            type="button"
            className="cbms-button"
            disabled={busy}
            onClick={onCancel}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              border: "1px solid var(--color-border, #cbd5e1)",
              background: "transparent",
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isMatch || busy}
            onClick={onConfirm}
            style={{
              backgroundColor: isMatch ? "#dc2626" : "#fca5a5",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "0.5rem 1.25rem",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: isMatch && !busy ? "pointer" : "not-allowed",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "background-color 0.15s ease",
            }}
          >
            {busy && (
              <span
                style={{
                  display: "inline-block",
                  width: 13,
                  height: 13,
                  border: "2px solid rgba(255, 255, 255, 0.4)",
                  borderTopColor: "#ffffff",
                  borderRadius: "50%",
                  animation: "cbms-spin 0.8s linear infinite",
                }}
              />
            )}
            <span>{busy ? "Purging..." : "Permanently Delete"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
