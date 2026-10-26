"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  getToken,
  login,
  logout,
  useApi,
  type RbacPermissionInfo,
  type RbacRoleInfo,
  type SessionUser,
} from "@cbms/api-client";
import { Alert, Chip, Panel, Spinner, initials } from "@cbms/ui";
import { NAV_GROUPS, activeHref, type BadgeKey } from "./nav";
import { roleLabel } from "../lib/labels";
import type { DashboardData } from "../lib/types";
import { useRbacStore, type CrudAction } from "../lib/rbac-store";
import {
  useRbacPermissionsQuery,
  useRbacRolesQuery,
  useRbacSessionQuery,
  useTenantsQuery,
} from "../lib/rbac-queries";

export type ConsoleUser = SessionUser & { roleLabels?: string[] };

interface ConsoleContextValue {
  user: ConsoleUser | null;
  loading: boolean;
  can: (perm: string) => boolean;
  canAny: (...perms: string[]) => boolean;
  canAll: (...perms: string[]) => boolean;
  hasRole: (...roles: string[]) => boolean;
  canCrud: (action: CrudAction) => boolean;
  rolesCatalog: RbacRoleInfo[];
  permissionsCatalog: RbacPermissionInfo[];
  dashboard: DashboardData | null;
  reloadDashboard: () => void;
}

const ConsoleContext = React.createContext<ConsoleContextValue | null>(null);

