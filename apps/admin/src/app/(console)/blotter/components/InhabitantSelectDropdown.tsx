"use client";

import * as React from "react";
import { useInfiniteInhabitantsQuery } from "../../../../lib/inhabitants-queries";
import type { Inhabitant } from "../../../../lib/types";

export interface InhabitantSelectDropdownProps {
  value: string;
  selectedInhabitantId?: string;
  onSelect: (inhabitant: Inhabitant) => void;
  onClear: () => void;
  disabled?: boolean;
}

export function InhabitantSelectDropdown({
  value,
  selectedInhabitantId,
  onSelect,
  onClear,
  disabled,
}: InhabitantSelectDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
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

  // Focus search input when opened
  React.useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Server-side lazy loading infinite query
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

  // Infinite scroll trigger on container scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 40 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {/* Trigger Button / Display */}
      {selectedInhabitantId || value ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.5rem 0.75rem",
            backgroundColor: "var(--color-bg-subtle, #f8fafc)",
            border: "1px solid var(--color-border, #cbd5e1)",
            borderRadius: "0.375rem",
            fontSize: "0.85rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", overflow: "hidden" }}>
            <span style={{ fontSize: "1rem" }}>👤</span>
            <span style={{ fontWeight: 600, color: "var(--color-text, #1b2430)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
              {value}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              disabled={disabled}
              className="cbms-btn cbms-btn--sm"
              style={{
                padding: "2px 8px",
                fontSize: "11px",
                backgroundColor: "#ffffff",
                border: "1px solid var(--color-border, #cbd5e1)",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Change
            </button>
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              title="Clear selected inhabitant"
              style={{
                background: "none",
                border: "none",
                color: "var(--cbms-muted, #64748b)",
                cursor: "pointer",
                padding: "2px 6px",
                fontSize: "13px",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="cbms-input"
          style={{
            width: "100%",
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            color: "var(--cbms-muted, #64748b)",
            backgroundColor: "#ffffff",
          }}
        >
          <span>🔍 Select Registered Inhabitant…</span>
          <span style={{ fontSize: "10px" }}>▼</span>
        </button>
      )}

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "105%",
            left: 0,
            right: 0,
            backgroundColor: "#ffffff",
            border: "1px solid var(--color-border, #cbd5e1)",
            borderRadius: "0.375rem",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
            zIndex: 100,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Search Bar Header */}
          <div style={{ padding: "0.5rem", borderBottom: "1px solid var(--color-border, #f1f5f9)", position: "relative" }}>
            <input
              ref={inputRef}
              type="text"
              className="cbms-input"
              placeholder="Search by resident name or phone (min 3 chars)…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                fontSize: "12px",
                padding: "0.4rem 0.6rem",
                width: "100%",
              }}
            />
            {isShortSearch && (
              <div
                style={{
                  fontSize: "10.5px",
                  color: "#b45309",
                  backgroundColor: "#fef3c7",
                  padding: "2px 6px",
                  borderRadius: "3px",
                  marginTop: "4px",
                }}
              >
                Type at least 3 characters to search server-side
              </div>
            )}
          </div>

          {/* Inhabitant List with Lazy Loading / Infinite Scroll */}
          <div
            onScroll={handleScroll}
            style={{
              maxHeight: "220px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {isLoading && (
              <div style={{ padding: "1rem", textAlign: "center", color: "var(--cbms-muted, #64748b)", fontSize: "12px" }}>
                <span className="cbms-spinner" style={{ width: 14, height: 14, marginRight: 6 }} />
                Loading registered inhabitants…
              </div>
            )}

            {!isLoading && inhabitants.length === 0 && (
              <div style={{ padding: "1rem", textAlign: "center", color: "var(--cbms-muted, #64748b)", fontSize: "12px" }}>
                No registered inhabitants found.
              </div>
            )}

            {inhabitants.map((inh) => {
              const fullName = `${inh.lastName}, ${inh.firstName}${inh.middleName ? ` ${inh.middleName[0]}.` : ""}${inh.suffix ? ` ${inh.suffix}` : ""}`;
              const phone = inh.contactPhone || inh.telephoneNumber;
              const isSelected = selectedInhabitantId === inh.id;

              return (
                <button
                  key={inh.id}
                  type="button"
                  onClick={() => {
                    onSelect(inh);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  style={{
                    padding: "0.5rem 0.75rem",
                    textAlign: "left",
                    border: "none",
                    borderBottom: "1px solid var(--color-border, #f8fafc)",
                    backgroundColor: isSelected ? "var(--color-bg-hover, #f1f5f9)" : "#ffffff",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "#ffffff";
                  }}
                >
                  <div>
                    <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--color-text, #1b2430)" }}>
                      {fullName}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--cbms-muted, #64748b)", marginTop: 2 }}>
                      {phone ? `📞 ${phone}` : "No contact phone"}
                    </div>
                  </div>
                  {isSelected && (
                    <span style={{ color: "#0284c7", fontSize: "12px", fontWeight: "bold" }}>✓</span>
                  )}
                </button>
              );
            })}

            {/* Lazy Loading Indicator */}
            {isFetchingNextPage && (
              <div style={{ padding: "0.5rem", textAlign: "center", fontSize: "11px", color: "var(--cbms-muted, #64748b)" }}>
                <span className="cbms-spinner" style={{ width: 12, height: 12, marginRight: 4 }} />
                Loading more…
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div
            style={{
              padding: "0.35rem 0.75rem",
              backgroundColor: "var(--color-bg-subtle, #f8fafc)",
              borderTop: "1px solid var(--color-border, #e2e8f0)",
              fontSize: "11px",
              color: "var(--cbms-muted, #64748b)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Loaded: {inhabitants.length} of {total}</span>
            {hasNextPage && <span>Scroll down for more</span>}
          </div>
        </div>
      )}
    </div>
  );
}
