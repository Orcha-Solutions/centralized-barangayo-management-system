"use client";

import * as React from "react";
import { Field, Panel } from "@cbms/ui";
import {
  DILG_ETHNICITIES,
  DILG_RELIGIONS,
  DILG_GOV_ASSISTANCE_PROGRAMS,
} from "@cbms/api-client";
import type { NewInhabitantFormData } from "../types";

interface VoterSectoralSectionProps {
  form: NewInhabitantFormData;
  set: <K extends keyof NewInhabitantFormData>(key: K, value: NewInhabitantFormData[K]) => void;
  busy: boolean;
}

export function VoterSectoralSection({ form, set, busy }: VoterSectoralSectionProps) {
  return (
    <>
      <Panel title="Part 3: Identity & Demographics">
        <div className="adm-muted" style={{ marginBottom: 12 }}>
          Official civil identity, ethnicity, and voter registration
        </div>
        <div className="adm-form-grid">
          <Field label="Blood Type">
            <select
              className="cbms-select"
              value={form.bloodType}
              disabled={busy}
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
              disabled={busy}
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
              disabled={busy}
              onChange={(e) => set("weight", e.target.value)}
              placeholder="60.0"
            />
          </Field>

          <Field label="Complexion">
            <select
              className="cbms-select"
              value={form.complexion}
              disabled={busy}
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
              disabled={busy}
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
              disabled={busy}
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
              disabled={busy}
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
              disabled={busy}
              onChange={(e) => set("lastVotedYear", e.target.value)}
              placeholder="2025"
            />
          </Field>

          <Field label="Ethnicity (BIMS Form 1.A)">
            <select
              className="cbms-select"
              value={form.ethnicity}
              disabled={busy}
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
              disabled={busy}
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
              disabled={busy}
              onChange={(e) => set("mothersMaidenFirstName", e.target.value)}
              placeholder="e.g. Maria"
            />
          </Field>

          <Field label="Mother's Maiden Middle Name">
            <input
              className="cbms-input"
              value={form.mothersMaidenMiddleName}
              disabled={busy}
              onChange={(e) => set("mothersMaidenMiddleName", e.target.value)}
              placeholder="e.g. Gomez"
            />
          </Field>

          <Field label="Mother's Maiden Last Name">
            <input
              className="cbms-input"
              value={form.mothersMaidenLastName}
              disabled={busy}
              onChange={(e) => set("mothersMaidenLastName", e.target.value)}
              placeholder="e.g. Santos"
            />
          </Field>
        </div>
      </Panel>

      <div style={{ height: 16 }} />

      <Panel title="Part 4: Beneficiary & Sectoral Information">
        <div className="adm-muted" style={{ marginBottom: 12 }}>
          Government assistance and socio-demographic classifications
        </div>
        <Field label="Government Assistance Program Enrollment">
          <select
            className="cbms-select"
            value={form.govAssistance}
            disabled={busy}
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
        <div
          className="adm-checks"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 8,
            marginTop: 8,
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={form.isEmployed}
              disabled={busy}
              onChange={(e) => set("isEmployed", e.target.checked)}
            />
            Employed (15+ y.o. working)
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.isUnemployed}
              disabled={busy}
              onChange={(e) => set("isUnemployed", e.target.checked)}
            />
            Unemployed (Seeking work)
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.isStudent}
              disabled={busy}
              onChange={(e) => set("isStudent", e.target.checked)}
            />
            Student (Formally enrolled)
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.isOsc}
              disabled={busy}
              onChange={(e) => set("isOsc", e.target.checked)}
            />
            Out of School Child (6–14 y.o.)
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.isOsy}
              disabled={busy}
              onChange={(e) => set("isOsy", e.target.checked)}
            />
            Out of School Youth (15–24 y.o.)
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.isOfw}
              disabled={busy}
              onChange={(e) => set("isOfw", e.target.checked)}
            />
            Overseas Filipino Worker (OFW)
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.isIndigenous}
              disabled={busy}
              onChange={(e) => set("isIndigenous", e.target.checked)}
            />
            Indigenous People (IP)
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.isMigrant}
              disabled={busy}
              onChange={(e) => set("isMigrant", e.target.checked)}
            />
            Migrant Resident
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.isRefugee}
              disabled={busy}
              onChange={(e) => set("isRefugee", e.target.checked)}
            />
            Refugee / Displaced Person
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.isSenior}
              disabled={busy}
              onChange={(e) => set("isSenior", e.target.checked)}
            />
            Senior Citizen (60+ y.o.)
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.isPwd}
              disabled={busy}
              onChange={(e) => set("isPwd", e.target.checked)}
            />
            Person with Disability (PWD)
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.isSoloParent}
              disabled={busy}
              onChange={(e) => set("isSoloParent", e.target.checked)}
            />
            Solo Parent
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.is4Ps}
              disabled={busy}
              onChange={(e) => set("is4Ps", e.target.checked)}
            />
            4Ps Pantawid Beneficiary
          </label>
        </div>
      </Panel>
    </>
  );
}
