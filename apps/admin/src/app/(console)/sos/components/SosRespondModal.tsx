"use client";

import * as React from "react";
import type { SosAlert } from "../../../../lib/types";

export interface SosRespondModalProps {
  open: boolean;
  busy: boolean;
  alert: SosAlert | null;
  targetStatus: string;
  onCancel: () => void;
  onSubmit: (responseNote: string) => void;
}

export function SosRespondModal({
  open,
  busy,
  alert,
  targetStatus,
  onCancel,
  onSubmit,
}: SosRespondModalProps) {
  const [responseNote, setResponseNote] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setResponseNote("");
    }
  }, [open]);

  if (!open || !alert) return null;

  const getActionTitle = () => {
    switch (targetStatus) {
      case "acknowledged":
        return "Acknowledge SOS Alert";
      case "dispatched":
        return "Dispatch Emergency Responder";
      case "resolved":
        return "Resolve & Close Emergency Incident";
      case "false_alarm":
        return "Mark as False Alarm";
      default:
        return "Update Incident Status";
    }
  };

  const getActionColor = () => {
    switch (targetStatus) {
      case "dispatched":
        return "#0a2463";
      case "resolved":
        return "#166534";
      case "false_alarm":
        return "#475569";
      default:
        return "#b45309";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    onSubmit(responseNote.trim());
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
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
        aria-labelledby="sos-respond-title"
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
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <h3
              id="sos-respond-title"
              style={{
                margin: "0 0 0.25rem 0",
                fontSize: "1.15rem",
                fontWeight: 700,
                color: getActionColor(),
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>{targetStatus === "dispatched" ? "🚒" : targetStatus === "resolved" ? "✅" : "📋"}</span>
              <span>{getActionTitle()}</span>
            </h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--cbms-muted, #64748b)" }}>
              Alert #{(alert.id || "").slice(0, 8)}: {(alert.kind || "general").toUpperCase()}
              {alert.inhabitant ? ` · Caller: ${alert.inhabitant.firstName} ${alert.inhabitant.lastName}` : ""}
            </p>
          </div>

          <div>
            <label
              htmlFor="response-note-input"
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: "var(--color-text, #1b2430)",
              }}
            >
              Response / Dispatch Notes {targetStatus === "resolved" ? "(Resolution details)" : "(Optional)"}:
            </label>
            <textarea
              id="response-note-input"
              rows={3}
              className="cbms-input"
              disabled={busy}
              autoFocus
              value={responseNote}
              onChange={(e) => setResponseNote(e.target.value)}
              placeholder={
                targetStatus === "dispatched"
                  ? "e.g. Tanod team #3 dispatched with first aid kit..."
                  : targetStatus === "resolved"
                  ? "e.g. Patient stabilized and transferred to hospital..."
                  : "Add notes regarding this action..."
              }
              style={{ width: "100%", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
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
              type="submit"
              disabled={busy}
              style={{
                backgroundColor: getActionColor(),
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                padding: "0.5rem 1.25rem",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: busy ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                opacity: busy ? 0.7 : 1,
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
              <span>{busy ? "Updating..." : "Confirm & Update"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
