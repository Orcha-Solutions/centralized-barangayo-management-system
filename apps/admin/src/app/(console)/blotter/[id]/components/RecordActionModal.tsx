"use client";

import * as React from "react";
import { Alert, Field } from "@cbms/ui";
import type { BlotterActionLog } from "../../../../../lib/types";

export interface RecordActionFormData {
  actionTitle: string;
  officerName: string;
  officerRole: string;
  statusAfter: string;
  documentRef: string;
  notes: string;
}

export interface RecordActionModalProps {
  open: boolean;
  onClose: () => void;
  entryNo: string;
  location: string;
  defaultOfficerName: string;
  defaultOfficerRole: string;
  actionToEdit?: BlotterActionLog | null;
  initialActionTitle?: string;
  initialStatusAfter?: string;
  initialDocumentRef?: string;
  onSubmit: (data: RecordActionFormData) => Promise<void>;
}

export function RecordActionModal({
  open,
  onClose,
  entryNo,
  location,
  defaultOfficerName,
  defaultOfficerRole,
  actionToEdit = null,
  initialActionTitle = "",
  initialStatusAfter = "active",
  initialDocumentRef = "",
  onSubmit,
}: RecordActionModalProps) {
  const isEditing = Boolean(actionToEdit);

  const [actionTitle, setActionTitle] = React.useState("");
  const [officerName, setOfficerName] = React.useState("");
  const [officerRole, setOfficerRole] = React.useState("");
  const [statusAfter, setStatusAfter] = React.useState("active");
  const [documentRef, setDocumentRef] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      if (actionToEdit) {
        setActionTitle(actionToEdit.actionTaken || "");
        setOfficerName(actionToEdit.officerName || defaultOfficerName);
        setOfficerRole(actionToEdit.officerRole || defaultOfficerRole);
        setStatusAfter(actionToEdit.statusAfter || "active");
        setDocumentRef(actionToEdit.documentRef || "");
        setNotes(actionToEdit.notes || "");
      } else {
        setActionTitle(initialActionTitle);
        setOfficerName(defaultOfficerName);
        setOfficerRole(defaultOfficerRole);
        setStatusAfter(initialStatusAfter);
        setDocumentRef(initialDocumentRef);
        setNotes("");
      }
      setErrorMsg(null);
    }
  }, [open, actionToEdit, initialActionTitle, initialStatusAfter, initialDocumentRef, defaultOfficerName, defaultOfficerRole]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTitle.trim() || !notes.trim()) {
      setErrorMsg("Please provide an action title and detailed notes.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onSubmit({
        actionTitle: actionTitle.trim(),
        officerName: officerName.trim() || defaultOfficerName,
        officerRole: officerRole.trim() || defaultOfficerRole,
        statusAfter,
        documentRef: documentRef.trim(),
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to record barangay action.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "0.75rem",
          maxWidth: 580,
          width: "100%",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1.25rem 1.5rem",
            backgroundColor: "var(--color-primary, #0369a1)",
            color: "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
              {isEditing ? "✏️ Edit Barangay Action / Intervention" : "🛡️ Record Barangay Action / Intervention"}
            </h3>
            <div style={{ fontSize: "0.8rem", opacity: 0.9, marginTop: "0.2rem" }}>
              Docket: {entryNo} &bull; {location}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#ffffff",
              fontSize: "1.25rem",
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "1.5rem" }}>
          {errorMsg && (
            <div style={{ marginBottom: "1rem" }}>
              <Alert tone="danger">{errorMsg}</Alert>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Field label="Action Taken / Intervention Title">
              <input
                type="text"
                className="cbms-input"
                list="action-suggestions"
                placeholder="e.g., Tanod Mobile Patrol Dispatched / Summons Issued / BPO Issued"
                value={actionTitle}
                onChange={(e) => setActionTitle(e.target.value)}
                required
              />
              <datalist id="action-suggestions">
                <option value="Initial Intake & Sworn Narrative Recorded" />
                <option value="Tanod Mobile Patrol Unit Dispatched" />
                <option value="Ocular Inspection & Purok Validation" />
                <option value="Summons / Notice of Hearing Issued (KP Form 7)" />
                <option value="Barangay Protection Order (BPO) Issued" />
                <option value="Medical Examination Referral Issued" />
                <option value="DSWD / CSWDO Case Endorsement" />
                <option value="Police Endorsement & Evidence Transmittal" />
                <option value="Verbal Warning & Voluntary Compliance" />
                <option value="Amicable Settlement Reached (KP-16)" />
                <option value="Case Closed & Archived" />
              </datalist>
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <Field label="Acting Officer Name">
                <input
                  type="text"
                  className="cbms-input"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  required
                />
              </Field>

              <Field label="Officer Role / Department">
                <input
                  type="text"
                  className="cbms-input"
                  value={officerRole}
                  onChange={(e) => setOfficerRole(e.target.value)}
                  required
                />
              </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <Field label="Resulting Status">
                <select
                  className="cbms-input"
                  value={statusAfter}
                  onChange={(e) => setStatusAfter(e.target.value)}
                >
                  <option value="active">Active / Open</option>
                  <option value="in_progress">In Progress / Investigating</option>
                  <option value="under_mediation">Under Mediation (KP)</option>
                  <option value="bpo_issued">Barangay Protection Order (BPO) Issued</option>
                  <option value="referred_pnp">Referred to PNP</option>
                  <option value="endorsed">Endorsed to CSWDO / External Agency</option>
                  <option value="resolved">Resolved / Closed</option>
                </select>
              </Field>

              <Field label="Official Document Reference (Optional)">
                <input
                  type="text"
                  className="cbms-input"
                  placeholder="e.g. KP Form 7, BPO #004, CCTV #031"
                  value={documentRef}
                  onChange={(e) => setDocumentRef(e.target.value)}
                />
              </Field>
            </div>

            <Field label="Operational Notes & Actions Performed">
              <textarea
                className="cbms-input"
                rows={4}
                placeholder="Describe the specific steps taken, findings during inspection, response of parties, or terms agreed upon..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
              />
            </Field>
          </div>

          <div
            style={{
              marginTop: "1.5rem",
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
            }}
          >
            <button
              type="button"
              className="cbms-btn"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cbms-btn cbms-btn--primary"
              disabled={submitting}
            >
              {submitting ? "Saving..." : isEditing ? "💾 Update Action" : "💾 Save & Update History"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
