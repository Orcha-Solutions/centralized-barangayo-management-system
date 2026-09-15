"use client";

import * as React from "react";

export interface TourStep {
  id: string;
  targetId: string;
  roleEmail?: string;
  title: string;
  badge: string;
  roleIcon: string;
  roleTag: string;
  description: string;
  capabilities: string[];
  tip: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome-rbac",
    targetId: "tour-role-selector",
    title: "Role-Based Access Control (DILG RBAC)",
    badge: "Step 1 of 5 · Introduction",
    roleIcon: "🎭",
    roleTag: "DILG MC 2025-104 Compliant",
    description:
      "Welcome to the CBMS Barangay Console! The platform implements Role-Based Access Control (RBAC). Each official has specialized dashboards and modules tailored to their governance duties.",
    capabilities: [
      "10 official barangay roles with segregated access permissions",
      "One-click demo selector for instant role simulation",
      "Automatic credential auto-fill for testing",
    ],
    tip: "Click 'Next' to learn which role to select for your evaluation goals.",
  },
  {
    id: "punong-barangay",
    targetId: "tour-role-kapitan",
    roleEmail: "kapitan@barangka.gov.ph",
    title: "Punong Barangay (Barangay Captain)",
    badge: "Step 2 of 5 · Executive Super Admin",
    roleIcon: "🏛️",
    roleTag: "Super Admin · Full Access",
    description:
      "Select Punong Barangay if you want to experience complete, unrestricted access as the Chief Executive of the local government unit.",
    capabilities: [
      "Full oversight across all 18 barangay modules",
      "Executive approvals for resolutions and ordinances",
      "High-level analytics, purok scorecard, and AI insights",
    ],
    tip: "Recommended if you want to explore all administrative menus and features without limitations.",
  },
  {
    id: "barangay-secretary",
    targetId: "tour-role-secretary",
    roleEmail: "secretary@barangka.gov.ph",
    title: "Barangay Secretary",
    badge: "Step 3 of 5 · Frontline Registry",
    roleIcon: "📝",
    roleTag: "Records & Issuances Desk",
    description:
      "Select Barangay Secretary to manage official public records, issue citizen documents, and oversee the inhabitant registry.",
    capabilities: [
      "Manage the Inhabitant Registry and Masterlist",
      "Issue Barangay Clearances, Indigency, and First Time Jobseeker certificates",
      "Manage official appointments and community calendar",
    ],
    tip: "Ideal for testing citizen document issuance workflows and printing certificates.",
  },
  {
    id: "specialized-desks",
    targetId: "tour-role-tanod",
    roleEmail: "tanod@barangka.gov.ph",
    title: "Specialized Desk Roles (Tanod, VAW, Lupon, Treasurer)",
    badge: "Step 4 of 5 · Specialized Operations",
    roleIcon: "🚨",
    roleTag: "Public Safety & Specialized Desks",
    description:
      "Each desk officer has a dedicated dashboard to maintain strict data privacy and compartmentalized security:",
    capabilities: [
      "Barangay Tanod: 24/7 SOS alerts, blotter recording, and public safety",
      "VAW Desk: Confidential intake of VAWC cases (RA 9262)",
      "Lupon Tagapamayapa: KP mediation, summons, and hearing schedules",
      "Barangay Treasurer: E-wallet subsidy batches and financial ledgers",
    ],
    tip: "You can click any role in the grid to preview that office's specialized view.",
  },
  {
    id: "sign-in-action",
    targetId: "tour-submit-btn",
    title: "Ready to Enter the Console",
    badge: "Step 5 of 5 · Quick Sign In",
    roleIcon: "🚀",
    roleTag: "Ready to Explore",
    description:
      "Once your desired role is selected, the email and standard demo password (Cbms#2026) are automatically filled.",
    capabilities: [
      "Click 'Sign in to Console' to immediately enter the dashboard",
      "Switch roles anytime by signing out",
      "Turn this tour guide ON or OFF anytime using the Guide widget on the right",
    ],
    tip: "Click the button below to finish the tour and enter the console!",
  },
];

