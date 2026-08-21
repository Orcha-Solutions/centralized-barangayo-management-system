"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { normalizeCode } from "@/lib/brand";

/**
 * The prominent "Verify a certificate" box. Routes to /verify/[code].
 */
export function VerifySearch({
  variant = "hero",
  autoFocus = false,
  initialCode = "",
}: {
  variant?: "hero" | "inline";
  autoFocus?: boolean;
  initialCode?: string;
}) {
  const router = useRouter();
  const [code, setCode] = React.useState(initialCode);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const clean = normalizeCode(code);
    if (clean.length < 4) {
      setError("Enter the verification code printed on the certificate (at least 4 characters).");
      return;
    }
    setError(null);
    setPending(true);
    router.push(`/verify/${encodeURIComponent(clean)}`);
  }

  return (
    <form
      className={`site-verify${variant === "inline" ? " site-verify--inline" : ""}`}
      onSubmit={onSubmit}
      noValidate
    >
      <h2 className="site-verify__title">Verify a barangay certificate</h2>
      <p className="site-verify__hint">
        Type the code printed under the QR on any barangay clearance, certificate of residency or
        indigency certificate. Anyone can check — no account needed.
      </p>
      <div className="site-verify__row">
        <label className="site-visually-hidden" htmlFor="verify-code">
          Certificate verification code
        </label>
        <input
          id="verify-code"
          name="code"
          className="site-verify__input"
          placeholder="e.g. FDC82BB69CE7"
          value={code}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          maxLength={40}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "verify-code-error" : undefined}
          onChange={(e) => setCode(e.target.value)}
        />
        <button className="site-verify__btn" type="submit" disabled={pending}>
          {pending ? "Checking…" : "Verify"}
        </button>
      </div>
      {error && (
        <p className="site-verify__err" id="verify-code-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
