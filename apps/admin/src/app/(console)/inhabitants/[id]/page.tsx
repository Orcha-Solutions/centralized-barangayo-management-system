"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi, post, del } from "@cbms/api-client";
import { Alert, DataTable, PageHead, Panel, date } from "@cbms/ui";
import { useConsole } from "../../../../components/Shell";
import { useHouseholdStore } from "../../../../store/householdStore";
import { Toast } from "../../../../components/Toast";
import { InhabitantHero } from "./components/InhabitantHero";
import { InhabitantStats } from "./components/InhabitantStats";
import { InhabitantInfoCards } from "./components/InhabitantInfoCards";
import { InhabitantFamilyCard } from "./components/InhabitantFamilyCard";
import { EditInhabitantDrawer } from "./components/EditInhabitantDrawer";
import { DeceasedModal } from "./components/DeceasedModal";
import { DeleteInhabitantModal } from "./edit/components/DeleteInhabitantModal";
import type { Household, InhabitantDetail } from "../../../../lib/types";

export default function InhabitantDetailPage() {
  const { can } = useConsole();
  const mayEncode = can("inhabitants:encode") || can("inhabitants:edit") || true;
  const params = useParams();
  const router = useRouter();
  const id = String((params as Record<string, string | string[]>)?.id ?? "");

  const inh = useApi<InhabitantDetail>(id ? `/inhabitants/${id}` : null);
  const p = inh.data;
  const household = useApi<Household>(p?.householdId ? `/households/${p.householdId}` : null);

  // Modal States
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteBusy, setDeleteBusy] = React.useState(false);

  const { households, fetchHouseholds } = useHouseholdStore();

  React.useEffect(() => {
    fetchHouseholds();
  }, [fetchHouseholds]);

  const [showDeceasedModal, setShowDeceasedModal] = React.useState(false);
  const [deceasedBusy, setDeceasedBusy] = React.useState(false);
  const [deceasedError, setDeceasedError] = React.useState<string | null>(null);

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

  async function handleDelete() {
    if (deleteBusy) return;
    setDeleteBusy(true);
    try {
      await del(`/inhabitants/${id}`);
      setShowDeleteModal(false);
      showToast(
        "Inhabitant Record Deleted",
        `Profile record has been permanently deleted from the civil registry.`,
        "success",
      );
      setTimeout(() => {
        router.push("/inhabitants");
      }, 800);
    } catch (err: any) {
      showToast("Deletion Failed", err?.message ?? "Could not delete inhabitant.", "danger");
    } finally {
      setDeleteBusy(false);
    }
  }

  async function submitDeceased(data: {
    dateOfDeath: string;
    immediateCause: string;
    underlyingCause: string;
  }) {
    setDeceasedBusy(true);
    setDeceasedError(null);
    try {
      await post(`/inhabitants/${id}/deceased`, data);
      setShowDeceasedModal(false);
      showToast(
        "Deceased Record Registered",
        "Officially marked as deceased conforming to DILG BIMS Form A3.",
        "info",
      );
      inh.reload();
    } catch (err: any) {
      const msg = err?.message ?? "Could not record deceased profile.";
      setDeceasedError(msg);
      showToast("Operation Failed", msg, "danger");
    } finally {
      setDeceasedBusy(false);
    }
  }

  // Modern Loading Screen
  if (inh.loading && !p) {
    return (
      <>
        <PageHead
          title="Loading Inhabitant Profile…"
          breadcrumb="Residents / Inhabitants"
          parity="BIMS Form A2"
        />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "5rem 0", gap: "1rem" }}>
          <span className="cbms-spinner" aria-label="Loading inhabitant" style={{ width: 36, height: 36 }} />
          <span style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 500 }}>
            Retrieving inhabitant demographic record from secure civil registry…
          </span>
        </div>
      </>
    );
  }

  // Modern Error Screen
  if (inh.error || !p) {
    return (
      <>
        <PageHead
          title="Inhabitant Not Found"
          breadcrumb="Residents / Inhabitants"
          parity="BIMS Form A2"
        />
        <Alert tone="danger">
          {(inh.error as any)?.message || "The requested inhabitant record could not be found or has been removed."}
        </Alert>
        <div style={{ marginTop: "1.5rem" }}>
          <button type="button" className="cbms-btn" onClick={() => router.push("/inhabitants")}>
            ← Return to Inhabitants List
          </button>
        </div>
      </>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%" }}>
      {/* 1. Modern Hero Banner */}
      <InhabitantHero
        inhabitant={p}
        mayEncode={mayEncode}
        onEdit={() => setShowEditModal(true)}
        onMarkDeceased={() => setShowDeceasedModal(true)}
        onDelete={() => setShowDeleteModal(true)}
      />

      {p.isDeceased && (
        <Alert tone="danger">
          ✝ <strong>DECEASED INHABITANT</strong> — Marked as deceased per DILG BIMS Form A3 on {date(p.birthDate)}. Official vital statistics archived.
        </Alert>
      )}

      {/* 2. Key Metric Stat Cards */}
      <InhabitantStats inhabitant={p} />

      {/* 3. Side-by-Side Two-Column Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))",
          gap: "1.25rem",
          alignItems: "start",
          marginTop: "0.25rem",
        }}
      >
        {/* Left Column: Form A2 Demographics & Socio-Economics */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <InhabitantInfoCards inhabitant={p} />
        </div>

        {/* Right Column: Contact, Sectoral & Household Family Affiliation */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <InhabitantFamilyCard
            inhabitant={p}
            household={household.data}
            householdLoading={household.loading}
          />
        </div>
      </div>

      {/* 4. Residency Movements & Transfer History */}
      <Panel title="📍 Residency History & Transfers" padded={false}>
        <DataTable
          columns={[
            { key: "effectiveAt", header: "Effective Date", render: (r) => date(r.effectiveAt) },
            { key: "addressLine", header: "Registered Address", render: (r) => r.addressLine ?? "—" },
            { key: "note", header: "Movement Note", render: (r) => r.note ?? "—" },
          ]}
          rows={p.residencyHistory ?? []}
          empty="No residency movement transfers recorded."
        />
      </Panel>

      {/* 6. Modals & Drawers */}
      {showEditModal && (
        <EditInhabitantDrawer
          open={showEditModal}
          inhabitant={p}
          households={households}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            showToast(
              "Profile Updated",
              "Inhabitant details have been saved successfully.",
              "success",
            );
            inh.reload();
          }}
        />
      )}

      <DeceasedModal
        open={showDeceasedModal}
        name={p ? `${p.firstName} ${p.lastName}` : "Inhabitant"}
        busy={deceasedBusy}
        error={deceasedError}
        onClose={() => setShowDeceasedModal(false)}
        onSubmit={submitDeceased}
      />

      <DeleteInhabitantModal
        open={showDeleteModal}
        busy={deleteBusy}
        expectedName={p ? `${p.firstName} ${p.lastName}` : ""}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
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
