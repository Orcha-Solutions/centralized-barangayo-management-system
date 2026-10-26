"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@cbms/api-client";
import {
  Alert,
  Button,
  Chip,
  KeyValue,
  PageHead,
  Panel,
  StatCard,
  StatGrid,
  StatusChip,
  dateTime,
  titleize,
} from "@cbms/ui";
import { Async, EmptyNote } from "../../../../components/common";
import { useConsole } from "../../../../components/Shell";
import { Toast } from "../../../../components/Toast";
import {
  useBlotterDetailQuery,
  useUpdateBlotterMutation,
  useDeleteBlotterMutation,
  useCreateBlotterActionMutation,
  useUpdateBlotterActionMutation,
  useDeleteBlotterActionMutation,
} from "../../../../lib/blotter-queries";
import type { BlotterEntry, BlotterActionLog } from "../../../../lib/types";
import { BlotterActionTimeline } from "./components/BlotterActionTimeline";
import { RecordActionModal, type RecordActionFormData } from "./components/RecordActionModal";
import { BlotterDetailActions } from "./components/BlotterDetailActions";
import { BlotterDetailLeftPanels } from "./components/BlotterDetailLeftPanels";
import { DeleteActionModal } from "./components/DeleteActionModal";
import { BlotterDrawer, type BlotterDrawerFormData } from "../components/BlotterDrawer";
import { DeleteBlotterModal } from "../components/DeleteBlotterModal";

