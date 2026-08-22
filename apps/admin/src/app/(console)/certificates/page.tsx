"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { qs, useApi } from "@cbms/api-client";
import {
  Button,
  Chip,
  DataTable,
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
import type { CertificateRequest, CertificateStats, Paged, Inhabitant } from "../../../lib/types";
import { ApiError, post, patch } from "@cbms/api-client";

interface LguDocRequest {
  id: string;
  barangayId: string;
  inhabitantId: string;
  docType: string;
  purpose: string;
  status: string;
  referenceNo: string;
  fee: number;
  paidAt?: string;
  orNumber?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  inhabitant?: Inhabitant;
}

export default function CertificatesPage() {
  const router = useRouter();
  const { can } = useConsole();
  const [activeTab, setActiveTab] = React.useState<"barangay" | "lgu">("barangay");

  // Barangay Clearances state
  const [q, setQ] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 25;

  // LGU Permits state
  const [lguQ, setLguQ] = React.useState("");
  const [lguSearch, setLguSearch] = React.useState("");
  const [lguStatus, setLguStatus] = React.useState("all");
  const [showLguModal, setShowLguModal] = React.useState(false);
  const [lguForm, setLguForm] = React.useState({
    inhabitantId: "",
    docType: "business_permit",
    purpose: "",
    fee: "1500"
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("status");
    if (s) setStatus(s);
  }, []);

  // Data fetching
  const stats = useApi<CertificateStats>("/certificates/stats");
  const list = useApi<Paged<CertificateRequest>>(
    `/certificates${qs({ q: search, status, page, pageSize })}`,
  );

  const lguRequests = useApi<LguDocRequest[]>(`/lgu-requests`);
  const inhabitantsList = useApi<Paged<Inhabitant>>(`/inhabitants?pageSize=100`);

  const s = stats.data;
  const lguList = lguRequests.data || [];
  const citizens = inhabitantsList.data?.items || [];

  // Filtered LGU list
  const filteredLgu = lguList.filter(item => {
    const inh = citizens.find(c => c.id === item.inhabitantId);
    const citizenName = inh ? `${inh.firstName} ${inh.lastName}`.toLowerCase() : "";
    const matchesSearch = item.referenceNo.toLowerCase().includes(lguSearch.toLowerCase()) || 
                          item.purpose.toLowerCase().includes(lguSearch.toLowerCase()) ||
                          citizenName.includes(lguSearch.toLowerCase());
    const matchesStatus = lguStatus === "all" || item.status === lguStatus;
    return matchesSearch && matchesStatus;
  });

  const lguPending = lguList.filter(x => x.status === "pending").length;
  const lguApproved = lguList.filter(x => x.status === "approved" || x.status === "released").length;
  const lguRevenue = lguList.reduce((acc, curr) => acc + (curr.fee || 0), 0);

  async function createLguRequest(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await post("/lgu-requests", {
        inhabitantId: lguForm.inhabitantId,
        docType: lguForm.docType,
        purpose: lguForm.purpose,
        fee: Number(lguForm.fee),
        status: "pending"
      });
      lguRequests.reload();
      setShowLguModal(false);
      setLguForm({ inhabitantId: "", docType: "business_permit", purpose: "", fee: "1500" });
    } catch (err) {
      setError((err as ApiError)?.message || "Failed to submit request.");
    } finally {
      setBusy(false);
    }
  }

  async function updateLguStatus(id: string, newStatus: string) {
    try {
      await patch(`/lgu-requests/${id}`, { status: newStatus });
      lguRequests.reload();
    } catch (err) {
      alert("Failed to update status");
    }
  }

  return (
    <>
      <PageHead
        title="Document Requests"
        subtitle="Issuance management — intake, local barangay clearances, and municipal LGU building or business permit endorsements."
        breadcrumb="Services"
        parity="BCIS"
        actions={
          activeTab === "barangay" ? (
            can("issuance:encode") ? (
              <Link href="/certificates/new" className="cbms-btn cbms-btn--primary">
                + New request
              </Link>
            ) : undefined
          ) : (
            can("issuance:encode") ? (
              <button 
                type="button" 
                onClick={() => setShowLguModal(true)} 
                className="cbms-btn cbms-btn--primary"
              >
                + New LGU endorsement
              </button>
            ) : undefined
          )
        }
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
            padding: "0.75rem 1rem",
            fontSize: "0.95rem",
            fontWeight: activeTab === "barangay" ? "bold" : "normal",
            color: activeTab === "barangay" ? "var(--cbms-navy, #0a2463)" : "var(--cbms-muted, #64748b)",
            borderBottom: activeTab === "barangay" ? "3px solid var(--cbms-navy, #0a2463)" : "3px solid transparent",
            cursor: "pointer",
            marginBottom: "-2px"
          }}
        >
          📄 Barangay Clearances
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("lgu")}
          style={{
            background: "none",
            border: "none",
            padding: "0.75rem 1rem",
            fontSize: "0.95rem",
            fontWeight: activeTab === "lgu" ? "bold" : "normal",
            color: activeTab === "lgu" ? "var(--cbms-navy, #0a2463)" : "var(--cbms-muted, #64748b)",
            borderBottom: activeTab === "lgu" ? "3px solid var(--cbms-navy, #0a2463)" : "3px solid transparent",
            cursor: "pointer",
            marginBottom: "-2px"
          }}
        >
          🏛️ LGU Permits & Clearances
        </button>
      </div>

      {activeTab === "barangay" ? (
        <>
          <StatGrid>
            <StatCard label="Total requests" value={num(s?.total)} icon="📄" />
            <StatCard
              label="For approval"
              value={num(s?.pendingApproval)}
              icon="✍️"
              tone={s?.pendingApproval ? "red" : "navy"}
              hint="A human always signs"
            />
            <StatCard label="Awaiting payment" value={num(s?.awaitingPayment)} icon="💳" tone="gold" />
            <StatCard label="Released" value={num(s?.released)} icon="✅" tone="green" />
            <StatCard
              label="Median processing"
              value={`${s?.medianProcessingHours ?? 0} h`}
              icon="⏱️"
              hint="Released in the last 30 days"
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
                    {titleize(st)}
                  </option>
                ))}
              </select>
              <div className="cbms-toolbar__spacer" />
              <span className="adm-muted">{num(list.data?.total)} request(s)</span>
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
                  { key: "type", header: "Certificate", render: (r) => r.type?.name ?? "—" },
                  {
                    key: "resident",
                    header: "Resident",
                    render: (r) => (r.inhabitant ? fullName(r.inhabitant) : "—"),
                  },
                  { key: "purpose", header: "Purpose" },
                  {
                    key: "fee",
                    header: "Fee",
                    align: "right",
                    render: (r) => (Number(r.fee) === 0 ? "Free" : pesoAmount(r.fee)),
                  },
                  { key: "status", header: "Status", render: (r) => <StatusChip status={r.status} /> },
                  { key: "source", header: "Source", render: (r) => <SourceChip source={r.source} /> },
                ]}
                rows={list.data?.items ?? []}
                empty="No certificate requests match this filter."
                onRowClick={(r) => router.push(`/certificates/${r.id}`)}
              />
            </Async>

            <Pagination page={page} pageSize={pageSize} total={list.data?.total ?? 0} onPage={setPage} />
          </Panel>
        </>
      ) : (
        <>
          <StatGrid>
            <StatCard label="Total LGU requests" value={num(lguList.length)} icon="🏛️" />
            <StatCard
              label="Pending endorsement"
              value={num(lguPending)}
              icon="⏳"
              tone={lguPending ? "gold" : "navy"}
            />
            <StatCard label="Approved & Released" value={num(lguApproved)} icon="✅" tone="green" />
            <StatCard
              label="Endorsement revenue"
              value={pesoAmount(lguRevenue)}
              icon="₱"
              hint="Fee total collected"
            />
          </StatGrid>

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
                  placeholder="Search reference, purpose or citizen name…"
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
                <option value="rejected">Rejected</option>
                <option value="released">Released</option>
              </select>
            </Toolbar>

            <Async loading={lguRequests.loading} error={lguRequests.error}>
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
                    render: (r) => titleize(r.docType)
                  },
                  {
                    key: "resident",
                    header: "Resident",
                    render: (r) => {
                      const citizen = citizens.find(c => c.id === r.inhabitantId);
                      return citizen ? `${citizen.firstName} ${citizen.lastName}` : "—";
                    }
                  },
                  { key: "purpose", header: "Purpose" },
                  {
                    key: "fee",
                    header: "Assessed Endorsement Fee",
                    align: "right",
                    render: (r) => pesoAmount(r.fee)
                  },
                  {
                    key: "status",
                    header: "Status",
                    render: (r) => <StatusChip status={r.status} />
                  },
                  {
                    key: "actions",
                    header: "Actions",
                    render: (r) => (
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        {r.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateLguStatus(r.id, "approved");
                              }}
                              className="cbms-btn cbms-btn--sm"
                              style={{ backgroundColor: "var(--cbms-green, #10a37f)", color: "#fff", border: "none" }}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateLguStatus(r.id, "rejected");
                              }}
                              className="cbms-btn cbms-btn--sm"
                              style={{ backgroundColor: "var(--cbms-red, #ce1126)", color: "#fff", border: "none" }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {r.status === "approved" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateLguStatus(r.id, "released");
                            }}
                            className="cbms-btn cbms-btn--sm cbms-btn--gold"
                            style={{ border: "none" }}
                          >
                            Release Permit
                          </button>
                        )}
                      </div>
                    )
                  }
                ]}
                rows={filteredLgu}
                empty="No LGU requests found."
              />
            </Async>
          </Panel>
        </>
      )}

      {/* LGU Endorsement Modal Form */}
      {showLguModal && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            display: "grid",
            placeItems: "center",
            zIndex: 2000
          }}
        >
          <div 
            style={{
              backgroundColor: "var(--color-bg-card, #ffffff)",
              border: "1px solid var(--color-border, #e2e8f0)",
              borderRadius: "0.5rem",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "480px",
              display: "flex",
              flexDirection: "column",
              gap: "1rem"
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1.1rem", borderBottom: "1px solid var(--color-border, #e2e8f0)", paddingBottom: "0.5rem", color: "var(--color-text, #1b2430)" }}>
              New LGU Endorsement Request
            </h3>
            
            {error && <div style={{ color: "var(--cbms-red, #ce1126)", fontSize: "0.8rem" }}>{error}</div>}

            <form onSubmit={createLguRequest} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Resident Inhabitant</label>
                <select
                  className="cbms-select"
                  value={lguForm.inhabitantId}
                  onChange={(e) => setLguForm(prev => ({ ...prev, inhabitantId: e.target.value }))}
                  required
                  style={{ width: "100%" }}
                >
                  <option value="">Select Resident...</option>
                  {citizens.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Permit Type</label>
                <select
                  className="cbms-select"
                  value={lguForm.docType}
                  onChange={(e) => setLguForm(prev => ({ ...prev, docType: e.target.value }))}
                  required
                  style={{ width: "100%" }}
                >
                  <option value="business_permit">Business Permit Endorsement</option>
                  <option value="building_permit">Building Permit Clearance</option>
                  <option value="zoning_clearance">Zoning Clearance</option>
                  <option value="rpt_clearance">Real Property Tax Clearance</option>
                  <option value="sanitary_permit">Sanitary Permit</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Fee Amount (PHP)</label>
                <input
                  className="cbms-input"
                  type="number"
                  value={lguForm.fee}
                  onChange={(e) => setLguForm(prev => ({ ...prev, fee: e.target.value }))}
                  required
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Purpose</label>
                <textarea
                  className="cbms-textarea"
                  value={lguForm.purpose}
                  onChange={(e) => setLguForm(prev => ({ ...prev, purpose: e.target.value }))}
                  required
                  placeholder="E.g., Opening of a local convenience store..."
                  style={{ width: "100%", height: "80px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowLguModal(false)}
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
      )}
    </>
  );
}
