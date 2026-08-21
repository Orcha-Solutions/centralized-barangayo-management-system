"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@cbms/api-client";
import {
  Chip,
  DataTable,
  KeyValue,
  PageHead,
  Panel,
  StatusChip,
  age,
  date,
  dateTime,
  fullName,
  peso,
  titleize,
} from "@cbms/ui";
import { Async, EmptyNote, Progress, SectorChips, SourceChip } from "../../../../components/common";
import type { Household, InhabitantDetail } from "../../../../lib/types";

export default function InhabitantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String((params as Record<string, string | string[]>)?.id ?? "");

  const inh = useApi<InhabitantDetail>(id ? `/inhabitants/${id}` : null);
  const p = inh.data;
  const household = useApi<Household>(p?.householdId ? `/households/${p.householdId}` : null);

  const completeness = p?.completeness ?? 0;
  const tone = completeness >= 80 ? "green" : completeness >= 50 ? "gold" : "red";

  return (
    <>
      <PageHead
        title={p ? fullName(p) : "Inhabitant"}
        subtitle={p ? `Resident profile · ${p.household?.addressLine ?? "No address on file"}` : ""}
        breadcrumb="Residents / Inhabitants"
        parity="BIPS"
        actions={
          <button type="button" className="cbms-btn" onClick={() => router.push("/inhabitants")}>
            ← Back to list
          </button>
        }
      />

      <Async loading={inh.loading} error={inh.error}>
        {!p ? (
          <EmptyNote>Record not found.</EmptyNote>
        ) : (
          <div className="adm-stack">
            <div className="cbms-grid-2">
              <Panel title="Identity">
                <KeyValue
                  items={[
                    ["Full name", fullName(p)],
                    ["Sex / Age", `${titleize(p.sex)} · ${age(p.birthDate) ?? "—"} years old`],
                    ["Birth date", date(p.birthDate)],
                    ["Birth place", p.birthPlace ?? "—"],
                    ["Civil status", titleize(p.civilStatus ?? "")],
                    ["Citizenship", p.citizenship ?? "—"],
                    ["PhilSys number", p.philsysNo ?? "Not captured"],
                    ["Contact", p.contactPhone ?? "—"],
                    ["Email", p.contactEmail ?? "—"],
                    ["Relation to head", titleize(p.relationToHead ?? "")],
                    ["Record source", <SourceChip key="src" source={p.source} />],
                  ]}
                />
              </Panel>

              <div className="adm-stack">
                <Panel title="Profile completeness">
                  <Progress
                    value={completeness}
                    tone={tone}
                    label={`${completeness}% of the RBI fields are captured (PhilSys, contact, occupation, education, religion, blood type, birth place, household, photo).`}
                  />
                  <div style={{ marginTop: 14 }}>
                    <div className="cbms-label">Sectoral registry</div>
                    <SectorChips row={p} />
                  </div>
                </Panel>

                <Panel title="Socioeconomic">
                  <KeyValue
                    items={[
                      ["Occupation", p.occupation ?? "—"],
                      ["Education", p.educationLevel ?? "—"],
                      ["Religion", p.religion ?? "—"],
                      ["Blood type", p.bloodType ?? "—"],
                      ["Registered voter", p.isVoter ? "Yes" : "No"],
                      ["OFW", p.isOfw ? "Yes" : "No"],
                    ]}
                  />
                </Panel>

                <Panel title="E-wallet">
                  {p.wallet ? (
                    <KeyValue
                      items={[
                        ["Balance", <strong key="b">{peso(p.wallet.balanceCentavos)}</strong>],
                        ["Status", <StatusChip key="s" status={p.wallet.status} />],
                        ["KYC tier", <StatusChip key="k" status={p.wallet.kycTier} />],
                        ["EMI account", p.wallet.emiAccountRef],
                      ]}
                    />
                  ) : (
                    <EmptyNote>
                      No wallet on file. Disbursements to this resident fall back to
                      over-the-counter release.
                    </EmptyNote>
                  )}
                </Panel>
              </div>
            </div>

            <Panel title="Household" padded={false}>
              {!p.householdId ? (
                <EmptyNote>This resident is not attached to a household folder.</EmptyNote>
              ) : (
                <Async loading={household.loading} error={household.error}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--cbms-line)" }}>
                    <Link
                      href={`/households/${p.householdId}`}
                      className="adm-strong"
                      style={{ textDecoration: "underline" }}
                    >
                      {household.data?.householdNo ?? p.household?.householdNo ?? "Household"}
                    </Link>
                    <span className="adm-muted">
                      {" "}
                      · Purok {household.data?.purok ?? p.household?.purok ?? "—"} ·{" "}
                      {household.data?.addressLine ?? p.household?.addressLine ?? ""}
                    </span>
                  </div>
                  <DataTable
                    columns={[
                      { key: "name", header: "Member", render: (m) => fullName(m) },
                      {
                        key: "rel",
                        header: "Relation",
                        render: (m) => titleize(m.relationToHead ?? ""),
                      },
                      {
                        key: "age",
                        header: "Age / Sex",
                        render: (m) => `${age(m.birthDate) ?? "—"} · ${m.sex === "male" ? "M" : "F"}`,
                      },
                      { key: "sect", header: "Sectoral", render: (m) => <SectorChips row={m} /> },
                    ]}
                    rows={household.data?.members ?? []}
                    empty="No other members recorded."
                    onRowClick={(m) => router.push(`/inhabitants/${m.id}`)}
                  />
                </Async>
              )}
            </Panel>

            <Panel title="Recent certificate requests" padded={false}>
              <DataTable
                columns={[
                  { key: "referenceNo", header: "Reference" },
                  { key: "type", header: "Type", render: (r) => r.type?.name ?? "—" },
                  { key: "purpose", header: "Purpose" },
                  { key: "status", header: "Status", render: (r) => <StatusChip status={r.status} /> },
                  { key: "createdAt", header: "Filed", render: (r) => date(r.createdAt) },
                ]}
                rows={p.certificateRequests ?? []}
                empty="No certificate requests on record."
                onRowClick={(r) => router.push(`/certificates/${r.id}`)}
              />
            </Panel>

            <div className="cbms-grid-2">
              <Panel title="Consent records (RA 10173)" padded={false}>
                <DataTable
                  columns={[
                    { key: "purpose", header: "Purpose", render: (c) => titleize(c.purpose) },
                    { key: "status", header: "Status", render: (c) => <StatusChip status={c.status} /> },
                    { key: "grantedBy", header: "Signed by" },
                    { key: "grantedAt", header: "Granted", render: (c) => date(c.grantedAt) },
                  ]}
                  rows={p.household?.consents ?? []}
                  empty="No consent on file for this household."
                />
              </Panel>

              <Panel title="Residency history" padded={false}>
                <DataTable
                  columns={[
                    { key: "effectiveAt", header: "Effective", render: (r) => date(r.effectiveAt) },
                    { key: "addressLine", header: "Address", render: (r) => r.addressLine ?? "—" },
                    { key: "note", header: "Note", render: (r) => r.note ?? "—" },
                  ]}
                  rows={p.residencyHistory ?? []}
                  empty="No residency movements recorded."
                />
              </Panel>
            </div>

            <Panel title="Digital ID">
              {p.digitalId ? (
                <div className="adm-row">
                  <Chip tone="green">Issued</Chip>
                  <span className="adm-muted">
                    Issued {p.digitalId.issuedAt ? dateTime(p.digitalId.issuedAt) : "—"}
                  </span>
                </div>
              ) : (
                <EmptyNote>No barangay digital ID issued yet.</EmptyNote>
              )}
            </Panel>
          </div>
        )}
      </Async>
    </>
  );
}
