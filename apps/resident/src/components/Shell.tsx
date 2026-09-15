"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MockBanner, ParityBadge } from "@cbms/ui";
import { useT, type TKey } from "@/i18n";

interface Tab {
  href: string;
  key: TKey;
  icon: string;
}

const TABS: Tab[] = [
  { href: "/", key: "tab_home", icon: "🏠" },
  { href: "/services", key: "tab_services", icon: "📄" },
  { href: "/report", key: "tab_report", icon: "📣" },
  { href: "/wallet", key: "tab_wallet", icon: "👛" },
  { href: "/me", key: "tab_me", icon: "👤" },
];

/** Bottom navigation. `/` only lights up on an exact match. */
export function TabBar() {
  const { t } = useT();
  const pathname = usePathname() ?? "/";

  return (
    <nav className="cbms-tabbar" aria-label={t("app_name")}>
      {TABS.map((tab) => {
        const active =
          tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`cbms-tab${active ? " cbms-tab--active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className="cbms-tab__icon" aria-hidden="true">
              {tab.icon}
            </span>
            {t(tab.key)}
          </Link>
        );
      })}
    </nav>
  );
}

export function Shell(props: {
  title: string;
  subtitle?: string;
  /** Href for a back chevron in the header. */
  back?: string;
  /** Group B modules are CBMS-exclusive — say so out loud. */
  exclusive?: boolean;
  /** Optional action element on the right of the header. */
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="cbms-mobile">
      <div
        style={{
          background: "#071a47",
          color: "#fff",
          padding: "6px 14px",
          fontSize: 11,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              display: "inline-flex",
              width: 14,
              height: 9,
              borderRadius: 1,
              overflow: "hidden",
              flexDirection: "column",
              border: "1px solid rgba(255,255,255,0.3)",
              flexShrink: 0,
            }}
          >
            <i style={{ background: "#0038a8", height: "50%", display: "block" }} />
            <i style={{ background: "#ce1126", height: "50%", display: "block" }} />
          </span>
          <strong style={{ fontSize: 10.5, letterSpacing: "0.02em" }}>Republika ng Pilipinas</strong>
        </div>
        <span style={{ color: "#9fb3dd", fontSize: 10 }}>Citizen Services</span>
      </div>

      <header className="cbms-mobile__header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {props.back && (
            <Link
              href={props.back}
              aria-label="back"
              style={{ fontSize: 20, lineHeight: 1, color: "#fff" }}
            >
              ‹
            </Link>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: ".01em" }}>
              {props.title}
            </div>
            {props.subtitle && (
              <div style={{ fontSize: 12, opacity: 0.82, marginTop: 2 }}>
                {props.subtitle}
              </div>
            )}
          </div>
          {props.headerAction}
        </div>
      </header>

      <main className="cbms-mobile__body">
        {props.exclusive && (
          <div style={{ marginBottom: 12 }}>
            <ParityBadge />
          </div>
        )}
        {props.children}
      </main>

      <MockBanner />
      <TabBar />
    </div>
  );
}

/** A white rounded block — the mobile equivalent of Panel. */
export function Card(props: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <section
      className="cbms-panel"
      onClick={props.onClick}
      style={{ marginBottom: 12, cursor: props.onClick ? "pointer" : undefined }}
    >
      {(props.title || props.right) && (
        <div className="cbms-panel__head">
          {props.title && <div className="cbms-panel__title">{props.title}</div>}
          <div style={{ flex: 1 }} />
          {props.right}
        </div>
      )}
      <div style={{ padding: 14 }}>{props.children}</div>
    </section>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 13,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: ".05em",
        color: "var(--cbms-muted)",
        margin: "18px 0 10px",
      }}
    >
      {children}
    </h2>
  );
}

export function Muted({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 13, color: "var(--cbms-muted)", margin: "6px 0" }}>{children}</p>
  );
}
