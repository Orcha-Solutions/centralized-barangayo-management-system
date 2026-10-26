"use client";

import * as React from "react";
import { Alert, Field, fullName } from "@cbms/ui";
import { useApi, qs } from "@cbms/api-client";
import { APPOINTMENT_SERVICES } from "./AppointmentToolbar";
import { APPOINTMENT_STATUSES } from "../../../../lib/labels";
import type { Appointment, Inhabitant, Paged } from "../../../../lib/types";

export interface AppointmentDrawerFormData {
  service: string;
  scheduledAt: string;
  inhabitantId?: string;
  queueNumber?: string;
  status?: string;
  notes?: string;
}

export interface AppointmentDrawerProps {
  open: boolean;
  editingAppointment?: Appointment | null;
  initialDate?: Date | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentDrawerFormData) => Promise<void>;
}

export function AppointmentDrawer({
  open,
  editingAppointment,
  initialDate,
  busy,
  onClose,
  onSubmit,
}: AppointmentDrawerProps) {
  const isEditing = Boolean(editingAppointment);

  const [service, setService] = React.useState(APPOINTMENT_SERVICES[0]);
  const [scheduledAt, setScheduledAt] = React.useState("");
  const [queueNumber, setQueueNumber] = React.useState("");
  const [status, setStatus] = React.useState("booked");
  const [notes, setNotes] = React.useState("");
  const [pickedInhabitant, setPickedInhabitant] = React.useState<Inhabitant | null>(null);

  // Inhabitant Search State
  const [personQ, setPersonQ] = React.useState("");
  const [personSearch, setPersonSearch] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const people = useApi<Paged<Inhabitant>>(
    personSearch ? `/inhabitants${qs({ q: personSearch, pageSize: 6 })}` : null
  );

  React.useEffect(() => {
    if (open) {
      if (editingAppointment) {
        setService(editingAppointment.service || APPOINTMENT_SERVICES[0]);
        // Format ISO to datetime-local (YYYY-MM-DDTHH:mm)
        try {
          const d = new Date(editingAppointment.scheduledAt);
          const pad = (n: number) => String(n).padStart(2, "0");
          const localStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
          setScheduledAt(localStr);
        } catch {
          setScheduledAt("");
        }
        setQueueNumber(editingAppointment.queueNumber || "");
        setStatus(editingAppointment.status || "booked");
        setNotes(editingAppointment.notes || "");
        if (editingAppointment.inhabitant) {
          setPickedInhabitant({
            id: editingAppointment.inhabitantId || "",
            firstName: editingAppointment.inhabitant.firstName,
            lastName: editingAppointment.inhabitant.lastName,
          } as Inhabitant);
        } else {
          setPickedInhabitant(null);
        }
      } else {
        // Defaults for new booking
        setService(APPOINTMENT_SERVICES[0]);
        // Default to initialDate or tomorrow 9:00 AM
        const targetDate = initialDate ? new Date(initialDate) : new Date();
        if (!initialDate) {
          targetDate.setDate(targetDate.getDate() + 1);
        }
        targetDate.setHours(9, 0, 0, 0);
        const pad = (n: number) => String(n).padStart(2, "0");
        setScheduledAt(`${targetDate.getFullYear()}-${pad(targetDate.getMonth() + 1)}-${pad(targetDate.getDate())}T09:00`);
        setQueueNumber("");
        setStatus("booked");
        setNotes("");
        setPickedInhabitant(null);
      }
      setPersonQ("");
      setPersonSearch("");
      setErrorMsg(null);
    }
  }, [open, editingAppointment, initialDate]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service.trim() || !scheduledAt) {
      setErrorMsg("Please select a service and scheduled date/time.");
      return;
    }

    try {
      setErrorMsg(null);
      await onSubmit({
        service: service.trim(),
        scheduledAt: new Date(scheduledAt).toISOString(),
        inhabitantId: pickedInhabitant?.id || undefined,
        queueNumber: queueNumber.trim() || undefined,
        status,
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save appointment.");
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
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1500,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          backgroundColor: "#ffffff",
          height: "100%",
          boxShadow: "-6px 0 25px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--color-border, #e2e8f0)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "var(--color-bg-subtle, #f8fafc)",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#0f172a" }}>
              {isEditing ? "✏️ Edit Appointment" : "📅 Book Citizen Appointment"}
            </h3>
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
              Republic Act 11032 Citizen&apos;s Charter &bull; Anti-Red Tape Authority
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.25rem",
              cursor: "pointer",
              color: "#64748b",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {errorMsg && (
            <div style={{ marginBottom: "1rem" }}>
              <Alert tone="danger">{errorMsg}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Field label="Barangay Service Requested *">
              <select
                className="cbms-input"
                value={service}
                onChange={(e) => setService(e.target.value)}
                required
              >
                {APPOINTMENT_SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Scheduled Date & Time *">
              <input
                className="cbms-input"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />
            </Field>

            {isEditing && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Field label="Queue Number">
                  <input
                    className="cbms-input"
                    type="text"
                    value={queueNumber}
                    placeholder="Auto-generated if left empty"
                    onChange={(e) => setQueueNumber(e.target.value)}
                  />
                </Field>

                <Field label="Ticket Status">
                  <select
                    className="cbms-input"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {APPOINTMENT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            )}

            <Field label="Registered Resident (Optional)">
              {pickedInhabitant ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                  <span
                    style={{
                      backgroundColor: "#e0f2fe",
                      color: "#0369a1",
                      padding: "0.3rem 0.75rem",
                      borderRadius: "0.375rem",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    👤 {pickedInhabitant.firstName} {pickedInhabitant.lastName}
                  </span>
                  <button
                    type="button"
                    className="cbms-btn"
                    style={{ fontSize: "0.78rem", padding: "0.2rem 0.5rem" }}
                    onClick={() => setPickedInhabitant(null)}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      type="text"
                      className="cbms-input"
                      placeholder="Search resident by name or PhilSys no..."
                      value={personQ}
                      onChange={(e) => setPersonQ(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          setPersonSearch(personQ.trim());
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="cbms-btn"
                      onClick={() => setPersonSearch(personQ.trim())}
                    >
                      Search
                    </button>
                  </div>

                  {personSearch && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.25rem" }}>
                      {people.loading && <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Searching...</span>}
                      {!people.loading && !people.data?.items?.length && (
                        <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          No registered resident matches &ldquo;{personSearch}&rdquo;.
                        </span>
                      )}
                      {(people.data?.items ?? []).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="cbms-btn"
                          style={{ fontSize: "0.78rem", padding: "0.25rem 0.5rem" }}
                          onClick={() => {
                            setPickedInhabitant(p);
                            setPersonSearch("");
                          }}
                        >
                          👤 {fullName(p)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Field>

            <Field label="Transaction Notes / Specific Inquiries">
              <textarea
                className="cbms-input"
                rows={3}
                placeholder="Specific requirements, documentary purposes, or counter inquiries..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Field>

            <div
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "0.375rem",
                padding: "0.75rem",
                fontSize: "0.8rem",
                color: "#64748b",
                lineHeight: 1.5,
              }}
            >
              ℹ️ <strong>RA 11032 Ease of Doing Business:</strong> Check-in upon arrival at the counter stamps the official processing clock. The auditable queue time counts toward Citizen Satisfaction Measurement (CSM).
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
              <button
                type="button"
                className="cbms-btn"
                disabled={busy}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cbms-btn cbms-btn--primary"
                disabled={busy || !service || !scheduledAt}
                style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
              >
                {busy && <span style={{ animation: "spin 1s linear infinite" }}>🔄</span>}
                <span>{busy ? "Saving..." : isEditing ? "Update Appointment" : "Book Appointment"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
