"use client";

import * as React from "react";
import { PageHead, Alert, StatGrid, StatCard, num } from "@cbms/ui";
import { useConsole } from "../../../components/Shell";
import { Toast } from "../../../components/Toast";
import {
  useInfiniteSosAlertsQuery,
  useSosStatsQuery,
  useCreateSosMutation,
  useUpdateSosMutation,
  useDeleteSosMutation,
  useSosRealtimeStream,
  type CreateSosPayload,
} from "../../../lib/sos-queries";
import { SosToolbar } from "./components/SosToolbar";
import { SosTable } from "./components/SosTable";
import { SosHistoryDrawer } from "./components/SosHistoryDrawer";
import { SosDrawer, type SosDrawerFormData } from "./components/SosDrawer";
import { DeleteSosModal } from "./components/DeleteSosModal";
import { SosRespondModal } from "./components/SosRespondModal";
import type { SosAlert } from "../../../lib/types";

export default function SosPage() {
  const { can } = useConsole();

  // Auth & RBAC Permission checks
  const mayRespond = can("sos:respond") || can("emergency:alert");
  const mayEncode = can("sos:create") || can("emergency:alert") || can("sos:respond");
  const mayDelete = can("sos:delete") || can("emergency:alert");

  // Query and Filtering State
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [kind, setKind] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<string>("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const pageSize = 20; // Rule: minimum of 20 records to display

  // Modals & Action States
  const [openCreate, setOpenCreate] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<SosAlert | null>(null);
  const [respondTarget, setRespondTarget] = React.useState<SosAlert | null>(null);
  const [respondActionStatus, setRespondActionStatus] = React.useState<string>("acknowledged");
  const [selectedAlertForHistory, setSelectedAlertForHistory] = React.useState<SosAlert | null>(null);

  // Toast Notification State
  const [toast, setToast] = React.useState<{
    open: boolean;
    message: string;
    description?: string;
    tone: "success" | "danger" | "info";
  }>({
    open: false,
    message: "",
    description: "",
    tone: "success",
  });

  const showToast = (message: string, description?: string, tone: "success" | "danger" | "info" = "success") => {
    setToast({ open: true, message, description, tone });
  };

  // Realtime SSE Live Connection (No extra third-party libraries needed)
  const { connected } = useSosRealtimeStream();

  // Stats Query
  const { data: stats } = useSosStatsQuery();

  // React Query Mutations
  const createMutation = useCreateSosMutation();
  const updateMutation = useUpdateSosMutation();
  const deleteMutation = useDeleteSosMutation();

  // Infinite Query: Server-side infinite scroll & lazy loading
  const {
    data: infiniteData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error: queryError,
  } = useInfiniteSosAlertsQuery({
    pageSize,
    search,
    status,
    kind,
    sortBy,
    sortOrder,
  });

  // Flatten & deduplicate alerts
  const alertsList = React.useMemo(() => {
    if (!infiniteData?.pages) return [];
    const seen = new Set<string>();
    const list: SosAlert[] = [];
    for (const page of infiniteData.pages) {
      const rows = page.data ?? page.items ?? [];
      for (const row of rows) {
        if (!row.id) {
          list.push(row);
        } else if (!seen.has(row.id)) {
          seen.add(row.id);
          list.push(row);
        }
      }
    }
    return list;
  }, [infiniteData]);

  const totalAlerts = Number(infiniteData?.pages?.[0]?.total ?? 0);

  // Sorting Handler
  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(columnKey);
      setSortOrder("desc");
    }
  };

  // Create SOS Alert
  const handleCreateSubmit = async (formData: SosDrawerFormData) => {
    try {
      const created = await createMutation.mutateAsync({
        inhabitantId: formData.inhabitantId || undefined,
        kind: formData.kind,
        latitude: formData.latitude,
        longitude: formData.longitude,
        note: formData.note,
        isTest: formData.isTest,
      });
      const alertId = created?.id ? String(created.id).slice(0, 8) : "NEW";
      const alertKind = (created?.kind || formData.kind || "general").toUpperCase();
      showToast(
        "Emergency Broadcast Sent",
        `Alert #${alertId} (${alertKind}) triggered successfully.`,
        "success"
      );
      setOpenCreate(false);
    } catch (err: any) {
      showToast("Broadcast Failed", err?.message || "Failed to trigger SOS alert.", "danger");
    }
  };

  // Open Respond Modal or Quick Ack
  const handleInitiateRespond = (alert: SosAlert, targetStatus: string) => {
    setRespondTarget(alert);
    setRespondActionStatus(targetStatus);
  };

  // Confirm Respond / Status Update
  const handleConfirmRespond = async (responseNote: string) => {
    if (!respondTarget) return;
    try {
      await updateMutation.mutateAsync({
        id: respondTarget.id,
        data: {
          status: respondActionStatus,
          ...(responseNote ? { responseNote } : {}),
        },
      });
      const alertId = respondTarget.id ? String(respondTarget.id).slice(0, 8) : "";
      showToast(
        "Incident Status Updated",
        `Alert #${alertId} marked as “${respondActionStatus.replace("_", " ")}”.`,
        "success"
      );

      // Keep drawer in sync if open for this alert
      if (selectedAlertForHistory?.id === respondTarget.id) {
        setSelectedAlertForHistory((prev) =>
          prev ? { ...prev, status: respondActionStatus, responseNote: responseNote || prev.responseNote } : null
        );
      }

      setRespondTarget(null);
    } catch (err: any) {
      showToast("Update Failed", err?.message || "Could not update the alert status.", "danger");
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      const alertId = deleteTarget.id ? String(deleteTarget.id).slice(0, 8) : "";
      showToast(
        "Alert Removed",
        `Emergency record #${alertId} has been deleted.`,
        "danger"
      );
      if (selectedAlertForHistory?.id === deleteTarget.id) {
        setSelectedAlertForHistory(null);
      }
      setDeleteTarget(null);
    } catch (err: any) {
      showToast("Delete Failed", err?.message || "Could not delete emergency alert.", "danger");
    }
  };

  const busyAlertId = updateMutation.isPending ? updateMutation.variables?.id ?? null : null;

  return (
    <>
      <PageHead
        title="Emergency SOS & Dispatch Console"
        subtitle="Real-time incident response command, BDRRMC telemetry, and active siren alerts."
        breadcrumb="Disaster & Safety"
        parity="BDRRMC"
      />

      {/* KPI Stats Grid */}
      <div style={{ marginBottom: "1rem" }}>
        <StatGrid>
          <StatCard
            label="Active Emergencies"
            value={num(stats?.active ?? 0)}
            hint="Requiring immediate response"
            tone={(stats?.active ?? 0) > 0 ? "red" : undefined}
          />
          <StatCard
            label="Dispatched Units"
            value={num(stats?.dispatched ?? 0)}
            hint="En route or on scene"
            tone={(stats?.dispatched ?? 0) > 0 ? "navy" : undefined}
          />
          <StatCard
            label="Resolved Cases"
            value={num(stats?.resolved ?? 0)}
            hint="Closed incidents"
            tone={(stats?.resolved ?? 0) > 0 ? "green" : undefined}
          />
          <StatCard
            label="Median Response Time"
            value={stats?.medianResponseMinutes ? `${stats.medianResponseMinutes.toFixed(1)}m` : "—"}
            hint="From beacon to dispatch"
          />
        </StatGrid>
      </div>

      {queryError && (
        <div style={{ marginBottom: "1rem" }}>
          <Alert tone="danger">
            Failed to load emergency alerts: {(queryError as Error)?.message || "Network error"}
          </Alert>
        </div>
      )}

      {/* Search and Filters Toolbar */}
      <SosToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        kind={kind}
        onKindChange={setKind}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(col, ord) => {
          setSortBy(col);
          setSortOrder(ord);
        }}
        total={totalAlerts}
        mayEncode={mayEncode}
        onOpenCreate={() => setOpenCreate(true)}
        connected={connected}
      />

      {/* Infinite Scroll Table with Skeleton Loading and Sticky Header */}
      <SosTable
        alerts={alertsList}
        loading={isLoading}
        total={totalAlerts}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
        onSelectDelete={(alert) => setDeleteTarget(alert)}
        onRespond={handleInitiateRespond}
        onRowClick={(alert) => setSelectedAlertForHistory(alert)}
        busyId={busyAlertId}
        mayRespond={mayRespond}
        mayDelete={mayDelete}
      />

      {/* Slide-over Right Content Drawer: Dispatch History & Incident Dossier */}
      <SosHistoryDrawer
        open={!!selectedAlertForHistory}
        alert={selectedAlertForHistory}
        onClose={() => setSelectedAlertForHistory(null)}
        onRespond={handleInitiateRespond}
        mayRespond={mayRespond}
        busy={updateMutation.isPending}
      />

      {/* Trigger SOS Drawer */}
      <SosDrawer
        open={openCreate}
        busy={createMutation.isPending}
        onClose={() => setOpenCreate(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* Respond / Dispatch Modal */}
      <SosRespondModal
        open={!!respondTarget}
        busy={updateMutation.isPending}
        alert={respondTarget}
        targetStatus={respondActionStatus}
        onCancel={() => setRespondTarget(null)}
        onSubmit={handleConfirmRespond}
      />

      {/* Delete Confirmation Modal (typed confirmation input) */}
      <DeleteSosModal
        open={!!deleteTarget}
        busy={deleteMutation.isPending}
        alert={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Toast Notification */}
      <Toast
        open={toast.open}
        message={toast.message}
        description={toast.description}
        tone={toast.tone}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
      />
    </>
  );
}
