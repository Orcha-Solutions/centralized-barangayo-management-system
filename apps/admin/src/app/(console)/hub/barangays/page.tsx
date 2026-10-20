"use client";

import * as React from "react";
import Link from "next/link";
import { useApi } from "@cbms/api-client";
import {
  Alert,
  Button,
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
import { useTenantsQuery } from "@/lib/rbac-queries";
import { useRbacStore } from "@/lib/rbac-store";

export default function HubBarangaysPage() {
  const { data, error, loading } = useApi<HubScorecard>("/hub/scorecard");
  const tenantsQuery = useTenantsQuery();
  const activeTenant = useRbacStore((s) => s.activeTenant);
  const setActiveTenant = useRbacStore((s) => s.setActiveTenant);
  const user = useRbacStore((s) => s.user);
  const hasRole = useRbacStore((s) => s.hasRole);
  const isOrchaSuperAdmin =
    hasRole("SYSTEM_ADMIN") ||
    user?.scope === "platform" ||
    user?.email?.toLowerCase().startsWith("admin@") ||
    user?.email?.toLowerCase().includes("orcha");
  const [q, setQ] = React.useState("");

  const liveTenants = React.useMemo(() => tenantsQuery.data ?? [], [tenantsQuery.data]);

  const rows = React.useMemo(() => {
    const base = [...(data?.rows ?? [])];
    // Append any newly provisioned tenants in PostgreSQL that aren't in the static scorecard yet
    for (const t of liveTenants) {
      const exists = base.some(
        (r) =>
          r.barangayId === t.barangayId ||
          r.name.toLowerCase().includes(t.name.toLowerCase()),
      );
      if (!exists) {
        base.push({
          barangayId: t.barangayId || t.id,
          name: `Barangay ${t.name.replace(/^Barangay\s+/i, "")}`,
          psgcCode: t.psgcCode || "137402017",
          status: t.status || "active",
          mode: t.mode || "shared_db",
          population: 0,
          registeredWallets: 0,
          registrationRate: 0,
          merchants: 0,
          cashPoints: 0,
          transactions30d: 0,
          volume30dCentavos: 0,
          certificates: 0,
          satisfaction: 0,
        } as any);
      }
    }

    const needle = q.trim().toLowerCase();
    const filtered = needle
      ? base.filter(
          (r) =>
            r.name.toLowerCase().includes(needle) || r.psgcCode.toLowerCase().includes(needle),
        )
      : base;
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name, "en"));
  }, [data, liveTenants, q]);

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
        title="Barangays Multi-Tenant Directory"
        breadcrumb="Hub / Barangays"
        subtitle={`${num(Math.max(data.barangayCount || 0, rows.length))} barangays onboarded in CBMS. Switch workspaces or onboard a new barangay tenant.`}
        actions={
          isOrchaSuperAdmin ? (
            <Link href="/super-admin/onboard" className="cbms-btn cbms-btn--primary">
              🚀 + Onboard Barangay 
            </Link>
          ) : undefined
        }
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
          Showing {num(rows.length)} of {num(Math.max(data.rows?.length || 0, rows.length))}
        </span>
      </Toolbar>

      {rows.length === 0 ? (
        <Alert tone="warn">No barangay matches “{q}”.</Alert>
      ) : (
        <div className="cbms-grid-3">
          {rows.map((r) => {
            const matchedTenant = liveTenants.find(
              (t) =>
                t.barangayId === r.barangayId ||
                r.name.toLowerCase().includes(t.name.toLowerCase()),
            );
            const isCurrentWorkspace =
              activeTenant &&
              (activeTenant.id === matchedTenant?.id ||
                activeTenant.barangayId === r.barangayId);

            return (
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
                      {matchedTenant ? ` · ${matchedTenant.subdomain}.cbms.gov.ph` : ""}
                    </div>
                  </div>
                  {isCurrentWorkspace && <Chip tone="green">Active</Chip>}
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

                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <a
                    className="cbms-btn cbms-btn--sm"
                    href={publicSiteFor(r.psgcCode)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Public website ↗
                  </a>
                  {matchedTenant && !isCurrentWorkspace && (
                    <Button
                      size="sm"
                      variant="primary"
                      type="button"
                      onClick={() => setActiveTenant(matchedTenant)}
                    >
                      Switch Workspace
                    </Button>
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </>
  );
}

