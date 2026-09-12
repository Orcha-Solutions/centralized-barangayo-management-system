"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ApiError,
  post,
  useApi,
  DILG_ETHNICITIES,
  DILG_RELATIONSHIP_CODES,
  DILG_INCOME_SOURCE_CODES,
  DILG_EDUCATIONAL_ATTAINMENTS,
  DILG_RELIGIONS,
  DILG_GOV_ASSISTANCE_PROGRAMS,
} from "@cbms/api-client";
import {
  Alert,
  Button,
  DataTable,
  Field,
  PageHead,
  Panel,
  date,
  fullName,
} from "@cbms/ui";
import { ActionResult } from "../../../../components/common";
import type { Household, Inhabitant, Paged } from "../../../../lib/types";

interface DuplicateCandidate {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  birthDate: string;
}

export default function NewInhabitantPage() {
  const router = useRouter();
  const households = useApi<Paged<Household>>("/households?pageSize=200");

  const [form, setForm] = React.useState({
    // Section 1: Inhabitant & Personal
    residentType: "non_migrant",
    philsysNo: "",
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    birthDate: "",
    birthPlace: "",
    residenceMotherAtBirth: "",
    sex: "male",
    gender: "male",
    civilStatus: "single",
    isPregnant: false,
    educationLevel: "College Graduate",
    occupation: "Employee",

    // Section 2: Contact & Address
    contactEmail: "",
    contactPhone: "",
    telephoneNumber: "",
    householdId: "",
    relationToHead: "1",
    incomeSource: "1",
    monthlyIncome: "25000",

    // Section 3: Identity & Demographics
    bloodType: "O+",
    height: "1.65",
    weight: "60",
    complexion: "medium",
    nationality: "filipino",
    isRegisteredVoter: true,
    isResidentVoter: true,
    lastVotedYear: "2025",
    ethnicity: "Tagalog",
    religion: "Roman Catholic",
    mothersMaidenFirstName: "",
    mothersMaidenMiddleName: "",
    mothersMaidenLastName: "",

    // Section 4: Beneficiary & Sectoral
    govAssistance: "",
    isEmployed: true,
    isUnemployed: false,
    isOfw: false,
    isIndigenous: false,
    isStudent: false,
    isOsc: false,
    isOsy: false,
    isMigrant: false,
    isRefugee: false,
    isSenior: false,
    isRegisteredSenior: false,
    isPwd: false,
    isRegisteredPwd: false,
    pwdType: "",
    isSoloParent: false,
    isRegisteredSoloParent: false,
    is4Ps: false,

    // Section 5: Compliance
    privacyConsent: true,
  });

  const [candidates, setCandidates] = React.useState<DuplicateCandidate[] | null>(null);
  const [dupMessage, setDupMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Calculate age preview
  const ageDisplay = React.useMemo(() => {
    if (!form.birthDate) return null;
    const dob = new Date(form.birthDate);
    const now = new Date();
    const diffMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    if (diffMonths < 12) {
      const mos = Math.max(0, diffMonths);
      return `${mos} month(s) old (Infant: ${(mos / 12).toFixed(2)})`;
    }
    const years = Math.floor(diffMonths / 12);
    return `${years} years old`;
  }, [form.birthDate]);

  function payload(confirmDuplicate: boolean) {
    return {
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      middleName: form.middleName.trim() || undefined,
      suffix: form.suffix.trim() || undefined,
      philsysNo: form.philsysNo.trim() || undefined,
      contactPhone: form.contactPhone.trim() || undefined,
      contactEmail: form.contactEmail.trim() || undefined,
      telephoneNumber: form.telephoneNumber.trim() || undefined,
      birthPlace: form.birthPlace.trim() || undefined,
      residenceMotherAtBirth: form.residenceMotherAtBirth.trim() || undefined,
      occupation: form.occupation.trim() || undefined,
      mothersMaidenFirstName: form.mothersMaidenFirstName.trim() || undefined,
      mothersMaidenMiddleName: form.mothersMaidenMiddleName.trim() || undefined,
      mothersMaidenLastName: form.mothersMaidenLastName.trim() || undefined,
      pwdType: form.pwdType.trim() || undefined,
      height: form.height ? parseFloat(form.height) : undefined,
      weight: form.weight ? parseFloat(form.weight) : undefined,
      lastVotedYear: form.lastVotedYear ? parseInt(form.lastVotedYear) : undefined,
      monthlyIncome: form.monthlyIncome ? parseFloat(form.monthlyIncome) : undefined,
      householdId: form.householdId || undefined,
      confirmDuplicate,
    };
  }

  async function save(confirmDuplicate: boolean) {
    if (!form.privacyConsent) {
      setError("Data Privacy consent must be granted before registering the inhabitant.");
      return;
    }
    setBusy(true);
    setError(null);
    if (confirmDuplicate) setDupMessage(null);
    try {
      const created = await post<Inhabitant>("/inhabitants", payload(confirmDuplicate));
      router.push(`/inhabitants/${created.id}`);
    } catch (err) {
      const e = err as ApiError;
      const body = e?.body as { error?: string; message?: string; candidates?: DuplicateCandidate[] } | null;
      if (e?.status === 409 && body?.error === "PossibleDuplicate") {
        setCandidates(body.candidates ?? []);
        setDupMessage(body.message ?? "A similar record already exists in the Record of Barangay Inhabitants.");
      } else {
        setError(e?.message ?? "Could not save the record.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title="Individual Inhabitant Profile (BIMS Form A2)"
        subtitle="Standardized Data Capture Form compliant with DILG Memorandum Circular No. 2025-104 (LGUSS - BIMS)."
        breadcrumb="Residents / Inhabitants / New"
        parity="BIPS Form A2"
        actions={
          <button type="button" className="cbms-btn" onClick={() => router.push("/inhabitants")}>
            Cancel
          </button>
        }
      />

      <ActionResult error={error} />

      {dupMessage && candidates && (
        <Panel title="Possible duplicate detected">
          <Alert tone="warn">{dupMessage}</Alert>
          <DataTable
            columns={[
              { key: "name", header: "Existing record", render: (c) => fullName(c) },
              { key: "birthDate", header: "Birth date", render: (c) => date(c.birthDate) },
              {
                key: "open",
                header: "",
                align: "right",
                render: (c) => (
                  <a className="cbms-btn cbms-btn--sm" href={`/inhabitants/${c.id}`}>
                    Open record
                  </a>
                ),
              },
            ]}
            rows={candidates}
            empty="No candidates returned."
          />
          <div className="adm-row" style={{ marginTop: 14 }}>
            <Button variant="gold" onClick={() => void save(true)} disabled={busy}>
              Save anyway — this is a different person
            </Button>
            <button
              type="button"
              className="cbms-btn"
              onClick={() => {
                setCandidates(null);
                setDupMessage(null);
              }}
            >
              Go back and edit
            </button>
          </div>
        </Panel>
      )}

      <div style={{ height: 16 }} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void save(false);
        }}
      >
        {/* Section 1: Inhabitant & Personal Information */}
        <Panel title="Part 1: Inhabitant & Personal Information">
          <div className="adm-muted" style={{ marginBottom: 12 }}>
            Basic demographic and civil registry details per DILG Form A2
          </div>
          <div className="adm-form-grid">
            <Field label="Type of Resident" hint="Per DILG classification">
              <select
                className="cbms-select"
                value={form.residentType}
                onChange={(e) => set("residentType", e.target.value)}
                required
              >
                <option value="non_migrant">Non-migrant (Staying ≥ 5 years + 1 day)</option>
                <option value="migrant">Migrant (Staying 6 months + 1 day up to 5 years)</option>
                <option value="transient">Transient (Staying &lt; 6 months with intent to return)</option>
              </select>
            </Field>

            <Field label="PhilSys Card Number (PCN)" hint="16-digit national ID number">
              <input
                className="cbms-input"
                value={form.philsysNo}
                onChange={(e) => set("philsysNo", e.target.value)}
                placeholder="1234-5678-9101-1213"
                maxLength={19}
              />
            </Field>

            <Field label="First Name">
              <input
                className="cbms-input"
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                placeholder="e.g. Juan"
                required
              />
            </Field>

            <Field label="Middle Name">
              <input
                className="cbms-input"
                value={form.middleName}
                onChange={(e) => set("middleName", e.target.value)}
                placeholder="e.g. Santos"
              />
            </Field>

            <Field label="Last Name">
              <input
                className="cbms-input"
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                placeholder="e.g. Dela Cruz"
                required
              />
            </Field>

            <Field label="Suffix" hint="Jr., Sr., III, etc.">
              <input
                className="cbms-input"
                value={form.suffix}
                onChange={(e) => set("suffix", e.target.value)}
                placeholder="Jr."
              />
            </Field>

            <Field label="Date of Birth" hint={ageDisplay ? `Calculated: ${ageDisplay}` : undefined}>
              <input
                className="cbms-input"
                type="date"
                value={form.birthDate}
                onChange={(e) => set("birthDate", e.target.value)}
                required
              />
            </Field>

            <Field label="Place of Birth">
              <input
                className="cbms-input"
                value={form.birthPlace}
                onChange={(e) => set("birthPlace", e.target.value)}
                placeholder="City/Municipality where born"
                required
              />
            </Field>

            <Field label="Mother's Residence Upon Birth">
              <input
                className="cbms-input"
                value={form.residenceMotherAtBirth}
                onChange={(e) => set("residenceMotherAtBirth", e.target.value)}
                placeholder="City/Town of mother upon birth"
              />
            </Field>

            <Field label="Biological Sex">
              <select
                className="cbms-select"
                value={form.sex}
                onChange={(e) => set("sex", e.target.value)}
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </Field>

            <Field label="Gender Identity">
              <select
                className="cbms-select"
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="lesbian">Lesbian</option>
                <option value="gay">Gay</option>
                <option value="bisexual">Bisexual</option>
                <option value="transgender">Transgender</option>
                <option value="queer">Queer</option>
                <option value="intersex">Intersex</option>
                <option value="asexual">Asexual</option>
                <option value="others">Others</option>
              </select>
            </Field>

            <Field label="Civil Status">
              <select
                className="cbms-select"
                value={form.civilStatus}
                onChange={(e) => set("civilStatus", e.target.value)}
                required
              >
                <option value="single">Single / Never Married</option>
                <option value="married">Married</option>
                <option value="common_law">Common Law / Live-in</option>
                <option value="widowed">Widowed</option>
                <option value="divorced">Divorced</option>
                <option value="separated">Separated</option>
                <option value="annulled">Annulled</option>
                <option value="unknown">Unknown</option>
              </select>
            </Field>

            {form.sex === "female" && (
              <Field label="Pregnant Women?">
                <select
                  className="cbms-select"
                  value={form.isPregnant ? "yes" : "no"}
                  onChange={(e) => set("isPregnant", e.target.value === "yes")}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </Field>
            )}

            <Field label="Highest Educational Attainment">
              <select
                className="cbms-select"
                value={form.educationLevel}
                onChange={(e) => set("educationLevel", e.target.value)}
              >
                {DILG_EDUCATIONAL_ATTAINMENTS.map((edu) => (
                  <option key={edu} value={edu}>
                    {edu}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Profession / Occupation">
              <input
                className="cbms-input"
                value={form.occupation}
                onChange={(e) => set("occupation", e.target.value)}
                placeholder="e.g. Employee, Merchant, BPO Specialist"
              />
            </Field>
          </div>
        </Panel>

        <div style={{ height: 16 }} />

        {/* Section 2: Contact, Household & Income */}
        <Panel title="Part 2: Contact Details & Household Linking">
          <div className="adm-muted" style={{ marginBottom: 12 }}>
            Contact information and household affiliation
          </div>
          <div className="adm-form-grid">
            <Field label="Mobile Number (11-digit)">
              <input
                className="cbms-input"
                value={form.contactPhone}
                onChange={(e) => set("contactPhone", e.target.value)}
                placeholder="09171234567"
                maxLength={11}
              />
            </Field>

            <Field label="Email Address">
              <input
                className="cbms-input"
                type="email"
                value={form.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
                placeholder="juan.delacruz@example.ph"
              />
            </Field>

            <Field label="Telephone Number">
              <input
                className="cbms-input"
                value={form.telephoneNumber}
                onChange={(e) => set("telephoneNumber", e.target.value)}
                placeholder="02-81234567"
              />
            </Field>

            <Field label="Household Assignment">
              <select
                className="cbms-select"
                value={form.householdId}
                onChange={(e) => set("householdId", e.target.value)}
              >
                <option value="">— Not attached to a household —</option>
                {(households.data?.items ?? []).map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.householdNo} · {h.householdName ?? "Household"} · {h.purok ?? "—"}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Relationship to Household Head (DILG Code)">
              <select
                className="cbms-select"
                value={form.relationToHead}
                onChange={(e) => set("relationToHead", e.target.value)}
              >
                {DILG_RELATIONSHIP_CODES.map((rel) => (
                  <option key={rel.code} value={rel.code}>
                    {rel.code} - {rel.label} ({rel.group})
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Primary Source of Income">
              <select
                className="cbms-select"
                value={form.incomeSource}
                onChange={(e) => set("incomeSource", e.target.value)}
              >
                {DILG_INCOME_SOURCE_CODES.map((src) => (
                  <option key={src.code} value={src.code}>
                    {src.code} - {src.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Individual Monthly Income (₱)">
              <input
                className="cbms-input"
                type="number"
                value={form.monthlyIncome}
                onChange={(e) => set("monthlyIncome", e.target.value)}
                placeholder="25000"
              />
            </Field>
          </div>
        </Panel>

        <div style={{ height: 16 }} />

        {/* Section 3: Identity & Demographics */}
        <Panel title="Part 3: Identity & Demographics">
          <div className="adm-muted" style={{ marginBottom: 12 }}>
            Official civil identity, ethnicity, and voter registration
          </div>
          <div className="adm-form-grid">
            <Field label="Blood Type">
              <select
                className="cbms-select"
                value={form.bloodType}
                onChange={(e) => set("bloodType", e.target.value)}
              >
                {["A+", "O+", "B+", "AB+", "A-", "O-", "B-", "AB-"].map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Height (meters)">
              <input
                className="cbms-input"
                type="number"
                step="0.01"
                value={form.height}
                onChange={(e) => set("height", e.target.value)}
                placeholder="1.65"
              />
            </Field>

            <Field label="Weight (kg)">
              <input
                className="cbms-input"
                type="number"
                step="0.1"
                value={form.weight}
                onChange={(e) => set("weight", e.target.value)}
                placeholder="60.0"
              />
            </Field>

            <Field label="Complexion">
              <select
                className="cbms-select"
                value={form.complexion}
                onChange={(e) => set("complexion", e.target.value)}
              >
                <option value="fair">Fair</option>
                <option value="medium">Medium</option>
                <option value="dark">Dark</option>
              </select>
            </Field>

            <Field label="Nationality">
              <select
                className="cbms-select"
                value={form.nationality}
                onChange={(e) => set("nationality", e.target.value)}
              >
                <option value="filipino">Filipino Citizen</option>
                <option value="dual_citizen">Dual Citizen</option>
                <option value="foreign_citizen">Foreign Citizen</option>
                <option value="no_citizenship">No Citizenship</option>
              </select>
            </Field>

            <Field label="Registered Voter?">
              <select
                className="cbms-select"
                value={form.isRegisteredVoter ? "yes" : "no"}
                onChange={(e) => set("isRegisteredVoter", e.target.value === "yes")}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </Field>

            <Field label="Resident Voter in Barangay?">
              <select
                className="cbms-select"
                value={form.isResidentVoter ? "yes" : "no"}
                onChange={(e) => set("isResidentVoter", e.target.value === "yes")}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </Field>

            <Field label="Last Voted Year">
              <input
                className="cbms-input"
                type="number"
                value={form.lastVotedYear}
                onChange={(e) => set("lastVotedYear", e.target.value)}
                placeholder="2025"
              />
            </Field>

            <Field label="Ethnicity (BIMS Form 1.A)">
              <select
                className="cbms-select"
                value={form.ethnicity}
                onChange={(e) => set("ethnicity", e.target.value)}
              >
                {DILG_ETHNICITIES.map((eth) => (
                  <option key={eth} value={eth}>
                    {eth}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Religion">
              <select
                className="cbms-select"
                value={form.religion}
                onChange={(e) => set("religion", e.target.value)}
              >
                {DILG_RELIGIONS.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Mother's Maiden First Name">
              <input
                className="cbms-input"
                value={form.mothersMaidenFirstName}
                onChange={(e) => set("mothersMaidenFirstName", e.target.value)}
                placeholder="e.g. Maria"
              />
            </Field>

            <Field label="Mother's Maiden Middle Name">
              <input
                className="cbms-input"
                value={form.mothersMaidenMiddleName}
                onChange={(e) => set("mothersMaidenMiddleName", e.target.value)}
                placeholder="e.g. Gomez"
              />
            </Field>

            <Field label="Mother's Maiden Last Name">
              <input
                className="cbms-input"
                value={form.mothersMaidenLastName}
                onChange={(e) => set("mothersMaidenLastName", e.target.value)}
                placeholder="e.g. Santos"
              />
            </Field>
          </div>
        </Panel>

        <div style={{ height: 16 }} />

        {/* Section 4: Beneficiary & Sectoral Profiling */}
        <Panel title="Part 4: Beneficiary & Sectoral Information">
          <div className="adm-muted" style={{ marginBottom: 12 }}>
            Government assistance and socio-demographic classifications
          </div>
          <Field label="Government Assistance Program Enrollment">
            <select
              className="cbms-select"
              value={form.govAssistance}
              onChange={(e) => set("govAssistance", e.target.value)}
            >
              <option value="">— None / Not Enrolled —</option>
              {DILG_GOV_ASSISTANCE_PROGRAMS.map((prog) => (
                <option key={prog} value={prog}>
                  {prog}
                </option>
              ))}
            </select>
          </Field>

          <div className="cbms-label" style={{ marginTop: 12 }}>
            Sectoral Classifications (Check all that apply)
          </div>
          <div className="adm-checks" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8, marginTop: 8 }}>
            <label>
              <input
                type="checkbox"
                checked={form.isEmployed}
                onChange={(e) => set("isEmployed", e.target.checked)}
              />
              Employed (15+ y.o. working)
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.isUnemployed}
                onChange={(e) => set("isUnemployed", e.target.checked)}
              />
              Unemployed (Seeking work)
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.isStudent}
                onChange={(e) => set("isStudent", e.target.checked)}
              />
              Student (Formally enrolled)
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.isOsc}
                onChange={(e) => set("isOsc", e.target.checked)}
              />
              Out of School Child (6–14 y.o.)
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.isOsy}
                onChange={(e) => set("isOsy", e.target.checked)}
              />
              Out of School Youth (15–24 y.o.)
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.isOfw}
                onChange={(e) => set("isOfw", e.target.checked)}
              />
              Overseas Filipino Worker (OFW)
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.isIndigenous}
                onChange={(e) => set("isIndigenous", e.target.checked)}
              />
              Indigenous People (IP)
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.isMigrant}
                onChange={(e) => set("isMigrant", e.target.checked)}
              />
              Migrant Resident
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.isRefugee}
                onChange={(e) => set("isRefugee", e.target.checked)}
              />
              Refugee / Displaced Person
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.isSenior}
                onChange={(e) => set("isSenior", e.target.checked)}
              />
              Senior Citizen (60+ y.o.)
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.isPwd}
                onChange={(e) => set("isPwd", e.target.checked)}
              />
              Person with Disability (PWD)
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.isSoloParent}
                onChange={(e) => set("isSoloParent", e.target.checked)}
              />
              Solo Parent
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.is4Ps}
                onChange={(e) => set("is4Ps", e.target.checked)}
              />
              4Ps Pantawid Beneficiary
            </label>
          </div>
        </Panel>

        <div style={{ height: 16 }} />

        {/* Section 5: Data Privacy Consent */}
        <Panel title="Part 5: Data Privacy Act of 2012 Certification & Consent">
          <div className="adm-muted" style={{ marginBottom: 12 }}>
            Statutory compliance per RA 10173 and Section 394(d)(6) of RA 7160
          </div>
          <Alert tone="info">
            📜 <strong>Privacy Notice</strong>: The Barangay collects this personal information to establish and maintain an updated Record of Barangay Inhabitants (RBI) as mandated under Section 394(d)(6) of the Local Government Code of 1991 (RA 7160). All data is encrypted and securely processed pursuant to Republic Act No. 10173 (Data Privacy Act of 2012) and DILG Memorandum Circular No. 2025-104.
          </Alert>
          <div style={{ marginTop: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={form.privacyConsent}
                onChange={(e) => set("privacyConsent", e.target.checked)}
                required
              />
              I certify that all information provided is true and correct, and consent to its encoding in the DILG LGUSS-BIMS.
            </label>
          </div>
        </Panel>

        <div className="adm-row" style={{ marginTop: 20 }}>
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? "Encoding into BIMS…" : "💾 Save and Encode Inhabitant"}
          </Button>
          <span className="adm-muted">
            All fields align with DILG BIMS Form A2 standards.
          </span>
        </div>
      </form>
    </>
  );
}
