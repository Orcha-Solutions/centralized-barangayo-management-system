"use client";

import * as React from "react";
import { Alert, Button, Chip, KeyValue, Panel } from "@cbms/ui";
import type { TenantInfo } from "@cbms/api-client";
import { useUpdateTenantMutation } from "../../../../../lib/rbac-queries";
import type { BarangaySettings } from "../types";

interface BarangayOverviewCardProps {
  tenant: TenantInfo;
  settings: BarangaySettings;
}

export function BarangayOverviewCard({ tenant, settings }: BarangayOverviewCardProps) {
  const updateTenantMutation = useUpdateTenantMutation(tenant.id);
  const [feedback, setFeedback] = React.useState<{ ok: boolean; message: string } | null>(null);

  const isSuspended = tenant.status === "suspended";
  const isUpdating = updateTenantMutation.isPending;

  async function handleToggleStatus() {
    const nextStatus = isSuspended ? "active" : "suspended";
    const confirmMessage = isSuspended
      ? `Activate ${tenant.name}? Staff and citizens will be able to access the portal again.`
      : `Are you sure you want to suspend ${tenant.name}? Portal access and API services will be blocked for this tenant.`;

    if (!window.confirm(confirmMessage)) return;

    setFeedback(null);
    try {
      await updateTenantMutation.mutateAsync({ status: nextStatus });
      setFeedback({
        ok: true,
        message: `Tenant status successfully updated to ${nextStatus.toUpperCase()}.`,
      });
    } catch (err: any) {
      setFeedback({
        ok: false,
        message: err?.message || "Failed to update tenant status.",
      });
    }
  }

  const modeBadge =
    tenant.mode === "isolated_schema" ? (
      <Chip tone="blue">Isolated Schema</Chip>
    ) : tenant.mode === "dedicated_db" ? (
      <Chip tone="gold">Dedicated DB</Chip>
    ) : (
      <Chip tone="gray">Shared DB</Chip>
    );

  const statusBadge =
    tenant.status === "active" ? (
      <Chip tone="green">Active</Chip>
    ) : tenant.status === "suspended" ? (
      <Chip tone="red">Suspended</Chip>
    ) : (
      <Chip tone="gold">Provisioning</Chip>
    );

  return (
    <Panel
      title="🏛️ Infrastructure & Multi-Tenant Routing"
      actions={
        <Button
          type="button"
          variant={isSuspended ? "primary" : "secondary"}
          onClick={handleToggleStatus}
          disabled={isUpdating}
        >
          {isUpdating
            ? "Updating…"
            : isSuspended
            ? "✓ Activate Tenant"
            : "⚠️ Suspend Tenant"}
        </Button>
      }
    >
      {feedback && (
        <div style={{ marginBottom: 14 }}>
          <Alert tone={feedback.ok ? "success" : "danger"}>
            {feedback.message}
          </Alert>
        </div>
      )}

      <div className="cbms-grid-2" style={{ gap: 16 }}>
        <div>
          <KeyValue
            items={[
              ["Tenant Identifier", <code>{tenant.id}</code>],
              ["Barangay Code", <code>{tenant.code}</code>],
              ["Subdomain", <strong>{tenant.subdomain}.cbms.gov.ph</strong>],
              [
                "Custom Domain",
                tenant.customDomain ? (
                  <code>{tenant.customDomain}</code>
                ) : (
                  <span style={{ color: "#94a3b8" }}>None configured</span>
                ),
              ],
            ]}
          />
        </div>

        <div>
          <KeyValue
            items={[
              ["Operational Status", statusBadge],
              ["Database Isolation", modeBadge],
              ["PostgreSQL Schema", <code>{tenant.schemaName || "public"}</code>],
              ["PSGC Regional Code", <code>{tenant.psgcCode || "—"}</code>],
            ]}
          />
        </div>
      </div>

      {settings.pilot && (
        <div style={{ marginTop: 14 }}>
          <Alert tone="info">
            🚀 <strong>Pilot Program Participant</strong>: This barangay tenant is enrolled in the
            early access feature wave with real-time analytics and preview features enabled.
          </Alert>
        </div>
      )}
    </Panel>
  );
}
