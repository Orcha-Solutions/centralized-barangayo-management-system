"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loading, relative } from "@cbms/ui";
import { useApi, logout } from "@cbms/api-client";
import { Card, Muted, SectionTitle, Shell } from "@/components/Shell";
import { useT, type TKey } from "@/i18n";
import { severityTone } from "@/lib/labels";
import { useResidentSession } from "@/lib/session";
import type { Announcement, ListResponse, Profile } from "@/lib/types";

interface Tile {
  href: string;
  key: TKey;
  icon: string;
}

const TILES: Tile[] = [
  { href: "/services", key: "tile_clearance", icon: "📄" },
  { href: "/report", key: "tile_report", icon: "📣" },
  { href: "/appointments", key: "tile_appointments", icon: "📅" },
  { href: "/wallet", key: "tile_wallet", icon: "👛" },
  { href: "/health", key: "tile_health", icon: "🩺" },
  { href: "/jobs", key: "tile_jobs", icon: "💼" },
];

export default function HomePage() {
  const { t } = useT();
  const router = useRouter();
  const { ready, user } = useResidentSession({ requireAuth: false });
  const isAuthed = !!user;

  const profileReq = useApi<{ profile: Profile | null }>(isAuthed ? "/me/profile" : null);
  const announcementsReq = useApi<ListResponse<Announcement>>(ready ? "/announcements" : null);

  if (!ready) return <Loading label={t("loading")} />;

  const firstName = profileReq.data?.profile?.firstName || user?.fullName?.split(" ")[0];
  const greeting = isAuthed
    ? firstName
      ? t("home_greet", { name: firstName })
      : t("home_greet_plain")
    : "Barangay Citizen Hub";

  const subtitle = isAuthed ? t("home_sub") : "Opisyal na Portal ng mga Mamamayan";

  const announcements = (announcementsReq.data?.items ?? [])
    .filter((a) => a.isPublished)
    .slice(0, 4);

  const headerAction = isAuthed ? (
    <button
      type="button"
      onClick={() => void logout()}
      style={{
        background: "rgba(255,255,255,0.18)",
        border: "1px solid rgba(255,255,255,0.3)",
        color: "#fff",
        padding: "4px 8px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      Sign out 🚪
    </button>
  ) : (
    <Link
      href="/login"
      style={{
        background: "var(--cbms-gold, #fdb913)",
        color: "var(--cbms-navy, #0a2463)",
        padding: "5px 11px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 800,
        textDecoration: "none",
        whiteSpace: "nowrap",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      }}
    >
      Sign in 🔐
    </Link>
  );

  return (
    <Shell title={greeting} subtitle={subtitle} headerAction={headerAction} exclusive>
      {!isAuthed && (
        <div
          style={{
            background: "linear-gradient(135deg, #eef3fc 0%, #e0ebff 100%)",
            border: "1px solid #c9d8f3",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 14,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 13.5, color: "var(--cbms-navy)" }}>
            👋 Maligayang Pagdating sa Citizen Hub!
          </div>
          <div style={{ fontSize: 12, color: "var(--cbms-muted)", marginTop: 4, lineHeight: 1.45 }}>
            Tingnan ang pinakabagong mga anunsyo at pampublikong serbisyo. Mag-sign in upang kumuha
            ng Barangay Clearance, tingnan ang E-Wallet, at gamitin ang digital Resident ID.
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <Link
              href="/login"
              style={{
                display: "inline-block",
                background: "var(--cbms-navy, #0a2463)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 12,
                padding: "6px 14px",
                borderRadius: 6,
                textDecoration: "none",
              }}
            >
              Mag-sign in sa Resident Portal →
            </Link>
          </div>
        </div>
      )}

      <button
        type="button"
        className="cbms-sos"
        onClick={() => router.push("/sos")}
        aria-label={t("home_sos_label")}
      >
        🚨 {t("home_sos_label")}
      </button>
      <Muted>{t("home_sos_hint")}</Muted>

      <SectionTitle>{t("home_shortcuts")}</SectionTitle>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
        }}
      >
        {TILES.map((tile) => {
          const destination =
            isAuthed || tile.href === "/sos" || tile.href === "/report"
              ? tile.href
              : `/login?redirect=${encodeURIComponent(tile.href)}`;
          return (
            <Link key={tile.href} href={destination} className="cbms-tile">
              <span className="cbms-tile__icon" aria-hidden="true">
                {tile.icon}
              </span>
              <span className="cbms-tile__label">{t(tile.key)}</span>
            </Link>
          );
        })}
      </div>

      <SectionTitle>{t("home_announcements")}</SectionTitle>
      {announcementsReq.loading ? (
        <Muted>{t("loading")}</Muted>
      ) : announcements.length === 0 ? (
        <Card>
          <Muted>{t("home_no_announcements")}</Muted>
        </Card>
      ) : (
        announcements.map((a) => (
          <div
            key={a.id}
            className={`cbms-alert cbms-alert--${severityTone(a.severity)}`}
            style={{ marginBottom: 10 }}
          >
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>{a.title}</div>
            <div style={{ fontSize: 13, marginTop: 4, lineHeight: 1.45 }}>{a.body}</div>
            {a.publishedAt && (
              <div style={{ fontSize: 11, opacity: 0.8, marginTop: 6 }}>
                {relative(a.publishedAt)}
              </div>
            )}
          </div>
        ))
      )}

      <div style={{ marginTop: 16 }}>
        <Link
          href="/participate"
          style={{ fontSize: 13.5, fontWeight: 700, color: "var(--cbms-navy)" }}
        >
          {t("home_participate")}
        </Link>
      </div>

      <Muted>{t("companion_note")}</Muted>
    </Shell>
  );
}
