import Link from "next/link";

/**
 * Government utility strip + masthead. Server component — no interactivity.
 */
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
          <Link
            href={homeHref}
            className="site-seal"
            aria-label={`${title} — home`}
          >
            {sealText.slice(0, 4).toUpperCase()}
          </Link>
          <div className="site-masthead__titles">
            <p className="site-masthead__title">{title}</p>
            <p className="site-masthead__sub">{subtitle}</p>
          </div>
          <span className="site-masthead__spacer" />
          <nav className="site-nav" aria-label="Primary">
            <Link className="site-nav__link" href="/">
              Barangay directory
            </Link>
            <Link className="site-nav__link site-nav__link--cta" href="/verify">
              Verify a certificate
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