export default function BlotterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { can, hasRole, user } = useConsole();
  const id = String((params as Record<string, string | string[]>)?.id ?? "");

  const { data: entry, isLoading, error: queryError, refetch } = useBlotterDetailQuery(id);
  const updateMutation = useUpdateBlotterMutation();
  const deleteMutation = useDeleteBlotterMutation();
  const createActionMutation = useCreateBlotterActionMutation(id);
  const updateActionMutation = useUpdateBlotterActionMutation(id);
  const deleteActionMutation = useDeleteBlotterActionMutation(id);

  // Dropdown & Modal States
  const [openEditDrawer, setOpenEditDrawer] = React.useState(false);
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);

  // Modal / Form state for logging or editing an action
  const [showLogModal, setShowLogModal] = React.useState(false);
  const [actionToEdit, setActionToEdit] = React.useState<BlotterActionLog | null>(null);
  const [actionToDelete, setActionToDelete] = React.useState<BlotterActionLog | null>(null);
  const [initialActionTitle, setInitialActionTitle] = React.useState("");
  const [initialStatusAfter, setInitialStatusAfter] = React.useState("active");
  const [initialDocumentRef, setInitialDocumentRef] = React.useState("");
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

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

  // Authorization check for confidential VAWC records
  const isVawAuthorized =
    can("vawc:view") ||
    hasRole("VAW_DESK_OFFICER") ||
    hasRole("PUNONG_BARANGAY") ||
    hasRole("SYSTEM_ADMIN");

  const mayVawc = can("vawc:encode") || can("vawc:view");
  const isConfidentialAndHidden = entry?.isConfidential && !isVawAuthorized;

  // Can log action check
  const canLogAction =
    can("blotter:create") ||
    can("blotter:view") ||
    can("kp:create") ||
    hasRole("VAW_DESK_OFFICER") ||
    hasRole("TANOD") ||
    hasRole("LUPON_SECRETARY") ||
    hasRole("BARANGAY_SECRETARY") ||
    hasRole("PUNONG_BARANGAY") ||
    hasRole("SYSTEM_ADMIN");

  const actions = entry?.actionsTaken ?? [];

  async function handleRecordActionSubmit(data: RecordActionFormData) {
    try {
      if (actionToEdit) {
        await updateActionMutation.mutateAsync({
          actionId: actionToEdit.id,
          data: {
            actionTaken: data.actionTitle,
            officerName: data.officerName,
            officerRole: data.officerRole,
            notes: data.notes,
            statusAfter: data.statusAfter,
            documentRef: data.documentRef || null,
          },
        });
        showToast("Action Updated", `Intervention record updated successfully.`, "success");
      } else {
        await createActionMutation.mutateAsync({
          actionTaken: data.actionTitle,
          officerName: data.officerName,
          officerRole: data.officerRole,
          notes: data.notes,
          statusAfter: data.statusAfter,
          documentRef: data.documentRef || undefined,
        });
        showToast("Action Recorded", `Follow-up action logged to history.`, "success");
      }
      setShowLogModal(false);
      setActionToEdit(null);
      await refetch();
    } catch (err: any) {
      showToast("Operation Failed", err?.message || "Failed to save action record.", "danger");
      throw err;
    }
  }

  const handleDeleteActionConfirm = async () => {
    if (!actionToDelete) return;
    try {
      await deleteActionMutation.mutateAsync(actionToDelete.id);
      showToast("Action Deleted", "Timeline action was removed successfully.", "success");
      setActionToDelete(null);
      await refetch();
    } catch (err: any) {
      showToast("Delete Failed", err?.message || "Failed to delete timeline action.", "danger");
    }
  };

  const handleEditActionClick = (act: BlotterActionLog) => {
    setActionToEdit(act);
    setShowLogModal(true);
  };

  const handleDeleteActionClick = (act: BlotterActionLog) => {
    setActionToDelete(act);
  };

  const openNewActionModal = (title = "", status = "active", docRef = "") => {
    setActionToEdit(null);
    setInitialActionTitle(title);
    setInitialStatusAfter(status);
    setInitialDocumentRef(docRef);
    setShowLogModal(true);
  };

  // Edit Blotter Submit Handler
  const handleEditSubmit = async (formData: BlotterDrawerFormData) => {
    if (!entry) return;
    try {
      await updateMutation.mutateAsync({
        id: entry.id,
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
      showToast("Blotter Updated", `Incident ${entry.entryNo} updated successfully.`, "success");
      setOpenEditDrawer(false);
      await refetch();
    } catch (err: any) {
      showToast("Update Failed", err?.message || "Failed to update incident.", "danger");
    }
  };

  // Delete Blotter Handler
  const handleDeleteConfirm = async () => {
    if (!entry) return;
    try {
      await deleteMutation.mutateAsync(entry.id);
      showToast("Blotter Deleted", `Incident ${entry.entryNo} removed from registry.`, "info");
      setOpenDeleteModal(false);
      router.push("/blotter");
    } catch (err: any) {
      showToast("Deletion Failed", err?.message || "Failed to delete incident.", "danger");
    }
  };

  return (
    <>
      <PageHead
        title={entry ? `Blotter Entry: ${entry.entryNo}` : "Blotter Incident Record"}
        subtitle={
          entry
            ? `Incident logged on ${dateTime(entry.incidentAt)} at ${entry.location}. Status: ${titleize(entry.status || "active")}.`
            : "Official incident record book."
        }
        breadcrumb="Justice & Safety / Blotter"
        parity="KPISBH / BIMS Form C1 & D1"
        actions={
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button
              type="button"
              className="cbms-btn"
              onClick={() => router.push("/blotter")}
            >
              ← Back to Blotter
            </button>
            <BlotterDetailActions
              entry={entry}
              onOpenEdit={() => setOpenEditDrawer(true)}
              onOpenDelete={() => setOpenDeleteModal(true)}
              onOpenNewAction={() => openNewActionModal()}
              canLogAction={canLogAction}
            />
          </div>
        }
      />

      <Async loading={isLoading} error={queryError}>
        {entry ? (
          <>
            {submitSuccess && (
              <div style={{ marginBottom: 16 }}>
                <Alert tone="success">
                  Barangay action successfully logged and attached to incident timeline!
                </Alert>
              </div>
            )}

            {/* Quick KPI Stat Strip */}
            <StatGrid>
              <StatCard label="Entry Number" value={entry.entryNo} />
              <StatCard
                label="Incident Date"
                value={dateTime(entry.incidentAt)}
                hint={`Recorded by ${entry.recordedBy || "Desk Officer"}`}
              />
              <StatCard
                label="Classification"
                value={
                  <span style={{ textTransform: "capitalize" }}>
                    {entry.category.replace("_", " ")}
                  </span>
                }
                hint={entry.isConfidential ? "🔒 Strictly Confidential" : "Public Record"}
              />
              <StatCard
                label="Current Status"
                value={<StatusChip status={entry.status || "active"} />}
                hint={`${actions.length} action(s) taken`}
              />
            </StatGrid>

            <div style={{ height: 16 }} />

            {/* 2-Column Layout: Left has Parties, KP Status, Narrative; Right has History */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
                gap: "1.25rem",
                alignItems: "start",
              }}
            >
              {/* LEFT COLUMN: Vertically stacked details */}
              <BlotterDetailLeftPanels
                entry={entry}
                isConfidentialAndHidden={Boolean(isConfidentialAndHidden)}
                onIssueBpo={() => {
                  openNewActionModal(
                    "Barangay Protection Order (BPO) Issued",
                    "bpo_issued",
                    "BPO Form D2"
                  );
                }}
              />

              {/* RIGHT COLUMN: History Timeline */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <BlotterActionTimeline
                  actions={actions}
                  canLogAction={canLogAction}
                  onOpenLogModal={() => openNewActionModal()}
                  onEditAction={handleEditActionClick}
                  onDeleteAction={handleDeleteActionClick}
                  isDeleting={deleteActionMutation.isPending}
                />
              </div>
            </div>

            {/* RECORD / EDIT ACTION MODAL */}
            <RecordActionModal
              open={showLogModal}
              onClose={() => {
                setShowLogModal(false);
                setActionToEdit(null);
              }}
              entryNo={entry.entryNo}
              location={entry.location}
              defaultOfficerName={user?.fullName || ""}
              defaultOfficerRole={user?.roles?.[0] ? user.roles[0].replace(/_/g, " ") : "Duty Officer"}
              actionToEdit={actionToEdit}
              initialActionTitle={initialActionTitle}
              initialStatusAfter={initialStatusAfter}
              initialDocumentRef={initialDocumentRef}
              onSubmit={handleRecordActionSubmit}
            />

            {/* DELETE ACTION CONFIRMATION MODAL */}
            <DeleteActionModal
              action={actionToDelete}
              busy={deleteActionMutation.isPending}
              onCancel={() => setActionToDelete(null)}
              onConfirm={handleDeleteActionConfirm}
            />

            {/* EDIT BLOTTER DRAWER */}
            <BlotterDrawer
              open={openEditDrawer}
              busy={updateMutation.isPending}
              editingEntry={entry}
              onClose={() => setOpenEditDrawer(false)}
              onSubmit={handleEditSubmit}
              mayVawc={mayVawc}
            />

            {/* DELETE BLOTTER MODAL WITH TYPED CONFIRMATION */}
            <DeleteBlotterModal
              open={openDeleteModal}
              entry={entry}
              busy={deleteMutation.isPending}
              onCancel={() => setOpenDeleteModal(false)}
              onConfirm={handleDeleteConfirm}
            />
          </>
        ) : (
          <EmptyNote>Blotter entry not found.</EmptyNote>
        )}
      </Async>

      {/* Post-transaction Toast Feedback */}
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
