"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { API_URL, ApiError, post, del, useApi } from "@cbms/api-client";
import {
  Alert,
  Button,
  Chip,
  Field,
  KeyValue,
  PageHead,
  Panel,
  StatusChip,
  date,
  dateTime,
  fullName,
  pesoAmount,
  titleize,
} from "@cbms/ui";
import { ActionResult, Async, EmptyNote } from "../../../../components/common";
import { useConsole } from "../../../../components/Shell";
import type { CertificateDocument, CertificateRequest } from "../../../../lib/types";

export default function CertificateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { can, reloadDashboard } = useConsole();
  const id = String((params as Record<string, string | string[]>)?.id ?? "");

  const req = useApi<CertificateRequest>(id ? `/certificates/${id}` : null);
  const cr =
    req.data && !Array.isArray(req.data) && (req.data as any).referenceNo
      ? req.data
      : Array.isArray(req.data) && req.data.length > 0 && (req.data[0] as any)?.referenceNo
      ? (req.data[0] as CertificateRequest)
      : null;
  const doc = useApi<CertificateDocument>(
    cr?.status === "released" ? `/certificates/${id}/document` : null,
    [cr?.status],
  );

  const [reason, setReason] = React.useState("");
  const [showReject, setShowReject] = React.useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = React.useState(false);
  const [showDeletePopup, setShowDeletePopup] = React.useState(false);

  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const mayApprove = can("issuance:approve");
  const actionable = cr && ["for_approval", "paid", "submitted", "pending"].includes(cr.status);

  async function approve() {
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await post(`/certificates/${id}/approve`);
      setOk("Approved and released. The verification code is now live.");
      req.reload();
      reloadDashboard();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Approval failed.");
    } finally {
      setBusy(false);
    }
  }

  async function reject() {
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await post(`/certificates/${id}/reject`, { reason: reason.trim() });
      setOk("Request rejected. The resident will see the reason.");
      setShowReject(false);
      setReason("");
      req.reload();
      reloadDashboard();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Rejection failed.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    setBusy(true);
    setError(null);
    try {
      await del(`/certificates/${id}`);
      setShowDeletePopup(false);
      router.push("/certificates");
    } catch (err: any) {
      setError(err?.message || "Failed to delete request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title={cr ? cr.referenceNo : "Certificate request"}
        subtitle={cr?.type?.name || "Clearance Request"}
        breadcrumb="Services / Document Requests"
        parity="BCIS"
        actions={
          <div style={{ display: "flex", gap: "0.5rem", position: "relative" }}>
            <button
              type="button"
              className="cbms-btn adm-noprint"
              onClick={() => router.push("/certificates")}
            >
              ← Back
            </button>

            {cr?.status === "released" && (
              <Button className="adm-noprint" onClick={() => window.print()}>
                🖨 Print
              </Button>
            )}

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
                    {mayApprove && actionable && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowActionsDropdown(false);
                          void approve();
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
                          color: "var(--cbms-green, #10a37f)",
                          width: "100%"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        ✔ Approve & Release
                      </button>
                    )}
                    {actionable && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowActionsDropdown(false);
                          setShowReject(true);
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
                        ✖ Reject Request
                      </button>
                    )}
                    {cr?.status === "released" && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowActionsDropdown(false);
                          window.print();
                        }}
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
                        🖨 Print Certificate
                      </button>
                    )}
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

      <ActionResult error={error} success={ok} />

      <Async loading={req.loading} error={req.error}>
        {!cr ? (
          <EmptyNote>Request not found.</EmptyNote>
        ) : (
          <div className="adm-stack">
            <div className="cbms-grid-2">
              <Panel title="Request Details">
                <KeyValue
                  items={[
                    ["Reference No", cr.referenceNo],
                    ["Certificate", cr.type?.name ?? "—"],
                    ["Purpose", cr.purpose],
                    ["Status", <StatusChip key="s" status={cr.status} />],
                    ["Fee Charged", Number(cr.fee) === 0 ? "Free / waived" : pesoAmount(cr.fee)],
                    ["Payment Mode", titleize(cr.paymentMethod ?? "Cash")],
                    ["OR Number", cr.orNumber ?? "—"],
                    ["Filed At", dateTime(cr.submittedAt ?? cr.createdAt)],
                    ["Approved At", cr.approvedAt ? dateTime(cr.approvedAt) : "—"],
                    ["Released At", cr.releasedAt ? dateTime(cr.releasedAt) : "—"],
                    ["Expires At", cr.expiresAt ? date(cr.expiresAt) : "—"],
                    [
                      "Turnaround",
                      cr.processingMs
                        ? `${Math.round((cr.processingMs / 3_600_000) * 10) / 10} hours`
                        : "< 2 hours",
                    ],
                    ...(cr.rejectedReason
                      ? ([["Rejection Reason", cr.rejectedReason]] as Array<
                          [string, React.ReactNode]
                        >)
                      : []),
                  ]}
                />
              </Panel>

              <div className="adm-stack">
                <Panel title="Applicant Resident">
                  {cr.inhabitant ? (
                    <KeyValue
                      items={[
                        ["Full Name", fullName(cr.inhabitant)],
                        ["Birth Date", cr.inhabitant.birthDate ? date(cr.inhabitant.birthDate) : "—"],
                        ["PhilSys PCN", cr.inhabitant.philsysNo ?? "Not provided"],
                        ["Address", cr.inhabitant.household?.addressLine ?? "Barangay Resident"],
                        ["Purok", cr.inhabitant.household?.purok ?? "—"],
                        ["Contact Phone", cr.inhabitant.contactPhone ?? "—"],
                        [
                          "Citizen Record",
                          cr.inhabitant.id ? (
                            <button
                              type="button"
                              className="cbms-btn cbms-btn--sm"
                              onClick={() => router.push(`/inhabitants/${cr.inhabitant?.id}/edit`)}
                            >
                              View Citizen Profile ↗
                            </button>
                          ) : (
                            "—"
                          ),
                        ],
                      ]}
                    />
                  ) : (
                    <EmptyNote>No resident attached.</EmptyNote>
                  )}
                </Panel>

                <Panel title="Approval & Endorsement Controls">
                  {!mayApprove ? (
                    <Alert tone="info">
                      Your role may view this request. Official signature and approval is reserved for the Punong Barangay or Authorized Officer.
                    </Alert>
                  ) : !actionable ? (
                    <EmptyNote>
                      This request is currently <strong>{titleize(cr.status)}</strong>.
                    </EmptyNote>
                  ) : (
                    <>
                      <div className="adm-row">
                        <Button variant="primary" disabled={busy} onClick={() => void approve()}>
                          ✔ Approve & Release
                        </Button>
                        <Button
                          variant="danger"
                          disabled={busy}
                          onClick={() => setShowReject((v) => !v)}
                        >
                          ✖ Reject
                        </Button>
                      </div>
                      {showReject && (
                        <div style={{ marginTop: 14 }}>
                          <Field label="Reason for rejection" hint="Recorded in audit trail and displayed to citizen.">
                            <textarea
                              className="cbms-textarea"
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                            />
                          </Field>
                          <Button
                            variant="danger"
                            disabled={busy || reason.trim().length < 3}
                            onClick={() => void reject()}
                          >
                            Confirm Rejection
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </Panel>
              </div>
            </div>

            {cr.status === "released" && (
              <Panel title="Official Released Clearance Document" padded={false}>
                <Async loading={doc.loading} error={doc.error}>
                  {doc.data ? (
                    <div style={{ padding: 18 }}>
                      <div className="adm-doc">
                        <div className="adm-doc__hdr">
                          <div className="adm-doc__brgy">
                            Republic of the Philippines · Barangay {doc.data.barangay || "Barangka"}
                          </div>
                          <div className="adm-doc__title">{doc.data.title || "BARANGAY CLEARANCE"}</div>
                        </div>
                        <div className="adm-doc__body">{doc.data.body}</div>
                        <div className="adm-doc__foot">
                          <span>
                            Reference: <strong>{doc.data.referenceNo}</strong>
                          </span>
                          <span>Issued: {doc.data.issuedAt ? date(doc.data.issuedAt) : "—"}</span>
                          <span>Valid until: {doc.data.expiresAt ? date(doc.data.expiresAt) : "—"}</span>
                          {doc.data.orNumber && <span>OR: {doc.data.orNumber}</span>}
                        </div>
                        <div className="adm-doc__foot">
                          <span>
                            Verification code:{" "}
                            <span className="adm-verify">{doc.data.verifyCode ?? "BCMS-VERIFIED"}</span>
                          </span>
                          <a
                            className="adm-noprint"
                            href={`${API_URL}${doc.data.verifyUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ textDecoration: "underline" }}
                          >
                            Open public verification page ↗
                          </a>
                        </div>
                      </div>
                      <div className="adm-kpi-note adm-noprint">
                        Anyone can confirm this certificate at{" "}
                        <code>{`${API_URL}${doc.data.verifyUrl}`}</code> without signing in. The
                        public endpoint discloses initials only — never the full name.
                      </div>
                    </div>
                  ) : (
                    <EmptyNote>Document rendered successfully.</EmptyNote>
                  )}
                </Async>
              </Panel>
            )}

            {cr.status !== "released" && cr.verifyCode && (
              <Panel title="Verification Preview">
                <div className="adm-row">
                  <Chip tone="gold">Code</Chip>
                  <span className="adm-verify">{cr.verifyCode}</span>
                </div>
              </Panel>
            )}
          </div>
        )}
      </Async>

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
                ⚠️ Delete Document Request
              </h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--cbms-muted, #64748b)", lineHeight: "1.4" }}>
                Are you sure you want to delete this certificate request ({cr?.referenceNo})? This action is permanent and cannot be undone.
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
