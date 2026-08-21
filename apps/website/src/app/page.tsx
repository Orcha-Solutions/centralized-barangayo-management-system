import { Alert } from "@cbms/ui";
import { fetchBarangays } from "@/lib/api";
import { BarangayDirectory } from "@/components/BarangayDirectory";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { VerifySearch } from "@/components/VerifySearch";

/** Always rendered on demand — the build must never call the API. */
export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const res = await fetchBarangays();
  const items = res.ok ? (res.data.items ?? []) : [];

  return (
    <div className="site-page">
      <SiteHeader />

      <main id="main" className="site-body">
        <section className="site-hero">
          <div className="site-wrap">
            <div className="site-hero__grid">
              <div>
                <span className="site-hero__eyebrow">Official barangay portal</span>
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

            {!res.ok ? (
              <Alert tone="danger">
                <div>
                  <strong>The barangay directory is temporarily unavailable.</strong>
                  <div style={{ marginTop: 4, fontSize: 12.5 }}>{res.message}</div>
                </div>
              </Alert>
            ) : items.length === 0 ? (
              <div className="site-empty">No barangays have been published yet.</div>
            ) : (
              <BarangayDirectory items={items} />
            )}
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
                <p className="site-card__name">🧾 Check the real fee before you queue</p>
                <p className="site-card__city" style={{ marginTop: 8 }}>
                  Every barangay publishes its certificate fees, requirements and legal exemptions.
                  If someone asks for more than the published amount, that is a fixer.
                </p>
              </div>
              <div className="site-card">
                <p className="site-card__name">💰 Follow the money</p>
                <p className="site-card__city" style={{ marginTop: 8 }}>
                  The enacted annual budget, the SK fund and every development project with its
                  status and completion percentage.
                </p>
              </div>
              <div className="site-card">
                <p className="site-card__name">📍 See what neighbours are reporting</p>
                <p className="site-card__city" style={{ marginTop: 8 }}>
                  A privacy-safe map of community concerns by purok and category. Counts only —
                  never names, addresses or photos.
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
