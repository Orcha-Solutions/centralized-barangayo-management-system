"use client";

import * as React from "react";
import Link from "next/link";
import { Alert, Button, Chip, Field, Loading, date, pesoAmount } from "@cbms/ui";
import { API_URL, get, post, useApi } from "@cbms/api-client";
import { Card, Muted, SectionTitle, Shell } from "@/components/Shell";
import { useT, type Translate } from "@/i18n";
import { REQUEST_STATUS, REQUEST_TIMELINE } from "@/lib/labels";
import { errorMessage, useResidentSession } from "@/lib/session";
import type {
  CertificateDocument,
  CertificateRequest,
  CertificateType,
  ListResponse,
} from "@/lib/types";

export default function ServicesPage() {
  const { t, lang } = useT();
  const { ready, inhabitantId } = useResidentSession();

  const typesReq = useApi<ListResponse<CertificateType>>(ready ? "/certificate-types" : null);
  const mineReq = useApi<ListResponse<CertificateRequest>>(ready ? "/me/requests" : null);

  const [selected, setSelected] = React.useState<CertificateType | null>(null);
  const [purpose, setPurpose] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [created, setCreated] = React.useState<CertificateRequest | null>(null);
  const [payNote, setPayNote] = React.useState<string | null>(null);

  if (!ready) return <Loading label={t("loading")} />;

  const reset = () => {
    setSelected(null);
    setPurpose("");
    setCreated(null);
    setPayNote(null);
    setError(null);
  };

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    if (purpose.trim().length < 3) {
      setError(t("svc_purpose_short"));
      return;
    }
    if (!inhabitantId) {
      setError(t("error_generic"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await post<CertificateRequest>("/certificates", {
        typeId: selected.id,
        inhabitantId,
        purpose: purpose.trim(),
      });
      setCreated(res);
      mineReq.reload();
    } catch (err) {
      setError(errorMessage(err, lang));
    } finally {
      setBusy(false);
    }
  }

  async function payNow(request: CertificateRequest) {
    setBusy(true);
    setError(null);
    setPayNote(null);
    try {
      const res = await post<{
        ok: boolean;
        waived?: boolean;
        orNumber?: string;
        request: CertificateRequest;
      }>("/wallet/pay-fee", { certificateRequestId: request.id });
      setPayNote(
        res.waived
          ? t("svc_pay_waived")
          : t("svc_paid_ok", { or: res.orNumber ?? "—" }),
      );
      setCreated(res.request);
      mineReq.reload();
    } catch (err) {
      setError(errorMessage(err, lang));
    } finally {
      setBusy(false);
    }
  }

  // ---------- Request form / confirmation ----------
  if (selected) {
    return (
      <Shell
        title={t("svc_request_title", { name: selected.name })}
        subtitle={t("services_sub")}
        back="/services"
      >
        <div style={{ marginBottom: 12 }}>
          <Button size="sm" onClick={reset}>
            ‹ {t("back")}
          </Button>
        </div>

        {error && <Alert tone="danger">{error}</Alert>}

        {!created ? (
          <Card title={selected.name}>
            <FeeLine type={selected} t={t} />
            <RequirementsList requirements={selected.requirements} t={t} />
            {selected.exemptNote && <Muted>{selected.exemptNote}</Muted>}

            <form onSubmit={submitRequest} style={{ marginTop: 14 }}>
              <Field label={t("svc_purpose")}>
                <textarea
                  className="cbms-textarea"
                  style={{ width: "100%" }}
                  rows={3}
                  placeholder={t("svc_purpose_ph")}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                />
              </Field>
              <Button
                type="submit"
                variant="primary"
                disabled={busy}
                style={{ width: "100%", height: 44 }}
              >
                {busy ? t("sending") : t("svc_submit")}
              </Button>
            </form>
          </Card>
        ) : (
          <>
            <Alert tone="success">{t("svc_created", { ref: created.referenceNo })}</Alert>
            {payNote && <Alert tone="info">{payNote}</Alert>}

            <Card title={t("svc_timeline")}>
              <Timeline status={created.status} t={t} />
            </Card>

            {created.status === "awaiting_payment" && (
              <Card>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{t("svc_how_much")}</div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "var(--cbms-navy)",
                    margin: "6px 0 12px",
                  }}
                >
                  {Number(created.fee) > 0 ? pesoAmount(created.fee) : t("svc_free")}
                </div>
                <Button
                  variant="gold"
                  disabled={busy}
                  onClick={() => void payNow(created)}
                  style={{ width: "100%", height: 44 }}
                >
                  {busy ? t("svc_paying") : t("svc_pay_now")}
                </Button>
                <Muted>{t("wallet_cashout_note")}</Muted>
              </Card>
            )}

            <Button onClick={reset} style={{ width: "100%" }}>
              {t("back")}
            </Button>
          </>
        )}
      </Shell>
    );
  }

  // ---------- Catalogue + my requests ----------
  const types = typesReq.data?.items ?? [];
  const mine = mineReq.data?.items ?? [];

  return (
    <Shell title={t("services_title")} subtitle={t("services_sub")} exclusive>
      <Muted>{t("services_parity_note")}</Muted>

      {error && <Alert tone="danger">{error}</Alert>}

      <SectionTitle>{t("svc_available")}</SectionTitle>
      {typesReq.loading ? (
        <Muted>{t("loading")}</Muted>
      ) : typesReq.error ? (
        <Alert tone="danger">{errorMessage(typesReq.error, lang)}</Alert>
      ) : types.length === 0 ? (
        <Card>
          <Muted>{t("none")}</Muted>
        </Card>
      ) : (
        types.map((type) => (
          <Card key={type.id} title={type.name}>
            {type.description && <Muted>{type.description}</Muted>}
            <FeeLine type={type} t={t} />
            <RequirementsList requirements={type.requirements} t={t} />
            <Button
              variant="primary"
              style={{ width: "100%", marginTop: 10 }}
              onClick={() => {
                setSelected(type);
                setPurpose("");
                setCreated(null);
                setPayNote(null);
                setError(null);
              }}
            >
              {t("svc_request")}
            </Button>
          </Card>
        ))
      )}

      <SectionTitle>{t("svc_my_requests")}</SectionTitle>
      {mineReq.loading ? (
        <Muted>{t("loading")}</Muted>
      ) : mine.length === 0 ? (
        <Card>
          <Muted>{t("svc_no_requests")}</Muted>
        </Card>
      ) : (
        mine.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            t={t}
            onPay={() => void payNow(request)}
            busy={busy}
          />
        ))
      )}
    </Shell>
  );
}

