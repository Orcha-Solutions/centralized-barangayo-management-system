"use client";

import * as React from "react";
import Link from "next/link";
import { useApi } from "@cbms/api-client";
import { Alert, Loading, PageHead, Panel, StatCard, StatGrid, num, peso } from "@cbms/ui";
import { RateBar } from "@/components/RateBar";
import type { HubScorecard } from "@/lib/types";

export default function DashboardPage() {
  const { data, error, loading } = useApi<HubScorecard>("/hub/scorecard");

  const ranked = React.useMemo(() => {
    if (!data?.rows) return [];
    return [...data.rows].sort((a, b) => b.registrationRate - a.registrationRate);
  }, [data]);

  const { top, bottom } = React.useMemo(() => {
    const size = Math.min(5, Math.floor(ranked.length / 2)) || Math.min(5, ranked.length);
    return {
      top: ranked.slice(0, size),
      bottom: ranked.slice(Math.max(size, ranked.length - size)).reverse(),
    };
  }, [ranked]);

  const volume30d = React.useMemo(
    () =>
      (data?.rows ?? []).reduce((sum, r) => sum + BigInt(r.volume30dCentavos || "0"), 0n),
    [data],
  );

  if (loading) return <Loading label="Loading city scorecard…" />;

  if (error) {
    return (
      <>
        <PageHead
          title="City adoption dashboard"
          subtitle="Totals across every barangay onboarded to CBMS."
          exclusive
        />
        <Alert tone="danger">
          Could not load <code>/hub/scorecard</code> — {error.message}
        </Alert>
      </>
    );
  }

  if (!data) return <Alert tone="warn">No scorecard data available.</Alert>;

  const t = data.totals;

  return (
    <>
      <PageHead
        title="City adoption dashboard"
        subtitle={`Roll-up across ${num(data.barangayCount)} barangays. E-wallet adoption and service delivery are CBMS-exclusive measures — they have no LGUSS-BIMS equivalent.`}
        breadcrumb="Hub"
        exclusive
        actions={
          <Link href="/scorecard" className="cbms-btn cbms-btn--primary">
            Open scorecard
          </Link>
        }
      />

      <StatGrid>
        <StatCard label="Barangays onboarded" value={num(data.barangayCount)} icon="🏘" />
        <StatCard label="Population covered" value={num(t.population)} icon="👥" />
        <StatCard
          label="Registered wallets"
          value={num(t.registeredWallets)}
          icon="💳"
          tone="gold"
          hint={`Target: ${data.targets.registrationRate}`}
        />
        <StatCard
          label="Merchants accepting"
          value={num(t.merchants)}
          icon="🏪"
          tone="green"
          hint={`Target: ${data.targets.merchants}`}
        />
        <StatCard label="Transactions (30d)" value={num(t.transactions30d)} icon="⇄" />
        <StatCard label="Certificates issued" value={num(t.certificates)} icon="🧾" />
      </StatGrid>

      <div style={{ marginTop: 18 }}>
        <Alert tone="info">
          Transaction volume in the last 30 days across all barangays:{" "}
          <strong>{peso(volume30d.toString())}</strong>. Adoption targets —{" "}
          {data.targets.registrationRate} registered, {data.targets.activeRate} active,{" "}
          {data.targets.merchants}.
        </Alert>
      </div>

      <div className="cbms-grid-2" style={{ marginTop: 18 }}>
        <Panel title="Highest wallet adoption">
          {top.length === 0 ? (
            <div style={{ color: "var(--cbms-muted)", fontSize: 13 }}>No barangays yet.</div>
          ) : (
            top.map((r, i) => (
              <RateBar
                key={r.barangayId}
                rank={i + 1}
                label={r.name}
                rate={r.registrationRate}
                sub={`${num(r.registeredWallets)} wallets · ${num(r.merchants)} merchants`}
              />
            ))
          )}
        </Panel>

        <Panel title="Needs attention — lowest adoption">
          {bottom.length === 0 ? (
            <div style={{ color: "var(--cbms-muted)", fontSize: 13 }}>No barangays yet.</div>
          ) : (
            bottom.map((r, i) => (
              <RateBar
                key={r.barangayId}
                rank={ranked.length - i}
                label={r.name}
                rate={r.registrationRate}
                sub={`${num(r.registeredWallets)} wallets · ${num(r.cashPoints)} cash-in/out points`}
              />
            ))
          )}
        </Panel>
      </div>
    </>
  );
}
