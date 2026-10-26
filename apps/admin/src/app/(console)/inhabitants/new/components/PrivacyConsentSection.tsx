"use client";

import * as React from "react";
import { Alert, Panel } from "@cbms/ui";

interface PrivacyConsentSectionProps {
  privacyConsent: boolean;
  onConsentChange: (consent: boolean) => void;
  busy: boolean;
}

export function PrivacyConsentSection({
  privacyConsent,
  onConsentChange,
  busy,
}: PrivacyConsentSectionProps) {
  return (
    <>
      <Panel title="Part 5: Data Privacy Act of 2012 Certification & Consent">
        <div className="adm-muted" style={{ marginBottom: 12 }}>
          Statutory compliance per RA 10173 and Section 394(d)(6) of RA 7160
        </div>
        <Alert tone="info">
          📜 <strong>Privacy Notice</strong>: The Barangay collects this personal information
          to establish and maintain an updated Record of Barangay Inhabitants (RBI) as
          mandated under Section 394(d)(6) of the Local Government Code of 1991 (RA 7160). All
          data is encrypted and securely processed pursuant to Republic Act No. 10173 (Data
          Privacy Act of 2012) and DILG Memorandum Circular No. 2025-104.
        </Alert>
        <div style={{ marginTop: 12 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: busy ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            <input
              type="checkbox"
              checked={privacyConsent}
              disabled={busy}
              onChange={(e) => onConsentChange(e.target.checked)}
              required
            />
            I certify that all information provided is true and correct, and consent to its
            encoding in the DILG LGUSS-BIMS.
          </label>
        </div>
      </Panel>

      <div className="adm-row" style={{ marginTop: 20 }}>
        <button
          type="submit"
          disabled={busy}
          className="cbms-btn cbms-btn--primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            cursor: busy ? "not-allowed" : "pointer",
            opacity: busy ? 0.85 : 1,
            minWidth: 240,
            justifyContent: "center",
          }}
        >
          {busy ? (
            <>
              <svg
                style={{
                  width: 15,
                  height: 15,
                  animation: "cbms-spin 0.75s linear infinite",
                  flexShrink: 0,
                }}
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeOpacity="0.3"
                />
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Encoding into BIMS…</span>
            </>
          ) : (
            <span>💾 Save and Encode Inhabitant</span>
          )}
        </button>
        <span className="adm-muted">
          All fields align with DILG BIMS Form A2 standards.
        </span>
      </div>
    </>
  );
}
