"use client";

import * as React from "react";
import { login, ApiError } from "@cbms/api-client";
import { Alert, Button, Field, Spinner } from "@cbms/ui";

type Step = "credentials" | "totp" | "enroll";

export default function LoginPage() {
  const [step, setStep] = React.useState<Step>("credentials");
  const [email, setEmail] = React.useState("treasurer@barangka.gov.ph");
  const [password, setPassword] = React.useState("Cbms#2026");
  const [totp, setTotp] = React.useState("");
  const [enrolment, setEnrolment] = React.useState<{ secret: string; uri: string } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await login(email, password, step === "totp" ? totp.trim() : undefined);

      if (res.mfaEnrollmentRequired && res.secret) {
        setEnrolment({ secret: res.secret, uri: res.otpauthUri ?? "" });
        setStep("enroll");
        return;
      }
      if (res.mfaRequired) {
        setStep("totp");
        return;
      }
      if (res.token) {
        // Full navigation so the session hook in the shell re-reads localStorage.
        window.location.href = "/";
        return;
      }
      setError(res.message ?? "Unexpected response from the server.");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status === 401 && step === "totp") setTotp("");
      } else {
        setError("Cannot reach the CBMS API. Is it running on http://localhost:4000?");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cbms-auth">
      <div className="cbms-auth__card">
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 6 }}>
          <div className="cbms-sidebar__logo" aria-hidden="true">
            {"₱"}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: "var(--cbms-navy)" }}>
              CBMS Agent
            </div>
            <div style={{ fontSize: 11.5, color: "var(--cbms-muted)" }}>
              Cash-in / cash-out terminal
            </div>
          </div>
        </div>

        <p className="ag-muted" style={{ marginTop: 0, marginBottom: 16 }}>
          Sign in to open your outlet, cash out government aid and track your float.
        </p>

        {error && <Alert tone="danger">{error}</Alert>}

        {step === "enroll" && enrolment && (
          <>
            <Alert tone="info">
              This account has no authenticator yet. Add the key below to Google Authenticator (or
              any TOTP app), then enter the 6-digit code.
            </Alert>
            <Field label="Setup key">
              <code
                style={{
                  display: "block",
                  wordBreak: "break-all",
                  background: "var(--cbms-card)",
                  padding: "10px 12px",
                  borderRadius: 8,
                  fontSize: 13,
                  letterSpacing: "0.06em",
                }}
              >
                {enrolment.secret}
              </code>
            </Field>
            {enrolment.uri && (
              <Field label="otpauth URI">
                <code
                  style={{
                    display: "block",
                    wordBreak: "break-all",
                    background: "var(--cbms-card)",
                    padding: "10px 12px",
                    borderRadius: 8,
                    fontSize: 10.5,
                  }}
                >
                  {enrolment.uri}
                </code>
              </Field>
            )}
            <Button
              variant="primary"
              onClick={() => {
                setStep("totp");
                setError(null);
              }}
              style={{ width: "100%" }}
            >
              I&rsquo;ve added it — continue
            </Button>
          </>
        )}

        {step !== "enroll" && (
          <form onSubmit={submit}>
            {step === "credentials" && (
              <>
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
              </>
            )}

            {step === "totp" && (
              <>
                <Alert tone="info">
                  Staff accounts are MFA-protected. Enter the 6-digit code from your authenticator.
                </Alert>
                <Field label="6-digit code" hint={`Signing in as ${email}`}>
                  <input
                    className="cbms-input"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    value={totp}
                    onChange={(e) => setTotp(e.target.value.replace(/\D/g, ""))}
                    style={{ fontSize: 22, letterSpacing: "0.35em", textAlign: "center" }}
                    autoFocus
                  />
                </Field>
                <button
                  type="button"
                  className="cbms-btn cbms-btn--sm"
                  onClick={() => {
                    setStep("credentials");
                    setTotp("");
                    setError(null);
                  }}
                  style={{ marginBottom: 12 }}
                >
                  ← Use a different account
                </button>
              </>
            )}

            <button className="ag-btn-lg" type="submit" disabled={busy}>
              {busy ? <Spinner /> : step === "totp" ? "Verify & open outlet" : "Sign in"}
            </button>
          </form>
        )}


      </div>
    </div>
  );
}
