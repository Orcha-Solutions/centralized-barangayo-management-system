"use client";

import * as React from "react";
import { PageHead, Panel, StatGrid, StatCard, Alert, pesoAmount } from "@cbms/ui";
import { useConsole } from "../../../components/Shell";
import { Toast } from "../../../components/Toast";
import { BudgetFloorGauges, type StatutoryFundItem } from "./components/BudgetFloorGauges";
import { BudgetToolbar, type BudgetFilterValues } from "./components/BudgetToolbar";
import { BudgetTable, type ObligationItem } from "./components/BudgetTable";
import { CreateObligationDrawer, type CreateObligationPayload } from "./components/CreateObligationDrawer";
import { DeleteObligationModal } from "./components/DeleteObligationModal";
import { AddSectorModal } from "./components/AddSectorModal";
import { SectorDetailDrawer } from "./components/SectorDetailDrawer";
import { useBudgetOverview } from "../../../lib/budget-queries";
import { INITIAL_FUNDS, INITIAL_OBLIGATIONS } from "./data/seed-obligations";

export default function BudgetPage() {
  const { user, can } = useConsole();

  // 1. RBAC & Auth Verification
  const mayRead = can("finance:read") || can("finance:reports") || true;
  const mayObligate = can("finance:disburse") || can("finance:read");
  const mayDelete = can("finance:disburse") || can("finance:collect");

  // 2. State & Queries
  const [funds, setFunds] = React.useState<StatutoryFundItem[]>(INITIAL_FUNDS);
  const [obligations, setObligations] = React.useState<ObligationItem[]>(INITIAL_OBLIGATIONS);
  const [search, setSearch] = React.useState("");
  const [filters, setFilters] = React.useState<BudgetFilterValues>({
    year: "all",
    fund: "all",
    status: "all",
  });
  const [sortBy, setSortBy] = React.useState("date");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  // Lazy Loading & Pagination (Minimum 20 records per standard rule)
  const pageSize = 20;
  const [page, setPage] = React.useState(1);
  const [isFetchingNextPage, setIsFetchingNextPage] = React.useState(false);

  // Modals & Drawers
  const [openCreate, setOpenCreate] = React.useState(false);
  const [openAddSector, setOpenAddSector] = React.useState(false);
  const [selectedFund, setSelectedFund] = React.useState<StatutoryFundItem | null>(null);
  const [selectedDelete, setSelectedDelete] = React.useState<ObligationItem | null>(null);
  const [busyDelete, setBusyDelete] = React.useState(false);

  // Toast
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

  // 3. React Query: Backend Live Budget Overview
  const { data: overviewData } = useBudgetOverview(2026);

  React.useEffect(() => {
    if (overviewData?.budget) {
      const rawSectors = overviewData.budget.sectors || [];
      const mapped: StatutoryFundItem[] = rawSectors.map((s) => ({
        id: s.id || s.code.toLowerCase().replace(/[^a-z0-9]/g, "_"),
        code: s.code,
        name: s.name,
        statutoryRule: s.statutoryMinPct ? `Min. ${s.statutoryMinPct}% floor` : "Discretionary / Local Priority",
        minPct: s.statutoryMinPct || 0,
        appropriatedAmount: s.appropriatedCentavos / 100,
        obligatedAmount: s.obligatedCentavos / 100,
        balanceAmount: s.balanceCentavos / 100,
        utilizationPct: s.appropriatedCentavos > 0 ? Math.round((s.obligatedCentavos / s.appropriatedCentavos) * 100) : 0,
        complianceStatus: s.statutoryMinPct && ((s.appropriatedCentavos / (overviewData.budget.totalAmountCentavos || 1)) * 100 < s.statutoryMinPct) ? "warning" : "compliant",
        description: s.legalBasis || "Approved Sectoral Program",
        icon: s.icon || "🏛️",
        legalBasis: s.legalBasis || "Sangguniang Barangay Appropriations",
      }));
      setFunds(mapped);
    }
  }, [overviewData]);

  const totalAnnualBudget = overviewData?.budget?.totalAmountCentavos ? overviewData.budget.totalAmountCentavos / 100 : 18450000;
  const totalAppropriated = funds.reduce((acc, f) => acc + f.appropriatedAmount, 0);
  const totalObligated = funds.reduce((acc, f) => acc + f.obligatedAmount, 0);
  const totalBalance = funds.reduce((acc, f) => acc + f.balanceAmount, 0);
  const burnRate = totalAppropriated > 0 ? Math.round((totalObligated / totalAppropriated) * 100) : 0;

  // 4. Filtering and Sorting
  const filteredAndSorted = React.useMemo(() => {
    let list = obligations.filter((item) => {
      if (filters.fund !== "all" && item.fund !== filters.fund) return false;
      if (filters.status !== "all" && item.status !== filters.status) return false;
      if (search) {
        const q = search.toLowerCase();
        const matches =
          item.ppaCode.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.payee.toLowerCase().includes(q) ||
          item.particulars.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      let valA: any = a[sortBy as keyof ObligationItem] ?? "";
      let valB: any = b[sortBy as keyof ObligationItem] ?? "";
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [obligations, filters, search, sortBy, sortOrder]);

  // Lazy Loaded Visible Slice
  const visibleItems = React.useMemo(() => {
    return filteredAndSorted.slice(0, page * pageSize);
  }, [filteredAndSorted, page, pageSize]);

  const hasNextPage = visibleItems.length < filteredAndSorted.length;

  const handleLoadMore = React.useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    setIsFetchingNextPage(true);
    setTimeout(() => {
      setPage((prev) => prev + 1);
      setIsFetchingNextPage(false);
    }, 350);
  }, [hasNextPage, isFetchingNextPage]);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [search, filters, sortBy, sortOrder]);

  // 5. Actions Handlers
  const handleCreateSubmit = (payload: CreateObligationPayload) => {
    const newItem: ObligationItem = {
      id: "ob-" + (obligations.length + 1),
      ppaCode: payload.ppaCode,
      title: payload.title,
      fund: payload.fund,
      particulars: payload.particulars,
      payee: payload.payee,
      allotmentAmount: payload.amount,
      obligatedAmount: payload.amount,
      balanceAmount: 0,
      status: "obligated",
      date: new Date().toISOString().slice(0, 10),
    };

    setObligations([newItem, ...obligations]);

    setFunds((prev) =>
      prev.map((f) => {
        if (f.id === payload.fund) {
          const newObl = f.obligatedAmount + payload.amount;
          const newBal = f.appropriatedAmount - newObl;
          return {
            ...f,
            obligatedAmount: newObl,
            balanceAmount: newBal,
            utilizationPct: Math.round((newObl / f.appropriatedAmount) * 1000) / 10,
          };
        }
        return f;
      })
    );

    setOpenCreate(false);
    setToast({
      open: true,
      message: "Obligation Recorded",
      description: `Committed ${pesoAmount(payload.amount)} for ${payload.title}`,
      tone: "success",
    });
  };

  const handleConfirmDelete = () => {
    if (!selectedDelete) return;
    setBusyDelete(true);

    setTimeout(() => {
      const removed = selectedDelete;
      setObligations((prev) => prev.filter((o) => o.id !== removed.id));

      // Restore fund balance
      setFunds((prev) =>
        prev.map((f) => {
          if (f.id === removed.fund) {
            const newObl = Math.max(0, f.obligatedAmount - removed.obligatedAmount);
            const newBal = f.appropriatedAmount - newObl;
            return {
              ...f,
              obligatedAmount: newObl,
              balanceAmount: newBal,
              utilizationPct: Math.round((newObl / f.appropriatedAmount) * 1000) / 10,
            };
          }
          return f;
        })
      );

      setBusyDelete(false);
      setSelectedDelete(null);
      setToast({
        open: true,
        message: "Obligation Cancelled",
        description: `De-obligated ${pesoAmount(removed.obligatedAmount)} from ${removed.ppaCode}`,
        tone: "success",
      });
    }, 400);
  };

  const handleExportCsv = () => {
    const headers = ["PPA Code", "Title", "Fund", "Payee", "Allotment", "Obligated", "Balance", "Status", "Date"];
    const rows = filteredAndSorted.map((o) => [
      `"${o.ppaCode}"`,
      `"${o.title.replace(/"/g, '""')}"`,
      o.fund.toUpperCase(),
      `"${o.payee.replace(/"/g, '""')}"`,
      o.allotmentAmount,
      o.obligatedAmount,
      o.balanceAmount,
      o.status,
      o.date,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RAAO-Statutory-Budget-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({
      open: true,
      message: "RAAO Exported",
      description: "Downloaded statutory obligations roll as CSV",
      tone: "info",
    });
  };

  return (
    <>
      <PageHead
        title="Statutory Budget & Appropriations"
        subtitle="Registry of Appropriations and Obligations (RAAO) tracking mandatory statutory floor reserves and local development programs."
        breadcrumb="Financial Administration"
        parity="BFMS"
      />

      {/* RBAC notice if unauthenticated or view-only */}
      {!mayObligate && (
        <Alert tone="info">
          <strong>View-Only Access:</strong> You have read permissions for statutory budget monitoring. Encoding obligations requires Treasurer or Punong Barangay roles.
        </Alert>
      )}

      {/* Top 4 StatCards */}
      <StatGrid>
        <StatCard
          label="Approved Annual Budget"
          value={pesoAmount(totalAnnualBudget)}
          hint="SBO Ordinance FY 2026"
          icon="🏛️"
          tone="navy"
        />
        <StatCard
          label="Total Appropriations"
          value={pesoAmount(totalAppropriated)}
          hint={`${funds.length} reserve accounts`}
          icon="📊"
          tone="gold"
        />
        <StatCard
          label="Total Obligations Committed"
          value={pesoAmount(totalObligated)}
          hint={`${burnRate}% cumulative burn rate`}
          icon="💸"
          tone="green"
        />
        <StatCard
          label="Unobligated Reserve Balance"
          value={pesoAmount(totalBalance)}
          hint="Remaining appropriation ceiling"
          icon="⚖️"
          tone="navy"
        />
      </StatGrid>

      {/* Statutory & Discretionary Fund Floor Gauges */}
      <BudgetFloorGauges
        funds={funds}
        totalAnnualBudget={totalAnnualBudget}
        onSelectFund={(f) => setSelectedFund(f)}
      />

      {/* RAAO Table Panel */}
      <Panel padded={false}>
        <BudgetToolbar
          searchQuery={search}
          onSearchChange={setSearch}
          filters={filters}
          onFiltersChange={setFilters}
          onResetFilters={() => setFilters({ year: "all", fund: "all", status: "all" })}
          totalCount={filteredAndSorted.length}
          mayObligate={mayObligate}
          onOpenCreate={() => setOpenCreate(true)}
          onOpenAddSector={() => setOpenAddSector(true)}
          onExportCsv={handleExportCsv}
        />

        <BudgetTable
          items={visibleItems}
          total={filteredAndSorted.length}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={(key) => {
            if (sortBy === key) {
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            } else {
              setSortBy(key);
              setSortOrder("desc");
            }
          }}
          onRowClick={(item) => {
            const matchedFund = funds.find((f) => f.id === item.fund);
            if (matchedFund) setSelectedFund(matchedFund);
          }}
          onSelectDelete={(item) => setSelectedDelete(item)}
          mayDelete={mayDelete}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={handleLoadMore}
        />
      </Panel>

      {/* Drawers & Modals */}
      <CreateObligationDrawer
        open={openCreate}
        funds={funds}
        onClose={() => setOpenCreate(false)}
        onSubmit={handleCreateSubmit}
      />

      <AddSectorModal
        open={openAddSector}
        budgetId={overviewData?.budget?.id || "budget-2026"}
        onClose={() => setOpenAddSector(false)}
        onSuccess={(created: any) => {
          const appropAmount = created.appropriatedCentavos ? created.appropriatedCentavos / 100 : Number(created.appropriatedAmount || 0);
          const newFund: StatutoryFundItem = {
            id: created.id || created.code.toLowerCase().replace(/[^a-z0-9]/g, "_"),
            code: created.code,
            name: created.name,
            statutoryRule: created.category === "mandatory_statutory" ? "Mandatory Statutory Reserve" : "Discretionary / Local Priority",
            minPct: created.statutoryMinPct || 0,
            appropriatedAmount: appropAmount,
            obligatedAmount: 0,
            balanceAmount: appropAmount,
            utilizationPct: 0,
            complianceStatus: "compliant",
            description: created.legalBasis || "Approved Sectoral Program",
            icon: created.icon || "🏆",
            legalBasis: created.legalBasis || "Sangguniang Barangay Resolution",
          };

          setFunds((prev) => {
            const exists = prev.some((f) => f.code.toUpperCase() === newFund.code.toUpperCase());
            if (exists) {
              return prev.map((f) => (f.code.toUpperCase() === newFund.code.toUpperCase() ? newFund : f));
            }
            return [...prev, newFund];
          });

          setToast({
            open: true,
            message: "Sector Fund Enacted",
            description: `Successfully configured appropriation fund for ${created.name}.`,
            tone: "success",
          });
        }}
      />

      {selectedFund && (
        <SectorDetailDrawer
          open={Boolean(selectedFund)}
          fund={selectedFund}
          onClose={() => setSelectedFund(null)}
        />
      )}

      {selectedDelete && (
        <DeleteObligationModal
          open={Boolean(selectedDelete)}
          busy={busyDelete}
          item={selectedDelete}
          onCancel={() => setSelectedDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Toast Notification */}
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
