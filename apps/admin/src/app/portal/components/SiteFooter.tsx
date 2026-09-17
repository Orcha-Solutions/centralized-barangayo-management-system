import Link from "next/link";
import { MockBanner } from "@cbms/ui";

export function SiteFooter({
  barangayName,
  cityName = "City of Marikina",
  addressLine,
  contactPhone,
  contactEmail,
}: {
  barangayName?: string | null;
  cityName?: string | null;
  addressLine?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
}) {
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
            <h2>Services & Transparency</h2>
            <ul>
              <li>
                <Link href="/citizen">Inhabitant Hub 👥</Link>
              </li>
              <li>
                <Link href="/portal/verify">Certificate QR Verification</Link>
              </li>
              <li>
                <Link href="/#directory">Barangay Directory</Link>
              </li>
              <li>
                <Link href="/portal/guide">Operations Manual & SOPs</Link>
              </li>
              <li>
                <Link href="/login">Staff Console Portal</Link>
              </li>
              <li>
                <a href="https://dilg.gov.ph" target="_blank" rel="noreferrer">
                  DILG Official Portal ↗
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2>Statutory Standard</h2>
            <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6 }}>
              Published in compliance with the <strong>DILG Full Disclosure Policy (FDP)</strong>{" "}
              and the Data Privacy Act of 2012 (RA 10173). Aggregate records only — personal data
              is protected.
            </p>
          </div>
        </div>

        <div className="site-footer__notice">
          Published under the DILG Full Disclosure Policy. Official barangay records are maintained
          in DILG&apos;s LGUSS-BIMS.
        </div>

        <div className="site-footer__legal">
          <span>© 2026 Centralized Barangay Management System (CBMS)</span>
          <span>Republic of the Philippines</span>
        </div>
      </div>
      <MockBanner />
    </footer>
  );
}
