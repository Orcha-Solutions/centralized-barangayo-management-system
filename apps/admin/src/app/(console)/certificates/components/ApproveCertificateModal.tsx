"use client";

import * as React from "react";
import type { CertificateRequest } from "../../../../lib/types";

export interface ApproveCertificateModalProps {
  open: boolean;
  certificate: CertificateRequest | null;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ApproveCertificateModal({
  open,
  certificate,
  busy,
  onCancel,
  onConfirm,
}: ApproveCertificateModalProps) {
  if (!open || !certificate) return null;

  const applicantName = certificate.inhabitant
    ? `${certificate.inhabitant.firstName ?? ""} ${certificate.inhabitant.lastName ?? ""}`.trim()
    : "Walk-in Resident";

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
          <span style={{ fontSize: "1.4rem" }}>⚠️</span>
          <h3 style={{ margin: 0, color: "#0369a1", fontSize: "1.15rem" }}>
            Confirm Status Change: Approve & Release
          </h3>
        </div>

        <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.9rem", color: "#334155", lineHeight: 1.5 }}>
          You are about to change the status of document request <strong>{certificate.referenceNo}</strong> for{" "}
          <strong>{applicantName}</strong> to <strong>Approved & Released</strong>.
        </p>

        <div
          style={{
            backgroundColor: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: "0.375rem",
            padding: "0.75rem",
            fontSize: "0.82rem",
            color: "#0369a1",
            marginBottom: "1.25rem",
            lineHeight: 1.45,
          }}
        >
          <strong>Notice:</strong> Changing this status will officially apply the Punong Barangay seal, activate the public QR verification code, and record this issuance in the barangay registry audit log.
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
            type="button"
            className="cbms-btn cbms-btn--primary"
            onClick={onConfirm}
            disabled={busy}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontWeight: 600 }}
          >
            {busy && <span style={{ animation: "spin 1s linear infinite" }}>🔄</span>}
            Confirm & Release
          </button>
        </div>
      </div>
    </div>
  );
}
