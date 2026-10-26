"use client";

import * as React from "react";
import { Field } from "@cbms/ui";
import type { Household } from "../../../../lib/types";
import type { InhabitantFormState } from "../types";

interface DrawerHouseholdPickerProps {
  form: InhabitantFormState;
  setForm: React.Dispatch<React.SetStateAction<InhabitantFormState>>;
  households: Household[];
  disabled?: boolean;
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

export function DrawerHouseholdPicker({
  form,
  setForm,
  households,
  disabled,
}: DrawerHouseholdPickerProps) {
  const [householdSearch, setHouseholdSearch] = React.useState("");
  const [isSearchingHousehold, setIsSearchingHousehold] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsSearchingHousehold(false);
      }
    }
    if (isSearchingHousehold) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isSearchingHousehold]);

  React.useEffect(() => {
    if (isSearchingHousehold) {
      inputRef.current?.focus();
    }
  }, [isSearchingHousehold]);

  const selectedHousehold = form.householdId
    ? households.find((h) => h.id === form.householdId)
    : null;

  const matchedHouseholds = React.useMemo(() => {
    if (!householdSearch.trim()) return households.slice(0, 15);
    const query = householdSearch.toLowerCase().trim();
    const tokens = query.split(/\s+/).filter(Boolean);

    return households
      .filter((h) => {
        const no = h.householdNo?.toLowerCase() || "";
        const name = h.householdName?.toLowerCase() || "";
        const addr = h.addressLine?.toLowerCase() || "";
        const p = h.purok?.toLowerCase() || "";
        const st = h.street?.toLowerCase() || "";
        const combined = `${no} ${name} ${addr} ${p} ${st}`;

        if (combined.includes(query)) return true;
        if (query.length >= 3 && isSubsequence(query, no)) return true;
        return tokens.length > 1 && tokens.every((tok) => combined.includes(tok));
      })
      .slice(0, 20);
  }, [households, householdSearch]);

  return (
    <div
      style={{
        border: "1px solid var(--color-border, #e2e8f0)",
        padding: "1rem",
        borderRadius: "0.375rem",
      }}
    >
      <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", fontWeight: "bold" }}>
        🏠 Household Folder Assignment
      </h4>

      <Field label="Select Household" hint="Search by household no., street, or address">
        {form.householdId && !isSearchingHousehold ? (
          <div
            style={{
              border: "1px solid var(--color-border, #e2e8f0)",
              borderRadius: "0.375rem",
              padding: "0.75rem",
              backgroundColor: "var(--color-bg-hover, #f8fafc)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: "var(--color-text, #1b2430)",
                }}
              >
                🏠 {selectedHousehold?.householdNo || "Household " + form.householdId}
                {selectedHousehold?.householdName ? ` (${selectedHousehold.householdName})` : ""}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--cbms-muted, #64748b)" }}>
                {selectedHousehold?.addressLine || "No address recorded"} ·{" "}
                {selectedHousehold?.purok || "—"}
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                className="cbms-btn"
                disabled={disabled}
                style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                onClick={() => {
                  setIsSearchingHousehold(true);
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
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.75rem",
                  color: "var(--cbms-red, #ce1126)",
                }}
                onClick={() => {
                  setForm((prev) => ({ ...prev, householdId: "", relationToHead: "" }));
                  setIsSearchingHousehold(false);
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
                className="cbms-input"
                placeholder="🔍 Type to search household no., street, address…"
                value={householdSearch}
                disabled={disabled}
                onChange={(e) => {
                  setHouseholdSearch(e.target.value);
                  setIsSearchingHousehold(true);
                }}
                onFocus={() => setIsSearchingHousehold(true)}
              />
              {form.householdId && (
                <button
                  type="button"
                  className="cbms-btn"
                  disabled={disabled}
                  style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem" }}
                  onClick={() => setIsSearchingHousehold(false)}
                >
                  Cancel
                </button>
              )}
            </div>

            {isSearchingHousehold && (
              <div
                style={{
                  position: "absolute",
                  top: "105%",
                  left: 0,
                  right: 0,
                  backgroundColor: "var(--color-bg-card, #ffffff)",
                  border: "1px solid var(--color-border, #e2e8f0)",
                  borderRadius: "0.375rem",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                  maxHeight: "200px",
                  overflowY: "auto",
                  zIndex: 1200,
                }}
              >
                  <div
                    style={{
                      padding: "0.5rem 0.75rem",
                      borderBottom: "1px solid var(--color-border, #e2e8f0)",
                      fontSize: "0.75rem",
                      color: "var(--cbms-muted, #64748b)",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setForm((prev) => ({ ...prev, householdId: "", relationToHead: "" }));
                      setIsSearchingHousehold(false);
                      setHouseholdSearch("");
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    — 🚫 Unassigned / Not in a Household —
                  </div>
                  {matchedHouseholds.length === 0 ? (
                    <div
                      style={{
                        padding: "0.75rem",
                        fontSize: "0.8rem",
                        color: "var(--cbms-muted, #64748b)",
                      }}
                    >
                      No households match "{householdSearch}"
                    </div>
                  ) : (
                    matchedHouseholds.map((h) => (
                      <div
                        key={h.id}
                        style={{
                          padding: "0.6rem 0.75rem",
                          borderBottom: "1px solid var(--color-border, #f1f5f9)",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            householdId: h.id,
                            relationToHead: prev.relationToHead || "Head",
                          }));
                          setIsSearchingHousehold(false);
                          setHouseholdSearch("");
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "var(--color-bg-hover, #f8fafc)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "transparent")
                        }
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: "0.85rem",
                              color: "var(--color-text, #1b2430)",
                            }}
                          >
                            🏠 {h.householdNo}
                            {h.householdName ? (
                              <span style={{ fontWeight: 400, color: "var(--cbms-muted, #64748b)", marginLeft: "0.35rem" }}>
                                ({h.householdName})
                              </span>
                            ) : null}
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--cbms-muted, #64748b)",
                            }}
                          >
                            {h.addressLine || "No address line"}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--cbms-muted, #64748b)",
                            background: "var(--color-bg-hover, #f1f5f9)",
                            padding: "0.2rem 0.4rem",
                            borderRadius: "0.25rem",
                          }}
                        >
                          {h.purok || "Purok —"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
      </Field>

      {form.householdId && (
        <div style={{ marginTop: "0.75rem" }}>
          <Field label="Relation to Head of Household">
            <select
              className="cbms-select"
              value={form.relationToHead}
              disabled={disabled}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, relationToHead: e.target.value }))
              }
            >
              <option value="Head">Head of Household</option>
              <option value="Spouse">Spouse</option>
              <option value="Son">Son</option>
              <option value="Daughter">Daughter</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Brother">Brother</option>
              <option value="Sister">Sister</option>
              <option value="Grandfather">Grandfather</option>
              <option value="Grandmother">Grandmother</option>
              <option value="Grandson">Grandson</option>
              <option value="Granddaughter">Granddaughter</option>
              <option value="Son-in-Law">Son-in-Law</option>
              <option value="Daughter-in-Law">Daughter-in-Law</option>
              <option value="Relative">Other Relative</option>
              <option value="Househelper / Domestic">Househelper / Domestic Worker</option>
              <option value="Boarder / Non-Relative">Boarder / Non-Relative</option>
            </select>
          </Field>
        </div>
      )}
    </div>
  );
}
