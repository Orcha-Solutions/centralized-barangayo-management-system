"use client";

import * as React from "react";
import { Alert, PageHead, StatCard, StatGrid, num } from "@cbms/ui";
import { useConsole } from "../../../components/Shell";
import { Toast } from "../../../components/Toast";
import {
  useInfiniteKpCasesQuery,
  useKpDeadlinesQuery,
  useCreateKpCaseMutation,
  useDeleteKpCaseMutation,
} from "../../../lib/kp-queries";
import { KpToolbar } from "./components/KpToolbar";
import { KpTable } from "./components/KpTable";
import { KpDrawer, type KpDrawerFormData } from "./components/KpDrawer";
import { DeleteKpModal } from "./components/DeleteKpModal";
import { KpTourGuide } from "./KpTourGuide";
import type { KpCase } from "../../../lib/types";

export default function KpPage() {
  const { can, reloadDashboard } = useConsole();

  // Auth / RBAC Permissions
  const mayEncode = can("kp:encode") || can("kp:write") || can("kp:manage");
  const mayManage = can("kp:manage") || can("kp:write");
  const mayVawc = can("vawc:encode") || can("vawc:view");

  // Filtering & Sorting State
  const [search, setSearch] = React.useState("");
  const [stage, setStage] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("filedAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  // Drawer & Modal States
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [deletingCase, setDeletingCase] = React.useState<KpCase | null>(null);
  const [transactingId, setTransactingId] = React.useState<string | null>(null);

  // Toast State
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

  // Tour Guide State
  const [tourEnabled, setTourEnabled] = React.useState(false);
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("cbms.kp_guide_enabled");
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
      localStorage.setItem("cbms.kp_guide_enabled", String(val));
    } catch {}
  };

  // TanStack React Query Infinite Scrolling (minimum 20 records per batch, 3-character search threshold)
  const pageSize = 20;
  const {
    data: infiniteData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error: queryError,
  } = useInfiniteKpCasesQuery({
    pageSize,
    search,
    stage,
    sortBy,
    sortOrder,
  });

  // Statutory Deadlines Query
  const deadlinesQuery = useKpDeadlinesQuery();

  // Mutations
  const createMutation = useCreateKpCaseMutation();
  const deleteMutation = useDeleteKpCaseMutation();

  // Flatten and deduplicate loaded pages
  const cases = React.useMemo(() => {
    if (!infiniteData?.pages) return [];
    const list: KpCase[] = [];
    const seen = new Set<string>();
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

  const totalCases = infiniteData?.pages?.[0]?.total ?? cases.length;
  const openCount = cases.filter((c) => ["filed", "mediation", "conciliation"].includes(c.stage)).length;
  const breachedCount = deadlinesQuery.data?.breached ?? 0;
  const warningCount = deadlinesQuery.data?.nearWarning ?? 0;

  // Header Sort Handler
  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(columnKey);
      setSortOrder("desc");
    }
  };

  // File New Case Handler
  const handleDrawerSubmit = async (formData: KpDrawerFormData) => {
    const created = await createMutation.mutateAsync({
      subject: formData.subject,
      description: formData.description,
      respondentName: formData.respondentName,
      complainantName: formData.complainantName,
      isConfidential: formData.isConfidential,
    });

    showToast(
      "KP Case Filed",
      `Case ${created.caseNo} filed successfully. Statutory 15-day mediation clock started today.`,
      "success"
    );
    setOpenDrawer(false);
    reloadDashboard();
  };

  // Delete Case Confirmation Handler
  const handleDeleteConfirm = async () => {
    if (!deletingCase) return;
    setTransactingId(deletingCase.id);
    try {
      await deleteMutation.mutateAsync(deletingCase.id);
      showToast(
        "Case Deleted",
        `Case docket ${deletingCase.caseNo} has been permanently deleted.`,
        "success"
      );
      setDeletingCase(null);
      reloadDashboard();
    } catch (err: any) {
      showToast("Delete Failed", err?.message || "Failed to delete KP case.", "danger");
    } finally {
      setTransactingId(null);
    }
  };

  return (
    <>
      <PageHead
        title="Katarungang Pambarangay"
        subtitle="Case docket with the statutory clock of RA 7160 §410: 15 days mediation before the Punong Barangay, then 15 days conciliation by the Pangkat (extendable by 15)."
        breadcrumb="Justice & Safety"
        parity="KPISBH"
      />

      {queryError && (
        <div style={{ marginBottom: "1rem" }}>
          <Alert tone="danger">
            Failed to load KP cases: {(queryError as Error)?.message || "Network error"}
          </Alert>
        </div>
      )}

      {/* Statutory Clock Overview Stat Cards */}
      <div id="tour-kp-stats">
        <StatGrid>
          <StatCard label="Cases on this page" value={num(totalCases)} icon="⚖️" />
          <StatCard label="Open (clock running)" value={num(openCount)} icon="⏱️" tone="gold" />
          <StatCard
            label="Within 5 days of deadline"
            value={num(warningCount)}
            icon="⚠️"
            tone="gold"
          />
          <StatCard
            label="Breached"
            value={num(breachedCount)}
            icon="🚩"
            tone={breachedCount > 0 ? "red" : "green"}
            hint="Past statutory period"
          />
        </StatGrid>
      </div>


      {/* Toolbar: Server-Side Search, Stage Filter, and Actions dropdown (matching Inhabitants) */}
      <div>
        <KpToolbar
          search={search}
          onSearchChange={setSearch}
          stage={stage}
          onStageChange={setStage}
          totalCases={totalCases}
          canEncode={mayEncode}
          onOpenFileCase={() => setOpenDrawer(true)}
          tourEnabled={tourEnabled}
          onToggleTour={handleToggleTour}
        />
      </div>

      {/* Table: Sticky Headers, Skeleton Loading, Infinite Scroll, Server-Side Sorting */}
      <div id="tour-kp-table">
        <KpTable
          cases={cases}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          canManage={mayManage}
          onDelete={(c) => setDeletingCase(c)}
          transactingId={transactingId}
        />
      </div>

      {/* Slide-over Content Drawer for Filing New Cases */}
      <KpDrawer
        open={openDrawer}
        busy={createMutation.isPending}
        canVawc={mayVawc}
        onClose={() => setOpenDrawer(false)}
        onSubmit={handleDrawerSubmit}
      />

      {/* Safe Deletion Modal with Typed Confirmation */}
      <DeleteKpModal
        open={Boolean(deletingCase)}
        targetCase={deletingCase}
        busy={deleteMutation.isPending}
        onCancel={() => setDeletingCase(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Post-Transaction Toast Notification */}
      <Toast
        open={toast.open}
        message={toast.message}
        description={toast.description}
        tone={toast.tone}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />

      {/* Interactive Tour Guide Walkthrough */}
      <KpTourGuide
        enabled={tourEnabled}
        onToggle={handleToggleTour}
        onOpenNew={() => setOpenDrawer(true)}
        onCloseNew={() => setOpenDrawer(false)}
        isNewOpen={openDrawer}
      />
    </>
  );
}
