"use client";

import * as React from "react";
import { ApiError, getToken, login } from "@cbms/api-client";
import { Alert, Button, Field, Spinner } from "@cbms/ui";

const DEMO_PASSWORD = "Cbms#2026";

const DEMO_ACCOUNTS: Array<{ email: string; label: string }> = [
  { email: "admin@cbms.gov.ph", label: "System Admin" },
  { email: "lgu@marikina.gov.ph", label: "LGU Admin" },
  { email: "kapitan@barangka.gov.ph", label: "Punong Barangay" },
  { email: "secretary@barangka.gov.ph", label: "Secretary" },
  { email: "treasurer@barangka.gov.ph", label: "Treasurer" },
  { email: "lupon@barangka.gov.ph", label: "Lupon Secretary" },
  { email: "vawdesk@barangka.gov.ph", label: "VAW Desk" },
  { email: "bhw@barangka.gov.ph", label: "BHW" },
  { email: "tanod@barangka.gov.ph", label: "Tanod" },
  { email: "dilg@dilg.gov.ph", label: "DILG Viewer" },
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
  const [booting, setBooting] = React.useState(true);

  React.useEffect(() => {
    if (getToken()) {
      window.location.href = "/";
      return;
    }
    setBooting(false);
  }, []);

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
        window.location.href = "/";
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
    <div className="cbms-auth">
      <div className="cbms-auth__card">
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
        <p style={{ fontSize: 12, color: "var(--cbms-muted)", margin: "10px 0 18px" }}>
          A companion to the DILG-mandated LGUSS-BIMS (MC 2025-104). Staff accounts require a
          time-based one-time password.
        </p>

        {error && <Alert tone="danger">{error}</Alert>}
        {notice && !error && <Alert tone="info">{notice}</Alert>}

        <form onSubmit={submit}>
          <Field label="Email">
            <input
              className="cbms-input"
              type="text"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Password">
            <input
              className="cbms-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <Button type="submit" variant="primary" disabled={busy} style={{ width: "100%" }}>
            {busy ? "Signing in…" : needsTotp ? "Verify & sign in" : "Sign in"}
          </Button>
        </form>


      </div>
    </div>
  );
}
