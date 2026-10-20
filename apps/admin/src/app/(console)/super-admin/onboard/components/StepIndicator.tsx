"use client";

import * as React from "react";

interface StepIndicatorProps {
  step: 1 | 2 | 3 | 4;
  setStep: (s: 1 | 2 | 3 | 4) => void;
  hasDossier: boolean;
}

const STEPS = [
  {
    num: 1 as const,
    title: "Identity & Routing",
    sub: "Barangay Name, Subdomain & DB",
  },
  {
    num: 2 as const,
    title: "Executive Leadership",
    sub: "Punong Barangay & Credentials",
  },
  {
    num: 3 as const,
    title: "Statutory Defaults",
    sub: "Hall Office, Puroks & Fees",
  },
  {
    num: 4 as const,
    title: "Provision & Handover",
    sub: "Tenant Creation & Dossier",
  },
];

export function StepIndicator({ step, setStep, hasDossier }: StepIndicatorProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 14,
        padding: "24px 20px 22px",
        marginBottom: 24,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        overflowX: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          minWidth: 640,
          position: "relative",
        }}
      >
        {STEPS.map((s, idx) => {
          const isCompleted = step > s.num || (s.num === 4 && hasDossier);
          const isActive = step === s.num;
          const isLast = idx === STEPS.length - 1;

          return (
            <React.Fragment key={s.num}>
              {/* Circle Node & Labels */}
              <button
                type="button"
                onClick={() => setStep(s.num)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  width: 140,
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    transition: "all 0.2s ease",
                    background: isCompleted ? "#16a34a" : isActive ? "#2563eb" : "#f1f5f9",
                    color: isCompleted || isActive ? "#ffffff" : "#64748b",
                    border: isActive
                      ? "3px solid #bfdbfe"
                      : isCompleted
                      ? "3px solid #bbf7d0"
                      : "2px solid #cbd5e1",
                    boxShadow: isActive ? "0 0 0 3px rgba(37, 99, 235, 0.2)" : "none",
                  }}
                >
                  {isCompleted ? "✓" : s.num}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: "0.82rem",
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? "#1e3a8a" : isCompleted ? "#0f172a" : "#64748b",
                    lineHeight: 1.25,
                  }}
                >
                  {s.title}
                </div>
                <div
                  style={{
                    marginTop: 3,
                    fontSize: "0.72rem",
                    color: "#94a3b8",
                    lineHeight: 1.2,
                  }}
                >
                  {s.sub}
                </div>
              </button>

              {/* Connecting Line Segment between nodes */}
              {!isLast && (
                <div
                  style={{
                    flex: 1,
                    height: 3,
                    marginTop: 19,
                    marginLeft: -8,
                    marginRight: -8,
                    background: step > s.num ? "#16a34a" : "#e2e8f0",
                    transition: "background 0.3s ease",
                    position: "relative",
                    zIndex: 1,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
