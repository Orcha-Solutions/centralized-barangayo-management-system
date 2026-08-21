"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getToken,
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
  const session = useSession();

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

  if (!authed) {
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
              const items = group.items.filter((i) => !i.perm || session.can(i.perm));
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
            <div className="cbms-topbar__user">
              <div className="cbms-avatar">{initials(user?.fullName)}</div>
              <div className="adm-topbar-id">
                <div className="adm-topbar-id__name">{user?.fullName ?? "…"}</div>
                <div className="adm-topbar-id__role">
                  {user?.roleLabels?.join(", ") || roleLabel(user?.roles)} · {barangayName}
                </div>
              </div>
              <button
                type="button"
                className="cbms-btn cbms-btn--sm"
                onClick={() => {
                  void logout();
                }}
              >
                Log out
              </button>
            </div>
          </header>

          <main className="cbms-content">{children}</main>
          <MockBanner />
        </div>
      </div>
    </ConsoleContext.Provider>
  );
}
