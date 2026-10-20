"use client";

import * as React from "react";
import Link from "next/link";
import {
  API_URL,
  ApiError,
  listTenants,
  login,
  type TenantInfo,
} from "@cbms/api-client";
import { Alert, Button, Field, Spinner } from "@cbms/ui";

type Stage = "credentials" | "mfa" | "enroll";

const DEFAULT_PASSWORD = "Password123!";

interface OfficialCredential {
  email: string;
  role: string;
  title: string;
  scope: string;
  badge: string;
  icon: string;
  tenantId?: string;
}

const OFFICIAL_CREDENTIALS: OfficialCredential[] = [
  {
    email: "admin@cbms.gov.ph",
    role: "SYSTEM_ADMIN",
    title: "Platform Super Admin (Executive)",
    scope: "National / Platform",
    badge: "All 16 Tenants & System Access",
    icon: "🛡️",
  },
  {
    email: "it@cbms.gov.ph",
    role: "SYSTEM_ADMIN",
    title: "ORCHA Systems & IT Super Admin",
    scope: "National / Platform",
    badge: "Cloud Infrastructure, Fleet & Onboarding",
    icon: "💻",
  },
  {
    email: "lgu@marikina.gov.ph",
    role: "LGU_ADMIN",
    title: "Marikina City LGU Admin",
    scope: "Marikina City (16 Brgys)",
    badge: "City Multi-Tenant Oversight",
    icon: "🌆",
  },
  {
    email: "kapitan@barangka.gov.ph",
    role: "PUNONG_BARANGAY",
    title: "Punong Barangay (Hon. Roberto Dela Cruz)",
    scope: "Brgy. Barangka",
    badge: "All Barangay Modules",
    icon: "🏛️",
    tenantId: "tnt-barangka",
  },
  {
    email: "secretary@barangka.gov.ph",
    role: "BARANGAY_SECRETARY",
    title: "Barangay Secretary (Ma. Theresa Villanueva)",
    scope: "Brgy. Barangka",
    badge: "RBI, Clearances & Ordinances",
    icon: "📝",
    tenantId: "tnt-barangka",
  },
  {
    email: "treasurer@barangka.gov.ph",
    role: "BARANGAY_TREASURER",
    title: "Barangay Treasurer (Eduardo Ramos)",
    scope: "Brgy. Barangka",
    badge: "e-OR, Cashbook & Budget",
    icon: "🏦",
    tenantId: "tnt-barangka",
  },
  {
    email: "it@barangka.gov.ph",
    role: "IT_OFFICER",
    title: "IT Officer / DPO (Kevin Mendoza)",
    scope: "Brgy. Barangka",
    badge: "Users, Audit & DPO",
    icon: "💻",
    tenantId: "tnt-barangka",
  },
  {
    email: "lupon@barangka.gov.ph",
    role: "LUPON_SECRETARY",
    title: "Lupon Secretary (Atty. Ricardo Bautista)",
    scope: "Brgy. Barangka",
    badge: "Katarungang Pambarangay",
    icon: "⚖️",
    tenantId: "tnt-barangka",
  },
  {
    email: "vawdesk@barangka.gov.ph",
    role: "VAW_DESK_OFFICER",
    title: "VAW Desk Officer (Clarissa Morales)",
    scope: "Brgy. Barangka",
    badge: "RA 9262 & BPO Vault",
    icon: "💜",
    tenantId: "tnt-barangka",
  },
  {
    email: "bdc@barangka.gov.ph",
    role: "BDC_OFFICER",
    title: "BDC Coordinator (Engr. Noel Pascual)",
    scope: "Brgy. Barangka",
    badge: "AIP, BDP & Projects",
    icon: "🧭",
    tenantId: "tnt-barangka",
  },
  {
    email: "bdrrmc@barangka.gov.ph",
    role: "BDRRMC_OFFICER",
    title: "BDRRMC Focal (Capt. Danilo Soriano)",
    scope: "Brgy. Barangka",
    badge: "Alerts, Evacuation & Relief",
    icon: "🌀",
    tenantId: "tnt-barangka",
  },
  {
    email: "tanod@barangka.gov.ph",
    role: "TANOD",
    title: "Chief Tanod (Rogelio Navarro)",
    scope: "Brgy. Barangka",
    badge: "Patrol & Incident Log",
    icon: "🚨",
    tenantId: "tnt-barangka",
  },
  {
    email: "bhw@barangka.gov.ph",
    role: "BHW",
    title: "BHW Lead (Lorna Tolentino)",
    scope: "Brgy. Barangka",
    badge: "Field Health & Census",
    icon: "💉",
    tenantId: "tnt-barangka",
  },
];

