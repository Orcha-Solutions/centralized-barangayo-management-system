"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useInhabitantStore } from "../../../../../store/inhabitantStore";
import { useHouseholdStore } from "../../../../../store/householdStore";
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
import type { Household, Inhabitant } from "../../../../../lib/types";

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
  const { households, fetchHouseholds } = useHouseholdStore();
  
  // Delete Popup State
  const [showDeletePopup, setShowDeletePopup] = React.useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = React.useState(false);

  // Household search state
  const [householdSearch, setHouseholdSearch] = React.useState("");
  const [isSearchingHousehold, setIsSearchingHousehold] = React.useState(false);
  
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
    citizenship: "Filipino",
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
      if (households.length === 0) {
        await fetchHouseholds();
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
        citizenship: inh.citizenship || "Filipino",
        philsysNo: inh.philsysNo || "",
        contactPhone: inh.contactPhone || "",
        contactEmail: inh.contactEmail || "",
        occupation: inh.occupation || "",
        educationLevel: inh.educationLevel || "",
        householdId: inh.householdId || "",
        relationToHead: inh.relationToHead || "Head",
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

  const selectedHousehold = React.useMemo(() => {
    if (!form.householdId) return null;
    return households.find((h) => h.id === form.householdId);
  }, [households, form.householdId]);

  const matchedHouseholds = React.useMemo(() => {
    if (!householdSearch.trim()) return households.slice(0, 15);
    const query = householdSearch.toLowerCase();
    return households.filter((h) => {
      const no = h.householdNo?.toLowerCase() || "";
      const addr = h.addressLine?.toLowerCase() || "";
      const p = h.purok?.toLowerCase() || "";
      const st = h.street?.toLowerCase() || "";
      return no.includes(query) || addr.includes(query) || p.includes(query) || st.includes(query);
    }).slice(0, 15);
  }, [households, householdSearch]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await updateInhabitant(id, {
        ...form,
        ...flags,
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim(),
        lastName: form.lastName.trim(),
        suffix: form.suffix.trim(),
        birthDate: new Date(form.birthDate).toISOString(),
        householdId: form.householdId || null,
        relationToHead: form.householdId ? form.relationToHead : null,
      });
      router.push(`/inhabitants`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the changes.");
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
        title={`Edit Profile: ${form.firstName} ${form.lastName}`}
        subtitle="Citizen master profile and timeline history."
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
                <Field label="Suffix">
                  <input
                    className="cbms-input"
                    value={form.suffix}
                    onChange={(e) => set("suffix", e.target.value)}
                    placeholder="Jr., III, …"
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
                    onChange={(e) => set("citizenship", e.target.value)}
                    required
                  />
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

            <Panel title="Contact, Household Assignment & Sectoral">
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

              {/* Searchable Household Assignment Section */}
              <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--color-border, #e2e8f0)" }}>
                <Field label="Household Folder & Address" hint="Attach resident to a household folder">
                  {form.householdId && !isSearchingHousehold ? (
                    <div
                      style={{
                        border: "1px solid var(--color-border, #e2e8f0)",
                        borderRadius: "0.375rem",
                        padding: "0.75rem",
                        backgroundColor: "var(--color-bg-hover, #f8fafc)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text, #1b2430)" }}>
                          🏠 {selectedHousehold?.householdNo || "Household " + form.householdId}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--cbms-muted, #64748b)" }}>
                          {selectedHousehold?.addressLine || "No address recorded"} · {selectedHousehold?.purok || "—"}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          type="button"
                          className="cbms-btn"
                          style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                          onClick={() => {
                            setIsSearchingHousehold(true);
                            setHouseholdSearch("");
                          }}
                        >
                          🔍 Change
                        </button>
                        <button
                          type="button"
                          className="cbms-btn"
                          style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", color: "var(--cbms-red, #ce1126)" }}
                          onClick={() => {
                            setForm((prev) => ({ ...prev, householdId: "", relationToHead: "" }));
                            setIsSearchingHousehold(false);
                          }}
                        >
                          ✕ Clear
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ position: "relative" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                          className="cbms-input"
                          placeholder="🔍 Type to search household no., street, address…"
                          value={householdSearch}
                          onChange={(e) => {
                            setHouseholdSearch(e.target.value);
                            setIsSearchingHousehold(true);
                          }}
                          onFocus={() => setIsSearchingHousehold(true)}
                        />
                        {form.householdId && (
                          <button
                            type="button"
                            className="cbms-btn"
                            style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem" }}
                            onClick={() => setIsSearchingHousehold(false)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      {isSearchingHousehold && (
                        <>
                          <div
                            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1100 }}
                            onClick={() => setIsSearchingHousehold(false)}
                          />
                          <div
                            style={{
                              position: "absolute",
                              top: "105%",
                              left: 0,
                              right: 0,
                              backgroundColor: "var(--color-bg-card, #ffffff)",
                              border: "1px solid var(--color-border, #e2e8f0)",
                              borderRadius: "0.375rem",
                              boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                              maxHeight: "200px",
                              overflowY: "auto",
                              zIndex: 1200,
                            }}
                          >
                            <div
                              style={{
                                padding: "0.5rem 0.75rem",
                                borderBottom: "1px solid var(--color-border, #e2e8f0)",
                                fontSize: "0.75rem",
                                color: "var(--cbms-muted, #64748b)",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setForm((prev) => ({ ...prev, householdId: "", relationToHead: "" }));
                                setIsSearchingHousehold(false);
                                setHouseholdSearch("");
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)")}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                            >
                              — 🚫 Unassigned / Not in a Household —
                            </div>
                            {matchedHouseholds.length === 0 ? (
                              <div style={{ padding: "0.75rem", fontSize: "0.8rem", color: "var(--cbms-muted, #64748b)" }}>
                                No households match "{householdSearch}"
                              </div>
                            ) : (
                              matchedHouseholds.map((h) => (
                                <div
                                  key={h.id}
                                  style={{
                                    padding: "0.6rem 0.75rem",
                                    borderBottom: "1px solid var(--color-border, #f1f5f9)",
                                    cursor: "pointer",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                  onClick={() => {
                                    setForm((prev) => ({
                                      ...prev,
                                      householdId: h.id,
                                      relationToHead: prev.relationToHead || "Head",
                                    }));
                                    setIsSearchingHousehold(false);
                                    setHouseholdSearch("");
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)")}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                >
                                  <div>
                                    <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--color-text, #1b2430)" }}>
                                      🏠 {h.householdNo}
                                    </div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--cbms-muted, #64748b)" }}>
                                      {h.addressLine || "No address line"}
                                    </div>
                                  </div>
                                  <span style={{ fontSize: "0.75rem", color: "var(--cbms-muted, #64748b)", background: "var(--color-bg-hover, #f1f5f9)", padding: "0.2rem 0.4rem", borderRadius: "0.25rem" }}>
                                    {h.purok || "Purok —"}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </Field>

                {form.householdId && (
                  <div style={{ marginTop: "0.75rem" }}>
                    <Field label="Relation to Head of Household">
                      <select
                        className="cbms-select"
                        value={form.relationToHead}
                        onChange={(e) => setForm((prev) => ({ ...prev, relationToHead: e.target.value }))}
                      >
                        <option value="Head">Head of Household</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Son">Son</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Brother">Brother</option>
                        <option value="Sister">Sister</option>
                        <option value="Grandfather">Grandfather</option>
                        <option value="Grandmother">Grandmother</option>
                        <option value="Grandson">Grandson</option>
                        <option value="Granddaughter">Granddaughter</option>
                        <option value="Son-in-Law">Son-in-Law</option>
                        <option value="Daughter-in-Law">Daughter-in-Law</option>
                        <option value="Relative">Other Relative</option>
                        <option value="Househelper / Domestic">Househelper / Domestic Worker</option>
                        <option value="Boarder / Non-Relative">Boarder / Non-Relative</option>
                      </select>
                    </Field>
                  </div>
                )}
              </div>

              <div className="cbms-label" style={{ marginTop: 12 }}>
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
                    render: (r: TimelineTransaction) => (
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
                    render: (r: TimelineTransaction) => (
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
                    render: (r: TimelineTransaction) => r.amount === 0 ? "Free" : peso(r.amount)
                  },
                  {
                    key: "status",
                    header: "Status",
                    render: (r: TimelineTransaction) => <StatusChip status={r.status} />
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
                Are you sure you want to delete this inhabitant's profile? This will remove their registration from the citizen database. This action is irreversible.
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
