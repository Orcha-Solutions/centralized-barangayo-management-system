"use client";

import * as React from "react";
import { Button, Toolbar, num } from "@cbms/ui";

export interface HouseholdsToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  purok: string;
  onPurokChange: (purok: string) => void;
  puroksList: string[];
  totalCount: number;
  mayEncode: boolean;
  onOpenCreate: () => void;
  onOpenBulkAdd: () => void;
}

export function HouseholdsToolbar({
  searchQuery,
  onSearchChange,
  purok,
  onPurokChange,
  puroksList,
  totalCount,
  mayEncode,
  onOpenCreate,
  onOpenBulkAdd,
}: HouseholdsToolbarProps) {
  const [inputValue, setInputValue] = React.useState(searchQuery);
  const [showActionsDropdown, setShowActionsDropdown] = React.useState(false);

  // Sync internal input when external searchQuery changes (e.g. cleared)
  React.useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Debounced trigger: requires at least 3 characters or empty string to reset
  React.useEffect(() => {
    const trimmed = inputValue.trim();
    if (trimmed.length === 0) {
      if (searchQuery !== "") {
        onSearchChange("");
      }
      return;
    }
    if (trimmed.length < 3) {
      // Rule: 3 characters must be inputed before api triggers in the front end
      return;
    }

    const timer = setTimeout(() => {
      onSearchChange(trimmed);
    }, 350);

    return () => clearTimeout(timer);
  }, [inputValue, searchQuery, onSearchChange]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed.length === 0 || trimmed.length >= 3) {
      onSearchChange(trimmed);
    }
  };

  const isShortInput = inputValue.trim().length > 0 && inputValue.trim().length < 3;

  return (
    <div id="households-toolbar">
      <Toolbar>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <input
              className="cbms-input cbms-input--search"
              placeholder="Search household no, name, street…"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{
                borderColor: isShortInput ? "#f59e0b" : undefined,
                width: 280,
              }}
            />
            {isShortInput && (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: "105%",
                  fontSize: "11px",
                  color: "#b45309",
                  background: "#fef3c7",
                  border: "1px solid #fde68a",
                  padding: "2px 8px",
                  borderRadius: 4,
                  zIndex: 20,
                  whiteSpace: "nowrap",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
                }}
              >
                Type at least 3 characters to search
              </span>
            )}
          </div>
          <Button type="submit" disabled={isShortInput}>
            Search
          </Button>
        </form>

        <select
          className="cbms-select"
          value={purok}
          onChange={(e) => onPurokChange(e.target.value)}
          style={{ minWidth: 140 }}
        >
          <option value="all">All puroks</option>
          {puroksList.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <div className="cbms-toolbar__spacer" />
        <span className="adm-muted" style={{ marginRight: "1rem" }}>
          {num(totalCount)} household(s)
        </span>

        <div style={{ position: "relative" }}>
          <button
            id="households-actions-btn"
            type="button"
            onClick={() => setShowActionsDropdown(!showActionsDropdown)}
            className="cbms-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              backgroundColor: "var(--color-bg-card, #fff)",
              border: "1px solid var(--color-border, #e2e8f0)",
              borderRadius: "0.375rem",
              cursor: "pointer",
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
                  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                  zIndex: 50,
                  minWidth: "190px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "0.3rem 0",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    onOpenCreate();
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
                  🏠 Add Household
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenBulkAdd();
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
                  👥 Bulk Add Households
                </button>
              </div>
            </>
          )}
        </div>
      </Toolbar>
    </div>
  );
}
