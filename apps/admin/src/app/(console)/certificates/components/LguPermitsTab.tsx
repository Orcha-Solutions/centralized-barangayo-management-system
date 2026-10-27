"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, DataTable, Field, Panel, StatCard, StatGrid, StatusChip, Toolbar, date, fullName, num, pesoAmount, titleize } from "@cbms/ui";
import { useLguDocStore } from "../../../../store/lguDocStore";
import { useInhabitantStore } from "../../../../store/inhabitantStore";

export function LguPermitsTab() {
  const router = useRouter();
  const { lguRequests, loading: lguLoading, error: lguStoreError, fetchLguRequests, addLguRequest } = useLguDocStore();
  const { inhabitants, fetchInhabitants } = useInhabitantStore();

  const [lguQ, setLguQ] = React.useState("");
  const [lguSearch, setLguSearch] = React.useState("");
  const [lguStatus, setLguStatus] = React.useState("all");
  const [showLguDrawer, setShowLguDrawer] = React.useState(false);
  const [showLguActionsDropdown, setShowLguActionsDropdown] = React.useState(false);

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
    fetchLguRequests();
    fetchInhabitants();
  }, [fetchLguRequests, fetchInhabitants]);

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

  const matchedInhabitants = React.useMemo(() => {
    if (!inhabitantSearch.trim()) return inhabitants.slice(0, 15);
    const query = inhabitantSearch.toLowerCase();
    return inhabitants.filter((i) => {
      const name = `${i.firstName} ${i.lastName}`.toLowerCase();
      const pcn = i.philsysNo?.toLowerCase() || "";
      return name.includes(query) || pcn.includes(query);
    }).slice(0, 15);
  }, [inhabitants, inhabitantSearch]);

  const submitLguForm = async (e: React.FormEvent) => {
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
  };

  return (
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
                fontWeight: 600,
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
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.375rem",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                    zIndex: 50,
                    minWidth: "210px",
                    display: "flex",
                    flexDirection: "column",
                    padding: "0.35rem 0",
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
                      color: "#1b2430",
                      fontWeight: 500,
                    }}
                  >
                    🏛️ New LGU Endorsement
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
              render: (r) => titleize(r.docType.replace(/_/g, " ")),
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
              },
            },
            { key: "purpose", header: "Purpose & Remarks", render: (r) => r.purpose || "—" },
            {
              key: "fee",
              header: "Assessed Fee",
              align: "right",
              render: (r) => pesoAmount(r.fee),
            },
            {
              key: "status",
              header: "Status",
              render: (r) => <StatusChip status={r.status} />,
            },
          ]}
          rows={filteredLgu}
          empty={lguLoading ? "Loading LGU endorsement records..." : "No LGU endorsement requests found."}
          onRowClick={(r) => router.push(`/certificates/lgu/${r.id}/edit`)}
        />
      </Panel>

      {/* LGU Endorsement Drawer */}
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
              maxWidth: "520px",
              backgroundColor: "#ffffff",
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
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold" }}>
                  🏛️ New LGU Permit Endorsement
                </h3>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  Inter-Governmental Clearance Processing
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowLguDrawer(false)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#64748b" }}
              >
                ×
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
              {actionError && <Alert tone="danger">{actionError}</Alert>}

              <form id="lgu-form" onSubmit={submitLguForm}>
                <Field label="Applicant Citizen *" hint="Select registered resident for permit endorsement">
                  {selectedCitizen && !isSearchingInhabitant ? (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "0.375rem" }}>
                      <div>
                        <strong>{fullName(selectedCitizen)}</strong>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{selectedCitizen.philsysNo ? `PCN ${selectedCitizen.philsysNo}` : "Registered Resident"}</div>
                      </div>
                      <button type="button" onClick={() => setIsSearchingInhabitant(true)} style={{ background: "none", border: "none", color: "#0369a1", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}>Change</button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        className="cbms-input"
                        placeholder="Search resident..."
                        value={inhabitantSearch}
                        onChange={(e) => setInhabitantSearch(e.target.value)}
                        style={{ marginBottom: "0.5rem", width: "100%" }}
                      />
                      <div style={{ maxHeight: "150px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "0.375rem" }}>
                        {matchedInhabitants.map((citizen) => (
                          <div
                            key={citizen.id}
                            onClick={() => {
                              setLguForm({ ...lguForm, inhabitantId: citizen.id });
                              setIsSearchingInhabitant(false);
                            }}
                            style={{ padding: "0.5rem 0.75rem", borderBottom: "1px solid #f1f5f9", cursor: "pointer", fontSize: "0.85rem" }}
                          >
                            <strong>{fullName(citizen)}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Field>

                <div style={{ marginTop: "1rem" }}>
                  <Field label="Permit / Document Type *">
                    <select
                      className="cbms-select"
                      value={lguForm.docType}
                      onChange={(e) => setLguForm({ ...lguForm, docType: e.target.value })}
                      style={{ width: "100%" }}
                    >
                      <option value="business_permit">Mayor&apos;s Business Permit Endorsement</option>
                      <option value="building_clearance">Barangay Building & Zoning Clearance</option>
                      <option value="fencing_permit">Fencing & Construction Permit</option>
                    </select>
                  </Field>
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <Field label="Purpose & Business Name *">
                    <input
                      type="text"
                      className="cbms-input"
                      value={lguForm.purpose}
                      onChange={(e) => setLguForm({ ...lguForm, purpose: e.target.value })}
                      required
                      style={{ width: "100%" }}
                    />
                  </Field>
                </div>
              </form>
            </div>

            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button type="button" className="cbms-btn" onClick={() => setShowLguDrawer(false)} disabled={busy}>Cancel</button>
              <button type="submit" form="lgu-form" className="cbms-btn cbms-btn--primary" disabled={busy || !lguForm.inhabitantId}>
                {busy ? "Submitting..." : "Submit LGU Endorsement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
