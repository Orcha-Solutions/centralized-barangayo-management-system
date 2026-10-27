"use client";

import * as React from "react";
import { Field } from "@cbms/ui";
import type { Household } from "../../../../../lib/types";

export interface InhabitantHouseholdPickerProps {
  householdId: string;
  relationToHead: string;
  households: Household[];
  disabled?: boolean;
  onChange: (householdId: string, relationToHead?: string) => void;
}

function isSubsequence(sub: string, str: string): boolean {
  let i = 0;
  let j = 0;
  while (i < sub.length && j < str.length) {
    if (sub[i] === str[j]) i++;
    j++;
  }
  return i === sub.length;
}

const RELATION_OPTIONS = [
  { value: "Head", label: "Head of Household" },
  { value: "Spouse", label: "Spouse" },
  { value: "Son", label: "Son" },
  { value: "Daughter", label: "Daughter" },
  { value: "Father", label: "Father" },
  { value: "Mother", label: "Mother" },
  { value: "Brother", label: "Brother" },
  { value: "Sister", label: "Sister" },
  { value: "Grandfather", label: "Grandfather" },
  { value: "Grandmother", label: "Grandmother" },
  { value: "Grandson", label: "Grandson" },
  { value: "Granddaughter", label: "Granddaughter" },
  { value: "Son-in-Law", label: "Son-in-Law" },
  { value: "Daughter-in-Law", label: "Daughter-in-Law" },
  { value: "Relative", label: "Other Relative" },
  { value: "Househelper / Domestic", label: "Househelper / Domestic Worker" },
  { value: "Boarder / Non-Relative", label: "Boarder / Non-Relative" },
];

