"use client";

import * as React from "react";
import { Alert, PageHead, Panel } from "@cbms/ui";
import { useConsole } from "../../../components/Shell";
import { useHouseholdStore } from "../../../store/householdStore";
import { useInfiniteInhabitantsQuery } from "../../../lib/inhabitants-queries";
import { InhabitantsTourGuide } from "./InhabitantsTourGuide";
import { InhabitantsStats } from "./components/InhabitantsStats";
import { InhabitantsToolbar } from "./components/InhabitantsToolbar";
import { InhabitantsTable } from "./components/InhabitantsTable";
import { InhabitantRegisterDrawer } from "./components/InhabitantRegisterDrawer";
import { BulkAddInhabitantsDrawer } from "./components/BulkAddInhabitantsDrawer";

export default function InhabitantsPage() {
  const { can } = useConsole();
  const mayEncode = can("inhabitants:encode") || can("inhabitants:create");

  // Filter & Sorting States
  const [search, setSearch] = React.useState("");
  const [purok, setPurok] = React.useState("all");
  const [sector, setSector] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<string>("name");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");
  const pageSize = 20; // Minimum 20 records per batch

  const [openBulkAdd, setOpenBulkAdd] = React.useState(false);

  // TanStack Infinite Query: Server-side infinite scroll & lazy loading
  const {
    data: infiniteData,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error: queryError,
    refetch,
  } = useInfiniteInhabitantsQuery({
    pageSize,
    search,
    purok,
    sector,
    sortBy,
    sortOrder,
  });

  // Flatten and deduplicate all loaded pages of inhabitants
  const inhabitantsList = React.useMemo(() => {
    if (!infiniteData?.pages) return [];
    const seen = new Set<string>();
    const list: typeof infiniteData.pages[0]["data"] = [];
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

  const totalInhabitants = infiniteData?.pages?.[0]?.total ?? 0;

  // Household Store (for household selection and purok discovery)
  const { households, fetchHouseholds } = useHouseholdStore();

  React.useEffect(() => {
    fetchHouseholds();
  }, [fetchHouseholds]);

  // Derive distinct puroks list from households
  const puroksList = React.useMemo(() => {
    const set = new Set<string>();
    for (const h of households) {
      if (h.purok) set.add(h.purok);
    }
    return Array.from(set).sort();
  }, [households]);

  // Drawer & Guide State
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);
  const [tourEnabled, setTourEnabled] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("cbms.inhabitants_guide_enabled");
      if (stored === null) {
        setTourEnabled(true);
      } else {
        setTourEnabled(stored === "true");
      }
    } catch {
      setTourEnabled(true);
    }
  }, []);

  const handleToggleTour = (next: boolean) => {
    setTourEnabled(next);
    try {
      localStorage.setItem("cbms.inhabitants_guide_enabled", String(next));
    } catch {
      // ignore
    }
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
  };

  const handlePurokChange = (newPurok: string) => {
    setPurok(newPurok);
  };

  const handleSectorChange = (newSector: string) => {
    setSector(newSector);
  };

  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(columnKey);
      setSortOrder("asc");
    }
  };



  return (
    <>
      <PageHead
        title="Inhabitants"
        subtitle="Citizen master list, civil registration records, and sectoral classification."
        breadcrumb="Residents"
        parity="BIPS"
      />

      {queryError && (
        <Alert tone="danger">
          {(queryError as any)?.message || "Failed to load inhabitants from server."}
        </Alert>
      )}
      {exportError && <Alert tone="danger">{exportError}</Alert>}

      <InhabitantsStats totalCount={totalInhabitants} />

      <Panel padded={false}>
        <InhabitantsToolbar
          searchQuery={search}
          onSearchChange={handleSearchChange}
          purok={purok}
          onPurokChange={handlePurokChange}
          puroksList={puroksList}
          sector={sector}
          onSectorChange={handleSectorChange}
          totalCount={totalInhabitants}
          mayEncode={mayEncode}
          onOpenDrawer={() => setOpenDrawer(true)}
          onOpenBulkAdd={() => setOpenBulkAdd(true)}
          tourEnabled={tourEnabled}
          onToggleTour={handleToggleTour}
          onExportError={setExportError}
        />

        <InhabitantsTable
          inhabitants={inhabitantsList}
          loading={isLoading}
          total={totalInhabitants}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={fetchNextPage}
        />
      </Panel>

      <InhabitantRegisterDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        households={households}
        onSuccess={() => refetch()}
      />

      <BulkAddInhabitantsDrawer
        open={openBulkAdd}
        onClose={() => setOpenBulkAdd(false)}
        onSuccess={() => refetch()}
      />

      {/* Interactive Tour Guide (Triggered via Actions > Guide) */}
      <InhabitantsTourGuide
        enabled={tourEnabled}
        onToggle={handleToggleTour}
        onOpenDrawer={() => setOpenDrawer(true)}
        onCloseDrawer={() => setOpenDrawer(false)}
        isDrawerOpen={openDrawer}
      />
    </>
  );
}
