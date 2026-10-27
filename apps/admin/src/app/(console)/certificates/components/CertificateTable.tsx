"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusChip, date, pesoAmount, fullName } from "@cbms/ui";
import { SourceChip } from "../../../../components/common";
import type { CertificateRequest } from "../../../../lib/types";

export interface CertificateTableProps {
  certificates: CertificateRequest[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
  fetchNextPage: () => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (columnKey: string) => void;
  canApprove?: boolean;
  canDelete?: boolean;
  onApprove?: (cert: CertificateRequest) => void;
  onReject?: (cert: CertificateRequest) => void;
  onDelete?: (cert: CertificateRequest) => void;
  transactingId?: string | null;
}

export function CertificateTable({
  certificates,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  sortBy,
  sortOrder,
  onSort,
}: CertificateTableProps) {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const observerRef = React.useRef<HTMLDivElement | null>(null);

  // Infinite Scroll IntersectionObserver
  React.useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const container = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage();
        }
      },
      { root: container, threshold: 0.1, rootMargin: "150px" }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Sort indicator helper
  const renderSortIndicator = (column: string) => {
    if (sortBy !== column) {
      return <span style={{ opacity: 0.35, marginLeft: "0.25rem", fontSize: "0.75rem" }}>↕</span>;
    }
    return (
      <span style={{ color: "#0284c7", marginLeft: "0.25rem", fontWeight: 700 }}>
        {sortOrder === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  const stickyThBase: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 10,
    backgroundColor: "#f8fafc",
    padding: "0.75rem 1rem",
    fontWeight: 600,
    color: "#475569",
    borderBottom: "2px solid #cbd5e1",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    whiteSpace: "nowrap",
  };

  return (
    <div
      ref={containerRef}
      className="cbms-table-wrap cbms-table-wrap--sticky"
      style={{
        width: "100%",
        overflowX: "auto",
        overflowY: "auto",
        border: "1px solid var(--color-border, #e2e8f0)",
        borderRadius: "0.5rem",
        backgroundColor: "#ffffff",
        maxHeight: "calc(100vh - 280px)",
        position: "relative",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, textAlign: "left", fontSize: "0.875rem" }}>
        {/* Sticky Headers with Server-side Sort */}
        <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
          <tr>
            <th
              style={{ ...stickyThBase, cursor: "pointer", width: 160 }}
              onClick={() => onSort("referenceNo")}
            >
              Reference {renderSortIndicator("referenceNo")}
            </th>
            <th
              style={{ ...stickyThBase, cursor: "pointer" }}
              onClick={() => onSort("typeId")}
            >
              Certificate Type {renderSortIndicator("typeId")}
            </th>
            <th style={stickyThBase}>
              Applicant / Resident
            </th>
            <th style={stickyThBase}>
              Purpose
            </th>
            <th
              style={{ ...stickyThBase, cursor: "pointer", textAlign: "right", width: 100 }}
              onClick={() => onSort("fee")}
            >
              Fee {renderSortIndicator("fee")}
            </th>
            <th
              style={{ ...stickyThBase, cursor: "pointer", width: 130 }}
              onClick={() => onSort("status")}
            >
              Status {renderSortIndicator("status")}
            </th>
            <th
              style={{ ...stickyThBase, cursor: "pointer", width: 140 }}
              onClick={() => onSort("createdAt")}
            >
              Submitted {renderSortIndicator("createdAt")}
            </th>
            <th style={{ ...stickyThBase, textAlign: "right", minWidth: 160, width: 170 }}>
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {/* Skeleton Loading State */}
          {isLoading && certificates.length === 0 ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <tr key={`skel-cert-${idx}`} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "1rem" }}>
                  <div style={{ height: 16, width: 100, backgroundColor: "#e2e8f0", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
                  <div style={{ height: 12, width: 70, backgroundColor: "#e2e8f0", borderRadius: 4, marginTop: 6, animation: "pulse 1.5s infinite" }} />
                </td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ height: 16, width: 140, backgroundColor: "#e2e8f0", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
                </td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ height: 16, width: 130, backgroundColor: "#e2e8f0", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
                </td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ height: 16, width: 110, backgroundColor: "#e2e8f0", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
                </td>
                <td style={{ padding: "1rem", textAlign: "right" }}>
                  <div style={{ height: 16, width: 50, backgroundColor: "#e2e8f0", borderRadius: 4, marginLeft: "auto", animation: "pulse 1.5s infinite" }} />
                </td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ height: 22, width: 75, backgroundColor: "#e2e8f0", borderRadius: 12, animation: "pulse 1.5s infinite" }} />
                </td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ height: 14, width: 80, backgroundColor: "#e2e8f0", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
                </td>
                <td style={{ padding: "1rem", textAlign: "right" }}>
                  <div style={{ height: 28, width: 130, backgroundColor: "#e2e8f0", borderRadius: 4, marginLeft: "auto", animation: "pulse 1.5s infinite" }} />
                </td>
              </tr>
            ))
          ) : certificates.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ padding: "3.5rem 1rem", textAlign: "center", color: "#64748b" }}>
                <div style={{ fontSize: "2.2rem", marginBottom: "0.5rem" }}>📄</div>
                <strong>No certificate requests match this filter.</strong>
                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
                  Adjust your search or filter keywords, or record a new clearance request.
                </p>
              </td>
            </tr>
          ) : (
            certificates.map((c, idx) => {
              return (
                <tr
                  key={c.id || idx}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fbfcfe",
                    transition: "background-color 0.15s ease",
                    cursor: "pointer",
                  }}
                  onClick={() => router.push(`/certificates/${c.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0f9ff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#ffffff" : "#fbfcfe";
                  }}
                >
                  {/* Reference No */}
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <Link
                      href={`/certificates/${c.id}`}
                      style={{ fontWeight: 700, color: "#0369a1", textDecoration: "none" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {c.referenceNo}
                    </Link>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.15rem" }}>
                      {date(c.createdAt || c.submittedAt)}
                    </div>
                  </td>

                  {/* Certificate Type */}
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <div style={{ fontWeight: 600, color: "#1e293b" }}>
                      {c.type?.name ?? "Barangay Clearance"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {c.type?.code ?? "BC"} {c.paymentMethod ? `· ${c.paymentMethod.replace(/_/g, " ")}` : ""}
                    </div>
                  </td>

                  {/* Resident / Inhabitant */}
                  <td style={{ padding: "0.85rem 1rem" }}>
                    {c.inhabitant ? (
                      <div>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>
                          {fullName(c.inhabitant as any)}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {c.inhabitant.philsysNo ? `PCN ${c.inhabitant.philsysNo}` : "Registered Resident"}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: "#64748b" }}>Walk-in Resident</span>
                    )}
                  </td>

                  {/* Purpose */}
                  <td style={{ padding: "0.85rem 1rem", color: "#334155" }}>
                    <div>{c.purpose || "—"}</div>
                    {c.orNumber && (
                      <div style={{ fontSize: "0.74rem", color: "#16a34a", marginTop: "0.15rem" }}>
                        OR #{c.orNumber}
                      </div>
                    )}
                  </td>

                  {/* Fee */}
                  <td style={{ padding: "0.85rem 1rem", textAlign: "right", fontWeight: 600 }}>
                    {Number(c.fee) === 0 ? (
                      <span style={{ color: "#16a34a" }}>Free</span>
                    ) : (
                      pesoAmount(c.fee)
                    )}
                  </td>

                  {/* Status */}
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <StatusChip status={c.status} />
                  </td>

                  {/* Submitted Date */}
                  <td style={{ padding: "0.85rem 1rem", color: "#475569", fontSize: "0.8rem" }}>
                    {date(c.submittedAt || c.createdAt)}
                    <div style={{ marginTop: "0.15rem" }}>
                      <SourceChip source={c.source ?? "DESK"} />
                    </div>
                  </td>

                  {/* Actions: View Certificate */}
                  <td style={{ padding: "0.85rem 1rem", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                      <Link
                        href={`/certificates/${c.id}`}
                        className="cbms-btn"
                        style={{
                          fontSize: "0.78rem",
                          padding: "0.35rem 0.75rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          fontWeight: 600,
                          textDecoration: "none",
                          whiteSpace: "nowrap",
                          width: "auto",
                        }}
                        title="View Certificate Details, Print & Actions"
                      >
                        👁️ View Certificate
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Infinite Scroll Trigger Sentinel */}
      <div ref={observerRef} style={{ padding: "1rem", textAlign: "center" }}>
        {isFetchingNextPage && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "#0369a1", fontSize: "0.85rem" }}>
            <span style={{ animation: "spin 1s linear infinite" }}>🔄</span>
            <span>Loading more certificate requests...</span>
          </div>
        )}
        {!hasNextPage && certificates.length > 0 && (
          <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
            All certificate records loaded ({certificates.length} total)
          </div>
        )}
      </div>
    </div>
  );
}
