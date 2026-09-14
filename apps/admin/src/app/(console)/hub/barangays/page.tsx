"use client";

import * as React from "react";
import { useApi } from "@cbms/api-client";
import {
  Alert,
  Chip,
  KeyValue,
  Loading,
  PageHead,
  Panel,
  StatusChip,
  Toolbar,
  num,
  peso,
  titleize,
} from "@cbms/ui";
import { RateBar } from "@/components/RateBar";
import { publicSiteFor, type HubScorecard } from "@/lib/hubTypes";

export default function HubBarangaysPage() {
  const { data, error, loading } = useApi<HubScorecard>("/hub/scorecard");
  const [q, setQ] = React.useState("");

  const rows = React.useMemo(() => {
    const all = data?.rows ?? [];
    const needle = q.trim().toLowerCase();
    const filtered = needle
      ? all.filter(
          (r) =>
            r.name.toLowerCase().includes(needle) || r.psgcCode.toLowerCase().includes(needle),
        )
      : all;
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name, "en"));
  }, [data, q]);

  if (loading) return <Loading label="Loading barangays…" />;

  if (error) {
    return (
      <>
        <PageHead title="Barangays" exclusive />
        <Alert tone="danger">
          Could not load <code>/hub/scorecard</code> — {error.message}
        </Alert>
      </>
    );
  }

  if (!data) return <Alert tone="warn">No barangay data available.</Alert>;

  return (
    <>
      <PageHead
        title="Barangays"
        breadcrumb="Hub / Barangays"
        subtitle={`${num(data.barangayCount || 0)} barangays onboarded. Each card links to that barangay's public website.`}
        exclusive
      />

      <Toolbar>
        <input
          className="cbms-input cbms-input--search"
          type="search"
          placeholder="Search by name or PSGC code…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        <div className="cbms-toolbar__spacer" />
        <span style={{ fontSize: 12.5, color: "var(--cbms-muted)" }}>
          Showing {num(rows.length)} of {num(data.rows?.length || 0)}
        </span>
      </Toolbar>

      {rows.length === 0 ? (
        <Alert tone="warn">No barangay matches “{q}”.</Alert>
      ) : (
        <div className="cbms-grid-3">
          {rows.map((r) => (
            <Panel key={r.barangayId}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--cbms-navy)" }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--cbms-muted)", marginTop: 2 }}>
                    PSGC {r.psgcCode}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                <StatusChip status={r.status} />
                <Chip tone={r.mode === "companion" ? "blue" : "navy"}>{titleize(r.mode)}</Chip>
              </div>

              <RateBar label="Wallet registration" rate={r.registrationRate} />

              <KeyValue
                items={[
                  ["Population", num(r.population)],
                  ["Registered wallets", num(r.registeredWallets)],
                  ["Merchants", num(r.merchants)],
                  ["Cash-in/out points", num(r.cashPoints)],
                  ["Transactions (30d)", num(r.transactions30d)],
                  ["Volume (30d)", peso(r.volume30dCentavos)],
                  ["Certificates", num(r.certificates)],
                  [
                    "Satisfaction",
                    r.satisfaction > 0 ? `${r.satisfaction.toFixed(2)} ★` : "No responses",
                  ],
                ]}
              />

              <a
                className="cbms-btn cbms-btn--sm"
                href={publicSiteFor(r.psgcCode)}
                target="_blank"
                rel="noreferrer"
                style={{ marginTop: 12, display: "inline-flex" }}
              >
                Public website ↗
              </a>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
