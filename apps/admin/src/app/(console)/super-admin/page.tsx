"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Chip,
  DataTable,
  PageHead,
  Panel,
  StatusChip,
  Toolbar,
  num,
} from "@cbms/ui";
import {
  switchActiveTenant,
  updateTenant,
  type TenantInfo,
  type UpdateTenantPayload,
} from "@cbms/api-client";
import { ActionResult } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import { useTenantsQuery } from "../../../lib/rbac-queries";
import { useRbacStore } from "../../../lib/rbac-store";

const ISOLATION_MODE_LABELS: Record<string, { label: string; desc: string; tone: "blue" | "navy" | "green" }> = {
  shared_db: {
    label: "Shared RDBMS",
    desc: "Row-Level Security (RLS) partition in primary cluster",
    tone: "blue",
  },
  isolated_schema: {
    label: "Schema-Isolated",
    desc: "Dedicated PostgreSQL schema namespace (brgy_*)",
    tone: "navy",
  },
  dedicated_db: {
    label: "Dedicated DB",
    desc: "Separate high-compliance database instance",
    tone: "green",
  },
};

export default function BarangaysPage() {
  const router = useRouter();
  const { user } = useConsole();
  const activeTenant = useRbacStore((s) => s.activeTenant);
  const setActiveTenant = useRbacStore((s) => s.setActiveTenant);

  const [q, setQ] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [modeFilter, setModeFilter] = React.useState<string>("all");
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [actionResult, setActionResult] = React.useState<{ ok: boolean; message: string } | null>(null);

  // Search begins in the front end: trigger the API after 3 characters in the search bar (or on empty)
  React.useEffect(() => {
    const trimmed = q.trim();
    if (trimmed.length === 0) {
      setSearchQuery("");
      return;
    }
    if (trimmed.length >= 3) {
      const timer = setTimeout(() => {
        setSearchQuery(trimmed);
      }, 200);
      return () => clearTimeout(timer);
    }
    // Under 3 characters (1-2 chars): do not call API with query; reset to full fleet
    setSearchQuery("");
  }, [q]);

  // Server-side filtered query
  const tenantsQuery = useTenantsQuery({
    q: searchQuery,
    status: statusFilter,
    mode: modeFilter,
  });

  const filteredTenants = React.useMemo<TenantInfo[]>(
    () => tenantsQuery.data ?? [],
    [tenantsQuery.data]
  );

  const BATCH_SIZE = 6;
  const [displayedCount, setDisplayedCount] = React.useState<number>(BATCH_SIZE);
  const [loadingMore, setLoadingMore] = React.useState<boolean>(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const sentinelRef = React.useRef<HTMLTableRowElement | null>(null);

  // Reset infinite scroll pagination when server query or filters change
  React.useEffect(() => {
    setDisplayedCount(BATCH_SIZE);
  }, [searchQuery, statusFilter, modeFilter]);

  const visibleTenants = React.useMemo(() => {
    return filteredTenants.slice(0, displayedCount);
  }, [filteredTenants, displayedCount]);

  const hasMore = displayedCount < filteredTenants.length;

  const loadNextBatch = React.useCallback(() => {
    if (!hasMore || loadingMore || tenantsQuery.isLoading) return;
    setLoadingMore(true);
    setTimeout(() => {
      setDisplayedCount((prev) => Math.min(prev + BATCH_SIZE, filteredTenants.length));
      setLoadingMore(false);
    }, 350);
  }, [hasMore, loadingMore, tenantsQuery.isLoading, filteredTenants.length]);

  const handleScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      if (!target) return;
      const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
      if (distanceToBottom <= 80 && hasMore && !loadingMore && !tenantsQuery.isLoading) {
        loadNextBatch();
      }
    },
    [hasMore, loadingMore, tenantsQuery.isLoading, loadNextBatch]
  );

  const handleWheel = React.useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (e.deltaY > 0 && hasMore && !loadingMore && !tenantsQuery.isLoading) {
        const target = e.currentTarget;
        if (!target) return;
        const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
        if (distanceToBottom <= 120 || target.scrollHeight <= target.clientHeight) {
          loadNextBatch();
        }
      }
    },
    [hasMore, loadingMore, tenantsQuery.isLoading, loadNextBatch]
  );

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first && first.isIntersecting && hasMore && !loadingMore && !tenantsQuery.isLoading) {
          loadNextBatch();
        }
      },
      {
        root: containerRef.current,
        rootMargin: "80px",
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, tenantsQuery.isLoading, loadNextBatch]);

  async function handleUpdateTenant(tenant: TenantInfo, patch: UpdateTenantPayload, actionLabel: string) {
    setUpdatingId(tenant.id);
    setActionResult(null);
    try {
      const res = await updateTenant(tenant.id, patch);
      if (activeTenant?.id === tenant.id && res.tenant) {
        setActiveTenant(res.tenant);
      }
      await tenantsQuery.refetch();
      setActionResult({
        ok: true,
        message: `Successfully updated ${tenant.name}: ${actionLabel}.`,
      });
    } catch (err: any) {
      setActionResult({
        ok: false,
        message: err?.message || `Failed to update tenant ${tenant.name}.`,
      });
    } finally {
      setUpdatingId(null);
    }
  }

  function handleWorkspaceSwitch(tenant: TenantInfo) {
    switchActiveTenant(tenant);
    setActiveTenant(tenant);
    setActionResult({
      ok: true,
      message: `Switched active workspace to Barangay ${tenant.name.replace(/^Barangay\s+/i, "")} (${tenant.subdomain}.cbms.gov.ph).`,
    });
  }

  return (
    <>
      <PageHead
        title="Barangays"
        subtitle="Multi-tenant barangay environments, database isolation modes, and operational status."
        breadcrumb="Super Admin / Barangays"
      />

      <ActionResult
        error={actionResult && !actionResult.ok ? actionResult.message : undefined}
        success={actionResult && actionResult.ok ? actionResult.message : undefined}
      />

      <Panel title="Registered Barangays" padded={false}>
        <Toolbar>
          <input
            className="cbms-input cbms-input--search"
            type="search"
            placeholder="Search by Barangay name, subdomain, code, or PSGC…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const trimmed = q.trim();
                if (trimmed.length >= 3 || trimmed.length === 0) {
                  setSearchQuery(trimmed);
                }
              }
            }}
            style={{ maxWidth: 360 }}
          />

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--cbms-muted)", textTransform: "uppercase" }}>
              Status:
            </span>
            {[
              { id: "all", label: "All" },
              { id: "active", label: "Active" },
              { id: "suspended", label: "Suspended" },
            ].map((sf) => (
              <button
                key={sf.id}
                type="button"
                onClick={() => setStatusFilter(sf.id)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 9999,
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  border: statusFilter === sf.id ? "1px solid #2563eb" : "1px solid #cbd5e1",
                  backgroundColor: statusFilter === sf.id ? "#eff6ff" : "#ffffff",
                  color: statusFilter === sf.id ? "#1d4ed8" : "#475569",
                  cursor: "pointer",
                }}
              >
                {sf.label}
              </button>
            ))}

            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--cbms-muted)", textTransform: "uppercase", marginLeft: 8 }}>
              DB Mode:
            </span>
            {[
              { id: "all", label: "All Modes" },
              { id: "shared_db", label: "Shared RDBMS" },
              { id: "isolated_schema", label: "Schema-Isolated" },
              { id: "dedicated_db", label: "Dedicated DB" },
            ].map((mf) => (
              <button
                key={mf.id}
                type="button"
                onClick={() => setModeFilter(mf.id)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 9999,
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  border: modeFilter === mf.id ? "1px solid #16a34a" : "1px solid #cbd5e1",
                  backgroundColor: modeFilter === mf.id ? "#f0fdf4" : "#ffffff",
                  color: modeFilter === mf.id ? "#15803d" : "#475569",
                  cursor: "pointer",
                }}
              >
                {mf.label}
              </button>
            ))}
          </div>

          <div className="cbms-toolbar__spacer" />
          <span style={{ fontSize: 12.5, color: "var(--cbms-muted)", marginRight: 8 }}>
            Showing {num(visibleTenants.length)} of {num(filteredTenants.length)} barangays {hasMore ? "· Scroll to load more" : "· All loaded"}
          </span>
          <Link
            href="/super-admin/onboard"
            className="cbms-btn cbms-btn--primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.82rem",
              fontWeight: 700,
              padding: "0.4rem 0.9rem",
              whiteSpace: "nowrap",
            }}
          >
            <span>🚀</span>
            <span>Onboard Barangay</span>
          </Link>
        </Toolbar>

        {tenantsQuery.error && (
          <div style={{ padding: "12px 18px 0" }}>
            <Alert tone="danger">{(tenantsQuery.error as Error).message}</Alert>
          </div>
        )}

        <DataTable<TenantInfo>
            columns={[
              {
                key: "tenant",
                header: "Barangay Tenant & Subdomain",
                width: 250,
                render: (t: TenantInfo) => {
                  const isCurrent = activeTenant?.id === t.id;
                  return (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Link
                          href={`/super-admin/${t.id}`}
                          className="cbms-table__primary"
                          style={{
                            fontWeight: 700,
                            color: "#0a2463",
                            textDecoration: "underline",
                            textUnderlineOffset: 3,
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {t.name}
                        </Link>
                        {isCurrent && <Chip tone="green">Current Workspace</Chip>}
                      </div>
                      <div className="cbms-table__muted" style={{ marginTop: 2 }}>
                        <code style={{ color: "#2563eb", fontWeight: 600 }}>
                          {t.subdomain}.cbms.gov.ph
                        </code>
                        {t.code ? ` · ${t.code}` : ""}
                      </div>
                    </div>
                  );
                },
              },
              {
                key: "psgc",
                header: "PSGC / Geo Code",
                width: 150,
                render: (t: TenantInfo) => (
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                      {t.psgcCode || "137402001"}
                    </div>
                    <div className="cbms-table__muted">
                      {t.cityId ? `City ID: ${t.cityId}` : "Marikina City"}
                    </div>
                  </div>
                ),
              },
              {
                key: "mode",
                header: "Database Isolation Mode",
                width: 200,
                render: (t: TenantInfo) => {
                  const isBusy = updatingId === t.id;
                  const currentMode = t.mode || "shared_db";
                  return (
                    <div onClick={(e) => e.stopPropagation()}>
                      <select
                        className="cbms-select"
                        disabled={isBusy}
                        value={currentMode}
                        onChange={(e) => {
                          const nextMode = e.target.value as "shared_db" | "isolated_schema" | "dedicated_db";
                          handleUpdateTenant(
                            t,
                            { mode: nextMode },
                            `changed database mode to ${ISOLATION_MODE_LABELS[nextMode]?.label || nextMode}`
                          );
                        }}
                        style={{ fontSize: "0.78rem", padding: "4px 8px" }}
                      >
                        <option value="shared_db">Shared RDBMS (RLS Row Filter)</option>
                        <option value="isolated_schema">Isolated Schema (brgy_* namespace)</option>
                        <option value="dedicated_db">Dedicated DB Instance</option>
                      </select>
                      <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>
                        {ISOLATION_MODE_LABELS[currentMode]?.desc}
                      </div>
                    </div>
                  );
                },
              },
              {
                key: "status",
                header: "Operational State",
                width: 130,
                render: (t: TenantInfo) => {
                  const isBusy = updatingId === t.id;
                  const isActive = t.status === "active";
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }} onClick={(e) => e.stopPropagation()}>
                      <StatusChip status={t.status || "active"} />
                      <Button
                        size="sm"
                        variant={isActive ? "secondary" : "primary"}
                        disabled={isBusy}
                        onClick={() => {
                          const nextStatus = isActive ? "suspended" : "active";
                          handleUpdateTenant(
                            t,
                            { status: nextStatus },
                            nextStatus === "active" ? "reactivated operational fleet" : "suspended tenant operations"
                          );
                        }}
                        style={{ fontSize: "0.72rem", padding: "2px 6px" }}
                      >
                        {isBusy ? "Updating…" : isActive ? "Pause Fleet" : "Activate"}
                      </Button>
                    </div>
                  );
                },
              },
              {
                key: "actions",
                header: "Workspace Actions",
                align: "right",
                width: 220,
                render: (t: TenantInfo) => {
                  const isCurrent = activeTenant?.id === t.id;
                  return (
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                      <Link
                        href={`/super-admin/${t.id}`}
                        className="cbms-btn cbms-btn--sm"
                        style={{ fontSize: "0.76rem", padding: "4px 8px" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        View →
                      </Link>
                      {!isCurrent && (
                        <Button
                          size="sm"
                          variant="primary"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWorkspaceSwitch(t);
                          }}
                          style={{ fontSize: "0.76rem", padding: "4px 10px" }}
                        >
                          Switch
                        </Button>
                      )}
                      <a
                        className="cbms-btn cbms-btn--sm"
                        href={`http://localhost:3000/?psgc=${t.psgcCode || "137402001"}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Open resident public portal"
                        style={{ fontSize: "0.76rem", padding: "4px 8px" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Public ↗
                      </a>
                    </div>
                  );
                },
              },
            ]}
            rows={visibleTenants}
            empty="No matching barangay tenants found."
            stickyHeader
            maxHeight="380px"
            loading={tenantsQuery.isLoading}
            skeletonRows={6}
            loadingMore={loadingMore}
            onScroll={handleScroll}
            onWheel={handleWheel}
            onRowClick={(t) => router.push(`/super-admin/${t.id}`)}
            containerRef={containerRef}
            sentinelRef={sentinelRef}
          />
      </Panel>
    </>
  );
}
