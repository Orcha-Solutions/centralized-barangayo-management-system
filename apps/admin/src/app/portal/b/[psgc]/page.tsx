import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "../../components/SiteFooter";
import { MARIKINA_BARANGAYS } from "../../data";

type Params = { psgc: string };

export default async function BarangayPublicSite({ params }: { params: Promise<Params> }) {
  const { psgc } = await params;
  const b = MARIKINA_BARANGAYS.find((x) => x.psgcCode === psgc || x.id === psgc);

  if (!b) notFound();

  return (
    <div className="site-page">
      <SiteHeader title={`Barangay ${b.name}`} subtitle={b.city.name} sealText={b.name} />

      <main id="main" className="site-body">
        {/* Barangay Hero */}
        <section
          className="site-hero"
          style={
            {
              "--brand": b.brandPrimary,
              "--brand-accent": b.brandAccent,
            } as React.CSSProperties
          }
        >
          <div className="site-wrap">
            <span className="site-hero__eyebrow">Official Barangay Website</span>
            <h1 className="site-hero__title">Welcome to Barangay {b.name}</h1>
            <p className="site-hero__sub">
              Official citizen portal for announcements, transparency disclosures, citizen charter
              fees, and community services.
            </p>
            <div className="site-hero__meta">
              <span>📍 {b.addressLine}</span>
              {b.contactPhone && <span>📞 {b.contactPhone}</span>}
              {b.contactEmail && <span>✉️ {b.contactEmail}</span>}
              <span>🏛️ Operating in {b.mode === "companion" ? "DILG Companion" : "Standalone"} Mode</span>
            </div>
            {b.hotline && (
              <div className="site-hotline">
                <span aria-hidden="true">🚨</span>
                <div>
                  <small>Emergency Tanod Radio Hotline</small>
                  <span>{b.hotline}</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Sub-nav */}
        <div className="site-subnav">
          <div className="site-subnav__inner">
            <a className="site-subnav__link" href="#announcements">
              Announcements
            </a>
            <a className="site-subnav__link" href="#services">
              Fees & Requirements
            </a>
            <a className="site-subnav__link" href="#transparency">
              Full Disclosure Board
            </a>
            <a className="site-subnav__link" href="#officials">
              Barangay Council
            </a>
            <Link className="site-subnav__link" href="/portal/verify">
              Verify Certificate
            </Link>
          </div>
        </div>

        {/* Announcements */}
        <section className="site-section" id="announcements">
          <div className="site-wrap">
            <div className="site-section__head">
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 className="site-section__title">Latest Announcements</h2>
                <div className="site-section__rule" />
              </div>
            </div>
            <div className="site-news">
              <div className="site-news__item">
                <span className="site-news__date">September 12, 2026</span>
                <h3 className="site-news__title">
                  Oplan Kalinisan & Anti-Dengue Fogging Drive across Purok 1 to 6
                </h3>
                <p className="site-news__excerpt">
                  The Barangay Disaster Risk Reduction and Management Council (BDRRMC) in
                  coordination with BHWs will conduct localized misting and declogging operations
                  starting this Saturday at 6:00 AM.
                </p>
              </div>
              <div className="site-news__item">
                <span className="site-news__date">September 05, 2026</span>
                <h3 className="site-news__title">
                  Notice of Katarungang Pambarangay (KP) Conciliation Schedule
                </h3>
                <p className="site-news__excerpt">
                  Regular hearing sessions by the Lupon Tagapamayapa are held every Tuesday and
                  Thursday at 2:00 PM at the Barangay Hall Hearing Room.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services & Fees */}
        <section className="site-section site-section--tint" id="services">
          <div className="site-wrap">
            <div className="site-section__head">
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 className="site-section__title">Citizen&apos;s Charter — Fees & Document Clearances</h2>
                <div className="site-section__rule" />
              </div>
            </div>
            <p className="site-section__lead">
              Statutory fees and requirements prescribed under Barangay Tax Ordinance. Clearances
              can be verified using our online QR system.
            </p>

            <div className="site-fees">
              <div className="site-fee">
                <div className="site-fee__head">
                  <h3 className="site-fee__name">Barangay Clearance (Local Employment)</h3>
                  <span className="site-fee__price">₱100.00</span>
                  <span className="site-fee__validity">Valid 6 months</span>
                </div>
                <ul className="site-fee__reqs">
                  <li>Valid Government-issued ID or PhilSys Card</li>
                  <li>Proof of residency (Purok certification or utility bill)</li>
                  <li>Cedula (Community Tax Certificate)</li>
                </ul>
              </div>

              <div className="site-fee">
                <div className="site-fee__head">
                  <h3 className="site-fee__name">Certificate of Indigency (Public Assistance)</h3>
                  <span className="site-fee__price site-fee__price--free">FREE</span>
                  <span className="site-fee__validity">Valid 3 months</span>
                </div>
                <div className="site-fee__exempt">
                  Exempt from statutory fees under RA 11261 (First Time Jobseekers Act) & DSWD
                  Assistance to Individuals in Crisis Situations (AICS).
                </div>
                <ul className="site-fee__reqs">
                  <li>Case study recommendation or endorsement from Purok Leader</li>
                  <li>Valid ID of applicant</li>
                </ul>
              </div>

              <div className="site-fee">
                <div className="site-fee__head">
                  <h3 className="site-fee__name">Barangay Business Clearance</h3>
                  <span className="site-fee__price">₱500.00</span>
                  <span className="site-fee__validity">Annual renewal</span>
                </div>
                <ul className="site-fee__reqs">
                  <li>DTI or SEC Certificate of Registration</li>
                  <li>Locational / zoning approval</li>
                  <li>Contract of Lease or Land Title</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Transparency Board */}
        <section className="site-section" id="transparency">
          <div className="site-wrap">
            <div className="site-section__head">
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 className="site-section__title">DILG Full Disclosure Transparency Board</h2>
                <div className="site-section__rule" />
              </div>
            </div>
            <p className="site-section__lead">
              Financial and procurement statements posted in accordance with DILG Memorandum
              Circular No. 2022-027.
            </p>

            <div className="site-figures">
              <div className="site-figure">
                <div className="site-figure__label">Annual National Tax Allotment (NTA)</div>
                <div className="site-figure__value">₱34,500,000</div>
                <div className="site-figure__hint">FY 2026 Certified Internal Revenue Share</div>
              </div>
              <div className="site-figure site-figure--muted">
                <div className="site-figure__label">BDRRM Disaster Fund (5%)</div>
                <div className="site-figure__value">₱1,725,000</div>
                <div className="site-figure__hint">Quick Response & Mitigation</div>
              </div>
              <div className="site-figure site-figure--muted">
                <div className="site-figure__label">Gender & Development (GAD 5%)</div>
                <div className="site-figure__value">₱1,725,000</div>
                <div className="site-figure__hint">Safe Spaces & Women&apos;s Desk Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Officials */}
        <section className="site-section site-section--tint" id="officials">
          <div className="site-wrap">
            <div className="site-section__head">
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 className="site-section__title">Barangay Council (Sangguniang Barangay)</h2>
                <div className="site-section__rule" />
              </div>
            </div>

            <div className="site-officials">
              <div className="site-official">
                <div className="site-official__avatar">PB</div>
                <div>
                  <div className="site-official__name">Hon. Manuel S. Torres</div>
                  <div className="site-official__pos">Punong Barangay</div>
                </div>
              </div>
              <div className="site-official">
                <div className="site-official__avatar">K1</div>
                <div>
                  <div className="site-official__name">Hon. Elena V. Cruz</div>
                  <div className="site-official__pos">Kagawad — Committee on Peace & Order</div>
                </div>
              </div>
              <div className="site-official">
                <div className="site-official__avatar">K2</div>
                <div>
                  <div className="site-official__name">Hon. Ricardo M. Santos</div>
                  <div className="site-official__pos">Kagawad — Committee on Appropriations</div>
                </div>
              </div>
              <div className="site-official">
                <div className="site-official__avatar">SK</div>
                <div>
                  <div className="site-official__name">Hon. Chloe Jane De Leon</div>
                  <div className="site-official__pos">SK Chairperson</div>
                </div>
              </div>
              <div className="site-official">
                <div className="site-official__avatar">SEC</div>
                <div>
                  <div className="site-official__name">Maria Lourdes Bautista</div>
                  <div className="site-official__pos">Barangay Secretary</div>
                </div>
              </div>
              <div className="site-official">
                <div className="site-official__avatar">TRE</div>
                <div>
                  <div className="site-official__name">Ferdinand P. Ramos</div>
                  <div className="site-official__pos">Barangay Treasurer</div>
                </div>
              </div>
            </div>

            <p style={{ marginTop: 24 }}>
              <Link href="/portal" style={{ color: "var(--site-navy)", fontWeight: 700 }}>
                ← Back to All Barangays
              </Link>
            </p>
          </div>
        </section>
      </main>

      <SiteFooter
        barangayName={b.name}
        cityName={b.city.name}
        addressLine={b.addressLine}
        contactPhone={b.contactPhone}
        contactEmail={b.contactEmail}
      />
    </div>
  );
}
