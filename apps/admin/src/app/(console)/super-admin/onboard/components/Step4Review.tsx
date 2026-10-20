"use client";

import * as React from "react";
import Link from "next/link";
import { Alert, Button, Chip, KeyValue, Panel } from "@cbms/ui";
import { ROLE_LABELS } from "../../../../../lib/labels";
import type { DbMode, LeadershipMode, ProvisionedDossier } from "../types";

interface Step4ReviewProps {
  brgyName: string;
  brgyCode: string;
  subdomain: string;
  psgcCode: string;
  dbMode: DbMode;
  leadershipMode: LeadershipMode;
  execName: string;
  execEmail: string;
  execRole: string;
  inviteEmail: string;
  inviteRole: string;
  purokCount: number;
  clearanceFee: number;
  businessClearanceFee: number;
  provisioning: boolean;
  dossier: ProvisionedDossier | null;
  onBack: () => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function Step4Review(props: Step4ReviewProps) {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  function copyText(key: string, value: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  }

  const title = props.dossier
    ? `✅ Official Onboarding Handover Dossier — Barangay ${props.dossier.tenant.name}`
    : "Step 4 — Review & Execute Multi-Tenant Provisioning";

  return (
    <Panel title={title}>
      {!props.dossier ? (
        <>
          <p className="cbms-page-sub" style={{ marginBottom: 14 }}>
            Verify the parameters below. Clicking{" "}
            <strong>Provision Barangay Workspace Now</strong> will create the tenant in
            PostgreSQL (<code>POST /api/tenants</code>), bind the executive account, and
            generate the onboarding handover package.
          </p>

          <div className="cbms-grid-2" style={{ gap: 16, marginBottom: 18 }}>
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: 14,
                background: "#f8fafc",
              }}
            >
              <h4 style={{ margin: "0 0 10px", color: "#0f172a" }}>
                🏛️ Tenant & Routing Specification
              </h4>
              <KeyValue
                items={[
                  ["Barangay Name", props.brgyName || "—"],
                  ["Tenant Code", props.brgyCode || "—"],
                  ["Target Tenant ID", `tnt-${props.subdomain || "new"}`],
                  ["Subdomain", `${props.subdomain || "new"}.cbms.gov.ph`],
                  ["PSGC Code", props.psgcCode || "—"],
                  ["Database Mode", props.dbMode],
                ]}
              />
            </div>

            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: 14,
                background: "#f8fafc",
              }}
            >
              <h4 style={{ margin: "0 0 10px", color: "#0f172a" }}>
                👤 Leadership & Statutory Defaults
              </h4>
              <KeyValue
                items={[
                  ["Onboarding Strategy", props.leadershipMode.toUpperCase()],
                  [
                    "Primary Official",
                    `${props.execName || "Punong Barangay"} (${props.execEmail || "—"})`,
                  ],
                  ["Primary Role", ROLE_LABELS[props.execRole] ?? props.execRole],
                  [
                    "Secondary Invite",
                    props.leadershipMode === "both"
                      ? `${props.inviteEmail} (${props.inviteRole})`
                      : "None",
                  ],
                  ["Territorial Puroks", `${props.purokCount} Puroks`],
                  [
                    "Clearance / Business Fee",
                    `₱${props.clearanceFee} / ₱${props.businessClearanceFee}`,
                  ],
                ]}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button type="button" onClick={props.onBack}>
              ← Back: Statutory Defaults
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={props.provisioning || !props.brgyName.trim() || !props.subdomain.trim()}
              onClick={props.onSubmit}
            >
              {props.provisioning
                ? "Provisioning Tenant & Accounts…"
                : "🚀 Provision Barangay Workspace Now"}
            </Button>
          </div>
        </>
      ) : (
        <div>
          <Alert tone="info">
            <strong>Barangay {props.dossier.tenant.name}</strong> is now live in PostgreSQL!
            Share the credentials or single-use invitation link below with the Barangay
            leadership, or return to the Barangays fleet list.
          </Alert>

          <div className="cbms-grid-2" style={{ gap: 16, marginTop: 16 }}>
            <div
              style={{
                border: "1px solid #bbf7d0",
                borderRadius: 10,
                padding: 16,
                background: "#f0fdf4",
              }}
            >
              <h4 style={{ margin: "0 0 10px", color: "#14532d" }}>
                🏛️ Provisioned Tenant Metadata
              </h4>
              <KeyValue
                items={[
                  ["Tenant ID", <code key="tid">{props.dossier.tenant.id}</code>],
                  ["Barangay ID", <code key="bid">{props.dossier.tenant.barangayId}</code>],
                  ["Official Name", `Barangay ${props.dossier.tenant.name}`],
                  [
                    "Subdomain Portal",
                    <code key="sub">https://{props.dossier.tenant.subdomain}.cbms.gov.ph</code>,
                  ],
                  ["PSGC Code", props.dossier.tenant.psgcCode || "137402017"],
                  [
                    "Tenancy Mode",
                    <Chip key="mode" tone="green">
                      {props.dossier.tenant.mode}
                    </Chip>,
                  ],
                ]}
              />
            </div>

            <div
              style={{
                border: "1px solid #bfdbfe",
                borderRadius: 10,
                padding: 16,
                background: "#eff6ff",
              }}
            >
              <h4 style={{ margin: "0 0 10px", color: "#1e3a8a" }}>
                🔐 Executive Access & Handover Credentials
              </h4>
              {props.dossier.primaryMember ? (
                <KeyValue
                  items={[
                    ["Official Name", props.dossier.primaryMember.name],
                    [
                      "Login Email",
                      <code key="em">{props.dossier.primaryMember.email}</code>,
                    ],
                    [
                      "Assigned Role",
                      <Chip key="rl" tone="navy">
                        {ROLE_LABELS[props.dossier.primaryMember.role] ??
                          props.dossier.primaryMember.role}
                      </Chip>,
                    ],
                    [
                      "Temporary Password",
                      <code key="pw">{props.dossier.primaryMember.tempPassword}</code>,
                    ],
                    ["CRUD Privileges", "✓ Create · ✓ Read · ✓ Update · ✓ Delete"],
                  ]}
                />
              ) : (
                <p style={{ fontSize: "0.82rem", color: "#1e3a8a" }}>
                  Token-only onboarding selected. Use the invitation link below to activate
                  the primary account.
                </p>
              )}

              {props.dossier.inviteLink && (
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: "1px solid #bfdbfe",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.76rem",
                      fontWeight: 700,
                      color: "#1e3a8a",
                      marginBottom: 4,
                    }}
                  >
                    ✉️ 7-Day Single-Use Onboarding Link ({props.dossier.inviteEmail} ·{" "}
                    {props.dossier.inviteRole}):
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      background: "#ffffff",
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid #93c5fd",
                    }}
                  >
                    <code
                      style={{
                        fontSize: "0.74rem",
                        wordBreak: "break-all",
                        flex: 1,
                        color: "#1d4ed8",
                      }}
                    >
                      {props.dossier.inviteLink}
                    </code>
                    <Button
                      size="sm"
                      type="button"
                      onClick={() => copyText("invite", props.dossier!.inviteLink!)}
                    >
                      {copiedKey === "invite" ? "✓ Copied" : "Copy Link"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            <Button type="button" onClick={props.onReset}>
              ➕ Onboard Another Barangay
            </Button>

            <Link href="/super-admin" className="cbms-btn cbms-btn--primary">
              ✓ Done (Go to Barangays List) →
            </Link>
          </div>
        </div>
      )}
    </Panel>
  );
}
