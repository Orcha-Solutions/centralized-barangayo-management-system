"use client";

import * as React from "react";
import { Alert } from "@cbms/ui";
import type { Household } from "../../../../lib/types";
import { type InhabitantFormState, INITIAL_INHABITANT_FORM } from "../types";
import { useCreateInhabitantMutation } from "../../../../lib/inhabitants-queries";
import { DrawerIdentityFields } from "./DrawerIdentityFields";
import { DrawerHouseholdPicker } from "./DrawerHouseholdPicker";
import { DrawerSectoralFields } from "./DrawerSectoralFields";

interface InhabitantRegisterDrawerProps {
  open: boolean;
  onClose: () => void;
  households: Household[];
  onSuccess: () => void;
}

export function InhabitantRegisterDrawer({
  open,
  onClose,
  households,
  onSuccess,
}: InhabitantRegisterDrawerProps) {
  const [form, setForm] = React.useState<InhabitantFormState>(INITIAL_INHABITANT_FORM);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const createMutation = useCreateInhabitantMutation();
  const isPending = createMutation.isPending;

  React.useEffect(() => {
    if (open) {
      setForm(INITIAL_INHABITANT_FORM);
      setActionError(null);
    }
  }, [open]);

  if (!open) return null;

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;

    setActionError(null);
    try {
      await createMutation.mutateAsync({
        ...form,
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim(),
        lastName: form.lastName.trim(),
        suffix: form.suffix.trim(),
        householdId: form.householdId || null,
        relationToHead: form.householdId ? form.relationToHead : null,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setActionError(err.message || "Failed to save inhabitant.");
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 1500,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        id="tour-encoding-drawer"
        style={{
          width: "100%",
          maxWidth: "520px",
          backgroundColor: "var(--color-bg-card, #ffffff)",
          height: "100%",
          boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--color-border, #e2e8f0)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "1.2rem",
                fontWeight: "bold",
                color: "var(--color-text, #1b2430)",
              }}
            >
              👤 Register New Inhabitant
            </h3>
            <span style={{ fontSize: "0.75rem", color: "var(--cbms-muted, #64748b)" }}>
              Citizen Profiling & Household Linking
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: isPending ? "not-allowed" : "pointer",
              color: "var(--cbms-muted, #64748b)",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {actionError && (
            <div style={{ marginBottom: "1rem" }}>
              <Alert tone="danger">{actionError}</Alert>
            </div>
          )}

          <form onSubmit={submitForm} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <DrawerIdentityFields form={form} setForm={setForm} disabled={isPending} />

            <DrawerHouseholdPicker
              form={form}
              setForm={setForm}
              households={households}
              disabled={isPending}
            />

            <DrawerSectoralFields form={form} setForm={setForm} disabled={isPending} />

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                justifyContent: "flex-end",
                marginTop: "1.5rem",
                borderTop: "1px solid var(--color-border, #e2e8f0)",
                paddingTop: "1rem",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="cbms-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="cbms-btn cbms-btn--primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: isPending ? "not-allowed" : "pointer",
                  opacity: isPending ? 0.85 : 1,
                  minWidth: 160,
                  justifyContent: "center",
                }}
              >
                {isPending ? (
                  <>
                    <svg
                      style={{
                        width: 14,
                        height: 14,
                        animation: "cbms-spin 0.75s linear infinite",
                        flexShrink: 0,
                      }}
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeOpacity="0.3"
                      />
                      <path
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Saving Inhabitant…</span>
                  </>
                ) : (
                  <span>Save Inhabitant</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
