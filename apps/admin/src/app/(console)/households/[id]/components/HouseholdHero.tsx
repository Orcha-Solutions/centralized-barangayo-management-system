"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { titleize } from "@cbms/ui";
import type { Household } from "../../../../../lib/types";

export interface HouseholdHeroProps {
  household: Household;
  onEdit: () => void;
  onDelete: () => void;
}

export function HouseholdHero({ household: h, onEdit, onDelete }: HouseholdHeroProps) {
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = React.useState(false);

  const handleCopyNo = () => {
    navigator.clipboard?.writeText(h.householdNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg-card, #ffffff)",
        border: "1px solid var(--color-border, #e2e8f0)",
        borderRadius: "14px",
        padding: "1.75rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05), 0 8px 16px -4px rgba(0, 0, 0, 0.03)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative subtle backdrop accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #0a2463 0%, #2563eb 50%, #f59e0b 100%)",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1.25rem",
        }}
      >
        <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start", minWidth: 280 }}>
          {/* Household Badge Icon */}
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "12px",
              backgroundColor: "#eff6ff",
              border: "1px solid #bfdbfe",
              display: "grid",
              placeItems: "center",
              fontSize: "1.75rem",
              flexShrink: 0,
              boxShadow: "0 2px 6px rgba(37, 99, 235, 0.08)",
            }}
          >
            🏠
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: "1.45rem",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "var(--color-text, #0f172a)",
                }}
              >
                {h.householdNo}
              </h1>

              <button
                type="button"
                onClick={handleCopyNo}
                title="Copy household control number"
                style={{
                  background: copied ? "#dcfce7" : "#f1f5f9",
                  border: `1px solid ${copied ? "#86efac" : "#cbd5e1"}`,
                  color: copied ? "#15803d" : "#475569",
                  borderRadius: 6,
                  padding: "2px 8px",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {copied ? "✓ Copied" : "📋 Copy"}
              </button>

              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#1e40af",
                  backgroundColor: "#dbeafe",
                  padding: "2px 8px",
                  borderRadius: 999,
                  letterSpacing: "0.03em",
                }}
              >
                DILG BIMS FORM A1
              </span>
            </div>

            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "#334155",
                marginTop: 4,
              }}
            >
              {h.householdName ? `${h.householdName}` : "Domestic Household Registry"}
            </div>

            <div
              style={{
                fontSize: "0.85rem",
                color: "#64748b",
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexWrap: "wrap",
              }}
            >
              <span>📍 {h.purok || "Unassigned Purok"}</span>
              {h.sitio && <span>· Sitio {h.sitio}</span>}
              {h.addressLine && <span>· {h.addressLine}</span>}
            </div>

            {/* Badges / Chips */}
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 6,
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  color: "#1e293b",
                }}
              >
                👨‍👩‍👧‍👦 {titleize(h.householdType || "Nuclear Family")}
              </span>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 6,
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  color: "#1e293b",
                }}
              >
                🔑 {titleize(h.tenureStatus || "Owner")} · {titleize(h.housingUnit || "Single House")}
              </span>

              {h.is4Ps ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: "12px",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 6,
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    color: "#166534",
                  }}
                >
                  ✓ 4Ps Beneficiary
                </span>
              ) : (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    fontSize: "12px",
                    fontWeight: 500,
                    padding: "3px 10px",
                    borderRadius: 6,
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    color: "#64748b",
                  }}
                >
                  Non-4Ps
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            className="cbms-btn"
            onClick={() => router.push("/households")}
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              padding: "0.5rem 0.95rem",
              borderRadius: "6px",
            }}
          >
            ← Back to List
          </button>

          <div style={{ position: "relative" }}>
            <button
              id="household-detail-actions-btn"
              type="button"
              onClick={() => setShowActionsDropdown(!showActionsDropdown)}
              className="cbms-btn cbms-btn--primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                borderRadius: "6px",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
              }}
            >
              ⚙️ Actions ▾
            </button>

            {showActionsDropdown && (
              <>
                <div
                  style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
                  onClick={() => setShowActionsDropdown(false)}
                />
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "115%",
                    backgroundColor: "var(--color-bg-card, #ffffff)",
                    border: "1px solid var(--color-border, #e2e8f0)",
                    borderRadius: "8px",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
                    zIndex: 50,
                    minWidth: "180px",
                    display: "flex",
                    flexDirection: "column",
                    padding: "0.35rem 0",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onEdit();
                      setShowActionsDropdown(false);
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
                      fontWeight: 600,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    ✏️ Edit Profile
                  </button>

                  <div style={{ height: "1px", backgroundColor: "#e2e8f0", margin: "4px 0" }} />

                  <button
                    type="button"
                    onClick={() => {
                      onDelete();
                      setShowActionsDropdown(false);
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
                      color: "var(--cbms-red, #ce1126)",
                      fontWeight: 600,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#fef2f2")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    🗑️ Delete Record
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
