"use client";

import * as React from "react";

interface FeatureToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  showBadge?: boolean;
}

export function FeatureToggleSwitch({
  id,
  checked,
  onChange,
  label,
  disabled = false,
  size = "md",
  showBadge = true,
}: FeatureToggleSwitchProps) {
  const isSm = size === "sm";

  const trackWidth = isSm ? 38 : 46;
  const trackHeight = isSm ? 22 : 26;
  const knobSize = isSm ? 16 : 20;
  const knobTravel = isSm ? 16 : 20;

  return (
    <label
      htmlFor={id}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        userSelect: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          width: `${trackWidth}px`,
          height: `${trackHeight}px`,
          backgroundColor: checked ? "#16a34a" : "#cbd5e1",
          borderRadius: "9999px",
          transition: "background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: checked
            ? "0 0 0 1px #15803d, 0 1px 2px rgba(22, 163, 74, 0.3)"
            : "0 0 0 1px #94a3b8, 0 1px 2px rgba(0, 0, 0, 0.05)",
          flexShrink: 0,
        }}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            borderWidth: 0,
          }}
          role="switch"
          aria-checked={checked}
        />
        <span
          style={{
            position: "absolute",
            top: "3px",
            left: "3px",
            width: `${knobSize}px`,
            height: `${knobSize}px`,
            backgroundColor: "#ffffff",
            borderRadius: "50%",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.25)",
            transform: checked ? `translateX(${knobTravel}px)` : "translateX(0px)",
            transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>

      {showBadge && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: isSm ? "1px 6px" : "2px 8px",
            borderRadius: "9999px",
            fontSize: isSm ? "0.68rem" : "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.03em",
            textTransform: "uppercase",
            backgroundColor: checked ? "#dcfce7" : "#f1f5f9",
            color: checked ? "#15803d" : "#64748b",
            border: checked ? "1px solid #86efac" : "1px solid #cbd5e1",
          }}
        >
          {checked ? "Visible" : "Hidden"}
        </span>
      )}

      {label && (
        <span
          style={{
            fontSize: isSm ? "0.8rem" : "0.875rem",
            fontWeight: 600,
            color: checked ? "var(--color-text, #0f172a)" : "var(--color-text-muted, #64748b)",
          }}
        >
          {label}
        </span>
      )}
    </label>
  );
}
