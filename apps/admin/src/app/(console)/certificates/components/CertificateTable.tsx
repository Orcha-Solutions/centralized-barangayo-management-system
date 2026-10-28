"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusChip, date, pesoAmount, fullName } from "@cbms/ui";
import { SourceChip } from "../../../../components/common";
import type { CertificateRequest } from "../../../../lib/types";

export interface CertificateTableProps {
  certificates: CertificateRequest[];
  total?: number;
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
  total: totalProp,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  sortBy,
  sortOrder,
  onSort,
}: CertificateTableProps) {
  const router = useRouter();
  const total = totalProp ?? certificates.length;
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
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Sort indicator helper
  const renderSortIndicator = (columnKey: string) => {
    if (sortBy !== columnKey) return null;
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
      style={{
        width: "100%",
        border: "1px solid var(--color-border, #e2e8f0)",
        borderRadius: "0.5rem",
        backgroundColor: "#ffffff",
        overflow: "hidden",
      }}
    >
      <div
        ref={containerRef}
        className="cbms-table-wrap cbms-table-wrap--sticky"
        style={{
          width: "100%",
          overflowX: "auto",
          overflowY: "auto",
          maxHeight: "calc(100vh - 320px)",
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
                Tracking / Ref # {renderSortIndicator("referenceNo")}
              </th>
              <th
                style={{ ...stickyThBase, cursor: "pointer" }}
                onClick={() => onSort("residentName")}
              >
                Citizen / Applicant {renderSortIndicator("residentName")}
              </th>
              <th
                style={{ ...stickyThBase, cursor: "pointer" }}
                onClick={() => onSort("typeId")}
              >
                Document Type {renderSortIndicator("typeId")}
              </th>
              <th style={stickyThBase}>
                Stated Purpose
              </th>
              <th
                style={{ ...stickyThBase, cursor: "pointer", width: 110 }}
                onClick={() => onSort("fee")}
              >
                Fee / OR {renderSortIndicator("fee")}
              </th>
              <th
                style={{ ...stickyThBase, cursor: "pointer", width: 130 }}
                onClick={() => onSort("status")}
              >
                Status {renderSortIndicator("status")}
              </th>
              <th
                style={{ ...stickyThBase, cursor: "pointer", width: 120 }}
                onClick={() => onSort("createdAt")}
              >
                Date Filed {renderSortIndicator("createdAt")}
              </th>
              <th style={{ ...stickyThBase, width: 110, textAlign: "right" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && certificates.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                  <div style={{ display: "inline-block", animation: "spin 1s linear infinite", fontSize: "1.5rem" }}>🔄</div>
                  <div style={{ marginTop: "0.5rem" }}>Loading statutory certificate registry...</div>
                </td>
              </tr>
            ) : certificates.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📄</div>
                  <div>No document clearance requests match the specified filters.</div>
                </td>
              </tr>
            ) : (
              certificates.map((cert) => {
                const applicantName = cert.inhabitant ? fullName(cert.inhabitant as any) : "Non-Registered / Walk-in";
                const isFree = Number(cert.fee) === 0;

                return (
                  <tr
                    key={cert.id}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      transition: "background-color 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    {/* Reference # */}
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                        <Link
                          href={`/certificates/${cert.id}`}
                          style={{
                            fontWeight: 700,
                            color: "#0369a1",
                            textDecoration: "none",
                            fontSize: "0.85rem",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                        >
                          {cert.referenceNo}
                        </Link>
                        <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                          <SourceChip source={cert.source || "CBMS"} />
                        </div>
                      </div>
                    </td>

                    {/* Citizen / Applicant */}
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle" }}>
                      <div style={{ fontWeight: 600, color: "#1e293b" }}>{applicantName}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {cert.inhabitant?.philsysNo
                          ? `PCN ${cert.inhabitant.philsysNo}`
                          : cert.inhabitant?.contactPhone || "Barangay Jurisdiction"}
                      </div>
                    </td>

                    {/* Document Type */}
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle" }}>
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#0f172a",
                          display: "inline-block",
                        }}
                      >
                        {cert.type?.name || "Clearance"}
                      </span>
                      {cert.type?.validityDays && (
                        <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                          Valid {cert.type.validityDays} days
                        </div>
                      )}
                    </td>

                    {/* Stated Purpose */}
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle" }}>
                      <span
                        style={{
                          color: "#334155",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          fontSize: "0.82rem",
                        }}
                        title={cert.purpose}
                      >
                        {cert.purpose}
                      </span>
                    </td>

                    {/* Fee / OR */}
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle" }}>
                      <div style={{ fontWeight: 600, color: isFree ? "#16a34a" : "#0f172a" }}>
                        {isFree ? "Free" : pesoAmount(cert.fee)}
                      </div>
                      {cert.orNumber ? (
                        <div style={{ fontSize: "0.72rem", color: "#0369a1" }}>
                          OR: {cert.orNumber}
                        </div>
                      ) : (
                        <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                          {cert.paymentMethod === "waived" ? "Waived (RA 11261)" : "Pending OR"}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle" }}>
                      <StatusChip status={cert.status} />
                    </td>

                    {/* Date Filed */}
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                      <div style={{ color: "#334155" }}>{date(cert.createdAt)}</div>
                      <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                        {new Date(cert.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                        <Link
                          href={`/certificates/${cert.id}`}
                          className="cbms-btn cbms-btn--secondary"
                          style={{
                            fontSize: "0.78rem",
                            padding: "0.3rem 0.6rem",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                          }}
                          title="View Certificate Details, Print & Actions"
                        >
                          👁️ View
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
        <div ref={observerRef} style={{ height: 1 }} />
      </div>

      {/* Infinite Scroll & Lazy Loading Status Footer */}
      <div
        className="cbms-pagination"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 18px",
          borderTop: "1px solid var(--cbms-line, #e2e8f0)",
          fontSize: "12.5px",
          color: "var(--cbms-muted, #64748b)",
          background: "var(--cbms-white, #ffffff)",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          Showing <strong>{certificates.length.toLocaleString()}</strong> of{" "}
          <strong>{total.toLocaleString()}</strong> document requests
          {certificates.length > 0 && total > certificates.length && (
            <span style={{ marginLeft: 8, fontSize: "11.5px", opacity: 0.8 }}>
              (Scroll down to lazy load more)
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isFetchingNextPage && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: "var(--cbms-navy, #0a2463)",
                fontWeight: 600,
                fontSize: "12px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 13,
                  height: 13,
                  border: "2px solid rgba(10, 36, 99, 0.25)",
                  borderTopColor: "var(--cbms-navy, #0a2463)",
                  borderRadius: "50%",
                  animation: "cbms-spin 0.8s linear infinite",
                }}
              />
              <span>Loading next 20 records...</span>
            </div>
          )}

          {!hasNextPage && certificates.length > 0 && (
            <span
              style={{
                fontSize: "11.5px",
                fontWeight: 600,
                color: "#166534",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                padding: "2px 8px",
                borderRadius: 999,
              }}
            >
              ✓ All {total.toLocaleString()} document requests loaded
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