// ---------------------------------------------------------------

function FeeLine({ type, t }: { type: CertificateType; t: Translate }) {
  const fee = Number(type.fee);
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "8px 0" }}>
      <Chip tone={fee > 0 ? "gold" : "green"}>
        {t("svc_fee")}: {fee > 0 ? pesoAmount(fee) : t("svc_free")}
      </Chip>
      <Chip tone="gray">{t("svc_validity", { days: type.validityDays })}</Chip>
    </div>
  );
}

function RequirementsList({ requirements, t }: { requirements: string[]; t: Translate }) {
  if (!requirements || requirements.length === 0) {
    return <Muted>{t("svc_no_requirements")}</Muted>;
  }
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--cbms-muted)" }}>
        {t("svc_requirements")}
      </div>
      <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 13, lineHeight: 1.6 }}>
        {requirements.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </div>
  );
}

function Timeline({ status, t }: { status: string; t: Translate }) {
  const terminal = status === "rejected" || status === "cancelled";
  const currentIndex = REQUEST_TIMELINE.indexOf(status as (typeof REQUEST_TIMELINE)[number]);
  // `paid` and `approved` sit between the visible milestones.
  const effectiveIndex =
    currentIndex >= 0
      ? currentIndex
      : status === "paid"
        ? 2
        : status === "approved"
          ? 3
          : 0;

  return (
    <div>
      {REQUEST_TIMELINE.map((step, i) => {
        const done = !terminal && i <= effectiveIndex;
        const current = !terminal && i === effectiveIndex;
        const meta = REQUEST_STATUS[step];
        return (
          <div key={step} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span
                aria-hidden="true"
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: done ? "var(--cbms-navy)" : "var(--cbms-line)",
                  border: current ? "3px solid var(--cbms-gold)" : "none",
                  boxSizing: "border-box",
                }}
              />
              {i < REQUEST_TIMELINE.length - 1 && (
                <span
                  aria-hidden="true"
                  style={{
                    width: 2,
                    height: 22,
                    background: done ? "var(--cbms-navy)" : "var(--cbms-line)",
                  }}
                />
              )}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: current ? 700 : 500,
                color: done ? "var(--cbms-ink)" : "var(--cbms-muted)",
                paddingBottom: 12,
              }}
            >
              {meta ? t(meta.key) : step}
            </div>
          </div>
        );
      })}
      {terminal && (
        <Chip tone={REQUEST_STATUS[status]?.tone ?? "gray"}>
          {REQUEST_STATUS[status] ? t(REQUEST_STATUS[status]!.key) : status}
        </Chip>
      )}
    </div>
  );
}

