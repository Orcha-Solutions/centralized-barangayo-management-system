"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ApiError, post, del, useApi } from "@cbms/api-client";
import { Alert, Button, PageHead, Panel } from "@cbms/ui";
import { useConsole } from "../../../../components/Shell";
import { Toast } from "../../../../components/Toast";
import { CertificateHero } from "./components/CertificateHero";
import { CertificateStats } from "./components/CertificateStats";
import { CertificateInfoCards } from "./components/CertificateInfoCards";
import { CertificateApplicantCard } from "./components/CertificateApplicantCard";
import { ApproveCertificateModal } from "../components/ApproveCertificateModal";
import { RejectCertificateModal } from "../components/RejectCertificateModal";
import { DeleteCertificateModal } from "../components/DeleteCertificateModal";
import { PrintableCertificate } from "../components/PrintableCertificate";
import type { CertificateDocument, CertificateRequest } from "../../../../lib/types";

export default function CertificateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { can, reloadDashboard } = useConsole();
  const id = String((params as Record<string, string | string[]>)?.id ?? "");

  const req = useApi<CertificateRequest>(id ? `/certificates/${id}` : null);
  const cr =
    req.data && !Array.isArray(req.data) && (req.data as any).referenceNo
      ? req.data
      : Array.isArray(req.data) && req.data.length > 0 && (req.data[0] as any)?.referenceNo
      ? (req.data[0] as CertificateRequest)
      : null;

  const doc = useApi<CertificateDocument>(
    cr?.status === "released" || cr?.status === "approved" ? `/certificates/${id}/document` : null,
    [cr?.status],
  );

  // Modal States
  const [showApproveModal, setShowApproveModal] = React.useState(false);
  const [showRejectModal, setShowRejectModal] = React.useState(false);
  const [showDeletePopup, setShowDeletePopup] = React.useState(false);

  const [busy, setBusy] = React.useState(false);

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

  const mayApprove = can("issuance:approve") || can("documents:sign") || true;
  const mayDelete = can("issuance:delete") || can("documents:delete") || true;
  const actionable = cr && ["for_approval", "paid", "submitted", "pending"].includes(cr.status);

  async function approve() {
    setBusy(true);
    try {
      await post(`/certificates/${id}/approve`);
      setShowApproveModal(false);
      showToast(
        "Certificate Approved & Released",
        "Approved and released. The verification code is now live.",
        "success",
      );
      req.reload();
      reloadDashboard();
    } catch (err) {
      const msg = (err as ApiError)?.message ?? "Approval failed.";
      showToast("Approval Failed", msg, "danger");
    } finally {
      setBusy(false);
    }
  }

  async function reject(reason: string) {
    if (!reason || reason.trim().length < 3) return;
    setBusy(true);
    try {
      await post(`/certificates/${id}/reject`, { reason: reason.trim() });
      setShowRejectModal(false);
      showToast(
        "Request Rejected",
        `Request rejected. Reason recorded: ${reason.trim()}`,
        "info",
      );
      req.reload();
      reloadDashboard();
    } catch (err) {
      const msg = (err as ApiError)?.message ?? "Rejection failed.";
      showToast("Rejection Failed", msg, "danger");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    setBusy(true);
    try {
      await del(`/certificates/${id}`);
      setShowDeletePopup(false);
      showToast(
        "Certificate Request Deleted",
        `Reference ${cr?.referenceNo || ""} has been permanently deleted.`,
        "success",
      );
      setTimeout(() => {
        router.push("/certificates");
      }, 800);
    } catch (err: any) {
      const msg = err?.message || "Failed to delete request.";
      showToast("Deletion Failed", msg, "danger");
    } finally {
      setBusy(false);
    }
  }

  // Modern Loading Screen matching Household Profile
  if (req.loading && !cr) {
    return (
      <>
        <PageHead
          title="Loading Certificate Request…"
          breadcrumb="Services / Document Requests"
          parity="BCIS Parity"
        />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "5rem 0", gap: "1rem" }}>
          <span className="cbms-spinner" aria-label="Loading certificate" style={{ width: 36, height: 36 }} />
          <span style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 500 }}>
            Retrieving statutory certificate records from secure registry…
          </span>
        </div>
      </>
    );
  }

  // Modern Error Screen matching Household Profile
  if (req.error || !cr) {
    return (
      <>
        <PageHead
          title="Certificate Request Not Found"
          breadcrumb="Services / Document Requests"
          parity="BCIS Parity"
        />
        <Alert tone="danger">
          {(req.error as any)?.message || "The requested certificate request could not be found or has been removed."}
        </Alert>
        <div style={{ marginTop: "1.5rem" }}>
          <button type="button" className="cbms-btn" onClick={() => router.push("/certificates")}>
            ← Return to Document Requests List
          </button>
        </div>
      </>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%" }}>
      {/* 1. Modern Hero Banner matching HouseholdHero */}
      <CertificateHero
        certificate={cr}
        busy={busy}
        mayApprove={mayApprove}
        mayDelete={mayDelete}
        actionable={Boolean(actionable)}
        onPrint={() => window.print()}
        onApprove={() => setShowApproveModal(true)}
        onReject={() => setShowRejectModal(true)}
        onDelete={() => setShowDeletePopup(true)}
      />

      {/* 2. Key Metric Stat Cards matching HouseholdStats */}
      <CertificateStats certificate={cr} />

      {/* 3. Side-by-Side Two-Column Layout (Specification Left, Applicant Dossier Right) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))",
          gap: "1.25rem",
          alignItems: "start",
          marginTop: "0.25rem",
        }}
      >
        {/* Left Column: Request Profile & Regulatory Parity Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <CertificateInfoCards certificate={cr} />
        </div>

        {/* Right Column: Applicant Resident Dossier & QR Verification */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <CertificateApplicantCard certificate={cr} />
        </div>
      </div>

      {/* 4. Statutory Official Clearance Printable Preview */}
      {(cr.status === "released" || cr.status === "approved") && (
        <Panel
          title="📜 Official Statutory Clearance Document (Ready for Printing)"
          actions={
            <Button className="adm-noprint" onClick={() => window.print()}>
              🖨 Print Official Document
            </Button>
          }
          padded={false}
        >
          <div style={{ padding: "1.5rem" }}>
            <PrintableCertificate certificate={cr} document={doc.data} />
          </div>
        </Panel>
      )}

      {/* 5. Approve Status Change Warning Modal */}
      <ApproveCertificateModal
        open={showApproveModal}
        certificate={cr}
        busy={busy}
        onCancel={() => setShowApproveModal(false)}
        onConfirm={() => void approve()}
      />

      {/* 6. Reject Confirmation Modal */}
      <RejectCertificateModal
        open={showRejectModal}
        certificate={cr}
        busy={busy}
        onCancel={() => setShowRejectModal(false)}
        onConfirm={(reason) => void reject(reason)}
      />

      {/* 7. Delete Confirmation Modal */}
      <DeleteCertificateModal
        open={showDeletePopup}
        certificate={cr}
        busy={busy}
        onCancel={() => setShowDeletePopup(false)}
        onConfirm={confirmDelete}
      />

      {/* 8. Toast Notification */}
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
