"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApi, post, del, DILG_CAUSE_OF_DEATH_CATEGORIES } from "@cbms/api-client";
import {
  Alert,
  Button,
  Chip,
  DataTable,
  Field,
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
import { useConsole } from "../../../../components/Shell";
import type { Household, InhabitantDetail } from "../../../../lib/types";
import { formatPhilippineMobile } from "../../../../lib/validation";
import { DeleteInhabitantModal } from "./edit/components/DeleteInhabitantModal";
import { DeceasedModal } from "./components/DeceasedModal";

export default function InhabitantDetailPage() {
  const { can } = useConsole();
  const mayEncode = can("inhabitants:encode") || can("inhabitants:edit");
  const params = useParams();
  const router = useRouter();
  const id = String((params as Record<string, string | string[]>)?.id ?? "");

  const inh = useApi<InhabitantDetail>(id ? `/inhabitants/${id}` : null);
  const p = inh.data;
  const household = useApi<Household>(p?.householdId ? `/households/${p.householdId}` : null);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteBusy, setDeleteBusy] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  async function handleDelete() {
    if (deleteBusy) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await del(`/inhabitants/${id}`);
      setShowDeleteModal(false);
      router.push("/inhabitants");
    } catch (err: any) {
      setDeleteError(err?.message ?? "Could not delete inhabitant.");
    } finally {
      setDeleteBusy(false);
    }
  }

  // Deceased Modal (BIMS Form A3)
  const [showDeceasedModal, setShowDeceasedModal] = React.useState(false);
  const [deceasedBusy, setDeceasedBusy] = React.useState(false);
  const [deceasedError, setDeceasedError] = React.useState<string | null>(null);

  const completeness = p?.completeness ?? 0;
  const tone = completeness >= 80 ? "green" : completeness >= 50 ? "gold" : "red";

  async function submitDeceased(data: {
    dateOfDeath: string;
    immediateCause: string;
    underlyingCause: string;
  }) {
    setDeceasedBusy(true);
    setDeceasedError(null);
    try {
      await post(`/inhabitants/${id}/deceased`, data);
      setShowDeceasedModal(false);
      inh.reload();
    } catch (err: any) {
      setDeceasedError(err?.message ?? "Could not record deceased profile.");
    } finally {
      setDeceasedBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title={p ? fullName(p) : "Inhabitant"}
        subtitle={p ? `DILG BIMS Individual Profile (Form A2) · ${p.household?.addressLine ?? "No address on file"}` : ""}
        breadcrumb="Residents / Inhabitants"
        parity="BIPS Form A2"
        actions={
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="button" className="cbms-btn" onClick={() => router.push("/inhabitants")}>
              ← Back to list
            </button>
            {p && !p.isDeceased && mayEncode && (
              <button
                type="button"
                className="cbms-btn"
                onClick={() => setShowDeceasedModal(true)}
                style={{ color: "#ef4444" }}
              >
                ✝ Mark as Deceased (Form A3)
              </button>
            )}
            {mayEncode && (
              <button 
                type="button" 
                className="cbms-btn cbms-btn--primary" 
                onClick={() => router.push(`/inhabitants/${id}/edit`)}
              >
                ✏️ Edit profile
              </button>
            )}
            {mayEncode && (
              <button
                type="button"
                className="cbms-btn"
                onClick={() => setShowDeleteModal(true)}
                style={{ color: "var(--cbms-red, #ce1126)" }}
              >
                🗑️ Delete profile
              </button>
            )}
          </div>
        }
      />

      {deleteError && <Alert tone="danger">{deleteError}</Alert>}
      <Async loading={inh.loading} error={inh.error}>
        {!p ? (
          <EmptyNote>Record not found.</EmptyNote>
        ) : (
          <div className="adm-stack">
            {p.isDeceased && (
              <Alert tone="danger">
                ✝ <strong>DECEASED INHABITANT</strong> — Marked as deceased per DILG BIMS Form A3 on {date(p.birthDate)}.
              </Alert>
            )}

            <div className="cbms-grid-2">
              <Panel title="Part 1 & 3: Identity & Demographics (Form A2)">
                <KeyValue
                  items={[
                    ["Full Name", fullName(p)],
                    ["PhilSys Card (PCN)", p.philsysNo ? <Chip tone="green">{p.philsysNo}</Chip> : <span className="adm-muted">Not captured</span>],
                    ["Resident Type", titleize(p.residentType ?? "Non-migrant")],
                    ["Sex / Gender", `${titleize(p.sex)} · Gender: ${titleize(p.gender ?? p.sex)}`],
                    ["Age / Birth Date", `${age(p.birthDate) ?? "—"} years old (${date(p.birthDate)})`],
                    ["Place of Birth", p.birthPlace ?? "—"],
                    ["Mother's Residence at Birth", p.residenceMotherAtBirth ?? "—"],
                    ["Civil Status", titleize(p.civilStatus ?? "")],
                    ["Blood Type", p.bloodType ?? "—"],
                    ["Height / Weight", `${p.height ? `${p.height} m` : "—"} · ${p.weight ? `${p.weight} kg` : "—"}`],
                    ["Complexion", titleize(p.complexion ?? "Medium")],
                    ["Nationality", titleize(p.nationality ?? "Filipino")],
                    ["Ethnicity (Form 1.A)", p.ethnicity ?? "Tagalog"],
                    ["Religion", p.religion ?? "Roman Catholic"],
                    ["Mother's Maiden Name", `${p.mothersMaidenFirstName ?? ""} ${p.mothersMaidenMiddleName ?? ""} ${p.mothersMaidenLastName ?? ""}`.trim() || "—"],
                    ["Record Source", <SourceChip key="src" source={p.source} />],
                  ]}
                />
              </Panel>

              <div className="adm-stack">
                <Panel title="Profile Completeness & BIMS Sectoral Flags">
                  <Progress
                    value={completeness}
                    tone={tone}
                    label={`${completeness}% of DILG BIMS Form A2 fields are captured.`}
                  />
                  <div style={{ marginTop: 14 }}>
                    <div className="cbms-label">Sectoral & Beneficiary Profile (Form A2 Part 4)</div>
                    <SectorChips row={p} />
                    {p.govAssistance && (
                      <div style={{ marginTop: 8 }}>
                        <Chip tone="gold">🏛️ Beneficiary: {p.govAssistance}</Chip>
                      </div>
                    )}
                  </div>
                </Panel>

                <Panel title="Contact, Occupation & Voter Registry">
                  <KeyValue
                    items={[
                      [
                        "Mobile Number",
                        p.contactPhone ? (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <a
                              href={`tel:${p.contactPhone.replace(/[^0-9+]/g, "")}`}
                              style={{
                                color: "var(--cbms-primary, #0038a8)",
                                textDecoration: "underline",
                                fontWeight: 600,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                              title="Click to call mobile number"
                            >
                              📱 {formatPhilippineMobile(p.contactPhone)}
                            </a>
                            <a
                              href={`sms:${p.contactPhone.replace(/[^0-9+]/g, "")}`}
                              className="cbms-chip"
                              style={{
                                fontSize: 11,
                                padding: "2px 8px",
                                textDecoration: "none",
                                cursor: "pointer",
                                backgroundColor: "rgba(0, 56, 168, 0.08)",
                                color: "var(--cbms-primary, #0038a8)",
                                border: "1px solid rgba(0, 56, 168, 0.2)",
                                borderRadius: 12,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 3,
                              }}
                              title="Click to send SMS message"
                            >
                              💬 SMS
                            </a>
                          </div>
                        ) : (
                          <span className="adm-muted">Not provided</span>
                        ),
                      ],
                      [
                        "Email Address",
                        p.contactEmail ? (
                          <a
                            href={`mailto:${p.contactEmail}`}
                            style={{
                              color: "var(--cbms-primary, #0038a8)",
                              textDecoration: "underline",
                              fontWeight: 500,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                            title="Click to send email"
                          >
                            ✉️ {p.contactEmail}
                          </a>
                        ) : (
                          <span className="adm-muted">Not provided</span>
                        ),
                      ],
                      [
                        "Telephone",
                        p.telephoneNumber ? (
                          <a
                            href={`tel:${p.telephoneNumber.replace(/[^0-9+]/g, "")}`}
                            style={{
                              color: "var(--cbms-primary, #0038a8)",
                              textDecoration: "underline",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            ☎️ {p.telephoneNumber}
                          </a>
                        ) : (
                          "—"
                        ),
                      ],
                      ["Occupation", p.occupation ?? "—"],
                      ["Education Level", p.educationLevel ?? "—"],
                      ["Monthly Income", p.monthlyIncome ? peso(p.monthlyIncome * 100) : "—"],
                      ["Registered Voter", p.isRegisteredVoter ? `Yes (Last voted: ${p.lastVotedYear ?? "2025"})` : "No"],
                      ["Resident Voter", p.isResidentVoter ? "Yes" : "No"],
                    ]}
                  />
                </Panel>

                <Panel title="E-wallet">
                  {p.wallet ? (
                    <KeyValue
                      items={[
                        ["Balance", <strong key="b">{peso(p.wallet.balanceCentavos)}</strong>],
                        ["Status", <StatusChip key="s" status={p.wallet.status} />],
                        ["KYC Tier", <StatusChip key="k" status={p.wallet.kycTier} />],
                        ["EMI Account", p.wallet.emiAccountRef],
                      ]}
                    />
                  ) : (
                    <EmptyNote>
                      No wallet on file. Disbursements to this resident fall back to over-the-counter release.
                    </EmptyNote>
                  )}
                </Panel>
              </div>
            </div>

            <Panel title="Household Affiliation (BIMS Form A1)" padded={false}>
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
                      · {household.data?.householdName ?? "Household"} · Purok {household.data?.purok ?? p.household?.purok ?? "—"} ·{" "}
                      {household.data?.addressLine ?? p.household?.addressLine ?? ""}
                    </span>
                  </div>
                  <DataTable
                    columns={[
                      { key: "name", header: "Member", render: (m) => fullName(m) },
                      {
                        key: "rel",
                        header: "DILG Relation Code",
                        render: (m) => `Code ${m.relationToHead ?? "1"} · ${titleize(m.relationToHead ?? "")}`,
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

            <Panel title="Recent Certificate Requests (BIMS Form B2)" padded={false}>
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
              <Panel title="Consent Records (RA 10173)" padded={false}>
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

              <Panel title="Residency Movements & History" padded={false}>
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
          </div>
        )}
      </Async>

      {/* Deceased Modal Form A3 */}
      <DeceasedModal
        open={showDeceasedModal}
        name={p ? fullName(p) : "Inhabitant"}
        busy={deceasedBusy}
        error={deceasedError}
        onClose={() => setShowDeceasedModal(false)}
        onSubmit={submitDeceased}
      />
      <DeleteInhabitantModal
        open={showDeleteModal}
        busy={deleteBusy}
        expectedName={p ? fullName(p) : ""}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