/** Session + RBAC + action-queue counters, shared by every console page. */
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
  const router = useRouter();
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

  // Zustand RBAC & Multitenancy state
  const hydrateFromStorage = useRbacStore((s) => s.hydrateFromStorage);
  const storeUser = useRbacStore((s) => s.user);
  const tenants = useRbacStore((s) => s.tenants);
  const rolesCatalog = useRbacStore((s) => s.rolesCatalog);
  const permissionsCatalog = useRbacStore((s) => s.permissionsCatalog);
  const setActiveTenant = useRbacStore((s) => s.setActiveTenant);
  const can = useRbacStore((s) => s.can);
  const canAny = useRbacStore((s) => s.canAny);
  const canAll = useRbacStore((s) => s.canAll);
  const hasRole = useRbacStore((s) => s.hasRole);
  const canCrud = useRbacStore((s) => s.canCrud);
  const canAccessRoute = useRbacStore((s) => s.canAccessRoute);

  // TanStack React Query synchronization for Session, RBAC Roles, Permissions & Tenants
  const sessionQuery = useRbacSessionQuery();
  useRbacRolesQuery();
  useRbacPermissionsQuery();
  useTenantsQuery();

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
    hydrateFromStorage();
    setAuthed(true);
  }, [hydrateFromStorage]);

  const dash = useApi<DashboardData>(authed ? "/dashboard" : null);
  const user = (storeUser || sessionQuery.data) as ConsoleUser | null;
  const isLoadingSession = !user && sessionQuery.isLoading;

  const isPlatformSuperAdmin = Boolean(
    hasRole("SYSTEM_ADMIN") ||
    user?.roles?.includes("SYSTEM_ADMIN") ||
    user?.role === "SYSTEM_ADMIN" ||
    user?.scope === "platform" ||
    user?.email?.toLowerCase().startsWith("admin@") ||
    user?.email?.toLowerCase().includes("superadmin") ||
    user?.email?.toLowerCase().includes("orcha") ||
    (user?.email?.toLowerCase().startsWith("it@") && (!user?.tenantId || user?.tenantId === "" || user?.tenantId === "global"))
  );

  React.useEffect(() => {
    if (authed && isPlatformSuperAdmin && (pathname === "/" || pathname === "/dashboard")) {
      router.replace("/super-admin");
    }
  }, [authed, isPlatformSuperAdmin, pathname, router]);

  const value = React.useMemo<ConsoleContextValue>(
    () => ({
      user,
      loading: isLoadingSession,
      can,
      canAny,
      canAll,
      hasRole,
      canCrud,
      rolesCatalog,
      permissionsCatalog,
      dashboard: dash.data,
      reloadDashboard: dash.reload,
    }),
    [
      user,
      isLoadingSession,
      can,
      canAny,
      canAll,
      hasRole,
      canCrud,
      rolesCatalog,
      permissionsCatalog,
      dash.data,
      dash.reload,
    ],
  );

  const current = activeHref(pathname);
  const title =
    NAV_GROUPS.flatMap((g) => g.items).find((i) => i.href === current)?.label ??
    "Barangay Console";

  if (!authed || isLoadingSession || !user) {
    return (
      <div className="cbms-center">
        <Spinner />
      </div>
    );
  }

  const barangayName = user?.barangay?.name
    ? `Barangay ${user.barangay.name}`
    : user?.city?.name ?? "CBMS";
  const mode = user?.barangay?.mode ?? "shared_db";
  const canSwitchTenant =
    user?.roles?.includes("SYSTEM_ADMIN") ||
    user?.roles?.includes("LGU_ADMIN") ||
    user?.roles?.includes("DILG_VIEWER") ||
    user?.scope === "platform" ||
    user?.scope === "city";
  const routeAccess = canAccessRoute(pathname);

  const isSuperAdmin =
    isPlatformSuperAdmin ||
    hasRole("PUNONG_BARANGAY") ||
    user?.roles?.includes("PUNONG_BARANGAY") ||
    user?.role === "PUNONG_BARANGAY" ||
    user?.email?.toLowerCase().includes("kapitan");

  const isVawUser =
    !isSuperAdmin &&
    (hasRole("VAW_DESK_OFFICER") ||
      user?.roles?.includes("VAW_DESK_OFFICER") ||
      user?.role === "VAW_DESK_OFFICER" ||
      user?.email?.toLowerCase().includes("vaw"));
  const isLuponUser =
    !isSuperAdmin &&
    (hasRole("LUPON_SECRETARY") ||
      user?.roles?.includes("LUPON_SECRETARY") ||
      user?.role === "LUPON_SECRETARY" ||
      user?.email?.toLowerCase().includes("lupon"));
  const isBdcUser =
    !isSuperAdmin &&
    (hasRole("BDC_OFFICER") ||
      user?.roles?.includes("BDC_OFFICER") ||
      user?.role === "BDC_OFFICER" ||
      user?.email?.toLowerCase().includes("bdc"));
  const isItUser =
    !isSuperAdmin &&
    (hasRole("IT_OFFICER") ||
      user?.roles?.includes("IT_OFFICER") ||
      user?.role === "IT_OFFICER" ||
      user?.email?.toLowerCase().startsWith("it@") ||
      user?.email?.toLowerCase().includes("it_officer") ||
      user?.email?.toLowerCase().includes("admin.it") ||
      user?.email?.toLowerCase().includes("sysadmin"));

  return (
    <ConsoleContext.Provider value={value}>
      <div className="cbms-shell">
        <aside className={`cbms-sidebar${navOpen ? " cbms-sidebar--open" : ""}`}>
          <div className="cbms-sidebar__brand">
            <div className="cbms-sidebar__logo">
              {isPlatformSuperAdmin ? "⚡" : "CB"}
            </div>
            <div>
              <div className="cbms-sidebar__title">
                {isPlatformSuperAdmin ? "ORCHA Super Admin" : "Barangay Console"}
              </div>
              <div className="cbms-sidebar__sub">
                {isPlatformSuperAdmin ? "Platform Operations" : barangayName}
              </div>
            </div>
          </div>

          <nav className="cbms-nav">
            {NAV_GROUPS.map((group) => {
              // For IT Super Admin / Platform Super Admin, strictly show ONLY the Super Admin Platform module
              if (isPlatformSuperAdmin) {
                const isSuperAdminGroup =
                  group.label === "Super Admin Platform " ||
                  group.label.includes("Super Admin Platform");
                if (!isSuperAdminGroup) {
                  return null;
                }
              } else {
                if (group.roles && !group.roles.some((r) => hasRole(r))) {
                  return null;
                }
              }
              const items = group.items.filter((i) => {
                // Platform Super Admins always see all navigation items without restriction
                if (isPlatformSuperAdmin) {
                  return true;
                }
                // Non-platform super admins never see super-admin routes
                if (i.href.startsWith("/super-admin")) {
                  return false;
                }
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
                return !i.perm || can(i.perm);
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
            <Chip tone={mode === "companion" || mode === "shared_db" ? "navy" : "gold"}>
              🏛️ {barangayName} · {mode}
            </Chip>
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
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                      {(["create", "read", "update", "delete"] as CrudAction[]).map((act) => {
                        const enabled = canCrud(act);
                        return (
                          <span
                            key={act}
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "1px 5px",
                              borderRadius: 4,
                              background: enabled ? "#dcfce7" : "#fee2e2",
                              color: enabled ? "#166534" : "#991b1b",
                              border: `1px solid ${enabled ? "#86efac" : "#fca5a5"}`,
                              textTransform: "uppercase",
                            }}
                          >
                            {act[0]}: {enabled ? "ON" : "OFF"}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Role Switcher for Testing / Demonstration */}
                  <div style={{ padding: "0.25rem 0", borderBottom: "1px solid var(--color-border, #e2e8f0)" }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", padding: "0.25rem 0.5rem" }}>
                      🎭 Switch Role Preview
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: "220px", overflowY: "auto" }}>
                      {[
                        { email: "admin@cbms.gov.ph", label: "Platform Super Admin", icon: "🛡️" },
                        { email: "kapitan@barangka.gov.ph", label: "Punong Barangay (All)", icon: "🏛️" },
                        { email: "secretary@barangka.gov.ph", label: "Barangay Secretary", icon: "📝" },
                        { email: "treasurer@barangka.gov.ph", label: "Barangay Treasurer", icon: "🏦" },
                        { email: "it@barangka.gov.ph", label: "IT Officer / DPO", icon: "💻" },
                        { email: "lupon@barangka.gov.ph", label: "Lupon Secretary", icon: "⚖️" },
                        { email: "vawdesk@barangka.gov.ph", label: "VAW Desk Officer", icon: "💜" },
                        { email: "bdc@barangka.gov.ph", label: "BDC Chair (Dev Council)", icon: "🧭" },
                        { email: "bdrrmc@barangka.gov.ph", label: "BDRRMC (Disaster)", icon: "🌀" },
                        { email: "tanod@barangka.gov.ph", label: "Barangay Tanod", icon: "🚨" },
                        { email: "bhw@barangka.gov.ph", label: "BHW Lead", icon: "💉" },
                        { email: "lgu@marikina.gov.ph", label: "City LGU Admin", icon: "🌆" },
                      ].map((r) => {
                        const isCurrent = user?.email?.toLowerCase() === r.email.toLowerCase();
                        return (
                          <button
                            key={r.email}
                            type="button"
                            onClick={async () => {
                              setUserMenuOpen(false);
                              await login(r.email, "Password123!");
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

          <main className="cbms-content">
            {routeAccess.allowed ? (
              children
            ) : (
              <Panel title="🛡️ DILG MC 2025-104 Role-Based Access Control (403 Restricted)">
                <Alert tone="danger">
                  <strong>Unauthorized Module Access:</strong> {routeAccess.reason}
                </Alert>
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                  <div>
                    Active Official: <strong>{user?.fullName}</strong> (<code>{user?.email}</code>)
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span>Assigned Role:</span>
                    <Chip tone="navy">{roleLabel(user?.roles)}</Chip>
                    {routeAccess.requiredPerm && (
                      <>
                        <span>Required Permission:</span>
                        <Chip tone="red">{routeAccess.requiredPerm}</Chip>
                      </>
                    )}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Link href="/dashboard" className="cbms-btn cbms-btn--primary">
                      ← Return to Authorized Workspace
                    </Link>
                  </div>
                </div>
              </Panel>
            )}
          </main>
        </div>
      </div>
    </ConsoleContext.Provider>
  );
}