interface LoginTourGuideProps {
  enabled: boolean;
  onToggle: (next: boolean) => void;
  onSelectRole: (email: string) => void;
  currentEmail: string;
}

export function LoginTourGuide({ enabled, onToggle, onSelectRole, currentEmail }: LoginTourGuideProps) {
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [targetRect, setTargetRect] = React.useState<DOMRect | null>(null);

  const step = TOUR_STEPS[currentStepIndex];

  // Recalculate target element position whenever step changes or on window resize/scroll
  const updateTargetPosition = React.useCallback(() => {
    if (!enabled || !step) {
      setTargetRect(null);
      return;
    }

    const el = document.getElementById(step.targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [enabled, step]);

  React.useEffect(() => {
    updateTargetPosition();
    const handleResize = () => updateTargetPosition();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  }, [updateTargetPosition]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onToggle(false);
      } else if (e.key === "ArrowRight") {
        if (currentStepIndex < TOUR_STEPS.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        }
      } else if (e.key === "ArrowLeft") {
        if (currentStepIndex > 0) {
          setCurrentStepIndex((prev) => prev - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, currentStepIndex, onToggle]);

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      const nextStep = TOUR_STEPS[nextIndex];
      if (nextStep.roleEmail) {
        onSelectRole(nextStep.roleEmail);
      }
    } else {
      onToggle(false);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      const prevStep = TOUR_STEPS[prevIndex];
      if (prevStep.roleEmail) {
        onSelectRole(prevStep.roleEmail);
      }
    }
  };

  const handlePickThisRole = () => {
    if (step.roleEmail) {
      onSelectRole(step.roleEmail);
    }
  };

  // If disabled, render nothing
  if (!enabled) return null;

  // Calculate coordinates for mouse pointer
  const pointerTop = targetRect ? Math.max(10, targetRect.top + targetRect.height / 2 - 12) : 200;
  const pointerLeft = targetRect ? Math.max(10, targetRect.left - 16) : 200;

  // Mobile check
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <>
      {/* Keyframe animations */}
      <style>{`
        @keyframes cbmsPointerBob {
          0% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-6px, -6px) scale(1.06);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }

        @keyframes cbmsBeaconRipple {
          0% {
            transform: scale(0.6);
            opacity: 1;
          }
          100% {
            transform: scale(2.6);
            opacity: 0;
          }
        }

        @keyframes cbmsTargetGlow {
          0%, 100% {
            box-shadow: 0 0 0 3px #2563eb, 0 0 20px rgba(37, 99, 235, 0.45);
          }
          50% {
            box-shadow: 0 0 0 4px #60a5fa, 0 0 30px rgba(96, 165, 250, 0.7);
          }
        }

        .cbms-tour-target-highlight {
          position: relative !important;
          z-index: 101 !important;
          animation: cbmsTargetGlow 2s infinite ease-in-out !important;
          border-radius: 8px !important;
        }
      `}</style>

      {/* Dimmed backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(7, 26, 71, 0.65)",
          backdropFilter: "blur(2px)",
          zIndex: 90,
          transition: "all 0.3s ease",
        }}
        onClick={() => onToggle(false)}
      />

      {/* Target Element Spotlight Halo */}
      {targetRect && (
        <div
          style={{
            position: "fixed",
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            borderRadius: 10,
            boxShadow: "0 0 0 3px #3b82f6, 0 0 25px rgba(59, 130, 246, 0.6)",
            pointerEvents: "none",
            zIndex: 95,
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      )}

      {/* ANIMATED MOUSE POINTER */}
      {targetRect && (
        <div
          style={{
            position: "fixed",
            top: pointerTop,
            left: pointerLeft,
            zIndex: 110,
            pointerEvents: "none",
            transition: "top 0.3s cubic-bezier(0.16, 1, 0.3, 1), left 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Pulsing Beacon Ripple Ring */}
          <div
            style={{
              position: "absolute",
              top: -6,
              left: -6,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "rgba(37, 99, 235, 0.35)",
              border: "2px solid #60a5fa",
              animation: "cbmsBeaconRipple 1.6s cubic-bezier(0.2, 0.8, 0.2, 1) infinite",
            }}
          />

          {/* Bobbing Mouse Cursor Icon */}
          <div
            style={{
              animation: "cbmsPointerBob 1.4s ease-in-out infinite",
              transformOrigin: "top left",
            }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.45))" }}
            >
              {/* Sleek SaaS Blue Mouse Pointer */}
              <path
                d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L5.85 2.36a.5.5 0 0 0-.35.85Z"
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>

            {/* Hint Label Attached to Cursor */}
            <div
              style={{
                position: "absolute",
                top: 24,
                left: 18,
                background: "#071a47",
                color: "#fdb913",
                padding: "3px 8px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 800,
                whiteSpace: "nowrap",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                border: "1px solid rgba(253,185,19,0.4)",
              }}
            >
              👈 Click Here!
            </div>
          </div>
        </div>
      )}

      {/* SAAS TOUR POPOVER CARD */}
      <div
        style={{
          position: "fixed",
          ...(isMobile
            ? {
                bottom: 16,
                left: 14,
                right: 14,
                maxWidth: "calc(100% - 28px)",
              }
            : {
                top: targetRect
                  ? targetRect.top > (typeof window !== "undefined" ? window.innerHeight * 0.55 : 400)
                    ? Math.max(16, targetRect.top - 290)
                    : Math.min((typeof window !== "undefined" ? window.innerHeight : 800) - 340, targetRect.bottom + 16)
                  : "50%",
                left: targetRect
                  ? Math.min((typeof window !== "undefined" ? window.innerWidth : 1200) - 440, Math.max(20, targetRect.left + (targetRect.width > 300 ? 0 : 30)))
                  : "50%",
                transform: targetRect ? "none" : "translate(-50%, -50%)",
                maxWidth: 420,
                width: "100%",
              }),
          background: "#ffffff",
          borderRadius: 16,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(37, 99, 235, 0.15)",
          padding: "20px 22px",
          zIndex: 105,
          color: "#1e293b",
          boxSizing: "border-box",
          transition: "top 0.3s ease, left 0.3s ease",
        }}
      >
        {/* Header Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                color: "#1d4ed8",
                fontSize: 11,
                fontWeight: 800,
                padding: "3px 8px",
                borderRadius: 6,
                border: "1px solid #bfdbfe",
              }}
            >
              {step.badge}
            </span>
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
              {currentStepIndex + 1} / {TOUR_STEPS.length}
            </span>
          </div>

            <button
            type="button"
            onClick={() => onToggle(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              fontSize: 18,
              cursor: "pointer",
              padding: "2px 6px",
              lineHeight: 1,
            }}
            title="Close guide"
          >
            ✕
          </button>
        </div>

        {/* Step Title & Icon */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 24, lineHeight: 1 }}>{step.roleIcon}</span>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--cbms-navy, #0a2463)" }}>
              {step.title}
            </h3>
            <div style={{ fontSize: 11.5, color: "#2563eb", fontWeight: 700 }}>{step.roleTag}</div>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: 12.5, color: "#475569", margin: "0 0 10px", lineHeight: 1.45 }}>
          {step.description}
        </p>

        {/* Capabilities bullet points */}
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "8px 12px",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: "#334155", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.03em" }}>
            Key Responsibilities & Modules:
          </div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11.5, color: "#475569", lineHeight: 1.45 }}>
            {step.capabilities.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>

        {/* Tip */}
        <div style={{ fontSize: 11.5, color: "#059669", fontWeight: 600, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
          <span>💡</span>
          <span>{step.tip}</span>
        </div>

        {/* Action Button: Try this role if applicable */}
        {step.roleEmail && (
          <div style={{ marginBottom: 12 }}>
            <button
              type="button"
              onClick={handlePickThisRole}
              style={{
                width: "100%",
                background: currentEmail === step.roleEmail ? "#10b981" : "#eff6ff",
                color: currentEmail === step.roleEmail ? "#ffffff" : "#1d4ed8",
                border: currentEmail === step.roleEmail ? "1px solid #059669" : "1px solid #bfdbfe",
                borderRadius: 8,
                padding: "7px 12px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                transition: "all 0.15s ease",
              }}
            >
              {currentEmail === step.roleEmail ? (
                <>✓ {step.title} Selected!</>
              ) : (
                <>👉 Select This Role</>
              )}
            </button>
          </div>
        )}

        {/* Navigation Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 10,
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            style={{
              background: "transparent",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              color: currentStepIndex === 0 ? "#94a3b8" : "#334155",
              cursor: currentStepIndex === 0 ? "not-allowed" : "pointer",
            }}
          >
            ← Previous
          </button>

          {/* Progress dots */}
          <div style={{ display: "flex", gap: 5 }}>
            {TOUR_STEPS.map((_, i) => (
              <span
                key={i}
                onClick={() => {
                  setCurrentStepIndex(i);
                  if (TOUR_STEPS[i].roleEmail) onSelectRole(TOUR_STEPS[i].roleEmail!);
                }}
                style={{
                  width: i === currentStepIndex ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === currentStepIndex ? "#2563eb" : "#cbd5e1",
                  display: "inline-block",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            style={{
              background: "#2563eb",
              border: "none",
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 700,
              color: "#ffffff",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(37, 99, 235, 0.3)",
            }}
          >
            {currentStepIndex === TOUR_STEPS.length - 1 ? "Finish Tour ✓" : "Next ➔"}
          </button>
        </div>
      </div>
    </>
  );
}

/**
 * Static right-side chat-style UI widget for toggling the First-Time Guide ON / OFF
 * Designed similar to modern website chat launchers with minimal "Guide" label only
 */
export function GuideToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: (next: boolean) => void;
}) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <aside
      role="complementary"
      aria-label="Guide toggle"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 120,
        fontFamily: "var(--cbms-font-sans, system-ui, -apple-system, sans-serif)",
        pointerEvents: "auto",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        onClick={() => onToggle(!enabled)}
        style={{
          background: enabled
            ? "linear-gradient(135deg, #1d4ed8 0%, #0a2463 100%)"
            : "#ffffff",
          color: enabled ? "#ffffff" : "#0f172a",
          border: enabled ? "1.5px solid #60a5fa" : "1.5px solid #cbd5e1",
          borderRadius: 30,
          padding: "8px 14px 8px 10px",
          boxShadow: enabled
            ? "0 10px 25px -3px rgba(37, 99, 235, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.1)"
            : "0 10px 25px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          display: "flex",
          alignItems: "center",
          gap: 9,
          cursor: "pointer",
          userSelect: "none",
          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: isHovered ? "scale(1.04)" : "scale(1)",
        }}
        title={`Guide: ${enabled ? "ON" : "OFF"}`}
      >
        {/* Avatar Bubble with live pulsing indicator */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: enabled ? "#2563eb" : "#f1f5f9",
            color: enabled ? "#ffffff" : "#2563eb",
            display: "grid",
            placeItems: "center",
            fontSize: 16,
            position: "relative",
            flexShrink: 0,
            boxShadow: enabled ? "0 0 0 2px rgba(255,255,255,0.4)" : "none",
          }}
        >
          {enabled ? "🧭" : "💡"}

          {/* Live indicator dot */}
          <span
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: enabled ? "#10b981" : "#94a3b8",
              border: "2px solid #ffffff",
              boxShadow: enabled ? "0 0 8px #10b981" : "none",
            }}
          />
        </div>

        {/* Label: Strictly "Guide" */}
        <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.01em" }}>
          Guide
        </span>

        {/* The Toggle Slider Switch */}
        <div
          style={{
            width: 34,
            height: 20,
            borderRadius: 12,
            background: enabled ? "#10b981" : "#cbd5e1",
            position: "relative",
            transition: "background 0.2s ease",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#ffffff",
              position: "absolute",
              top: 2,
              left: enabled ? 16 : 2,
              transition: "left 0.2s ease",
              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            }}
          />
        </div>

        {/* ON / OFF Text Badge */}
        <span
          style={{
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.03em",
            color: enabled ? "#4ade80" : "#64748b",
            minWidth: 26,
            textAlign: "left",
          }}
        >
          {enabled ? "ON" : "OFF"}
        </span>
      </button>
    </aside>
  );
}

export const RightSideGuideWidget = GuideToggle;
