"use client";

import * as React from "react";
import { PageHead, Alert, StatGrid, StatCard, Panel, pesoAmount } from "@cbms/ui";
import { useConsole } from "../../../components/Shell";
import { Toast } from "../../../components/Toast";
import { useRptStore } from "../../../store/useRptStore";
import {
  useInfiniteRptPropertiesQuery,
  useRptStatsQuery,
  useRptDuesQuery,
  useCreateRptPropertyMutation,
  useUpdateRptPropertyMutation,
  useDeleteRptPropertyMutation,
  usePayRptTaxMutation,
  type CreateRptPropertyPayload,
  type PayRptTaxPayload,
} from "../../../lib/rpt-queries";
import { RptToolbar } from "./components/RptToolbar";
import { RptTable } from "./components/RptTable";
import { DeclareRptDrawer } from "./components/DeclareRptDrawer";
import { DeleteRptModal } from "./components/DeleteRptModal";
import { RptDetailDrawer } from "./components/RptDetailDrawer";
import { RptTourGuide } from "./RptTourGuide";

export default function RptPage() {
  const { can } = useConsole();

  // 1. RBAC Permissions Verification
  const mayDeclare = can("finance:collect") || can("finance:read") || can("finance:view");
  const mayCollect = can("finance:collect") || can("finance:read") || can("finance:view");
  const mayEdit = can("finance:collect") || can("finance:disburse") || can("finance:read");
  const mayDelete = can("finance:disburse") || can("finance:collect");

  // 2. Zustand Store State
  const {
    search,
    year,
    dateFrom,
    dateTo,
    propertyType,
    paymentStatus,
    purok,
    sortBy,
    sortOrder,
    declareOpen,
    editingProperty,
    selectedProperty,
    deleteTarget,
    setSearch,
    setFilters,
    resetFilters,
    toggleSort,
    setDeclareOpen,
    setEditingProperty,
    setSelectedProperty,
    setDeleteTarget,
  } = useRptStore();

  const pageSize = 20; // Minimum 20 records standard rule

  // 3. Tour Guide State
  const [tourEnabled, setTourEnabled] = React.useState(false);
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("cbms.rpt_guide_enabled");
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
      localStorage.setItem("cbms.rpt_guide_enabled", String(val));
    } catch {}
  };

  // 4. Toast Notification State
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

  const showToast = (
    message: string,
    description?: string,
    tone: "success" | "danger" | "info" = "success"
  ) => {
    setToast({ open: true, message, description, tone });
  };

  // 5. React Query Data Fetching
  const { data: stats } = useRptStatsQuery({
    search,
    year,
    dateFrom,
    dateTo,
    propertyType,
    paymentStatus,
    purok,
  });
  const { data: dues = [] } = useRptDuesQuery();

  const {
    data: rptPages,
    isLoading: isRptLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error: rptError,
  } = useInfiniteRptPropertiesQuery({
    pageSize,
    search,
    year,
    dateFrom,
    dateTo,
    propertyType,
    paymentStatus,
    purok,
    sortBy,
    sortOrder,
  });

  const properties = React.useMemo(() => {
    if (!rptPages?.pages) return [];
    return rptPages.pages.flatMap((p) => p.items ?? []);
  }, [rptPages]);

  const totalCount = rptPages?.pages[0]?.total ?? 0;

  // Keep selectedProperty fresh when list updates
  React.useEffect(() => {
    if (selectedProperty) {
      const fresh = properties.find((p) => p.id === selectedProperty.id);
      if (fresh && fresh !== selectedProperty) {
        setSelectedProperty(fresh);
      }
    }
  }, [properties, selectedProperty, setSelectedProperty]);

  // 6. Mutations
  const createMutation = useCreateRptPropertyMutation();
  const updateMutation = useUpdateRptPropertyMutation();
  const deleteMutation = useDeleteRptPropertyMutation();
  const payTaxMutation = usePayRptTaxMutation();

  // 7. Derived KPI Metrics
  const totalAssessedPesos = stats
    ? Math.round(stats.totalAssessedValueCentavos / 100)
    : properties.reduce((acc, p) => acc + p.assessedValue, 0);
  const totalBrgySharePesos = stats
    ? Math.round(stats.totalBarangayShareCentavos / 100)
    : dues.reduce((acc, d) => acc + d.barangayShareAmount, 0);
  const collectedSharePesos = stats
    ? Math.round(stats.collectedShareCentavos / 100)
    : dues
        .filter((d) => d.paymentStatus === "fully_paid")
        .reduce((acc, d) => acc + d.barangayShareAmount, 0);
  const delinquentSharePesos = stats
    ? Math.round(stats.delinquentShareCentavos / 100)
    : dues
        .filter((d) => d.paymentStatus === "unpaid" || d.paymentStatus === "partially_paid")
        .reduce((acc, d) => acc + d.barangayShareAmount, 0);
  const efficiencyPct = stats?.collectionEfficiencyPercent ?? 0;

  // 8. Handlers
  const handleDeclareOrEditSubmit = async (payload: CreateRptPropertyPayload) => {
    try {
      if (editingProperty) {
        const updated = await updateMutation.mutateAsync({
          id: editingProperty.id,
          payload,
        });
        setDeclareOpen(false);
        setEditingProperty(null);
        setSelectedProperty(updated);
        showToast(
          "Assessment Updated",
          `Updated property declaration ${updated.taxDeclarationNo} (${updated.ownerName})`,
          "success"
        );
      } else {
        const created = await createMutation.mutateAsync(payload);
        setDeclareOpen(false);
        setSelectedProperty(created);
        showToast(
          "Property Declared",
          `Registered TDN ${created.taxDeclarationNo} for ${created.ownerName}`,
          "success"
        );
      }
    } catch (err: any) {
      showToast(
        editingProperty ? "Update Failed" : "Declaration Failed",
        err?.message || "Unable to save property declaration",
        "danger"
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      showToast(
        "Property Declaration Deleted",
        `Permanently removed ${deleteTarget.taxDeclarationNo} (${deleteTarget.ownerName})`,
        "success"
      );
      if (selectedProperty?.id === deleteTarget.id) {
        setSelectedProperty(null);
      }
      setDeleteTarget(null);
    } catch (err: any) {
      showToast("Deletion Failed", err?.message || "Failed to delete property declaration", "danger");
    }
  };

  const handlePayTax = async (propertyId: string, payload: PayRptTaxPayload) => {
    try {
      const res = await payTaxMutation.mutateAsync({ propertyId, payload });
      showToast(
        "RPT Share Collected & Posted",
        `Official Receipt #${res.orNumber} issued and 25% Barangay Share credited to General Ledger`,
        "success"
      );
    } catch (err: any) {
      showToast("Collection Failed", err?.message || "Failed to record RPT payment", "danger");
    }
  };

  const handleExportCsv = () => {
    const headers = [
      "TDN",
      "Owner Name",
      "Classification",
      "Address",
      "Purok",
      "Lot No",
      "Block No",
      "Market Value (PHP)",
      "Assessed Value (PHP)",
      "Declared Date",
    ];
    const rows = properties.map((p) => [
      `"${p.taxDeclarationNo}"`,
      `"${p.ownerName.replace(/"/g, '""')}"`,
      p.propertyType,
      `"${p.addressLine.replace(/"/g, '""')}"`,
      p.purok,
      p.lotNo || "",
      p.blockNo || "",
      p.marketValue,
      p.assessedValue,
      p.createdAt,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cbms-rpt-roll-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("RPT Roll Exported", `Downloaded ${properties.length} property declaration(s) as CSV`, "info");
  };

  const selectedDue = React.useMemo(() => {
    if (!selectedProperty) return null;
    return (
      dues.find((d) => d.rptPropertyId === selectedProperty.id) || null
    );
  }, [selectedProperty, dues]);

  const nextTdn = `TD-${new Date().getFullYear()}-${String(101 + totalCount + 1).padStart(4, "0")}`;

  return (
    <>
      <PageHead
        title="Real Property Tax (RPT)"
        subtitle="Barangay Assessment Roll, Tax Declarations (TDN), and 25% RPT Share Collections (RA 7160 §271)."
        breadcrumb="Financial Administration"
        parity="BAMS"
      />

      {/* KPI Summary Strip */}
      <div id="tour-rpt-stats">
        <StatGrid>
          <StatCard
            label="Total Assessed Valuation"
            value={pesoAmount(totalAssessedPesos)}
            hint={`${stats?.totalProperties ?? totalCount} declared parcels in roll`}
            icon="🏛️"
            tone="navy"
          />
          <StatCard
            label="25% Barangay RPT Share"
            value={pesoAmount(totalBrgySharePesos)}
            hint="Statutory share of 1% Basic RPT (RA 7160 §271)"
            icon="📊"
            tone="gold"
          />
          <StatCard
            label="Collected Barangay Share"
            value={pesoAmount(collectedSharePesos)}
            hint={`${efficiencyPct}% collection efficiency`}
            icon="✅"
            tone="green"
          />
          <StatCard
            label="Delinquent / Unpaid Share"
            value={pesoAmount(delinquentSharePesos)}
            hint={`${(stats?.byPaymentStatus?.unpaid ?? 0) + (stats?.byPaymentStatus?.partially_paid ?? 0)} parcel(s) awaiting settlement`}
            icon="⚠️"
            tone="red"
          />
        </StatGrid>
      </div>

      {rptError && (
        <Alert tone="danger">
          {(rptError as Error).message || "Failed to load Real Property Tax declarations."}
        </Alert>
      )}

      {/* Unified Table Panel: Toolbar + RPT Table */}
      <Panel padded={false}>
        <RptToolbar
          searchQuery={search}
          onSearchChange={setSearch}
          filters={{ year, dateFrom, dateTo, propertyType, paymentStatus, purok }}
          onFiltersChange={setFilters}
          onResetFilters={resetFilters}
          totalCount={totalCount}
          mayDeclare={mayDeclare}
          onOpenDeclare={() => {
            setEditingProperty(null);
            setDeclareOpen(true);
          }}
          onExportCsv={handleExportCsv}
          tourEnabled={tourEnabled}
          onToggleTour={handleToggleTour}
        />

        <RptTable
          properties={properties}
          dues={dues}
          loading={isRptLoading}
          total={totalCount}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={toggleSort}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={fetchNextPage}
          onRowClick={(prop) => setSelectedProperty(prop)}
        />
      </Panel>

      {/* Create / Edit Property Declaration Drawer */}
      <DeclareRptDrawer
        open={declareOpen}
        busy={createMutation.isPending || updateMutation.isPending}
        editingProperty={editingProperty}
        nextTdnSuggestion={nextTdn}
        onClose={() => {
          setDeclareOpen(false);
          setEditingProperty(null);
        }}
        onSubmit={handleDeclareOrEditSubmit}
      />

      {/* Property Tax Dossier & Collection Drawer */}
      <RptDetailDrawer
        property={selectedProperty}
        due={selectedDue}
        payingBusy={payTaxMutation.isPending}
        mayCollect={mayCollect}
        mayEdit={mayEdit}
        mayDelete={mayDelete}
        onClose={() => setSelectedProperty(null)}
        onEdit={(prop) => {
          setEditingProperty(prop);
          setDeclareOpen(true);
        }}
        onDelete={(prop) => setDeleteTarget(prop)}
        onPayTax={handlePayTax}
      />

      {/* Type-to-Confirm Delete Modal */}
      <DeleteRptModal
        open={Boolean(deleteTarget)}
        busy={deleteMutation.isPending}
        property={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Toast Notification */}
      <Toast
        open={toast.open}
        message={toast.message}
        description={toast.description}
        tone={toast.tone}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />

      {/* Interactive Tour Guide */}
      <RptTourGuide
        enabled={tourEnabled}
        onToggle={handleToggleTour}
        isDeclareDrawerOpen={declareOpen}
        onOpenDeclareDrawer={() => {
          setEditingProperty(null);
          setDeclareOpen(true);
        }}
        onCloseDeclareDrawer={() => setDeclareOpen(false)}
        isPropertyDrawerOpen={Boolean(selectedProperty)}
        onSelectSampleProperty={() => {
          if (properties.length > 0) setSelectedProperty(properties[0]);
        }}
        onClosePropertyDrawer={() => setSelectedProperty(null)}
      />
    </>
  );
}
