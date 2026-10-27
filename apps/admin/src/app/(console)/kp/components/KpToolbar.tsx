"use client";

import * as React from "react";
import { KP_STAGES } from "../../../../lib/labels";
import { titleize } from "@cbms/ui";

export interface KpToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  stage: string;
  onStageChange: (val: string) => void;
  totalCases: number;
  onOpenGuide?: () => void;
  canEncode?: boolean;
  onOpenFileCase?: () => void;
  tourEnabled?: boolean;
  onToggleTour?: (next: boolean) => void;
}

export function KpToolbar({
  search,
  onSearchChange,
  stage,
  onStageChange,
  totalCases,
  onOpenGuide,
  canEncode,
  onOpenFileCase,
  tourEnabled,
  onToggleTour,
}: KpToolbarProps) {
  const [inputValue, setInputValue] = React.useState(search);
  const [showActionsDropdown, setShowActionsDropdown] = React.useState(false);

  // Sync internal input when external search prop changes (e.g. cleared externally)
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
      {/* Server-Side Search Input with 3-character threshold & 350ms debounce */}
      <div style={{ position: "relative", minWidth: 280, flex: 1 }}>
        <input
          type="text"
          className="cbms-input"
          placeholder="🔍 Server search: docket #, subject, facts, party name (min 3 chars)..."
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
            ⚠️ Type at least 3 characters to trigger server-side query...
          </div>
        )}
        {isSearchActive && (
          <div style={{ fontSize: "0.72rem", color: "#0284c7", position: "absolute", top: "100%", left: 2, marginTop: 2 }}>
            ✓ Server search active for &ldquo;{search}&rdquo;
          </div>
        )}
      </div>

      {/* Stage Filter */}
      <div style={{ minWidth: 180 }}>
        <select
          className="cbms-input"
          value={stage}
          onChange={(e) => onStageChange(e.target.value)}
        >
          <option value="all">All Stages</option>
          {KP_STAGES.map((s) => (
            <option key={s} value={s}>
              {titleize(s)}
            </option>
          ))}
        </select>
      </div>

      {/* Right Side: Case Count & Actions Button Dropdown (matching Inhabitants layout) */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "0.85rem", color: "#64748b"}}>
          {totalCases} case(s)
        </span>

        {/* Action Button Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            id="kp-actions-btn"
            type="button"
            onClick={() => setShowActionsDropdown(!showActionsDropdown)}
            className="cbms-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              backgroundColor: "var(--color-bg-card, #fff)",
              border: "1px solid var(--color-border, #e2e8f0)",
              borderRadius: "0.375rem",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            ⚙️ Actions ▾
          </button>

          {showActionsDropdown && (
            <>
              <div
                style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
                onClick={() => setShowActionsDropdown(false)}
              />
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "110%",
                  backgroundColor: "var(--color-bg-card, #ffffff)",
                  border: "1px solid var(--color-border, #e2e8f0)",
                  borderRadius: "0.375rem",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  zIndex: 50,
                  minWidth: "190px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "0.25rem 0",
                }}
              >
                {canEncode && onOpenFileCase && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenFileCase();
                      setShowActionsDropdown(false);
                    }}
                    style={{
                      padding: "0.6rem 1rem",
                      textAlign: "left",
                      border: "none",
                      background: "none",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "var(--color-text, #1b2430)",
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    ➕ File a Case
                  </button>
                )}

                {onToggleTour && (
                  <button
                    type="button"
                    onClick={() => {
                      onToggleTour(!tourEnabled);
                      setShowActionsDropdown(false);
                    }}
                    style={{
                      padding: "0.6rem 1rem",
                      textAlign: "left",
                      border: "none",
                      background: "none",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      color: "var(--color-text, #1b2430)",
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      🧭 Guide
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "10px",
                        backgroundColor: tourEnabled ? "#dcfce7" : "#f1f5f9",
                        color: tourEnabled ? "#15803d" : "#64748b",
                      }}
                    >
                      {tourEnabled ? "ON" : "OFF"}
                    </span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
