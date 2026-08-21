"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Field, MockBanner, Spinner } from "@cbms/ui";
import { getToken, login } from "@cbms/api-client";
import { useT } from "@/i18n";
import { errorMessage } from "@/lib/session";

const DEMO_ACCOUNTS = ["resident1@example.ph", "resident2@example.ph", "resident3@example.ph"];
const DEMO_PASSWORD = "Cbms#2026";

export default function LoginPage() {
  const router = useRouter();
  const { t, lang } = useT();

  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Already signed in? Skip straight to the home tab.
  React.useEffect(() => {
    if (getToken()) router.replace("/");
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
        router.replace("/");
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
    <div className="cbms-auth">
      <div className="cbms-auth__card">
        <div style={{ textAlign: "center", marginBottom: 22 }}>
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
            style={{ width: "100%", height: 44, marginTop: 4 }}
          >
            {busy ? <Spinner /> : t("login_submit")}
          </Button>
        </form>



        <p style={{ fontSize: 11, color: "var(--cbms-muted)", marginTop: 16, lineHeight: 1.5 }}>
          {t("companion_note")}
        </p>
      </div>

      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0 }}>
        <MockBanner />
      </div>
    </div>
  );
}
