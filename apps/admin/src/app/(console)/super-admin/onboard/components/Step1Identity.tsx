"use client";

import * as React from "react";
import Link from "next/link";
import { Button, Field, Panel } from "@cbms/ui";
import type { DbMode, SubdomainAvailability } from "../types";

interface Step1IdentityProps {
  brgyName: string;
  onNameChange: (val: string) => void;
  brgyCode: string;
  setBrgyCode: (val: string) => void;
  subdomain: string;
  setSubdomain: (val: string) => void;
  checkingSubdomain: boolean;
  subdomainStatus: SubdomainAvailability | null;
  psgcCode: string;
  setPsgcCode: (val: string) => void;
  cityId: string;
  setCityId: (val: string) => void;
  dbMode: DbMode;
  setDbMode: (val: DbMode) => void;
  customDomain: string;
  setCustomDomain: (val: string) => void;
  onNext: () => void;
}

export function Step1Identity(props: Step1IdentityProps) {
  const isNextDisabled =
    !props.brgyName.trim() ||
    !props.subdomain.trim() ||
    props.subdomainStatus?.available === false;

  return (
    <Panel title="Step 1 — Barangay Identity, PSGC & Multi-Tenant Routing">
      <div className="cbms-grid-2" style={{ gap: 14 }}>
        <Field
          label="Official Barangay Name"
          hint="Enter the barangay name (e.g., San Isidro, Sta. Teresita)."
        >
          <input
            className="cbms-input"
            placeholder="e.g. San Isidro"
            value={props.brgyName}
            onChange={(e) => props.onNameChange(e.target.value)}
            required
          />
        </Field>

        <Field
          label="Official Tenant Code"
          hint="Unique uppercase identifier used in audit trails and statutory exports."
        >
          <input
            className="cbms-input"
            placeholder="e.g. SAN_ISIDRO"
            value={props.brgyCode}
            onChange={(e) => props.setBrgyCode(e.target.value.toUpperCase())}
            required
          />
        </Field>

        <Field
          label="Subdomain Slug (<subdomain>.cbms.gov.ph)"
          hint="Checked live against GET /api/tenants/check-availability."
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              className="cbms-input"
              placeholder="sanisidro"
              value={props.subdomain}
              onChange={(e) =>
                props.setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
              }
              required
            />
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#475569",
                whiteSpace: "nowrap",
              }}
            >
              .cbms.gov.ph
            </span>
          </div>
          {props.checkingSubdomain && (
            <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: 4 }}>
              Checking availability…
            </div>
          )}
          {props.subdomainStatus && !props.checkingSubdomain && (
            <div style={{ marginTop: 4 }}>
              {props.subdomainStatus.available ? (
                <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 700 }}>
                  ✓ Subdomain &apos;{props.subdomainStatus.subdomain}.cbms.gov.ph&apos; is available
                </span>
              ) : (
                <span style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 700 }}>
                  ✗ {props.subdomainStatus.reason || "Subdomain is already claimed"}
                </span>
              )}
            </div>
          )}
        </Field>

        <Field
          label="Philippine Standard Geographic Code (PSGC)"
          hint="9-digit statutory geo-code issued by PSA / DILG."
        >
          <input
            className="cbms-input"
            placeholder="137402017"
            value={props.psgcCode}
            onChange={(e) => props.setPsgcCode(e.target.value)}
          />
        </Field>

        <Field
          label="Parent City / Municipality ID"
          hint="Bound LGU governing this Barangay."
        >
          <input
            className="cbms-input"
            placeholder="city-marikina"
            value={props.cityId}
            onChange={(e) => props.setCityId(e.target.value)}
          />
        </Field>

        <Field
          label="Multi-Tenant Database Isolation Mode"
          hint="Configures physical data partitioning."
        >
          <select
            className="cbms-select"
            value={props.dbMode}
            onChange={(e) => props.setDbMode(e.target.value as DbMode)}
          >
            <option value="shared_db">
              Shared PostgreSQL DB with Row-Level Security (Standard)
            </option>
            <option value="isolated_schema">
              Isolated PostgreSQL Schema Namespace (High Performance)
            </option>
            <option value="dedicated_db">
              Dedicated High-Security PostgreSQL Instance (Enterprise)
            </option>
          </select>
        </Field>

        <Field
          label="Custom Domain Alias (Optional)"
          hint="e.g. portal.sanisidro-marikina.ph"
        >
          <input
            className="cbms-input"
            placeholder="portal.sanisidro-marikina.ph"
            value={props.customDomain}
            onChange={(e) => props.setCustomDomain(e.target.value)}
          />
        </Field>
      </div>

      <div
        style={{
          marginTop: 18,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link href="/super-admin" className="cbms-btn cbms-btn--secondary">
          ← Cancel
        </Link>
        <Button
          type="button"
          variant="primary"
          disabled={isNextDisabled}
          onClick={props.onNext}
        >
          Next: Executive Leadership →
        </Button>
      </div>
    </Panel>
  );
}
