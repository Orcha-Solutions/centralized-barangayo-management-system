"use client";

import * as React from "react";
import { Button, Toolbar, num } from "@cbms/ui";
import { SECTORS } from "../../../../lib/labels";
import { downloadFromApi } from "../../../../lib/download";

interface InhabitantsToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  purok: string;
  onPurokChange: (purok: string) => void;
  puroksList: string[];
  sector: string;
  onSectorChange: (sector: string) => void;
  totalCount: number;
  mayEncode: boolean;
  onOpenDrawer: () => void;
  onOpenBulkAdd?: () => void;
  tourEnabled?: boolean;
  onToggleTour?: (enabled: boolean) => void;
  onExportError: (error: string | null) => void;
}

export function InhabitantsToolbar({
  searchQuery,
  onSearchChange,
  purok,
  onPurokChange,
  puroksList,
  sector,
  onSectorChange,
  totalCount,
  mayEncode,
  onOpenDrawer,
  onOpenBulkAdd,
  tourEnabled,
  onToggleTour,
  onExportError,
}: InhabitantsToolbarProps) {
  const [inputValue, setInputValue] = React.useState(searchQuery);
  const [showActionsDropdown, setShowActionsDropdown] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

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
      // Rule: 3 characters must be inputed before api triggers
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

  async function exportCsv() {
    setExporting(true);
    onExportError(null);
    try {
      await downloadFromApi(
        `/inhabitants/export?format=csv&search=${encodeURIComponent(
          searchQuery
        )}&purok=${encodeURIComponent(purok)}&sector=${encodeURIComponent(sector)}`,
        `inhabitants_${new Date().toISOString().slice(0, 10)}.csv`
      );
    } catch (err: any) {
      onExportError(err?.message || "Export failed. Please check network.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div id="tour-inhabitants-toolbar">
      <Toolbar>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <input
              className="cbms-input cbms-input--search"
              placeholder="Search name, PCN, or household…"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{
                borderColor: isShortInput ? "#f59e0b" : undefined,
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
                  padding: "2px 6px",
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
        >
          <option value="all">All puroks</option>
          {puroksList.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          className="cbms-select"
          value={sector}
          onChange={(e) => onSectorChange(e.target.value)}
        >
          <option value="all">All sectors</option>
          {SECTORS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <div className="cbms-toolbar__spacer" />
        <span className="adm-muted" style={{ marginRight: "1rem" }}>
          {num(totalCount)} resident(s)
        </span>

        <div style={{ position: "relative" }}>
          <button
            id="tour-export-actions"
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
                <button
                  id="tour-encode-btn"
                  type="button"
                  onClick={() => {
                    onOpenDrawer();
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
                  ➕ Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenBulkAdd?.();
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
                  👥 Bulk Add
                </button>

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

                <div style={{ height: "1px", backgroundColor: "#e2e8f0", margin: "4px 0" }} />
                <button
                  type="button"
                  onClick={() => {
                    exportCsv();
                    setShowActionsDropdown(false);
                  }}
                  disabled={exporting}
                  style={{
                    padding: "0.6rem 1rem",
                    textAlign: "left",
                    border: "none",
                    background: "none",
                    fontSize: "0.85rem",
                    cursor: exporting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "var(--color-text, #1b2430)",
                    opacity: exporting ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {exporting ? (
                    <>
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          border: "2px solid #94a3b8",
                          borderTopColor: "#1b2430",
                          borderRadius: "50%",
                          animation: "cbms-spin 0.7s linear infinite",
                          display: "inline-block",
                        }}
                      />
                      <span>Exporting…</span>
                    </>
                  ) : (
                    "⬇ Export (CSV)"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </Toolbar>
    </div>
  );
}
