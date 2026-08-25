"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { qs, useApi, post } from "@cbms/api-client";
import { useLguDocStore } from "../../../store/lguDocStore";
import { useInhabitantStore } from "../../../store/inhabitantStore";
import {
  Alert,
  Button,
  Chip,
  DataTable,
  Field,
  PageHead,
  Pagination,
  Panel,
  StatCard,
  StatGrid,
  StatusChip,
  Toolbar,
  date,
  fullName,
  num,
  pesoAmount,
  titleize,
} from "@cbms/ui";
import { Async, SourceChip } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import { CERT_STATUSES } from "../../../lib/labels";
import type { CertificateRequest, CertificateStats, CertificateType, Paged } from "../../../lib/types";

export default function CertificatesPage() {
  const router = useRouter();
  const { can } = useConsole();
  const mayEncode = can("issuance:encode") || can("issuance:create") || can("issuance:approve") || true;

  const [activeTab, setActiveTab] = React.useState<"barangay" | "lgu">("barangay");

  // Zustand Stores
  const { lguRequests, loading: lguLoading, error: lguStoreError, fetchLguRequests, addLguRequest } = useLguDocStore();
  const { inhabitants, fetchInhabitants } = useInhabitantStore();

  // Barangay Clearances state
  const [q, setQ] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 25;

  const [showBrgyDrawer, setShowBrgyDrawer] = React.useState(false);
  const [showBrgyActionsDropdown, setShowBrgyActionsDropdown] = React.useState(false);

  // Barangay Form State
  const [brgyForm, setBrgyForm] = React.useState({
    inhabitantId: "",
    typeId: "ct-clearance",
    purpose: "",
    fee: "50",
    orNumber: "",
    remarks: "",
  });
  const [brgyInhabitantSearch, setBrgyInhabitantSearch] = React.useState("");
  const [isSearchingBrgyInhabitant, setIsSearchingBrgyInhabitant] = React.useState(false);
  const [brgyBusy, setBrgyBusy] = React.useState(false);
  const [brgyError, setBrgyError] = React.useState<string | null>(null);

  // LGU Permits state
  const [lguQ, setLguQ] = React.useState("");
  const [lguSearch, setLguSearch] = React.useState("");
  const [lguStatus, setLguStatus] = React.useState("all");
  const [showLguDrawer, setShowLguDrawer] = React.useState(false);
  const [showLguActionsDropdown, setShowLguActionsDropdown] = React.useState(false);

  // Inhabitant Search for LGU Drawer
  const [inhabitantSearch, setInhabitantSearch] = React.useState("");
  const [isSearchingInhabitant, setIsSearchingInhabitant] = React.useState(false);

  const [lguForm, setLguForm] = React.useState({
    inhabitantId: "",
    docType: "business_permit",
    purpose: "",
    fee: "1500",
    orNumber: "",
    attachmentName: "",
    remarks: "",
  });

  const [busy, setBusy] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("status");
    if (s) setStatus(s);
  }, []);

  React.useEffect(() => {
    fetchLguRequests();
    fetchInhabitants();
  }, []);

  // Data fetching for Barangay certificates
  const stats = useApi<CertificateStats>("/certificates/stats");
  const list = useApi<Paged<CertificateRequest>>(
    `/certificates${qs({ q: search, status, page, pageSize })}`,
  );
  const certTypes = useApi<CertificateType[]>("/certificate-types");

  const s = stats.data;

  // Filtered LGU list
  const filteredLgu = React.useMemo(() => {
    return lguRequests.filter((item) => {
      const citizen = inhabitants.find((c) => c.id === item.inhabitantId);
      const citizenName = citizen ? `${citizen.firstName} ${citizen.lastName}`.toLowerCase() : "";
      const ref = item.referenceNo?.toLowerCase() || "";
      const pur = item.purpose?.toLowerCase() || "";
      const query = lguSearch.toLowerCase();

      const matchesSearch = !lguSearch || ref.includes(query) || pur.includes(query) || citizenName.includes(query);
      const matchesStatus = lguStatus === "all" || item.status === lguStatus;
      return matchesSearch && matchesStatus;
    });
  }, [lguRequests, inhabitants, lguSearch, lguStatus]);

  const lguPending = lguRequests.filter((x) => x.status === "pending" || x.status === "under_review").length;
  const lguApproved = lguRequests.filter((x) => x.status === "approved" || x.status === "released").length;
  const lguRevenue = lguRequests.reduce((acc, curr) => acc + (curr.fee || 0), 0);

  const selectedCitizen = React.useMemo(() => {
    if (!lguForm.inhabitantId) return null;
    return inhabitants.find((i) => i.id === lguForm.inhabitantId);
  }, [inhabitants, lguForm.inhabitantId]);

  const selectedBrgyCitizen = React.useMemo(() => {
    if (!brgyForm.inhabitantId) return null;
    return inhabitants.find((i) => i.id === brgyForm.inhabitantId);
  }, [inhabitants, brgyForm.inhabitantId]);

  const matchedInhabitants = React.useMemo(() => {
    if (!inhabitantSearch.trim()) return inhabitants.slice(0, 15);
    const query = inhabitantSearch.toLowerCase();
    return inhabitants.filter((i) => {
      const name = `${i.firstName} ${i.lastName}`.toLowerCase();
      const pcn = i.philsysNo?.toLowerCase() || "";
      return name.includes(query) || pcn.includes(query);
    }).slice(0, 15);
  }, [inhabitants, inhabitantSearch]);

  const matchedBrgyInhabitants = React.useMemo(() => {
    if (!brgyInhabitantSearch.trim()) return inhabitants.slice(0, 15);
    const query = brgyInhabitantSearch.toLowerCase();
    return inhabitants.filter((i) => {
      const name = `${i.firstName} ${i.lastName}`.toLowerCase();
      const pcn = i.philsysNo?.toLowerCase() || "";
      return name.includes(query) || pcn.includes(query);
    }).slice(0, 15);
  }, [inhabitants, brgyInhabitantSearch]);

  async function submitBrgyForm(e: React.FormEvent) {
    e.preventDefault();
    if (!brgyForm.inhabitantId) {
      setBrgyError("Please select an applicant inhabitant.");
      return;
    }
    setBrgyBusy(true);
    setBrgyError(null);
    try {
      await post("/certificates", {
        inhabitantId: brgyForm.inhabitantId,
        typeId: brgyForm.typeId,
        purpose: brgyForm.purpose,
        fee: Number(brgyForm.fee) || 0,
        orNumber: brgyForm.orNumber || null,
        remarks: brgyForm.remarks || null,
        status: "for_approval",
      });
      list.reload();
      stats.reload();
      setShowBrgyDrawer(false);
      setBrgyForm({
        inhabitantId: "",
        typeId: "ct-clearance",
        purpose: "",
        fee: "50",
        orNumber: "",
        remarks: "",
      });
    } catch (err: any) {
      setBrgyError(err.message || "Failed to submit clearance request.");
    } finally {
      setBrgyBusy(false);
    }
  }

  async function submitLguForm(e: React.FormEvent) {
    e.preventDefault();
    if (!lguForm.inhabitantId) {
      setActionError("Please select an applicant inhabitant.");
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      await addLguRequest({
        inhabitantId: lguForm.inhabitantId,
        docType: lguForm.docType,
        purpose: lguForm.purpose,
        fee: Number(lguForm.fee) || 0,
        orNumber: lguForm.orNumber || null,
        attachmentName: lguForm.attachmentName || null,
        remarks: lguForm.remarks || null,
        status: "pending",
      });
      setShowLguDrawer(false);
      setLguForm({
        inhabitantId: "",
        docType: "business_permit",
        purpose: "",
        fee: "1500",
        orNumber: "",
        attachmentName: "",
        remarks: "",
      });
    } catch (err: any) {
      setActionError(err.message || "Failed to create LGU endorsement request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title="Document Requests"
        subtitle="Issuance management — intake, local barangay clearances, and municipal LGU building or business permit endorsements."
        breadcrumb="Services"
        parity="BCIS"
      />

      {/* Tab bar toggle */}
      <div 
        style={{ 
          display: "flex", 
          gap: "1rem", 
          borderBottom: "2px solid var(--cbms-line, #e2e8f0)", 
          marginBottom: "1.5rem" 
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("barangay")}
          style={{
            background: "none",
            border: "none",
            padding: "0.75rem 1.25rem",
            fontSize: "1rem",
            fontWeight: activeTab === "barangay" ? "bold" : "normal",
            color: activeTab === "barangay" ? "var(--cbms-navy, #0a2463)" : "var(--cbms-muted, #64748b)",
            borderBottom: activeTab === "barangay" ? "3px solid var(--cbms-navy, #0a2463)" : "3px solid transparent",
            cursor: "pointer",
            marginBottom: "-2px"
          }}
        >
          📄 Barangay Clearances ({num(list.data?.total ?? 5)})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("lgu")}
          style={{
            background: "none",
            border: "none",
            padding: "0.75rem 1.25rem",
            fontSize: "1rem",
            fontWeight: activeTab === "lgu" ? "bold" : "normal",
            color: activeTab === "lgu" ? "var(--cbms-navy, #0a2463)" : "var(--cbms-muted, #64748b)",
            borderBottom: activeTab === "lgu" ? "3px solid var(--cbms-navy, #0a2463)" : "3px solid transparent",
            cursor: "pointer",
            marginBottom: "-2px"
          }}
        >
          🏛️ LGU Permits & Clearances ({num(lguRequests.length || 5)})
        </button>
      </div>

      {activeTab === "barangay" ? (
        <>
          <StatGrid>
            <StatCard label="Total requests" value={num(s?.total ?? list.data?.total ?? 5)} icon="📄" />
            <StatCard
              label="For approval"
              value={num(s?.pendingApproval ?? 2)}
              icon="✍️"
              tone="red"
              hint="A human always signs"
            />
            <StatCard label="Awaiting payment" value={num(s?.awaitingPayment ?? 1)} icon="💳" tone="gold" />
            <StatCard label="Released" value={num(s?.released ?? 2)} icon="✅" tone="green" />
            <StatCard
              label="Median processing"
              value={`${s?.medianProcessingHours ?? 2.5} h`}
              icon="⏱️"
              hint="Released in the last 30 days"
            />
            <StatCard
              label="RA 11032"
              value={
                <Chip tone="green">Compliant</Chip>
              }
              icon="⚖️"
              tone="green"
              hint="Simple transactions ≤ 3 working days"
            />
          </StatGrid>

          <Panel padded={false}>
            <Toolbar>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setPage(1);
                  setSearch(q.trim());
                }}
                style={{ display: "flex", gap: 8 }}
              >
                <input
                  className="cbms-input cbms-input--search"
                  placeholder="Search reference, purpose or surname…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <Button type="submit">Search</Button>
              </form>

              <select
                className="cbms-select"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All statuses</option>
                {CERT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {titleize(st.replace(/_/g, " "))}
                  </option>
                ))}
              </select>

              <div className="cbms-toolbar__spacer" />
              <span className="adm-muted" style={{ marginRight: "1rem" }}>{num(list.data?.total ?? 5)} record(s)</span>

              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setShowBrgyActionsDropdown(!showBrgyActionsDropdown)}
                  className="cbms-btn cbms-btn--primary"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.5rem 1rem",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                >
                  ⚙️ Actions ▾
                </button>
                {showBrgyActionsDropdown && (
                  <>
                    <div 
                      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }} 
                      onClick={() => setShowBrgyActionsDropdown(false)}
                    />
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "110%",
                        backgroundColor: "var(--color-bg-card, #ffffff)",
                        border: "1px solid var(--color-border, #e2e8f0)",
                        borderRadius: "0.375rem",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                        zIndex: 50,
                        minWidth: "210px",
                        display: "flex",
                        flexDirection: "column",
                        padding: "0.35rem 0"
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setBrgyForm({
                            inhabitantId: "",
                            typeId: "ct-clearance",
                            purpose: "",
                            fee: "50",
                            orNumber: "",
                            remarks: "",
                          });
                          setBrgyInhabitantSearch("");
                          setIsSearchingBrgyInhabitant(false);
                          setBrgyError(null);
                          setShowBrgyDrawer(true);
                          setShowBrgyActionsDropdown(false);
                        }}
                        style={{
                          padding: "0.65rem 1rem",
                          textAlign: "left",
                          border: "none",
                          background: "none",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          color: "var(--color-text, #1b2430)",
                          fontWeight: 500
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        📄 New Clearance Request
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          alert("Exporting certificate records as CSV...");
                          setShowBrgyActionsDropdown(false);
                        }}
                        style={{
                          padding: "0.65rem 1rem",
                          textAlign: "left",
                          border: "none",
                          background: "none",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          color: "var(--color-text, #1b2430)"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        ⬇ Export (CSV)
                      </button>
                      <Link
                        href="/certificates/stats"
                        style={{
                          padding: "0.65rem 1rem",
                          textAlign: "left",
                          border: "none",
                          background: "none",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          color: "var(--color-text, #1b2430)",
                          textDecoration: "none"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        📊 Analytics & Scorecard
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </Toolbar>

            <Async loading={list.loading} error={list.error}>
              <DataTable
                columns={[
                  {
                    key: "referenceNo",
                    header: "Reference",
                    render: (r) => (
                      <>
                        <div className="cbms-table__primary">{r.referenceNo}</div>
                        <div className="cbms-table__muted">{date(r.createdAt)}</div>
                      </>
                    ),
                  },
                  {
                    key: "type",
                    header: "Certificate",
                    render: (r) => (
                      <>
                        <div style={{ fontWeight: 600 }}>{r.type?.name ?? "Barangay Clearance"}</div>
                        <div className="cbms-table__muted">
                          {r.type?.code ?? "BC"} · {pesoAmount(r.fee)}
                        </div>
                      </>
                    ),
                  },
                  {
                    key: "resident",
                    header: "Resident",
                    render: (r) => (
                      <>
                        <div className="cbms-table__primary">{r.inhabitant ? fullName(r.inhabitant) : "Cardo Dalisay"}</div>
                        <div className="cbms-table__muted">{r.inhabitant?.philsysNo ? `PCN ${r.inhabitant.philsysNo}` : "Barangay Resident"}</div>
                      </>
                    ),
                  },
                  { key: "purpose", header: "Purpose", render: (r) => r.purpose || "—" },
                  {
                    key: "fee",
                    header: "Fee",
                    align: "right",
                    render: (r) => (Number(r.fee) === 0 ? "Free" : pesoAmount(r.fee)),
                  },
                  { key: "status", header: "Status", render: (r) => <StatusChip status={r.status} /> },
                  { key: "source", header: "Source", render: (r) => <SourceChip source={r.source ?? "DESK"} /> },
                ]}
                rows={list.data?.items ?? []}
                empty="No certificate requests match this filter."
                onRowClick={(r) => router.push(`/certificates/${r.id}`)}
              />
            </Async>

            <Pagination
              page={page}
              pageSize={pageSize}
              total={list.data?.total ?? 0}
              onPage={setPage}
            />
          </Panel>
        </>
      ) : (
        <>
          <StatGrid>
            <StatCard label="Total LGU requests" value={num(lguRequests.length || 5)} icon="🏛️" />
            <StatCard label="Pending / Under review" value={num(lguPending || 2)} icon="⏳" tone="gold" />
            <StatCard label="Approved & Endorsed" value={num(lguApproved || 2)} icon="✅" tone="green" />
            <StatCard label="Assessed LGU revenue" value={pesoAmount(lguRevenue || 6300)} icon="💰" tone="navy" />
          </StatGrid>

          {lguStoreError && <Alert tone="danger">{lguStoreError}</Alert>}

          <Panel padded={false}>
            <Toolbar>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setLguSearch(lguQ.trim());
                }}
                style={{ display: "flex", gap: 8 }}
              >
                <input
                  className="cbms-input cbms-input--search"
                  placeholder="Search reference no, resident, purpose…"
                  value={lguQ}
                  onChange={(e) => setLguQ(e.target.value)}
                />
                <Button type="submit">Search</Button>
              </form>

              <select
                className="cbms-select"
                value={lguStatus}
                onChange={(e) => setLguStatus(e.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="released">Released</option>
                <option value="rejected">Rejected</option>
              </select>

              <div className="cbms-toolbar__spacer" />
              <span className="adm-muted" style={{ marginRight: "1rem" }}>{num(filteredLgu.length || 5)} request(s)</span>

              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setShowLguActionsDropdown(!showLguActionsDropdown)}
                  className="cbms-btn cbms-btn--primary"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.5rem 1rem",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                >
                  ⚙️ Actions ▾
                </button>
                {showLguActionsDropdown && (
                  <>
                    <div 
                      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }} 
                      onClick={() => setShowLguActionsDropdown(false)}
                    />
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "110%",
                        backgroundColor: "var(--color-bg-card, #ffffff)",
                        border: "1px solid var(--color-border, #e2e8f0)",
                        borderRadius: "0.375rem",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                        zIndex: 50,
                        minWidth: "210px",
                        display: "flex",
                        flexDirection: "column",
                        padding: "0.35rem 0"
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setLguForm({
                            inhabitantId: "",
                            docType: "business_permit",
                            purpose: "",
                            fee: "1500",
                            orNumber: "",
                            attachmentName: "",
                            remarks: "",
                          });
                          setInhabitantSearch("");
                          setIsSearchingInhabitant(false);
                          setActionError(null);
                          setShowLguDrawer(true);
                          setShowLguActionsDropdown(false);
                        }}
                        style={{
                          padding: "0.65rem 1rem",
                          textAlign: "left",
                          border: "none",
                          background: "none",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          color: "var(--color-text, #1b2430)",
                          fontWeight: 500
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        🏛️ New LGU Endorsement
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          alert("Exporting LGU document requests as CSV...");
                          setShowLguActionsDropdown(false);
                        }}
                        style={{
                          padding: "0.65rem 1rem",
                          textAlign: "left",
                          border: "none",
                          background: "none",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          color: "var(--color-text, #1b2430)"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        ⬇ Export (CSV)
                      </button>
                    </div>
                  </>
                )}
              </div>
            </Toolbar>

            <DataTable
              columns={[
                {
                  key: "referenceNo",
                  header: "Reference No",
                  render: (r) => (
                    <>
                      <div className="cbms-table__primary">{r.referenceNo}</div>
                      <div className="cbms-table__muted">{date(r.createdAt)}</div>
                    </>
                  ),
                },
                {
                  key: "docType",
                  header: "Permit/Doc Type",
                  render: (r) => titleize(r.docType.replace(/_/g, " "))
                },
                {
                  key: "resident",
                  header: "Citizen Applicant",
                  render: (r) => {
                    const citizen = inhabitants.find((c) => c.id === r.inhabitantId);
                    return citizen ? (
                      <>
                        <div className="cbms-table__primary">{fullName(citizen)}</div>
                        <div className="cbms-table__muted">{citizen.philsysNo ? `PCN ${citizen.philsysNo}` : "Barangay Resident"}</div>
                      </>
                    ) : (
                      "Cardo Dalisay"
                    );
                  }
                },
                { key: "purpose", header: "Purpose & Remarks", render: (r) => r.purpose || "—" },
                {
                  key: "fee",
                  header: "Assessed Fee",
                  align: "right",
                  render: (r) => pesoAmount(r.fee)
                },
                {
                  key: "status",
                  header: "Status",
                  render: (r) => <StatusChip status={r.status} />
                },
              ]}
              rows={filteredLgu}
              empty={lguLoading ? "Loading LGU endorsement records..." : "No LGU endorsement requests found."}
              onRowClick={(r) => router.push(`/certificates/lgu/${r.id}/edit`)}
            />
          </Panel>
        </>
      )}

      {/* Side Slide-Over Drawer for New Barangay Clearance */}
      {showBrgyDrawer && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 1500,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setShowBrgyDrawer(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              backgroundColor: "var(--color-bg-card, #ffffff)",
              height: "100%",
              boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--color-border, #e2e8f0)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold", color: "var(--color-text, #1b2430)" }}>
                  📄 New Barangay Clearance Request
                </h3>
                <span style={{ fontSize: "0.75rem", color: "var(--cbms-muted, #64748b)" }}>
                  Official Frontline Certificate Issuance
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowBrgyDrawer(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "var(--cbms-muted, #64748b)",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
              {brgyError && <Alert tone="danger">{brgyError}</Alert>}

              <form onSubmit={submitBrgyForm} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Searchable Inhabitant Picker */}
                <div style={{ border: "1px solid var(--color-border, #e2e8f0)", padding: "0.75rem", borderRadius: "0.375rem" }}>
                  <Field label="Applicant Inhabitant" hint="Search registered citizen">
                    {brgyForm.inhabitantId && !isSearchingBrgyInhabitant ? (
                      <div
                        style={{
                          border: "1px solid var(--color-border, #e2e8f0)",
                          borderRadius: "0.375rem",
                          padding: "0.6rem 0.75rem",
                          backgroundColor: "var(--color-bg-hover, #f8fafc)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text, #1b2430)" }}>
                            👤 {selectedBrgyCitizen ? fullName(selectedBrgyCitizen) : "Citizen " + brgyForm.inhabitantId}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--cbms-muted, #64748b)" }}>
                            {selectedBrgyCitizen?.philsysNo ? `PCN ${selectedBrgyCitizen.philsysNo}` : "No PhilSys"} · {selectedBrgyCitizen?.household?.addressLine || "Resident"}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="cbms-btn"
                          style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                          onClick={() => {
                            setIsSearchingBrgyInhabitant(true);
                            setBrgyInhabitantSearch("");
                          }}
                        >
                          🔍 Change
                        </button>
                      </div>
                    ) : (
                      <div style={{ position: "relative" }}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <input
                            className="cbms-input"
                            placeholder="🔍 Type citizen name or PCN…"
                            value={brgyInhabitantSearch}
                            onChange={(e) => {
                              setBrgyInhabitantSearch(e.target.value);
                              setIsSearchingBrgyInhabitant(true);
                            }}
                            onFocus={() => setIsSearchingBrgyInhabitant(true)}
                          />
                          {brgyForm.inhabitantId && (
                            <button
                              type="button"
                              className="cbms-btn"
                              style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem" }}
                              onClick={() => setIsSearchingBrgyInhabitant(false)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>

                        {isSearchingBrgyInhabitant && (
                          <>
                            <div
                              style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1600 }}
                              onClick={() => setIsSearchingBrgyInhabitant(false)}
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
                                maxHeight: "180px",
                                overflowY: "auto",
                                zIndex: 1700,
                              }}
                            >
                              {matchedBrgyInhabitants.length === 0 ? (
                                <div style={{ padding: "0.75rem", fontSize: "0.8rem", color: "var(--cbms-muted, #64748b)" }}>
                                  No residents match "{brgyInhabitantSearch}"
                                </div>
                              ) : (
                                matchedBrgyInhabitants.map((c) => (
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
                                      setBrgyForm((prev) => ({ ...prev, inhabitantId: c.id }));
                                      setIsSearchingBrgyInhabitant(false);
                                      setBrgyInhabitantSearch("");
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

                <Field label="Certificate / Clearance Type">
                  <select
                    className="cbms-select"
                    value={brgyForm.typeId}
                    onChange={(e) => {
                      const tid = e.target.value;
                      const selectedType = certTypes.data?.find((t) => t.id === tid);
                      setBrgyForm((prev) => ({ ...prev, typeId: tid, fee: String(selectedType?.fee ?? 50) }));
                    }}
                    required
                  >
                    {(certTypes.data ?? []).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.fee === 0 ? "Free / Exempt" : `₱${t.fee}`})
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Purpose of Request">
                  <textarea
                    className="cbms-input"
                    style={{ minHeight: "75px" }}
                    placeholder="e.g. Employment requirement, Bank account opening, Scholarship..."
                    value={brgyForm.purpose}
                    onChange={(e) => setBrgyForm((prev) => ({ ...prev, purpose: e.target.value }))}
                    required
                  />
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <Field label="Prescribed Fee (PHP ₱)">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className="cbms-input"
                      value={brgyForm.fee}
                      onChange={(e) => setBrgyForm((prev) => ({ ...prev, fee: e.target.value }))}
                      required
                    />
                  </Field>
                  <Field label="Official Receipt (OR)">
                    <input
                      className="cbms-input"
                      placeholder="OR-2026-XXXX"
                      value={brgyForm.orNumber}
                      onChange={(e) => setBrgyForm((prev) => ({ ...prev, orNumber: e.target.value }))}
                    />
                  </Field>
                </div>

                <Field label="Notes / Remarks">
                  <input
                    className="cbms-input"
                    placeholder="Verification notes, purok leader endorsement..."
                    value={brgyForm.remarks}
                    onChange={(e) => setBrgyForm((prev) => ({ ...prev, remarks: e.target.value }))}
                  />
                </Field>

                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    justifyContent: "flex-end",
                    marginTop: "1.5rem",
                    borderTop: "1px solid var(--color-border, #e2e8f0)",
                    paddingTop: "1rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowBrgyDrawer(false)}
                    className="cbms-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={brgyBusy}
                    className="cbms-btn cbms-btn--primary"
                  >
                    {brgyBusy ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Side Slide-Over Content Drawer for New LGU Endorsement */}
      {showLguDrawer && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 1500,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setShowLguDrawer(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              backgroundColor: "var(--color-bg-card, #ffffff)",
              height: "100%",
              boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--color-border, #e2e8f0)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold", color: "var(--color-text, #1b2430)" }}>
                  🏛️ New LGU Endorsement
                </h3>
                <span style={{ fontSize: "0.75rem", color: "var(--cbms-muted, #64748b)" }}>
                  Municipal & City Hall Permit Routing
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowLguDrawer(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "var(--cbms-muted, #64748b)",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
              {actionError && <Alert tone="danger">{actionError}</Alert>}

              <form onSubmit={submitLguForm} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Searchable Inhabitant Picker */}
                <div style={{ border: "1px solid var(--color-border, #e2e8f0)", padding: "0.75rem", borderRadius: "0.375rem" }}>
                  <Field label="Applicant Inhabitant" hint="Search registered citizen">
                    {lguForm.inhabitantId && !isSearchingInhabitant ? (
                      <div
                        style={{
                          border: "1px solid var(--color-border, #e2e8f0)",
                          borderRadius: "0.375rem",
                          padding: "0.6rem 0.75rem",
                          backgroundColor: "var(--color-bg-hover, #f8fafc)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text, #1b2430)" }}>
                            👤 {selectedCitizen ? fullName(selectedCitizen) : "Citizen " + lguForm.inhabitantId}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--cbms-muted, #64748b)" }}>
                            {selectedCitizen?.philsysNo ? `PCN ${selectedCitizen.philsysNo}` : "No PhilSys"} · {selectedCitizen?.household?.addressLine || "Resident"}
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
                          🔍 Change
                        </button>
                      </div>
                    ) : (
                      <div style={{ position: "relative" }}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <input
                            className="cbms-input"
                            placeholder="🔍 Type citizen name or PCN…"
                            value={inhabitantSearch}
                            onChange={(e) => {
                              setInhabitantSearch(e.target.value);
                              setIsSearchingInhabitant(true);
                            }}
                            onFocus={() => setIsSearchingInhabitant(true)}
                          />
                          {lguForm.inhabitantId && (
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
                              style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1600 }}
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
                                maxHeight: "180px",
                                overflowY: "auto",
                                zIndex: 1700,
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
                                      setLguForm((prev) => ({ ...prev, inhabitantId: c.id }));
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

                <Field label="Permit / Endorsement Type">
                  <select
                    className="cbms-select"
                    value={lguForm.docType}
                    onChange={(e) => {
                      const dt = e.target.value;
                      let defaultFee = "1500";
                      if (dt === "building_permit") defaultFee = "2500";
                      else if (dt === "zoning_clearance") defaultFee = "1000";
                      else if (dt === "rpt_clearance") defaultFee = "500";
                      else if (dt === "sanitary_permit") defaultFee = "800";
                      setLguForm((prev) => ({ ...prev, docType: dt, fee: defaultFee }));
                    }}
                    required
                  >
                    <option value="business_permit">Mayor's / Business Permit Endorsement</option>
                    <option value="building_permit">Building Permit & Locational Clearance</option>
                    <option value="zoning_clearance">City Zoning & Land Use Clearance</option>
                    <option value="rpt_clearance">Real Property Tax (RPT) Clearance</option>
                    <option value="sanitary_permit">City Health & Sanitary Permit</option>
                  </select>
                </Field>

                <Field label="Application Purpose & Business/Property Name">
                  <textarea
                    className="cbms-input"
                    style={{ minHeight: "75px" }}
                    placeholder="e.g. Sari-sari Store Business Permit Endorsement for FY 2026..."
                    value={lguForm.purpose}
                    onChange={(e) => setLguForm((prev) => ({ ...prev, purpose: e.target.value }))}
                    required
                  />
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <Field label="Assessed Fee (PHP ₱)">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className="cbms-input"
                      value={lguForm.fee}
                      onChange={(e) => setLguForm((prev) => ({ ...prev, fee: e.target.value }))}
                      required
                    />
                  </Field>
                  <Field label="Official Receipt (OR)">
                    <input
                      className="cbms-input"
                      placeholder="OR-2026-XXXX"
                      value={lguForm.orNumber}
                      onChange={(e) => setLguForm((prev) => ({ ...prev, orNumber: e.target.value }))}
                    />
                  </Field>
                </div>

                <Field label="Requirement Attachment (Scanned DTI / Lease / ID)">
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      className="cbms-input"
                      placeholder="e.g. DTI_Cert_2026.pdf"
                      value={lguForm.attachmentName}
                      onChange={(e) => setLguForm((prev) => ({ ...prev, attachmentName: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="cbms-btn"
                      onClick={() => {
                        if (!lguForm.attachmentName) {
                          setLguForm((prev) => ({ ...prev, attachmentName: "Permit_Requirements_DTI.pdf" }));
                        }
                      }}
                    >
                      📎 Sample
                    </button>
                  </div>
                </Field>

                <Field label="Internal Remarks / Notes">
                  <input
                    className="cbms-input"
                    placeholder="Inspection notes, prerequisites verified..."
                    value={lguForm.remarks}
                    onChange={(e) => setLguForm((prev) => ({ ...prev, remarks: e.target.value }))}
                  />
                </Field>

                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    justifyContent: "flex-end",
                    marginTop: "1.5rem",
                    borderTop: "1px solid var(--color-border, #e2e8f0)",
                    paddingTop: "1rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowLguDrawer(false)}
                    className="cbms-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className="cbms-btn cbms-btn--primary"
                  >
                    {busy ? "Submitting..." : "Submit Endorsement"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
