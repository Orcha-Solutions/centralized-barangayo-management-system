"use client";

import * as React from "react";
import { date, fullName } from "@cbms/ui";
import type { CertificateRequest, CertificateDocument } from "../../../../lib/types";

export interface PrintableCertificateProps {
  certificate: CertificateRequest;
  document?: CertificateDocument | null;
}

export function PrintableCertificate({ certificate, document }: PrintableCertificateProps) {
  const residentName = certificate.inhabitant
    ? fullName(certificate.inhabitant as any)
    : "Registered Resident";

  const title = (
    document?.title ||
    certificate.type?.name ||
    "Barangay Clearance"
  ).toUpperCase();

  const issueDate = certificate.issuedAt || certificate.approvedAt || certificate.createdAt;
  const expiryDate = certificate.expiresAt;
  const verifyCode = certificate.verifyCode || document?.verifyCode || `BCMS-${certificate.referenceNo}`;
  const orNumber = certificate.orNumber || document?.orNumber || "Exempt / Waived";

  return (
    <div className="cbms-certificate-printable-wrap">
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .cbms-certificate-sheet, .cbms-certificate-sheet * {
            visibility: visible !important;
          }
          .cbms-certificate-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 1.5cm !important;
            box-shadow: none !important;
            border: 2px solid #000 !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
          .adm-noprint, button, nav, aside, header {
            display: none !important;
          }
        }
      `}</style>

      <div
        className="cbms-certificate-sheet"
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          border: "2px solid #1e293b",
          padding: "2.5rem 3rem",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          fontFamily: "'Times New Roman', Times, serif",
          color: "#0f172a",
          lineHeight: 1.6,
          position: "relative",
        }}
      >
        {/* Letterhead Header */}
        <div
          style={{
            textAlign: "center",
            borderBottom: "2px double #0f172a",
            paddingBottom: "1.25rem",
            marginBottom: "1.75rem",
            position: "relative",
          }}
        >
          <div style={{ fontSize: "0.85rem", letterSpacing: "1px", textTransform: "uppercase" }}>
            Republic of the Philippines
          </div>
          <div style={{ fontSize: "0.95rem", fontWeight: "bold" }}>
            City of Marikina · Metro Manila
          </div>
          <div style={{ fontSize: "1.3rem", fontWeight: "bold", letterSpacing: "1.5px", marginTop: "0.2rem" }}>
            BARANGAY BARANGKA
          </div>
          <div style={{ fontSize: "0.85rem", fontStyle: "italic", marginTop: "0.25rem", color: "#334155" }}>
            OFFICE OF THE PUNONG BARANGAY
          </div>
        </div>

        {/* Certificate Title */}
        <div style={{ textAlign: "center", margin: "2rem 0 2rem 0" }}>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: "bold",
              letterSpacing: "2.5px",
              margin: 0,
              textDecoration: "underline",
              textUnderlineOffset: "6px",
            }}
          >
            {title}
          </h1>
          <div style={{ fontSize: "0.85rem", marginTop: "0.5rem", fontWeight: 600, color: "#475569" }}>
            CONTROL NO: <span style={{ fontFamily: "monospace", letterSpacing: "1px" }}>{certificate.referenceNo}</span>
          </div>
        </div>

        {/* Salutation */}
        <div style={{ fontSize: "1.05rem", fontWeight: "bold", marginBottom: "1.25rem" }}>
          TO WHOM IT MAY CONCERN:
        </div>

        {/* Certification Body */}
        <div style={{ fontSize: "1.05rem", textAlign: "justify", textIndent: "2rem", marginBottom: "1.25rem" }}>
          This is to certify that <strong>{residentName}</strong>, of legal age, Filipino citizen, is a bona fide resident of Barangay Barangka, Marikina City, with verified residential record on file in the Barangay Inhabitants Registry (BIMS / RBI).
        </div>

        <div style={{ fontSize: "1.05rem", textAlign: "justify", textIndent: "2rem", marginBottom: "1.25rem" }}>
          Based on the records of this office and verified clearances, the above-named individual has no pending derogatory record, blotter incident report, nor unresolved complaint pending before the Lupong Tagapamayapa of this barangay.
        </div>

        <div style={{ fontSize: "1.05rem", textAlign: "justify", textIndent: "2rem", marginBottom: "2rem" }}>
          This certification is issued upon the request of the interested party for the statutory purpose of: <strong>{certificate.purpose}</strong>, and for whatever legal intent it may serve.
        </div>

        <div style={{ fontSize: "1.05rem", textAlign: "justify", textIndent: "2rem", marginBottom: "2.5rem" }}>
          Issued this <strong>{date(issueDate)}</strong> at Barangay Barangka, City of Marikina, Philippines, valid until <strong>{expiryDate ? date(expiryDate) : "six (6) months from issuance"}</strong>.
        </div>

        {/* Signatures & Seal Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            marginTop: "3rem",
            alignItems: "flex-end",
          }}
        >
          {/* Left Column: Applicant Signature & Thumbmark */}
          <div>
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-end" }}>
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  border: "1px dashed #64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.65rem",
                  color: "#64748b",
                  textAlign: "center",
                  padding: "0.25rem",
                }}
              >
                RIGHT THUMBMARK
              </div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ borderBottom: "1px solid #000", height: "45px" }} />
                <div style={{ fontSize: "0.78rem", fontWeight: "bold", marginTop: "0.25rem" }}>
                  Applicant Signature
                </div>
              </div>
            </div>

            <div style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "#475569" }}>
              <div>OR No.: <strong>{orNumber}</strong></div>
              <div>Fee: <strong>₱{Number(certificate.fee).toFixed(2)}</strong></div>
              <div>Doc Stamp: <strong>PAID / EXEMPT</strong></div>
            </div>
          </div>

          {/* Right Column: Punong Barangay Signature */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: "bold", fontSize: "1.1rem", textDecoration: "underline" }}>
              HON. RICARDO A. DELA ROSA
            </div>
            <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#1e293b" }}>
              Punong Barangay
            </div>
            <div style={{ fontSize: "0.75rem", fontStyle: "italic", color: "#64748b" }}>
              Barangay Barangka, Marikina City
            </div>

            <div
              style={{
                width: "90px",
                height: "90px",
                border: "2px double #94a3b8",
                borderRadius: "50%",
                margin: "1rem auto 0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.65rem",
                color: "#64748b",
                textAlign: "center",
              }}
            >
              BARANGAY<br />DRY SEAL
            </div>
          </div>
        </div>

        {/* Security & Verification Footer */}
        <div
          style={{
            borderTop: "1px dashed #cbd5e1",
            marginTop: "2.5rem",
            paddingTop: "0.75rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.72rem",
            color: "#64748b",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div>
            🔒 Security Verification Code: <strong style={{ color: "#0369a1" }}>{verifyCode}</strong>
            <div style={{ fontSize: "0.68rem" }}>
              Any alteration or erasure invalidates this document. RA 11032 statutory compliance.
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            CBMS Digital Verification System
          </div>
        </div>
      </div>
    </div>
  );
}