export function InhabitantHouseholdPicker({
  householdId,
  relationToHead,
  households,
  disabled = false,
  onChange,
}: InhabitantHouseholdPickerProps) {
  const [householdSearch, setHouseholdSearch] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [visibleCount, setVisibleCount] = React.useState(20);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    }
    if (isSearching) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isSearching]);

  // Focus input when search opens
  React.useEffect(() => {
    if (isSearching) {
      inputRef.current?.focus();
    }
  }, [isSearching]);

  // Reset lazy-loading count to 20 when search query changes
  React.useEffect(() => {
    setVisibleCount(20);
  }, [householdSearch]);

  const selectedHousehold = householdId
    ? households.find((h) => h.id === householdId)
    : null;

  // Filter households by search tokens
  const matchedHouseholds = React.useMemo(() => {
    if (!householdSearch.trim()) return households;
    const query = householdSearch.toLowerCase().trim();
    const tokens = query.split(/\s+/).filter(Boolean);

    return households.filter((h) => {
      const no = h.householdNo?.toLowerCase() || "";
      const name = h.householdName?.toLowerCase() || "";
      const addr = h.addressLine?.toLowerCase() || "";
      const p = h.purok?.toLowerCase() || "";
      const st = h.street?.toLowerCase() || "";
      const combined = `${no} ${name} ${addr} ${p} ${st}`;

      if (combined.includes(query)) return true;
      if (query.length >= 3 && isSubsequence(query, no)) return true;
      return tokens.length > 1 && tokens.every((tok) => combined.includes(tok));
    });
  }, [households, householdSearch]);

  // Lazy loaded slice up to visibleCount (starts at 20, then increments on scroll)
  const displayedHouseholds = React.useMemo(() => {
    return matchedHouseholds.slice(0, visibleCount);
  }, [matchedHouseholds, visibleCount]);

  // Infinite scroll trigger when reaching bottom of dropdown list
  const handleDropdownScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 40) {
      if (visibleCount < matchedHouseholds.length) {
        setVisibleCount((prev) => Math.min(prev + 20, matchedHouseholds.length));
      }
    }
  };

  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "0.625rem",
        padding: "1.15rem",
        backgroundColor: "#ffffff",
      }}
    >
      <div
        style={{
          fontSize: "0.88rem",
          fontWeight: 700,
          color: "var(--cbms-navy, #0a2463)",
          marginBottom: "0.85rem",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          borderBottom: "1px solid #f1f5f9",
          paddingBottom: "0.4rem",
        }}
      >
        <span>🏠</span> Household Assignment & Relation
      </div>

      <Field label="Household Folder" hint="Search by household no., street, or address">
        {householdId && !isSearching ? (
          <div
            style={{
              border: "1px solid #cbd5e1",
              borderRadius: "0.375rem",
              padding: "0.75rem 0.85rem",
              backgroundColor: "#f8fafc",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  color: "var(--cbms-navy, #0a2463)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>🏠</span>
                <span>
                  #{selectedHousehold?.householdNo || "Household " + householdId}
                </span>
                {selectedHousehold?.householdName && (
                  <span style={{ fontWeight: 400, color: "#64748b" }}>
                    · {selectedHousehold.householdName}
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
                {selectedHousehold?.addressLine || "No address line on file"} ·{" "}
                <span style={{ fontWeight: 600 }}>Purok {selectedHousehold?.purok || "—"}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
              <button
                type="button"
                className="cbms-btn"
                disabled={disabled}
                style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                onClick={() => {
                  setIsSearching(true);
                  setHouseholdSearch("");
                }}
              >
                🔍 Change
              </button>
              <button
                type="button"
                className="cbms-btn"
                disabled={disabled}
                style={{
                  padding: "0.3rem 0.6rem",
                  fontSize: "0.75rem",
                  color: "#dc2626",
                  borderColor: "#fca5a5",
                }}
                onClick={() => {
                  onChange("", "");
                  setIsSearching(false);
                }}
              >
                ✕ Clear
              </button>
            </div>
          </div>
        ) : (
          <div ref={containerRef} style={{ position: "relative" }}>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                ref={inputRef}
                type="text"
                className="cbms-input"
                placeholder="🔍 Type to search household no., street, address…"
                value={householdSearch}
                disabled={disabled}
                onChange={(e) => {
                  setHouseholdSearch(e.target.value);
                  setIsSearching(true);
                }}
                onFocus={() => setIsSearching(true)}
              />
              {householdId && (
                <button
                  type="button"
                  className="cbms-btn"
                  disabled={disabled}
                  style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem" }}
                  onClick={() => setIsSearching(false)}
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Dropdown with Lazy-loading & Infinite Scroll */}
            {isSearching && (
              <div
                onScroll={handleDropdownScroll}
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  right: 0,
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "0.5rem",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.18)",
                  maxHeight: "220px",
                  overflowY: "auto",
                  zIndex: 2600,
                }}
              >
                {/* Option to clear / unassign */}
                <div
                  style={{
                    padding: "0.55rem 0.85rem",
                    borderBottom: "1px solid #f1f5f9",
                    fontSize: "0.78rem",
                    color: "#64748b",
                    cursor: "pointer",
                    backgroundColor: "#f8fafc",
                    fontWeight: 500,
                  }}
                  onClick={() => {
                    onChange("", "");
                    setIsSearching(false);
                    setHouseholdSearch("");
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#e2e8f0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                  }}
                >
                  — 🚫 Unassigned (Individual Resident Record) —
                </div>

                {displayedHouseholds.length === 0 ? (
                  <div
                    style={{
                      padding: "0.85rem",
                      fontSize: "0.82rem",
                      color: "#94a3b8",
                      textAlign: "center",
                    }}
                  >
                    No households found matching "{householdSearch}"
                  </div>
                ) : (
                  <>
                    {displayedHouseholds.map((h) => (
                      <div
                        key={h.id}
                        style={{
                          padding: "0.6rem 0.85rem",
                          borderBottom: "1px solid #f1f5f9",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          transition: "background-color 0.1s ease",
                        }}
                        onClick={() => {
                          onChange(h.id, relationToHead || "Head");
                          setIsSearching(false);
                          setHouseholdSearch("");
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f1f5f9";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: "0.84rem",
                              color: "var(--cbms-navy, #0a2463)",
                            }}
                          >
                            🏠 #{h.householdNo}
                            {h.householdName && (
                              <span style={{ fontWeight: 400, color: "#475569", marginLeft: "0.35rem" }}>
                                ({h.householdName})
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>
                            {h.addressLine || "No street address recorded"}
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            color: "#334155",
                            backgroundColor: "#e2e8f0",
                            padding: "0.2rem 0.45rem",
                            borderRadius: "0.25rem",
                            marginLeft: "0.5rem",
                            flexShrink: 0,
                          }}
                        >
                          Purok {h.purok || "—"}
                        </span>
                      </div>
                    ))}

                    {/* Infinite Scroll Footer indicator */}
                    <div
                      style={{
                        padding: "0.45rem 0.85rem",
                        fontSize: "0.72rem",
                        color: "#94a3b8",
                        textAlign: "center",
                        backgroundColor: "#f8fafc",
                        borderTop: "1px solid #f1f5f9",
                      }}
                    >
                      {visibleCount < matchedHouseholds.length
                        ? `Showing ${visibleCount} of ${matchedHouseholds.length} · Scroll down for more`
                        : `All ${matchedHouseholds.length} matching households displayed`}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </Field>

      {/* Relation to Head selector appears when a household is selected */}
      {householdId && (
        <div style={{ marginTop: "0.85rem" }}>
          <Field label="Relation to Head of Household *">
            <select
              className="cbms-select"
              value={relationToHead || "Head"}
              disabled={disabled}
              onChange={(e) => onChange(householdId, e.target.value)}
            >
              {RELATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}
    </div>
  );
}
