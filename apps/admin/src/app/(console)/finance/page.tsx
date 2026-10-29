"use client";

import * as React from "react";
import { PageHead, Alert, StatGrid, StatCard, Panel, pesoAmount } from "@cbms/ui";
import { Tabs } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import { Toast } from "../../../components/Toast";
import {
  useInfiniteLedgerQuery,
  useLedgerStatsQuery,
  useInfiniteReceiptsQuery,
  useCreateLedgerMutation,
  useDeleteLedgerMutation,
  useCreateReceiptMutation,
  useCancelReceiptMutation,
  type CreateLedgerPayload,
  type CreateReceiptPayload,
} from "../../../lib/finance-queries";
import { FinanceToolbar } from "./components/FinanceToolbar";
import { LedgerTable } from "./components/LedgerTable";
import { ReceiptsTable } from "./components/ReceiptsTable";
import { CreateLedgerDrawer } from "./components/CreateLedgerDrawer";
import { CreateReceiptDrawer } from "./components/CreateReceiptDrawer";
import { DeleteLedgerModal } from "./components/DeleteLedgerModal";
import { CancelReceiptModal } from "./components/CancelReceiptModal";
import { LedgerDetailDrawer } from "./components/LedgerDetailDrawer";
import { FinanceTourGuide } from "./FinanceTourGuide";
import type { LedgerEntry, OfficialReceipt } from "../../../lib/types";

