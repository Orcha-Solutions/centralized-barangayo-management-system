"use client";

import * as React from "react";
import { Field } from "@cbms/ui";

export interface ScheduleHearingModalProps {
  open: boolean;
  caseNo: string;
  busy: boolean;
  onClose: () => void;
  onSubmit: (scheduledAt: string, stage: string) => Promise<void>;
}

export function ScheduleHearingModal({
  open,
  caseNo,
  busy,
  onClose,
  onSubmit,
}: ScheduleHearingModalProps) {
  const [scheduledAt, setScheduledAt] = React.useState("");
  const [hearingStage, setHearingStage] = React.useState("mediation");

  React.useEffect(() => {
    if (open) {
      // Default to tomorrow at 9:00 AM
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      const pad = (n: number) => String(n).padStart(2, "0");
      const localStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T09:00`;
      setScheduledAt(localStr);
      setHearingStage("mediation");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt) return;
    await onSubmit(scheduledAt, hearingStage);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(2px)",
        zIndex: 2500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.25rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "0.75rem",
          maxWidth: "520px",
          width: "100%",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#f8fafc",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--cbms-navy, #0a2463)" }}>
              📅 Schedule Hearing Session
            </h3>
            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 2 }}>
              Case Docket #{caseNo} · DILG KP Form 8
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.3rem",
              cursor: "pointer",
              color: "#94a3b8",
            }}
          >
            ×
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <Field label="Hearing Date & Time *" hint="Official conciliation session schedule">
            <input
              type="datetime-local"
              className="cbms-input"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              disabled={busy}
            />
          </Field>

          <Field label="Statutory Stage Forum *" hint="Convening authority under RA 7160">
            <select
              className="cbms-select"
              value={hearingStage}
              onChange={(e) => setHearingStage(e.target.value)}
              disabled={busy}
            >
              <option value="mediation">Mediation (Punong Barangay)</option>
              <option value="conciliation">Conciliation (Pangkat ng Tagapagkasundo)</option>
              <option value="arbitration">Arbitration Session</option>
            </select>
          </Field>

          <div
            style={{
              padding: "0.75rem",
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "0.375rem",
              fontSize: "0.78rem",
              color: "#166534",
              lineHeight: 1.5,
            }}
          >
            ℹ️ <strong>Automatic KP Form 8 Generation:</strong> Scheduling this hearing automatically enters the session into the official docket log and issues statutory notices to both complainant and respondent.
          </div>

          {/* Modal Footer */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
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
              className="cbms-btn cbms-btn--primary"
              disabled={busy || !scheduledAt}
              style={{
                backgroundColor: "var(--cbms-navy, #0a2463)",
                borderColor: "var(--cbms-navy, #0a2463)",
                color: "#ffffff",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              {busy && <span style={{ animation: "spin 1s linear infinite" }}>🔄</span>}
              <span>{busy ? "Scheduling..." : "Confirm Schedule"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
