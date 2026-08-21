"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { API_URL, ApiError, post, useApi } from "@cbms/api-client";
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
  const cr = req.data;
  const doc = useApi<CertificateDocument>(
    cr?.status === "released" ? `/certificates/${id}/document` : null,
    [cr?.status],
  );

  const [reason, setReason] = React.useState("");
  const [showReject, setShowReject] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const mayApprove = can("issuance:approve");
  const actionable = cr && ["for_approval", "paid"].includes(cr.status);

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

  return (
    <>
      <PageHead
        title={cr ? cr.referenceNo : "Certificate request"}
        subtitle={cr?.type?.name}
        breadcrumb="Services / Certificates"
        parity="BCIS"
        actions={
          <>
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
          </>
        }
      />

      <ActionResult error={error} success={ok} />

      <Async loading={req.loading} error={req.error}>
        {!cr ? (
          <EmptyNote>Request not found.</EmptyNote>
        ) : (
          <div className="adm-stack">
            <div className="cbms-grid-2">
              <Panel title="Request">
                <KeyValue
                  items={[
                    ["Reference", cr.referenceNo],
                    ["Certificate", cr.type?.name ?? "—"],
                    ["Purpose", cr.purpose],
                    ["Status", <StatusChip key="s" status={cr.status} />],
                    ["Fee", Number(cr.fee) === 0 ? "Free / waived" : pesoAmount(cr.fee)],
                    ["Payment", titleize(cr.paymentMethod ?? "")],
                    ["OR number", cr.orNumber ?? "—"],
                    ["Filed", dateTime(cr.submittedAt ?? cr.createdAt)],
                    ["Approved", cr.approvedAt ? dateTime(cr.approvedAt) : "—"],
                    ["Released", cr.releasedAt ? dateTime(cr.releasedAt) : "—"],
                    ["Expires", cr.expiresAt ? date(cr.expiresAt) : "—"],
                    [
                      "Turnaround",
                      cr.processingMs
                        ? `${Math.round((cr.processingMs / 3_600_000) * 10) / 10} hours`
                        : "—",
                    ],
                    ...(cr.rejectedReason
                      ? ([["Rejection reason", cr.rejectedReason]] as Array<
                          [string, React.ReactNode]
                        >)
                      : []),
                  ]}
                />
              </Panel>

              <div className="adm-stack">
                <Panel title="Resident">
                  {cr.inhabitant ? (
                    <KeyValue
                      items={[
                        ["Name", fullName(cr.inhabitant)],
                        ["Birth date", cr.inhabitant.birthDate ? date(cr.inhabitant.birthDate) : "—"],
                        ["Address", cr.inhabitant.household?.addressLine ?? "—"],
                        ["Purok", cr.inhabitant.household?.purok ?? "—"],
                        ["Contact", cr.inhabitant.contactPhone ?? "—"],
                        [
                          "Profile",
                          cr.inhabitant.id ? (
                            <button
                              type="button"
                              className="cbms-btn cbms-btn--sm"
                              onClick={() => router.push(`/inhabitants/${cr.inhabitant?.id}`)}
                            >
                              Open resident record
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

                <Panel title="Approval" >
                  {!mayApprove ? (
                    <Alert tone="info">
                      Your role may view this request but not approve it. Approval is reserved for
                      the Punong Barangay — a human always signs.
                    </Alert>
                  ) : !actionable ? (
                    <EmptyNote>
                      This request is <strong>{titleize(cr.status)}</strong> — no approval action is
                      available.
                    </EmptyNote>
                  ) : (
                    <>
                      <div className="adm-row">
                        <Button variant="primary" disabled={busy} onClick={() => void approve()}>
                          ✔ Approve & release
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
                          <Field label="Reason for rejection" hint="Shown to the resident.">
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
                            Confirm rejection
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </Panel>
              </div>
            </div>

            {cr.status === "released" && (
              <Panel title="Released document" padded={false}>
                <Async loading={doc.loading} error={doc.error}>
                  {doc.data ? (
                    <div style={{ padding: 18 }}>
                      <div className="adm-doc">
                        <div className="adm-doc__hdr">
                          <div className="adm-doc__brgy">
                            Republic of the Philippines · Barangay {doc.data.barangay}
                          </div>
                          <div className="adm-doc__title">{doc.data.title}</div>
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
                            <span className="adm-verify">{doc.data.verifyCode ?? "—"}</span>
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
                    <EmptyNote>Document not available.</EmptyNote>
                  )}
                </Async>
              </Panel>
            )}

            {cr.status !== "released" && cr.verifyCode && (
              <Panel title="Verification">
                <div className="adm-row">
                  <Chip tone="gold">Code</Chip>
                  <span className="adm-verify">{cr.verifyCode}</span>
                </div>
              </Panel>
            )}
          </div>
        )}
      </Async>
    </>
  );
}
