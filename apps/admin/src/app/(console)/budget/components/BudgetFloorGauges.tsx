"use client";

import * as React from "react";
import { Chip, pesoAmount } from "@cbms/ui";

export interface StatutoryFundItem {
  id: string;
  code: string;
  name: string;
  statutoryRule: string;
  minPct: number;
  appropriatedAmount: number;
  obligatedAmount: number;
  balanceAmount: number;
  utilizationPct: number;
  complianceStatus: "compliant" | "warning" | "breached";
  description: string;
  icon: string;
  legalBasis: string;
}

export function BudgetFloorGauges({
  funds,
  totalAnnualBudget,
  onSelectFund,
}: {
  funds: StatutoryFundItem[];
  totalAnnualBudget: number;
  onSelectFund?: (fund: StatutoryFundItem) => void;
}) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkScroll = React.useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  React.useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
    }
    window.addEventListener("resize", checkScroll);
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [funds, checkScroll]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distance = 330;
    el.scrollBy({ left: direction === "left" ? -distance : distance, behavior: "smooth" });
  };

  return (
    <div style={{ position: "relative", marginBottom: "1.25rem" }}>
      {/* Scroll Navigation Header Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.5rem",
        }}
      >
        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155", display: "flex", alignItems: "center", gap: "6px" }}>
          <span>🏛️ Statutory & Discretionary Sector Allocations</span>
          <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}>
            ({funds.length} Active {funds.length === 1 ? "Fund" : "Funds"})
          </span>
        </div>

        {/* Scroll Arrows */}
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            title="Scroll Left"
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              border: "1px solid #cbd5e1",
              backgroundColor: canScrollLeft ? "#ffffff" : "#f1f5f9",
              color: canScrollLeft ? "#0a2463" : "#94a3b8",
              cursor: canScrollLeft ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: 700,
              boxShadow: canScrollLeft ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            ‹
          </button>
          <button
            type="button"
            title="Scroll Right"
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              border: "1px solid #cbd5e1",
              backgroundColor: canScrollRight ? "#ffffff" : "#f1f5f9",
              color: canScrollRight ? "#0a2463" : "#94a3b8",
              cursor: canScrollRight ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: 700,
              boxShadow: canScrollRight ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            ›
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Carousel Container */}
      <div
        ref={scrollContainerRef}
        style={{
          display: "flex",
          gap: "1rem",
          overflowX: "auto",
          paddingBottom: "0.5rem",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "thin",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {funds.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              width: "100%",
              textAlign: "center",
              color: "#64748b",
              backgroundColor: "var(--color-bg-subtle, #f8fafc)",
              border: "1px dashed var(--color-border, #cbd5e1)",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            No sector appropriation funds enacted yet. Click <strong>+ Add Sector</strong> above to enact a fund.
          </div>
        ) : (
          funds.map((f) => {
            const actualAllocatedPct = (
              (f.appropriatedAmount / totalAnnualBudget) *
              100
            ).toFixed(1);
            return (
            <div
              key={f.id}
              onClick={() => onSelectFund?.(f)}
              role={onSelectFund ? "button" : undefined}
              tabIndex={onSelectFund ? 0 : undefined}
              style={{
                flex: "0 0 310px",
                minWidth: "310px",
                maxWidth: "340px",
                scrollSnapAlign: "start",
                backgroundColor: "var(--color-bg-subtle, #f8fafc)",
                border: "1px solid var(--color-border, #e2e8f0)",
                borderRadius: "0.5rem",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                cursor: onSelectFund ? "pointer" : "default",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (onSelectFund) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.06)";
                }
              }}
              onMouseLeave={(e) => {
                if (onSelectFund) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1.25rem" }}>{f.icon}</span>
                  <div>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        color: "var(--cbms-navy, #0a2463)",
                      }}
                    >
                      {f.name}
                    </h4>
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                      {f.statutoryRule}
                    </span>
                  </div>
                </div>
                <Chip tone={f.complianceStatus === "compliant" ? "green" : "gold"}>
                  {actualAllocatedPct}% Allocated
                </Chip>
              </div>

              {/* Allocation Numbers */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.5rem",
                  fontSize: "0.8rem",
                }}
              >
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>
                    Appropriation
                  </span>
                  <strong style={{ color: "#0f172a" }}>
                    {pesoAmount(f.appropriatedAmount)}
                  </strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>
                    Obligated (Spent)
                  </span>
                  <strong style={{ color: "#1d4ed8" }}>
                    {pesoAmount(f.obligatedAmount)}
                  </strong>
                </div>
              </div>

              {/* Utilization Progress Bar */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.75rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  <span style={{ color: "#475569" }}>Obligation Burn Rate</span>
                  <strong style={{ color: "#0f172a" }}>{f.utilizationPct}%</strong>
                </div>
                <div
                  style={{
                    height: "8px",
                    borderRadius: "4px",
                    backgroundColor: "#e2e8f0",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(100, f.utilizationPct)}%`,
                      backgroundColor: f.utilizationPct >= 85 ? "#d97706" : "#1d4ed8",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.75rem",
                  paddingTop: "0.5rem",
                  borderTop: "1px dashed #cbd5e1",
                  color: "#059669",
                }}
              >
                <span>Unobligated Balance:</span>
                <strong style={{ fontFamily: "monospace" }}>
                  {pesoAmount(f.balanceAmount)}
                </strong>
              </div>

              <div style={{ fontSize: "0.7rem", color: "#64748b", fontStyle: "italic" }}>
                {f.legalBasis}
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}
