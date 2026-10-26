"use client";

import * as React from "react";
import type { Appointment } from "../../../../lib/types";

export interface DeleteAppointmentModalProps {
  open: boolean;
  appointment: Appointment | null;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteAppointmentModal({
  open,
  appointment,
  busy,
  onCancel,
  onConfirm,
}: DeleteAppointmentModalProps) {
  const [typedConfirmation, setTypedConfirmation] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setTypedConfirmation("");
    }
  }, [open]);

  if (!open || !appointment) return null;

  // The expected string for confirmation is the queue number, or if missing, the service name
  const expectedConfirmation = (appointment.queueNumber || appointment.service).trim();
  const isMatch = typedConfirmation.trim().toLowerCase() === expectedConfirmation.toLowerCase();

  const residentName = appointment.inhabitant
    ? `${appointment.inhabitant.firstName} ${appointment.inhabitant.lastName}`
    : "Walk-in Citizen";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "0.5rem",
          maxWidth: 480,
          width: "100%",
          padding: "1.5rem",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "1.5rem" }}>⚠️</span>
          <h3 style={{ margin: 0, color: "#dc2626", fontSize: "1.15rem" }}>
            Delete Appointment Ticket
          </h3>
        </div>

        <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.9rem", color: "#334155", lineHeight: 1.5 }}>
          You are about to permanently delete the appointment for <strong>{residentName}</strong> (
          <em>{appointment.service}</em>, scheduled at {new Date(appointment.scheduledAt).toLocaleString()}).
        </p>

        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "0.375rem",
            padding: "0.75rem",
            fontSize: "0.82rem",
            color: "#991b1b",
            marginBottom: "1rem",
            lineHeight: 1.45,
          }}
        >
          <strong>Warning:</strong> This action cannot be undone and will remove the audit queue ticket from ARTA / Citizen&apos;s Charter processing logs.
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#475569", marginBottom: "0.35rem" }}>
            To confirm, please type <code style={{ backgroundColor: "#f1f5f9", padding: "0.1rem 0.35rem", borderRadius: 4, color: "#0f172a" }}>{expectedConfirmation}</code> below:
          </label>
          <input
            type="text"
            className="cbms-input"
            style={{ width: "100%", borderColor: typedConfirmation && !isMatch ? "#ef4444" : undefined }}
            placeholder={`Type ${expectedConfirmation} here`}
            value={typedConfirmation}
            onChange={(e) => setTypedConfirmation(e.target.value)}
            disabled={busy}
            autoFocus
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button
            type="button"
            className="cbms-btn"
            disabled={busy}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="cbms-btn cbms-btn--danger"
            disabled={busy || !isMatch}
            onClick={onConfirm}
            style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
          >
            {busy && <span style={{ animation: "spin 1s linear infinite" }}>🔄</span>}
            <span>{busy ? "Deleting..." : "Permanently Delete"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
