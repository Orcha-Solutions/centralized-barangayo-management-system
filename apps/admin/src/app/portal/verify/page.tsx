import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { VerifySearch } from "../components/VerifySearch";

export const metadata = {
  title: "Verify a certificate",
  description:
    "Check whether a barangay certificate is genuine and still valid. Only the holder's initials are shown.",
};

export default function VerifyLandingPage() {
  return (
    <div className="site-page">
      <SiteHeader />

      <main id="main" className="site-body">
        <section className="site-hero">
          <div className="site-wrap">
            <div className="site-hero__grid">
              <div>
                <span className="site-hero__eyebrow">Certificate verification</span>
                <h1 className="site-hero__title">Is this barangay certificate genuine?</h1>
                <p className="site-hero__sub">
                  Employers, banks, schools and anyone else presented with a barangay clearance or
                  certificate can confirm it here in seconds. No account, no fee, no visit to the
                  barangay hall.
                </p>
              </div>
              <div>
                <VerifySearch variant="hero" autoFocus />
              </div>
            </div>
          </div>
        </section>

        <section className="site-section">
          <div className="site-wrap">
            <div className="site-section__head">
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 className="site-section__title">How verification works</h2>
                <div className="site-section__rule" />
              </div>
            </div>
            <p className="site-section__lead">
              Public certificate verification is a CBMS addition — it is not part of the DILG
              LGUSS-BIMS record system it accompanies.
            </p>

            <div className="site-cards">
              <div className="site-card">
                <p className="site-card__name">1. Find the code</p>
                <p className="site-card__city" style={{ marginTop: 8 }}>
                  Every certificate released through CBMS is printed with a QR code and a
                  12-character verification code beneath it. Scan the QR, or type the code above.
                </p>
              </div>
              <div className="site-card">
                <p className="site-card__name">2. Read the result</p>
                <p className="site-card__city" style={{ marginTop: 8 }}>
                  A green <strong>VALID</strong> panel means the barangay really issued that
                  certificate and it has not expired. Red means no match, or the certificate has
                  lapsed.
                </p>
              </div>
              <div className="site-card">
                <p className="site-card__name">3. Only initials are shown</p>
                <p className="site-card__city" style={{ marginTop: 8 }}>
                  Under the Data Privacy Act of 2012 (RA 10173), full names are never published on
                  a public verification screen. You will see initials (e.g. <em>J. D. C.</em>) to
                  confirm against the document in your hand.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
