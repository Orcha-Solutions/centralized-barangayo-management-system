"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { InhabitantDetail } from "../../../../../lib/types";

export interface InhabitantDetailActionsProps {
  inhabitant: InhabitantDetail | null;
  mayEncode?: boolean;
  onEdit: () => void;
  onMarkDeceased: () => void;
  onDelete: () => void;
}

export function InhabitantDetailActions({
  inhabitant: p,
  mayEncode = true,
  onEdit,
  onMarkDeceased,
  onDelete,
}: InhabitantDetailActionsProps) {
  const router = useRouter();
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

  if (!p) return null;

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
        id="inhabitant-detail-actions-btn"
        className="cbms-btn cbms-btn--primary"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          fontWeight: 600,
          cursor: "pointer",
          backgroundColor: "var(--cbms-navy, #0a2463)",
          borderColor: "var(--cbms-navy, #0a2463)",
          color: "#ffffff",
          boxShadow: "0 1px 3px rgba(10, 36, 99, 0.2)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--cbms-navy-2, #0d2f82)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--cbms-navy, #0a2463)")}
        title="Inhabitant Actions"
      >
        <span>⚙️</span>
        Actions ▾
      </button>

      {open && (
        <>
          {/* Backdrop overlay */}
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
            {/* Edit Profile */}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              style={itemStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span>✏️</span>
              <span>Edit Profile</span>
            </button>

            {/* Mark as Deceased (Form A3) */}
            {!p.isDeceased && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onMarkDeceased();
                }}
                style={itemStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <span>✝</span>
                <span>Mark as Deceased (Form A3)</span>
              </button>
            )}

            {/* Divider */}
            <div style={{ height: "1px", backgroundColor: "#f1f5f9", margin: "0.3rem 0" }} />

            {/* Delete Profile */}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              style={itemStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span>🗑️</span>
              <span>Delete Profile</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
