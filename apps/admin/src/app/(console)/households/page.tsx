"use client";

import * as React from "react";
import { Alert, PageHead, Panel } from "@cbms/ui";
import { useConsole } from "../../../components/Shell";
import { Toast } from "../../../components/Toast";
import {
  useInfiniteHouseholdsQuery,
  useDeleteHouseholdMutation,
} from "../../../lib/households-queries";
import { HouseholdsToolbar } from "./components/HouseholdsToolbar";
import { HouseholdsTable } from "./components/HouseholdsTable";
import { HouseholdDrawer } from "./components/HouseholdDrawer";
import { BulkAddHouseholdsDrawer } from "./components/BulkAddHouseholdsDrawer";
import { DeleteHouseholdModal } from "./components/DeleteHouseholdModal";
import type { Household } from "../../../lib/types";

export default function HouseholdsPage() {
  const { can } = useConsole();
  const mayEncode = can("inhabitants:encode") || can("inhabitants:create");

  // Query and Filtering State
  const [search, setSearch] = React.useState("");
  const [purok, setPurok] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<string>("householdNo");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");
  const pageSize = 20; // Rule: minimum of 20 records to display

  // Modal and Drawer States
  const [openCreate, setOpenCreate] = React.useState(false);
  const [openBulkAdd, setOpenBulkAdd] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Household | null>(null);

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

  // TanStack Infinite Query: Server-side infinite scroll & lazy loading
  const {
    data: infiniteData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error: queryError,
    refetch,
  } = useInfiniteHouseholdsQuery({
    pageSize,
    search,
    purok,
    sortBy,
    sortOrder,
  });

  // Flatten and deduplicate all loaded pages of households
  const householdsList = React.useMemo(() => {
    if (!infiniteData?.pages) return [];
    const seen = new Set<string>();
    const list: Household[] = [];
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

  const totalHouseholds = infiniteData?.pages?.[0]?.total ?? 0;

  // Derive distinct puroks list from loaded records
  const puroksList = React.useMemo(() => {
    const set = new Set<string>();
    for (const h of householdsList) {
      if (h.purok) set.add(h.purok);
    }
    const derived = Array.from(set).sort();
    return derived.length > 0 ? derived : ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"];
  }, [householdsList]);

  // Sorting Handler
  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(columnKey);
      setSortOrder("asc");
    }
  };

  // Delete Mutation
  const deleteMutation = useDeleteHouseholdMutation();

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      showToast(
        "Household Record Deleted",
        `Household ${deleteTarget.householdNo} was successfully removed from the registry.`,
        "success"
      );
      setDeleteTarget(null);
    } catch (err: any) {
      showToast("Deletion Failed", err?.message || "Failed to delete household.", "danger");
    }
  };

  return (
    <>
      <PageHead
        title="Households"
        subtitle="Domestic family registry, dwelling characteristics, and socio-economic classification."
        breadcrumb="Residents"
        parity="BIMS Form A1"
      />

      {queryError && (
        <Alert tone="danger">
          {(queryError as any)?.message || "Failed to load households from server."}
        </Alert>
      )}

      <Panel padded={false}>
        <HouseholdsToolbar
          searchQuery={search}
          onSearchChange={setSearch}
          purok={purok}
          onPurokChange={setPurok}
          puroksList={puroksList}
          totalCount={totalHouseholds}
          mayEncode={mayEncode}
          onOpenCreate={() => setOpenCreate(true)}
          onOpenBulkAdd={() => setOpenBulkAdd(true)}
        />

        <HouseholdsTable
          households={householdsList}
          loading={isLoading}
          total={totalHouseholds}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={fetchNextPage}
          onSelectDelete={(hh) => setDeleteTarget(hh)}
          mayEncode={mayEncode}
        />
      </Panel>

      <HouseholdDrawer
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        puroksList={puroksList}
        onSuccess={(created) => {
          showToast(
            "Household Created",
            `Household ${created.householdNo} was successfully registered.`,
            "success"
          );
          refetch();
        }}
      />

      <BulkAddHouseholdsDrawer
        open={openBulkAdd}
        onClose={() => setOpenBulkAdd(false)}
        puroksList={puroksList}
        onSuccess={(count) => {
          showToast(
            "Bulk Households Created",
            `Successfully registered ${count} household(s) in a single atomic batch.`,
            "success"
          );
          refetch();
        }}
      />

      <DeleteHouseholdModal
        open={Boolean(deleteTarget)}
        busy={deleteMutation.isPending}
        householdNo={deleteTarget?.householdNo ?? ""}
        householdName={deleteTarget?.householdName}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      <Toast
        open={toast.open}
        message={toast.message}
        description={toast.description}
        tone={toast.tone}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}
