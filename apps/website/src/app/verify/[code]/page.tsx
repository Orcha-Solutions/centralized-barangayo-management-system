import type { Metadata } from "next";
import Link from "next/link";
import { Alert, date, dateTime } from "@cbms/ui";
import { fetchVerification } from "@/lib/api";
import { normalizeCode } from "@/lib/brand";
import { Section } from "@/components/Section";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { VerifySearch } from "@/components/VerifySearch";

/** Always rendered on demand — the build must never call the API. */
export const dynamic = "force-dynamic";

type Params = { code: string };

export const metadata: Metadata = {
  title: "Certificate verification result",
  robots: { index: false, follow: false },
};

export default async function VerifyResultPage({ params }: { params: Promise<Params> }) {
  const { code: rawCode } = await params;
  const code = normalizeCode(decodeURIComponent(rawCode));
  const result = await fetchVerification(code);

  const hit = result.kind === "hit" ? result.data : null;
  const isValid = !!hit && hit.valid && !hit.expired;
  const isExpired = !!hit && hit.expired;

  const tone: "valid" | "invalid" | "unknown" =
    result.kind === "unavailable" ? "unknown" : isValid ? "valid" : "invalid";

  const word =
    result.kind === "unavailable"
      ? "UNAVAILABLE"
      : isValid
        ? "VALID"
        : isExpired
          ? "EXPIRED"
          : "INVALID";

  const mark = result.kind === "unavailable" ? "!" : isValid ? "✓" : "✕";

  const subtitle =
    result.kind === "unavailable"
      ? "We could not reach the verification service. Please try again in a moment — this does not mean the certificate is fake."
      : isValid
        ? "This certificate was genuinely issued by the barangay named below and is still within its validity period."
        : isExpired
          ? "This certificate was genuinely issued by the barangay named below, but its validity period has already lapsed. Ask for a newly issued copy."
          : "No released certificate matches this verification code. It may have been mistyped, or the document may not have been issued through the barangay's official system.";

  return (
    <div className="site-page">
      <SiteHeader />

      <main id="main" className="site-body">
        <Section title="Certificate verification result">
          <div className={`site-result site-result--${tone}`} role="status" aria-live="polite">
            <div className="site-result__mark" aria-hidden="true">
              {mark}
            </div>
            <p className="site-result__word">{word}</p>
            <p className="site-result__sub">{subtitle}</p>
            {code && <span className="site-result__code">{code}</span>}
          </div>

          {result.kind === "unavailable" && (
            <div style={{ marginTop: 20 }}>
              <Alert tone="warn">
                <div>
                  <strong>Verification service unreachable.</strong>
                  <div style={{ marginTop: 4, fontSize: 12.5 }}>{result.message}</div>
                </div>
              </Alert>
            </div>
          )}

          {hit && (
            <div className="site-panel" style={{ marginTop: 20 }}>
              <div className="site-panel__head">Certificate details</div>
              <div className="site-panel__body">
                <dl className="site-dl">
                  <dt>Certificate type</dt>
                  <dd>{hit.certificate}</dd>

                  <dt>Reference number</dt>
                  <dd style={{ fontVariantNumeric: "tabular-nums" }}>{hit.referenceNo}</dd>

                  <dt>Issued to</dt>
                  <dd>
                    {hit.issuedTo}{" "}
                    <span style={{ fontWeight: 400, color: "var(--site-muted)", fontSize: 12.5 }}>
                      (initials only)
                    </span>
                  </dd>

                  <dt>Issuing barangay</dt>
                  <dd>Barangay {hit.barangay}</dd>

                  <dt>City / municipality</dt>
                  <dd>{hit.city}</dd>

                  <dt>Date issued</dt>
                  <dd>{dateTime(hit.issuedAt)}</dd>

                  <dt>Valid until</dt>
                  <dd
                    style={{
                      color: isExpired ? "var(--site-red)" : undefined,
                      fontWeight: 700,
                    }}
                  >
                    {hit.expiresAt ? date(hit.expiresAt) : "No expiry"}
                    {isExpired ? " — lapsed" : ""}
                  </dd>
                </dl>
              </div>
            </div>
          )}

          <div className="site-privacy" style={{ marginTop: 20 }}>
            <span className="site-privacy__icon" aria-hidden="true">
              🔒
            </span>
            <div>
              <strong>Only the holder&apos;s initials are shown.</strong> The full name, address,
              birth date and every other personal detail on the certificate are withheld from this
              public page. Anyone can hold a verification code, so the check is deliberately built
              to confirm a document without letting this page be used to look residents up. Compare
              the initials above with the certificate in your hands: if they do not match, the
              document has been altered. Personal data is processed under the Data Privacy Act of
              2012 (RA 10173); the authoritative record is held in DILG&apos;s LGUSS-BIMS.
            </div>
          </div>

          {!isValid && result.kind !== "unavailable" && (
            <div style={{ marginTop: 20 }}>
              <Alert tone="warn">
                <div>
                  <strong>What to do next.</strong> Check for typing mistakes — the code is
                  normally 12 characters, and the digits 0/O and 1/I are easy to confuse. If it
                  still does not verify, contact the barangay named on the document directly. Do
                  not accept the certificate as proof of anything until it verifies.
                </div>
              </Alert>
            </div>
          )}

          <div style={{ marginTop: 22, maxWidth: 560 }}>
            <VerifySearch variant="inline" initialCode={code} />
          </div>

          <p style={{ marginTop: 20 }}>
            <Link className="site-nav__link site-nav__link--cta" href="/">
              ← Back to the barangay directory
            </Link>
          </p>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
