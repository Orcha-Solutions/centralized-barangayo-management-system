"use client";

import * as React from "react";

export interface ToastProps {
  open: boolean;
  message: string;
  description?: string;
  tone?: "success" | "danger" | "info";
  duration?: number;
  onClose: () => void;
}

export function Toast({
  open,
  message,
  description,
  tone = "success",
  duration = 4000,
  onClose,
}: ToastProps) {
  React.useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [open, duration, onClose]);

  if (!open) return null;

  const isSuccess = tone === "success";
  const isDanger = tone === "danger";

  const borderColor = isSuccess ? "#86efac" : isDanger ? "#fca5a5" : "#93c5fd";
  const bgColor = isSuccess ? "#f0fdf4" : isDanger ? "#fef2f2" : "#eff6ff";
  const iconColor = isSuccess ? "#16a34a" : isDanger ? "#dc2626" : "#2563eb";
  const titleColor = isSuccess ? "#14532d" : isDanger ? "#7f1d1d" : "#1e3a8a";

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 3000,
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: "8px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)",
        padding: "14px 18px",
        minWidth: "320px",
        maxWidth: "440px",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        transition: "all 0.2s ease-in-out",
      }}
    >
      <div
        style={{
          color: iconColor,
          fontSize: "1.15rem",
          lineHeight: 1,
          marginTop: 2,
          flexShrink: 0,
          fontWeight: "bold",
        }}
      >
        {isSuccess ? "✓" : isDanger ? "⚠️" : "ℹ️"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: titleColor }}>
          {message}
        </div>
        {description && (
          <div style={{ fontSize: "0.8rem", color: "#475569", marginTop: 3, lineHeight: 1.4 }}>
            {description}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          fontSize: "1.2rem",
          lineHeight: 1,
          cursor: "pointer",
          color: "#94a3b8",
          padding: 2,
          flexShrink: 0,
        }}
        aria-label="Dismiss toast"
      >
        ×
      </button>
    </div>
  );
}
