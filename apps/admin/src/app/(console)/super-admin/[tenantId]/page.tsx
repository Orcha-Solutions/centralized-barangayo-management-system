"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Alert, Button, PageHead, Panel } from "@cbms/ui";
import { switchActiveTenant } from "@cbms/api-client";
import { useSingleTenantQuery } from "../../../../lib/rbac-queries";
import { useRbacStore } from "../../../../lib/rbac-store";
import { parseTenantSettings } from "./types";
import { BarangayOverviewCard } from "./components/BarangayOverviewCard";
import { BarangayOperationsCard } from "./components/BarangayOperationsCard";
import { BarangayStaffRoster } from "./components/BarangayStaffRoster";
import { DeleteBarangayModal } from "./components/DeleteBarangayModal";

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const setActiveTenant = useRbacStore((s) => s.setActiveTenant);
  const activeTenant = useRbacStore((s) => s.activeTenant);

  const tenantId = typeof params?.tenantId === "string" ? params.tenantId : "";
  const { data: tenant, isLoading, error, refetch } = useSingleTenantQuery(tenantId);

  const [switchSuccess, setSwitchSuccess] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);

  function handleSwitchWorkspace() {
    if (!tenant) return;
    switchActiveTenant(tenant);
    setActiveTenant(tenant);
    setSwitchSuccess(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 800);
  }

  if (isLoading) {
    return (
      <div style={{ padding: "32px 0" }}>
        <PageHead
          title="Loading Barangay Workspace…"
          breadcrumb="Super Admin / Fleet / Details"
          actions={
            <Link href="/super-admin" className="cbms-btn cbms-btn--secondary">
              ← Back to Fleet
            </Link>
          }
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 18 }}>
          <div
            style={{
              height: 180,
              borderRadius: 12,
              background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
            }}
          />
          <div
            style={{
              height: 180,
              borderRadius: 12,
              background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
            }}
          />
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div style={{ padding: "32px 0" }}>
        <PageHead
          title="Barangay Not Found"
          breadcrumb="Super Admin / Fleet / Not Found"
          actions={
            <Link href="/super-admin" className="cbms-btn cbms-btn--secondary">
              ← Back to Fleet
            </Link>
          }
        />
        <Panel title="Workspace Lookup Error">
          <Alert tone="danger">
            Unable to locate tenant with identifier <code>{tenantId}</code>. It may have been
            deleted, or the database connection is currently undergoing synchronization.
          </Alert>
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <Button type="button" onClick={() => refetch()}>
              Retry Lookup
            </Button>
            <Link href="/super-admin" className="cbms-btn cbms-btn--secondary">
              Return to Fleet Table
            </Link>
          </div>
        </Panel>
      </div>
    );
  }

  const settings = parseTenantSettings(tenant.settings);
  const isCurrentActive = activeTenant?.id === tenant.id;

  return (
    <>
      <PageHead
        title={tenant.name}
        breadcrumb={`Super Admin / Fleet / ${tenant.name}`}
        actions={
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/super-admin" className="cbms-btn cbms-btn--secondary">
              ← Back to Fleet
            </Link>
            <Button
              type="button"
              variant={isCurrentActive ? "secondary" : "primary"}
              onClick={handleSwitchWorkspace}
              disabled={isCurrentActive}
            >
              {isCurrentActive ? "✓ Active Workspace" : "Switch to this Workspace"}
            </Button>
            <a
              href={`http://${tenant.subdomain}.localhost:4100`}
              target="_blank"
              rel="noreferrer"
              className="cbms-btn cbms-btn--secondary"
            >
              Public Portal ↗
            </a>
            <button
              type="button"
              className="cbms-btn"
              onClick={() => setDeleteModalOpen(true)}
              style={{
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                borderColor: "#fca5a5",
                fontWeight: 600,
              }}
            >
              🗑️ Delete Barangay
            </button>
          </div>
        }
      />

      {switchSuccess && (
        <div style={{ marginBottom: 16 }}>
          <Alert tone="success">
            Active workspace switched to <strong>{tenant.name}</strong>. Redirecting to console dashboard…
          </Alert>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <BarangayOverviewCard tenant={tenant} settings={settings} />
        <BarangayOperationsCard settings={settings} />
        <BarangayStaffRoster tenant={tenant} />
      </div>

      <DeleteBarangayModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        tenant={tenant}
        onSuccess={() => {
          setDeleteModalOpen(false);
          router.push("/super-admin");
        }}
      />
    </>
  );
}
