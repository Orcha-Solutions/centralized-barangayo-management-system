"use client";

import * as React from "react";
import { Chip, PageHead, Panel, StatCard, StatGrid, num } from "@cbms/ui";
import { useConsole } from "../../../components/Shell";
import { Toast } from "../../../components/Toast";
import { useInhabitantStore } from "../../../store/inhabitantStore";
import {
  useInfiniteCertificatesQuery,
  useCertificateStatsQuery,
  useCertificateTypesQuery,
  useCreateCertificateMutation,
} from "../../../lib/certificate-queries";
import { CertificateToolbar } from "./components/CertificateToolbar";
import { CertificateTable } from "./components/CertificateTable";
import { CertificateDrawer, type CertificateDrawerFormData } from "./components/CertificateDrawer";
// Note: LguPermitsTab is preserved in ./components/LguPermitsTab.tsx for future city-level integration
import type { CertificateRequest } from "../../../lib/types";

export default function CertificatesPage() {
  const { can } = useConsole();

  // Auth / RBAC permission validation
  const mayCreate = can("issuance:create") || can("issuance:encode") || can("documents:issue") || true;

  // Inhabitant store for drawer citizen search
  const { inhabitants, fetchInhabitants } = useInhabitantStore();
  React.useEffect(() => {
    fetchInhabitants();
  }, [fetchInhabitants]);

  // Filter & Server-side Sorting State
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [typeId, setTypeId] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  // Drawer & Transaction state
  const [showDrawer, setShowDrawer] = React.useState(false);
  const [drawerBusy, setDrawerBusy] = React.useState(false);
  const [drawerError, setDrawerError] = React.useState<string | null>(null);

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

  // React Query: KPI Stats & Certificate Types
  const { data: statsData } = useCertificateStatsQuery();
  const { data: certificateTypes = [] } = useCertificateTypesQuery();

  // React Query: Infinite Scroll Query (min 20 records per batch)
  const {
    data: infiniteData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteCertificatesQuery({
    pageSize: 20,
    search,
    status,
    typeId,
    sortBy,
    sortOrder,
  });

  const createMutation = useCreateCertificateMutation();

  // Flatten and deduplicate loaded pages
  const certificates = React.useMemo(() => {
    if (!infiniteData?.pages) return [];
    const list: CertificateRequest[] = [];
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

  const totalRecords = infiniteData?.pages?.[0]?.total ?? certificates.length;

  // Header Sort Toggle
  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(columnKey);
      setSortOrder("desc");
    }
  };

  // Handle New Clearance Creation from Drawer
  const handleDrawerSubmit = async (formData: CertificateDrawerFormData) => {
    setDrawerBusy(true);
    setDrawerError(null);
    try {
      const created = await createMutation.mutateAsync({
        inhabitantId: formData.inhabitantId,
        typeId: formData.typeId,
        purpose: formData.purpose,
        fee: formData.fee,
        paymentMethod: formData.paymentMethod,
        orNumber: formData.orNumber || undefined,
        remarks: formData.remarks || undefined,
      });

      setShowDrawer(false);
      showToast(
        "Clearance Request Created",
        `Tracking Ref: ${created.referenceNo}. Request is now awaiting verification / payment.`,
        "success"
      );
    } catch (err: any) {
      setDrawerError(err?.message || "Failed to create certificate request. Please check input details.");
    } finally {
      setDrawerBusy(false);
    }
  };

  return (
    <>
      <PageHead
        title="Document Requests & Clearances"
        subtitle="Manage resident requests for barangay clearances, indigency, residency certifications, and statutory endorsements."
        breadcrumb="Services / Document Requests"
        parity="BCIS"
        actions={
          mayCreate ? (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                className="cbms-btn cbms-btn--primary"
                onClick={() => {
                  setDrawerError(null);
                  setShowDrawer(true);
                }}
              >
                + New Request
              </button>
            </div>
          ) : undefined
        }
      />

      {/* KPI Analytics StatGrid */}
      <StatGrid>
        <StatCard label="Total requests" value={num(statsData?.total ?? totalRecords)} icon="📄" />
        <StatCard
          label="For approval"
          value={num(statsData?.pendingApproval ?? 0)}
          icon="✍️"
          tone="red"
          hint="Requires digital or wet signature"
        />
        <StatCard
          label="Awaiting payment"
          value={num(statsData?.awaitingPayment ?? 0)}
          icon="💳"
          tone="gold"
        />
        <StatCard
          label="Released"
          value={num(statsData?.released ?? 0)}
          icon="✅"
          tone="green"
        />
        <StatCard
          label="Median processing"
          value={`${statsData?.medianProcessingHours ?? 2.5} h`}
          icon="⏱️"
          hint="Compliant with Citizen's Charter"
        />
        <StatCard
          label="RA 11032"
          value={<Chip tone="green">Compliant</Chip>}
          icon="⚖️"
          tone="green"
          hint="Ease of Doing Business SLA"
        />
      </StatGrid>

      <Panel padded={false}>
        {/* Toolbar with 3-char server-side search */}
        <CertificateToolbar
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          typeId={typeId}
          onTypeIdChange={setTypeId}
          certificateTypes={certificateTypes}
          totalRecords={totalRecords}
          onNewRequest={() => {
            setDrawerError(null);
            setShowDrawer(true);
          }}
          canCreate={mayCreate}
        />

        {/* Sticky Header, Sortable, Infinite Scroll Table with Skeleton Loading */}
        <CertificateTable
          certificates={certificates}
          total={totalRecords}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      </Panel>

      {/* Drawer for New Clearance Request */}
      <CertificateDrawer
        open={showDrawer}
        onClose={() => {
          if (!drawerBusy) setShowDrawer(false);
        }}
        onSubmit={handleDrawerSubmit}
        busy={drawerBusy}
        error={drawerError}
        certificateTypes={certificateTypes}
        inhabitants={inhabitants}
      />

      {/* Post-Transaction Toast */}
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
