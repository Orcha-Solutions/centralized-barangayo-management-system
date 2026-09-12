"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ApiError,
  post,
  DILG_RELATIONSHIP_CODES,
  DILG_INCOME_SOURCE_CODES,
  DILG_REASONS_FOR_LEAVING,
  DILG_REASONS_FOR_TRANSFERRING,
} from "@cbms/api-client";
import {
  Alert,
  Button,
  Field,
  PageHead,
  Panel,
} from "@cbms/ui";
import { ActionResult } from "../../../../components/common";
import type { Household } from "../../../../lib/types";

interface HouseholdMemberInput {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  relationToHead: string; // DILG Code 1 to 26
  incomeSource: string; // DILG Code 1 to 8
  monthlyIncome: string;
}

interface MigrantInput {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  previousResidence: string;
  stayPreviousYears: string;
  stayPreviousMonths: string;
  reasonForLeaving: string; // DILG Codes 1-16
  transferDate: string;
  reasonForTransferring: string; // DILG Codes 1-5
  stayCurrentYears: string;
  stayCurrentMonths: string;
  intentionToReturn: boolean;
}

export default function NewHouseholdPage() {
  const router = useRouter();

  // Part 1: Location & Metrics
  const [locationForm, setLocationForm] = React.useState({
    householdNo: `HH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    region: "National Capital Region (NCR)",
    province: "Metro Manila",
    cityMunicipality: "Marikina City",
    barangay: "Barangka",
    sitioPurok: "Purok 1",
    houseNo: "",
    blockNo: "",
    lotNo: "",
    street: "",
    subdivision: "",
    buildingName: "",
    zipCode: "1803",
    numFamilies: "1",
    numMembers: "1",
    numMigrants: "0",
  });

  // Part 2: Structure, Tenure & Income
  const [structureForm, setStructureForm] = React.useState({
    householdName: "",
    householdType: "nuclear",
    tenureStatus: "owner",
    housingUnit: "single_house",
    monthlyIncome: "35000",
  });

  // Part 2: Household Members Roster (Ordered Sequence per DILG Form A1)
  const [members, setMembers] = React.useState<HouseholdMemberInput[]>([
    {
      firstName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      relationToHead: "1",
      incomeSource: "1",
      monthlyIncome: "35000",
    },
  ]);

  // Part 3: Migrant Information (DILG Form A1 Part 3)
  const [migrants, setMigrants] = React.useState<MigrantInput[]>([]);

  // Compliance
  const [privacyConsent, setPrivacyConsent] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  function addMember() {
    setMembers((prev) => [
      ...prev,
      {
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        relationToHead: prev.length === 1 ? "2a" : "3",
        incomeSource: "1",
        monthlyIncome: "0",
      },
    ]);
  }

  function removeMember(index: number) {
    if (members.length === 1) return;
    setMembers((prev) => prev.filter((_, i) => i !== index));
  }

  function updateMember(index: number, key: keyof HouseholdMemberInput, value: string) {
    setMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [key]: value } : m))
    );
  }

  function addMigrant() {
    setMigrants((prev) => [
      ...prev,
      {
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        previousResidence: "",
        stayPreviousYears: "1",
        stayPreviousMonths: "0",
        reasonForLeaving: "1",
        transferDate: new Date().toISOString().split("T")[0],
        reasonForTransferring: "1",
        stayCurrentYears: "0",
        stayCurrentMonths: "6",
        intentionToReturn: false,
      },
    ]);
  }

  function removeMigrant(index: number) {
    setMigrants((prev) => prev.filter((_, i) => i !== index));
  }

  function updateMigrant(index: number, key: keyof MigrantInput, value: any) {
    setMigrants((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [key]: value } : m))
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!privacyConsent) {
      setError("Data Privacy consent must be granted per RA 10173.");
      return;
    }
    setBusy(true);
    setError(null);

    const addressParts: string[] = [];
    if (locationForm.houseNo) addressParts.push(`#${locationForm.houseNo}`);
    if (locationForm.blockNo) addressParts.push(`Blk ${locationForm.blockNo}`);
    if (locationForm.lotNo) addressParts.push(`Lot ${locationForm.lotNo}`);
    if (locationForm.street) addressParts.push(locationForm.street);
    if (locationForm.subdivision) addressParts.push(locationForm.subdivision);
    if (locationForm.sitioPurok) addressParts.push(locationForm.sitioPurok);

    const addressLine = addressParts.join(", ") || `${locationForm.sitioPurok}, ${locationForm.barangay}`;

    const payload = {
      householdNo: locationForm.householdNo,
      householdName: structureForm.householdName || `${members[0]?.lastName || "Barangay"} Residence`,
      householdType: structureForm.householdType,
      tenureStatus: structureForm.tenureStatus,
      housingUnit: structureForm.housingUnit,
      monthlyIncome: parseFloat(structureForm.monthlyIncome) || 0,
      numFamilies: parseInt(locationForm.numFamilies) || 1,
      numMembers: members.length,
      numMigrants: migrants.length,
      purok: locationForm.sitioPurok,
      houseNo: locationForm.houseNo || undefined,
      blockNo: locationForm.blockNo || undefined,
      lotNo: locationForm.lotNo || undefined,
      street: locationForm.street || undefined,
      subdivision: locationForm.subdivision || undefined,
      buildingName: locationForm.buildingName || undefined,
      zipCode: locationForm.zipCode,
      addressLine,
      members: members.map((m) => ({
        firstName: m.firstName.trim(),
        middleName: m.middleName.trim() || undefined,
        lastName: m.lastName.trim(),
        suffix: m.suffix.trim() || undefined,
        relationToHead: m.relationToHead,
        incomeSource: m.incomeSource,
        monthlyIncome: parseFloat(m.monthlyIncome) || 0,
      })),
      migrants: migrants.map((m) => ({
        firstName: m.firstName.trim(),
        middleName: m.middleName.trim() || undefined,
        lastName: m.lastName.trim(),
        suffix: m.suffix.trim() || undefined,
        previousResidence: m.previousResidence.trim(),
        stayPreviousYears: parseInt(m.stayPreviousYears) || 0,
        stayPreviousMonths: parseInt(m.stayPreviousMonths) || 0,
        reasonForLeaving: m.reasonForLeaving,
        transferDate: m.transferDate,
        reasonForTransferring: m.reasonForTransferring,
        stayCurrentYears: parseInt(m.stayCurrentYears) || 0,
        stayCurrentMonths: parseInt(m.stayCurrentMonths) || 0,
        intentionToReturn: m.intentionToReturn,
      })),
    };

    try {
      const created = await post<Household>("/households", payload);
      router.push(`/households/${created.id}`);
    } catch (err) {
      const e = err as ApiError;
      setError(e?.message ?? "Could not register household.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title="Household Profile (BIMS Form A1)"
        subtitle="Standardized Records of Barangay Inhabitants by Household compliant with DILG MC No. 2025-104."
        breadcrumb="Residents / Households / New"
        parity="BIPS Form A1"
        actions={
          <button type="button" className="cbms-btn" onClick={() => router.push("/households")}>
            Cancel
          </button>
        }
      />

      <ActionResult error={error} />

      <form onSubmit={submit}>
        {/* Part 1: Location & Metrics */}
        <Panel title="Part 1: Location & Household Metrics" subtitle="Geographic boundaries and household composition numbers">
          <div className="adm-form-grid">
            <Field label="Household Number (Auto/System)">
              <input
                className="cbms-input"
                value={locationForm.householdNo}
                onChange={(e) => setLocationForm((f) => ({ ...f, householdNo: e.target.value }))}
                required
              />
            </Field>

            <Field label="Sitio / Purok">
              <select
                className="cbms-select"
                value={locationForm.sitioPurok}
                onChange={(e) => setLocationForm((f) => ({ ...f, sitioPurok: e.target.value }))}
              >
                {["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>

            <Field label="House / Lot / Block No.">
              <input
                className="cbms-input"
                value={locationForm.houseNo}
                onChange={(e) => setLocationForm((f) => ({ ...f, houseNo: e.target.value }))}
                placeholder="e.g. Block 5 Lot 3"
              />
            </Field>

            <Field label="Street Name">
              <input
                className="cbms-input"
                value={locationForm.street}
                onChange={(e) => setLocationForm((f) => ({ ...f, street: e.target.value }))}
                placeholder="e.g. Sampaguita St."
                required
              />
            </Field>

            <Field label="Subdivision / Village">
              <input
                className="cbms-input"
                value={locationForm.subdivision}
                onChange={(e) => setLocationForm((f) => ({ ...f, subdivision: e.target.value }))}
                placeholder="e.g. Greenfields Subdivision"
              />
            </Field>

            <Field label="Zip Code">
              <input
                className="cbms-input"
                value={locationForm.zipCode}
                onChange={(e) => setLocationForm((f) => ({ ...f, zipCode: e.target.value }))}
              />
            </Field>

            <Field label="No. of Families in Household">
              <input
                className="cbms-input"
                type="number"
                min="1"
                value={locationForm.numFamilies}
                onChange={(e) => setLocationForm((f) => ({ ...f, numFamilies: e.target.value }))}
                required
              />
            </Field>
          </div>
        </Panel>

        <div style={{ height: 16 }} />

        {/* Part 2: Structure, Tenure & Monthly Income */}
        <Panel title="Part 2: Structure, Tenure & Housing Profile" subtitle="Household head responsibility and socio-economic category">
          <div className="adm-form-grid">
            <Field label="Household Name / Label" hint='e.g. "Dela Cruz Family" or "Dela Cruz Residence"'>
              <input
                className="cbms-input"
                value={structureForm.householdName}
                onChange={(e) => setStructureForm((f) => ({ ...f, householdName: e.target.value }))}
                placeholder="Dela Cruz Family"
                required
              />
            </Field>

            <Field label="Household Type">
              <select
                className="cbms-select"
                value={structureForm.householdType}
                onChange={(e) => setStructureForm((f) => ({ ...f, householdType: e.target.value }))}
              >
                <option value="nuclear">Nuclear Family (Father, Mother, unmarried children)</option>
                <option value="extended">Extended Family (With married children, grandparents, relatives)</option>
                <option value="single_parent">Single / Solo Parent Family</option>
                <option value="childless">Childless Family</option>
                <option value="blended">Blended / Stepfamily</option>
                <option value="single_person">Single Person Household</option>
                <option value="non_related">Non-related Family (Students/Workers cohabiting)</option>
                <option value="others">Others</option>
              </select>
            </Field>

            <Field label="Tenure Status">
              <select
                className="cbms-select"
                value={structureForm.tenureStatus}
                onChange={(e) => setStructureForm((f) => ({ ...f, tenureStatus: e.target.value }))}
              >
                <option value="owner">Owner (Legal possession/claims ownership of housing unit & lot)</option>
                <option value="renter">Renter (Pays rent for house/room)</option>
                <option value="others">Others</option>
              </select>
            </Field>

            <Field label="Housing Unit">
              <select
                className="cbms-select"
                value={structureForm.housingUnit}
                onChange={(e) => setStructureForm((f) => ({ ...f, housingUnit: e.target.value }))}
              >
                <option value="single_house">Single House</option>
                <option value="duplex">Duplex</option>
                <option value="townhouse_rowhouse">Townhouse / Rowhouse</option>
                <option value="condominium">Condominium</option>
                <option value="apartment">Apartment</option>
                <option value="others">Others</option>
              </select>
            </Field>

            <Field label="Total Monthly Household Income (₱)" hint="Sum of all working members">
              <input
                className="cbms-input"
                type="number"
                value={structureForm.monthlyIncome}
                onChange={(e) => setStructureForm((f) => ({ ...f, monthlyIncome: e.target.value }))}
                placeholder="50000"
                required
              />
            </Field>
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>
                  👥 List of Household Members (Ordered Sequence per Form A1)
                </h4>
                <span className="adm-muted" style={{ fontSize: "0.8rem" }}>
                  1. Head → 2. Spouse → 3. Never-married children → 4. Married children & families → 5. Relatives → 6. Non-relatives
                </span>
              </div>
              <button type="button" className="cbms-btn cbms-btn--sm" onClick={addMember}>
                ➕ Add Member
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: "var(--color-bg-subtle, #f1f5f9)", textAlign: "left" }}>
                    <th style={{ padding: "8px 10px", border: "1px solid #cbd5e1" }}>#</th>
                    <th style={{ padding: "8px 10px", border: "1px solid #cbd5e1" }}>Last Name</th>
                    <th style={{ padding: "8px 10px", border: "1px solid #cbd5e1" }}>First Name</th>
                    <th style={{ padding: "8px 10px", border: "1px solid #cbd5e1" }}>Middle Name</th>
                    <th style={{ padding: "8px 10px", border: "1px solid #cbd5e1" }}>Ext</th>
                    <th style={{ padding: "8px 10px", border: "1px solid #cbd5e1" }}>Relationship to Head</th>
                    <th style={{ padding: "8px 10px", border: "1px solid #cbd5e1" }}>Source of Income</th>
                    <th style={{ padding: "8px 10px", border: "1px solid #cbd5e1" }}>Monthly Income (₱)</th>
                    <th style={{ padding: "8px 10px", border: "1px solid #cbd5e1" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: "6px", border: "1px solid #e2e8f0", textAlign: "center", fontWeight: 600 }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: "6px", border: "1px solid #e2e8f0" }}>
                        <input
                          className="cbms-input cbms-input--sm"
                          value={m.lastName}
                          onChange={(e) => updateMember(idx, "lastName", e.target.value)}
                          placeholder="Dela Cruz"
                          required
                        />
                      </td>
                      <td style={{ padding: "6px", border: "1px solid #e2e8f0" }}>
                        <input
                          className="cbms-input cbms-input--sm"
                          value={m.firstName}
                          onChange={(e) => updateMember(idx, "firstName", e.target.value)}
                          placeholder="Juan"
                          required
                        />
                      </td>
                      <td style={{ padding: "6px", border: "1px solid #e2e8f0" }}>
                        <input
                          className="cbms-input cbms-input--sm"
                          value={m.middleName}
                          onChange={(e) => updateMember(idx, "middleName", e.target.value)}
                          placeholder="Santos"
                        />
                      </td>
                      <td style={{ padding: "6px", border: "1px solid #e2e8f0", width: 60 }}>
                        <input
                          className="cbms-input cbms-input--sm"
                          value={m.suffix}
                          onChange={(e) => updateMember(idx, "suffix", e.target.value)}
                          placeholder="Jr."
                        />
                      </td>
                      <td style={{ padding: "6px", border: "1px solid #e2e8f0" }}>
                        <select
                          className="cbms-select cbms-select--sm"
                          value={m.relationToHead}
                          onChange={(e) => updateMember(idx, "relationToHead", e.target.value)}
                        >
                          {DILG_RELATIONSHIP_CODES.map((r) => (
                            <option key={r.code} value={r.code}>
                              {r.code} - {r.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: "6px", border: "1px solid #e2e8f0" }}>
                        <select
                          className="cbms-select cbms-select--sm"
                          value={m.incomeSource}
                          onChange={(e) => updateMember(idx, "incomeSource", e.target.value)}
                        >
                          {DILG_INCOME_SOURCE_CODES.map((s) => (
                            <option key={s.code} value={s.code}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: "6px", border: "1px solid #e2e8f0", width: 110 }}>
                        <input
                          className="cbms-input cbms-input--sm"
                          type="number"
                          value={m.monthlyIncome}
                          onChange={(e) => updateMember(idx, "monthlyIncome", e.target.value)}
                          placeholder="0"
                        />
                      </td>
                      <td style={{ padding: "6px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                        {members.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMember(idx)}
                            style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
                            title="Remove member"
                          >
                            🗑
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Panel>

        <div style={{ height: 16 }} />

        {/* Part 3: Migrant Information */}
        <Panel title="Part 3: Migrant Information (BIMS Form A1 Part 3)" subtitle="To be filled out if household members are migrants (moved usual residence)">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span className="adm-muted" style={{ fontSize: "0.85rem" }}>
              Migrant: A person who moved from another geographic/political area involving a change of usual residence.
            </span>
            <button type="button" className="cbms-btn cbms-btn--sm" onClick={addMigrant}>
              ➕ Add Migrant Record
            </button>
          </div>

          {migrants.length === 0 ? (
            <div style={{ padding: "1rem", background: "var(--color-bg-subtle, #f8fafc)", borderRadius: 6, textAlign: "center", color: "#64748b" }}>
              No migrant members in this household. Click "+ Add Migrant Record" if applicable.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {migrants.map((mig, mIdx) => (
                <div key={mIdx} style={{ border: "1px solid #e2e8f0", padding: "1rem", borderRadius: 6, background: "var(--color-bg-card, #ffffff)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <strong>Migrant #{mIdx + 1}</strong>
                    <button
                      type="button"
                      onClick={() => removeMigrant(mIdx)}
                      style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                  <div className="adm-form-grid">
                    <Field label="First Name">
                      <input
                        className="cbms-input"
                        value={mig.firstName}
                        onChange={(e) => updateMigrant(mIdx, "firstName", e.target.value)}
                        placeholder="Juan"
                        required
                      />
                    </Field>
                    <Field label="Last Name">
                      <input
                        className="cbms-input"
                        value={mig.lastName}
                        onChange={(e) => updateMigrant(mIdx, "lastName", e.target.value)}
                        placeholder="Dela Cruz"
                        required
                      />
                    </Field>
                    <Field label="Previous Residence (Province, City, Barangay / Country)">
                      <input
                        className="cbms-input"
                        value={mig.previousResidence}
                        onChange={(e) => updateMigrant(mIdx, "previousResidence", e.target.value)}
                        placeholder="e.g. San Fernando, Pampanga"
                        required
                      />
                    </Field>
                    <Field label="Length of Stay in Previous Barangay">
                      <div style={{ display: "flex", gap: 6 }}>
                        <input
                          className="cbms-input"
                          type="number"
                          placeholder="Years"
                          value={mig.stayPreviousYears}
                          onChange={(e) => updateMigrant(mIdx, "stayPreviousYears", e.target.value)}
                        />
                        <input
                          className="cbms-input"
                          type="number"
                          placeholder="Months"
                          value={mig.stayPreviousMonths}
                          onChange={(e) => updateMigrant(mIdx, "stayPreviousMonths", e.target.value)}
                        />
                      </div>
                    </Field>
                    <Field label="Reason for Leaving Previous Residence">
                      <select
                        className="cbms-select"
                        value={mig.reasonForLeaving}
                        onChange={(e) => updateMigrant(mIdx, "reasonForLeaving", e.target.value)}
                      >
                        {DILG_REASONS_FOR_LEAVING.map((r) => (
                          <option key={r.code} value={r.code}>{r.label}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Date of Transfer to Barangay">
                      <input
                        className="cbms-input"
                        type="date"
                        value={mig.transferDate}
                        onChange={(e) => updateMigrant(mIdx, "transferDate", e.target.value)}
                        required
                      />
                    </Field>
                    <Field label="Reason for Transferring in this Barangay">
                      <select
                        className="cbms-select"
                        value={mig.reasonForTransferring}
                        onChange={(e) => updateMigrant(mIdx, "reasonForTransferring", e.target.value)}
                      >
                        {DILG_REASONS_FOR_TRANSFERRING.map((r) => (
                          <option key={r.code} value={r.code}>{r.label}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Intention to Return to Previous Residence?">
                      <select
                        className="cbms-select"
                        value={mig.intentionToReturn ? "yes" : "no"}
                        onChange={(e) => updateMigrant(mIdx, "intentionToReturn", e.target.value === "yes")}
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <div style={{ height: 16 }} />

        {/* Data Privacy Consent */}
        <Panel title="Data Privacy Act of 2012 Consent Clause" subtitle="Statutory compliance per RA 10173 and Section 394(d)(6) of RA 7160">
          <Alert tone="info">
            📜 <strong>Privacy Notice</strong>: I understand that for the Barangay to carry out its mandate pursuant to Section 394 (d)(6) of the Local Government Code of 1991, they must necessarily process personal information for easy identification of inhabitants, as a tool in planning, and as an updated reference in the number of inhabitants of the Barangay. Therefore, I grant my consent that my data will be stored in the LGUSS-BIMS.
          </Alert>
          <div style={{ marginTop: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                required
              />
              I certify that the above information is true and correct, and consent to household encoding in the DILG LGUSS-BIMS.
            </label>
          </div>
        </Panel>

        <div className="adm-row" style={{ marginTop: 20 }}>
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? "Encoding Household…" : "💾 Save Household & Member Roster"}
          </Button>
          <span className="adm-muted">
            Compliant with DILG BIMS Form A1 standards.
          </span>
        </div>
      </form>
    </>
  );
}
