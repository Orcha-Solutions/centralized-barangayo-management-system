"use client";

import * as React from "react";
import { Alert, Button, Field } from "@cbms/ui";
import type { TenantInfo } from "@cbms/api-client";
import { useDeleteTenantMutation } from "../../../../../lib/rbac-queries";

interface DeleteBarangayModalProps {
  open: boolean;
  onClose: () => void;
  tenant: TenantInfo;
  onSuccess: () => void;
}

export function DeleteBarangayModal({
  open,
  onClose,
  tenant,
  onSuccess,
}: DeleteBarangayModalProps) {
  const [typedConfirmation, setTypedConfirmation] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isTriggered, setIsTriggered] = React.useState(false);
  const deleteMutation = useDeleteTenantMutation();

  React.useEffect(() => {
    if (open) {
      setTypedConfirmation("");
      setErrorMessage(null);
      setIsTriggered(false);
    }
  }, [open]);

  if (!open) return null;

  const targetName = tenant.name.trim();
  const isMatch = typedConfirmation.trim().toLowerCase() === targetName.toLowerCase();
  const isDeleting = deleteMutation.isPending || isTriggered;

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    if (!isMatch || isDeleting) return;

    setIsTriggered(true);
    setErrorMessage(null);
    try {
      await deleteMutation.mutateAsync(tenant.id);
      onSuccess();
    } catch (err: any) {
      setIsTriggered(false);
      setErrorMessage(err?.message || "Failed to delete barangay workspace.");
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-barangay-title"
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#ffffff",
          borderRadius: 12,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid #fee2e2",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #fee2e2",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#fef2f2",
          }}
        >
          <h3
            id="delete-barangay-title"
            style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#991b1b" }}
          >
            ⚠️ Delete Barangay Workspace
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              cursor: isDeleting ? "not-allowed" : "pointer",
              color: "#991b1b",
              lineHeight: 1,
            }}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleDelete} style={{ padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <Alert tone="danger">
              <strong>CRITICAL WARNING:</strong> This action is completely permanent and cannot be
              undone. Deleting <strong>{tenant.name}</strong> (<code>{tenant.id}</code>) will
              permanently erase its multi-tenant routing, database records, inhabitant profiles,
              and revoke access for all assigned officials.
            </Alert>
          </div>

          {errorMessage && (
            <div style={{ marginBottom: 16 }}>
              <Alert tone="danger">{errorMessage}</Alert>
            </div>
          )}

          <p style={{ margin: "0 0 12px", fontSize: 14, color: "#334155", lineHeight: 1.5 }}>
            To verify you want to delete this workspace, please type{" "}
            <strong style={{ color: "#991b1b", userSelect: "all" }}>{targetName}</strong> below:
          </p>

          <Field label="Type the barangay name to confirm">
            <input
              type="text"
              autoFocus
              className="cbms-input"
              value={typedConfirmation}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTypedConfirmation(e.target.value)
              }
              placeholder={targetName}
              disabled={isDeleting}
              style={{
                borderColor: typedConfirmation && !isMatch ? "#ef4444" : undefined,
                fontWeight: 600,
              }}
            />
          </Field>

          <div
            style={{
              marginTop: 24,
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              borderTop: "1px solid #f1f5f9",
              paddingTop: 16,
            }}
          >
            <Button type="button" onClick={onClose} disabled={isDeleting}>
              Cancel
            </Button>
            <button
              type="submit"
              disabled={!isMatch || isDeleting}
              className="cbms-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: isMatch && !isDeleting ? "#dc2626" : "#fca5a5",
                color: "#ffffff",
                borderColor: isMatch && !isDeleting ? "#dc2626" : "#fca5a5",
                cursor: isMatch && !isDeleting ? "pointer" : "not-allowed",
                fontWeight: 600,
                opacity: isDeleting ? 0.85 : 1,
                minWidth: 220,
              }}
            >
              {isDeleting ? (
                <>
                  <svg
                    style={{
                      width: 15,
                      height: 15,
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
                  <span>Deleting Barangay…</span>
                </>
              ) : (
                <span>Permanently Delete Barangay</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
