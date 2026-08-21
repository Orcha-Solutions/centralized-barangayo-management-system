"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loading, relative } from "@cbms/ui";
import { useApi } from "@cbms/api-client";
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
  const { ready } = useResidentSession();

  const profileReq = useApi<{ profile: Profile | null }>(ready ? "/me/profile" : null);
  const announcementsReq = useApi<ListResponse<Announcement>>(ready ? "/announcements" : null);

  if (!ready) return <Loading label={t("loading")} />;

  const firstName = profileReq.data?.profile?.firstName;
  const greeting = firstName ? t("home_greet", { name: firstName }) : t("home_greet_plain");

  const announcements = (announcementsReq.data?.items ?? [])
    .filter((a) => a.isPublished)
    .slice(0, 4);

  return (
    <Shell title={greeting} subtitle={t("home_sub")} exclusive>
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
        {TILES.map((tile) => (
          <Link key={tile.href} href={tile.href} className="cbms-tile">
            <span className="cbms-tile__icon" aria-hidden="true">
              {tile.icon}
            </span>
            <span className="cbms-tile__label">{t(tile.key)}</span>
          </Link>
        ))}
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
