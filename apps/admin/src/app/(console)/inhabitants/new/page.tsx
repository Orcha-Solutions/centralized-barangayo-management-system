"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ApiError, post, useApi } from "@cbms/api-client";
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

const SECTOR_FLAGS: Array<{ key: FlagKey; label: string }> = [
  { key: "isSenior", label: "Senior citizen" },
  { key: "isPwd", label: "Person with disability" },
  { key: "isSoloParent", label: "Solo parent" },
  { key: "is4Ps", label: "4Ps beneficiary" },
  { key: "isIndigenous", label: "Indigenous people" },
];

type FlagKey = "isSenior" | "isPwd" | "isSoloParent" | "is4Ps" | "isIndigenous";

export default function NewInhabitantPage() {
  const router = useRouter();
  const households = useApi<Paged<Household>>("/households?pageSize=200");

  const [form, setForm] = React.useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    sex: "male",
    birthDate: "",
    birthPlace: "",
    civilStatus: "single",
    philsysNo: "",
    contactPhone: "",
    occupation: "",
    educationLevel: "",
    householdId: "",
    relationToHead: "",
  });
  const [flags, setFlags] = React.useState<Record<FlagKey, boolean>>({
    isSenior: false,
    isPwd: false,
    isSoloParent: false,
    is4Ps: false,
    isIndigenous: false,
  });

  const [candidates, setCandidates] = React.useState<DuplicateCandidate[] | null>(null);
  const [dupMessage, setDupMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function payload(confirmDuplicate: boolean) {
    const body: Record<string, unknown> = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      sex: form.sex,
      birthDate: form.birthDate,
      civilStatus: form.civilStatus,
      confirmDuplicate,
      ...flags,
    };
    const optional: Array<keyof typeof form> = [
      "middleName",
      "suffix",
      "birthPlace",
      "philsysNo",
      "contactPhone",
      "occupation",
      "educationLevel",
      "householdId",
      "relationToHead",
    ];
    for (const k of optional) {
      const v = form[k].trim();
      if (v) body[k] = v;
    }
    return body;
  }

  async function save(confirmDuplicate: boolean) {
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
        setDupMessage(body.message ?? "A similar record already exists.");
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
        title="New inhabitant"
        subtitle="Encode a resident into the Record of Barangay Inhabitants. New records are created with source = CBMS; BIMS remains the system of record for migrated rows."
        breadcrumb="Residents / Inhabitants"
        parity="BIPS"
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
        <div className="cbms-grid-2">
          <Panel title="Identity">
            <div className="adm-form-grid">
              <Field label="First name">
                <input
                  className="cbms-input"
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  required
                />
              </Field>
              <Field label="Middle name">
                <input
                  className="cbms-input"
                  value={form.middleName}
                  onChange={(e) => set("middleName", e.target.value)}
                />
              </Field>
              <Field label="Last name">
                <input
                  className="cbms-input"
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  required
                />
              </Field>
              <Field label="Suffix" hint="Jr., III, …">
                <input
                  className="cbms-input"
                  value={form.suffix}
                  onChange={(e) => set("suffix", e.target.value)}
                />
              </Field>
              <Field label="Sex">
                <select
                  className="cbms-select"
                  value={form.sex}
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
                  onChange={(e) => set("civilStatus", e.target.value)}
                >
                  {["single", "married", "widowed", "separated", "annulled"].map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Birth date">
                <input
                  className="cbms-input"
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => set("birthDate", e.target.value)}
                  required
                />
              </Field>
              <Field label="Birth place">
                <input
                  className="cbms-input"
                  value={form.birthPlace}
                  onChange={(e) => set("birthPlace", e.target.value)}
                />
              </Field>
            </div>
          </Panel>

          <Panel title="Contact, household & sectoral">
            <div className="adm-form-grid">
              <Field label="PhilSys number (PCN)" hint="Optional — verified against a mock adapter.">
                <input
                  className="cbms-input"
                  value={form.philsysNo}
                  onChange={(e) => set("philsysNo", e.target.value)}
                />
              </Field>
              <Field label="Mobile number">
                <input
                  className="cbms-input"
                  value={form.contactPhone}
                  onChange={(e) => set("contactPhone", e.target.value)}
                />
              </Field>
              <Field label="Occupation">
                <input
                  className="cbms-input"
                  value={form.occupation}
                  onChange={(e) => set("occupation", e.target.value)}
                />
              </Field>
              <Field label="Education level">
                <input
                  className="cbms-input"
                  value={form.educationLevel}
                  onChange={(e) => set("educationLevel", e.target.value)}
                />
              </Field>
            </div>

            <Field label="Household">
              <select
                className="cbms-select"
                value={form.householdId}
                onChange={(e) => set("householdId", e.target.value)}
              >
                <option value="">— Not attached to a household —</option>
                {(households.data?.items ?? []).map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.householdNo} · {h.purok ?? "—"} · {h.addressLine}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Relation to head">
              <input
                className="cbms-input"
                value={form.relationToHead}
                onChange={(e) => set("relationToHead", e.target.value)}
                placeholder="head, spouse, child, …"
              />
            </Field>

            <div className="cbms-label" style={{ marginTop: 6 }}>
              Sectoral flags
            </div>
            <div className="adm-checks">
              {SECTOR_FLAGS.map((f) => (
                <label key={f.key}>
                  <input
                    type="checkbox"
                    checked={flags[f.key]}
                    onChange={(e) => setFlags((s) => ({ ...s, [f.key]: e.target.checked }))}
                  />
                  {f.label}
                </label>
              ))}
            </div>
            <div className="adm-kpi-note">
              Senior status is derived automatically from the birth date when left unchecked.
            </div>
          </Panel>
        </div>

        <div className="adm-row" style={{ marginTop: 16 }}>
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? "Saving…" : "Save inhabitant"}
          </Button>
          <span className="adm-muted">
            A duplicate check runs on surname + birth date before the record is written.
          </span>
        </div>
      </form>
    </>
  );
}
