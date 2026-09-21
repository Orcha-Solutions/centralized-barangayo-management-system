"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getToken,
  login,
  logout,
  useApi,
  useSession,
  type SessionUser,
} from "@cbms/api-client";
import { Chip, MockBanner, Spinner, initials } from "@cbms/ui";
import { NAV_GROUPS, activeHref, type BadgeKey } from "./nav";
import { roleLabel } from "../lib/labels";
import type { DashboardData } from "../lib/types";

export type ConsoleUser = SessionUser & { roleLabels?: string[] };

interface ConsoleContextValue {
  user: ConsoleUser | null;
  loading: boolean;
  can: (perm: string) => boolean;
  hasRole: (...roles: string[]) => boolean;
  dashboard: DashboardData | null;
  reloadDashboard: () => void;
}

const ConsoleContext = React.createContext<ConsoleContextValue | null>(null);

/** Session + action-queue counters, shared by every console page. */
export function useConsole(): ConsoleContextValue {
  const ctx = React.useContext(ConsoleContext);
  if (!ctx) throw new Error("useConsole() must be used inside the console shell.");
  return ctx;
}

function badgeCount(key: BadgeKey | undefined, d: DashboardData | null): number {
  if (!key || !d) return 0;
  const q = d.actionQueue;
  if (key === "actionQueueTotal") {
    return (
      q.certificatesForApproval +
      q.openConcerns +
      q.activeSosAlerts +
      q.kpCasesNearDeadline +
      q.disbursementBatchesForApproval
    );
  }
  return q[key] ?? 0;
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [authed, setAuthed] = React.useState(false);
  const [navOpen, setNavOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifsOpen, setNotifsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState([
    { id: 1, text: "New Certificate Request submitted", time: "5 mins ago", read: false },
    { id: 2, text: "Active SOS Alert in Purok 3", time: "12 mins ago", read: false },
    { id: 3, text: "Lupon hearing scheduled for Case #2026-04", time: "1 hour ago", read: true }
  ]);
  const session = useSession();

  React.useEffect(() => {
    const theme = localStorage.getItem("theme");
    const isDark = theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  React.useEffect(() => {
    if (!getToken()) {
      window.location.href = "/login";
      return;
    }
    setAuthed(true);
  }, []);

  const dash = useApi<DashboardData>(authed ? "/dashboard" : null);
  const user = session.user as ConsoleUser | null;

  const value = React.useMemo<ConsoleContextValue>(
    () => ({
      user,
      loading: session.loading,
      can: session.can,
      hasRole: session.hasRole,
      dashboard: dash.data,
      reloadDashboard: dash.reload,
    }),
    [user, session.loading, session.can, session.hasRole, dash.data, dash.reload],
  );

  const current = activeHref(pathname);
  const title =
    NAV_GROUPS.flatMap((g) => g.items).find((i) => i.href === current)?.label ??
    "Barangay Console";

  if (!authed || session.loading || !user) {
    return (
      <div className="cbms-center">
        <Spinner />
      </div>
    );
  }

  const barangayName = user?.barangay?.name
    ? `Barangay ${user.barangay.name}`
    : user?.city?.name ?? "CBMS";
  const mode = user?.barangay?.mode ?? "companion";

  const isVawUser =
    user?.roles?.includes("VAW_DESK_OFFICER") ||
    user?.email?.toLowerCase().includes("vaw");
  const isLuponUser =
    user?.roles?.includes("LUPON_SECRETARY") ||
    user?.email?.toLowerCase().includes("lupon");
  const isBdcUser =
    user?.roles?.includes("BDC_OFFICER") ||
    user?.email?.toLowerCase().includes("bdc");
  const isItUser =
    user?.roles?.includes("IT_OFFICER") ||
    user?.email?.toLowerCase().includes("it");

  return (
    <ConsoleContext.Provider value={value}>
      <div className="cbms-shell">
        <aside className={`cbms-sidebar${navOpen ? " cbms-sidebar--open" : ""}`}>
          <div className="cbms-sidebar__brand">
            <div className="cbms-sidebar__logo">CB</div>
            <div>
              <div className="cbms-sidebar__title">Barangay Console</div>
              <div className="cbms-sidebar__sub">{barangayName}</div>
            </div>
          </div>

          <nav className="cbms-nav">
            {NAV_GROUPS.map((group) => {
              if (group.roles && !group.roles.some((r) => session.hasRole(r))) {
                return null;
              }
              const items = group.items.filter((i) => {
                // Strict functionary role rules:
                if (isItUser) {
                  // IT Officer strictly sees only Application Management: Dashboard, Audit Logs, User CRUD Control, Dashboard Feature Toggles, IT Support Tickets, and Operations Manual
                  return (
                    i.href === "/dashboard" ||
                    (group.label === "Application Management" &&
                      (i.href === "/audit" ||
                       i.href === "/audit/users" ||
                       i.href === "/audit/features" ||
                       i.href === "/tickets" ||
                       i.href === "/docs"))
                  );
                }
                if (isVawUser) {
                  // VAW Desk Officer strictly sees only Dashboard and Blotter (NO KP cases, NO GAD, NO institutions)
                  return i.href === "/dashboard" || i.href === "/blotter";
                }
                if (isLuponUser) {
                  // Lupon Secretary strictly sees Dashboard, Blotter, and KP Cases
                  return i.href === "/dashboard" || i.href === "/blotter" || i.href === "/kp";
                }
                if (isBdcUser) {
                  // BDC Officer strictly sees Dashboard, Dev Plan, Institutions, and Reports
                  return (
                    i.href === "/dashboard" ||
                    i.href === "/devplan" ||
                    i.href === "/institutions" ||
                    i.href === "/reports"
                  );
                }
                return !i.perm || session.can(i.perm);
              });
              if (!items.length) return null;
              return (
                <div className="cbms-nav__group" key={group.label}>
                  <div className="cbms-nav__label">{group.label}</div>
                  {items.map((item) => {
                    const count = badgeCount(item.badge, dash.data);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setNavOpen(false)}
                        className={`cbms-nav__item${
                          current === item.href ? " cbms-nav__item--active" : ""
                        }`}
                      >
                        <span className="cbms-nav__icon" aria-hidden>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                        {count > 0 && <span className="cbms-nav__badge">{count}</span>}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>

          <div className="adm-sidebar-foot">
            Companion to DILG LGUSS-BIMS
            <br />
            (MC 2025-104) — never a replacement.
          </div>
        </aside>

        <div className="cbms-main">
          <header className="cbms-topbar">
            <button
              type="button"
              className="cbms-btn cbms-btn--sm adm-navtoggle"
              onClick={() => setNavOpen((o) => !o)}
              aria-label="Toggle navigation"
            >
              ☰
            </button>
            <div className="cbms-topbar__title">{title}</div>
            <Chip tone={mode === "companion" ? "navy" : "gold"}>Mode: {mode}</Chip>
             <div className="cbms-topbar__spacer" />

            {/* Quick Docs Link */}
            <Link
              href="/docs"
              className="cbms-btn cbms-btn--sm"
              title="Operations Manual & Documentation"
              style={{ padding: "0 0.6rem", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", textDecoration: "none" }}
            >
              <span>📖</span>
              <span className="adm-topbar-docs-text">Manual</span>
            </Link>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              className="cbms-btn cbms-btn--sm"
              onClick={toggleDarkMode}
              title="Toggle Dark Mode"
              style={{ padding: "0 0.5rem", borderRadius: "50%", width: "32px", height: "32px", display: "grid", placeItems: "center" }}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            {/* Notification Bell */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="cbms-btn cbms-btn--sm"
                onClick={() => setNotifsOpen(o => !o)}
                title="Notifications"
                style={{ padding: "0 0.5rem", borderRadius: "50%", width: "32px", height: "32px", display: "grid", placeItems: "center", position: "relative" }}
              >
                <span>🔔</span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-2px",
                      right: "-2px",
                      backgroundColor: "var(--cbms-red, #ce1126)",
                      color: "#fff",
                      borderRadius: "50%",
                      fontSize: "9px",
                      fontWeight: "bold",
                      width: "15px",
                      height: "15px",
                      display: "grid",
                      placeItems: "center"
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifsOpen && (
                <div
                  className="cbms-dropdown"
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "0.5rem",
                    backgroundColor: "var(--color-bg-card, #ffffff)",
                    border: "1px solid var(--color-border, #e2e8f0)",
                    borderRadius: "0.5rem",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    padding: "0.75rem",
                    minWidth: "260px",
                    zIndex: 1000,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border, #e2e8f0)", paddingBottom: "0.5rem" }}>
                    <span style={{ fontWeight: "bold", fontSize: "0.85rem", color: "var(--color-text, #1e293b)" }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                        style={{ border: "none", background: "none", color: "var(--cbms-navy, #0a2463)", fontSize: "0.75rem", cursor: "pointer", fontWeight: "600" }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "200px", overflowY: "auto" }}>
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        style={{
                          padding: "0.5rem",
                          borderRadius: "0.375rem",
                          fontSize: "0.8rem",
                          backgroundColor: n.read ? "transparent" : "var(--color-bg-hover, #f1f5f9)",
                          borderLeft: n.read ? "none" : "3px solid var(--cbms-navy, #0a2463)",
                          color: "var(--color-text, #1e293b)",
                          textAlign: "left"
                        }}
                      >
                        <div>{n.text}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--color-text-sub, #64748b)", marginTop: "2px" }}>{n.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="cbms-topbar__user" style={{ position: "relative" }}>
              <div
                className="adm-topbar-id-container"
                style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", userSelect: "none" }}
                onClick={() => setUserMenuOpen((o) => !o)}
              >
                <div className="cbms-avatar">{initials(user?.fullName)}</div>
                <div className="adm-topbar-id">
                  <div className="adm-topbar-id__name" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    {user?.fullName ?? "…"} <span style={{ fontSize: "0.6rem" }}>▼</span>
                  </div>
                  <div className="adm-topbar-id__role">
                    {user?.roleLabels?.join(", ") || roleLabel(user?.roles)} · {barangayName}
                  </div>
                </div>
              </div>

              {userMenuOpen && (
                <div
                  className="cbms-dropdown"
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "0.5rem",
                    backgroundColor: "var(--color-bg-card, #ffffff)",
                    border: "1px solid var(--color-border, #e2e8f0)",
                    borderRadius: "0.5rem",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    padding: "0.75rem",
                    minWidth: "220px",
                    zIndex: 1000,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem"
                  }}
                >
                  <div style={{ paddingBottom: "0.5rem", borderBottom: "1px solid var(--color-border, #e2e8f0)" }}>
                    <div style={{ fontWeight: "bold", fontSize: "0.9rem", color: "var(--color-text, #1e293b)" }}>{user?.fullName}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-sub, #64748b)", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</div>
                  </div>

                  {/* Quick Role Switcher for Testing / Demonstration */}
                  <div style={{ padding: "0.25rem 0", borderBottom: "1px solid var(--color-border, #e2e8f0)" }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", padding: "0.25rem 0.5rem" }}>
                      🎭 Switch Role Preview
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: "180px", overflowY: "auto" }}>
                      {[
                        { email: "bdc@barangka.gov.ph", label: "BDC Chair (Dev Council)", icon: "🧭" },
                        { email: "vawdesk@barangka.gov.ph", label: "VAW Desk Officer", icon: "🛡️" },
                        { email: "lupon@barangka.gov.ph", label: "Lupon Secretary", icon: "⚖️" },
                        { email: "treasurer@barangka.gov.ph", label: "Barangay Treasurer", icon: "🏦" },
                        { email: "tanod@barangka.gov.ph", label: "Barangay Tanod", icon: "🚨" },
                        { email: "bdrrmc@barangka.gov.ph", label: "BDRRMC (Disaster)", icon: "🌀" },
                        { email: "secretary@barangka.gov.ph", label: "Barangay Secretary", icon: "📝" },
                        { email: "it@barangka.gov.ph", label: "IT Officer / Systems Auditor", icon: "💻" },
                        { email: "bhw@barangka.gov.ph", label: "BHW Lead", icon: "💉" },
                        { email: "kapitan@barangka.gov.ph", label: "Punong Barangay (All)", icon: "🏛️" },
                      ].map((r) => {
                        const isCurrent = user?.email?.toLowerCase() === r.email.toLowerCase();
                        return (
                          <button
                            key={r.email}
                            type="button"
                            onClick={async () => {
                              setUserMenuOpen(false);
                              await login(r.email, "Cbms#2026");
                              window.location.href = "/dashboard";
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              padding: "0.35rem 0.5rem",
                              borderRadius: "0.25rem",
                              fontSize: "0.78rem",
                              border: "none",
                              background: isCurrent ? "rgba(37, 99, 235, 0.1)" : "transparent",
                              fontWeight: isCurrent ? 700 : 400,
                              color: isCurrent ? "#2563eb" : "var(--color-text, #1e293b)",
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                            onMouseEnter={(e) => {
                              if (!isCurrent) e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f1f5f9)";
                            }}
                            onMouseLeave={(e) => {
                              if (!isCurrent) e.currentTarget.style.backgroundColor = "transparent";
                            }}
                          >
                            <span>{r.icon}</span>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {r.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Link
                    href="/docs"
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                      color: "var(--color-text, #1e293b)",
                      textDecoration: "none",
                      backgroundColor: "transparent",
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f1f5f9)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    📖 Operations Manual
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                      color: "var(--color-text, #1e293b)",
                      textDecoration: "none",
                      backgroundColor: "transparent",
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f1f5f9)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    👤 View Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      void logout();
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      width: "100%",
                      textAlign: "left",
                      border: "none",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                      color: "var(--color-error, #ef4444)",
                      cursor: "pointer",
                      backgroundColor: "transparent",
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-error-light, #fee2e2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    🚪 Sign out
                  </button>
                </div>
              )}
            </div>
          </header>

          <main className="cbms-content">{children}</main>
          <MockBanner />
        </div>
      </div>
    </ConsoleContext.Provider>
  );
}
