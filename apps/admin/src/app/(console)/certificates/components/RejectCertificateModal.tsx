"use client";

import * as React from "react";
import type { CertificateRequest } from "../../../../lib/types";

export interface RejectCertificateModalProps {
  open: boolean;
  certificate: CertificateRequest | null;
  busy: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

export function RejectCertificateModal({
  open,
  certificate,
  busy,
  onCancel,
  onConfirm,
}: RejectCertificateModalProps) {
  const [reason, setReason] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open]);

  if (!open || !certificate) return null;

  const applicantName = certificate.inhabitant
    ? `${certificate.inhabitant.firstName ?? ""} ${certificate.inhabitant.lastName ?? ""}`.trim()
    : "Walk-in Resident";

  const isValid = reason.trim().length >= 3;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || busy) return;
    onConfirm(reason.trim());
  }

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
          <span style={{ fontSize: "1.3rem" }}>✖️</span>
          <h3 style={{ margin: 0, color: "#b45309", fontSize: "1.15rem" }}>
            Reject Document Request
          </h3>
        </div>

        <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.9rem", color: "#334155", lineHeight: 1.5 }}>
          You are changing the status to <strong>Rejected</strong> for <strong>{applicantName}</strong> (
          <em>{certificate.type?.name ?? "Barangay Clearance"}</em>, Ref: <code>{certificate.referenceNo}</code>).
        </p>

        <div
          style={{
            backgroundColor: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "0.375rem",
            padding: "0.75rem",
            fontSize: "0.82rem",
            color: "#92400e",
            marginBottom: "1rem",
            lineHeight: 1.45,
          }}
        >
          <strong>Warning:</strong> Changing this document&apos;s status to <strong>Rejected</strong> is an official administrative decision. The reason will be provided to the citizen and recorded in the audit trail.
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="reject-reason-input"
              style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#475569", marginBottom: "0.35rem" }}
            >
              Reason for rejection * (minimum 3 characters)
            </label>
            <textarea
              id="reject-reason-input"
              className="cbms-textarea"
              rows={3}
              style={{ width: "100%", resize: "vertical" }}
              placeholder="e.g. Incomplete residency requirements, pending unresolved dispute..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={busy}
              autoFocus
            />
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
              This reason will be visible to the resident and recorded in the audit trail.
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <button
              type="button"
              className="cbms-btn"
              onClick={onCancel}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cbms-btn cbms-btn--danger"
              disabled={!isValid || busy}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
            >
              {busy && <span style={{ animation: "spin 1s linear infinite" }}>🔄</span>}
              Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
