"use client";

import * as React from "react";
import { fullName } from "@cbms/ui";
import { patch } from "@cbms/api-client";
import { validatePhilippineMobile, validateEmail } from "../../../../../lib/validation";
import type { Household, InhabitantDetail } from "../../../../../lib/types";
import { EditInhabitantFormBody } from "./EditInhabitantFormBody";

export interface EditInhabitantDrawerProps {
  open: boolean;
  inhabitant: InhabitantDetail;
  households: Household[];
  onClose: () => void;
  onSuccess: () => void;
}

export function EditInhabitantDrawer({
  open,
  inhabitant: p,
  households,
  onClose,
  onSuccess,
}: EditInhabitantDrawerProps) {
  const [form, setForm] = React.useState({
    firstName: p.firstName || "",
    middleName: p.middleName || "",
    lastName: p.lastName || "",
    suffix: p.suffix || "",
    sex: p.sex || "male",
    birthDate: p.birthDate ? p.birthDate.split("T")[0] : "",
    birthPlace: p.birthPlace || "",
    civilStatus: p.civilStatus || "single",
    citizenship: p.citizenship || "Filipino",
    philsysNo: p.philsysNo || "",
    contactPhone: p.contactPhone || "",
    contactEmail: p.contactEmail || "",
    telephoneNumber: p.telephoneNumber || "",
    occupation: p.occupation || "",
    educationLevel: p.educationLevel || "",
    householdId: p.householdId || "",
    relationToHead: p.relationToHead || "",
  });

  const [flags, setFlags] = React.useState({
    isSenior: Boolean(p.isSenior),
    isPwd: Boolean(p.isPwd),
    isSoloParent: Boolean(p.isSoloParent),
    is4Ps: Boolean(p.is4Ps),
    isIndigenous: Boolean(p.isIndigenous),
  });

  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setForm({
        firstName: p.firstName || "",
        middleName: p.middleName || "",
        lastName: p.lastName || "",
        suffix: p.suffix || "",
        sex: p.sex || "male",
        birthDate: p.birthDate ? p.birthDate.split("T")[0] : "",
        birthPlace: p.birthPlace || "",
        civilStatus: p.civilStatus || "single",
        citizenship: p.citizenship || "Filipino",
        philsysNo: p.philsysNo || "",
        contactPhone: p.contactPhone || "",
        contactEmail: p.contactEmail || "",
        telephoneNumber: p.telephoneNumber || "",
        occupation: p.occupation || "",
        educationLevel: p.educationLevel || "",
        householdId: p.householdId || "",
        relationToHead: p.relationToHead || "",
      });
      setFlags({
        isSenior: Boolean(p.isSenior),
        isPwd: Boolean(p.isPwd),
        isSoloParent: Boolean(p.isSoloParent),
        is4Ps: Boolean(p.is4Ps),
        isIndigenous: Boolean(p.isIndigenous),
      });
      setError(null);
    }
  }, [open, p]);

  // Handle Escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open && !busy) {
        onClose();
      }
    }
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, busy, onClose]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First name and Last name are required.");
      return;
    }
    if (!form.birthDate) {
      setError("Birth date is required.");
      return;
    }
    if (form.contactPhone.trim()) {
      const val = validatePhilippineMobile(form.contactPhone);
      if (!val.isValid) {
        setError(val.error || "Please enter a valid Philippine mobile number.");
        return;
      }
    }
    if (form.contactEmail.trim()) {
      const val = validateEmail(form.contactEmail);
      if (!val.isValid) {
        setError(val.error || "Please enter a valid email address.");
        return;
      }
    }

    setBusy(true);
    setError(null);
    try {
      await patch(`/inhabitants/${p.id}`, {
        ...form,
        ...flags,
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim(),
        lastName: form.lastName.trim(),
        suffix: form.suffix.trim(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to update inhabitant profile.");
    } finally {
      setBusy(false);
    }
  }

  const residentName = fullName(p) || "Inhabitant";

  return (
    <>
      <style>{`
        @keyframes cbmsDrawerSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes cbmsFadeOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.55)",
          backdropFilter: "blur(2px)",
          zIndex: 2500,
          display: "flex",
          justifyContent: "flex-end",
          animation: "cbmsFadeOverlay 0.2s ease-out",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && !busy) onClose();
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "620px",
            backgroundColor: "#ffffff",
            height: "100%",
            boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.22)",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            animation: "cbmsDrawerSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Tricolor Accent Line */}
          <div
            style={{
              height: 4,
              width: "100%",
              background: "linear-gradient(90deg, #0a2463 0%, #2563eb 50%, #f59e0b 100%)",
              flexShrink: 0,
            }}
          />

          {/* Fixed Drawer Header */}
          <div
            style={{
              padding: "1.25rem 1.5rem",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#f8fafc",
              flexShrink: 0,
            }}
          >
            <div>
              <h3
                id="drawer-title"
                style={{
                  margin: 0,
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: "var(--cbms-navy, #0a2463)",
                  letterSpacing: "-0.01em",
                }}
              >
                ✏️ Edit Profile: {residentName}
              </h3>
              <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>
                DILG BIMS Form A2 · Civil Registry & Demographics Update
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              aria-label="Close drawer"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                color: "#64748b",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#fee2e2";
                e.currentTarget.style.color = "#ef4444";
                e.currentTarget.style.borderColor = "#fca5a5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ffffff";
                e.currentTarget.style.color = "#64748b";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
            >
              ✕
            </button>
          </div>

          {/* Form Body with Lazy Loading Household Dropdown */}
          <EditInhabitantFormBody
            form={form}
            setForm={setForm}
            flags={flags}
            setFlags={setFlags}
            households={households}
            busy={busy}
            error={error}
            onSubmit={handleSubmit}
          />

          {/* Docked Drawer Footer */}
          <div
            style={{
              padding: "1rem 1.5rem",
              borderTop: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
              boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
              Press <strong>Esc</strong> to cancel
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                className="cbms-btn"
                onClick={onClose}
                disabled={busy}
                style={{ padding: "0.55rem 1.1rem" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="inhabitant-edit-form"
                className="cbms-btn cbms-btn--primary"
                disabled={busy}
                style={{
                  padding: "0.55rem 1.35rem",
                  backgroundColor: "var(--cbms-navy, #0a2463)",
                  borderColor: "var(--cbms-navy, #0a2463)",
                  color: "#ffffff",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  fontWeight: 600,
                }}
              >
                {busy && <span style={{ animation: "spin 1s linear infinite" }}>🔄</span>}
                <span>{busy ? "Saving Updates..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
