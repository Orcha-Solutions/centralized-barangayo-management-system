"use client";

import * as React from "react";
import { Field, Panel } from "@cbms/ui";
import type { Household } from "../../../../../../lib/types";
import { validatePhilippineMobile, validateEmail } from "../../../../../../lib/validation";
import { EditHouseholdPicker } from "./EditHouseholdPicker";

export const SECTOR_FLAGS: Array<{ key: FlagKey; label: string }> = [
  { key: "isSenior", label: "Senior citizen" },
  { key: "isPwd", label: "Person with disability" },
  { key: "isSoloParent", label: "Solo parent" },
  { key: "is4Ps", label: "4Ps beneficiary" },
  { key: "isIndigenous", label: "Indigenous people" },
  { key: "isDeceased", label: "Deceased" },
];

export type FlagKey =
  | "isSenior"
  | "isPwd"
  | "isSoloParent"
  | "is4Ps"
  | "isIndigenous"
  | "isDeceased";

export interface EditInhabitantFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  sex: string;
  birthDate: string;
  birthPlace: string;
  civilStatus: string;
  citizenship: string;
  philsysNo: string;
  contactPhone: string;
  contactEmail: string;
  occupation: string;
  educationLevel: string;
  householdId: string;
  relationToHead: string;
}

interface EditInhabitantFormProps {
  form: EditInhabitantFormData;
  setForm: React.Dispatch<React.SetStateAction<EditInhabitantFormData>>;
  flags: Record<FlagKey, boolean>;
  setFlags: React.Dispatch<React.SetStateAction<Record<FlagKey, boolean>>>;
  households: Household[];
  busy: boolean;
  onSave: (e: React.FormEvent) => void;
}

