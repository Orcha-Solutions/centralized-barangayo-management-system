import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { VerifySearch } from "./components/VerifySearch";
import { BarangayDirectory } from "./components/BarangayDirectory";
import { MARIKINA_BARANGAYS } from "./data";

export default function PortalLandingPage() {
  return (
    <div className="site-page">
      <SiteHeader />

      <main id="main" className="site-body">
        <section className="site-hero">
          <div className="site-wrap">
            <div className="site-hero__grid">
              <div>
                <span className="site-hero__eyebrow">OFFICIAL BARANGAY PORTAL</span>
                <h1 className="site-hero__title">
                  Every barangay service, fee and peso — in the open.
                </h1>
                <p className="site-hero__sub">
                  Browse the official website of any barangay: announcements, the published fee
                  schedule, the enacted budget, development projects, ordinances and officials.
                  You can also check whether a barangay certificate is genuine in seconds.
                </p>
                <div className="site-hero__meta">
                  <span>🏛️ Published under the DILG Full Disclosure Policy</span>
                  <span>🔓 No login required</span>
                </div>
              </div>

              <div>
                <VerifySearch variant="hero" />
              </div>
            </div>
          </div>
        </section>

        <section className="site-section site-section--tint">
          <div className="site-wrap">
            <div className="site-note site-note--info">
              <strong>CBMS is a companion, not a replacement.</strong> The Centralized Barangay
              Management System runs alongside the DILG-mandated LGUSS-BIMS (DILG Memorandum
              Circular 2025-104). The official record of residents, certificates and cases is held
              in LGUSS-BIMS; this portal publishes what the public has a right to see and adds
              services BIMS does not offer, such as public certificate verification.
            </div>
          </div>
        </section>

        <section className="site-section" id="directory">
          <div className="site-wrap">
            <div className="site-section__head">
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 className="site-section__title">Barangay directory</h2>
                <div className="site-section__rule" />
              </div>
            </div>
            <p className="site-section__lead">
              Select a barangay to open its official website, transparency board and community
              concerns map.
            </p>

            <BarangayDirectory items={MARIKINA_BARANGAYS} />
          </div>
        </section>

        <section className="site-section site-section--tint">
          <div className="site-wrap">
            <div className="site-section__head">
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 className="site-section__title">What you can do here</h2>
                <div className="site-section__rule" />
              </div>
            </div>
            <div className="site-cards">
              <div className="site-card">
                <p className="site-card__name">✅ Verify a certificate</p>
                <p className="site-card__city" style={{ marginTop: 8 }}>
                  Confirm a barangay clearance or certificate is genuine, still valid and really
                  issued by the barangay named on it. Only the holder&apos;s initials are shown.
                </p>
              </div>
              <div className="site-card">
                <p className="site-card__name">📊 Open transparency</p>
                <p className="site-card__city" style={{ marginTop: 8 }}>
                  Inspect enacted ordinances, the annual financial ledger, approved development
                  projects and citizen feedback scorecards.
                </p>
              </div>
              <div className="site-card">
                <p className="site-card__name">📣 Report a community concern</p>
                <p className="site-card__city" style={{ marginTop: 8 }}>
                  Submit streetlighting, garbage, noise or public safety concerns directly to the
                  barangay tanod and watch resolution progress.
                </p>
              </div>
              <a href="/portal/guide" className="site-card" style={{ textDecoration: "none", color: "inherit" }}>
                <p className="site-card__name">📖 Operations Manual</p>
                <p className="site-card__city" style={{ marginTop: 8 }}>
                  Review statutory SOPs, DILG MC 2025-104 standards, Katarungang Pambarangay conciliation clocks, and public service charters.
                </p>
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
