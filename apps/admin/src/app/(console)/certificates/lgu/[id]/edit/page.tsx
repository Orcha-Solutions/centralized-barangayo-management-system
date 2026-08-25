"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useLguDocStore } from "../../../../../../store/lguDocStore";
import { useInhabitantStore } from "../../../../../../store/inhabitantStore";
import { useApi } from "@cbms/api-client";
import {
  Alert,
  Button,
  Chip,
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
import { Async, ActionResult, Tabs } from "../../../../../../components/common";
import { useConsole } from "../../../../../../components/Shell";
import type { Inhabitant } from "../../../../../../lib/types";

type TabKey = "edit" | "timeline";

interface LguTimelineEvent {
  id: string;
  action: string;
  description: string;
  status: string;
  date: string;
  actor: string;
}

export default function EditLguRequestPage() {
  const params = useParams();
  const router = useRouter();
  const { can } = useConsole();
  const id = String((params as Record<string, string | string[]>)?.id ?? "");

  const { lguRequests, updateLguRequest, deleteLguRequest, fetchLguRequests } = useLguDocStore();
  const { inhabitants, fetchInhabitants } = useInhabitantStore();

  const timeline = useApi<LguTimelineEvent[]>(id ? `/lgu-requests/${id}/timeline` : null);

  const [tab, setTab] = React.useState<TabKey>("edit");
  const [showActionsDropdown, setShowActionsDropdown] = React.useState(false);
  const [showDeletePopup, setShowDeletePopup] = React.useState(false);

  // Searchable inhabitant state
  const [inhabitantSearch, setInhabitantSearch] = React.useState("");
  const [isSearchingInhabitant, setIsSearchingInhabitant] = React.useState(false);

  const [form, setForm] = React.useState({
    inhabitantId: "",
    docType: "business_permit",
    referenceNo: "",
    purpose: "",
    fee: "1500",
    status: "pending",
    orNumber: "",
    paidAt: "",
    remarks: "",
    attachmentName: "",
    attachmentUrl: "",
  });

  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const currentRequest = React.useMemo(() => {
    return lguRequests.find((r) => r.id === id);
  }, [lguRequests, id]);

  React.useEffect(() => {
    async function loadData() {
      if (lguRequests.length === 0) {
        await fetchLguRequests();
      }
      if (inhabitants.length === 0) {
        await fetchInhabitants();
      }
    }
    loadData();
  }, []);

  React.useEffect(() => {
    if (currentRequest) {
      setForm({
        inhabitantId: currentRequest.inhabitantId || "",
        docType: currentRequest.docType || "business_permit",
        referenceNo: currentRequest.referenceNo || "",
        purpose: currentRequest.purpose || "",
        fee: String(currentRequest.fee ?? 1500),
        status: currentRequest.status || "pending",
        orNumber: currentRequest.orNumber || "",
        paidAt: currentRequest.paidAt ? currentRequest.paidAt.split("T")[0] : "",
        remarks: currentRequest.remarks || "",
        attachmentName: currentRequest.attachmentName || "",
        attachmentUrl: currentRequest.attachmentUrl || "",
      });
      setLoading(false);
    }
  }, [currentRequest]);

  const selectedCitizen = React.useMemo(() => {
    if (!form.inhabitantId) return null;
    return inhabitants.find((i) => i.id === form.inhabitantId);
  }, [inhabitants, form.inhabitantId]);

  const matchedInhabitants = React.useMemo(() => {
    if (!inhabitantSearch.trim()) return inhabitants.slice(0, 15);
    const query = inhabitantSearch.toLowerCase();
    return inhabitants.filter((i) => {
      const name = `${i.firstName} ${i.lastName}`.toLowerCase();
      const pcn = i.philsysNo?.toLowerCase() || "";
      return name.includes(query) || pcn.includes(query);
    }).slice(0, 15);
  }, [inhabitants, inhabitantSearch]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await updateLguRequest(id, {
        ...form,
        fee: Number(form.fee) || 0,
        paidAt: form.paidAt ? new Date(form.paidAt).toISOString() : null,
      });
      router.push(`/certificates`);
    } catch (err: any) {
      setError(err.message || "Failed to update LGU document request.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    setBusy(true);
    setError(null);
    try {
      await deleteLguRequest(id);
      setShowDeletePopup(false);
      router.push(`/certificates`);
    } catch (err: any) {
      setError(err.message || "Failed to delete request.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading request details...</div>;
  }

  return (
    <>
      <PageHead
        title={`LGU Endorsement: ${form.referenceNo || id}`}
        subtitle={`Application for ${titleize(form.docType.replace(/_/g, " "))} · ${selectedCitizen ? fullName(selectedCitizen) : "Resident"}`}
        breadcrumb="Services / Document Requests"
        parity="BCIS"
        actions={
          <div style={{ display: "flex", gap: "0.5rem", position: "relative" }}>
            <button type="button" className="cbms-btn" onClick={() => router.push("/certificates")}>
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
                      form="edit-lgu-form"
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
                      🗑️ Delete Request
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
          { value: "edit", label: "View/Edit Request" },
          { value: "timeline", label: "Processing Timeline & Audit" },
        ]}
        value={tab}
        onChange={(t) => {
          setTab(t);
          if (t === "timeline") {
            timeline.reload();
          }
        }}
      />

      <div style={{ display: tab === "edit" ? "block" : "none" }}>
        <form onSubmit={save} id="edit-lgu-form">
          <div className="cbms-grid-2" style={{ marginTop: "1rem" }}>
            {/* Panel 1: Applicant & Permit Details */}
            <Panel title="Applicant & Endorsement Details">
              <div className="adm-form-grid">
                <Field label="Reference Tracking Number">
                  <input
                    className="cbms-input"
                    value={form.referenceNo}
                    onChange={(e) => set("referenceNo", e.target.value)}
                    required
                  />
                </Field>

                <Field label="Permit / Clearance Type">
                  <select
                    className="cbms-select"
                    value={form.docType}
                    onChange={(e) => set("docType", e.target.value)}
                  >
                    <option value="business_permit">Mayor's / Business Permit Endorsement</option>
                    <option value="building_permit">Building Permit & Locational Clearance</option>
                    <option value="zoning_clearance">City Zoning & Land Use Clearance</option>
                    <option value="rpt_clearance">Real Property Tax (RPT) Clearance</option>
                    <option value="sanitary_permit">City Health & Sanitary Permit</option>
                  </select>
                </Field>
              </div>

              {/* Searchable Inhabitant Selector */}
              <div style={{ marginTop: "1rem", borderTop: "1px solid var(--color-border, #e2e8f0)", paddingTop: "0.75rem" }}>
                <Field label="Resident Citizen Applicant" hint="Link endorsement to registered inhabitant">
                  {form.inhabitantId && !isSearchingInhabitant ? (
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
                          👤 {selectedCitizen ? fullName(selectedCitizen) : "Citizen " + form.inhabitantId}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--cbms-muted, #64748b)" }}>
                          {selectedCitizen?.philsysNo ? `PCN ${selectedCitizen.philsysNo}` : "No PhilSys on file"} · {selectedCitizen?.household?.addressLine || "Barangay Resident"}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="cbms-btn"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                        onClick={() => {
                          setIsSearchingInhabitant(true);
                          setInhabitantSearch("");
                        }}
                      >
                        🔍 Change Resident
                      </button>
                    </div>
                  ) : (
                    <div style={{ position: "relative" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                          className="cbms-input"
                          placeholder="🔍 Type to search citizen by name or PCN…"
                          value={inhabitantSearch}
                          onChange={(e) => {
                            setInhabitantSearch(e.target.value);
                            setIsSearchingInhabitant(true);
                          }}
                          onFocus={() => setIsSearchingInhabitant(true)}
                        />
                        {form.inhabitantId && (
                          <button
                            type="button"
                            className="cbms-btn"
                            style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem" }}
                            onClick={() => setIsSearchingInhabitant(false)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      {isSearchingInhabitant && (
                        <>
                          <div
                            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1100 }}
                            onClick={() => setIsSearchingInhabitant(false)}
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
                            {matchedInhabitants.length === 0 ? (
                              <div style={{ padding: "0.75rem", fontSize: "0.8rem", color: "var(--cbms-muted, #64748b)" }}>
                                No residents match "{inhabitantSearch}"
                              </div>
                            ) : (
                              matchedInhabitants.map((c) => (
                                <div
                                  key={c.id}
                                  style={{
                                    padding: "0.6rem 0.75rem",
                                    borderBottom: "1px solid var(--color-border, #f1f5f9)",
                                    cursor: "pointer",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                  onClick={() => {
                                    setForm((prev) => ({ ...prev, inhabitantId: c.id }));
                                    setIsSearchingInhabitant(false);
                                    setInhabitantSearch("");
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)")}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                >
                                  <div>
                                    <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--color-text, #1b2430)" }}>
                                      {fullName(c)}
                                    </div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--cbms-muted, #64748b)" }}>
                                      {c.philsysNo ? `PCN ${c.philsysNo}` : "No PhilSys"}
                                    </div>
                                  </div>
                                  <span style={{ fontSize: "0.75rem", color: "var(--cbms-muted, #64748b)" }}>
                                    {c.household?.purok || "Purok —"}
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
              </div>

              <div style={{ marginTop: "1rem" }}>
                <Field label="Application Purpose & Scope">
                  <textarea
                    className="cbms-input"
                    style={{ minHeight: "75px" }}
                    placeholder="e.g. New Sari-sari Store Business Permit Endorsement for FY 2026..."
                    value={form.purpose}
                    onChange={(e) => set("purpose", e.target.value)}
                    required
                  />
                </Field>
              </div>
            </Panel>

            {/* Panel 2: Fees, Approval Status & Uploads */}
            <Panel title="Fee Assessment & Approval Status">
              <div className="adm-form-grid">
                <Field label="Processing & Endorsement Fee (PHP ₱)">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className="cbms-input"
                    value={form.fee}
                    onChange={(e) => set("fee", e.target.value)}
                    required
                  />
                </Field>

                <Field label="Approval / Clearance Status">
                  <select
                    className="cbms-select"
                    value={form.status}
                    onChange={(e) => set("status", e.target.value)}
                  >
                    <option value="pending">Pending Review</option>
                    <option value="under_review">Under Review / Verification</option>
                    <option value="approved">Approved & Endorsed to LGU</option>
                    <option value="released">Released to Citizen</option>
                    <option value="rejected">Rejected / Returned</option>
                  </select>
                </Field>

                <Field label="Official Receipt (OR) Number">
                  <input
                    className="cbms-input"
                    placeholder="e.g. OR-2026-8849"
                    value={form.orNumber}
                    onChange={(e) => set("orNumber", e.target.value)}
                  />
                </Field>

                <Field label="Payment Date">
                  <input
                    type="date"
                    className="cbms-input"
                    value={form.paidAt}
                    onChange={(e) => set("paidAt", e.target.value)}
                  />
                </Field>
              </div>

              {/* Requirement Uploads / Attachment Mock */}
              <div style={{ marginTop: "1rem", borderTop: "1px solid var(--color-border, #e2e8f0)", paddingTop: "0.75rem" }}>
                <Field label="Requirement Attachment (Scanned DTI/ID/Plans)">
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      className="cbms-input"
                      placeholder="e.g. DTI_Certificate_2026.pdf or Lease_Contract.jpg"
                      value={form.attachmentName}
                      onChange={(e) => set("attachmentName", e.target.value)}
                    />
                    <button
                      type="button"
                      className="cbms-btn"
                      onClick={() => {
                        if (!form.attachmentName) {
                          set("attachmentName", `Permit_Requirements_${form.referenceNo || "DOC"}.pdf`);
                        }
                      }}
                    >
                      📎 Attach File
                    </button>
                  </div>
                </Field>
              </div>

              <div style={{ marginTop: "1rem" }}>
                <Field label="Official Evaluator Notes & Remarks">
                  <textarea
                    className="cbms-input"
                    style={{ minHeight: "65px" }}
                    placeholder="Internal validation remarks, site inspection results..."
                    value={form.remarks}
                    onChange={(e) => set("remarks", e.target.value)}
                  />
                </Field>
              </div>
            </Panel>
          </div>
        </form>
      </div>

      <div style={{ display: tab === "timeline" ? "block" : "none" }}>
        <div style={{ marginTop: "1rem" }}>
          <Panel title="Application Lifecycle & Endorsement Ledger">
            <Async loading={timeline.loading} error={timeline.error}>
              <DataTable
                columns={[
                  {
                    key: "date",
                    header: "Date/Time",
                    render: (r: LguTimelineEvent) => (
                      <>
                        <div className="cbms-table__primary">{date(r.date)}</div>
                        <div className="cbms-table__muted">
                          {new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </>
                    )
                  },
                  {
                    key: "action",
                    header: "Action / Stage",
                    render: (r: LguTimelineEvent) => (
                      <>
                        <div className="cbms-table__primary">{r.action}</div>
                        <div className="cbms-table__muted">{r.description}</div>
                      </>
                    )
                  },
                  {
                    key: "actor",
                    header: "Handled By",
                    render: (r: LguTimelineEvent) => r.actor
                  },
                  {
                    key: "status",
                    header: "Stage Status",
                    render: (r: LguTimelineEvent) => <StatusChip status={r.status} />
                  }
                ]}
                rows={timeline.data || []}
                empty="No audit timeline events recorded."
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
                ⚠️ Delete LGU Endorsement Request
              </h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--cbms-muted, #64748b)", lineHeight: "1.4" }}>
                Are you sure you want to delete this endorsement record ({form.referenceNo})? This action is permanent and cannot be undone.
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