export default function LoginPage() {
  const [email, setEmail] = React.useState("admin@cbms.gov.ph");
  const [password, setPassword] = React.useState(DEFAULT_PASSWORD);
  const [showPassword, setShowPassword] = React.useState(false);
  const [totp, setTotp] = React.useState("");
  const [stage, setStage] = React.useState<Stage>("credentials");
  const [secret, setSecret] = React.useState<string | null>(null);
  const [otpauthUri, setOtpauthUri] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [booting] = React.useState(false);
  const [apiOnline, setApiOnline] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    let active = true;
    fetch(`${API_URL}/tenants`)
      .then((r) => {
        if (active) setApiOnline(r.ok);
      })
      .catch(() => {
        if (active) setApiOnline(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function performLogin(
    targetEmail: string,
    targetPassword: string,
    targetTotp?: string,
    targetTenantId?: string,
  ) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await login(
        targetEmail.trim(),
        targetPassword,
        targetTotp?.trim() || undefined,
        targetTenantId || undefined,
      );
      if (res.token) {
        const isSuperAdminUser =
          res.user?.role === "SYSTEM_ADMIN" ||
          res.user?.roles?.includes("SYSTEM_ADMIN") ||
          res.user?.scope === "platform" ||
          targetEmail.toLowerCase().startsWith("admin@") ||
          targetEmail.toLowerCase().includes("superadmin") ||
          targetEmail.toLowerCase().includes("orcha") ||
          targetEmail.toLowerCase() === "it@cbms.gov.ph";
        window.location.href = isSuperAdminUser ? "/super-admin" : "/dashboard";
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
      setError(e2?.message ?? "Sign-in failed. Please verify your email and password.");
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await performLogin(email, password, totp);
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
          <svg
            width="22"
            height="14"
            viewBox="0 0 900 600"
            style={{
              borderRadius: 2,
              flexShrink: 0,
              border: "1px solid rgba(255,255,255,0.35)",
              display: "inline-block",
            }}
            aria-label="Flag of the Philippines"
          >
            <rect width="900" height="300" fill="#0038A8" />
            <rect y="300" width="900" height="300" fill="#CE1126" />
            <polygon points="0,0 519.6,300 0,600" fill="#FFFFFF" />
            <g fill="#FCD116" stroke="#FCD116">
              <circle cx="173.2" cy="300" r="54" />
              <g transform="translate(173.2, 300)">
                <path d="M 0,-115 L -8,-58 L 8,-58 Z M -10,-105 L -14,-58 L 0,-58 Z M 10,-105 L 0,-58 L 14,-58 Z" />
                <path d="M 0,-115 L -8,-58 L 8,-58 Z M -10,-105 L -14,-58 L 0,-58 Z M 10,-105 L 0,-58 L 14,-58 Z" transform="rotate(45)" />
                <path d="M 0,-115 L -8,-58 L 8,-58 Z M -10,-105 L -14,-58 L 0,-58 Z M 10,-105 L 0,-58 L 14,-58 Z" transform="rotate(90)" />
                <path d="M 0,-115 L -8,-58 L 8,-58 Z M -10,-105 L -14,-58 L 0,-58 Z M 10,-105 L 0,-58 L 14,-58 Z" transform="rotate(135)" />
                <path d="M 0,-115 L -8,-58 L 8,-58 Z M -10,-105 L -14,-58 L 0,-58 Z M 10,-105 L 0,-58 L 14,-58 Z" transform="rotate(180)" />
                <path d="M 0,-115 L -8,-58 L 8,-58 Z M -10,-105 L -14,-58 L 0,-58 Z M 10,-105 L 0,-58 L 14,-58 Z" transform="rotate(225)" />
                <path d="M 0,-115 L -8,-58 L 8,-58 Z M -10,-105 L -14,-58 L 0,-58 Z M 10,-105 L 0,-58 L 14,-58 Z" transform="rotate(270)" />
                <path d="M 0,-115 L -8,-58 L 8,-58 Z M -10,-105 L -14,-58 L 0,-58 Z M 10,-105 L 0,-58 L 14,-58 Z" transform="rotate(315)" />
              </g>
              <polygon points="50,45 54,58 68,58 57,66 61,79 50,71 39,79 43,66 32,58 46,58" />
              <polygon points="50,555 54,542 68,542 57,534 61,521 50,529 39,521 43,66 32,542 46,542" />
              <polygon points="460,300 447,304 447,318 439,307 426,311 434,300 426,289 439,293 447,282 447,296" />
            </g>
          </svg>
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
      <div style={{ flex: 1, display: "grid", placeItems: "center", padding: "24px 20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: 24,
            maxWidth: 980,
            width: "100%",
            alignItems: "start",
          }}
        >
          {/* Left Card: Official Login & Multitenant Workspace Selector */}
          <div className="cbms-auth__card" style={{ maxWidth: "100%", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 11, marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <div className="cbms-sidebar__logo">CB</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--cbms-navy)" }}>
                    Barangay Console
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--cbms-muted)" }}>
                    Multi-Tenant Government Operations Portal
                  </div>
                </div>
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: 999,
                  background: apiOnline ? "#dcfce7" : apiOnline === false ? "#fef3c7" : "#f1f5f9",
                  color: apiOnline ? "#166534" : apiOnline === false ? "#92400e" : "#475569",
                  border: `1px solid ${apiOnline ? "#86efac" : apiOnline === false ? "#fde68a" : "#cbd5e1"}`,
                }}
                title={apiOnline ? `Connected to ${API_URL}` : "Offline fallback active"}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: apiOnline ? "#16a34a" : apiOnline === false ? "#d97706" : "#94a3b8",
                  }}
                />
                {apiOnline ? "Live API Connected" : apiOnline === false ? "Offline Mode" : "Checking API…"}
              </span>
            </div>

            {error && <Alert tone="danger">{error}</Alert>}
            {notice && !error && <Alert tone="info">{notice}</Alert>}

            <form onSubmit={submit}>

                <Field label="Email Address">
                  <input
                    className="cbms-input"
                    type="email"
                    autoComplete="username"
                    placeholder="admin@cbms.gov.ph"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Password">
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      className="cbms-input"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingRight: 64 }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      style={{
                        position: "absolute",
                        right: 8,
                        background: "transparent",
                        border: "none",
                        color: "var(--cbms-navy)",
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        padding: "4px 6px",
                      }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
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

                <div style={{ width: "100%", marginTop: 12 }}>
                  <Button type="submit" variant="primary" disabled={busy} style={{ width: "100%" }}>
                    {busy ? "Signing in…" : needsTotp ? "Verify & sign in" : "Sign in to Barangay Workspace"}
                  </Button>
                </div>
              </form>

            <div
              style={{
                marginTop: 16,
                paddingTop: 12,
                borderTop: "1px solid var(--cbms-line)",
                textAlign: "center",
                fontSize: 11,
                color: "var(--cbms-muted)",
              }}
            >
              Protected by JWT Bearer + Refresh Rotation, PostgreSQL RBAC & DILG Multi-Tenant Isolation.
            </div>
          </div>

          {/* Right Card: Official & Admin Credentials Quick-Fill Directory */}
          <div
            className="cbms-auth__card"
            style={{
              maxWidth: "100%",
              width: "100%",
              background: "rgba(255, 255, 255, 0.97)",
              padding: "20px 22px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14.5, color: "var(--cbms-navy)" }}>
                  🔑 Official & Admin Credentials
                </div>
                <div style={{ fontSize: 11.5, color: "var(--cbms-muted)" }}>
                  Click any account to populate credentials or sign in immediately
                </div>
              </div>
              <code
                style={{
                  background: "#eef3fc",
                  color: "var(--cbms-navy)",
                  border: "1px solid #c9d8f3",
                  padding: "3px 8px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                Pass: {DEFAULT_PASSWORD}
              </code>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                maxHeight: 450,
                overflowY: "auto",
                paddingRight: 4,
                marginTop: 10,
              }}
            >
              {OFFICIAL_CREDENTIALS.map((cred) => {
                const isSelected = email.trim().toLowerCase() === cred.email.toLowerCase();
                return (
                  <div
                    key={cred.email}
                    onClick={() => {
                      setStage("credentials");
                      setEmail(cred.email);
                      setPassword(DEFAULT_PASSWORD);
                      setError(null);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: isSelected ? "1.5px solid #2563eb" : "1px solid #e2e8f0",
                      background: isSelected ? "#eff6ff" : "#f8fafc",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{cred.icon}</span>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 12.5,
                            color: "#0f172a",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {cred.title}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 1 }}>
                          <code style={{ fontSize: 11, color: "#1d4ed8", fontWeight: 600 }}>
                            {cred.email}
                          </code>
                          <span style={{ fontSize: 10.5, color: "#64748b" }}>• {cred.badge}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={(e) => {
                        e.stopPropagation();
                        setStage("credentials");
                        setEmail(cred.email);
                        setPassword(DEFAULT_PASSWORD);
                        performLogin(cred.email, DEFAULT_PASSWORD);
                      }}
                      style={{
                        flexShrink: 0,
                        background: isSelected ? "var(--cbms-navy, #0a2463)" : "#fff",
                        color: isSelected ? "#fff" : "var(--cbms-navy, #0a2463)",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                        padding: "5px 10px",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: busy ? "not-allowed" : "pointer",
                      }}
                    >
                      Sign In →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

