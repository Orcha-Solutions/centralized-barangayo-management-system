"use client";

import * as React from "react";
import type { KpCase } from "../../../../lib/types";

export interface KpDetailActionsProps {
  caseData: KpCase | null;
  onPrint: () => void;
  onScheduleHearing?: () => void;
  onAdvanceStage?: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function KpDetailActions({
  caseData,
  onPrint,
  onScheduleHearing,
  onAdvanceStage,
  onDelete,
  isDeleting,
}: KpDetailActionsProps) {
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

  if (!caseData) return null;

  const isLocked = Boolean(caseData.isLocked);
  const isClosed = Boolean(caseData.closedAt);

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
    <div style={{ position: "relative" }}>
      <button
        type="button"
        id="kp-detail-actions-btn"
        className="cbms-btn cbms-btn--primary"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: "0.5rem 0.95rem",
          fontSize: "0.875rem",
          fontWeight: 600,
          backgroundColor: "var(--cbms-navy, #0a2463)",
          borderColor: "var(--cbms-navy, #0a2463)",
          color: "#ffffff",
          cursor: "pointer",
          borderRadius: "0.375rem",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
        }}
      >
        <span>⚙️ Actions</span>
        <span style={{ fontSize: "0.75rem", opacity: 0.85 }}>▾</span>
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
              top: "calc(100% + 4px)",
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "0.5rem",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              zIndex: 50,
              minWidth: "210px",
              display: "flex",
              flexDirection: "column",
              padding: "0.35rem 0",
              overflow: "hidden",
            }}
          >
            {/* Print Official Docket */}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onPrint();
              }}
              style={itemStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span>🖨️</span>
              <span>Print Case Docket</span>
            </button>

            {/* Schedule Hearing (if not closed or locked) */}
            {onScheduleHearing && !isLocked && !isClosed && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onScheduleHearing();
                }}
                style={itemStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <span>📅</span>
                <span>Schedule Hearing</span>
              </button>
            )}

            {/* Advance Statutory Stage (if not closed or locked) */}
            {onAdvanceStage && !isLocked && !isClosed && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onAdvanceStage();
                }}
                style={itemStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <span>⚡</span>
                <span>Advance Statutory Stage</span>
              </button>
            )}

            {/* Divider before Delete */}
            <div style={{ height: "1px", backgroundColor: "#f1f5f9", margin: "0.3rem 0" }} />

            {/* Delete Case */}
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
                ...itemStyle,
                color: isLocked ? "#94a3b8" : "var(--cbms-ink, #0f172a)",
                cursor: isLocked ? "not-allowed" : "pointer",
                opacity: isLocked ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLocked) {
                  e.currentTarget.style.backgroundColor = "#fee2e2";
                  e.currentTarget.style.color = "#dc2626";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = isLocked ? "#94a3b8" : "var(--cbms-ink, #0f172a)";
              }}
            >
              <span>🗑️</span>
              <span>Delete Case Docket</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
