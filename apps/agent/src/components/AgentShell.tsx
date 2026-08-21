"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@cbms/api-client";
import { Loading, MockBanner, peso } from "@cbms/ui";
import { OutletProvider, useOutlet } from "../lib/outlet";

const TABS = [
  { href: "/", label: "Home", icon: "\u{1F3E0}" },
  { href: "/cash-out", label: "Cash-out", icon: "\u{1F4B8}" },
  { href: "/transactions", label: "Txns", icon: "\u{1F9FE}" },
  { href: "/float", label: "Float", icon: "\u{1F4B5}" },
];

const TITLES: Record<string, string> = {
  "/": "Outlet",
  "/cash-out": "Cash-out",
  "/transactions": "Transactions",
  "/float": "Cash float",
};

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function TabBar({ pathname }: { pathname: string }) {
  return (
    <nav className="cbms-tabbar" style={{ gridTemplateColumns: `repeat(${TABS.length}, 1fr)` }}>
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`cbms-tab${isActive(pathname, t.href) ? " cbms-tab--active" : ""}`}
          aria-current={isActive(pathname, t.href) ? "page" : undefined}
        >
          <span className="cbms-tab__icon" aria-hidden="true">
            {t.icon}
          </span>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { outlet, loading } = useOutlet();

  return (
    <div className="cbms-mobile">
      <header className="cbms-mobile__header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="cbms-sidebar__logo" aria-hidden="true">
            {"₱"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.2 }}>
              {TITLES[pathname] ?? "CBMS Agent"}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--cbms-ice)",
                marginTop: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {loading ? "Loading outlet…" : (outlet?.outletName ?? "No outlet assigned")}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: "var(--cbms-ice)" }}>E-float</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              {outlet ? peso(outlet.eFloatCentavos) : "—"}
            </div>
          </div>
        </div>
      </header>

      <main className="cbms-mobile__body">{children}</main>

      <MockBanner what="the EMI cash-in/cash-out rail and the agent float ledger" />
      <TabBar pathname={pathname} />
    </div>
  );
}

export function AgentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useSession();
  const isLogin = pathname === "/login";

  React.useEffect(() => {
    if (!loading && !user && !isLogin) router.replace("/login");
  }, [loading, user, isLogin, router]);

  // The login screen renders its own full-bleed layout.
  if (isLogin) return <>{children}</>;

  if (loading) return <Loading label="Checking your session…" />;

  if (!user) return <Loading label="Redirecting to sign in…" />;

  return (
    <OutletProvider>
      <Chrome>{children}</Chrome>
    </OutletProvider>
  );
}
