"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useInhabitantStore } from "../../../../../store/inhabitantStore";
import { qs, useApi, ApiError } from "@cbms/api-client";
import {
  Alert,
  Button,
  DataTable,
  Field,
  PageHead,
  Panel,
  StatusChip,
  date,
  fullName,
  peso,
  titleize,
} from "@cbms/ui";
import { Async, ActionResult, Tabs } from "../../../../../components/common";
import type { Household, Inhabitant, Paged } from "../../../../../lib/types";

const SECTOR_FLAGS: Array<{ key: FlagKey; label: string }> = [
  { key: "isSenior", label: "Senior citizen" },
  { key: "isPwd", label: "Person with disability" },
  { key: "isSoloParent", label: "Solo parent" },
  { key: "is4Ps", label: "4Ps beneficiary" },
  { key: "isIndigenous", label: "Indigenous people" },
  { key: "isDeceased", label: "Deceased" }
];

type FlagKey = "isSenior" | "isPwd" | "isSoloParent" | "is4Ps" | "isIndigenous" | "isDeceased";
type TabKey = "edit" | "history";

interface TimelineTransaction {
  id: string;
  type: string;
  description: string;
  amount: number;
  status: string;
  date: string;
}

export default function EditInhabitantPage() {
  const params = useParams();
  const router = useRouter();
  const id = String((params as Record<string, string | string[]>)?.id ?? "");

  const { inhabitants, updateInhabitant, deleteInhabitant, fetchInhabitants } = useInhabitantStore();
  const households = useApi<Paged<Household>>("/households?pageSize=200");
  
  // Delete Popup State
  const [showDeletePopup, setShowDeletePopup] = React.useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = React.useState(false);
  
  // Consolidated timeline data fetching
  const history = useApi<TimelineTransaction[]>(id ? `/inhabitants/${id}/transactions` : null);

  const [tab, setTab] = React.useState<TabKey>("edit");
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
    contactEmail: "",
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
    isDeceased: false
  });

  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      if (inhabitants.length === 0) {
        await fetchInhabitants();
      }
    }
    loadData();
  }, []);

  React.useEffect(() => {
    const inh = inhabitants.find((x: Inhabitant) => x.id === id);
    if (inh) {
      setForm({
        firstName: inh.firstName || "",
        middleName: inh.middleName || "",
        lastName: inh.lastName || "",
        suffix: inh.suffix || "",
        sex: inh.sex || "male",
        birthDate: inh.birthDate ? inh.birthDate.split("T")[0] : "",
        birthPlace: inh.birthPlace || "",
        civilStatus: inh.civilStatus || "single",
        philsysNo: inh.philsysNo || "",
        contactPhone: inh.contactPhone || "",
        contactEmail: inh.contactEmail || "",
        occupation: inh.occupation || "",
        educationLevel: inh.educationLevel || "",
        householdId: inh.householdId || "",
        relationToHead: inh.relationToHead || "",
      });
      setFlags({
        isSenior: !!inh.isSenior,
        isPwd: !!inh.isPwd,
        isSoloParent: !!inh.isSoloParent,
        is4Ps: !!inh.is4Ps,
        isIndigenous: !!inh.isIndigenous,
        isDeceased: !!inh.isDeceased
      });
      setLoading(false);
    }
  }, [inhabitants, id]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = {
        ...form,
        ...flags,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      };
      await updateInhabitant(id, payload);
      router.push(`/inhabitants`);
    } catch (err: any) {
      setError(err.message || "Could not save the changes.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    setBusy(true);
    setError(null);
    try {
      await deleteInhabitant(id);
      setShowDeletePopup(false);
      router.push("/inhabitants");
    } catch (err: any) {
      setError(err.message || "Failed to delete inhabitant.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading inhabitant details...</div>;
  }

  return (
    <>
      <PageHead
        title={`Edit Inhabitant: ${form.firstName} ${form.lastName}`}
        subtitle="Modify profile fields, check dynamic transaction timeline, or adjust sectoral flags."
        breadcrumb="Residents / Inhabitants"
        parity="BIPS"
        actions={
          <div style={{ display: "flex", gap: "0.5rem", position: "relative" }}>
            <button type="button" className="cbms-btn" onClick={() => router.push("/inhabitants")}>
              Cancel
            </button>
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                className="cbms-btn cbms-btn--primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: "0.5rem 1rem",
                  fontSize: "0.875rem",
                  cursor: "pointer"
                }}
              >
                ⚙️ Actions ▾
              </button>
              {showActionsDropdown && (
                <>
                  <div 
                    style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }} 
                    onClick={() => setShowActionsDropdown(false)}
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "110%",
                      backgroundColor: "var(--color-bg-card, #ffffff)",
                      border: "1px solid var(--color-border, #e2e8f0)",
                      borderRadius: "0.375rem",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      zIndex: 110,
                      minWidth: "180px",
                      display: "flex",
                      flexDirection: "column",
                      padding: "0.25rem 0"
                    }}
                  >
                    <button
                      type="submit"
                      form="edit-inhabitant-form"
                      onClick={() => setShowActionsDropdown(false)}
                      disabled={busy}
                      style={{
                        padding: "0.6rem 1rem",
                        textAlign: "left",
                        border: "none",
                        background: "none",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "var(--color-text, #1b2430)",
                        width: "100%"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      💾 Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowActionsDropdown(false);
                        setShowDeletePopup(true);
                      }}
                      disabled={busy}
                      style={{
                        padding: "0.6rem 1rem",
                        textAlign: "left",
                        border: "none",
                        background: "none",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "var(--cbms-red, #ce1126)",
                        width: "100%"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      🗑️ Delete Profile
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        }
      />

      <ActionResult error={error} />

      <Tabs<TabKey>
        tabs={[
          { value: "edit", label: "View/Edit Profile" },
          { value: "history", label: "Transaction History" },
        ]}
        value={tab}
        onChange={(t) => {
          setTab(t);
          if (t === "history") {
            history.reload();
          }
        }}
      />

      <div style={{ display: tab === "edit" ? "block" : "none" }}>
        <form onSubmit={save} id="edit-inhabitant-form">
          <div className="cbms-grid-2" style={{ marginTop: "1rem" }}>
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
                <Field label="Email Address">
                  <input
                    className="cbms-input"
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => set("contactEmail", e.target.value)}
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
                  {(households.data?.items ?? []).map((h: Household) => (
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
            </Panel>
          </div>

        </form>
      </div>

      <div style={{ display: tab === "history" ? "block" : "none" }}>
        <div style={{ marginTop: "1rem" }}>
          <Panel title="Citizen Transaction Ledger">
            <Async loading={history.loading} error={history.error}>
              <DataTable
                columns={[
                  {
                    key: "date",
                    header: "Date/Time",
                    render: (r) => (
                      <>
                        <div className="cbms-table__primary">{date(r.date)}</div>
                        <div className="cbms-table__muted">
                          {new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </>
                    )
                  },
                  {
                    key: "description",
                    header: "Transaction Description",
                    render: (r) => (
                      <>
                        <div className="cbms-table__primary">{r.description}</div>
                        <div className="cbms-table__muted">Reference: {r.id}</div>
                      </>
                    )
                  },
                  {
                    key: "amount",
                    header: "Amount (PHP)",
                    align: "right",
                    render: (r) => r.amount === 0 ? "Free" : peso(r.amount)
                  },
                  {
                    key: "status",
                    header: "Status",
                    render: (r) => <StatusChip status={r.status} />
                  }
                ]}
                rows={history.data || []}
                empty="No transactions on file for this inhabitant."
              />
            </Async>
          </Panel>
        </div>
      </div>

      {/* Delete Popup Confirmation Dialog */}
      {showDeletePopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 2000,
            display: "grid",
            placeItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--color-bg-card, #ffffff)",
              border: "1px solid var(--color-border, #e2e8f0)",
              borderRadius: "0.5rem",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "400px",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: "bold", color: "var(--cbms-red, #ce1126)" }}>
                ⚠️ Delete Inhabitant Profile
              </h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--cbms-muted, #64748b)", lineHeight: "1.4" }}>
                Are you sure you want to delete this inhabitant record? This will completely remove them from the roster. This action is irreversible.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button
                type="button"
                disabled={busy}
                onClick={() => setShowDeletePopup(false)}
                className="cbms-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={confirmDelete}
                className="cbms-btn"
                style={{ backgroundColor: "var(--cbms-red, #ce1126)", color: "#fff", border: "none" }}
              >
                {busy ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
