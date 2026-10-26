"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useInhabitantStore } from "../../../../../store/inhabitantStore";
import { useHouseholdStore } from "../../../../../store/householdStore";
import { useApi, ApiError } from "@cbms/api-client";
import { PageHead } from "@cbms/ui";
import { ActionResult, Tabs } from "../../../../../components/common";
import {
  EditInhabitantForm,
  type EditInhabitantFormData,
  type FlagKey,
} from "./components/EditInhabitantForm";
import { DeleteInhabitantModal } from "./components/DeleteInhabitantModal";
import { ConfirmSaveModal } from "./components/ConfirmSaveModal";
import { Toast } from "../../../../../components/Toast";
import { validatePhilippineMobile, validateEmail } from "../../../../../lib/validation";
import {
  InhabitantHistoryTab,
  type TimelineTransaction,
} from "./components/InhabitantHistoryTab";

type TabKey = "edit" | "history";

export default function EditInhabitantPage() {
  const params = useParams();
  const router = useRouter();
  const id = String((params as Record<string, string | string[]>)?.id ?? "");

  const { inhabitants, updateInhabitant, deleteInhabitant, fetchInhabitants } =
    useInhabitantStore();
  const { households, fetchHouseholds } = useHouseholdStore();

  // Popups & Toast State
  const [showDeletePopup, setShowDeletePopup] = React.useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = React.useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = React.useState(false);
  const [toast, setToast] = React.useState<{
    open: boolean;
    message: string;
    description?: string;
    tone?: "success" | "danger" | "info";
  }>({ open: false, message: "" });

  // Consolidated timeline data fetching
  const history = useApi<TimelineTransaction[]>(
    id ? `/inhabitants/${id}/transactions` : null
  );

  const [tab, setTab] = React.useState<TabKey>("edit");
  const [form, setForm] = React.useState<EditInhabitantFormData>({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    sex: "male",
    birthDate: "",
    birthPlace: "",
    civilStatus: "single",
    citizenship: "Filipino",
    philsysNo: "",
    contactPhone: "",
    contactEmail: "",
    occupation: "",
    educationLevel: "",
    householdId: "",
    relationToHead: "",
  });

  const [flags, setFlags] = React.useState<Record<FlagKey, boolean>>({
    isSenior: false,
    isPwd: false,
    isSoloParent: false,
    is4Ps: false,
    isIndigenous: false,
    isDeceased: false,
  });

  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      if (inhabitants.length === 0) {
        await fetchInhabitants();
      }
      if (households.length === 0) {
        await fetchHouseholds();
      }
      setLoading(false);
    }
    loadData();
  }, [inhabitants.length, households.length, fetchInhabitants, fetchHouseholds]);

  React.useEffect(() => {
    if (!id || inhabitants.length === 0) return;
    const inh = inhabitants.find((item) => item.id === id);
    if (inh) {
      setForm({
        firstName: inh.firstName || "",
        middleName: inh.middleName || "",
        lastName: inh.lastName || "",
        suffix: inh.suffix || "",
        sex: inh.sex || "male",
        birthDate: inh.birthDate ? inh.birthDate.split("T")[0] : "",
        birthPlace: (inh as any).birthPlace || "",
        civilStatus: inh.civilStatus || "single",
        citizenship: (inh as any).citizenship || (inh as any).nationality || "Filipino",
        philsysNo: inh.philsysNo || "",
        contactPhone: inh.contactPhone || (inh as any).phone || "",
        contactEmail: inh.contactEmail || (inh as any).email || "",
        occupation: inh.occupation || "",
        educationLevel: inh.educationLevel || "",
        householdId: inh.householdId || "",
        relationToHead: inh.relationToHead || "",
      });
      setFlags({
        isSenior: !!inh.isSenior,
        isPwd: !!inh.isPwd,
        isSoloParent: !!inh.isSoloParent,
        is4Ps: !!inh.is4Ps,
        isIndigenous: !!(inh as any).isIndigenous,
        isDeceased: !!inh.isDeceased,
      });
      setLoading(false);
    }
  }, [inhabitants, id]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First name and Last name are required.");
      return;
    }
    if (!form.birthDate) {
      setError("Birth date is required.");
      return;
    }
    if (form.contactPhone.trim()) {
      const phoneVal = validatePhilippineMobile(form.contactPhone);
      if (!phoneVal.isValid) {
        setError(phoneVal.error || "Please enter a valid Philippine mobile number.");
        return;
      }
    }
    if (form.contactEmail.trim()) {
      const emailVal = validateEmail(form.contactEmail);
      if (!emailVal.isValid) {
        setError(emailVal.error || "Please enter a valid email address.");
        return;
      }
    }
    setShowSaveConfirm(true);
  }

  async function handleConfirmSave() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await updateInhabitant(id, {
        ...form,
        ...flags,
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim(),
        lastName: form.lastName.trim(),
        suffix: form.suffix.trim(),
        birthDate: new Date(form.birthDate).toISOString(),
        householdId: form.householdId || null,
        relationToHead: form.householdId ? form.relationToHead : null,
      });
      setShowSaveConfirm(false);
      const fullNameStr = `${form.firstName.trim()} ${form.lastName.trim()}`;
      setToast({
        open: true,
        message: "Changes saved successfully!",
        description: `Profile for ${fullNameStr} has been updated in the barangay registry.`,
        tone: "success",
      });
      // Stay on page: refresh store and history without redirecting
      fetchInhabitants();
      history.reload();
    } catch (err) {
      setShowSaveConfirm(false);
      setError(err instanceof ApiError ? err.message : "Could not save the changes.");
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmDelete() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await deleteInhabitant(id);
      setShowDeletePopup(false);
      router.push("/inhabitants");
    } catch (err: any) {
      setError(err.message || "Failed to delete inhabitant.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading inhabitant details...
      </div>
    );
  }

  return (
    <>
      <PageHead
        title={`Edit Profile: ${form.firstName} ${form.lastName}`}
        subtitle="Citizen master profile and timeline history."
        breadcrumb="Residents / Inhabitants"
        parity="BIPS"
        actions={
          <div style={{ display: "flex", gap: "0.5rem", position: "relative" }}>
            <button
              type="button"
              className="cbms-btn"
              disabled={busy}
              onClick={() => router.push("/inhabitants")}
            >
              Cancel
            </button>
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                className="cbms-btn cbms-btn--primary"
                disabled={busy}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: "0.5rem 1rem",
                  fontSize: "0.875rem",
                  cursor: busy ? "not-allowed" : "pointer",
                }}
              >
                ⚙️ Actions ▾
              </button>
              {showActionsDropdown && (
                <>
                  <div
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 100,
                    }}
                    onClick={() => setShowActionsDropdown(false)}
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "110%",
                      backgroundColor: "var(--color-bg-card, #ffffff)",
                      border: "1px solid var(--color-border, #e2e8f0)",
                      borderRadius: "0.375rem",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      zIndex: 110,
                      minWidth: "180px",
                      display: "flex",
                      flexDirection: "column",
                      padding: "0.25rem 0",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setShowActionsDropdown(false);
                        const formEl = document.getElementById("edit-inhabitant-form") as HTMLFormElement;
                        formEl?.requestSubmit();
                      }}
                      disabled={busy}
                      style={{
                        padding: "0.6rem 1rem",
                        textAlign: "left",
                        border: "none",
                        background: "none",
                        fontSize: "0.85rem",
                        cursor: busy ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "var(--color-text, #1b2430)",
                        width: "100%",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)")
                      }
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      💾 Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowActionsDropdown(false);
                        setShowDeletePopup(true);
                      }}
                      disabled={busy}
                      style={{
                        padding: "0.6rem 1rem",
                        textAlign: "left",
                        border: "none",
                        background: "none",
                        fontSize: "0.85rem",
                        cursor: busy ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "var(--cbms-red, #ce1126)",
                        width: "100%",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)")
                      }
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      🗑️ Delete Profile
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        }
      />

      <ActionResult error={error} />

      <Tabs<TabKey>
        tabs={[
          { value: "edit", label: "View/Edit Profile" },
          { value: "history", label: "Transaction History" },
        ]}
        value={tab}
        onChange={(t) => {
          setTab(t);
          if (t === "history") {
            history.reload();
          }
        }}
      />

      <div style={{ display: tab === "edit" ? "block" : "none" }}>
        <EditInhabitantForm
          form={form}
          setForm={setForm}
          flags={flags}
          setFlags={setFlags}
          households={households}
          busy={busy}
          onSave={handleSave}
        />
      </div>

      <div style={{ display: tab === "history" ? "block" : "none" }}>
        <InhabitantHistoryTab
          loading={history.loading}
          error={history.error}
          transactions={history.data || []}
        />
      </div>

      <DeleteInhabitantModal
        open={showDeletePopup}
        busy={busy}
        expectedName={`${form.firstName} ${form.lastName}`.trim()}
        onCancel={() => setShowDeletePopup(false)}
        onConfirm={handleConfirmDelete}
      />

      <ConfirmSaveModal
        open={showSaveConfirm}
        busy={busy}
        inhabitantName={`${form.firstName} ${form.lastName}`.trim()}
        onCancel={() => setShowSaveConfirm(false)}
        onConfirm={handleConfirmSave}
      />

      <Toast
        open={toast.open}
        message={toast.message}
        description={toast.description}
        tone={toast.tone}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </>
  );
}
