"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useInhabitantStore } from "../../../store/inhabitantStore";
import {
  Alert,
  Button,
  DataTable,
  Field,
  PageHead,
  Pagination,
  Panel,
  StatCard,
  StatGrid,
  Toolbar,
  age,
  fullName,
  num,
} from "@cbms/ui";
import { SectorChips, SourceChip } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import { downloadFromApi } from "../../../lib/download";
import { SECTORS } from "../../../lib/labels";
import type { Inhabitant } from "../../../lib/types";

export default function InhabitantsPage() {
  const router = useRouter();
  const { can } = useConsole();
  const mayEncode = can("inhabitants:encode") || can("inhabitants:create");

  // Zustand Store
  const {
    inhabitants,
    loading,
    error: storeError,
    fetchInhabitants,
    addInhabitant,
    updateInhabitant,
    deleteInhabitant,
  } = useInhabitantStore();

  const [q, setQ] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [purok, setPurok] = React.useState("all");
  const [sector, setSector] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 25;

  // Drawer and Form State
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    sex: "male" as const,
    birthDate: "",
    civilStatus: "single",
    citizenship: "Filipino",
    philsysNo: "",
    contactPhone: "",
    contactEmail: "",
    isSenior: false,
    isPwd: false,
    isSoloParent: false,
    is4Ps: false,
    isDeceased: false,
  });


  // Dropdown Action State
  const [showActionsDropdown, setShowActionsDropdown] = React.useState(false);

  const [exporting, setExporting] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchInhabitants();
  }, []);

  // Compute list of unique puroks from inhabitants
  const puroks = React.useMemo(() => {
    const set = new Set<string>();
    for (const inh of inhabitants) {
      const p = inh.household?.purok;
      if (p) set.add(p);
    }
    return Array.from(set).sort();
  }, [inhabitants]);

  // Client-side filtering
  const filtered = React.useMemo(() => {
    return inhabitants.filter((item) => {
      const cName = `${item.firstName} ${item.lastName}`.toLowerCase();
      const matchesSearch =
        !search ||
        cName.includes(search.toLowerCase()) ||
        (item.philsysNo && item.philsysNo.toLowerCase().includes(search.toLowerCase()));
      const matchesPurok = purok === "all" || item.household?.purok === purok;
      const matchesSector =
        sector === "all" ||
        (sector === "senior" && item.isSenior) ||
        (sector === "pwd" && item.isPwd) ||
        (sector === "solo_parent" && item.isSoloParent) ||
        (sector === "4ps" && item.is4Ps) ||
        (sector === "deceased" && item.isDeceased);
      return matchesSearch && matchesPurok && matchesSector;
    });
  }, [inhabitants, search, purok, sector]);

  // Pagination
  const paginated = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  // Dynamic statistics calculations
  const stats = React.useMemo(() => {
    const total = inhabitants.length;
    const householdIds = new Set(inhabitants.map((x) => x.householdId).filter(Boolean));
    const seniors = inhabitants.filter((x) => x.isSenior || (x.birthDate && (age(x.birthDate) ?? 0) >= 60)).length;
    const pwd = inhabitants.filter((x) => x.isPwd).length;
    const fourPs = inhabitants.filter((x) => x.is4Ps).length;
    const voters = inhabitants.filter((x) => x.isVoter).length;
    return { total, households: householdIds.size, seniors, pwd, fourPs, voters };
  }, [inhabitants]);

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(q.trim());
  }

  async function exportRbi() {
    setExporting(true);
    setExportError(null);
    try {
      await downloadFromApi("/inhabitants/export/rbi", "rbi-export.csv");
    } catch (err) {
      setExportError((err as Error).message);
    } finally {
      setExporting(false);
    }
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setActionError(null);
    try {
      if (editingId) {
        await updateInhabitant(editingId, form);
      } else {
        await addInhabitant(form);
      }
      setOpenDrawer(false);
    } catch (err: any) {
      setActionError(err.message || "Failed to save inhabitant.");
    } finally {
      setBusy(false);
    }
  }


  return (
    <>
      <PageHead
        title="Inhabitants"
        subtitle="Record of Barangay Inhabitants (RBI). Manage registry listings, sectoral classifications, and local census."
        breadcrumb="Residents"
        parity="BIPS"
      />

      {exportError && <Alert tone="danger">{exportError}</Alert>}
      {storeError && <Alert tone="danger">{storeError}</Alert>}

      <StatGrid>
        <StatCard label="Total inhabitants" value={num(stats.total)} icon="👥" />
        <StatCard label="Households" value={num(stats.households)} icon="🏠" />
        <StatCard label="Senior citizens" value={num(stats.seniors)} icon="🧓" tone="gold" />
        <StatCard label="PWD" value={num(stats.pwd)} icon="♿" tone="green" />
        <StatCard label="4Ps beneficiaries" value={num(stats.fourPs)} icon="🤝" />
        <StatCard label="Registered voters" value={num(stats.voters)} icon="🗳️" />
      </StatGrid>

      <Panel padded={false}>
        <Toolbar>
          <form onSubmit={applySearch} style={{ display: "flex", gap: 8 }}>
            <input
              className="cbms-input cbms-input--search"
              placeholder="Search name or PhilSys number…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Button type="submit">Search</Button>
          </form>
          <select
            className="cbms-select"
            value={purok}
            onChange={(e) => {
              setPurok(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All puroks</option>
            {puroks.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            className="cbms-select"
            value={sector}
            onChange={(e) => {
              setSector(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All sectors</option>
            {SECTORS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <div className="cbms-toolbar__spacer" />
          <span className="adm-muted" style={{ marginRight: "1rem" }}>{num(filtered.length)} record(s)</span>

          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowActionsDropdown(!showActionsDropdown)}
              className="cbms-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                backgroundColor: "var(--color-bg-card, #fff)",
                border: "1px solid var(--color-border, #e2e8f0)",
                borderRadius: "0.375rem",
                cursor: "pointer"
              }}
            >
              ⚙️ Actions ▾
            </button>
            {showActionsDropdown && (
              <>
                {/* Clickaway overlay */}
                <div 
                  style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }} 
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
                    zIndex: 50,
                    minWidth: "180px",
                    display: "flex",
                    flexDirection: "column",
                    padding: "0.25rem 0"
                  }}
                >
                  {mayEncode && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          firstName: "",
                          middleName: "",
                          lastName: "",
                          suffix: "",
                          sex: "male",
                          birthDate: "",
                          civilStatus: "single",
                          citizenship: "Filipino",
                          philsysNo: "",
                          contactPhone: "",
                          contactEmail: "",
                          isSenior: false,
                          isPwd: false,
                          isSoloParent: false,
                          is4Ps: false,
                          isDeceased: false,
                        });
                        setEditingId(null);
                        setActionError(null);
                        setOpenDrawer(true);
                        setShowActionsDropdown(false);
                      }}
                      style={{
                        padding: "0.6rem 1rem",
                        textAlign: "left",
                        border: "none",
                        background: "none",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "var(--color-text, #1b2430)"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      👤 New Inhabitant
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      exportRbi();
                      setShowActionsDropdown(false);
                    }}
                    disabled={exporting}
                    style={{
                      padding: "0.6rem 1rem",
                      textAlign: "left",
                      border: "none",
                      background: "none",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "var(--color-text, #1b2430)",
                      opacity: exporting ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    {exporting ? "⏳ Exporting…" : "⬇ Export RBI (CSV)"}
                  </button>
                </div>
              </>
            )}
          </div>
        </Toolbar>

        <DataTable
          columns={[
            {
              key: "name",
              header: "Name",
              render: (r) => (
                <>
                  <div className="cbms-table__primary">{fullName(r)}</div>
                  <div className="cbms-table__muted">
                    {r.philsysNo ? `PCN ${r.philsysNo}` : "No PhilSys on file"}
                  </div>
                </>
              ),
            },
            {
              key: "age",
              header: "Age / Sex",
              render: (r) => `${age(r.birthDate) ?? "—"} · ${r.sex === "male" ? "M" : "F"}`,
            },
            {
              key: "purok",
              header: "Purok",
              render: (r) => r.household?.purok ?? "—",
            },
            {
              key: "household",
              header: "Household",
              render: (r) =>
                r.household ? (
                  <>
                    <div>{r.household.householdNo}</div>
                    <div className="cbms-table__muted">{r.household.addressLine ?? ""}</div>
                  </>
                ) : (
                  <span className="cbms-table__muted">Unassigned</span>
                ),
            },
            { key: "sectors", header: "Sectoral", render: (r) => <SectorChips row={r} /> },
            { key: "source", header: "Source", render: (r) => <SourceChip source={r.source} /> },

          ]}
          rows={paginated}
          empty={loading ? "Loading inhabitants..." : "No inhabitants match this filter."}
          onRowClick={(r) => router.push(`/inhabitants/${r.id}/edit`)}
        />

        <Pagination
          page={page}
          pageSize={pageSize}
          total={filtered.length}
          onPage={setPage}
        />
      </Panel>

      {/* Side Slide-Over Content Drawer */}
      {openDrawer && (
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
          onClick={() => setOpenDrawer(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
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
                padding: "1.5rem",
                borderBottom: "1px solid var(--color-border, #e2e8f0)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold", color: "var(--color-text, #1b2430)" }}>
                {editingId ? "✏️ Edit Inhabitant Profile" : "👤 Register New Inhabitant"}
              </h3>
              <button
                type="button"
                onClick={() => setOpenDrawer(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "var(--cbms-muted, #64748b)",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
              {actionError && <Alert tone="danger">{actionError}</Alert>}

              <form onSubmit={submitForm} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <Field label="First Name">
                    <input
                      className="cbms-input"
                      value={form.firstName}
                      onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </Field>
                  <Field label="Middle Name">
                    <input
                      className="cbms-input"
                      value={form.middleName}
                      onChange={(e) => setForm((prev) => ({ ...prev, middleName: e.target.value }))}
                    />
                  </Field>
                  <Field label="Last Name">
                    <input
                      className="cbms-input"
                      value={form.lastName}
                      onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </Field>
                  <Field label="Suffix">
                    <input
                      className="cbms-input"
                      value={form.suffix}
                      placeholder="Jr./III"
                      onChange={(e) => setForm((prev) => ({ ...prev, suffix: e.target.value }))}
                    />
                  </Field>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <Field label="Sex">
                    <select
                      className="cbms-select"
                      value={form.sex}
                      onChange={(e) => setForm((prev) => ({ ...prev, sex: e.target.value as any }))}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </Field>
                  <Field label="Birth Date">
                    <input
                      className="cbms-input"
                      type="date"
                      value={form.birthDate}
                      onChange={(e) => setForm((prev) => ({ ...prev, birthDate: e.target.value }))}
                      required
                    />
                  </Field>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <Field label="Civil Status">
                    <select
                      className="cbms-select"
                      value={form.civilStatus}
                      onChange={(e) => setForm((prev) => ({ ...prev, civilStatus: e.target.value }))}
                    >
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="widowed">Widowed</option>
                      <option value="divorced">Divorced</option>
                    </select>
                  </Field>
                  <Field label="Citizenship">
                    <input
                      className="cbms-input"
                      value={form.citizenship}
                      onChange={(e) => setForm((prev) => ({ ...prev, citizenship: e.target.value }))}
                      required
                    />
                  </Field>
                </div>

                <Field label="PhilSys Card Number (PCN)">
                  <input
                    className="cbms-input"
                    value={form.philsysNo}
                    placeholder="12-digit PhilSys registry number"
                    onChange={(e) => setForm((prev) => ({ ...prev, philsysNo: e.target.value }))}
                  />
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <Field label="Phone Number">
                    <input
                      className="cbms-input"
                      value={form.contactPhone}
                      onChange={(e) => setForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
                    />
                  </Field>
                  <Field label="Email Address">
                    <input
                      className="cbms-input"
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
                    />
                  </Field>
                </div>

                <div style={{ borderTop: "1px solid var(--color-border, #e2e8f0)", paddingTop: "1rem" }}>
                  <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", fontWeight: "bold" }}>Sectoral Classifications</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={form.isSenior}
                        onChange={(e) => setForm((prev) => ({ ...prev, isSenior: e.target.checked }))}
                      />
                      Senior Citizen
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={form.isPwd}
                        onChange={(e) => setForm((prev) => ({ ...prev, isPwd: e.target.checked }))}
                      />
                      PWD
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={form.isSoloParent}
                        onChange={(e) => setForm((prev) => ({ ...prev, isSoloParent: e.target.checked }))}
                      />
                      Solo Parent
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={form.is4Ps}
                        onChange={(e) => setForm((prev) => ({ ...prev, is4Ps: e.target.checked }))}
                      />
                      4Ps Beneficiary
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer", gridColumn: "span 2" }}>
                      <input
                        type="checkbox"
                        checked={form.isDeceased}
                        onChange={(e) => setForm((prev) => ({ ...prev, isDeceased: e.target.checked }))}
                      />
                      Deceased
                    </label>
                  </div>
                </div>

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
                    onClick={() => setOpenDrawer(false)}
                    className="cbms-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className="cbms-btn cbms-btn--primary"
                  >
                    {busy ? "Saving..." : "Save Inhabitant"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


    </>
  );
}
