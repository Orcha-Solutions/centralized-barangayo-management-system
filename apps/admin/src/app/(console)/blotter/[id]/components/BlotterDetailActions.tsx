"use client";

import * as React from "react";
import type { BlotterEntry } from "../../../../../lib/types";

export interface BlotterDetailActionsProps {
  entry: BlotterEntry | null | undefined;
  onOpenEdit: () => void;
  onOpenDelete: () => void;
  onOpenNewAction: () => void;
  canLogAction: boolean;
}

export function BlotterDetailActions({
  entry,
  onOpenEdit,
  onOpenDelete,
  onOpenNewAction,
  canLogAction,
}: BlotterDetailActionsProps) {
  const [showDropdown, setShowDropdown] = React.useState(false);

  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      {/* Action Dropdown Button with Edit & Delete */}
      <div style={{ position: "relative" }}>
        <button
          id="blotter-detail-actions-btn"
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="cbms-btn cbms-btn--primary"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.45rem 0.85rem",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ⚙️ Actions ▾
        </button>
        {showDropdown && (
          <>
            <div
              style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
              onClick={() => setShowDropdown(false)}
            />
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "110%",
                backgroundColor: "var(--color-bg-card, #ffffff)",
                border: "1px solid var(--color-border, #e2e8f0)",
                borderRadius: "0.375rem",
                boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                zIndex: 50,
                minWidth: "200px",
                display: "flex",
                flexDirection: "column",
                padding: "0.35rem 0",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowDropdown(false);
                  onOpenEdit();
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
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                ✏️ Edit Blotter Entry
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowDropdown(false);
                  onOpenDelete();
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
                  color: "var(--cbms-red, #dc2626)",
                  fontWeight: 500,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#fef2f2")
                }
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                🗑️ Delete Blotter Entry
              </button>

              <div style={{ height: "1px", backgroundColor: "var(--color-border, #e2e8f0)", margin: "0.25rem 0" }} />

              {canLogAction && (
                <button
                  type="button"
                  onClick={() => {
                    setShowDropdown(false);
                    onOpenNewAction();
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
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  ➕ Record Action
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowDropdown(false);
                  window.print();
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
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                🖨️ Print Form C1 / D1
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
