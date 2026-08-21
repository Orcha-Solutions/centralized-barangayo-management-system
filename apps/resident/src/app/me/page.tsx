"use client";

import * as React from "react";
import Link from "next/link";
import {
  Alert,
  Button,
  Chip,
  KeyValue,
  Loading,
  age,
  date,
  fullName,
  titleize,
} from "@cbms/ui";
import { api, logout, useApi } from "@cbms/api-client";
import { Card, Muted, SectionTitle, Shell } from "@/components/Shell";
import { useT, type Lang } from "@/i18n";
import { errorMessage, useResidentSession } from "@/lib/session";
import type { Profile } from "@/lib/types";

export default function MePage() {
  const { t, lang, setLang } = useT();
  const { ready, user } = useResidentSession();
  const profileReq = useApi<{ profile: Profile | null }>(ready ? "/me/profile" : null);

  const [downloading, setDownloading] = React.useState(false);
  const [downloadNote, setDownloadNote] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  if (!ready) return <Loading label={t("loading")} />;

  const profile = profileReq.data?.profile ?? null;
  const consents = profile?.household?.consents ?? [];

  /** RA 10173 §16(c) — the resident may take a copy of everything we hold. */
  async function downloadMyData() {
    setDownloading(true);
    setDownloadNote(null);
    setError(null);
    try {
      const res = await api<Response>("/me/data-export", { raw: true });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const text = await res.text();
      const url = URL.createObjectURL(
        new Blob([text], { type: "application/json;charset=utf-8" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-cbms-data.json";
      a.click();
      URL.revokeObjectURL(url);
      setDownloadNote(t("me_download_done"));
    } catch (err) {
      setError(errorMessage(err, lang));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Shell title={t("me_title")} subtitle={t("me_sub")} exclusive>
      {error && <Alert tone="danger">{error}</Alert>}
      {profileReq.loading && <Muted>{t("loading")}</Muted>}
      {profileReq.error && !profileReq.loading && (
        <Alert tone="warn">{errorMessage(profileReq.error, lang)}</Alert>
      )}

      {/* ---------------- Digital barangay ID ---------------- */}
      <SectionTitle>{t("me_id_card")}</SectionTitle>
      {profile?.digitalId ? (
        <div
          style={{
            borderRadius: "var(--cbms-radius-lg)",
            overflow: "hidden",
            boxShadow: "var(--cbms-shadow-lg)",
            border: "1px solid var(--cbms-line)",
            background: "#fff",
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg, var(--cbms-navy) 0%, var(--cbms-navy-ink) 100%)",
              color: "#fff",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 22 }} aria-hidden="true">
              🏛️
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".04em" }}>
                {t("me_id_card")}
              </div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>
                Barangay {profile.barangay?.name ?? "—"}
              </div>
            </div>
          </div>

          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--cbms-navy)" }}>
              {fullName(profile)}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--cbms-muted)", marginTop: 2 }}>
              {profile.household?.addressLine ?? "—"}
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--cbms-muted)" }}>
                {t("me_id_number")}
              </div>
              <div
                style={{
                  fontFamily: "ui-monospace, Consolas, monospace",
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: ".08em",
                  color: "var(--cbms-ink)",
                }}
              >
                {profile.digitalId.idNumber}
              </div>
            </div>

            {/* QR payload rendered as text — no QR library in this build. */}
            <div
              style={{
                marginTop: 14,
                border: "2px dashed var(--cbms-navy)",
                borderRadius: "var(--cbms-radius)",
                background: "var(--cbms-card)",
                padding: 12,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--cbms-muted)" }}>
                {t("me_qr")}
              </div>
              <div
                style={{
                  fontFamily: "ui-monospace, Consolas, monospace",
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: ".1em",
                  color: "var(--cbms-navy)",
                  margin: "4px 0",
                  wordBreak: "break-all",
                }}
              >
                {profile.digitalId.qrCode}
              </div>
              <div style={{ fontSize: 11, color: "var(--cbms-muted)" }}>{t("me_qr_hint")}</div>
            </div>

            <div
              style={{
                marginTop: 12,
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Chip tone={profile.digitalId.isRevoked ? "red" : "green"}>
                {t("me_id_valid_until")}: {date(profile.digitalId.expiresAt)}
              </Chip>
            </div>
            {profile.digitalId.isRevoked && <Alert tone="danger">{t("me_id_revoked")}</Alert>}
          </div>
        </div>
      ) : (
        <Card>
          <Muted>{t("me_id_none")}</Muted>
        </Card>
      )}

      {/* ---------------- Profile ---------------- */}
      <SectionTitle>{t("me_profile")}</SectionTitle>
      <Card>
        {profile ? (
          <KeyValue
            items={[
              [t("me_name"), fullName(profile)],
              [t("me_birthdate"), date(profile.birthDate)],
              [t("me_age"), String(age(profile.birthDate) ?? "—")],
              [t("me_sex"), titleize(profile.sex)],
              [t("me_civil_status"), titleize(profile.civilStatus)],
              [t("me_phone"), profile.contactPhone ?? "—"],
              [t("me_email"), profile.contactEmail ?? user?.email ?? "—"],
              [t("me_address"), profile.household?.addressLine ?? "—"],
              [t("me_purok"), profile.household?.purok ?? "—"],
              [t("me_household"), profile.household?.householdNo ?? "—"],
              [t("me_barangay"), profile.barangay?.name ?? "—"],
              [t("me_hotline"), profile.barangay?.hotline ?? profile.barangay?.contactPhone ?? "—"],
            ]}
          />
        ) : (
          <Muted>{t("none")}</Muted>
        )}
      </Card>

      {/* ---------------- Consents ---------------- */}
      <SectionTitle>{t("me_consents")}</SectionTitle>
      {consents.length === 0 ? (
        <Card>
          <Muted>{t("me_no_consents")}</Muted>
        </Card>
      ) : (
        <Card>
          {consents.map((c, i) => (
            <div
              key={c.id}
              style={{
                paddingTop: i === 0 ? 0 : 10,
                marginTop: i === 0 ? 0 : 10,
                borderTop: i === 0 ? "none" : "1px solid var(--cbms-line)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, flex: 1 }}>
                  {titleize(c.purpose)}
                </span>
                <Chip tone={c.status === "granted" ? "green" : "gray"}>
                  {titleize(c.status)}
                </Chip>
              </div>
              <div style={{ fontSize: 12, color: "var(--cbms-muted)", marginTop: 3 }}>
                {c.status === "withdrawn" && c.withdrawnAt
                  ? t("me_consent_withdrawn", { when: date(c.withdrawnAt) })
                  : t("me_consent_granted", { when: date(c.grantedAt), who: c.grantedBy })}
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* ---------------- Language ---------------- */}
      <SectionTitle>{t("me_language")}</SectionTitle>
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {(
            [
              { code: "fil" as Lang, label: t("me_lang_fil"), flag: "🇵🇭" },
              { code: "en" as Lang, label: t("me_lang_en"), flag: "🌐" },
            ] as const
          ).map((option) => {
            const active = lang === option.code;
            return (
              <button
                key={option.code}
                type="button"
                className="cbms-tile"
                aria-pressed={active}
                onClick={() => setLang(option.code)}
                style={{
                  borderColor: active ? "var(--cbms-navy)" : undefined,
                  borderWidth: active ? 2 : 1,
                  background: active ? "var(--cbms-card)" : undefined,
                }}
              >
                <span className="cbms-tile__icon" aria-hidden="true">
                  {option.flag}
                </span>
                <span className="cbms-tile__label">{option.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* ---------------- Shortcuts ---------------- */}
      <Card>
        <Link
          href="/feedback"
          style={{
            display: "block",
            padding: "8px 0",
            fontSize: 13.5,
            fontWeight: 600,
            color: "var(--cbms-navy)",
          }}
        >
          ⭐ {t("me_feedback_link")}
        </Link>
        <Link
          href="/participate"
          style={{
            display: "block",
            padding: "8px 0",
            borderTop: "1px solid var(--cbms-line)",
            fontSize: 13.5,
            fontWeight: 600,
            color: "var(--cbms-navy)",
          }}
        >
          🗳️ {t("me_participate_link")}
        </Link>
      </Card>

      {/* ---------------- Privacy ---------------- */}
      <SectionTitle>RA 10173</SectionTitle>
      <Card>
        <Muted>{t("me_download_hint")}</Muted>
        {downloadNote && <Alert tone="success">{downloadNote}</Alert>}
        <Button
          onClick={() => void downloadMyData()}
          disabled={downloading}
          style={{ width: "100%", marginTop: 8 }}
        >
          ⬇ {downloading ? t("me_downloading") : t("me_download")}
        </Button>
      </Card>

      <Button
        variant="danger"
        onClick={() => void logout()}
        style={{ width: "100%", height: 44, marginTop: 6 }}
      >
        {t("me_logout")}
      </Button>

      <Muted>{t("companion_note")}</Muted>
    </Shell>
  );
}
