"use client";

import * as React from "react";
import Link from "next/link";
import { ApiError, clearSession, getToken, login } from "@cbms/api-client";
import { Alert, Button, Field, Spinner } from "@cbms/ui";
import { LoginTourGuide, GuideToggle } from "./LoginTourGuide";

const DEMO_PASSWORD = "Cbms#2026";

const DEMO_ACCOUNTS: Array<{ email: string; label: string; roleTag: string; icon: string }> = [
  { email: "kapitan@barangka.gov.ph", label: "Punong Barangay", roleTag: "Super Admin", icon: "🏛️" },
  { email: "secretary@barangka.gov.ph", label: "Barangay Secretary", roleTag: "Records & Issuances", icon: "📝" },
  { email: "bdc@barangka.gov.ph", label: "BDC Chair", roleTag: "Dev Plans & Institutions", icon: "🧭" },
  { email: "vawdesk@barangka.gov.ph", label: "VAW Desk Officer", roleTag: "Confidential VAWC Intake", icon: "🛡️" },
  { email: "lupon@barangka.gov.ph", label: "Lupon Secretary", roleTag: "KP Summons & Hearings", icon: "⚖️" },
  { email: "treasurer@barangka.gov.ph", label: "Barangay Treasurer", roleTag: "Finance, Wallet & Assets", icon: "🏦" },
  { email: "bdrrmc@barangka.gov.ph", label: "BDRRMC Officer", roleTag: "Disaster & Emergency", icon: "🌀" },
  { email: "tanod@barangka.gov.ph", label: "Barangay Tanod", roleTag: "Public Safety & Blotter", icon: "🚨" },
  { email: "bhw@barangka.gov.ph", label: "BHW Lead", roleTag: "Maternal & Child Health", icon: "💉" },
  { email: "lgu@marikina.gov.ph", label: "LGU Admin", roleTag: "City Oversight", icon: "🏙️" },
];

type Stage = "credentials" | "mfa" | "enroll";

