"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, logout } from "@cbms/api-client";
import { Alert, Loading, MockBanner, initials } from "@cbms/ui";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: "▤" },
  { href: "/barangays", label: "Barangays", icon: "🏘" },
  { href: "/scorecard", label: "Adoption Scorecard", icon: "◎" },
  { href: "/quarterly", label: "Quarterly Report", icon: "🗎" },
  { href: "/about", label: "About", icon: "ⓘ" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Desktop shell for the LGU / DILG hub. Guards every page behind a session and
 * surfaces the aggregate-only notice for the DILG_VIEWER role.
 */
export function Shell({ children }: { children: React.ReactNode }) {
  const { user, loading, hasRole } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading) return <Loading label="Checking your session…" />;
  if (!user) return <Loading label="Redirecting to sign in…" />;

  const isDilg = hasRole("DILG_VIEWER");
  const current = NAV.find((n) => isActive(pathname, n.href));
  const scopeLabel = isDilg ? "DILG oversight" : (user.city?.name ?? "City hall");

  return (
    <div className="cbms-shell">
      <aside className="cbms-sidebar">
        <div className="cbms-sidebar__brand">
          <div className="cbms-sidebar__logo">HUB</div>
          <div style={{ minWidth: 0 }}>
            <div className="cbms-sidebar__title">CBMS Hub</div>
            <div className="cbms-sidebar__sub">{scopeLabel}</div>
          </div>
        </div>

        <nav className="cbms-nav">
          <div className="cbms-nav__group">
            <div className="cbms-nav__label">Oversight</div>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`cbms-nav__item${
                  isActive(pathname, item.href) ? " cbms-nav__item--active" : ""
                }`}
              >
                <span className="cbms-nav__icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="cbms-nav__group">
            <div className="cbms-nav__label">Companion to</div>
            <div
              style={{
                padding: "8px 12px",
                margin: "1px 4px",
                fontSize: 11.5,
                lineHeight: 1.5,
                color: "#8fa4d4",
              }}
            >
              DILG LGUSS-BIMS
              <br />
              MC No. 2025-104
            </div>
          </div>
        </nav>
      </aside>

      <div className="cbms-main">
        <header className="cbms-topbar">
          <div className="cbms-topbar__title">{current?.label ?? "CBMS Hub"}</div>
          <div className="cbms-topbar__spacer" />
          <div className="cbms-topbar__user">
            <div className="cbms-avatar">{initials(user.fullName)}</div>
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ fontWeight: 600 }}>{user.fullName}</div>
              <div style={{ fontSize: 11.5, color: "var(--cbms-muted)" }}>
                {user.roles.join(", ")}
              </div>
            </div>
            <button
              className="cbms-btn cbms-btn--sm"
              onClick={() => void logout()}
              style={{ marginLeft: 8 }}
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="cbms-content">
          {isDilg && (
            <div style={{ marginBottom: 16 }}>
              <Alert tone="info">
                <strong>Aggregate-only access</strong> — raw personal data is not available to
                this role. Figures below are statistical roll-ups; individual inhabitant,
                household and case records are withheld under the Data Privacy Act of 2012 (RA
                10173).
              </Alert>
            </div>
          )}
          {children}
        </main>

        <MockBanner />
      </div>
    </div>
  );
}
