"use client";

import * as React from "react";
import { rateTone } from "@/lib/types";

const TONE_VAR: Record<"green" | "gold" | "red", string> = {
  green: "var(--cbms-green)",
  gold: "var(--cbms-gold)",
  red: "var(--cbms-red)",
};

/**
 * A pure-CSS horizontal bar for an adoption percentage. Scaled against 100%
 * so the bars stay comparable between the top and bottom panels.
 */
export function RateBar({
  label,
  rate,
  rank,
  sub,
}: {
  label: string;
  rate: number;
  rank?: number;
  sub?: string;
}) {
  const tone = rateTone(rate);
  const width = Math.max(2, Math.min(100, rate));

  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          marginBottom: 5,
          fontSize: 13,
        }}
      >
        {rank !== undefined && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--cbms-muted)",
              minWidth: 18,
            }}
          >
            {rank}.
          </span>
        )}
        <span style={{ fontWeight: 600, flex: 1, minWidth: 0 }}>{label}</span>
        <span style={{ fontWeight: 700, color: TONE_VAR[tone] }}>{rate.toFixed(1)}%</span>
      </div>
      <div
        style={{
          height: 9,
          borderRadius: 999,
          background: "var(--cbms-card)",
          overflow: "hidden",
        }}
        role="img"
        aria-label={`${label}: ${rate.toFixed(1)} percent of adults registered`}
      >
        <div
          style={{
            width: `${width}%`,
            height: "100%",
            borderRadius: 999,
            background: TONE_VAR[tone],
            transition: "width .3s ease",
          }}
        />
      </div>
      {sub && (
        <div style={{ fontSize: 11.5, color: "var(--cbms-muted)", marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}
