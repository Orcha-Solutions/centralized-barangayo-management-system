"use client";

import * as React from "react";
import { Field, Panel } from "@cbms/ui";
import { DILG_EDUCATIONAL_ATTAINMENTS } from "@cbms/api-client";
import type { NewInhabitantFormData } from "../types";

interface PersonalInfoSectionProps {
  form: NewInhabitantFormData;
  set: <K extends keyof NewInhabitantFormData>(key: K, value: NewInhabitantFormData[K]) => void;
  ageDisplay: string | null;
  busy: boolean;
}

export function PersonalInfoSection({
  form,
  set,
  ageDisplay,
  busy,
}: PersonalInfoSectionProps) {
  return (
    <Panel title="Part 1: Inhabitant & Personal Information">
      <div className="adm-muted" style={{ marginBottom: 12 }}>
        Basic demographic and civil registry details per DILG Form A2
      </div>
      <div className="adm-form-grid">
        <Field label="Type of Resident" hint="Per DILG classification">
          <select
            className="cbms-select"
            value={form.residentType}
            disabled={busy}
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
            disabled={busy}
            onChange={(e) => set("philsysNo", e.target.value)}
            placeholder="1234-5678-9101-1213"
            maxLength={19}
          />
        </Field>

        <Field label="First Name">
          <input
            className="cbms-input"
            value={form.firstName}
            disabled={busy}
            onChange={(e) => set("firstName", e.target.value)}
            placeholder="e.g. Juan"
            required
          />
        </Field>

        <Field label="Middle Name">
          <input
            className="cbms-input"
            value={form.middleName}
            disabled={busy}
            onChange={(e) => set("middleName", e.target.value)}
            placeholder="e.g. Santos"
          />
        </Field>

        <Field label="Last Name">
          <input
            className="cbms-input"
            value={form.lastName}
            disabled={busy}
            onChange={(e) => set("lastName", e.target.value)}
            placeholder="e.g. Dela Cruz"
            required
          />
        </Field>

        <Field label="Suffix" hint="Jr., Sr., III, etc.">
          <input
            className="cbms-input"
            value={form.suffix}
            disabled={busy}
            onChange={(e) => set("suffix", e.target.value)}
            placeholder="Jr."
          />
        </Field>

        <Field label="Date of Birth" hint={ageDisplay ? `Calculated: ${ageDisplay}` : undefined}>
          <input
            className="cbms-input"
            type="date"
            value={form.birthDate}
            disabled={busy}
            onChange={(e) => set("birthDate", e.target.value)}
            required
          />
        </Field>

        <Field label="Place of Birth">
          <input
            className="cbms-input"
            value={form.birthPlace}
            disabled={busy}
            onChange={(e) => set("birthPlace", e.target.value)}
            placeholder="City/Municipality where born"
            required
          />
        </Field>

        <Field label="Mother's Residence Upon Birth">
          <input
            className="cbms-input"
            value={form.residenceMotherAtBirth}
            disabled={busy}
            onChange={(e) => set("residenceMotherAtBirth", e.target.value)}
            placeholder="City/Town of mother upon birth"
          />
        </Field>

        <Field label="Biological Sex">
          <select
            className="cbms-select"
            value={form.sex}
            disabled={busy}
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
            disabled={busy}
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
            disabled={busy}
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
              disabled={busy}
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
            disabled={busy}
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
            disabled={busy}
            onChange={(e) => set("occupation", e.target.value)}
            placeholder="e.g. Employee, Merchant, BPO Specialist"
          />
        </Field>
      </div>
    </Panel>
  );
}
