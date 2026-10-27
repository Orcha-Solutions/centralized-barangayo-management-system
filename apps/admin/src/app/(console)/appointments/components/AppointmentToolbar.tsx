"use client";

import * as React from "react";
import { APPOINTMENT_STATUSES } from "../../../../lib/labels";
import { titleize } from "@cbms/ui";

export interface AppointmentToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  service: string;
  onServiceChange: (val: string) => void;
  totalAppointments: number;
  canBook: boolean;
  onOpenBook: () => void;
  viewMode: "table" | "calendar";
  onViewModeChange: (mode: "table" | "calendar") => void;
}

export const APPOINTMENT_SERVICES = [
  "Barangay Clearance",
  "Certificate of Indigency",
  "Cedula (Community Tax Certificate)",
  "Business Permit Endorsement",
  "Katarungang Pambarangay Hearing",
  "Health & Medical Service",
  "General Public Assistance",
];

export function AppointmentToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  service,
  onServiceChange,
  totalAppointments,
  canBook,
  onOpenBook,
  viewMode,
  onViewModeChange,
}: AppointmentToolbarProps) {
  const [inputValue, setInputValue] = React.useState(search);

  // Sync internal input when external search prop changes
  React.useEffect(() => {
    setInputValue(search);
  }, [search]);

  // Debounced server search trigger: requires at least 3 characters or empty string to reset
  React.useEffect(() => {
    const trimmed = inputValue.trim();
    if (trimmed.length === 0) {
      if (search !== "") {
        onSearchChange("");
      }
      return;
    }
    if (trimmed.length < 3) {
      // Rule: At least 3 characters must be inputted before API triggers
      return;
    }

    const timer = setTimeout(() => {
      onSearchChange(trimmed);
    }, 350);

    return () => clearTimeout(timer);
  }, [inputValue, search, onSearchChange]);

  const handleClear = () => {
    setInputValue("");
    onSearchChange("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (trimmed.length === 0 || trimmed.length >= 3) {
        onSearchChange(trimmed);
      }
    }
  };

  const isSearchPending = inputValue.trim().length > 0 && inputValue.trim().length < 3;
  const isSearchActive = search.trim().length >= 3;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.85rem 1rem",
        backgroundColor: "var(--color-bg-subtle, #f8fafc)",
        border: "1px solid var(--color-border, #e2e8f0)",
        borderRadius: "0.5rem",
        marginBottom: "1rem",
      }}
    >
      {/* Search Input with 3-char minimum threshold & 350ms debounce */}
      <div style={{ position: "relative", minWidth: 260, flex: 1 }}>
        <input
          type="text"
          className="cbms-input"
          placeholder="🔍 Server search: queue #, citizen, service, notes (min 3 chars)..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ width: "100%", paddingRight: inputValue ? "2rem" : "0.75rem" }}
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
            title="Clear search"
          >
            ✕
          </button>
        )}
        {isSearchPending && (
          <div style={{ fontSize: "0.72rem", color: "#f59e0b", position: "absolute", top: "100%", left: 2, marginTop: 2 }}>
            ⚠️ Type at least 3 characters to trigger server-side search...
          </div>
        )}
        {isSearchActive && (
          <div style={{ fontSize: "0.72rem", color: "#0284c7", position: "absolute", top: "100%", left: 2, marginTop: 2 }}>
            ✓ Server search active for &ldquo;{search}&rdquo;
          </div>
        )}
      </div>

      {/* Status Filter */}
      <div style={{ minWidth: 160 }}>
        <select
          className="cbms-input"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="all">All Statuses</option>
          {APPOINTMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {titleize(s)}
            </option>
          ))}
        </select>
      </div>

      {/* Service Filter */}
      <div style={{ minWidth: 200 }}>
        <select
          className="cbms-input"
          value={service}
          onChange={(e) => onServiceChange(e.target.value)}
        >
          <option value="all">All Services</option>
          {APPOINTMENT_SERVICES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 500 }}>
          {totalAppointments} appointment(s)
        </span>

        {/* View Mode Switcher */}
        <div
          style={{
            display: "inline-flex",
            backgroundColor: "var(--color-bg-card, #ffffff)",
            border: "1px solid var(--color-border, #e2e8f0)",
            borderRadius: "0.375rem",
            padding: "2px",
          }}
        >
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            style={{
              border: "none",
              background: viewMode === "table" ? "var(--cbms-navy, #0a2463)" : "transparent",
              color: viewMode === "table" ? "#ffffff" : "var(--cbms-ink, #1b2430)",
              padding: "4px 9px",
              borderRadius: "4px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              transition: "all 0.15s",
            }}
            title="Switch to Tabular List View"
          >
            <span>📋</span>
            <span>Table</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("calendar")}
            style={{
              border: "none",
              background: viewMode === "calendar" ? "var(--cbms-navy, #0a2463)" : "transparent",
              color: viewMode === "calendar" ? "#ffffff" : "var(--cbms-ink, #1b2430)",
              padding: "4px 9px",
              borderRadius: "4px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              transition: "all 0.15s",
            }}
            title="Switch to Interactive Calendar View"
          >
            <span>📅</span>
            <span>Calendar</span>
          </button>
        </div>

        {canBook && (
          <button
            type="button"
            className="cbms-btn cbms-btn--primary"
            onClick={onOpenBook}
            style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "0.35rem" }}
          >
            <span>➕</span>
            <span>Book Appointment</span>
          </button>
        )}
      </div>
    </div>
  );
}
