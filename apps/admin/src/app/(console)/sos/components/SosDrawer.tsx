"use client";

import * as React from "react";
import { SOS_KINDS, SOS_KIND_ICON } from "../../../../lib/labels";
import { InhabitantSelectDropdown } from "../../blotter/components/InhabitantSelectDropdown";
import type { Inhabitant } from "../../../../lib/types";

export interface SosDrawerFormData {
  inhabitantId?: string | null;
  kind: string;
  latitude?: number | null;
  longitude?: number | null;
  note: string;
  isTest: boolean;
}

export interface SosDrawerProps {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onSubmit: (formData: SosDrawerFormData) => Promise<void>;
}

export function SosDrawer({ open, busy, onClose, onSubmit }: SosDrawerProps) {
  const [kind, setKind] = React.useState<string>("general");
  const [inhabitantId, setInhabitantId] = React.useState<string | null>(null);
  const [inhabitantName, setInhabitantName] = React.useState<string>("");
  const [latitude, setLatitude] = React.useState<string>("");
  const [longitude, setLongitude] = React.useState<string>("");
  const [note, setNote] = React.useState<string>("");
  const [isTest, setIsTest] = React.useState<boolean>(false);
  const [locating, setLocating] = React.useState<boolean>(false);
  const [gpsError, setGpsError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setKind("general");
      setInhabitantId(null);
      setInhabitantName("");
      setLatitude("");
      setLongitude("");
      setNote("");
      setIsTest(false);
      setGpsError(null);
    }
  }, [open]);

  if (!open) return null;

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      (err) => {
        setGpsError(err.message || "Failed to acquire GPS fix");
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectInhabitant = (inh: Inhabitant) => {
    setInhabitantId(inh.id);
    setInhabitantName(`${inh.firstName} ${inh.lastName}`);
  };

  const handleClearInhabitant = () => {
    setInhabitantId(null);
    setInhabitantName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (note.trim().length < 3) return;

    const latNum = latitude.trim() !== "" ? parseFloat(latitude) : undefined;
    const lngNum = longitude.trim() !== "" ? parseFloat(longitude) : undefined;

    await onSubmit({
      inhabitantId: inhabitantId || undefined,
      kind,
      latitude: latNum,
      longitude: lngNum,
      note: note.trim(),
      isTest,
    });
  };

  const isFormValid = note.trim().length >= 3;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(2px)",
        zIndex: 2200,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sos-drawer-title"
        style={{
          width: "100%",
          maxWidth: "460px",
          height: "100%",
          backgroundColor: "var(--color-bg-card, #ffffff)",
          borderLeft: "1px solid var(--color-border, #e2e8f0)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--color-border, #e2e8f0)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#fef2f2",
          }}
        >
          <div>
            <h2
              id="sos-drawer-title"
              style={{
                margin: 0,
                fontSize: "1.2rem",
                fontWeight: 700,
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>🚨</span>
              <span>Trigger Emergency SOS</span>
            </h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "#991b1b" }}>
              Immediate tanod & responder dispatch alert
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.25rem",
              cursor: busy ? "not-allowed" : "pointer",
              color: "var(--cbms-muted, #64748b)",
              padding: "4px 8px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Drawer Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {/* Emergency Kind */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: "var(--color-text, #1b2430)",
              }}
            >
              Emergency Classification <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {SOS_KINDS.map((k) => {
                const selected = kind === k;
                const icon = SOS_KIND_ICON[k] ?? "🚨";
                return (
                  <button
                    key={k}
                    type="button"
                    disabled={busy}
                    onClick={() => setKind(k)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                      padding: "8px 4px",
                      borderRadius: "6px",
                      border: selected ? "2px solid #dc2626" : "1px solid var(--color-border, #cbd5e1)",
                      backgroundColor: selected ? "#fee2e2" : "var(--color-bg-subtle, #f8fafc)",
                      cursor: busy ? "not-allowed" : "pointer",
                      fontWeight: selected ? 700 : 500,
                      color: selected ? "#991b1b" : "var(--color-text, #1b2430)",
                      fontSize: "11px",
                      textTransform: "capitalize",
                    }}
                  >
                    <span style={{ fontSize: "1.25rem" }}>{icon}</span>
                    <span>{k}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Caller / Resident Search with Lazy Loading */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: "var(--color-text, #1b2430)",
              }}
            >
              Caller / Inhabitant (Optional)
            </label>
            <InhabitantSelectDropdown
              value={inhabitantName}
              selectedInhabitantId={inhabitantId || undefined}
              onSelect={handleSelectInhabitant}
              onClear={handleClearInhabitant}
              disabled={busy}
            />
          </div>

          {/* Location Coordinates & GPS */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label
                style={{
                  margin: 0,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--color-text, #1b2430)",
                }}
              >
                Coordinates (GPS)
              </label>
              <button
                type="button"
                disabled={busy || locating}
                onClick={handleGetCurrentLocation}
                style={{
                  background: "none",
                  border: "none",
                  color: "#0369a1",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: busy || locating ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span>📍</span>
                <span>{locating ? "Acquiring..." : "Get current GPS"}</span>
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div>
                <input
                  type="number"
                  step="0.000001"
                  className="cbms-input"
                  disabled={busy}
                  placeholder="Latitude (e.g. 14.5781)"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  style={{ width: "100%", fontSize: "12px" }}
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.000001"
                  className="cbms-input"
                  disabled={busy}
                  placeholder="Longitude (e.g. 121.0345)"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  style={{ width: "100%", fontSize: "12px" }}
                />
              </div>
            </div>
            {gpsError && (
              <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#dc2626" }}>
                {gpsError}
              </p>
            )}
          </div>

          {/* Emergency Note / Situation */}
          <div>
            <label
              htmlFor="sos-note-input"
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: "var(--color-text, #1b2430)",
              }}
            >
              Situation Note / Details <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <textarea
              id="sos-note-input"
              required
              rows={3}
              className="cbms-input"
              disabled={busy}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe emergency, specific landmarks, injuries, or assistance required (min 3 chars)..."
              style={{ width: "100%", resize: "vertical" }}
            />
            {note.trim().length > 0 && note.trim().length < 3 && (
              <span style={{ fontSize: "11px", color: "#d97706" }}>
                Note must be at least 3 characters
              </span>
            )}
          </div>

          {/* Drill / Test Mode */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 12px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
            }}
          >
            <input
              id="is-test-checkbox"
              type="checkbox"
              disabled={busy}
              checked={isTest}
              onChange={(e) => setIsTest(e.target.checked)}
              style={{ width: 16, height: 16, cursor: "pointer" }}
            />
            <label
              htmlFor="is-test-checkbox"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--color-text, #1b2430)",
                cursor: "pointer",
              }}
            >
              Simulation / Drill Mode (Does not alert emergency sirens)
            </label>
          </div>

          {/* Drawer Actions */}
          <div
            style={{
              marginTop: "auto",
              paddingTop: "1rem",
              borderTop: "1px solid var(--color-border, #e2e8f0)",
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
            }}
          >
            <button
              type="button"
              className="cbms-button"
              disabled={busy}
              onClick={onClose}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                border: "1px solid var(--color-border, #cbd5e1)",
                background: "transparent",
                cursor: busy ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid || busy}
              style={{
                backgroundColor: isFormValid && !busy ? "#dc2626" : "#fca5a5",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                padding: "0.5rem 1.25rem",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: isFormValid && !busy ? "pointer" : "not-allowed",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: isFormValid ? "0 2px 4px rgba(220, 38, 38, 0.25)" : "none",
              }}
            >
              {busy && (
                <span
                  style={{
                    display: "inline-block",
                    width: 13,
                    height: 13,
                    border: "2px solid rgba(255, 255, 255, 0.4)",
                    borderTopColor: "#ffffff",
                    borderRadius: "50%",
                    animation: "cbms-spin 0.8s linear infinite",
                  }}
                />
              )}
              <span>{busy ? "Broadcasting..." : "🚨 Broadcast Alert"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
