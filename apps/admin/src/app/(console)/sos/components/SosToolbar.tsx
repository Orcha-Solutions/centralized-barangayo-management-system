"use client";

import * as React from "react";
import { SOS_KINDS, SOS_STATUSES } from "../../../../lib/labels";

export interface SosToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  kind: string;
  onKindChange: (value: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (columnKey: string, order: "asc" | "desc") => void;
  total: number;
  mayEncode: boolean;
  onOpenCreate: () => void;
  connected?: boolean;
}

export function SosToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  kind,
  onKindChange,
  sortBy,
  sortOrder,
  onSortChange,
  total,
  mayEncode,
  onOpenCreate,
  connected = false,
}: SosToolbarProps) {
  const isSearchActive = search.trim().length >= 3;
  const isSearchPending = search.trim().length > 0 && search.trim().length < 3;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        marginBottom: "1rem",
        backgroundColor: "var(--color-bg-card, #ffffff)",
        padding: "1rem",
        borderRadius: "0.5rem",
        border: "1px solid var(--color-border, #e2e8f0)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        {/* Search input with 3-character threshold rule */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flex: 1, minWidth: "280px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input
              type="text"
              placeholder="🔍 Search resident name, kind, notes… (min 3 chars)"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="cbms-input"
              style={{
                width: "100%",
                paddingRight: isSearchPending ? "120px" : "2rem",
              }}
            />
            {isSearchPending && (
              <span
                style={{
                  position: "absolute",
                  right: "0.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "10.5px",
                  color: "#d97706",
                  fontWeight: 600,
                  backgroundColor: "#fef3c7",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                Type {3 - search.trim().length} more
              </span>
            )}
            {search && !isSearchPending && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                style={{
                  position: "absolute",
                  right: "0.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--cbms-muted, #64748b)",
                  fontSize: "14px",
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filters and Actions */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          {/* Emergency Kind Filter */}
          <select
            value={kind}
            onChange={(e) => onKindChange(e.target.value)}
            className="cbms-select"
            style={{ fontSize: "0.85rem", padding: "0.4rem 0.6rem" }}
          >
            <option value="all">All Emergency Types</option>
            {SOS_KINDS.map((k) => (
              <option key={k} value={k} style={{ textTransform: "capitalize" }}>
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="cbms-select"
            style={{ fontSize: "0.85rem", padding: "0.4rem 0.6rem" }}
          >
            <option value="all">All Statuses</option>
            {SOS_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ").toUpperCase()}
              </option>
            ))}
          </select>

          {/* Realtime Live Feed Status Badge */}
          <div
            title={connected ? "Connected to realtime SSE dispatch feed" : "Connecting to realtime feed..."}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 600,
              backgroundColor: connected ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${connected ? "#bbf7d0" : "#fecaca"}`,
              color: connected ? "#166534" : "#991b1b",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: connected ? "#22c55e" : "#ef4444",
                boxShadow: connected ? "0 0 6px #22c55e" : "none",
              }}
            />
            {connected ? "LIVE SSE" : "OFFLINE"}
          </div>

          {/* Trigger Alert Button */}
          {mayEncode && (
            <button
              type="button"
              onClick={onOpenCreate}
              style={{
                backgroundColor: "#dc2626",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                padding: "0.45rem 0.85rem",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 4px rgba(220, 38, 38, 0.25)",
              }}
            >
              <span>🚨</span>
              <span>Trigger SOS Alert</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