export default function LoginPage() {
  const [email, setEmail] = React.useState("kapitan@barangka.gov.ph");
  const [password, setPassword] = React.useState(DEMO_PASSWORD);
  const [totp, setTotp] = React.useState("");
  const [stage, setStage] = React.useState<Stage>("credentials");
  const [secret, setSecret] = React.useState<string | null>(null);
  const [otpauthUri, setOtpauthUri] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [booting, setBooting] = React.useState(false);

  // First-time SaaS user tour guide state (enabled by default for first-timers, persisted in localStorage)
  const [tourEnabled, setTourEnabled] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("cbms.login_guide_enabled");
      if (stored === null || stored === "true") {
        setTourEnabled(true);
      }
    }
  }, []);

  const handleToggleTour = (next: boolean) => {
    setTourEnabled(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("cbms.login_guide_enabled", String(next));
    }
  };

  function pick(next: string) {
    setEmail(next);
    setPassword(DEMO_PASSWORD);
    setTotp("");
    setStage("credentials");
    setSecret(null);
    setOtpauthUri(null);
    setError(null);
    setNotice(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await login(email.trim(), password, totp.trim() || undefined);
      if (res.token) {
        window.location.href = "/dashboard";
        return;
      }
      if (res.mfaEnrollmentRequired) {
        setStage("enroll");
        setSecret(res.secret ?? null);
        setOtpauthUri(res.otpauthUri ?? null);
        setNotice(
          res.message ??
            "Add this secret to your authenticator app, then enter the 6-digit code below.",
        );
        return;
      }
      if (res.mfaRequired) {
        setStage("mfa");
        setNotice(res.message ?? "Enter the 6-digit code from your authenticator app.");
        return;
      }
      setError("Unexpected response from the authentication service.");
    } catch (err) {
      const e2 = err as ApiError;
      setError(e2?.message ?? "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  if (booting) {
    return (
      <div className="cbms-auth">
        <Spinner />
      </div>
    );
  }

  const needsTotp = stage === "mfa" || stage === "enroll";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, var(--cbms-navy) 0%, var(--cbms-navy-ink) 100%)",
      }}
    >
      {/* Website Government Strip & Public Portal Header */}
      <header
        style={{
          background: "rgba(7, 26, 71, 0.88)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          color: "#fff",
          fontSize: 13,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              display: "inline-flex",
              width: 20,
              height: 13,
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
          <strong style={{ letterSpacing: "0.02em" }}>Republic of the Philippines</strong>
          <span style={{ color: "rgba(255,255,255,0.35)" }}>|</span>
          <span style={{ color: "#9fb3dd", fontSize: 12 }}>Published under DILG Full Disclosure Policy</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Link
            href="/citizen"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(37, 99, 235, 0.25)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 12.5,
              padding: "6px 12px",
              borderRadius: 8,
              textDecoration: "none",
              border: "1px solid rgba(147, 197, 253, 0.4)",
            }}
          >
            👥 Inhabitant Hub
          </Link>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--cbms-gold, #fdb913)",
              color: "var(--cbms-navy, #0a2463)",
              fontWeight: 700,
              fontSize: 12.5,
              padding: "6px 14px",
              borderRadius: 8,
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            🏛️ Barangay Public Portal →
          </Link>
          <Link
            href="/portal/verify"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.12)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 12.5,
              padding: "6px 12px",
              borderRadius: 8,
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            🔍 Verify Certificate
          </Link>
        </div>
      </header>

      {/* Main Login Area */}
      <div style={{ flex: 1, display: "grid", placeItems: "center", padding: "30px 20px" }}>
        <div className="cbms-auth__card" style={{ maxWidth: 480 }}>
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
            <span style={{ color: "var(--cbms-muted)" }}>Looking for citizen services?</span>
            <Link
              href="/"
              style={{ fontWeight: 700, color: "var(--cbms-navy)", textDecoration: "underline" }}
            >
              Go to Public Portal →
            </Link>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 6 }}>
            <div className="cbms-sidebar__logo">CB</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "var(--cbms-navy)" }}>
                Barangay Console
              </div>
              <div style={{ fontSize: 11.5, color: "var(--cbms-muted)" }}>
                Centralized Barangay Management System
              </div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "var(--cbms-muted)", margin: "10px 0 16px" }}>
            Compliant with DILG-mandated LGUSS-BIMS (MC 2025-104). Select your official barangay role or BBI account below.
          </p>

        {error && <Alert tone="danger">{error}</Alert>}
        {notice && !error && <Alert tone="info">{notice}</Alert>}

        <form onSubmit={submit}>
          <Field label="Email Account">
            <input
              className="cbms-input"
              type="text"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="Password">
            <input
              className="cbms-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          {stage === "enroll" && secret && (
            <div style={{ marginBottom: 14 }}>
              <div className="cbms-label">Authenticator secret</div>
              <div className="adm-secret">{secret}</div>
              {otpauthUri && (
                <>
                  <div className="cbms-label" style={{ marginTop: 10 }}>
                    otpauth URI
                  </div>
                  <div className="adm-secret">{otpauthUri}</div>
                </>
              )}
              <div style={{ fontSize: 11.5, color: "var(--cbms-muted)", marginTop: 6 }}>
                Add it to Google Authenticator / Authy, then enter the current 6-digit code.
              </div>
            </div>
          )}

          {needsTotp && (
            <Field label="6-digit code" hint="From your authenticator app.">
              <input
                className="cbms-input"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoComplete="one-time-code"
                value={totp}
                onChange={(e) => setTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                required
              />
            </Field>
          )}

          <div id="tour-submit-btn" style={{ width: "100%", marginTop: 8 }}>
            <Button type="submit" variant="primary" disabled={busy} style={{ width: "100%" }}>
              {busy ? "Signing in…" : needsTotp ? "Verify & sign in" : "Sign in to Console"}
            </Button>
          </div>
        </form>

        {/* Quick Demo Role Picker */}
        <div id="tour-role-selector" style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--cbms-line)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--cbms-navy)", marginBottom: 8 }}>
            🎭 Quick Role Selector (DILG MC 2025-104 §4.5.3):
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {DEMO_ACCOUNTS.map((acc) => {
              const active = email === acc.email;
              const roleIdKey = acc.email.split("@")[0];
              return (
                <button
                  id={`tour-role-${roleIdKey}`}
                  key={acc.email}
                  type="button"
                  onClick={() => pick(acc.email)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: active ? "1.5px solid #2563eb" : "1px solid var(--color-border, #e2e8f0)",
                    background: active ? "rgba(37, 99, 235, 0.08)" : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "0.78rem",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: "1rem" }}>{acc.icon}</span>
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontWeight: active ? 700 : 500, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                      {acc.label}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "#64748b", whiteSpace: "nowrap" }}>
                      {acc.roleTag}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>

    {/* Static Right-Side Chat-Style UI Toggle (similar to website live chat launchers) */}
    <GuideToggle enabled={tourEnabled} onToggle={handleToggleTour} />

    {/* Interactive SaaS Tour Guide with Mouse Pointer */}
    <LoginTourGuide
      enabled={tourEnabled}
      onToggle={handleToggleTour}
      onSelectRole={pick}
      currentEmail={email}
    />
  </div>
  );
}
