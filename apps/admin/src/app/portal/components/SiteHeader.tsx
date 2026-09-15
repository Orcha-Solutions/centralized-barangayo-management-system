import Link from "next/link";

export function SiteHeader({
  sealText = "CBMS",
  title = "Barangay Public Portal",
  subtitle = "Centralized Barangay Management System",
  homeHref = "/",
}: {
  sealText?: string;
  title?: string;
  subtitle?: string;
  homeHref?: string;
}) {
  return (
    <>
      <div className="site-govbar">
        <div className="site-govbar__inner">
          <span className="site-govbar__flag" aria-hidden="true">
            <i />
            <i />
          </span>
          <strong>Republic of the Philippines</strong>
          <span className="site-govbar__spacer" />
          <span className="site-govbar__note">
            Published under the DILG Full Disclosure Policy
          </span>
        </div>
      </div>

      <header className="site-masthead">
        <div className="site-masthead__inner">
          <Link href={homeHref} className="site-seal" aria-label={`${title} — home`}>
            {sealText.slice(0, 4).toUpperCase()}
          </Link>
          <div className="site-masthead__titles">
            <p className="site-masthead__title">{title}</p>
            <p className="site-masthead__sub">{subtitle}</p>
          </div>
          <span className="site-masthead__spacer" />
          <nav className="site-nav" aria-label="Primary">
            <Link
              className="site-nav__link"
              href="/citizen"
              style={{
                fontWeight: 700,
                color: "var(--site-navy)",
                background: "rgba(37, 99, 235, 0.08)",
                borderRadius: 6,
                padding: "6px 12px",
              }}
            >
              Inhabitant Hub 👥
            </Link>
            <Link className="site-nav__link" href="/#directory">
              Barangay directory
            </Link>
            <Link className="site-nav__link site-nav__link--cta" href="/portal/verify">
              Verify a certificate
            </Link>
            <Link
              className="site-nav__link"
              href="/login"
              style={{
                marginLeft: 6,
                background: "#eef3fc",
                color: "var(--site-navy)",
                border: "1px solid #c9d8f3",
              }}
            >
              Staff Console 🔐
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
