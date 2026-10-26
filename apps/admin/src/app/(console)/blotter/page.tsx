"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHead, Alert } from "@cbms/ui";
import { useConsole } from "../../../components/Shell";
import { Toast } from "../../../components/Toast";
import {
  useInfiniteBlottersQuery,
  useCreateBlotterMutation,
  useUpdateBlotterMutation,
  useDeleteBlotterMutation,
  useBulkCreateBlottersMutation,
} from "../../../lib/blotter-queries";
import { BlotterToolbar } from "./components/BlotterToolbar";
import { BlotterTable } from "./components/BlotterTable";
import { BlotterDrawer, type BlotterDrawerFormData } from "./components/BlotterDrawer";
import { DeleteBlotterModal } from "./components/DeleteBlotterModal";
import { BulkAddBlotterDrawer } from "./components/BulkAddBlotterDrawer";
import { BlotterTourGuide } from "./BlotterTourGuide";
import type { BlotterEntry } from "../../../lib/types";

export default function BlotterPage() {
  const router = useRouter();
  const { can } = useConsole();

  // RBAC Permission checks
  const mayEncode = can("blotter:create") || can("blotter:write") || can("kp:encode") || can("vawc:encode");
  const mayVawc = can("vawc:encode") || can("vawc:view");

  // Query and Filtering State
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<string>("incidentAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const pageSize = 20; // Rule: minimum of 20 records to display

  // Modal and Drawer States
  const [openCreate, setOpenCreate] = React.useState(false);
  const [editingEntry, setEditingEntry] = React.useState<BlotterEntry | null>(null);
  const [openBulkAdd, setOpenBulkAdd] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<BlotterEntry | null>(null);

  // Tour Guide State
  const [tourEnabled, setTourEnabled] = React.useState(false);
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("cbms.blotter_guide_enabled");
      if (stored === null) setTourEnabled(true);
      else setTourEnabled(stored === "true");
    } catch {
      setTourEnabled(true);
    }
  }, []);

  const handleToggleTour = (next?: boolean) => {
    const val = typeof next === "boolean" ? next : !tourEnabled;
    setTourEnabled(val);
    try {
      localStorage.setItem("cbms.blotter_guide_enabled", String(val));
    } catch {}
  };

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

  // React Query Mutations
  const createMutation = useCreateBlotterMutation();
  const updateMutation = useUpdateBlotterMutation();
  const deleteMutation = useDeleteBlotterMutation();
  const bulkCreateMutation = useBulkCreateBlottersMutation();

  // TanStack Infinite Query: Server-side infinite scroll & lazy loading
  const {
    data: infiniteData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error: queryError,
    refetch,
  } = useInfiniteBlottersQuery({
    pageSize,
    search,
    category,
    status,
    sortBy,
    sortOrder,
  });

  // Flatten and deduplicate all loaded pages of blotter incidents
  const blottersList = React.useMemo(() => {
    if (!infiniteData?.pages) return [];
    const seen = new Set<string>();
    const list: BlotterEntry[] = [];
    for (const page of infiniteData.pages) {
      for (const row of page.data ?? []) {
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

  const totalBlotters = infiniteData?.pages?.[0]?.total ?? 0;

  // Sorting Handler
  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(columnKey);
      setSortOrder("desc");
    }
  };

  // Create / Edit Handler
  const handleDrawerSubmit = async (formData: BlotterDrawerFormData) => {
    if (editingEntry) {
      await updateMutation.mutateAsync({
        id: editingEntry.id,
        data: {
          category: formData.category,
          incidentAt: new Date(formData.incidentAt).toISOString(),
          location: formData.location.trim(),
          narrative: formData.narrative.trim(),
          reportedBy: formData.reportedBy.trim(),
          complainantInhabitantId: formData.complainantInhabitantId || null,
          complainantPhone: formData.complainantPhone?.trim() || "",
          respondentName: formData.respondentName?.trim() || "",
          isConfidential: formData.isConfidential,
          status: formData.status,
        },
      });
      showToast("Blotter Updated", `Incident ${editingEntry.entryNo} updated successfully.`, "success");
    } else {
      const created = await createMutation.mutateAsync({
        category: formData.category,
        incidentAt: new Date(formData.incidentAt).toISOString(),
        location: formData.location.trim(),
        narrative: formData.narrative.trim(),
        reportedBy: formData.reportedBy.trim(),
        complainantInhabitantId: formData.complainantInhabitantId || null,
        complainantPhone: formData.complainantPhone?.trim() || "",
        respondentName: formData.respondentName?.trim() || "",
        isConfidential: formData.isConfidential,
        status: formData.status,
      });
      showToast(
        "Incident Logged",
        `Blotter entry ${created.entryNo} registered${created.isConfidential ? " (Restricted VAWC)" : ""}.`,
        "success"
      );
      setOpenCreate(false);
      setEditingEntry(null);
      if (created?.id) {
        router.push(`/blotter/${created.id}`);
      }
      return;
    }
    setOpenCreate(false);
    setEditingEntry(null);
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      showToast("Blotter Deleted", `Incident record ${deleteTarget.entryNo} has been removed.`, "danger");
      setDeleteTarget(null);
    } catch (err: any) {
      showToast("Delete Failed", err?.message || "Could not delete blotter entry.", "danger");
    }
  };

  // Bulk Ingest Handler
  const handleBulkSubmit = async (entries: Partial<BlotterEntry>[]) => {
    const res = await bulkCreateMutation.mutateAsync(entries);
    showToast("Batch Ingestion Complete", `Successfully registered ${res.count} incident blotter records.`, "success");
    setOpenBulkAdd(false);
  };

  return (
    <>
      {/* Tour Guide */}
      <BlotterTourGuide
        enabled={tourEnabled}
        onToggle={handleToggleTour}
        onOpenNew={() => setOpenCreate(true)}
      />

      <div id="tour-blotter-head">
        <PageHead
          title="Official Barangay Blotter"
          subtitle="Incident record book mirroring DILG KPISBH parity. VAWC/child protection entries are strictly confidential."
          breadcrumb="Justice & Safety"
          parity="KPISBH"
        />
      </div>

      {queryError && (
        <div style={{ marginBottom: "1rem" }}>
          <Alert tone="danger">
            Failed to load incident blotters: {(queryError as Error)?.message || "Network error"}
          </Alert>
        </div>
      )}

      {/* Search and Filters Toolbar */}
      <BlotterToolbar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        status={status}
        onStatusChange={setStatus}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(col, ord) => {
          setSortBy(col);
          setSortOrder(ord);
        }}
        total={totalBlotters}
        mayEncode={mayEncode}
        onOpenCreate={() => {
          setEditingEntry(null);
          setOpenCreate(true);
        }}
        onOpenBulkAdd={() => setOpenBulkAdd(true)}
        onToggleTour={handleToggleTour}
        tourEnabled={tourEnabled}
      />

      {/* Infinite Scroll Blotter Table with Sticky Headers & Skeleton Loading */}
      <div id="tour-blotter-table">
        <BlotterTable
          blotters={blottersList}
          loading={isLoading}
          total={totalBlotters}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={() => fetchNextPage()}
          mayEncode={mayEncode}
        />
      </div>

      {/* Create / Edit Drawer */}
      <BlotterDrawer
        open={openCreate}
        busy={createMutation.isPending || updateMutation.isPending}
        editingEntry={editingEntry}
        onClose={() => {
          setOpenCreate(false);
          setEditingEntry(null);
        }}
        onSubmit={handleDrawerSubmit}
        mayVawc={mayVawc}
      />

      {/* Bulk Add Drawer */}
      <BulkAddBlotterDrawer
        open={openBulkAdd}
        busy={bulkCreateMutation.isPending}
        onClose={() => setOpenBulkAdd(false)}
        onSubmit={handleBulkSubmit}
      />

      {/* Delete Confirmation Modal (typed confirmation input) */}
      <DeleteBlotterModal
        open={!!deleteTarget}
        busy={deleteMutation.isPending}
        entry={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Transaction Result Toast */}
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
