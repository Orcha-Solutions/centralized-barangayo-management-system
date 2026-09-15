"use client";

import * as React from "react";

export interface TourStep {
  id: string;
  targetId: string;
  title: string;
  badge: string;
  roleIcon?: string;
  description: string;
  capabilities?: string[];
  tip?: string;
  actionText?: string;
  actionId?: string;
}

export interface TourGuideOverlayProps {
  steps: TourStep[];
  enabled: boolean;
  onToggle: (next: boolean) => void;
  onStepChange?: (index: number, step: TourStep) => void;
  onAction?: (actionId?: string, step?: TourStep) => void;
  isActionActive?: boolean;
}

export function TourGuideOverlay({
  steps,
  enabled,
  onToggle,
  onStepChange,
  onAction,
  isActionActive,
}: TourGuideOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [targetRect, setTargetRect] = React.useState<DOMRect | null>(null);

  const step = steps[currentStepIndex];

  // Recalculate target element bounding box
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
  }, [updateTargetPosition, isActionActive]);

  // Recheck position periodically in case modal/drawer animations settle
  React.useEffect(() => {
    if (!enabled) return;
    const t1 = setTimeout(updateTargetPosition, 100);
    const t2 = setTimeout(updateTargetPosition, 300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [enabled, currentStepIndex, updateTargetPosition, isActionActive]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onToggle(false);
      } else if (e.key === "ArrowRight") {
        if (currentStepIndex < steps.length - 1) {
          handleNext();
        }
      } else if (e.key === "ArrowLeft") {
        if (currentStepIndex > 0) {
          handlePrev();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, currentStepIndex, steps.length]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      onStepChange?.(nextIndex, steps[nextIndex]);
    } else {
      onToggle(false);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      onStepChange?.(prevIndex, steps[prevIndex]);
    }
  };

  if (!enabled || !step) return null;

  const pointerTop = targetRect
    ? Math.max(10, targetRect.top + Math.min(30, targetRect.height / 2) - 15)
    : 100;
  const pointerLeft = targetRect
    ? Math.max(10, targetRect.left + Math.min(40, targetRect.width / 2) - 15)
    : 100;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <>
      <style>{`
        @keyframes cbmsBeaconRipple {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        @keyframes cbmsPointerBob {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-9px) rotate(-3deg); }
        }
        @keyframes cbmsTargetGlow {
          0%, 100% { box-shadow: 0 0 0 3px #2563eb, 0 0 20px rgba(37, 99, 235, 0.45); }
          50% { box-shadow: 0 0 0 5px #60a5fa, 0 0 32px rgba(96, 165, 250, 0.7); }
        }
      `}</style>

      {/* BACKDROP */}
      <div
        role="presentation"
        onClick={() => onToggle(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(10, 25, 47, 0.42)",
          backdropFilter: "blur(2px)",
          zIndex: 1340,
          transition: "opacity 0.2s ease",
        }}
      />

      {/* TARGET SPOTLIGHT GLOW */}
      {targetRect && (
        <div
          role="presentation"
          style={{
            position: "fixed",
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            borderRadius: 10,
            pointerEvents: "none",
            zIndex: 1345,
            animation: "cbmsTargetGlow 2s ease-in-out infinite",
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
            zIndex: 1400,
            pointerEvents: "none",
            transition: "top 0.3s cubic-bezier(0.16, 1, 0.3, 1), left 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Pulsing Beacon Ripple */}
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

          {/* Bobbing Cursor */}
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
              <path
                d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L5.85 2.36a.5.5 0 0 0-.35.85Z"
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>

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

      {/* TOUR POPOVER CARD */}
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
                    ? Math.max(20, targetRect.top - 290)
                    : Math.min((typeof window !== "undefined" ? window.innerHeight : 800) - 340, targetRect.bottom + 16)
                  : "50%",
                left: targetRect
                  ? Math.min(
                      (typeof window !== "undefined" ? window.innerWidth : 1200) - 440,
                      Math.max(24, targetRect.left + (targetRect.width > 300 ? 0 : 30)),
                    )
                  : "50%",
                transform: targetRect ? "none" : "translate(-50%, -50%)",
                maxWidth: 420,
                width: "100%",
              }),
          background: "#ffffff",
          borderRadius: 16,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(37, 99, 235, 0.15)",
          padding: "20px 22px",
          zIndex: 1360,
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
              {currentStepIndex + 1} / {steps.length}
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

        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          {step.roleIcon && <span style={{ fontSize: 20 }}>{step.roleIcon}</span>}
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 800,
              color: "#0a2463",
              lineHeight: 1.3,
            }}
          >
            {step.title}
          </h3>
        </div>

        {/* Description */}
        <p
          style={{
            margin: "0 0 12px 0",
            fontSize: 13,
            lineHeight: 1.5,
            color: "#334155",
          }}
        >
          {step.description}
        </p>

        {/* Capabilities List */}
        {step.capabilities && step.capabilities.length > 0 && (
          <ul
            style={{
              margin: "0 0 12px 0",
              paddingLeft: 18,
              fontSize: 12,
              lineHeight: 1.5,
              color: "#475569",
            }}
          >
            {step.capabilities.map((c, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                {c}
              </li>
            ))}
          </ul>
        )}

        {/* Tip Box */}
        {step.tip && (
          <div
            style={{
              background: "#f8fafc",
              borderLeft: "3px solid #fdb913",
              padding: "8px 12px",
              borderRadius: "0 8px 8px 0",
              fontSize: 11.5,
              color: "#475569",
              marginBottom: 14,
            }}
          >
            <strong>Tip:</strong> {step.tip}
          </div>
        )}

        {/* Optional Action Button */}
        {step.actionText && (
          <div style={{ marginBottom: 14 }}>
            <button
              type="button"
              onClick={() => onAction?.(step.actionId, step)}
              style={{
                width: "100%",
                background: isActionActive ? "#10b981" : "#eff6ff",
                color: isActionActive ? "#ffffff" : "#1d4ed8",
                border: isActionActive ? "1px solid #059669" : "1px solid #bfdbfe",
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
              {isActionActive ? "✓ Active / Opened" : step.actionText}
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
            {steps.map((_, i) => (
              <span
                key={i}
                onClick={() => {
                  setCurrentStepIndex(i);
                  onStepChange?.(i, steps[i]);
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
            {currentStepIndex === steps.length - 1 ? "Finish Tour ✓" : "Next ➔"}
          </button>
        </div>
      </div>
    </>
  );
}

/**
 * Static right-side chat-style UI widget for toggling any Guide ON / OFF
 * Matches the minimal "Guide" label specification
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
        zIndex: 1350,
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