function RequestCard({
  request,
  t,
  onPay,
  busy,
}: {
  request: CertificateRequest;
  t: Translate;
  onPay: () => void;
  busy: boolean;
}) {
  const { lang } = useT();
  const [open, setOpen] = React.useState(false);
  const [doc, setDoc] = React.useState<CertificateDocument | null>(null);
  const [docError, setDocError] = React.useState<string | null>(null);
  const [loadingDoc, setLoadingDoc] = React.useState(false);

  const meta = REQUEST_STATUS[request.status];

  async function toggleDoc() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (doc) return;
    setLoadingDoc(true);
    setDocError(null);
    try {
      setDoc(await get<CertificateDocument>(`/certificates/${request.id}/document`));
    } catch (err) {
      setDocError(errorMessage(err, lang));
    } finally {
      setLoadingDoc(false);
    }
  }

  function downloadDoc() {
    if (!doc) return;
    const text = [
      doc.title.toUpperCase(),
      `Barangay ${doc.barangay}`,
      "",
      doc.body,
      "",
      `${t("svc_or_number")}: ${doc.orNumber ?? "—"}`,
      `${t("svc_verify_code")}: ${doc.verifyCode ?? "—"}`,
      `${API_URL}${doc.verifyUrl}`,
    ].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.referenceNo}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card
      title={request.type?.name ?? request.referenceNo}
      right={meta ? <Chip tone={meta.tone}>{t(meta.key)}</Chip> : null}
    >
      <div style={{ fontSize: 12.5, color: "var(--cbms-muted)" }}>{request.referenceNo}</div>
      <div style={{ fontSize: 13.5, marginTop: 4 }}>{request.purpose}</div>

      <div style={{ marginTop: 10 }}>
        <Timeline status={request.status} t={t} />
      </div>

      {request.rejectedReason && <Alert tone="danger">{request.rejectedReason}</Alert>}

      {request.status === "awaiting_payment" && (
        <Button
          variant="gold"
          disabled={busy}
          onClick={onPay}
          style={{ width: "100%", marginTop: 8 }}
        >
          {busy ? t("svc_paying") : t("svc_pay_now")} · {pesoAmount(request.fee)}
        </Button>
      )}

      {request.status === "released" && (
        <>
          <Button onClick={() => void toggleDoc()} style={{ width: "100%", marginTop: 8 }}>
            {open ? t("svc_hide_doc") : t("svc_view_doc")}
          </Button>
          <Link
            href={`/feedback?request=${encodeURIComponent(request.id)}`}
            style={{
              display: "block",
              textAlign: "center",
              marginTop: 8,
              fontSize: 13,
              fontWeight: 700,
              color: "var(--cbms-navy)",
            }}
          >
            ⭐ {t("svc_rate")}
          </Link>
        </>
      )}

      {open && (
        <div style={{ marginTop: 12 }}>
          {loadingDoc && <Muted>{t("loading")}</Muted>}
          {docError && <Alert tone="danger">{docError}</Alert>}
          {doc && (
            <div
              style={{
                border: "1px solid var(--cbms-line)",
                borderRadius: "var(--cbms-radius)",
                padding: 14,
                background: "#fff",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  fontWeight: 800,
                  color: "var(--cbms-navy)",
                  fontSize: 14,
                }}
              >
                {doc.title}
              </div>
              <div
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "var(--cbms-muted)",
                  marginBottom: 10,
                }}
              >
                Barangay {doc.barangay}
              </div>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "var(--cbms-font)",
                  fontSize: 13,
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {doc.body}
              </pre>

              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px dashed var(--cbms-line)",
                  fontSize: 12.5,
                }}
              >
                <div>
                  <strong>{t("svc_issued")}:</strong> {date(doc.issuedAt)}
                </div>
                <div>
                  <strong>{t("svc_expires")}:</strong> {date(doc.expiresAt)}
                </div>
                {doc.orNumber && (
                  <div>
                    <strong>{t("svc_or_number")}:</strong> {doc.orNumber}
                  </div>
                )}
              </div>

              {/* Verification code rendered as text — no QR library in this build. */}
              <div
                style={{
                  marginTop: 12,
                  textAlign: "center",
                  border: "2px solid var(--cbms-navy)",
                  borderRadius: "var(--cbms-radius)",
                  padding: 12,
                  background: "var(--cbms-card)",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--cbms-muted)" }}>
                  {t("svc_verify_code")}
                </div>
                <div
                  style={{
                    fontFamily: "ui-monospace, Consolas, monospace",
                    fontSize: 20,
                    fontWeight: 800,
                    letterSpacing: ".14em",
                    color: "var(--cbms-navy)",
                    margin: "4px 0 8px",
                    wordBreak: "break-all",
                  }}
                >
                  {doc.verifyCode ?? "—"}
                </div>
                <a
                  href={`${API_URL}${doc.verifyUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "var(--cbms-navy)",
                    textDecoration: "underline",
                    wordBreak: "break-all",
                  }}
                >
                  {t("svc_verify_open")}
                </a>
                <div style={{ fontSize: 11, color: "var(--cbms-muted)", marginTop: 6 }}>
                  {t("svc_verify_hint")}
                </div>
              </div>

              <Button onClick={downloadDoc} style={{ width: "100%", marginTop: 12 }}>
                ⬇ {t("svc_download_txt")}
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
