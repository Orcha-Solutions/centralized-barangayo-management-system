"use client";

import * as React from "react";
import { ApiError, post, useApi } from "@cbms/api-client";
import {
  Button,
  Chip,
  DataTable,
  Field,
  PageHead,
  Panel,
  StatCard,
  StatGrid,
  StatusChip,
  Toolbar,
  date,
  titleize,
} from "@cbms/ui";
import { Async, ActionResult } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import type { Inhabitant, Paged } from "../../../lib/types";

interface CivilRegistryRecord {
  id: string;
  barangayId: string;
  recordType: "birth" | "marriage" | "death";
  registryNo: string;
  registeredAt: string;
  inhabitantId?: string;
  childName?: string;
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  groomName?: string;
  brideName?: string;
  dateOfMarriage?: string;
  placeOfMarriage?: string;
  deceasedName?: string;
  dateOfDeath?: string;
  causeOfDeath?: string;
  placeOfDeath?: string;
  remarks?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CivilRegistryPage() {
  const { can } = useConsole();
  const mayEncode = can("inhabitants:view");

  const [search, setSearch] = React.useState("");
  const [q, setQ] = React.useState("");
  const [filterType, setFilterType] = React.useState("all");

  const list = useApi<CivilRegistryRecord[]>("/civil-registry");
  const inhabitantsList = useApi<Paged<Inhabitant>>("/inhabitants?pageSize=100");

  const [showModal, setShowModal] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    recordType: "birth" as "birth" | "marriage" | "death",
    registryNo: "",
    inhabitantId: "",
    childName: "",
    fatherName: "",
    motherName: "",
    dateOfBirth: "",
    placeOfBirth: "",
    groomName: "",
    brideName: "",
    dateOfMarriage: "",
    placeOfMarriage: "",
    deceasedName: "",
    dateOfDeath: "",
    causeOfDeath: "",
    placeOfDeath: "",
    remarks: ""
  });

  const records = list.data || [];
  const citizens = inhabitantsList.data?.items || [];

  const filtered = records.filter((r) => {
    const matchesType = filterType === "all" || r.recordType === filterType;
    const nameStr = (
      r.childName ||
      r.groomName ||
      r.brideName ||
      r.deceasedName ||
      ""
    ).toLowerCase();
    const matchesSearch =
      r.registryNo.toLowerCase().includes(search.toLowerCase()) ||
      nameStr.includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const births = records.filter((r) => r.recordType === "birth").length;
  const marriages = records.filter((r) => r.recordType === "marriage").length;
  const deaths = records.filter((r) => r.recordType === "death").length;

  async function registerEvent(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const created = await post<CivilRegistryRecord>("/civil-registry", {
        ...form,
        registeredAt: new Date().toISOString()
      });
      setOk(`Registry entry #${created.registryNo} logged successfully.`);
      setShowModal(false);
      setForm({
        recordType: "birth",
        registryNo: "",
        inhabitantId: "",
        childName: "",
        fatherName: "",
        motherName: "",
        dateOfBirth: "",
        placeOfBirth: "",
        groomName: "",
        brideName: "",
        dateOfMarriage: "",
        placeOfMarriage: "",
        deceasedName: "",
        dateOfDeath: "",
        causeOfDeath: "",
        placeOfDeath: "",
        remarks: ""
      });
      list.reload();
    } catch (err) {
      setError((err as ApiError)?.message || "Failed to register civil event.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title="Civil Registry Ledger"
        subtitle="Barangay census and vital events registration logging local Births, Marriages, and Deaths."
        breadcrumb="Residents (BIPS)"
        parity="BAMS"
        actions={
          mayEncode ? (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="cbms-btn cbms-btn--primary"
            >
              + Register Event
            </button>
          ) : undefined
        }
      />

      <ActionResult error={error} success={ok} />

      <StatGrid>
        <StatCard label="Registered Births" value={births} icon="👶" tone="green" />
        <StatCard label="Registered Marriages" value={marriages} icon="💍" tone="navy" />
        <StatCard label="Registered Deaths" value={deaths} icon="✝️" tone="red" />
      </StatGrid>

      <Panel padded={false}>
        <Toolbar>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(q.trim());
            }}
            style={{ display: "flex", gap: 8 }}
          >
            <input
              className="cbms-input cbms-input--search"
              placeholder="Search registry number or names…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Button type="submit">Search</Button>
          </form>
          <select
            className="cbms-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All event types</option>
            <option value="birth">Births</option>
            <option value="marriage">Marriages</option>
            <option value="death">Deaths</option>
          </select>
        </Toolbar>

        <Async loading={list.loading} error={list.error}>
          <DataTable
            columns={[
              {
                key: "registryNo",
                header: "Registry No",
                render: (r) => (
                  <>
                    <div className="cbms-table__primary">{r.registryNo}</div>
                    <div className="cbms-table__muted">{date(r.registeredAt)}</div>
                  </>
                )
              },
              {
                key: "recordType",
                header: "Event Type",
                render: (r) => (
                  <Chip
                    tone={r.recordType === "birth" ? "green" : r.recordType === "marriage" ? "navy" : "red"}
                  >
                    {titleize(r.recordType)}
                  </Chip>
                )
              },
              {
                key: "principals",
                header: "Principals / Subject",
                render: (r) => {
                  if (r.recordType === "birth") return `Child: ${r.childName || "—"}`;
                  if (r.recordType === "marriage") return `Spouses: ${r.groomName || "—"} & ${r.brideName || "—"}`;
                  return `Deceased: ${r.deceasedName || "—"}`;
                }
              },
              {
                key: "remarks",
                header: "Remarks",
                render: (r) => r.remarks || "—"
              }
            ]}
            rows={filtered}
            empty="No registry entries match this filter."
          />
        </Async>
      </Panel>

      {/* Register Event Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "grid",
            placeItems: "center",
            zIndex: 2000
          }}
        >
          <div
            style={{
              backgroundColor: "var(--color-bg-card, #ffffff)",
              border: "1px solid var(--color-border, #e2e8f0)",
              borderRadius: "0.5rem",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "480px",
              display: "flex",
              flexDirection: "column",
              gap: "1rem"
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1.1rem", borderBottom: "1px solid var(--color-border, #e2e8f0)", paddingBottom: "0.5rem", color: "var(--color-text, #1b2430)" }}>
              Register Civil Event
            </h3>

            <form onSubmit={registerEvent} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Event Type</label>
                <select
                  className="cbms-select"
                  value={form.recordType}
                  onChange={(e) => setForm((prev) => ({ ...prev, recordType: e.target.value as any }))}
                  required
                >
                  <option value="birth">👶 Birth</option>
                  <option value="marriage">💍 Marriage</option>
                  <option value="death">✝️ Death</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Registry Reference No (LCR)</label>
                <input
                  className="cbms-input"
                  value={form.registryNo}
                  onChange={(e) => setForm((prev) => ({ ...prev, registryNo: e.target.value }))}
                  placeholder="LCR-2026-0056"
                  required
                />
              </div>

              {form.recordType === "birth" && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Child Full Name</label>
                    <input
                      className="cbms-input"
                      value={form.childName}
                      onChange={(e) => setForm((prev) => ({ ...prev, childName: e.target.value }))}
                      required
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Date of Birth</label>
                    <input
                      className="cbms-input"
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => setForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                      required
                    />
                  </div>
                </>
              )}

              {form.recordType === "marriage" && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Groom's Full Name</label>
                    <input
                      className="cbms-input"
                      value={form.groomName}
                      onChange={(e) => setForm((prev) => ({ ...prev, groomName: e.target.value }))}
                      required
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Bride's Full Name</label>
                    <input
                      className="cbms-input"
                      value={form.brideName}
                      onChange={(e) => setForm((prev) => ({ ...prev, brideName: e.target.value }))}
                      required
                    />
                  </div>
                </>
              )}

              {form.recordType === "death" && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Resident Profile (If registered)</label>
                    <select
                      className="cbms-select"
                      value={form.inhabitantId}
                      onChange={(e) => {
                        const citizen = citizens.find(c => c.id === e.target.value);
                        setForm((prev) => ({
                          ...prev,
                          inhabitantId: e.target.value,
                          deceasedName: citizen ? `${citizen.firstName} ${citizen.lastName}` : ""
                        }));
                      }}
                    >
                      <option value="">Select Deceased Inhabitant...</option>
                      {citizens.filter(c => c.isDeceased !== true).map(c => (
                        <option key={c.id} value={c.id}>
                          {c.firstName} {c.lastName} (Born {c.birthDate})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Deceased Full Name</label>
                    <input
                      className="cbms-input"
                      value={form.deceasedName}
                      onChange={(e) => setForm((prev) => ({ ...prev, deceasedName: e.target.value }))}
                      required
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Cause of Death</label>
                    <input
                      className="cbms-input"
                      value={form.causeOfDeath}
                      onChange={(e) => setForm((prev) => ({ ...prev, causeOfDeath: e.target.value }))}
                      required
                    />
                  </div>
                </>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Remarks</label>
                <input
                  className="cbms-input"
                  value={form.remarks}
                  onChange={(e) => setForm((prev) => ({ ...prev, remarks: e.target.value }))}
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cbms-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="cbms-btn cbms-btn--primary"
                >
                  {busy ? "Registering..." : "Log Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
