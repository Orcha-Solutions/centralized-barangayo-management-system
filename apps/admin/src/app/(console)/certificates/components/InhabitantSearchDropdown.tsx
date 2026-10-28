"use client";

import * as React from "react";
import { Chip, age, fullName } from "@cbms/ui";
import { useInfiniteInhabitantsQuery } from "../../../../lib/inhabitants-queries";
import type { Inhabitant } from "../../../../lib/types";

export interface InhabitantSearchDropdownProps {
  selectedInhabitant: Inhabitant | null;
  onSelect: (inhabitant: Inhabitant) => void;
  onClear: () => void;
  disabled?: boolean;
}

export function InhabitantSearchDropdown({
  selectedInhabitant,
  onSelect,
  onClear,
  disabled = false,
}: InhabitantSearchDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Handle Escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Server-side lazy loading infinite query (20 records per batch)
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteInhabitantsQuery({
    search,
    pageSize: 20,
    sortBy: "name",
    sortOrder: "asc",
  });

  const inhabitants = React.useMemo(() => {
    if (!data?.pages) return [];
    const list: Inhabitant[] = [];
    const seen = new Set<string>();
    for (const page of data.pages) {
      for (const inh of page.data ?? []) {
        if (inh.id && !seen.has(inh.id)) {
          seen.add(inh.id);
          list.push(inh);
        }
      }
    }
    return list;
  }, [data]);

  const total = data?.pages?.[0]?.total ?? 0;
  const isShortSearch = search.trim().length > 0 && search.trim().length < 3;

  // Infinite scroll trigger when scrolling near bottom of list
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 40 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {/* 1. Selected Inhabitant Rich Summary Card */}
      {selectedInhabitant && !isOpen ? (
        <div
          style={{
            border: "1px solid #cbd5e1",
            borderRadius: "0.5rem",
            padding: "0.85rem 1rem",
            backgroundColor: "#f8fafc",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", gap: "0.85rem", alignItems: "center", minWidth: 0 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                backgroundColor: "#eff6ff",
                border: "1px solid #bfdbfe",
                color: "var(--cbms-navy, #0a2463)",
                display: "grid",
                placeItems: "center",
                fontSize: "1.2rem",
                flexShrink: 0,
              }}
            >
              👤
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "var(--cbms-navy, #0a2463)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {fullName(selectedInhabitant as any)}
                </span>
                {selectedInhabitant.birthDate && (
                  <Chip tone="gray">{age(selectedInhabitant.birthDate)} yrs</Chip>
                )}
                {selectedInhabitant.sex && (
                  <Chip tone="gray">
                    {selectedInhabitant.sex.charAt(0).toUpperCase() + selectedInhabitant.sex.slice(1).toLowerCase()}
                  </Chip>
                )}
                {selectedInhabitant.household?.purok && (
                  <Chip tone="navy">
                    Purok {selectedInhabitant.household.purok}
                  </Chip>
                )}
                {selectedInhabitant.philsysNo && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#0369a1",
                      backgroundColor: "#e0f2fe",
                      padding: "1px 6px",
                      borderRadius: 4,
                    }}
                  >
                    PCN {selectedInhabitant.philsysNo}
                  </span>
                )}
              </div>

              <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 3 }}>
                📍 {selectedInhabitant.household?.addressLine || "Barangay Jurisdiction"}
                {selectedInhabitant.contactPhone ? ` · 📞 ${selectedInhabitant.contactPhone}` : ""}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
            <button
              type="button"
              className="cbms-btn"
              disabled={disabled}
              onClick={() => {
                setIsOpen(true);
                setSearch("");
              }}
              style={{ padding: "0.35rem 0.7rem", fontSize: "0.78rem", fontWeight: 600 }}
            >
              🔍 Change
            </button>
            <button
              type="button"
              className="cbms-btn"
              disabled={disabled}
              onClick={onClear}
              style={{
                padding: "0.35rem 0.65rem",
                fontSize: "0.78rem",
                color: "#dc2626",
                borderColor: "#fca5a5",
              }}
            >
              ✕ Clear
            </button>
          </div>
        </div>
      ) : (
        /* 2. Unselected / Search Input Trigger */
        <div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              ref={inputRef}
              type="text"
              className="cbms-input"
              placeholder="🔍 Search requesting resident by name or PhilSys PCN…"
              value={search}
              disabled={disabled}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              style={{ width: "100%" }}
            />
            {selectedInhabitant && (
              <button
                type="button"
                className="cbms-btn"
                disabled={disabled}
                onClick={() => setIsOpen(false)}
                style={{ padding: "0.5rem 0.8rem", fontSize: "0.8rem" }}
              >
                Cancel
              </button>
            )}
          </div>

          {isShortSearch && (
            <div
              style={{
                fontSize: "11px",
                color: "#b45309",
                backgroundColor: "#fef3c7",
                padding: "3px 8px",
                borderRadius: "4px",
                marginTop: "4px",
              }}
            >
              Type at least 3 characters for live server-side search
            </div>
          )}
        </div>
      )}

      {/* 3. Popover Dropdown with Server-Side Lazy Loading (20 records per batch) */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "0.5rem",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.18), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Scrollable Inhabitants List */}
          <div
            onScroll={handleScroll}
            style={{
              maxHeight: "240px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {isLoading && (
              <div style={{ padding: "1.25rem", textAlign: "center", color: "#64748b", fontSize: "12px" }}>
                <span className="cbms-spinner" style={{ width: 16, height: 16, marginRight: 8 }} />
                Searching registered inhabitants…
              </div>
            )}

            {!isLoading && inhabitants.length === 0 && (
              <div style={{ padding: "1.25rem", textAlign: "center", color: "#64748b", fontSize: "12px" }}>
                No residents found matching &ldquo;{search}&rdquo;.
              </div>
            )}

            {inhabitants.map((inh) => {
              const nameText = fullName(inh as any);
              const residentAge = age(inh.birthDate);
              const isSelected = selectedInhabitant?.id === inh.id;

              return (
                <div
                  key={inh.id}
                  onClick={() => {
                    onSelect(inh);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  style={{
                    padding: "0.65rem 0.85rem",
                    borderBottom: "1px solid #f1f5f9",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: isSelected ? "#eff6ff" : "transparent",
                    transition: "background-color 0.1s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: "0.88rem",
                          color: "var(--cbms-navy, #0a2463)",
                        }}
                      >
                        {nameText}
                      </span>
                      {residentAge && (
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          ({residentAge} yrs)
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
                      <span>Purok {inh.household?.purok || "—"}</span>
                      {inh.philsysNo && <span> · PCN: {inh.philsysNo}</span>}
                      {inh.contactPhone && <span> · 📞 {inh.contactPhone}</span>}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: "#1e40af",
                      backgroundColor: "#dbeafe",
                      padding: "0.2rem 0.45rem",
                      borderRadius: "0.25rem",
                      flexShrink: 0,
                      marginLeft: "0.5rem",
                    }}
                  >
                    Select →
                  </span>
                </div>
              );
            })}

            {/* Fetching Next Page Spinner */}
            {isFetchingNextPage && (
              <div style={{ padding: "0.6rem", textAlign: "center", fontSize: "11px", color: "#64748b", backgroundColor: "#f8fafc" }}>
                <span className="cbms-spinner" style={{ width: 14, height: 14, marginRight: 6 }} />
                Loading more residents…
              </div>
            )}
          </div>

          {/* Dropdown Footer Status Indicator */}
          <div
            style={{
              padding: "0.4rem 0.85rem",
              backgroundColor: "#f8fafc",
              borderTop: "1px solid #e2e8f0",
              fontSize: "11px",
              color: "#64748b",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Loaded: {inhabitants.length} of {total} residents</span>
            {hasNextPage ? (
              <span style={{ color: "#2563eb", fontWeight: 500 }}>Scroll down for more</span>
            ) : (
              <span>All matching residents displayed</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
