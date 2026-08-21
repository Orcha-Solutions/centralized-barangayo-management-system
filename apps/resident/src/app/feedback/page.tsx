"use client";

import * as React from "react";
import { Alert, Button, Field, Loading } from "@cbms/ui";
import { post, useApi } from "@cbms/api-client";
import { Card, Muted, Shell } from "@/components/Shell";
import { useT } from "@/i18n";
import { FEEDBACK_STARS } from "@/lib/labels";
import { errorMessage, useResidentSession } from "@/lib/session";
import type { CertificateRequest } from "@/lib/types";

export default function FeedbackPage() {
  const { t, lang } = useT();
  const { ready } = useResidentSession();

  const [requestId, setRequestId] = React.useState<string | null>(null);
  const [rating, setRating] = React.useState<number>(0);
  const [comment, setComment] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  // Read ?request=<id> on the client — avoids a Suspense boundary at build time.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const id = new URLSearchParams(window.location.search).get("request");
    if (id) setRequestId(id);
  }, []);

  const requestReq = useApi<CertificateRequest>(
    ready && requestId ? `/certificates/${requestId}` : null,
  );

  if (!ready) return <Loading label={t("loading")} />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (rating < 1) {
      setError(t("fb_pick_rating"));
      return;
    }
    setBusy(true);
    try {
      await post("/feedback", {
        rating,
        service: "certificate",
        ...(comment.trim() ? { comment: comment.trim() } : {}),
        ...(requestId ? { certificateRequestId: requestId } : {}),
      });
      setDone(true);
    } catch (err) {
      setError(errorMessage(err, lang));
    } finally {
      setBusy(false);
    }
  }

  const activeLabel = FEEDBACK_STARS.find((s) => s.rating === rating);

  return (
    <Shell title={t("fb_title")} subtitle={t("fb_sub")} back="/me" exclusive>
      {error && <Alert tone="danger">{error}</Alert>}

      {done ? (
        <>
          <Alert tone="success">🎉 {t("fb_thanks")}</Alert>
          <Button
            onClick={() => {
              setDone(false);
              setRating(0);
              setComment("");
            }}
            style={{ width: "100%" }}
          >
            {t("fb_another")}
          </Button>
        </>
      ) : (
        <form onSubmit={submit}>
          <Card title={t("fb_question")}>
            {requestReq.data && (
              <Muted>{t("fb_for_request", { ref: requestReq.data.referenceNo })}</Muted>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 6,
                margin: "12px 0 6px",
              }}
            >
              {FEEDBACK_STARS.map((star) => {
                const on = rating >= star.rating;
                return (
                  <button
                    key={star.rating}
                    type="button"
                    aria-label={t(star.key)}
                    aria-pressed={rating === star.rating}
                    onClick={() => setRating(star.rating)}
                    style={{
                      flex: 1,
                      fontSize: 32,
                      lineHeight: 1,
                      padding: "8px 0",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      filter: on ? "none" : "grayscale(1) opacity(.35)",
                    }}
                  >
                    ⭐
                  </button>
                );
              })}
            </div>

            <div
              style={{
                textAlign: "center",
                fontSize: 14,
                fontWeight: 700,
                color: "var(--cbms-navy)",
                minHeight: 20,
              }}
            >
              {activeLabel ? t(activeLabel.key) : ""}
            </div>

            <div style={{ marginTop: 14 }}>
              <Field label={`${t("fb_comment")} (${t("optional")})`}>
                <textarea
                  className="cbms-textarea"
                  style={{ width: "100%" }}
                  rows={3}
                  placeholder={t("fb_comment_ph")}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </Field>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={busy}
              style={{ width: "100%", height: 44 }}
            >
              {busy ? t("sending") : t("fb_submit")}
            </Button>

            {rating > 0 && rating <= 2 && <Muted>{t("fb_low_note")}</Muted>}
          </Card>
        </form>
      )}
    </Shell>
  );
}
