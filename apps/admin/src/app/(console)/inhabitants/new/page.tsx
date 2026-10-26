"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { post, useApi } from "@cbms/api-client";
import { PageHead } from "@cbms/ui";
import { ActionResult } from "../../../../components/common";
import type { Household, Inhabitant, Paged } from "../../../../lib/types";
import type { DuplicateCandidate, NewInhabitantFormData } from "./types";
import { PersonalInfoSection } from "./components/PersonalInfoSection";
import { ContactAddressSection } from "./components/ContactAddressSection";
import { VoterSectoralSection } from "./components/VoterSectoralSection";
import { PrivacyConsentSection } from "./components/PrivacyConsentSection";
import { DuplicateWarningPanel } from "./components/DuplicateWarningPanel";

export default function NewInhabitantPage() {
  const router = useRouter();
  const households = useApi<Paged<Household>>("/households?pageSize=200");

  const [form, setForm] = React.useState<NewInhabitantFormData>({
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

  function set<K extends keyof NewInhabitantFormData>(
    key: K,
    value: NewInhabitantFormData[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Calculate age preview
  const ageDisplay = React.useMemo(() => {
    if (!form.birthDate) return null;
    const dob = new Date(form.birthDate);
    const now = new Date();
    const diffMonths =
      (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
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
      birthDate: new Date(form.birthDate).toISOString(),
      confirmDuplicate,
    };
  }

  async function save(confirmDuplicate: boolean) {
    setBusy(true);
    setError(null);
    try {
      const res = await post<Inhabitant>("/inhabitants", payload(confirmDuplicate));
      router.push(`/inhabitants/${res.id}`);
    } catch (err: any) {
      const body = err?.body as
        | { error?: string; message?: string; candidates?: DuplicateCandidate[] }
        | null;
      if (err?.status === 409 && body?.error === "PossibleDuplicate") {
        setCandidates(body.candidates ?? []);
        setDupMessage(
          body.message ??
            "A similar record already exists in the Record of Barangay Inhabitants."
        );
      } else {
        setError(err?.message ?? "Could not save the record.");
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
          <button
            type="button"
            className="cbms-btn"
            disabled={busy}
            onClick={() => router.push("/inhabitants")}
          >
            Cancel
          </button>
        }
      />

      <ActionResult error={error} />

      {dupMessage && candidates && (
        <DuplicateWarningPanel
          dupMessage={dupMessage}
          candidates={candidates}
          busy={busy}
          onSaveAnyway={() => void save(true)}
          onDismiss={() => {
            setCandidates(null);
            setDupMessage(null);
          }}
        />
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void save(false);
        }}
      >
        <PersonalInfoSection
          form={form}
          set={set}
          ageDisplay={ageDisplay}
          busy={busy}
        />

        <div style={{ height: 16 }} />

        <ContactAddressSection
          form={form}
          set={set}
          households={households.data?.items ?? []}
          busy={busy}
        />

        <div style={{ height: 16 }} />

        <VoterSectoralSection form={form} set={set} busy={busy} />

        <div style={{ height: 16 }} />

        <PrivacyConsentSection
          privacyConsent={form.privacyConsent}
          onConsentChange={(consent) => set("privacyConsent", consent)}
          busy={busy}
        />
      </form>
    </>
  );
}
