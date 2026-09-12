"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApi, post, DILG_CAUSE_OF_DEATH_CATEGORIES } from "@cbms/api-client";
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

export default function InhabitantDetailPage() {
  const { can } = useConsole();
  const mayEncode = can("inhabitants:encode") || can("inhabitants:edit");
  const params = useParams();
  const router = useRouter();
  const id = String((params as Record<string, string | string[]>)?.id ?? "");

  const inh = useApi<InhabitantDetail>(id ? `/inhabitants/${id}` : null);
  const p = inh.data;
  const household = useApi<Household>(p?.householdId ? `/households/${p.householdId}` : null);

  // Deceased Modal (BIMS Form A3)
  const [showDeceasedModal, setShowDeceasedModal] = React.useState(false);
  const [deceasedDate, setDeceasedDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [immediateCause, setImmediateCause] = React.useState("");
  const [underlyingCause, setUnderlyingCause] = React.useState(DILG_CAUSE_OF_DEATH_CATEGORIES[0]);
  const [deceasedConsent, setDeceasedConsent] = React.useState(true);
  const [deceasedBusy, setDeceasedBusy] = React.useState(false);
  const [deceasedError, setDeceasedError] = React.useState<string | null>(null);

  const completeness = p?.completeness ?? 0;
  const tone = completeness >= 80 ? "green" : completeness >= 50 ? "gold" : "red";

  async function submitDeceased(e: React.FormEvent) {
    e.preventDefault();
    if (!deceasedConsent) {
      setDeceasedError("Consent is required under RA 10173.");
      return;
    }
    setDeceasedBusy(true);
    setDeceasedError(null);
    try {
      await post(`/inhabitants/${id}/deceased`, {
        dateOfDeath: deceasedDate,
        immediateCause,
        underlyingCause,
      });
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
          </div>
        }
      />

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
                      ["Mobile Number", p.contactPhone ?? "—"],
                      ["Email Address", p.contactEmail ?? "—"],
                      ["Telephone", p.telephoneNumber ?? "—"],
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
      {showDeceasedModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setShowDeceasedModal(false)}
        >
          <div
            style={{
              backgroundColor: "var(--color-bg-card, #ffffff)",
              borderRadius: "0.5rem",
              padding: "1.5rem",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#ef4444" }}>
              ✝ Deceased Profile (BIMS Form A3)
            </h3>
            <p style={{ margin: "0 0 1rem 0", fontSize: "0.85rem", color: "#64748b" }}>
              Record death certificate details for {p ? fullName(p) : "Inhabitant"} per DILG BIMS standard.
            </p>

            {deceasedError && <Alert tone="danger">{deceasedError}</Alert>}

            <form onSubmit={submitDeceased} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Field label="Date of Death">
                <input
                  className="cbms-input"
                  type="date"
                  value={deceasedDate}
                  onChange={(e) => setDeceasedDate(e.target.value)}
                  required
                />
              </Field>

              <Field label="Immediate Cause of Death" hint='As declared in death certificate (e.g. "Heart Attack")'>
                <input
                  className="cbms-input"
                  value={immediateCause}
                  onChange={(e) => setImmediateCause(e.target.value)}
                  placeholder="e.g. Cardiopulmonary Arrest"
                  required
                />
              </Field>

              <Field label="Underlying Cause of Death (DILG Classification)">
                <select
                  className="cbms-select"
                  value={underlyingCause}
                  onChange={(e) => setUnderlyingCause(e.target.value)}
                  required
                >
                  {DILG_CAUSE_OF_DEATH_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </Field>

              <div style={{ marginTop: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem" }}>
                  <input
                    type="checkbox"
                    checked={deceasedConsent}
                    onChange={(e) => setDeceasedConsent(e.target.checked)}
                    required
                  />
                  I certify that the above information is accurate and verified with civil registry records.
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                <button
                  type="button"
                  className="cbms-btn"
                  onClick={() => setShowDeceasedModal(false)}
                >
                  Cancel
                </button>
                <Button type="submit" variant="danger" disabled={deceasedBusy}>
                  {deceasedBusy ? "Saving…" : "Confirm Deceased Record"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
