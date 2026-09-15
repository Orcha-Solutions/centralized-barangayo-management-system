"use client";

import * as React from "react";
import Link from "next/link";
import { Alert, Button, Field, Loading, MockBanner, Spinner } from "@cbms/ui";
import { clearSession, getStoredUser, getToken, login, logout, useApi } from "@cbms/api-client";
import "./citizen.css";

interface Announcement {
  id: string;
  title: string;
  body: string;
  severity: "info" | "warning" | "danger";
  publishedAt?: string;
  isPublished?: boolean;
}

type Tab = "home" | "services" | "report" | "wallet" | "id";

const DEMO_RESIDENTS = [
  { email: "resident1@example.ph", name: "Cardo Dalisay", purok: "Purok 3", wallet: "₱ 5,250.00", idNum: "BRGY-2026-990234" },
  { email: "resident2@example.ph", name: "Maria Santos", purok: "Purok 1", wallet: "₱ 3,800.00", idNum: "BRGY-2026-881942" },
  { email: "resident3@example.ph", name: "Juan Dela Cruz", purok: "Purok 5", wallet: "₱ 7,500.00", idNum: "BRGY-2026-773019" },
];

export default function CitizenHubPage() {
  const [user, setUser] = React.useState<any>(null);
  const [ready, setReady] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<Tab>("home");

  // PWA install prompt state
  const [installPrompt, setInstallPrompt] = React.useState<any>(null);
  const [isInstalled, setIsInstalled] = React.useState(false);

  // Interactive feature states
  const [sosActive, setSosActive] = React.useState(false);
  const [sosDispatched, setSosDispatched] = React.useState(false);

  const [activeModal, setActiveModal] = React.useState<"clearance" | "concern" | "appointment" | null>(null);
  const [modalSuccess, setModalSuccess] = React.useState<string | null>(null);

  // Form states
  const [docType, setDocType] = React.useState("Barangay Clearance");
  const [docPurpose, setDocPurpose] = React.useState("Employment application");
  const [concernCategory, setConcernCategory] = React.useState("Streetlighting / Utilities");
  const [concernLocation, setConcernLocation] = React.useState("");
  const [concernDesc, setConcernDesc] = React.useState("");

  // Load announcements
  const announcementsReq = useApi<any>("/announcements");
  const announcements: Announcement[] = React.useMemo(() => {
    const raw = announcementsReq.data?.items || (Array.isArray(announcementsReq.data) ? announcementsReq.data : []);
    if (raw.length > 0) return raw.slice(0, 5);
    return [
      {
        id: "a1",
        title: "Libreng Bakuna at Health Checkup sa Barangay Health Center",
        body: "Bukas ang Barangay Health Center para sa libreng bakuna ng sanggol, vitamins distribution, at medical consultations tuwing Lunes hanggang Biyernes, 8:00 AM - 4:00 PM.",
        severity: "info",
        publishedAt: "Ngayong araw",
      },
      {
        id: "a2",
        title: "Diskwento sa Real Property Tax (RPT) Prompt Payment",
        body: "Magbayad ng Real Property Tax sa Treasury Desk bago matapos ang buwan para makakuha ng 10% hanggang 20% prompt payment discount.",
        severity: "info",
        publishedAt: "Kahapon",
      },
      {
        id: "a3",
        title: "BDRRMC Advisory: Paghahanda sa Panahon ng Bagyo at Pagbaha",
        body: "Pinapaalalahanan ang lahat ng nakatira malapit sa Marikina River na maging alerto sa water level telemetry at alamin ang evacuation center sa inyong purok.",
        severity: "warning",
        publishedAt: "3 araw ang nakalipas",
      },
      {
        id: "a4",
        title: "Barangay General Assembly & Townhall Schedule",
        body: "Inaanyayahan ang lahat ng residente na dumalo sa darating na Sabado, 9:00 AM sa Barangay Covered Court para sa State of the Barangay Address (SOBA).",
        severity: "info",
        publishedAt: "4 araw ang nakalipas",
      },
    ];
  }, [announcementsReq.data]);

  React.useEffect(() => {
    const token = getToken();
    const stored = token ? getStoredUser() : null;
    setUser(stored);
    setReady(true);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    } else {
      alert("Upang i-install bilang PWA: I-click ang tatlong tuldok (Menu) sa iyong mobile browser at piliin ang 'Install App' o 'Add to Home Screen'.");
    }
  };

  // Citizen login form state
  const [loginEmail, setLoginEmail] = React.useState("resident1@example.ph");
  const [loginPassword, setLoginPassword] = React.useState("Cbms#2026");
  const [loginBusy, setLoginBusy] = React.useState(false);
  const [loginError, setLoginError] = React.useState<string | null>(null);

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginBusy(true);
    setLoginError(null);
    try {
      const res = await login(loginEmail.trim(), loginPassword);
      if (res.user) {
        setUser(res.user);
      } else {
        setLoginError("Hindi ma-verify ang account. Pakisuri ang email at password.");
      }
    } catch (err: any) {
      setLoginError(err?.message || "Maling email o password. Pakisubukang muli.");
    } finally {
      setLoginBusy(false);
    }
  };

  const handleQuickLogin = async (email: string) => {
    setLoginBusy(true);
    setLoginError(null);
    setLoginEmail(email);
    try {
      const res = await login(email, "Cbms#2026");
      if (res.user) {
        setUser(res.user);
      }
    } catch (err: any) {
      setLoginError(err?.message || "Maling credentials.");
    } finally {
      setLoginBusy(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout(false);
    } catch {
      // ignore
    }
    clearSession();
    setUser(null);
  };

  const triggerSos = () => {
    setSosActive(true);
    setTimeout(() => {
      setSosDispatched(true);
    }, 1200);
  };

  if (!ready) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <Loading label="Loading Inhabitant Hub…" />
      </div>
    );
  }

  // -------------------------------------------------------------
  // LOGIN SCREEN: Rendered when user is unauthenticated
  // -------------------------------------------------------------
  if (!user) {
    return (
      <div className="hub-login-root">
        {/* Republic of the Philippines Top Government Ribbon */}
        <div
          style={{
            background: "#071a47",
            color: "#fff",
            padding: "8px 20px",
            fontSize: 12,
            borderBottom: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
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
            <span style={{ opacity: 0.4 }}>|</span>
            <span style={{ color: "#9fb3dd" }}>DILG MC 2025-104 · Inhabitant Hub</span>
          </div>

          <Link
            href="/portal"
            style={{
              color: "#fdb913",
              fontWeight: 700,
              fontSize: 12,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            ← Bumalik sa Barangay Public Portal
          </Link>
        </div>

        {/* Center Login Area */}
        <div className="hub-login-content">
          <div className="hub-login-card">
            {/* Seal & Heading */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #fdb913 0%, #b45309 100%)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 24,
                  color: "#071a47",
                  fontWeight: 900,
                  boxShadow: "0 8px 24px rgba(253, 185, 19, 0.4)",
                  border: "3px solid #fff",
                  margin: "0 auto 14px",
                }}
              >
                BB
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--cbms-navy, #0a2463)", margin: "0 0 4px" }}>
                Inhabitant Hub
              </h1>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#2563eb", marginBottom: 8 }}>
                Portal ng Mamamayan · Barangay Barangka
              </div>
              <p style={{ fontSize: 12.5, color: "#64748b", margin: 0, lineHeight: 1.45 }}>
                Mag-log in sa iyong Citizen Account upang ma-access ang clearances, 311 citizen reporting, Ayuda E-Wallet, at opisyal na Digital Resident ID.
              </p>
            </div>

            {/* Error message */}
            {loginError && (
              <div style={{ marginBottom: 16 }}>
                <Alert tone="error">{loginError}</Alert>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLoginSubmit}>
              <Field label="Email o Resident ID">
                <input
                  type="text"
                  className="cbms-input"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Hal. resident1@example.ph o BRGY-..."
                  required
                  disabled={loginBusy}
                />
              </Field>

              <Field label="Password">
                <input
                  type="password"
                  className="cbms-input"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  disabled={loginBusy}
                />
              </Field>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, fontSize: 11.5, color: "#64748b" }}>
                <span>Default password: <strong style={{ color: "#1e293b" }}>Cbms#2026</strong></span>
                <span
                  style={{ color: "#2563eb", cursor: "pointer" }}
                  onClick={() => alert("Para sa pag-reset ng password, lumapit sa Barangay Records & Issuance Desk o tumawag sa (02) 8646-1234.")}
                >
                  Nakalimutan?
                </span>
              </div>

              <Button
                variant="primary"
                type="submit"
                disabled={loginBusy}
                style={{
                  width: "100%",
                  padding: "11px 16px",
                  fontSize: 14,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {loginBusy ? (
                  <>
                    <Spinner /> Pumapasok…
                  </>
                ) : (
                  <>Mag-log in sa Inhabitant Hub ➔</>
                )}
              </Button>
            </form>

            {/* Quick Demo Resident Profile Selection */}
            <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "#64748b", marginBottom: 10, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                O mag-sign in gamit ang Demo Resident Profile:
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {DEMO_RESIDENTS.map((r) => (
                  <button
                    key={r.email}
                    type="button"
                    className="hub-login-demo-card"
                    onClick={() => handleQuickLogin(r.email)}
                    disabled={loginBusy}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 20 }}>
                        {r.name.includes("Maria") ? "👩" : r.name.includes("Juan") ? "👴" : "👤"}
                      </span>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 800, fontSize: 13, color: "var(--cbms-navy)" }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>
                          {r.purok} · Ayuda: <strong>{r.wallet}</strong> · ID: {r.idNum}
                        </div>
                      </div>
                    </div>
                    <span style={{ color: "#2563eb", fontWeight: 700, fontSize: 11.5, whiteSpace: "nowrap" }}>
                      Piliin ➔
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* PWA Install Button on Login Screen */}
            {installPrompt && !isInstalled && (
              <div style={{ marginTop: 16 }}>
                <button
                  type="button"
                  onClick={handleInstallClick}
                  style={{
                    width: "100%",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "9px 14px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  📲 I-install bilang Mobile App (PWA)
                </button>
              </div>
            )}

            {/* Emergency Hotline Banner */}
            <div
              style={{
                marginTop: 18,
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 10,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 11.5, color: "#991b1b" }}>
                <strong>🚨 Emergency Hotline:</strong> (02) 8646-1234 / 161
              </div>
              <button
                type="button"
                onClick={triggerSos}
                style={{
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "5px 10px",
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                SOS Desk
              </button>
            </div>

            {/* Link to Staff / Admin Console */}
            <div style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: "#64748b" }}>
              Kawani o Opisyal ng Barangay?{" "}
              <Link href="/login" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>
                Pumunta sa Admin Console ➔
              </Link>
            </div>

            {/* Data Privacy Note */}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #f1f5f9", textAlign: "center", fontSize: 10.5, color: "#94a3b8", lineHeight: 1.4 }}>
              🔒 Protektado sa ilalim ng <strong>Republic Act 10173</strong> (Data Privacy Act of 2012). Ang lahat ng transaksyon ay pribado at naka-encrypt.
            </div>
          </div>
        </div>

        {/* Emergency SOS Modal if triggered while on Login Screen */}
        {sosActive && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              display: "grid",
              placeItems: "center",
              zIndex: 100,
              padding: 16,
            }}
          >
            <div style={{ background: "#fff", borderRadius: 16, maxWidth: 400, width: "100%", padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 8 }}>🚨</div>
              <h3 style={{ fontSize: 20, color: "var(--cbms-red, #ce1126)", margin: "0 0 8px", fontWeight: 800 }}>
                EMERGENCY SOS ALERT
              </h3>
              {!sosDispatched ? (
                <>
                  <p style={{ fontSize: 13.5, color: "#475569", margin: "0 0 16px" }}>
                    Ipinapadala ang inyong lokasyon sa Barangay Tanod Command Center at BDRRMC Emergency Team…
                  </p>
                  <Spinner />
                </>
              ) : (
                <>
                  <Alert tone="success">
                    <strong>DISPATCHED!</strong> Alert #SOS-2026-904. Ang patrol ng Barangay Tanod ay naka-deploy na sa inyong lokasyon.
                  </Alert>
                  <Button
                    variant="primary"
                    style={{ width: "100%", marginTop: 16 }}
                    onClick={() => {
                      setSosActive(false);
                      setSosDispatched(false);
                    }}
                  >
                    Isara ang Alert
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  const isAuthed = !!user;
  const residentName = user?.fullName || "Cardo Dalisay";
  const residentInfo = DEMO_RESIDENTS.find((r) => r.email === user?.email) || DEMO_RESIDENTS[0];

  return (
    <div className="hub-root">
      {/* 1. Official Republic of the Philippines Government Bar (Desktop & Tablet) */}
      <div
        className="hub-desktop-header"
        style={{
          background: "#071a47",
          color: "#fff",
          padding: "8px 24px",
          fontSize: 12,
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
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
            <span style={{ opacity: 0.4 }}>|</span>
            <span style={{ color: "#9fb3dd" }}>DILG MC 2025-104 Companion · Inhabitant Portal</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link
              href="/"
              style={{
                color: "#fdb913",
                fontWeight: 700,
                fontSize: 12,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              ← Bumalik sa Barangay Public Portal
            </Link>
            <span style={{ opacity: 0.3 }}>|</span>
            <Link
              href="/login"
              style={{
                color: "#cbd5e1",
                fontSize: 12,
                textDecoration: "none",
              }}
            >
              Staff Console 🔐
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Desktop Website Masthead Header (Hidden on mobile) */}
      <header className="hub-desktop-header" style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                background: "var(--cbms-navy, #0a2463)",
                color: "var(--cbms-gold, #fdb913)",
                display: "grid",
                placeItems: "center",
                fontWeight: 900,
                fontSize: 18,
                boxShadow: "0 4px 10px rgba(10,36,99,0.2)",
                border: "2px solid #fdb913",
              }}
            >
              BB
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--cbms-navy, #0a2463)", margin: 0, letterSpacing: "-0.01em" }}>
                  Barangay Inhabitant Hub
                </h1>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    background: "rgba(37,99,235,0.1)",
                    color: "#2563eb",
                    padding: "2px 8px",
                    borderRadius: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Website / PWA
                </span>
              </div>
              <p style={{ fontSize: 12.5, color: "#64748b", margin: "2px 0 0" }}>
                Barangay Barangka · Lungsod ng Marikina · Digital Inhabitant Services
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {!isInstalled && (
              <button
                type="button"
                onClick={handleInstallClick}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  color: "#1e293b",
                  padding: "7px 12px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                📲 I-install bilang App (PWA)
              </button>
            )}

            {isAuthed ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--cbms-navy)" }}>{user.fullName}</div>
                  <div style={{ fontSize: 11, color: "#059669", fontWeight: 600 }}>● {residentInfo.purok} · Verified</div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    background: "#fee2e2",
                    border: "1px solid #fca5a5",
                    color: "#b91c1c",
                    padding: "7px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Sign out 🚪
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--cbms-navy, #0a2463)",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 2px 8px rgba(10,36,99,0.2)",
                }}
              >
                Sign in 🔐
              </Link>
            )}
          </div>
        </div>

        {/* Desktop Horizontal Navigation Tabs */}
        <div className="hub-desktop-tabs" style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              gap: 4,
              overflowX: "auto",
            }}
          >
            {[
              { key: "home", label: "🏠 Pangkalahatan (Overview)" },
              { key: "services", label: "📄 Mga Clearance & Dokumento" },
              { key: "report", label: "📣 311 Citizen Reporting" },
              { key: "wallet", label: "👛 E-Wallet & Ayuda" },
              { key: "id", label: "🪪 Digital Resident ID" },
            ].map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as Tab)}
                  style={{
                    padding: "12px 16px",
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    color: active ? "var(--cbms-navy, #0a2463)" : "#64748b",
                    border: "none",
                    background: "none",
                    borderBottom: active ? "3px solid var(--cbms-navy, #0a2463)" : "3px solid transparent",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* 3. Native Mobile App Header (Appears ONLY when resolution <= 768px) */}
      <header className="hub-mobile-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#fff",
              color: "var(--cbms-navy, #0a2463)",
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
              fontSize: 14,
              border: "1.5px solid var(--cbms-gold, #fdb913)",
            }}
          >
            BB
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>Inhabitant Hub</div>
            <div style={{ fontSize: 10.5, color: "#93c5fd" }}>Barangay Barangka</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={triggerSos}
            style={{
              background: "var(--cbms-red, #ce1126)",
              color: "#fff",
              border: "none",
              padding: "5px 9px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            🚨 SOS
          </button>

          {isAuthed ? (
            <button
              type="button"
              onClick={handleLogout}
              style={{
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "#fff",
                padding: "4px 8px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              style={{
                background: "var(--cbms-gold, #fdb913)",
                color: "var(--cbms-navy, #0a2463)",
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              Sign in 🔐
            </Link>
          )}
        </div>
      </header>

      {/* 4. Adaptive Main Content Area */}
      <main className="hub-content-container">
        {/* Mobile PWA Install Banner */}
        {!isInstalled && (
          <div className="hub-mobile-pwa-bar">
            <div>
              <strong style={{ color: "#1e40af" }}>📲 I-install ang App</strong>
              <div style={{ fontSize: 11, color: "#475569" }}>Mabilis na pag-access kahit mabagal ang internet.</div>
            </div>
            <button
              type="button"
              onClick={handleInstallClick}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                padding: "5px 10px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Install
            </button>
          </div>
        )}

        {/* Authenticated Resident Active Profile Banner */}
        <div
          style={{
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            borderRadius: 14,
            padding: "14px 18px",
            marginBottom: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            boxShadow: "0 2px 8px rgba(5,150,105,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "#059669",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
                fontSize: 14,
                boxShadow: "0 2px 6px rgba(5,150,105,0.3)",
              }}
            >
              {user.fullName?.slice(0, 2).toUpperCase() || "CD"}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#065f46" }}>
                Mabuhay, {user.fullName}!
              </div>
              <div style={{ fontSize: 11.5, color: "#047857" }}>
                Verified Resident · {residentInfo.purok} · ID No: <strong>{residentInfo.idNum}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "#047857", textTransform: "uppercase", fontWeight: 700 }}>Ayuda Balanse</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#065f46" }}>{residentInfo.wallet}</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                type="button"
                onClick={() => setActiveTab("wallet")}
                style={{
                  background: "#059669",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Ayuda →
              </button>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: "#fee2e2",
                  border: "1px solid #fca5a5",
                  color: "#b91c1c",
                  padding: "6px 10px",
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Sign out 🚪
              </button>
            </div>
          </div>
        </div>

        {/* 5. Adaptive Grid (2-column on desktop, 1-column on mobile) */}
        <div className="hub-main-grid">
          {/* MAIN MODULE COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* OVERVIEW / HOME TAB */}
            {activeTab === "home" && (
              <>
                {/* Mobile SOS Trigger (Shows prominently on mobile) */}
                <div className="hub-mobile-sos">
                  <button
                    type="button"
                    className="cbms-sos"
                    onClick={triggerSos}
                    style={{
                      width: "100%",
                      padding: "16px",
                      borderRadius: 12,
                      background: "var(--cbms-red, #ce1126)",
                      color: "#fff",
                      border: "none",
                      fontSize: 15,
                      fontWeight: 800,
                      cursor: "pointer",
                      letterSpacing: ".02em",
                      boxShadow: "0 4px 12px rgba(206,17,38,0.25)",
                    }}
                  >
                    🚨 PINDUTIN KUNG MAY SAKUNA (SOS)
                  </button>
                </div>

                {/* Adaptive Stat Cards */}
                <div className="hub-stats-grid">
                  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>E-Wallet Ayuda</div>
                    <div style={{ fontSize: 19, fontWeight: 800, color: "var(--cbms-navy)", marginTop: 2 }}>
                      {isAuthed ? residentInfo.wallet : "₱ 5,250.00"}
                    </div>
                    <div style={{ fontSize: 10.5, color: "#059669", marginTop: 2 }}>● Huling ayuda: Kahapon</div>
                  </div>

                  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Dokumento</div>
                    <div style={{ fontSize: 19, fontWeight: 800, color: "#2563eb", marginTop: 2 }}>1 Hinihiling</div>
                    <div style={{ fontSize: 10.5, color: "#64748b", marginTop: 2 }}>Barangay Clearance</div>
                  </div>

                  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>311 Sumbong</div>
                    <div style={{ fontSize: 19, fontWeight: 800, color: "#059669", marginTop: 2 }}>2 Naaksyunan</div>
                    <div style={{ fontSize: 10.5, color: "#64748b", marginTop: 2 }}>Streetlight Purok 3</div>
                  </div>

                  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>BDRRMC Alert</div>
                    <div style={{ fontSize: 19, fontWeight: 800, color: "#0284c7", marginTop: 2 }}>Level 0</div>
                    <div style={{ fontSize: 10.5, color: "#64748b", marginTop: 2 }}>Normal water level</div>
                  </div>
                </div>

                {/* Adaptive Services Grid */}
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--cbms-navy)", margin: 0 }}>
                        Mga Pangunahing Serbisyo
                      </h3>
                      <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>
                        Pumili ng transaksyon o serbisyo:
                      </p>
                    </div>
                  </div>

                  <div className="hub-services-grid">
                    {/* Card 1: Clearance */}
                    <div
                      className="hub-card-interactive"
                      onClick={() => setActiveModal("clearance")}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: "14px",
                        background: "#fafbfd",
                        cursor: "pointer",
                        display: "flex",
                        gap: 12,
                      }}
                    >
                      <div style={{ fontSize: 26, background: "#eff6ff", width: 44, height: 44, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0 }}>
                        📄
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13.5, color: "var(--cbms-navy)" }}>Clearance & Certificates</div>
                        <p style={{ fontSize: 11.5, color: "#64748b", margin: "3px 0 6px", lineHeight: 1.35 }}>
                          Barangay Clearance, Indigency, Residency, Jobseeker.
                        </p>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: "#2563eb" }}>Humiling Online →</span>
                      </div>
                    </div>

                    {/* Card 2: 311 Concerns */}
                    <div
                      className="hub-card-interactive"
                      onClick={() => setActiveModal("concern")}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: "14px",
                        background: "#fafbfd",
                        cursor: "pointer",
                        display: "flex",
                        gap: 12,
                      }}
                    >
                      <div style={{ fontSize: 26, background: "#fef3c7", width: 44, height: 44, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0 }}>
                        📣
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13.5, color: "var(--cbms-navy)" }}>311 Citizen Reporting</div>
                        <p style={{ fontSize: 11.5, color: "#64748b", margin: "3px 0 6px", lineHeight: 1.35 }}>
                          I-ulat ang pundidong ilaw, basura, kanal, o ingay.
                        </p>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: "#d97706" }}>Isumbong sa Tanod →</span>
                      </div>
                    </div>

                    {/* Card 3: E-Wallet */}
                    <div
                      className="hub-card-interactive"
                      onClick={() => setActiveTab("wallet")}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: "14px",
                        background: "#fafbfd",
                        cursor: "pointer",
                        display: "flex",
                        gap: 12,
                      }}
                    >
                      <div style={{ fontSize: 26, background: "#ecfdf5", width: 44, height: 44, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0 }}>
                        👛
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13.5, color: "var(--cbms-navy)" }}>Citizen E-Wallet & Ayuda</div>
                        <p style={{ fontSize: 11.5, color: "#64748b", margin: "3px 0 6px", lineHeight: 1.35 }}>
                          Tingnan ang iyong ayuda at cash assistance records.
                        </p>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: "#059669" }}>Buksan ang Wallet →</span>
                      </div>
                    </div>

                    {/* Card 4: Appointments */}
                    <div
                      className="hub-card-interactive"
                      onClick={() => setActiveModal("appointment")}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: "14px",
                        background: "#fafbfd",
                        cursor: "pointer",
                        display: "flex",
                        gap: 12,
                      }}
                    >
                      <div style={{ fontSize: 26, background: "#f3e8ff", width: 44, height: 44, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0 }}>
                        📅
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13.5, color: "var(--cbms-navy)" }}>Barangay Appointments</div>
                        <p style={{ fontSize: 11.5, color: "#64748b", margin: "3px 0 6px", lineHeight: 1.35 }}>
                          Mag-iskedyul sa Punong Barangay, VAW Desk, o Lupon.
                        </p>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: "#7e22ce" }}>Pumili ng Petsa →</span>
                      </div>
                    </div>

                    {/* Card 5: Health */}
                    <div
                      className="hub-card-interactive"
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: "14px",
                        background: "#fafbfd",
                        display: "flex",
                        gap: 12,
                      }}
                    >
                      <div style={{ fontSize: 26, background: "#ffe4e6", width: 44, height: 44, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0 }}>
                        🩺
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13.5, color: "var(--cbms-navy)" }}>Maternal & Child Health</div>
                        <p style={{ fontSize: 11.5, color: "#64748b", margin: "3px 0 6px", lineHeight: 1.35 }}>
                          Libreng bakuna, bitamina, at prenatal checkup.
                        </p>
                        <span style={{ fontSize: 11, color: "#e11d48", fontWeight: 700 }}>8:00 AM - 4:00 PM Lunes-Biyernes</span>
                      </div>
                    </div>

                    {/* Card 6: Digital ID */}
                    <div
                      className="hub-card-interactive"
                      onClick={() => setActiveTab("id")}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: "14px",
                        background: "#fafbfd",
                        cursor: "pointer",
                        display: "flex",
                        gap: 12,
                      }}
                    >
                      <div style={{ fontSize: 26, background: "#f1f5f9", width: 44, height: 44, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0 }}>
                        🪪
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13.5, color: "var(--cbms-navy)" }}>Digital Resident ID</div>
                        <p style={{ fontSize: 11.5, color: "#64748b", margin: "3px 0 6px", lineHeight: 1.35 }}>
                          Virtual ID Card na may QR code para sa mabilis na pagkilala.
                        </p>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--cbms-navy)" }}>Tingnan ang ID →</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Inline Announcements (Shown on mobile inside Home) */}
                <div className="hub-mobile-announcements">
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--cbms-navy)", margin: "0 0 10px" }}>
                    📢 Mga Anunsyo ng Barangay
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {announcements.map((a) => (
                      <div
                        key={a.id}
                        style={{
                          background: a.severity === "warning" ? "#fffbeb" : "#fff",
                          borderLeft: a.severity === "warning" ? "3px solid #f59e0b" : "3px solid #2563eb",
                          border: "1px solid #e2e8f0",
                          borderRadius: 10,
                          padding: 12,
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: 12.5, color: "var(--cbms-navy)" }}>{a.title}</div>
                        <div style={{ fontSize: 11.5, marginTop: 4, color: "#475569", lineHeight: 1.4 }}>{a.body}</div>
                        <div style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 6 }}>📅 {a.publishedAt || "Kamakailan"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* SERVICES TAB */}
            {activeTab === "services" && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "20px" }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--cbms-navy)", margin: "0 0 6px" }}>
                  📄 Kahilingan ng Barangay Clearance at Dokumento
                </h3>
                <p style={{ fontSize: 12.5, color: "#64748b", margin: "0 0 18px" }}>
                  Magsumite ng kahilingan para sa opisyal na sertipiko na may QR verification.
                </p>

                <div style={{ maxWidth: 600 }}>
                  <Field label="Piliin ang Uri ng Dokumento">
                    <select
                      className="cbms-input"
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                    >
                      <option>Barangay Clearance (Employment / Business / Bank)</option>
                      <option>Certificate of Indigency (Financial & Medical Aid)</option>
                      <option>Certificate of Residency (Proof of Address)</option>
                      <option>First Time Jobseeker Clearance (RA 11261 - Free)</option>
                      <option>Barangay Good Moral Certificate</option>
                    </select>
                  </Field>

                  <Field label="Layunin ng Pagkuha (Purpose)">
                    <input
                      className="cbms-input"
                      value={docPurpose}
                      onChange={(e) => setDocPurpose(e.target.value)}
                      placeholder="Hal. Pag-aapply sa trabaho, scholarship, passport…"
                    />
                  </Field>

                  <Field label="Paraan ng Pagkuha (Pickup Mode)">
                    <select className="cbms-input">
                      <option>Personal pickup sa Barangay Hall (Express Lane)</option>
                      <option>Digital PDF Certificate na may QR Verification</option>
                    </select>
                  </Field>

                  <Button
                    variant="primary"
                    style={{ marginTop: 10, width: "100%", padding: "11px", fontSize: 13.5 }}
                    onClick={() => {
                      alert(`Matagumpay na naitala ang inyong kahilingan para sa ${docType}! Reference code: BRGY-${Math.floor(100000 + Math.random() * 900000)}.`);
                    }}
                  >
                    Isumite ang Kahilingan
                  </Button>
                </div>
              </div>
            )}

            {/* REPORT 311 TAB */}
            {activeTab === "report" && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "20px" }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--cbms-navy)", margin: "0 0 6px" }}>
                  📣 311 Citizen Concern Reporting Desk
                </h3>
                <p style={{ fontSize: 12.5, color: "#64748b", margin: "0 0 18px" }}>
                  I-ulat ang mga suliranin upang maaksyunan kaagad ng Barangay Tanod at LGU Team.
                </p>

                <div style={{ maxWidth: 640 }}>
                  <Field label="Kategorya ng Sumbong">
                    <select
                      className="cbms-input"
                      value={concernCategory}
                      onChange={(e) => setConcernCategory(e.target.value)}
                    >
                      <option>Streetlighting / Pundidong Ilaw sa Kalsada</option>
                      <option>Solid Waste & Basura Collection</option>
                      <option>Public Safety / Tanod Patrol Assistance</option>
                      <option>Noise Complaint / Videoke Disturbance</option>
                      <option>Baradong Kanal / Drainage & Flooding</option>
                      <option>Obstruction sa Bangketa at Kalsada</option>
                    </select>
                  </Field>

                  <Field label="Eksaktong Lokasyon (Kalye, Purok, Landmark)">
                    <input
                      className="cbms-input"
                      placeholder="Hal. Kalye Malaya tapat ng Purok 3 Bakery…"
                      value={concernLocation}
                      onChange={(e) => setConcernLocation(e.target.value)}
                    />
                  </Field>

                  <Field label="Buong Detalye ng Sumbong">
                    <textarea
                      className="cbms-input"
                      rows={4}
                      placeholder="Ilarawan nang malinaw ang sitwasyon…"
                      value={concernDesc}
                      onChange={(e) => setConcernDesc(e.target.value)}
                    />
                  </Field>

                  <Button
                    variant="primary"
                    style={{ marginTop: 10, width: "100%", padding: "11px", fontSize: 13.5 }}
                    onClick={() => {
                      setModalSuccess("Matagumpay na naipadala ang inyong sumbong (#311-2026-088)! Naka-dispatch na ang alert sa Barangay Tanod Desk.");
                      setConcernDesc("");
                      setConcernLocation("");
                    }}
                  >
                    Ipadala ang Sumbong sa Tanod
                  </Button>

                  {modalSuccess && (
                    <div style={{ marginTop: 14 }}>
                      <Alert tone="success">{modalSuccess}</Alert>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* WALLET TAB */}
            {activeTab === "wallet" && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "20px" }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--cbms-navy)", margin: "0 0 14px" }}>
                  👛 Barangay Citizen E-Wallet & Subsidy Disbursals
                </h3>

                <div
                  style={{
                    background: "linear-gradient(135deg, #0a2463 0%, #1e40af 100%)",
                    borderRadius: 14,
                    padding: "22px",
                    color: "#fff",
                    boxShadow: "0 6px 20px rgba(10,36,99,0.2)",
                    marginBottom: 20,
                  }}
                >
                  <div style={{ fontSize: 11.5, opacity: 0.85, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Kasalukuyang Ayuda & Disbursement Balanse
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 900, marginTop: 4, letterSpacing: "-0.02em" }}>
                    {isAuthed ? residentInfo.wallet : "₱ 5,250.00"}
                  </div>
                  <div style={{ fontSize: 11.5, opacity: 0.8, marginTop: 6 }}>
                    {isAuthed ? `Pangalan: ${user.fullName} · ${residentInfo.purok}` : "Demo Resident Account · Cardo Dalisay"}
                  </div>

                  <button
                    type="button"
                    onClick={() => alert("Ang Cash-out ay magagamit sa mga akreditadong sari-sari store o sa Barangay Hall Treasury.")}
                    style={{
                      background: "var(--cbms-gold, #fdb913)",
                      color: "var(--cbms-navy, #0a2463)",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: 8,
                      fontSize: 12.5,
                      fontWeight: 800,
                      cursor: "pointer",
                      marginTop: 14,
                    }}
                  >
                    I-claim / Cash-Out
                  </button>
                </div>

                <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "var(--cbms-navy)", marginBottom: 10 }}>
                  Talaan ng Natanggap na Ayuda (Treasury Ledger):
                </h4>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: 13 }}>Senior Citizen Social Pension</strong>
                      <div style={{ fontSize: 11, color: "#64748b" }}>Barangay Treasurer · Kahapon</div>
                    </div>
                    <span style={{ fontWeight: 800, color: "#059669", fontSize: 13.5 }}>+ ₱ 3,000.00</span>
                  </div>

                  <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: 13 }}>Educational Assistance Subsidy</strong>
                      <div style={{ fontSize: 11, color: "#64748b" }}>BDC Youth Fund · Hulyo 2026</div>
                    </div>
                    <span style={{ fontWeight: 800, color: "#059669", fontSize: 13.5 }}>+ ₱ 2,250.00</span>
                  </div>
                </div>
              </div>
            )}

            {/* DIGITAL ID TAB */}
            {activeTab === "id" && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "20px" }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--cbms-navy)", margin: "0 0 14px" }}>
                  🪪 Opisyal na Digital Resident ID
                </h3>

                <div
                  style={{
                    maxWidth: 460,
                    margin: "0 auto",
                    border: "2px solid var(--cbms-navy, #0a2463)",
                    borderRadius: 14,
                    padding: 20,
                    background: "linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)",
                    boxShadow: "0 6px 20px rgba(10,36,99,0.08)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #0a2463", paddingBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 9.5, fontWeight: 800, color: "#0a2463", textTransform: "uppercase" }}>
                        Republika ng Pilipinas · Marikina
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: "#0a2463" }}>
                        BARANGAY BARANGKA
                      </div>
                    </div>
                    <span style={{ fontSize: 9.5, background: "#059669", color: "#fff", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                      VERIFIED INHABITANT
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 14, marginTop: 14, alignItems: "center" }}>
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 10,
                        background: "#0a2463",
                        color: "#fdb913",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 22,
                        fontWeight: 900,
                        flexShrink: 0,
                      }}
                    >
                      {isAuthed ? user.fullName?.slice(0, 2).toUpperCase() : "CD"}
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#0a2463" }}>
                        {isAuthed ? user.fullName : "Cardo Dalisay"}
                      </div>
                      <div style={{ fontSize: 11.5, color: "#475569", marginTop: 2 }}>
                        Tirahan: {residentInfo.purok}, Barangay Barangka
                      </div>
                      <div style={{ fontSize: 11, color: "#2563eb", fontWeight: 700, marginTop: 3 }}>
                        ID No: {residentInfo.idNum}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px dashed #cbd5e1", textAlign: "center" }}>
                    <div style={{ fontSize: 38 }}>📱</div>
                    <div style={{ fontSize: 10.5, color: "#64748b", marginTop: 4 }}>
                      Ipakita ang QR identification na ito sa Barangay Hall o tanod checkpoint para sa instant identity verification.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR COLUMN (Visible on desktop, hidden on mobile) */}
          <div className="hub-sidebar">
            {/* Sticky Emergency SOS Card */}
            <div
              style={{
                background: "linear-gradient(135deg, #ce1126 0%, #991b1b 100%)",
                borderRadius: 14,
                padding: 20,
                color: "#fff",
                boxShadow: "0 6px 18px rgba(206,17,38,0.3)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 24 }}>🚨</span>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 800, margin: 0, letterSpacing: ".01em" }}>
                    EMERGENCY SOS DESK
                  </h4>
                  <div style={{ fontSize: 11.5, opacity: 0.88 }}>24/7 Tanod & BDRRMC Dispatch</div>
                </div>
              </div>

              <p style={{ fontSize: 12, opacity: 0.92, margin: "10px 0 14px", lineHeight: 1.45 }}>
                Pindutin kung may sunog, baha, medikal na emerhensya, o kagyat na pangangailangan ng tanod:
              </p>

              <button
                type="button"
                onClick={triggerSos}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 8,
                  background: "#fff",
                  color: "#ce1126",
                  border: "none",
                  fontWeight: 900,
                  fontSize: 14,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                🚨 PINDUTIN PARA SA SOS
              </button>

              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.2)", fontSize: 11.5 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Tanod Radio Hotline:</span>
                  <strong>(02) 8941-5522</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span>Marikina Rescue 161:</span>
                  <strong>Dial 161</strong>
                </div>
              </div>
            </div>

            {/* Live Announcements Card */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: "var(--cbms-navy)", margin: 0 }}>
                  📢 Mga Anunsyo at Babala
                </h4>
                <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 700 }}>Live Feed</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {announcements.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      padding: 12,
                      background: a.severity === "warning" ? "#fffbeb" : "#f8fafc",
                      borderLeft: a.severity === "warning" ? "3px solid #f59e0b" : "3px solid #2563eb",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                    }}
                  >
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--cbms-navy)" }}>{a.title}</div>
                    <div style={{ fontSize: 11.5, color: "#475569", marginTop: 4, lineHeight: 1.4 }}>{a.body}</div>
                    <div style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 6 }}>📅 {a.publishedAt || "Kamakailan"}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Office Hours & Hall Info */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "20px" }}>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: "var(--cbms-navy)", margin: "0 0 10px" }}>
                🏛️ Barangay Hall & Desks
              </h4>
              <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>
                <div>📍 Kalye Bonifacio, Barangay Barangka</div>
                <div>🕒 Lunes hanggang Biyernes: 8:00 AM - 5:00 PM</div>
                <div>🛡️ VAW Desk & Tanod Post: 24 Oras Bukas</div>
                <div>✉️ Email: <a href="mailto:barangka@marikina.gov.ph" style={{ color: "#2563eb" }}>barangka@marikina.gov.ph</a></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 6. Mobile Fixed Bottom Navigation Bar (Appears ONLY when resolution <= 768px) */}
      <nav className="hub-mobile-tabbar" aria-label="Mobile Navigation">
        <div
          className={`hub-mobile-tab${activeTab === "home" ? " hub-mobile-tab--active" : ""}`}
          onClick={() => setActiveTab("home")}
        >
          <span className="hub-mobile-tab__icon">🏠</span>
          <span>Tahanan</span>
        </div>

        <div
          className={`hub-mobile-tab${activeTab === "services" ? " hub-mobile-tab--active" : ""}`}
          onClick={() => setActiveTab("services")}
        >
          <span className="hub-mobile-tab__icon">📄</span>
          <span>Serbisyo</span>
        </div>

        <div
          className={`hub-mobile-tab${activeTab === "report" ? " hub-mobile-tab--active" : ""}`}
          onClick={() => setActiveTab("report")}
        >
          <span className="hub-mobile-tab__icon">📣</span>
          <span>Report 311</span>
        </div>

        <div
          className={`hub-mobile-tab${activeTab === "wallet" ? " hub-mobile-tab--active" : ""}`}
          onClick={() => setActiveTab("wallet")}
        >
          <span className="hub-mobile-tab__icon">👛</span>
          <span>Ayuda</span>
        </div>

        <div
          className={`hub-mobile-tab${activeTab === "id" ? " hub-mobile-tab--active" : ""}`}
          onClick={() => setActiveTab("id")}
        >
          <span className="hub-mobile-tab__icon">🪪</span>
          <span>ID Ko</span>
        </div>
      </nav>

      {/* 7. Full Website Footer */}
      <footer
        style={{
          background: "#071a47",
          color: "#9fb3dd",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          padding: "24px 24px 20px",
          marginTop: "auto",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            fontSize: 12,
          }}
        >
          <div>
            <strong style={{ color: "#fff", fontSize: 13 }}>Barangay Inhabitant Hub</strong>
            <p style={{ margin: "4px 0 0", opacity: 0.8 }}>
              Official digital governance companion to DILG LGUSS-BIMS (MC 2025-104). Personal data protected under RA 10173.
            </p>
          </div>

          <div className="hub-desktop-footer-links" style={{ display: "flex", gap: 18 }}>
            <Link href="/" style={{ color: "#fff", textDecoration: "none" }}>
              Barangay Public Portal
            </Link>
            <Link href="/portal/verify" style={{ color: "#fff", textDecoration: "none" }}>
              Verify Certificate
            </Link>
            <Link href="/login" style={{ color: "#fff", textDecoration: "none" }}>
              Staff Console
            </Link>
          </div>
        </div>
        <MockBanner />
      </footer>

      {/* SOS Modal */}
      {sosActive && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
            padding: 16,
          }}
        >
          <div style={{ background: "#fff", borderRadius: 16, maxWidth: 400, width: "100%", padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 8 }}>🚨</div>
            <h3 style={{ fontSize: 20, color: "var(--cbms-red, #ce1126)", margin: "0 0 8px", fontWeight: 800 }}>
              EMERGENCY SOS ALERT
            </h3>
            {!sosDispatched ? (
              <>
                <p style={{ fontSize: 13.5, color: "#475569", margin: "0 0 16px" }}>
                  Ipinapadala ang inyong lokasyon sa Barangay Tanod Command Center at BDRRMC Emergency Team…
                </p>
                <Spinner />
              </>
            ) : (
              <>
                <Alert tone="success">
                  <strong>DISPATCHED!</strong> Alert #SOS-2026-904. Ang patrol ng Barangay Tanod ay naka-deploy na sa inyong lokasyon.
                </Alert>
                <Button
                  variant="primary"
                  style={{ width: "100%", marginTop: 16 }}
                  onClick={() => {
                    setSosActive(false);
                    setSosDispatched(false);
                  }}
                >
                  Isara ang Alert
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Request Modal */}
      {activeModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
            padding: 16,
          }}
        >
          <div style={{ background: "#fff", borderRadius: 16, maxWidth: 460, width: "100%", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "var(--cbms-navy)" }}>
                {activeModal === "clearance" ? "Humiling ng Dokumento" : activeModal === "concern" ? "I-ulat ang 311 Concern" : "Magpa-Appointment sa Barangay"}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            {activeModal === "clearance" && (
              <>
                <Field label="Uri ng Dokumento">
                  <select
                    className="cbms-input"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                  >
                    <option>Barangay Clearance (Employment / Business / Bank)</option>
                    <option>Certificate of Indigency (Financial & Medical Aid)</option>
                    <option>Certificate of Residency (Proof of Address)</option>
                    <option>First Time Jobseeker Clearance (RA 11261 - Free)</option>
                  </select>
                </Field>
                <Field label="Layunin (Purpose)">
                  <input
                    className="cbms-input"
                    value={docPurpose}
                    onChange={(e) => setDocPurpose(e.target.value)}
                    placeholder="Hal. Trabaho, Scholarship, ID application…"
                  />
                </Field>
                <Button
                  variant="primary"
                  style={{ width: "100%", marginTop: 8 }}
                  onClick={() => {
                    setActiveModal(null);
                    alert(`Matagumpay na naisumite ang inyong hiling para sa ${docType}! Reference code: BRGY-${Math.floor(100000 + Math.random() * 900000)}.`);
                  }}
                >
                  Isumite ang Kahilingan
                </Button>
              </>
            )}

            {activeModal === "concern" && (
              <>
                <Field label="Kategorya ng Sumbong">
                  <select
                    className="cbms-input"
                    value={concernCategory}
                    onChange={(e) => setConcernCategory(e.target.value)}
                  >
                    <option>Streetlighting / Pundidong Ilaw</option>
                    <option>Solid Waste / Basura</option>
                    <option>Public Safety / Tanod Patrol</option>
                    <option>Noise Complaint / Videoke</option>
                  </select>
                </Field>
                <Field label="Lokasyon at Detalye">
                  <textarea
                    className="cbms-input"
                    rows={3}
                    placeholder="Saan at ano ang sitwasyon sa inyong purok…"
                  />
                </Field>
                <Button
                  variant="primary"
                  style={{ width: "100%", marginTop: 8 }}
                  onClick={() => {
                    setActiveModal(null);
                    alert("Naitala na ang inyong 311 Concern. Naka-dispatch na ang alert sa Barangay Tanod.");
                  }}
                >
                  Isumite ang Sumbong
                </Button>
              </>
            )}

            {activeModal === "appointment" && (
              <>
                <Field label="Opisyal o Tanggapan">
                  <select className="cbms-input">
                    <option>Punong Barangay (Kapitan)</option>
                    <option>Barangay Secretary (Records & Clearances)</option>
                    <option>VAW Desk Officer (Proteksyon sa Kababaihan)</option>
                    <option>Lupon Tagapamayapa (KP Hearings)</option>
                  </select>
                </Field>
                <Field label="Gustong Petsa">
                  <input className="cbms-input" type="date" defaultValue="2026-09-18" />
                </Field>
                <Button
                  variant="primary"
                  style={{ width: "100%", marginTop: 8 }}
                  onClick={() => {
                    setActiveModal(null);
                    alert("Nakatakda na ang inyong appointment. Mangyaring magdala ng valid ID.");
                  }}
                >
                  Kumpirmahin ang Appointment
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
