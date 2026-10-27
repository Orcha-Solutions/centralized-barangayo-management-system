"use client";

import * as React from "react";
import type { KpCase } from "../../../../lib/types";

export interface KpDetailActionsProps {
  caseData: KpCase | null;
  onPrint: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function KpDetailActions({
  caseData,
  onPrint,
  onDelete,
  isDeleting,
}: KpDetailActionsProps) {
  const [open, setOpen] = React.useState(false);

  if (!caseData) return null;

  const isLocked = Boolean(caseData.isLocked);

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        id="kp-detail-actions-btn"
        className="cbms-btn"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
          padding: "0.5rem 0.85rem",
          fontSize: "0.875rem",
          backgroundColor: "var(--color-bg-card, #fff)",
          border: "1px solid var(--color-border, #e2e8f0)",
          borderRadius: "0.375rem",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        ⚙️ Actions ▾
      </button>

      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "110%",
              backgroundColor: "var(--color-bg-card, #ffffff)",
              border: "1px solid var(--color-border, #e2e8f0)",
              borderRadius: "0.375rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              zIndex: 50,
              minWidth: "185px",
              display: "flex",
              flexDirection: "column",
              padding: "0.25rem 0",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onPrint();
              }}
              style={{
                padding: "0.6rem 1rem",
                textAlign: "left",
                border: "none",
                background: "none",
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "var(--color-text, #1b2430)",
                fontWeight: 500,
                width: "100%",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              🖨️ Print Docket
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              disabled={isLocked || isDeleting}
              title={
                isLocked
                  ? "Case docket is locked. Unlock it before deleting."
                  : "Delete this KP case"
              }
              style={{
                padding: "0.6rem 1rem",
                textAlign: "left",
                border: "none",
                background: "none",
                fontSize: "0.85rem",
                cursor: isLocked ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: isLocked ? "#94a3b8" : "var(--cbms-red, #ce1126)",
                fontWeight: 500,
                width: "100%",
                opacity: isLocked ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLocked) {
                  e.currentTarget.style.backgroundColor = "#fef2f2";
                }
              }}
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              🗑️ Delete Case
            </button>
          </div>
        </>
      )}
    </div>
  );
}
