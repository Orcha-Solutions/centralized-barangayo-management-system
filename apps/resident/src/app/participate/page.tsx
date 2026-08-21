"use client";

import * as React from "react";
import { Alert, Button, Chip, Loading, dateTime, num } from "@cbms/ui";
import { post, useApi } from "@cbms/api-client";
import { Card, Muted, SectionTitle, Shell } from "@/components/Shell";
import { useT } from "@/i18n";
import { apiStatus, errorMessage, useResidentSession } from "@/lib/session";
import type { ListResponse, PbCycle } from "@/lib/types";

export default function ParticipatePage() {
  const { t, lang } = useT();
  const { ready } = useResidentSession();

  // The list endpoint omits `options`; the detail endpoint includes them.
  const cyclesReq = useApi<ListResponse<PbCycle>>(ready ? "/participation/cycles" : null);
  const openCycle = (cyclesReq.data?.items ?? []).find((c) => c.status === "open") ?? null;
  const detailReq = useApi<PbCycle>(
    ready && openCycle ? `/participation/cycles/${openCycle.id}` : null,
  );

  const [choice, setChoice] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [voted, setVoted] = React.useState(false);
  const [alreadyVoted, setAlreadyVoted] = React.useState(false);

  if (!ready) return <Loading label={t("loading")} />;

  const cycle = detailReq.data ?? openCycle;
  const options = detailReq.data?.options ?? [];

  async function vote() {
    if (!cycle) return;
    if (!choice) {
      setError(t("pb_pick_first"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await post("/participation/vote", { cycleId: cycle.id, optionId: choice });
      setVoted(true);
      detailReq.reload();
    } catch (err) {
      // 409 = the DB unique constraint already holds a vote from this resident.
      if (apiStatus(err) === 409) {
        setAlreadyVoted(true);
      } else {
        setError(errorMessage(err, lang));
      }
    } finally {
      setBusy(false);
    }
  }

  const loading = cyclesReq.loading || detailReq.loading;
  const totalVotes = options.reduce((sum, o) => sum + o.voteCount, 0);

  return (
    <Shell title={t("pb_title")} subtitle={t("pb_sub")} back="/me" exclusive>
      {error && <Alert tone="danger">{error}</Alert>}
      {voted && <Alert tone="success">🎉 {t("pb_thanks")}</Alert>}
      {alreadyVoted && <Alert tone="warn">{t("pb_already")}</Alert>}

      {loading && <Muted>{t("loading")}</Muted>}

      {!loading && !cycle && (
        <Card>
          <Muted>{t("pb_no_cycle")}</Muted>
        </Card>
      )}

      {cycle && (
        <>
          <Card title={cycle.title}>
            <Chip tone="gold">{t("pb_closes", { when: dateTime(cycle.closesAt) })}</Chip>
            <Muted>{t("pb_one_vote")}</Muted>
          </Card>

          <SectionTitle>{t("pb_options")}</SectionTitle>

          {options.length === 0 ? (
            <Card>
              <Muted>{t("none")}</Muted>
            </Card>
          ) : (
            options.map((option) => {
              const selected = choice === option.id;
              const share = totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0;
              const disabled = voted || alreadyVoted;
              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={disabled}
                  aria-pressed={selected}
                  onClick={() => {
                    setChoice(option.id);
                    setError(null);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    marginBottom: 10,
                    padding: 14,
                    borderRadius: "var(--cbms-radius)",
                    border: `${selected ? 2 : 1}px solid ${
                      selected ? "var(--cbms-navy)" : "var(--cbms-line)"
                    }`,
                    background: selected ? "var(--cbms-card)" : "#fff",
                    cursor: disabled ? "default" : "pointer",
                    opacity: disabled && !selected ? 0.7 : 1,
                    font: "inherit",
                  }}
                >
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span
                      aria-hidden="true"
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: `2px solid ${
                          selected ? "var(--cbms-navy)" : "var(--cbms-line)"
                        }`,
                        background: selected ? "var(--cbms-navy)" : "#fff",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{ fontSize: 14, fontWeight: 700, color: "var(--cbms-navy)" }}
                      >
                        {option.label}
                      </div>
                      {option.detail && (
                        <div style={{ fontSize: 12.5, color: "var(--cbms-muted)", marginTop: 2 }}>
                          {option.detail}
                        </div>
                      )}

                      <div
                        style={{
                          marginTop: 8,
                          height: 6,
                          borderRadius: 999,
                          background: "var(--cbms-line)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${share}%`,
                            height: "100%",
                            background: "var(--cbms-gold)",
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--cbms-muted)", marginTop: 4 }}>
                        {t("pb_votes", { n: num(option.voteCount) })}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}

          {!voted && !alreadyVoted && options.length > 0 && (
            <Button
              variant="primary"
              disabled={busy}
              onClick={() => void vote()}
              style={{ width: "100%", height: 44 }}
            >
              🗳️ {busy ? t("pb_voting") : t("pb_vote")}
            </Button>
          )}
        </>
      )}
    </Shell>
  );
}
