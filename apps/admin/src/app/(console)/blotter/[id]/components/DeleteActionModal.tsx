"use client";

import * as React from "react";
import type { BlotterActionLog } from "../../../../../lib/types";

export interface DeleteActionModalProps {
  action: BlotterActionLog | null;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteActionModal({
  action,
  busy,
  onCancel,
  onConfirm,
}: DeleteActionModalProps) {
  if (!action) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
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
          maxWidth: 440,
          width: "100%",
          padding: "1.5rem",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h3 style={{ margin: "0 0 0.5rem 0", color: "#dc2626" }}>🗑️ Delete Timeline Action</h3>
        <p style={{ margin: "0 0 1rem 0", fontSize: "0.9rem", color: "#475569", lineHeight: 1.5 }}>
          Are you sure you want to remove <strong>&ldquo;{action.actionTaken}&rdquo;</strong> from this blotter&apos;s history? This action cannot be undone.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
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
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? "Deleting..." : "Delete Action"}
          </button>
        </div>
      </div>
    </div>
  );
}
