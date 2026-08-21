import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { VerifySearch } from "@/components/VerifySearch";

export const metadata: Metadata = {
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

        <Section
          title="How verification works"
          exclusive
          lead="Public certificate verification is a CBMS addition — it is not part of the DILG LGUSS-BIMS record system it accompanies."
        >
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
                The result reveals the certificate type, reference number, issuing barangay and
                dates — plus the holder&apos;s initials. Never the full name, address or any other
                personal detail.
              </p>
            </div>
          </div>

          <div className="site-privacy" style={{ marginTop: 20 }}>
            <span className="site-privacy__icon" aria-hidden="true">
              🔒
            </span>
            <div>
              <strong>Why initials only?</strong> A verification code can be seen by anyone holding
              the paper, so the check must not become a way to look people up. Showing only
              initials lets you confirm the certificate in front of you matches its holder, without
              turning this page into a public register of residents. This follows the Data Privacy
              Act of 2012 (RA 10173) principle of proportionality.
            </div>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
