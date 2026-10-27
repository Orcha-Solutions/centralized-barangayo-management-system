"use client";

import * as React from "react";
import type { KpCase } from "../../../../lib/types";

export interface DeleteKpModalProps {
  open: boolean;
  targetCase: KpCase | null;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteKpModal({
  open,
  targetCase,
  busy,
  onCancel,
  onConfirm,
}: DeleteKpModalProps) {
  const [typedConfirmation, setTypedConfirmation] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setTypedConfirmation("");
    }
  }, [open, targetCase]);

  if (!open || !targetCase) return null;

  const expectedMatch = targetCase.caseNo.trim();
  const isMatch = typedConfirmation.trim() === expectedMatch;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "var(--cbms-white, #ffffff)",
          borderRadius: "0.5rem",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          padding: "1.5rem",
          border: "1px solid var(--color-border, #e2e8f0)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.25rem",
              flexShrink: 0,
            }}
          >
            ⚠️
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#991b1b" }}>
              Delete Katarungang Pambarangay Case
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#64748b" }}>
              Permanent Statutory Record Removal
            </p>
          </div>
        </div>

        <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.5", margin: "0 0 1rem" }}>
          You are about to delete case <strong>{targetCase.caseNo}</strong> (<em>{targetCase.subject}</em>).
          This action will permanently delete all associated hearings, minutes, notices, and mediation history. This cannot be undone.
        </p>

        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#1b2430", marginBottom: 6 }}>
            Type <span style={{ color: "#dc2626", fontFamily: "monospace" }}>{expectedMatch}</span> to confirm deletion:
          </label>
          <input
            type="text"
            className="cbms-input"
            value={typedConfirmation}
            onChange={(e) => setTypedConfirmation(e.target.value)}
            placeholder={expectedMatch}
            style={{ width: "100%", fontFamily: "monospace" }}
            autoFocus
            disabled={busy}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button
            type="button"
            className="cbms-btn cbms-btn--subtle"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="cbms-btn cbms-btn--danger"
            disabled={!isMatch || busy}
            onClick={onConfirm}
            style={{ minWidth: 140, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}
          >
            {busy ? (
              <>
                <span className="cbms-spinner" style={{ width: 14, height: 14 }} />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Permanently</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
