"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, Field, MockBanner, Spinner } from "@cbms/ui";
import { getToken, login } from "@cbms/api-client";
import { useT } from "@/i18n";
import { errorMessage } from "@/lib/session";

const DEMO_ACCOUNTS = [
  { email: "resident1@example.ph", name: "Cardo Dalisay", tag: "Registered Resident · Purok 3" },
  { email: "resident2@example.ph", name: "Maria Santos", tag: "Registered Resident · Purok 1" },
  { email: "resident3@example.ph", name: "Juan Dela Cruz", tag: "Senior Resident · Purok 5" },
];
const DEMO_PASSWORD = "Cbms#2026";

export default function LoginPage() {
  const router = useRouter();
  const { t, lang } = useT();

  const [identifier, setIdentifier] = React.useState("resident1@example.ph");
  const [password, setPassword] = React.useState(DEMO_PASSWORD);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Already signed in? Skip straight to the home tab or requested redirect.
  React.useEffect(() => {
    if (getToken()) {
      const redirect =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("redirect") || "/"
          : "/";
      router.replace(redirect);
    }
  }, [router]);

  const quickFill = (email: string) => {
    setIdentifier(email);
    setPassword(DEMO_PASSWORD);
    setError(null);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const value = identifier.trim();

    setBusy(true);
    try {
      const res = await login(value, password);
      if (res.token) {
        const redirect =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("redirect") || "/"
            : "/";
        router.replace(redirect);
        return;
      }
      // Residents never enrol in MFA; a staff account wandered in here.
      setError(t("login_mfa_note"));
    } catch (err) {
      setError(errorMessage(err, lang, "login_failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, var(--cbms-navy, #0a2463) 0%, var(--cbms-navy-ink, #071a47) 100%)",
      }}
    >
      {/* Website Government Strip & Citizen Hub Header */}
      <header
        style={{
          background: "rgba(7, 26, 71, 0.92)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          padding: "10px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
          color: "#fff",
          fontSize: 13,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              display: "inline-flex",
              width: 18,
              height: 12,
              borderRadius: 2,
              overflow: "hidden",
              flexDirection: "column",
              border: "1px solid rgba(255,255,255,0.3)",
              flexShrink: 0,
            }}
          >
            <i style={{ background: "#0038a8", height: "50%", display: "block" }} />
            <i style={{ background: "#ce1126", height: "50%", display: "block" }} />
          </span>
          <strong style={{ letterSpacing: "0.02em" }}>Republika ng Pilipinas</strong>
          <span style={{ color: "rgba(255,255,255,0.35)" }}>|</span>
          <span style={{ color: "#9fb3dd", fontSize: 12 }}>Citizen Services</span>
        </div>

        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: "rgba(255,255,255,0.12)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 12,
            padding: "5px 12px",
            borderRadius: 6,
            textDecoration: "none",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          ← Citizen Hub Home
        </Link>
      </header>

      {/* Main Login Area */}
      <div style={{ flex: 1, display: "grid", placeItems: "center", padding: "24px 16px" }}>
        <div className="cbms-auth__card" style={{ maxWidth: 440, width: "100%" }}>
          <div
            style={{
              background: "#eef3fc",
              border: "1px solid #c9d8f3",
              borderRadius: 8,
              padding: "8px 12px",
              marginBottom: 16,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ color: "var(--cbms-muted)" }}>Nais munang magbasa ng anunsyo?</span>
            <Link
              href="/"
              style={{ fontWeight: 700, color: "var(--cbms-navy)", textDecoration: "underline" }}
            >
              Buksan ang Citizen Hub →
            </Link>
          </div>

          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 34 }} aria-hidden="true">
              🏛️
            </div>
            <h1 style={{ fontSize: 20, margin: "8px 0 4px", color: "var(--cbms-navy)" }}>
              {t("login_title")}
            </h1>
            <p style={{ fontSize: 13, color: "var(--cbms-muted)", margin: 0 }}>
              {t("login_sub")}
            </p>
          </div>

          {error && <Alert tone="danger">{error}</Alert>}

          <form onSubmit={onSubmit} style={{ marginTop: 14 }}>
            <Field label={t("login_identifier")}>
              <input
                className="cbms-input"
                type="text"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                placeholder={t("login_identifier_ph")}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </Field>

            <Field label={t("login_password")}>
              <input
                className="cbms-input"
                type="password"
                autoComplete="current-password"
                placeholder={t("login_password_ph")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            <Button
              type="submit"
              variant="primary"
              disabled={busy}
              style={{ width: "100%", height: 44, marginTop: 6 }}
            >
              {busy ? <Spinner /> : t("login_submit")}
            </Button>
          </form>

          {/* Quick Demo Resident Account Selector */}
          <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid var(--cbms-line, #e2e8f0)" }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--cbms-navy)", marginBottom: 8 }}>
              🎭 Quick Demo Resident Accounts:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6 }}>
              {DEMO_ACCOUNTS.map((acc) => {
                const active = identifier === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => quickFill(acc.email)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "7px 10px",
                      borderRadius: 6,
                      border: active ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
                      background: active ? "rgba(37, 99, 235, 0.08)" : "#f8fafc",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: active ? 700 : 600, fontSize: 12, color: "var(--cbms-navy)" }}>
                        👤 {acc.name}
                      </div>
                      <div style={{ fontSize: 10.5, color: "#64748b" }}>{acc.tag}</div>
                    </div>
                    <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 600 }}>Piliin →</span>
                  </button>
                );
              })}
            </div>
          </div>

          <p style={{ fontSize: 11, color: "var(--cbms-muted)", marginTop: 16, lineHeight: 1.5 }}>
            {t("companion_note")}
          </p>
        </div>
      </div>

      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0 }}>
        <MockBanner />
      </div>
    </div>
  );
}
