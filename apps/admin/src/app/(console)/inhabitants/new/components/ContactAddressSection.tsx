"use client";

import * as React from "react";
import { Field, Panel } from "@cbms/ui";
import {
  DILG_RELATIONSHIP_CODES,
  DILG_INCOME_SOURCE_CODES,
} from "@cbms/api-client";
import type { Household } from "../../../../../lib/types";
import type { NewInhabitantFormData } from "../types";

interface ContactAddressSectionProps {
  form: NewInhabitantFormData;
  set: <K extends keyof NewInhabitantFormData>(key: K, value: NewInhabitantFormData[K]) => void;
  households: Household[];
  busy: boolean;
}

export function ContactAddressSection({
  form,
  set,
  households,
  busy,
}: ContactAddressSectionProps) {
  return (
    <Panel title="Part 2: Contact Details & Household Linking">
      <div className="adm-muted" style={{ marginBottom: 12 }}>
        Contact information and household affiliation
      </div>
      <div className="adm-form-grid">
        <Field label="Mobile Number (11-digit)">
          <input
            className="cbms-input"
            value={form.contactPhone}
            disabled={busy}
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
            disabled={busy}
            onChange={(e) => set("contactEmail", e.target.value)}
            placeholder="juan.delacruz@example.ph"
          />
        </Field>

        <Field label="Telephone Number">
          <input
            className="cbms-input"
            value={form.telephoneNumber}
            disabled={busy}
            onChange={(e) => set("telephoneNumber", e.target.value)}
            placeholder="02-81234567"
          />
        </Field>

        <Field label="Household Assignment">
          <select
            className="cbms-select"
            value={form.householdId}
            disabled={busy}
            onChange={(e) => set("householdId", e.target.value)}
          >
            <option value="">— Not attached to a household —</option>
            {households.map((h) => (
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
            disabled={busy}
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
            disabled={busy}
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
            disabled={busy}
            onChange={(e) => set("monthlyIncome", e.target.value)}
            placeholder="25000"
          />
        </Field>
      </div>
    </Panel>
  );
}
