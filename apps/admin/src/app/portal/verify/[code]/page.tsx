import Link from "next/link";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "../../components/SiteFooter";
import { VerifySearch } from "../../components/VerifySearch";
import { SAMPLE_VERIFICATIONS } from "../../data";

type Params = { code: string };

export const metadata = {
  title: "Certificate verification result",
  robots: { index: false, follow: false },
};

export default async function VerifyResultPage({ params }: { params: Promise<Params> }) {
  const { code: rawCode } = await params;
  const clean = decodeURIComponent(rawCode).trim().replace(/[\s-]+/g, "").toUpperCase();
  const hit = SAMPLE_VERIFICATIONS[clean] || null;

  const isValid = !!hit && hit.status === "valid";
  const isExpired = !!hit && hit.status === "expired";

  const tone: "valid" | "invalid" = isValid ? "valid" : "invalid";
  const word = isValid ? "VALID" : isExpired ? "EXPIRED" : "INVALID";
  const mark = isValid ? "✓" : "✕";

  const subtitle = isValid
    ? "This certificate was genuinely issued by the barangay named below and is still within its validity period."
    : isExpired
      ? "This certificate was genuinely issued by the barangay named below, but its validity period has already lapsed. Ask for a newly issued copy."
      : "No released certificate matches this verification code. It may have been mistyped, or the document may not have been issued through the barangay's official system.";

  return (
    <div className="site-page">
      <SiteHeader />

      <main id="main" className="site-body">
        <section className="site-section">
          <div className="site-wrap">
            <div className="site-section__head">
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 className="site-section__title">Certificate verification result</h2>
                <div className="site-section__rule" />
              </div>
            </div>

            <div className={`site-result site-result--${tone}`} role="status" aria-live="polite">
              <div className="site-result__mark" aria-hidden="true">
                {mark}
              </div>
              <p className="site-result__word">{word}</p>
              <p className="site-result__sub">{subtitle}</p>
              <span className="site-result__code">{clean}</span>
            </div>

            {hit && (
              <div style={{ marginTop: 24 }}>
                <div className="site-panel">
                  <div className="site-panel__head">Certificate details</div>
                  <div className="site-panel__body">
                    <dl className="site-dl">
                      <dt>Document type</dt>
                      <dd>{hit.docType}</dd>

                      <dt>Issuing barangay</dt>
                      <dd>
                        Barangay {hit.barangay}, {hit.city}
                      </dd>

                      <dt>Recipient initials</dt>
                      <dd>{hit.recipientInitials}</dd>

                      <dt>Purpose</dt>
                      <dd>{hit.purpose}</dd>

                      <dt>Issued date</dt>
                      <dd>{hit.issuedAt}</dd>

                      <dt>Valid until</dt>
                      <dd>{hit.validUntil}</dd>

                      <dt>Signatory</dt>
                      <dd>{hit.signedBy}</dd>
                    </dl>
                  </div>
                </div>

                <div className="site-privacy" style={{ marginTop: 14 }}>
                  <span className="site-privacy__icon" aria-hidden="true">
                    🔒
                  </span>
                  <div>
                    <strong>Data privacy note:</strong> Under Republic Act No. 10173 (Data Privacy
                    Act of 2012), full personal names are withheld from public verification screens.
                    Verify the initials against the physical document presented.
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: 28, maxWidth: 540 }}>
              <VerifySearch variant="inline" initialCode={clean} />
            </div>

            <p style={{ marginTop: 20 }}>
              <Link href="/portal" style={{ color: "var(--site-navy)", fontWeight: 700 }}>
                ← Back to Barangay directory
              </Link>
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
