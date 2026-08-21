import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { VerifySearch } from "@/components/VerifySearch";

export default function NotFound() {
  return (
    <div className="site-page">
      <SiteHeader />

      <main id="main" className="site-body">
        <section className="site-hero">
          <div className="site-wrap">
            <span className="site-hero__eyebrow">Error 404</span>
            <h1 className="site-hero__title">We could not find that page.</h1>
            <p className="site-hero__sub">
              The barangay you asked for may not be published on this portal, or the address may
              have been mistyped. Check the PSGC code in the link, or start again from the barangay
              directory.
            </p>
            <p style={{ marginTop: 20 }}>
              <Link className="site-nav__link site-nav__link--cta" href="/">
                ← Back to the barangay directory
              </Link>
            </p>
          </div>
        </section>

        <section className="site-section">
          <div className="site-wrap" style={{ maxWidth: 620 }}>
            <VerifySearch variant="inline" />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
