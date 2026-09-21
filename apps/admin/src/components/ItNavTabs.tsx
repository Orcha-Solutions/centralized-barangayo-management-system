"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ItNavTabs({
  logCount,
  userCount,
  activeWidgetCount,
  totalWidgetCount,
  ticketCount,
}: {
  logCount?: number;
  userCount?: number;
  activeWidgetCount?: number;
  totalWidgetCount?: number;
  ticketCount?: number;
}) {
  const pathname = usePathname() ?? "/audit";

  const isAudit = pathname === "/audit";
  const isUsers = pathname.includes("/users");
  const isFeatures = pathname.includes("/features");
  const isTickets = pathname.includes("/tickets");

  return (
    <div
      style={{
        display: "flex",
        gap: "0.5rem",
        marginBottom: "1.25rem",
        borderBottom: "1px solid var(--color-border, #e2e8f0)",
        paddingBottom: "0.6rem",
        flexWrap: "wrap",
      }}
    >
      <Link
        href="/audit"
        className={`cbms-btn ${isAudit ? "cbms-btn--primary" : ""}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          fontSize: "0.85rem",
          fontWeight: isAudit ? 700 : 500,
          textDecoration: "none",
        }}
      >
        <span>🧾</span>
        <span>Audit Logs</span>
        {logCount !== undefined && (
          <span
            style={{
              padding: "1px 6px",
              borderRadius: "9999px",
              fontSize: "0.72rem",
              backgroundColor: isAudit ? "rgba(255,255,255,0.25)" : "var(--color-bg-subtle, #f1f5f9)",
              color: isAudit ? "#ffffff" : "#475569",
            }}
          >
            {logCount}
          </span>
        )}
      </Link>

      <Link
        href="/audit/users"
        className={`cbms-btn ${isUsers ? "cbms-btn--primary" : ""}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          fontSize: "0.85rem",
          fontWeight: isUsers ? 700 : 500,
          textDecoration: "none",
        }}
      >
        <span>🛡️</span>
        <span>User CRUD Control</span>
        {userCount !== undefined && (
          <span
            style={{
              padding: "1px 6px",
              borderRadius: "9999px",
              fontSize: "0.72rem",
              backgroundColor: isUsers ? "rgba(255,255,255,0.25)" : "var(--color-bg-subtle, #f1f5f9)",
              color: isUsers ? "#ffffff" : "#475569",
            }}
          >
            {userCount}
          </span>
        )}
      </Link>

      <Link
        href="/audit/features"
        className={`cbms-btn ${isFeatures ? "cbms-btn--primary" : ""}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          fontSize: "0.85rem",
          fontWeight: isFeatures ? 700 : 500,
          textDecoration: "none",
        }}
      >
        <span>🎛️</span>
        <span>Dashboard UI Feature Toggles</span>
        {activeWidgetCount !== undefined && totalWidgetCount !== undefined && (
          <span
            style={{
              padding: "1px 6px",
              borderRadius: "9999px",
              fontSize: "0.72rem",
              backgroundColor: isFeatures ? "rgba(255,255,255,0.25)" : "var(--color-bg-subtle, #f1f5f9)",
              color: isFeatures ? "#ffffff" : "#475569",
            }}
          >
            {activeWidgetCount}/{totalWidgetCount}
          </span>
        )}
      </Link>

      <Link
        href="/tickets"
        className={`cbms-btn ${isTickets ? "cbms-btn--primary" : ""}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          fontSize: "0.85rem",
          fontWeight: isTickets ? 700 : 500,
          textDecoration: "none",
        }}
      >
        <span>🎫</span>
        <span>IT Support Tickets</span>
        {ticketCount !== undefined && (
          <span
            style={{
              padding: "1px 6px",
              borderRadius: "9999px",
              fontSize: "0.72rem",
              backgroundColor: isTickets ? "rgba(255,255,255,0.25)" : "var(--color-bg-subtle, #f1f5f9)",
              color: isTickets ? "#ffffff" : "#475569",
            }}
          >
            {ticketCount}
          </span>
        )}
      </Link>
    </div>
  );
}
