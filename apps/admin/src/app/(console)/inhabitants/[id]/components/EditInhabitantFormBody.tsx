"use client";

import * as React from "react";
import { Alert, Field } from "@cbms/ui";
import type { Household } from "../../../../../lib/types";
import { InhabitantHouseholdPicker } from "./InhabitantHouseholdPicker";

export interface EditInhabitantFormValues {
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
  telephoneNumber: string;
  occupation: string;
  educationLevel: string;
  householdId: string;
  relationToHead: string;
}

export interface EditInhabitantFlags {
  isSenior: boolean;
  isPwd: boolean;
  isSoloParent: boolean;
  is4Ps: boolean;
  isIndigenous: boolean;
}

export interface EditInhabitantFormBodyProps {
  form: EditInhabitantFormValues;
  setForm: React.Dispatch<React.SetStateAction<EditInhabitantFormValues>>;
  flags: EditInhabitantFlags;
  setFlags: React.Dispatch<React.SetStateAction<EditInhabitantFlags>>;
  households: Household[];
  busy: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export function EditInhabitantFormBody({
  form,
  setForm,
  flags,
  setFlags,
  households,
  busy,
  error,
  onSubmit,
}: EditInhabitantFormBodyProps) {
  return (
    <form
      id="inhabitant-edit-form"
      onSubmit={onSubmit}
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.35rem",
      }}
    >
      {error && (
        <Alert tone="danger">
          <strong>Update Error:</strong> {error}
        </Alert>
      )}

      {/* 1. Identity & Vital Demographics */}
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "0.625rem",
          padding: "1.15rem",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: "0.88rem",
            fontWeight: 700,
            color: "var(--cbms-navy, #0a2463)",
            marginBottom: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            borderBottom: "1px solid #f1f5f9",
            paddingBottom: "0.4rem",
          }}
        >
          <span>👤</span> Identity & Vital Demographics
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <Field label="First Name *">
            <input
              type="text"
              className="cbms-input"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              disabled={busy}
              required
            />
          </Field>
          <Field label="Middle Name">
            <input
              type="text"
              className="cbms-input"
              value={form.middleName}
              onChange={(e) => setForm({ ...form, middleName: e.target.value })}
              disabled={busy}
            />
          </Field>
          <Field label="Last Name *">
            <input
              type="text"
              className="cbms-input"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              disabled={busy}
              required
            />
          </Field>
          <Field label="Suffix (Jr., III)">
            <input
              type="text"
              className="cbms-input"
              value={form.suffix}
              onChange={(e) => setForm({ ...form, suffix: e.target.value })}
              disabled={busy}
            />
          </Field>
          <Field label="Sex *">
            <select
              className="cbms-select"
              value={form.sex}
              onChange={(e) => setForm({ ...form, sex: e.target.value })}
              disabled={busy}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </Field>
          <Field label="Birth Date *">
            <input
              type="date"
              className="cbms-input"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              disabled={busy}
              required
            />
          </Field>
          <Field label="Birth Place">
            <input
              type="text"
              className="cbms-input"
              value={form.birthPlace}
              onChange={(e) => setForm({ ...form, birthPlace: e.target.value })}
              disabled={busy}
            />
          </Field>
          <Field label="Civil Status">
            <select
              className="cbms-select"
              value={form.civilStatus}
              onChange={(e) => setForm({ ...form, civilStatus: e.target.value })}
              disabled={busy}
            >
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="widowed">Widowed</option>
              <option value="separated">Separated</option>
              <option value="divorced">Divorced</option>
              <option value="cohabiting">Cohabiting / Common Law</option>
            </select>
          </Field>
          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="PhilSys Card Number (PCN)">
              <input
                type="text"
                className="cbms-input"
                placeholder="16-digit PhilSys Card Number"
                value={form.philsysNo}
                onChange={(e) => setForm({ ...form, philsysNo: e.target.value })}
                disabled={busy}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* 2. Contact & Livelihood */}
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "0.625rem",
          padding: "1.15rem",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: "0.88rem",
            fontWeight: 700,
            color: "var(--cbms-navy, #0a2463)",
            marginBottom: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            borderBottom: "1px solid #f1f5f9",
            paddingBottom: "0.4rem",
          }}
        >
          <span>📱</span> Contact & Livelihood
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <Field label="Mobile Phone">
            <input
              type="tel"
              className="cbms-input"
              placeholder="0917 123 4567"
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              disabled={busy}
            />
          </Field>
          <Field label="Email Address">
            <input
              type="email"
              className="cbms-input"
              placeholder="citizen@example.com"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              disabled={busy}
            />
          </Field>
          <Field label="Occupation">
            <input
              type="text"
              className="cbms-input"
              placeholder="e.g. Employee, Self-employed"
              value={form.occupation}
              onChange={(e) => setForm({ ...form, occupation: e.target.value })}
              disabled={busy}
            />
          </Field>
          <Field label="Education Level">
            <input
              type="text"
              className="cbms-input"
              placeholder="e.g. College Graduate"
              value={form.educationLevel}
              onChange={(e) => setForm({ ...form, educationLevel: e.target.value })}
              disabled={busy}
            />
          </Field>
        </div>
      </div>

      {/* 3. Sectoral & Beneficiary Classification */}
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "0.625rem",
          padding: "1.15rem",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: "0.88rem",
            fontWeight: 700,
            color: "var(--cbms-navy, #0a2463)",
            marginBottom: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            borderBottom: "1px solid #f1f5f9",
            paddingBottom: "0.4rem",
          }}
        >
          <span>🏷️</span> Sectoral & Beneficiary Classification
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          {[
            { key: "isSenior", label: "Senior Citizen (60+ years old)", tag: "OSCA" },
            { key: "isPwd", label: "Person with Disability (PWD)", tag: "PDAO" },
            { key: "isSoloParent", label: "Solo Parent (RA 11861)", tag: "MSWD" },
            { key: "is4Ps", label: "4Ps Beneficiary (Pantawid Pamilya)", tag: "DSWD" },
            { key: "isIndigenous", label: "Indigenous Cultural Community (IP)", tag: "NCIP" },
          ].map(({ key, label, tag }) => (
            <label
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.375rem",
                backgroundColor: flags[key as keyof typeof flags] ? "#eff6ff" : "#f8fafc",
                border: flags[key as keyof typeof flags] ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="checkbox"
                  checked={flags[key as keyof typeof flags]}
                  onChange={(e) => setFlags({ ...flags, [key]: e.target.checked })}
                  disabled={busy}
                  style={{ width: 16, height: 16 }}
                />
                <span style={{ fontSize: "0.85rem", fontWeight: flags[key as keyof typeof flags] ? 600 : 400, color: "#1e293b" }}>
                  {label}
                </span>
              </div>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  padding: "2px 6px",
                  borderRadius: "4px",
                  backgroundColor: flags[key as keyof typeof flags] ? "#2563eb" : "#e2e8f0",
                  color: flags[key as keyof typeof flags] ? "#ffffff" : "#64748b",
                }}
              >
                {tag}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 4. Household Assignment & Relation (Lazy Loaded Dropdown) */}
      <InhabitantHouseholdPicker
        householdId={form.householdId}
        relationToHead={form.relationToHead}
        households={households}
        disabled={busy}
        onChange={(newHId, newRelation) => {
          setForm((prev) => ({
            ...prev,
            householdId: newHId,
            relationToHead: newRelation !== undefined ? newRelation : prev.relationToHead,
          }));
        }}
      />
    </form>
  );
}