export function EditInhabitantForm({
  form,
  setForm,
  flags,
  setFlags,
  households,
  busy,
  onSave,
}: EditInhabitantFormProps) {
  const [touchedPhone, setTouchedPhone] = React.useState(false);
  const [touchedEmail, setTouchedEmail] = React.useState(false);

  const phoneValidation = React.useMemo(
    () => validatePhilippineMobile(form.contactPhone),
    [form.contactPhone]
  );
  const emailValidation = React.useMemo(
    () => validateEmail(form.contactEmail),
    [form.contactEmail]
  );

  function set<K extends keyof EditInhabitantFormData>(
    key: K,
    value: EditInhabitantFormData[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <form onSubmit={onSave} id="edit-inhabitant-form">
      <div className="cbms-grid-2" style={{ marginTop: "1rem" }}>
        <Panel title="Identity">
          <div className="adm-form-grid">
            <Field label="First name">
              <input
                className="cbms-input"
                value={form.firstName}
                disabled={busy}
                onChange={(e) => set("firstName", e.target.value)}
                required
              />
            </Field>
            <Field label="Middle name">
              <input
                className="cbms-input"
                value={form.middleName}
                disabled={busy}
                onChange={(e) => set("middleName", e.target.value)}
              />
            </Field>
            <Field label="Last name">
              <input
                className="cbms-input"
                value={form.lastName}
                disabled={busy}
                onChange={(e) => set("lastName", e.target.value)}
                required
              />
            </Field>
            <Field label="Suffix">
              <input
                className="cbms-input"
                value={form.suffix}
                disabled={busy}
                onChange={(e) => set("suffix", e.target.value)}
                placeholder="Jr., III, …"
              />
            </Field>
            <Field label="Sex">
              <select
                className="cbms-select"
                value={form.sex}
                disabled={busy}
                onChange={(e) => set("sex", e.target.value)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </Field>
            <Field label="Civil status">
              <select
                className="cbms-select"
                value={form.civilStatus}
                disabled={busy}
                onChange={(e) => set("civilStatus", e.target.value)}
              >
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="widowed">Widowed</option>
                <option value="separated">Separated</option>
                <option value="divorced">Divorced</option>
              </select>
            </Field>
            <Field label="Citizenship">
              <input
                className="cbms-input"
                value={form.citizenship}
                disabled={busy}
                onChange={(e) => set("citizenship", e.target.value)}
                required
              />
            </Field>
            <Field label="Birth date">
              <input
                className="cbms-input"
                type="date"
                value={form.birthDate}
                disabled={busy}
                onChange={(e) => set("birthDate", e.target.value)}
                required
              />
            </Field>
            <Field label="Birth place">
              <input
                className="cbms-input"
                value={form.birthPlace}
                disabled={busy}
                onChange={(e) => set("birthPlace", e.target.value)}
              />
            </Field>
          </div>
        </Panel>

        <Panel title="Contact, Household Assignment & Sectoral">
          <div className="adm-form-grid">
            <Field
              label="PhilSys number (PCN)"
              hint="Optional — verified against a mock adapter."
            >
              <input
                className="cbms-input"
                value={form.philsysNo}
                disabled={busy}
                onChange={(e) => set("philsysNo", e.target.value)}
              />
            </Field>
            <Field
              label="Mobile number"
              hint="Philippine mobile format (e.g. 0917 123 4567 or +63 917 123 4567)"
            >
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 10,
                    fontSize: 14,
                    pointerEvents: "none",
                    color: "var(--cbms-muted, #64748b)",
                  }}
                  aria-hidden="true"
                >
                  📱
                </span>
                <input
                  className="cbms-input"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="0917 123 4567"
                  style={{
                    paddingLeft: 34,
                    borderColor:
                      touchedPhone && !phoneValidation.isValid
                        ? "var(--cbms-red, #dc2626)"
                        : undefined,
                  }}
                  value={form.contactPhone}
                  disabled={busy}
                  onBlur={() => setTouchedPhone(true)}
                  onChange={(e) => {
                    set("contactPhone", e.target.value);
                    if (!touchedPhone) setTouchedPhone(true);
                  }}
                />
              </div>
              {touchedPhone && phoneValidation.error && (
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--cbms-red, #dc2626)",
                    marginTop: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  ⚠️ {phoneValidation.error}
                </div>
              )}
            </Field>
            <Field
              label="Email address"
              hint="Official or personal email address for notifications"
            >
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 10,
                    fontSize: 14,
                    pointerEvents: "none",
                    color: "var(--cbms-muted, #64748b)",
                  }}
                  aria-hidden="true"
                >
                  ✉️
                </span>
                <input
                  className="cbms-input"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="inhabitant@example.com"
                  style={{
                    paddingLeft: 34,
                    borderColor:
                      touchedEmail && !emailValidation.isValid
                        ? "var(--cbms-red, #dc2626)"
                        : undefined,
                  }}
                  value={form.contactEmail}
                  disabled={busy}
                  onBlur={() => setTouchedEmail(true)}
                  onChange={(e) => {
                    set("contactEmail", e.target.value);
                    if (!touchedEmail) setTouchedEmail(true);
                  }}
                />
              </div>
              {touchedEmail && emailValidation.error && (
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--cbms-red, #dc2626)",
                    marginTop: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  ⚠️ {emailValidation.error}
                </div>
              )}
            </Field>
            <Field label="Occupation">
              <input
                className="cbms-input"
                value={form.occupation}
                disabled={busy}
                onChange={(e) => set("occupation", e.target.value)}
              />
            </Field>
            <Field label="Education level">
              <input
                className="cbms-input"
                value={form.educationLevel}
                disabled={busy}
                onChange={(e) => set("educationLevel", e.target.value)}
              />
            </Field>
          </div>

          <EditHouseholdPicker
            form={form}
            setForm={setForm}
            households={households}
            busy={busy}
          />

          <div className="cbms-label" style={{ marginTop: 12 }}>
            Sectoral flags
          </div>
          <div className="adm-checks">
            {SECTOR_FLAGS.map((f) => (
              <label key={f.key}>
                <input
                  type="checkbox"
                  checked={flags[f.key]}
                  disabled={busy}
                  onChange={(e) => setFlags((s) => ({ ...s, [f.key]: e.target.checked }))}
                />
                {f.label}
              </label>
            ))}
          </div>

        </Panel>
      </div>
    </form>
  );
}
