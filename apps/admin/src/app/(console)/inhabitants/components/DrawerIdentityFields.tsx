"use client";

import * as React from "react";
import { Field } from "@cbms/ui";
import type { InhabitantFormState } from "../types";
import { validatePhilippineMobile, validateEmail } from "../../../../lib/validation";

interface DrawerIdentityFieldsProps {
  form: InhabitantFormState;
  setForm: React.Dispatch<React.SetStateAction<InhabitantFormState>>;
  disabled?: boolean;
}

export function DrawerIdentityFields({
  form,
  setForm,
  disabled,
}: DrawerIdentityFieldsProps) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <Field label="First Name">
          <input
            className="cbms-input"
            value={form.firstName}
            disabled={disabled}
            onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
            required
          />
        </Field>
        <Field label="Middle Name">
          <input
            className="cbms-input"
            value={form.middleName}
            disabled={disabled}
            onChange={(e) => setForm((prev) => ({ ...prev, middleName: e.target.value }))}
          />
        </Field>
        <Field label="Last Name">
          <input
            className="cbms-input"
            value={form.lastName}
            disabled={disabled}
            onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
            required
          />
        </Field>
        <Field label="Suffix">
          <input
            className="cbms-input"
            value={form.suffix}
            placeholder="Jr. / III"
            disabled={disabled}
            onChange={(e) => setForm((prev) => ({ ...prev, suffix: e.target.value }))}
          />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <Field label="Sex">
          <select
            className="cbms-select"
            value={form.sex}
            disabled={disabled}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, sex: e.target.value as "male" | "female" }))
            }
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </Field>
        <Field label="Birth Date">
          <input
            className="cbms-input"
            type="date"
            value={form.birthDate}
            disabled={disabled}
            onChange={(e) => setForm((prev) => ({ ...prev, birthDate: e.target.value }))}
            required
          />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <Field label="Civil Status">
          <select
            className="cbms-select"
            value={form.civilStatus}
            disabled={disabled}
            onChange={(e) => setForm((prev) => ({ ...prev, civilStatus: e.target.value }))}
          >
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="widowed">Widowed</option>
            <option value="divorced">Divorced</option>
          </select>
        </Field>
        <Field label="Citizenship">
          <input
            className="cbms-input"
            value={form.citizenship}
            disabled={disabled}
            onChange={(e) => setForm((prev) => ({ ...prev, citizenship: e.target.value }))}
            required
          />
        </Field>
      </div>

      <Field label="PhilSys Card Number (PCN)">
        <input
          className="cbms-input"
          value={form.philsysNo}
          placeholder="12-digit PhilSys registry number"
          disabled={disabled}
          onChange={(e) => setForm((prev) => ({ ...prev, philsysNo: e.target.value }))}
        />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <Field label="Mobile Number">
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
                  form.contactPhone && !validatePhilippineMobile(form.contactPhone).isValid
                    ? "var(--cbms-red, #dc2626)"
                    : undefined,
              }}
              value={form.contactPhone}
              disabled={disabled}
              onChange={(e) => setForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
            />
          </div>
          {form.contactPhone && !validatePhilippineMobile(form.contactPhone).isValid && (
            <div style={{ fontSize: 11, color: "var(--cbms-red, #dc2626)", marginTop: 4 }}>
              ⚠️ {validatePhilippineMobile(form.contactPhone).error}
            </div>
          )}
        </Field>
        <Field label="Email Address">
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
              placeholder="name@example.com"
              style={{
                paddingLeft: 34,
                borderColor:
                  form.contactEmail && !validateEmail(form.contactEmail).isValid
                    ? "var(--cbms-red, #dc2626)"
                    : undefined,
              }}
              value={form.contactEmail}
              disabled={disabled}
              onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
            />
          </div>
          {form.contactEmail && !validateEmail(form.contactEmail).isValid && (
            <div style={{ fontSize: 11, color: "var(--cbms-red, #dc2626)", marginTop: 4 }}>
              ⚠️ {validateEmail(form.contactEmail).error}
            </div>
          )}
        </Field>
      </div>
    </>
  );
}
