import Link from "next/link";
import { MockBanner } from "@cbms/ui";

const DEFAULT_NOTICE =
  "Published under the DILG Full Disclosure Policy. Official barangay records are maintained in DILG's LGUSS-BIMS.";

/**
 * Footer. `notice` comes straight from the API payload so each barangay's
 * own disclosure wording is what the public sees.
 */
export function SiteFooter({
  notice,
  barangayName,
  cityName,
  addressLine,
  contactPhone,
  contactEmail,
  psgc,
}: {
  notice?: string | null;
  barangayName?: string | null;
  cityName?: string | null;
  addressLine?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  psgc?: string | null;
}) {
  const year = 2026;
  return (
    <footer className="site-footer">
      <div className="site-wrap">
        <div className="site-footer__grid">
          <div>
            <h2>{barangayName ? `Barangay ${barangayName}` : "About this portal"}</h2>
            {barangayName ? (
              <>
                {cityName && <p style={{ margin: "0 0 6px" }}>{cityName}</p>}
                {addressLine && <p style={{ margin: "0 0 6px" }}>{addressLine}</p>}
                {contactPhone && (
                  <p style={{ margin: "0 0 6px" }}>
                    Tel: <a href={`tel:${contactPhone.replace(/[^\d+]/g, "")}`}>{contactPhone}</a>
                  </p>
                )}
                {contactEmail && (
                  <p style={{ margin: 0 }}>
                    Email: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                  </p>
                )}
              </>
            ) : (
              <p style={{ margin: 0 }}>
                The public face of the Centralized Barangay Management System — a{" "}
                <strong style={{ color: "#fff" }}>companion</strong> to the DILG-mandated
                LGUSS-BIMS (DILG MC 2025-104), never a replacement for it.
              </p>
            )}
          </div>

          <div>
            <h2>Services</h2>
            <ul>
              <li>
                <Link href="/verify">Verify a certificate</Link>
              </li>
              {psgc && (
                <>
                  <li>
                    <Link href={`/b/${psgc}#services`}>Fees &amp; requirements</Link>
                  </li>
                  <li>
                    <Link href={`/b/${psgc}#transparency`}>Transparency board</Link>
                  </li>
                  <li>
                    <Link href={`/b/${psgc}/concerns`}>Community concerns map</Link>
                  </li>
                </>
              )}
              <li>
                <Link href="/">All barangays</Link>
              </li>
            </ul>
          </div>

          <div>
            <h2>Data protection</h2>
            <ul>
              <li>Data Privacy Act of 2012 (RA 10173)</li>
              <li>Ease of Doing Business Act (RA 11032)</li>
              <li>Katarungang Pambarangay (RA 7160, Ch. 7)</li>
              <li>Certificate checks reveal initials only</li>
            </ul>
          </div>
        </div>

        <div className="site-footer__notice">{notice || DEFAULT_NOTICE}</div>

        <div className="site-footer__legal">
          <span>
            &copy; {year} {barangayName ? `Barangay ${barangayName}` : "CBMS"}
            {cityName ? `, ${cityName}` : ""}. All rights reserved.
          </span>
          <span>No login is required to view anything on this site.</span>
        </div>
      </div>
      <MockBanner />
    </footer>
  );
}
