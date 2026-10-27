"use client";

import * as React from "react";
import type { CertificateRequest } from "../../../../lib/types";

export interface CertificateDetailActionsProps {
  certificate: CertificateRequest | null;
  busy: boolean;
  mayApprove: boolean;
  mayDelete: boolean;
  actionable: boolean;
  onPrint: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
}

export function CertificateDetailActions({
  certificate,
  busy,
  mayApprove,
  mayDelete,
  actionable,
  onPrint,
  onApprove,
  onReject,
  onDelete,
}: CertificateDetailActionsProps) {
  const [open, setOpen] = React.useState(false);

  // Close on Escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [open]);

  if (!certificate) return null;

  const isPrintable = certificate.status === "released" || certificate.status === "approved";
  const canApprove = mayApprove && actionable;
  const canReject = actionable;
  const canDelete = mayDelete;

  const hasAnyAction = isPrintable || canApprove || canReject || canDelete;

  const itemStyle: React.CSSProperties = {
    padding: "0.55rem 1rem",
    textAlign: "left",
    border: "none",
    background: "none",
    fontSize: "0.85rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
    color: "var(--cbms-ink, #0f172a)",
    fontWeight: 500,
    width: "100%",
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "#f8fafc";
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "transparent";
  };

  return (
    <div className="adm-noprint" style={{ position: "relative" }}>
      <button
        type="button"
        id="certificate-detail-actions-btn"
        className="cbms-btn cbms-btn--primary"
        onClick={() => setOpen((prev) => !prev)}
        disabled={busy || !hasAnyAction}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          fontWeight: 600,
          cursor: busy || !hasAnyAction ? "not-allowed" : "pointer",
          backgroundColor: "var(--cbms-navy, #0a2463)",
          borderColor: "var(--cbms-navy, #0a2463)",
          color: "#ffffff",
          boxShadow: "0 1px 3px rgba(10, 36, 99, 0.2)",
        }}
        onMouseEnter={(e) => {
          if (!busy && hasAnyAction) e.currentTarget.style.backgroundColor = "var(--cbms-navy-2, #0d2f82)";
        }}
        onMouseLeave={(e) => {
          if (!busy && hasAnyAction) e.currentTarget.style.backgroundColor = "var(--cbms-navy, #0a2463)";
        }}
        title="Actions"
      >
        {busy ? (
          <span style={{ animation: "spin 1s linear infinite" }}>🔄</span>
        ) : (
          <span>⚙️</span>
        )}
        Actions ▾
      </button>

      {open && (
        <>
          {/* Backdrop overlay for closing on click outside */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
          />

          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 6px)",
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "0.5rem",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.08)",
              zIndex: 50,
              minWidth: "215px",
              display: "flex",
              flexDirection: "column",
              padding: "0.35rem 0",
            }}
          >
            {/* Print Certificate */}
            {isPrintable && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onPrint();
                }}
                disabled={busy}
                style={itemStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <span>🖨️</span>
                <span>Print Certificate</span>
              </button>
            )}

            {/* Approve & Release */}
            {canApprove && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onApprove();
                }}
                disabled={busy}
                style={itemStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <span>✍️</span>
                <span>Approve & Release</span>
              </button>
            )}

            {/* Reject Request */}
            {canReject && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onReject();
                }}
                disabled={busy}
                style={itemStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <span>✖️</span>
                <span>Reject Request</span>
              </button>
            )}

            {/* Divider if Delete is visible alongside other actions */}
            {canDelete && (isPrintable || canApprove || canReject) && (
              <div style={{ height: "1px", backgroundColor: "#f1f5f9", margin: "0.3rem 0" }} />
            )}

            {/* Delete Request */}
            {canDelete && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onDelete();
                }}
                disabled={busy}
                style={itemStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <span>🗑️</span>
                <span>Delete Request</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