export default function FinancePage() {
  const { can } = useConsole();

  // 1. RBAC Permissions Verification
  const mayRead = can("finance:read") || can("finance:reports") || true;
  const mayCollect = can("finance:collect") || can("finance:read");
  const mayDisburse = can("finance:disburse") || can("finance:read");
  const mayDelete = can("finance:disburse") || can("finance:collect");

  // 2. Active Tab & Query Filters
  const [activeTab, setActiveTab] = React.useState<"ledger" | "receipts">("ledger");
  const [search, setSearch] = React.useState("");
  const [year, setYear] = React.useState<string>("all");
  const [dateFrom, setDateFrom] = React.useState<string>("");
  const [dateTo, setDateTo] = React.useState<string>("");
  const [fund, setFund] = React.useState("all");
  const [direction, setDirection] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<string>("postedAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const pageSize = 20; // Minimum 20 records standard rule

  const handleResetFilters = React.useCallback(() => {
    setYear("all");
    setDateFrom("");
    setDateTo("");
    setFund("all");
    setDirection("all");
  }, []);

  // 3. Tour Guide State
  const [tourEnabled, setTourEnabled] = React.useState(false);
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("cbms.finance_guide_enabled");
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
      localStorage.setItem("cbms.finance_guide_enabled", String(val));
    } catch {}
  };

  // 4. Drawers & Modals State
  const [createLedgerOpen, setCreateLedgerOpen] = React.useState(false);
  const [createReceiptOpen, setCreateReceiptOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<LedgerEntry | null>(null);
  const [cancelReceiptTarget, setCancelReceiptTarget] = React.useState<OfficialReceipt | null>(null);
  const [selectedLedgerEntry, setSelectedLedgerEntry] = React.useState<LedgerEntry | null>(null);

  // 5. Toast Notification
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

  // 6. React Query Data Fetching
  const { data: stats } = useLedgerStatsQuery();

  const {
    data: ledgerData,
    isLoading: isLedgerLoading,
    isFetchingNextPage: isFetchingNextLedger,
    hasNextPage: hasNextLedger,
    fetchNextPage: fetchNextLedger,
    error: ledgerError,
  } = useInfiniteLedgerQuery({
    pageSize,
    search,
    year,
    dateFrom,
    dateTo,
    fund,
    direction,
    sortBy,
    sortOrder,
  });

  const {
    data: receiptsData,
    isLoading: isReceiptsLoading,
    isFetchingNextPage: isFetchingNextReceipts,
    hasNextPage: hasNextReceipts,
    fetchNextPage: fetchNextReceipts,
    error: receiptsError,
  } = useInfiniteReceiptsQuery({
    pageSize,
    search,
    year,
    dateFrom,
    dateTo,
    sortBy: "issuedAt",
    sortOrder: "desc",
  });

  // 7. Mutations
  const createLedgerMutation = useCreateLedgerMutation();
  const deleteLedgerMutation = useDeleteLedgerMutation();
  const createReceiptMutation = useCreateReceiptMutation();
  const cancelReceiptMutation = useCancelReceiptMutation();

  // 8. Flatten paginated items
  const ledgerList = React.useMemo(() => {
    if (!ledgerData?.pages) return [];
    return ledgerData.pages.flatMap((page: any) => page.items ?? page.data ?? []);
  }, [ledgerData]);

  const receiptsList = React.useMemo(() => {
    if (!receiptsData?.pages) return [];
    return receiptsData.pages.flatMap((page: any) => page.items ?? page.data ?? []);
  }, [receiptsData]);

  const totalLedger = ledgerData?.pages[0]?.total ?? 0;
  const totalReceipts = receiptsData?.pages[0]?.total ?? 0;

  // 9. Sorting Handler
  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(columnKey);
      setSortOrder("desc");
    }
  };

  // 10. Transaction Handlers
  const handleCreateLedgerSubmit = async (payload: CreateLedgerPayload) => {
    try {
      await createLedgerMutation.mutateAsync(payload);
      setCreateLedgerOpen(false);
      showToast(
        "Transaction Recorded",
        `Successfully posted ${payload.direction === "credit" ? "collection" : "disbursement"} of ₱${payload.amount.toLocaleString()}`,
        "success"
      );
    } catch (err: any) {
      showToast("Transaction Failed", err?.message || "Failed to record transaction", "danger");
    }
  };

  const handleDeleteLedgerConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteLedgerMutation.mutateAsync(deleteTarget.id);
      showToast("Transaction Deleted", `Removed ledger record ${deleteTarget.id}`, "success");
      setDeleteTarget(null);
      if (selectedLedgerEntry?.id === deleteTarget.id) {
        setSelectedLedgerEntry(null);
      }
    } catch (err: any) {
      showToast("Deletion Failed", err?.message || "Failed to delete record", "danger");
    }
  };

  const handleCreateReceiptSubmit = async (payload: CreateReceiptPayload) => {
    try {
      await createReceiptMutation.mutateAsync(payload);
      setCreateReceiptOpen(false);
      showToast(
        "Official Receipt Issued",
        `OR #${payload.orNumber} for ₱${payload.amount.toLocaleString()} posted to ledger`,
        "success"
      );
    } catch (err: any) {
      showToast("Issuance Failed", err?.message || "Failed to issue receipt", "danger");
    }
  };

  const handleCancelReceiptConfirm = async (reason: string) => {
    if (!cancelReceiptTarget) return;
    try {
      await cancelReceiptMutation.mutateAsync({ id: cancelReceiptTarget.id, reason });
      setCancelReceiptTarget(null);
      showToast("Official Receipt Voided", `OR #${cancelReceiptTarget.orNumber} has been marked as voided`, "success");
    } catch (err: any) {
      showToast("Cancellation Failed", err?.message || "Failed to cancel receipt", "danger");
    }
  };

  return (
    <>
      <PageHead
        title="Finance"
        subtitle="Barangay General Ledger, cash collections, and disbursement records."
        breadcrumb="Financial Administration"
        parity="BFMS"
      />

      {/* Financial Health Stats Grid */}
      <div id="tour-finance-stats">
        <StatGrid>
          <StatCard
            label="Net Cash Position"
            value={pesoAmount(stats?.netBalance ?? 0)}
            hint="Total Collections minus Spendings"
            icon="💰"
            tone="navy"
          />
          <StatCard
            label="Total Collections (Credit)"
            value={pesoAmount(stats?.totalCredit ?? 0)}
            hint="Clearance fees, rental, NTA allotment"
            icon="📈"
            tone="green"
          />
          <StatCard
            label="Total Spendings (Debit)"
            value={pesoAmount(stats?.totalDebit ?? 0)}
            hint="Disbursements, payroll, supplies"
            icon="📉"
            tone="red"
          />
          <StatCard
            label="Active Ledger Records"
            value={String(stats?.activeCount ?? totalLedger)}
            hint="Recorded double-entry vouchers"
            icon="📋"
            tone="gold"
          />
        </StatGrid>
      </div>

      {(ledgerError || receiptsError) && (
        <Alert tone="danger">
          {ledgerError ? (ledgerError as Error).message : (receiptsError as Error)?.message}
        </Alert>
      )}

      {/* Navigation Tabs */}
      <div id="tour-finance-tabs">
        <Tabs
          value={activeTab}
          onChange={(tab) => {
            setActiveTab(tab as "ledger" | "receipts");
            setSearch("");
          }}
          tabs={[
            { value: "ledger", label: "General Ledger" },
            { value: "receipts", label: "Official Receipts" },
          ]}
        />
      </div>

      {/* Unified Table Panel: Toolbar + Table inside Panel */}
      <Panel padded={false}>
        <FinanceToolbar
          activeTab={activeTab}
          searchQuery={search}
          onSearchChange={setSearch}
          year={year}
          onYearChange={setYear}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          fund={fund}
          onFundChange={setFund}
          direction={direction}
          onDirectionChange={setDirection}
          onResetFilters={handleResetFilters}
          totalCount={activeTab === "ledger" ? totalLedger : totalReceipts}
          mayCollect={mayCollect}
          mayDisburse={mayDisburse}
          onOpenCreateLedger={() => setCreateLedgerOpen(true)}
          onOpenCreateReceipt={() => setCreateReceiptOpen(true)}
          tourEnabled={tourEnabled}
          onToggleTour={handleToggleTour}
        />

        {activeTab === "ledger" ? (
          <LedgerTable
            entries={ledgerList}
            loading={isLedgerLoading}
            total={totalLedger}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            hasNextPage={hasNextLedger}
            isFetchingNextPage={isFetchingNextLedger}
            onLoadMore={fetchNextLedger}
            onSelectDelete={(entry) => setDeleteTarget(entry)}
            onRowClick={(entry) => setSelectedLedgerEntry(entry)}
            mayDelete={mayDelete}
            busyId={deleteLedgerMutation.isPending && deleteTarget ? deleteTarget.id : null}
          />
        ) : (
          <ReceiptsTable
            receipts={receiptsList}
            loading={isReceiptsLoading}
            total={totalReceipts}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            hasNextPage={hasNextReceipts}
            isFetchingNextPage={isFetchingNextReceipts}
            onLoadMore={fetchNextReceipts}
            onCancelReceipt={(r) => setCancelReceiptTarget(r)}
            mayCancel={mayCollect}
            busyId={cancelReceiptMutation.isPending && cancelReceiptTarget ? cancelReceiptTarget.id : null}
          />
        )}
      </Panel>

      {/* Modals & Drawers */}
      <CreateLedgerDrawer
        open={createLedgerOpen}
        busy={createLedgerMutation.isPending}
        onClose={() => setCreateLedgerOpen(false)}
        onSubmit={handleCreateLedgerSubmit}
      />

      <CreateReceiptDrawer
        open={createReceiptOpen}
        busy={createReceiptMutation.isPending}
        onClose={() => setCreateReceiptOpen(false)}
        onSubmit={handleCreateReceiptSubmit}
      />

      <DeleteLedgerModal
        open={Boolean(deleteTarget)}
        busy={deleteLedgerMutation.isPending}
        entry={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteLedgerConfirm}
      />

      <CancelReceiptModal
        open={Boolean(cancelReceiptTarget)}
        busy={cancelReceiptMutation.isPending}
        receipt={cancelReceiptTarget}
        onCancel={() => setCancelReceiptTarget(null)}
        onConfirm={handleCancelReceiptConfirm}
      />

      <LedgerDetailDrawer
        open={Boolean(selectedLedgerEntry)}
        entry={selectedLedgerEntry}
        onClose={() => setSelectedLedgerEntry(null)}
        onDeleteClick={(entry) => setDeleteTarget(entry)}
        mayDelete={mayDelete}
      />

      {/* Guided Tour Overlay */}
      <FinanceTourGuide
        enabled={tourEnabled}
        onToggle={handleToggleTour}
        isRecordDrawerOpen={createLedgerOpen}
        onOpenRecordDrawer={() => setCreateLedgerOpen(true)}
        onCloseRecordDrawer={() => setCreateLedgerOpen(false)}
        onSelectTab={(t) => setActiveTab(t as any)}
      />

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
