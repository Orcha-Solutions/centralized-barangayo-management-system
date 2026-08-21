"use client";

import * as React from "react";
import { Alert, Chip, Loading, dateTime, peso, titleize } from "@cbms/ui";
import { useApi } from "@cbms/api-client";
import { Card, Muted, SectionTitle, Shell } from "@/components/Shell";
import { useT } from "@/i18n";
import { KYC_TIER, TXN_STATUS, TXN_TYPE, WALLET_STATUS } from "@/lib/labels";
import { apiStatus, errorMessage, useResidentSession } from "@/lib/session";
import type { WalletMeResponse, WalletTransaction } from "@/lib/types";

export default function WalletPage() {
  const { t, lang } = useT();
  const { ready } = useResidentSession();
  const walletReq = useApi<WalletMeResponse>(ready ? "/wallets/me" : null);

  if (!ready) return <Loading label={t("loading")} />;

  const noWallet = apiStatus(walletReq.error) === 404;
  const wallet = walletReq.data?.wallet ?? null;
  const txns: WalletTransaction[] = walletReq.data?.direction ?? [];

  return (
    <Shell title={t("wallet_title")} subtitle={t("wallet_sub")} exclusive>
      {walletReq.loading && <Muted>{t("loading")}</Muted>}

      {noWallet && <Alert tone="warn">{t("wallet_no_wallet")}</Alert>}

      {walletReq.error && !noWallet && (
        <Alert tone="danger">{errorMessage(walletReq.error, lang)}</Alert>
      )}

      {wallet && (
        <>
          <div
            style={{
              background: "linear-gradient(135deg, var(--cbms-navy) 0%, var(--cbms-navy-ink) 100%)",
              color: "#fff",
              borderRadius: "var(--cbms-radius-lg)",
              padding: 20,
              boxShadow: "var(--cbms-shadow-lg)",
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.85, letterSpacing: ".04em" }}>
              {t("wallet_balance")}
            </div>
            <div style={{ fontSize: 34, fontWeight: 800, margin: "6px 0 12px" }}>
              {peso(wallet.balanceCentavos)}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 11.5 }}>
              <span
                style={{
                  background: "rgba(255,255,255,.16)",
                  borderRadius: 999,
                  padding: "3px 10px",
                }}
              >
                {t("wallet_status")}:{" "}
                {WALLET_STATUS[wallet.status] ? t(WALLET_STATUS[wallet.status]!) : titleize(wallet.status)}
              </span>
              <span
                style={{
                  background: "rgba(255,255,255,.16)",
                  borderRadius: 999,
                  padding: "3px 10px",
                }}
              >
                {t("wallet_kyc")}:{" "}
                {KYC_TIER[wallet.kycTier] ? t(KYC_TIER[wallet.kycTier]!) : titleize(wallet.kycTier)}
              </span>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <Alert tone="success">💚 {t("wallet_aid_free")}</Alert>
          </div>
          <Muted>{t("wallet_cashout_note")}</Muted>

          <SectionTitle>{t("wallet_recent")}</SectionTitle>
          {txns.length === 0 ? (
            <Card>
              <Muted>{t("wallet_none")}</Muted>
            </Card>
          ) : (
            <div className="cbms-panel">
              {txns.map((txn, i) => {
                const incoming = txn.direction === "in";
                const fee = BigInt(txn.feeCentavos || "0");
                return (
                  <div
                    key={txn.id}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      padding: "12px 14px",
                      borderTop: i === 0 ? "none" : "1px solid var(--cbms-line)",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                        fontSize: 16,
                        fontWeight: 800,
                        background: incoming ? "#e6f6f1" : "#fdeaec",
                        color: incoming ? "#0b7a5e" : "#b91c1c",
                      }}
                    >
                      {incoming ? "↓" : "↑"}
                    </span>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                        {txn.description ||
                          (TXN_TYPE[txn.type] ? t(TXN_TYPE[txn.type]!) : titleize(txn.type))}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--cbms-muted)" }}>
                        {incoming ? t("wallet_in") : t("wallet_out")} ·{" "}
                        {dateTime(txn.completedAt ?? txn.createdAt)}
                      </div>
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: incoming ? "#0b7a5e" : "var(--cbms-ink)",
                        }}
                      >
                        {incoming ? "+" : "−"}
                        {peso(txn.amountCentavos)}
                      </div>
                      {fee > 0n && (
                        <div style={{ fontSize: 11, color: "var(--cbms-muted)" }}>
                          {t("wallet_fee")} {peso(txn.feeCentavos)}
                        </div>
                      )}
                      {txn.status !== "completed" && (
                        <Chip tone={txn.status === "failed" ? "red" : "gold"}>
                          {TXN_STATUS[txn.status] ? t(TXN_STATUS[txn.status]!) : titleize(txn.status)}
                        </Chip>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </Shell>
  );
}
