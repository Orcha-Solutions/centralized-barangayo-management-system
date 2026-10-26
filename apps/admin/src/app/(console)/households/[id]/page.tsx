"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, PageHead } from "@cbms/ui";
import { Toast } from "../../../../components/Toast";
import {
  useHouseholdDetailQuery,
  useDeleteHouseholdMutation,
  HOUSEHOLDS_QUERY_KEYS,
} from "../../../../lib/households-queries";
import { HouseholdHero } from "./components/HouseholdHero";
import { HouseholdStats } from "./components/HouseholdStats";
import { HouseholdInfoCards } from "./components/HouseholdInfoCards";
import { HouseholdMembersTable } from "./components/HouseholdMembersTable";
import { EditHouseholdModal } from "./components/EditHouseholdModal";
import { DeleteHouseholdModal } from "../components/DeleteHouseholdModal";
import type { Household } from "../../../../lib/types";

export default function HouseholdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = String((params as Record<string, string | string[]>)?.id ?? "");

  // TanStack React Query for live read
  const { data: household, isLoading, error: queryError, refetch } = useHouseholdDetailQuery(id);

  // Modal States
  const [openEdit, setOpenEdit] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);

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

  // Delete Mutation
  const deleteMutation = useDeleteHouseholdMutation();

  const handleConfirmDelete = async () => {
    if (!household) return;
    try {
      await deleteMutation.mutateAsync(household.id);
      showToast(
        "Household Record Deleted",
        `Household ${household.householdNo} was permanently removed.`,
        "success"
      );
      setTimeout(() => {
        router.push("/households");
      }, 1000);
    } catch (err: any) {
      showToast("Deletion Failed", err?.message || "Failed to delete household record.", "danger");
    }
  };

  if (isLoading) {
    return (
      <>
        <PageHead
          title="Loading Household Profile…"
          breadcrumb="Residents / Households"
          parity="BIMS Form A1"
        />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "5rem 0", gap: "1rem" }}>
          <span className="cbms-spinner" aria-label="Loading household" style={{ width: 36, height: 36 }} />
          <span style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 500 }}>
            Retrieving household records from secure registry…
          </span>
        </div>
      </>
    );
  }

  if (queryError || !household) {
    return (
      <>
        <PageHead
          title="Household Not Found"
          breadcrumb="Residents / Households"
          parity="BIMS Form A1"
        />
        <Alert tone="danger">
          {(queryError as any)?.message || "The requested household record could not be found or has been removed."}
        </Alert>
        <div style={{ marginTop: "1.5rem" }}>
          <button type="button" className="cbms-btn" onClick={() => router.push("/households")}>
            ← Return to Households List
          </button>
        </div>
      </>
    );
  }

  const h = household;
  const membersCount = h.members?.length ?? h.numMembers ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%" }}>
      {/* 1. Modern Hero Banner */}
      <HouseholdHero
        household={h}
        onEdit={() => setOpenEdit(true)}
        onDelete={() => setOpenDelete(true)}
      />

      {/* 2. Key Metric Stat Cards */}
      <HouseholdStats household={h} />

      {/* 3. Side-by-Side Two-Column Layout (Cards Left, Family Members Right) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))",
          gap: "1.25rem",
          alignItems: "start",
          marginTop: "0.25rem",
        }}
      >
        {/* Left Column: Form A1 Socio-Economic, Dwelling & Utilities Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <HouseholdInfoCards household={h} />
        </div>

        {/* Right Column: Family & Resident Members Roster */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <HouseholdMembersTable members={h.members ?? []} />
        </div>
      </div>

      {/* 5. Edit Modal */}
      {openEdit && (
        <EditHouseholdModal
          open={openEdit}
          household={h}
          onClose={() => setOpenEdit(false)}
          onSuccess={(updated) => {
            queryClient.setQueryData(HOUSEHOLDS_QUERY_KEYS.detail(id), (old: Household | undefined) => ({
              ...(old || {}),
              ...updated,
            }));
            showToast(
              "Household Profile Updated",
              `Household ${updated.householdNo || h.householdNo} was updated successfully.`,
              "success"
            );
            refetch();
          }}
        />
      )}

      {/* 6. Delete Confirmation Modal */}
      <DeleteHouseholdModal
        open={openDelete}
        busy={deleteMutation.isPending}
        householdNo={h.householdNo}
        householdName={h.householdName}
        onCancel={() => setOpenDelete(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* 7. Toast Notification */}
      <Toast
        open={toast.open}
        message={toast.message}
        description={toast.description}
        tone={toast.tone}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
