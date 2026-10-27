"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { age, date, fullName, titleize } from "@cbms/ui";
import { SectorChips } from "../../../../../components/common";
import { InhabitantDetailActions } from "./InhabitantDetailActions";
import type { InhabitantDetail } from "../../../../../lib/types";

export interface InhabitantHeroProps {
  inhabitant: InhabitantDetail;
  mayEncode: boolean;
  onEdit: () => void;
  onMarkDeceased: () => void;
  onDelete: () => void;
}

export function InhabitantHero({
  inhabitant: p,
  mayEncode,
  onEdit,
  onMarkDeceased,
  onDelete,
}: InhabitantHeroProps) {
  const router = useRouter();
  const [copiedPcn, setCopiedPcn] = React.useState(false);

  const handleCopyPcn = () => {
    if (!p.philsysNo) return;
    navigator.clipboard?.writeText(p.philsysNo);
    setCopiedPcn(true);
    setTimeout(() => setCopiedPcn(false), 2000);
  };

  const initials = `${p.firstName?.charAt(0) || ""}${p.lastName?.charAt(0) || ""}`.toUpperCase() || "IN";

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg-card, #ffffff)",
        border: "1px solid var(--color-border, #e2e8f0)",
        borderRadius: "14px",
        padding: "1.75rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05), 0 8px 16px -4px rgba(0, 0, 0, 0.03)",
        position: "relative",
      }}
    >
      {/* Decorative subtle backdrop accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #0a2463 0%, #2563eb 50%, #f59e0b 100%)",
          borderTopLeftRadius: "14px",
          borderTopRightRadius: "14px",
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
          {/* Inhabitant Avatar Badge */}
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "12px",
              backgroundColor: p.isDeceased ? "#fef2f2" : "#eff6ff",
              border: `1px solid ${p.isDeceased ? "#fecaca" : "#bfdbfe"}`,
              color: p.isDeceased ? "#991b1b" : "#1d4ed8",
              display: "grid",
              placeItems: "center",
              fontSize: "1.35rem",
              fontWeight: 800,
              flexShrink: 0,
              boxShadow: "0 2px 6px rgba(37, 99, 235, 0.08)",
            }}
          >
            {p.isDeceased ? "✝" : initials}
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
                {fullName(p)}
              </h1>

              {p.philsysNo && (
                <button
                  type="button"
                  onClick={handleCopyPcn}
                  title="Copy PhilSys Card Number"
                  style={{
                    background: copiedPcn ? "#dcfce7" : "#f1f5f9",
                    border: `1px solid ${copiedPcn ? "#86efac" : "#cbd5e1"}`,
                    color: copiedPcn ? "#15803d" : "#475569",
                    borderRadius: 6,
                    padding: "2px 8px",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {copiedPcn ? "✓ Copied" : `PCN ${p.philsysNo} 📋`}
                </button>
              )}

              {p.isDeceased ? (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#991b1b",
                    backgroundColor: "#fee2e2",
                    padding: "2px 8px",
                    borderRadius: 999,
                    letterSpacing: "0.03em",
                  }}
                >
                  ✝ DECEASED (FORM A3)
                </span>
              ) : (
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
                  DILG BIMS FORM A2
                </span>
              )}
            </div>

            <div
              style={{
                fontSize: "0.85rem",
                color: "#64748b",
                marginTop: 6,
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span>🎂 {age(p.birthDate) ?? "—"} years old ({date(p.birthDate)})</span>
              <span>·</span>
              <span>⚧ {titleize(p.sex)} {p.gender && p.gender !== p.sex ? `(${titleize(p.gender)})` : ""}</span>
              <span>·</span>
              <span>💍 {titleize(p.civilStatus ?? "Single")}</span>
              <span>·</span>
              <span>📍 {p.household?.addressLine ?? p.household?.purok ? `Purok ${p.household.purok}` : "Barangay Jurisdiction"}</span>
            </div>

            {/* Sectoral Badges */}
            <div style={{ marginTop: 10 }}>
              <SectorChips row={p} />
            </div>
          </div>
        </div>

        {/* Action Controls in Hero */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            type="button"
            className="cbms-btn adm-noprint"
            onClick={() => router.push("/inhabitants")}
          >
            ← Back to list
          </button>

          <InhabitantDetailActions
            inhabitant={p}
            mayEncode={mayEncode}
            onEdit={onEdit}
            onMarkDeceased={onMarkDeceased}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
}
