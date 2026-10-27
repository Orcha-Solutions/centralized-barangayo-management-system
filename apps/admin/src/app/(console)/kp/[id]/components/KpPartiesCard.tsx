"use client";

import * as React from "react";
import Link from "next/link";
import { Chip } from "@cbms/ui";
import type { KpCase } from "../../../../../lib/types";

export interface KpPartiesCardProps {
  caseData: KpCase;
}

export function KpPartiesCard({ caseData: c }: KpPartiesCardProps) {
  const parties = c.parties ?? [];

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
      }}
    >
      <div
        style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.1rem" }}>👥</span>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--cbms-navy, #0a2463)" }}>
              Dispute Parties Dossier
            </h3>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
              Complainants & Respondents Registered
            </span>
          </div>
        </div>
        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
          {parties.length} Record(s)
        </span>
      </div>

      <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        {parties.length === 0 ? (
          <div style={{ padding: "1.5rem", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>
            No parties registered on this case docket.
          </div>
        ) : (
          parties.map((p, idx) => {
            const isComplainant = p.role === "complainant";
            const partyName = p.inhabitant
              ? `${p.inhabitant.firstName ?? ""} ${p.inhabitant.lastName ?? ""}`.trim()
              : (p.nameOverride ?? "Unspecified");

            return (
              <div
                key={p.id || idx}
                style={{
                  border: isComplainant ? "1px solid #bfdbfe" : "1px solid #fed7aa",
                  borderRadius: "0.5rem",
                  padding: "0.95rem 1.15rem",
                  backgroundColor: isComplainant ? "#f8fafc" : "#fffbeb",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "1rem" }}>{isComplainant ? "🛡️" : "🎯"}</span>
                    <div>
                      {p.inhabitant?.id ? (
                        <Link
                          href={`/inhabitants/${p.inhabitant.id}`}
                          style={{
                            fontWeight: 700,
                            fontSize: "0.92rem",
                            color: "var(--cbms-navy, #0a2463)",
                            textDecoration: "underline",
                            textUnderlineOffset: "2px",
                          }}
                        >
                          {partyName}
                        </Link>
                      ) : (
                        <span style={{ fontWeight: 700, fontSize: "0.92rem", color: "#1e293b" }}>
                          {partyName}
                        </span>
                      )}
                    </div>
                  </div>

                  <Chip tone={isComplainant ? "navy" : "gold"}>
                    {isComplainant ? "Complainant" : "Respondent"}
                  </Chip>
                </div>

                {/* Address & Contact Information */}
                <div style={{ fontSize: "0.78rem", color: "#64748b", display: "flex", flexDirection: "column", gap: 3, marginTop: 2 }}>
                  <div>
                    📍 <strong>Address:</strong> {p.address || "Barangay Jurisdiction"}
                  </div>
                  {(p.contact || p.inhabitant?.contactPhone) && (
                    <div>
                      📞 <strong>Contact:</strong> {p.contact || p.inhabitant?.contactPhone}
                    </div>
                  )}
                  {p.inhabitant && (
                    <div style={{ fontSize: "0.72rem", color: "#2563eb", marginTop: 2 }}>
                      ✓ Verified Inhabitant Profile linked
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
