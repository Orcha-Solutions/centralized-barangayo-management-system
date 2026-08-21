"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { login, ApiError, getToken } from "@cbms/api-client";
import { Alert, Button, Field, Spinner } from "@cbms/ui";

interface Enrolment {
  secret: string;
  otpauthUri?: string;
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = React.useState("lgu@marikina.gov.ph");
  const [password, setPassword] = React.useState("Cbms#2026");
  const [totp, setTotp] = React.useState("");

  const [needsTotp, setNeedsTotp] = React.useState(false);
  const [enrolment, setEnrolment] = React.useState<Enrolment | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  // Already signed in? Go straight to the dashboard.
  React.useEffect(() => {
    if (getToken()) router.replace("/");
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await login(email.trim(), password, totp.trim() || undefined);

      if (res.mfaEnrollmentRequired && res.secret) {
        // First staff login: the API just issued a TOTP secret. Show it clearly.
        setEnrolment({ secret: res.secret, otpauthUri: res.otpauthUri });
        setNeedsTotp(true);
        setTotp("");
        setNotice(
          res.message ??
            "Scan this in your authenticator, then sign in again with the 6-digit code.",
        );
        return;
      }

      if (res.mfaRequired) {
        setNeedsTotp(true);
        setNotice(res.message ?? "Enter the 6-digit code from your authenticator app.");
        return;
      }

      if (res.token) {
        router.replace("/");
        return;
      }

      setError("Unexpected response from the authentication service.");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        // A bad/expired code should not wipe the enrolment instructions.
        if (needsTotp) setTotp("");
      } else {
        setError(
          "Could not reach the CBMS API. Confirm it is running on http://localhost:4000.",
        );
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cbms-auth">
      <div className="cbms-auth__card">
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div
            className="cbms-sidebar__logo"
            style={{ margin: "0 auto 12px", width: 46, height: 46, fontSize: 15 }}
          >
            HUB
          </div>
          <h1 style={{ margin: 0, fontSize: 20, color: "var(--cbms-navy)" }}>
            LGU / DILG Hub
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--cbms-muted)" }}>
            Centralized Barangay Management System — city-wide oversight
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: 14 }}>
            <Alert tone="danger">{error}</Alert>
          </div>
        )}
        {notice && !error && (
          <div style={{ marginBottom: 14 }}>
            <Alert tone="info">{notice}</Alert>
          </div>
        )}

        {enrolment && (
          <div style={{ marginBottom: 14 }}>
            <Alert tone="warn">
              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                Set up multi-factor authentication
              </div>
              <ol style={{ margin: "0 0 10px 18px", padding: 0, lineHeight: 1.6, fontSize: 13 }}>
                <li>Open your authenticator app (Google Authenticator, Authy, 1Password…).</li>
                <li>Add a new account using the setup key below.</li>
                <li>Enter the current 6-digit code and sign in again.</li>
              </ol>
              <div style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>SETUP KEY</div>
              <code
                style={{
                  display: "block",
                  wordBreak: "break-all",
                  background: "var(--cbms-white)",
                  border: "1px solid var(--cbms-line)",
                  borderRadius: 8,
                  padding: "10px 12px",
                  fontSize: 14,
                  letterSpacing: "0.08em",
                  fontWeight: 700,
                  color: "var(--cbms-navy)",
                }}
              >
                {enrolment.secret}
              </code>
              {enrolment.otpauthUri && (
                <>
                  <div style={{ fontSize: 11.5, fontWeight: 700, margin: "10px 0 4px" }}>
                    OTPAUTH URI
                  </div>
                  <code
                    style={{
                      display: "block",
                      wordBreak: "break-all",
                      background: "var(--cbms-white)",
                      border: "1px solid var(--cbms-line)",
                      borderRadius: 8,
                      padding: "8px 10px",
                      fontSize: 11,
                      color: "var(--cbms-muted)",
                    }}
                  >
                    {enrolment.otpauthUri}
                  </code>
                </>
              )}
            </Alert>
          </div>
        )}

        <form onSubmit={onSubmit}>
          <Field label="Email">
            <input
              className="cbms-input"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field label="Password">
            <input
              className="cbms-input"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          {needsTotp && (
            <Field
              label="6-digit authenticator code"
              hint="Staff accounts are protected by multi-factor authentication."
            >
              <input
                className="cbms-input"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                autoFocus
                value={totp}
                onChange={(e) => setTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                style={{ letterSpacing: "0.35em", fontSize: 16, fontWeight: 700 }}
              />
            </Field>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={busy}
            style={{ width: "100%", marginTop: 6, justifyContent: "center" }}
          >
            {busy ? <Spinner /> : needsTotp ? "Verify & sign in" : "Sign in"}
          </Button>
        </form>

        <div
          style={{
            marginTop: 18,
            paddingTop: 14,
            borderTop: "1px solid var(--cbms-line)",
            fontSize: 11.5,
            color: "var(--cbms-muted)",
            lineHeight: 1.6,
          }}
        >
          <strong>Demo accounts</strong> (password <code>Cbms#2026</code>)
          <br />
          lgu@marikina.gov.ph — LGU_ADMIN (city-wide)
          <br />
          dilg@dilg.gov.ph — DILG_VIEWER (aggregates only)
          <br />
          Both are staff roles and require a TOTP code.
        </div>
      </div>
    </div>
  );
}
