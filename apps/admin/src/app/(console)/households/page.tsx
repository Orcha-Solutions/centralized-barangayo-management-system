"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useHouseholdStore } from "../../../store/householdStore";
import {
  Alert,
  Button,
  Chip,
  DataTable,
  Field,
  PageHead,
  Pagination,
  Panel,
  StatCard,
  StatGrid,
  Toolbar,
  num,
  titleize,
} from "@cbms/ui";
import { SourceChip } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import type { Household } from "../../../lib/types";

function buildAddressLine(f: {
  houseNo?: string;
  blockNo?: string;
  lotNo?: string;
  street?: string;
  subdivision?: string;
  buildingName?: string;
  sitio?: string;
  purok?: string;
}): string {
  const parts: string[] = [];
  if (f.houseNo?.trim()) parts.push(`#${f.houseNo.trim()}`);
  if (f.blockNo?.trim()) parts.push(`Blk ${f.blockNo.trim()}`);
  if (f.lotNo?.trim()) parts.push(`Lot ${f.lotNo.trim()}`);
  if (f.street?.trim()) parts.push(f.street.trim());
  if (f.buildingName?.trim()) parts.push(f.buildingName.trim());
  if (f.subdivision?.trim()) parts.push(f.subdivision.trim());
  if (f.sitio?.trim()) parts.push(f.sitio.trim());
  if (f.purok?.trim()) parts.push(f.purok.trim());
  return parts.join(", ") || "No address specified";
}

export default function HouseholdsPage() {
  const router = useRouter();
  const { can } = useConsole();
  const mayEncode = can("inhabitants:encode") || can("inhabitants:create");

  // Zustand Store
  const {
    households,
    loading,
    error: storeError,
    fetchHouseholds,
    addHousehold,
  } = useHouseholdStore();

  const [q, setQ] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [purok, setPurok] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 20;

  // Dropdown Action State
  const [showActionsDropdown, setShowActionsDropdown] = React.useState(false);

  // Content Drawer Form State
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);
  
  const [form, setForm] = React.useState({
    householdNo: "",
    houseNo: "",
    blockNo: "",
    lotNo: "",
    street: "",
    subdivision: "",
    buildingName: "",
    purok: "Purok 1",
    sitio: "",
    latitude: "",
    longitude: "",
    squareMeters: "",
    hasGarage: false,
    hazardZoneRisk: "low_risk",
    dwellingType: "single_house",
    roofMaterial: "galvanized_iron",
    wallMaterial: "concrete_brick",
    tenureStatus: "owner",
    landTenure: "owned",
    waterSource: "piped",
    toiletFacility: "flush_exclusive",
    electricitySource: "grid",
    cookingFuel: "lpg",
    wasteDisposal: "barangay_truck",
    internetAccess: "fiber_broadband",
    monthlyIncomeBand: "10k_to_20k",
    primaryIncomeSource: "employment",
    is4Ps: false,
    isIndigent: false,
    remarks: "",
  });

  const [exporting, setExporting] = React.useState(false);

  React.useEffect(() => {
    fetchHouseholds();
  }, []);

  const puroks = React.useMemo(() => {
    const set = new Set<string>();
    for (const h of households) if (h.purok) set.add(h.purok);
    return Array.from(set).sort();
  }, [households]);

  const filtered = React.useMemo(() => {
    return households.filter((h) => {
      if (search) {
        const query = search.toLowerCase();
        const noMatch = h.householdNo?.toLowerCase().includes(query);
        const addrMatch = h.addressLine?.toLowerCase().includes(query);
        const streetMatch = h.street?.toLowerCase().includes(query);
        const purokMatch = h.purok?.toLowerCase().includes(query);
        if (!noMatch && !addrMatch && !streetMatch && !purokMatch) return false;
      }
      if (purok !== "all" && h.purok !== purok) return false;
      return true;
    });
  }, [households, search, purok]);

  const paginated = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const withConsent = React.useMemo(() => {
    return households.filter((h) => (h.consents?.length ?? 0) > 0).length;
  }, [households]);

  const with4Ps = React.useMemo(() => {
    return households.filter((h) => !!h.is4Ps).length;
  }, [households]);

  const withIndigent = React.useMemo(() => {
    return households.filter((h) => !!h.isIndigent).length;
  }, [households]);

  function exportCsv() {
    setExporting(true);
    try {
      const headers = [
        "Household No",
        "House No",
        "Block No",
        "Lot No",
        "Street",
        "Subdivision/Building",
        "Purok",
        "Sitio",
        "Full Address",
        "Latitude",
        "Longitude",
        "Area (sqm)",
        "Has Garage",
        "Hazard Risk",
        "Dwelling Type",
        "Roof Material",
        "Wall Material",
        "Tenure Status",
        "Water Source",
        "Toilet Facility",
        "Electricity",
        "Cooking Fuel",
        "Waste Disposal",
        "Internet",
        "Income Band",
        "Primary Income",
        "4Ps",
        "Indigent",
        "Members Count",
        "Source"
      ];
      const rows = filtered.map((h) => [
        `"${h.householdNo}"`,
        `"${h.houseNo ?? ""}"`,
        `"${h.blockNo ?? ""}"`,
        `"${h.lotNo ?? ""}"`,
        `"${h.street ?? ""}"`,
        `"${h.subdivision || h.buildingName || ""}"`,
        `"${h.purok ?? ""}"`,
        `"${h.sitio ?? ""}"`,
        `"${h.addressLine ?? ""}"`,
        h.latitude ?? "",
        h.longitude ?? "",
        h.squareMeters ?? "",
        h.hasGarage ? "Yes" : "No",
        `"${h.hazardZoneRisk ?? "low_risk"}"`,
        `"${h.dwellingType ?? ""}"`,
        `"${h.roofMaterial ?? ""}"`,
        `"${h.wallMaterial ?? ""}"`,
        `"${h.tenureStatus ?? ""}"`,
        `"${h.waterSource ?? ""}"`,
        `"${h.toiletFacility ?? ""}"`,
        `"${h.electricitySource ?? ""}"`,
        `"${h.cookingFuel ?? ""}"`,
        `"${h.wasteDisposal ?? ""}"`,
        `"${h.internetAccess ?? ""}"`,
        `"${h.monthlyIncomeBand ?? ""}"`,
        `"${h.primaryIncomeSource ?? ""}"`,
        h.is4Ps ? "Yes" : "No",
        h.isIndigent ? "Yes" : "No",
        h.members?.length ?? h._count?.members ?? 0,
        `"${h.source ?? "CBMS"}"`
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `households_cbms_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setExporting(false);
    }
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setActionError(null);
    try {
      const computedAddress = buildAddressLine(form);
      await addHousehold({
        ...form,
        householdNo: form.householdNo.trim() || `HH-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
        addressLine: computedAddress,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        squareMeters: form.squareMeters ? parseFloat(form.squareMeters) : null,
        hasGarage: form.hasGarage,
      });
      setOpenDrawer(false);
    } catch (err: any) {
      setActionError(err.message || "Failed to save household.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title="Households"
        subtitle="Household folders, granular address breakdowns, GIS coordinates, structural census metrics, and standing data-privacy consents (RA 10173)."
        breadcrumb="Residents"
        parity="BIPS"
      />

      {storeError && <Alert tone="danger">{storeError}</Alert>}

      <StatGrid>
        <StatCard label="Total households" value={num(households.length)} icon="🏠" />
        <StatCard label="Puroks covered" value={num(puroks.length)} icon="📍" />
        <StatCard
          label="4Ps / Indigent"
          value={`${num(with4Ps)} / ${num(withIndigent)}`}
          icon="🤝"
          tone="gold"
          hint="Social protection registry"
        />
        <StatCard
          label="With privacy consent"
          value={num(withConsent)}
          icon="✍️"
          tone="green"
          hint="At least one granted purpose"
        />
      </StatGrid>

      <Panel padded={false}>
        <Toolbar>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setSearch(q.trim());
            }}
            style={{ display: "flex", gap: 8 }}
          >
            <input
              className="cbms-input cbms-input--search"
              placeholder="Search household no., street, or address…"
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
          <div className="cbms-toolbar__spacer" />
          <span className="adm-muted" style={{ marginRight: "1rem" }}>{num(filtered.length)} household(s)</span>

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
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setForm({
                            householdNo: `HH-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
                            houseNo: "",
                            blockNo: "",
                            lotNo: "",
                            street: "",
                            subdivision: "",
                            buildingName: "",
                            purok: "Purok 1",
                            sitio: "",
                            latitude: "",
                            longitude: "",
                            squareMeters: "",
                            hasGarage: false,
                            hazardZoneRisk: "low_risk",
                            dwellingType: "single_house",
                            roofMaterial: "galvanized_iron",
                            wallMaterial: "concrete_brick",
                            tenureStatus: "owner",
                            landTenure: "owned",
                            waterSource: "piped",
                            toiletFacility: "flush_exclusive",
                            electricitySource: "grid",
                            cookingFuel: "lpg",
                            wasteDisposal: "barangay_truck",
                            internetAccess: "fiber_broadband",
                            monthlyIncomeBand: "10k_to_20k",
                            primaryIncomeSource: "employment",
                            is4Ps: false,
                            isIndigent: false,
                            remarks: "",
                          });
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
                        ⚡ Quick Household Drawer
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          router.push("/households/new");
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
                          color: "var(--color-text, #1b2430)",
                          fontWeight: 600,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        🏠 New Household (BIMS Form A1)
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      exportCsv();
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
                    {exporting ? "⏳ Exporting…" : "⬇ Export (CSV)"}
                  </button>
                </div>
              </>
            )}
          </div>
        </Toolbar>

        <DataTable
          columns={[
            {
              key: "householdNo",
              header: "Household / Address",
              render: (h) => (
                <>
                  <div className="cbms-table__primary">{h.householdNo}</div>
                  <div className="cbms-table__muted">{h.addressLine}</div>
                </>
              ),
            },
            { key: "purok", header: "Purok / Sitio", render: (h) => `${h.purok ?? "—"}${h.sitio ? ` · ${h.sitio}` : ""}` },
            {
              key: "members",
              header: "Members",
              align: "right",
              render: (h) => num(h.members?.length ?? h._count?.members ?? 0),
            },
            {
              key: "dwelling",
              header: "Dwelling / Space",
              render: (h) => (
                <div>
                  <div>{titleize(h.dwellingType ?? "Single house")}</div>
                  <div className="cbms-table__muted" style={{ fontSize: "0.75rem" }}>
                    {h.squareMeters ? `${h.squareMeters} m²` : "—"}{h.hasGarage ? " · 🚗 Garage" : ""}
                  </div>
                </div>
              ),
            },
            {
              key: "income",
              header: "Income / Vulnerability",
              render: (h) => (
                <div>
                  <div>{h.monthlyIncomeBand ? titleize(h.monthlyIncomeBand.replace(/_/g, " ")) : "₱10,000–₱20,000"}</div>
                  <div style={{ display: "flex", gap: "0.25rem", marginTop: "0.25rem" }}>
                    {h.is4Ps && <Chip tone="gold">4Ps</Chip>}
                    {h.isIndigent && <Chip tone="red">Indigent</Chip>}
                  </div>
                </div>
              ),
            },
            {
              key: "consents",
              header: "Consents",
              render: (h) =>
                (h.consents?.length ?? 0) === 0 ? (
                  <Chip tone="red">None on file</Chip>
                ) : (
                  <span className="adm-chiprow">
                    {(h.consents ?? []).map((c, i) => (
                      <Chip key={`${c.purpose}-${i}`} tone="green">
                        {titleize(c.purpose)}
                      </Chip>
                    ))}
                  </span>
                ),
            },
            { key: "source", header: "Source", render: (h) => <SourceChip source={h.source} /> },
          ]}
          rows={paginated}
          empty={loading ? "Loading households..." : "No households match this filter."}
          onRowClick={(h) => router.push(`/households/${h.id}/edit`)}
        />

        <Pagination page={page} pageSize={pageSize} total={filtered.length} onPage={setPage} />
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
              maxWidth: "600px",
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
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "bold", color: "var(--color-text, #1b2430)" }}>
                  🏠 Register New Household
                </h3>
                <span style={{ fontSize: "0.75rem", color: "var(--cbms-muted, #64748b)" }}>
                  CBMS Standard Household & Housing Profiling
                </span>
              </div>
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
                ✕
              </button>
            </div>

            <form
              onSubmit={submitForm}
              style={{
                padding: "1.5rem",
                overflowY: "auto",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              {actionError && <Alert tone="danger">{actionError}</Alert>}

              {/* 1. Location & Granular Address Breakdown */}
              <div style={{ border: "1px solid var(--color-border, #e2e8f0)", padding: "1rem", borderRadius: "0.375rem" }}>
                <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text, #1b2430)" }}>
                  📍 1. Household ID, Address & GIS Coordinates
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <Field label="Household Number">
                    <input
                      className="cbms-input"
                      value={form.householdNo}
                      onChange={(e) => setForm((prev) => ({ ...prev, householdNo: e.target.value }))}
                      required
                    />
                  </Field>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                    <Field label="House / Unit No.">
                      <input
                        className="cbms-input"
                        placeholder="e.g. 239, Unit 4B"
                        value={form.houseNo}
                        onChange={(e) => setForm((prev) => ({ ...prev, houseNo: e.target.value }))}
                      />
                    </Field>
                    <Field label="Block No. (Blk)">
                      <input
                        className="cbms-input"
                        placeholder="e.g. 12"
                        value={form.blockNo}
                        onChange={(e) => setForm((prev) => ({ ...prev, blockNo: e.target.value }))}
                      />
                    </Field>
                    <Field label="Lot No.">
                      <input
                        className="cbms-input"
                        placeholder="e.g. 5"
                        value={form.lotNo}
                        onChange={(e) => setForm((prev) => ({ ...prev, lotNo: e.target.value }))}
                      />
                    </Field>
                  </div>

                  <Field label="Street Name">
                    <input
                      className="cbms-input"
                      placeholder="e.g. Katipunan St., J.P. Rizal Ave."
                      value={form.street}
                      onChange={(e) => setForm((prev) => ({ ...prev, street: e.target.value }))}
                      required
                    />
                  </Field>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <Field label="Subdivision / Village">
                      <input
                        className="cbms-input"
                        placeholder="e.g. Sunrise Village"
                        value={form.subdivision}
                        onChange={(e) => setForm((prev) => ({ ...prev, subdivision: e.target.value }))}
                      />
                    </Field>
                    <Field label="Building / Compound">
                      <input
                        className="cbms-input"
                        placeholder="e.g. Tower 1, Cruz Compound"
                        value={form.buildingName}
                        onChange={(e) => setForm((prev) => ({ ...prev, buildingName: e.target.value }))}
                      />
                    </Field>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <Field label="Purok">
                      <select
                        className="cbms-select"
                        value={form.purok}
                        onChange={(e) => setForm((prev) => ({ ...prev, purok: e.target.value }))}
                      >
                        {["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"].map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Sitio / Zone">
                      <input
                        className="cbms-input"
                        placeholder="e.g. Riverside, Ilaya"
                        value={form.sitio}
                        onChange={(e) => setForm((prev) => ({ ...prev, sitio: e.target.value }))}
                      />
                    </Field>
                  </div>

                  {/* Latitude, Longitude GIS */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <Field label="Latitude (GIS Coordinate)">
                      <input
                        type="number"
                        step="any"
                        className="cbms-input"
                        placeholder="e.g. 14.651010"
                        value={form.latitude}
                        onChange={(e) => setForm((prev) => ({ ...prev, latitude: e.target.value }))}
                      />
                    </Field>
                    <Field label="Longitude (GIS Coordinate)">
                      <input
                        type="number"
                        step="any"
                        className="cbms-input"
                        placeholder="e.g. 121.105536"
                        value={form.longitude}
                        onChange={(e) => setForm((prev) => ({ ...prev, longitude: e.target.value }))}
                      />
                    </Field>
                  </div>

                  <div style={{ background: "var(--color-bg-hover, #f8fafc)", padding: "0.6rem 0.75rem", borderRadius: "0.375rem", fontSize: "0.8rem", color: "var(--cbms-muted, #64748b)" }}>
                    <strong>Assembled Address Preview:</strong> {buildAddressLine(form)}
                  </div>

                  <Field label="DRRM Disaster Hazard Risk Area">
                    <select
                      className="cbms-select"
                      value={form.hazardZoneRisk}
                      onChange={(e) => setForm((prev) => ({ ...prev, hazardZoneRisk: e.target.value }))}
                    >
                      <option value="low_risk">Low Risk / Safe Zone</option>
                      <option value="flood_prone">Flood Prone / Low-Lying Area</option>
                      <option value="landslide_prone">Landslide / Slope Hazard</option>
                      <option value="fire_hazard">Dense Fire-Hazard Area</option>
                      <option value="coastal_surge">Coastal / Riverbank Surge Area</option>
                    </select>
                  </Field>
                </div>
              </div>

              {/* 2. Housing Structure */}
              <div style={{ border: "1px solid var(--color-border, #e2e8f0)", padding: "1rem", borderRadius: "0.375rem" }}>
                <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text, #1b2430)" }}>
                  🏗️ 2. Dwelling, Area & Construction Materials
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <Field label="Dwelling Structure">
                    <select
                      className="cbms-select"
                      value={form.dwellingType}
                      onChange={(e) => setForm((prev) => ({ ...prev, dwellingType: e.target.value }))}
                    >
                      <option value="single_house">Single Detached House</option>
                      <option value="duplex">Duplex</option>
                      <option value="multi_unit">Apartment / Condominium</option>
                      <option value="commercial">Commercial / Mixed-Use</option>
                      <option value="makeshift">Makeshift / Salvaged Materials</option>
                    </select>
                  </Field>

                  <Field label="Floor / Lot Area (Square Meters m²)">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="cbms-input"
                      placeholder="e.g. 65.5"
                      value={form.squareMeters}
                      onChange={(e) => setForm((prev) => ({ ...prev, squareMeters: e.target.value }))}
                    />
                  </Field>

                  <Field label="Building Tenure">
                    <select
                      className="cbms-select"
                      value={form.tenureStatus}
                      onChange={(e) => setForm((prev) => ({ ...prev, tenureStatus: e.target.value }))}
                    >
                      <option value="owner">Owner / Freehold</option>
                      <option value="tenant">Tenant / Rented</option>
                      <option value="living_with_relatives">Living with Relatives (Rent-Free)</option>
                      <option value="informal_settler">Informal Settler / Usufruct</option>
                    </select>
                  </Field>

                  <Field label="Land Tenure">
                    <select
                      className="cbms-select"
                      value={form.landTenure}
                      onChange={(e) => setForm((prev) => ({ ...prev, landTenure: e.target.value }))}
                    >
                      <option value="owned">Owner of Land / Titled</option>
                      <option value="rented">Tenant / Land Rent Paid</option>
                      <option value="government_public">Government / Public Land</option>
                      <option value="informal">Informal Settlement</option>
                    </select>
                  </Field>

                  <Field label="Roof Construction">
                    <select
                      className="cbms-select"
                      value={form.roofMaterial}
                      onChange={(e) => setForm((prev) => ({ ...prev, roofMaterial: e.target.value }))}
                    >
                      <option value="galvanized_iron">Galvanized Iron / Aluminum</option>
                      <option value="concrete_tile">Concrete / Clay Tiles</option>
                      <option value="wood_bamboo">Wood / Bamboo / Nipa</option>
                      <option value="makeshift_salvaged">Makeshift / Salvaged Materials</option>
                    </select>
                  </Field>

                  <Field label="Outer Wall Construction">
                    <select
                      className="cbms-select"
                      value={form.wallMaterial}
                      onChange={(e) => setForm((prev) => ({ ...prev, wallMaterial: e.target.value }))}
                    >
                      <option value="concrete_brick">Concrete / Brick / Stone</option>
                      <option value="wood">Wood / Timber</option>
                      <option value="half_concrete_half_wood">Half Concrete / Half Wood</option>
                      <option value="bamboo_sawali">Bamboo / Sawali / Nipa</option>
                      <option value="makeshift">Makeshift / Tarpaulin</option>
                    </select>
                  </Field>
                </div>

                <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--color-border, #e2e8f0)" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.hasGarage}
                      onChange={(e) => setForm((prev) => ({ ...prev, hasGarage: e.target.checked }))}
                    />
                    Has Dedicated Garage / Private Vehicle Parking Space
                  </label>
                </div>
              </div>

              {/* 3. Utilities & Sanitation */}
              <div style={{ border: "1px solid var(--color-border, #e2e8f0)", padding: "1rem", borderRadius: "0.375rem" }}>
                <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text, #1b2430)" }}>
                  🚰 3. Utilities, Sanitation & Waste
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <Field label="Main Water Source">
                    <select
                      className="cbms-select"
                      value={form.waterSource}
                      onChange={(e) => setForm((prev) => ({ ...prev, waterSource: e.target.value }))}
                    >
                      <option value="piped">Piped Water (Maynilad / Manila Water)</option>
                      <option value="deep_well">Deep Well / Hand Pump</option>
                      <option value="bottled">Bottled / Refilling Station</option>
                      <option value="spring">Spring / Community Tap Stand</option>
                      <option value="rainwater">Rainwater Catchment</option>
                    </select>
                  </Field>

                  <Field label="Toilet Facility">
                    <select
                      className="cbms-select"
                      value={form.toiletFacility}
                      onChange={(e) => setForm((prev) => ({ ...prev, toiletFacility: e.target.value }))}
                    >
                      <option value="flush_exclusive">Water-sealed Flush (Exclusive)</option>
                      <option value="flush_shared">Water-sealed Flush (Shared)</option>
                      <option value="pit_latrine">Pit Latrine / VIP Latrine</option>
                      <option value="none">None / Open Defecation</option>
                    </select>
                  </Field>

                  <Field label="Electricity Source">
                    <select
                      className="cbms-select"
                      value={form.electricitySource}
                      onChange={(e) => setForm((prev) => ({ ...prev, electricitySource: e.target.value }))}
                    >
                      <option value="grid">Power Grid (Meralco Connection)</option>
                      <option value="shared_meter">Shared Sub-meter</option>
                      <option value="solar">Solar Power System</option>
                      <option value="generator">Generator</option>
                      <option value="none">No Electricity</option>
                    </select>
                  </Field>

                  <Field label="Cooking Fuel">
                    <select
                      className="cbms-select"
                      value={form.cookingFuel}
                      onChange={(e) => setForm((prev) => ({ ...prev, cookingFuel: e.target.value }))}
                    >
                      <option value="lpg">LPG (Liquefied Petroleum Gas)</option>
                      <option value="electric">Electricity / Induction Cooker</option>
                      <option value="kerosene">Kerosene / Gaas</option>
                      <option value="charcoal_firewood">Charcoal / Firewood</option>
                    </select>
                  </Field>

                  <Field label="Garbage Disposal">
                    <select
                      className="cbms-select"
                      value={form.wasteDisposal}
                      onChange={(e) => setForm((prev) => ({ ...prev, wasteDisposal: e.target.value }))}
                    >
                      <option value="barangay_truck">Barangay Garbage Truck Collection</option>
                      <option value="composting">Composting & Segregation</option>
                      <option value="burning">Open Burning (Siga)</option>
                      <option value="open_dumping">Open Dumping</option>
                    </select>
                  </Field>

                  <Field label="Internet Access">
                    <select
                      className="cbms-select"
                      value={form.internetAccess}
                      onChange={(e) => setForm((prev) => ({ ...prev, internetAccess: e.target.value }))}
                    >
                      <option value="fiber_broadband">Fixed Fiber / Broadband</option>
                      <option value="mobile_data">Mobile Prepaid/Postpaid Data</option>
                      <option value="community_wifi">Piso / Community Wi-Fi</option>
                      <option value="none">No Internet Access</option>
                    </select>
                  </Field>
                </div>
              </div>

              {/* 4. Socio-Economic */}
              <div style={{ border: "1px solid var(--color-border, #e2e8f0)", padding: "1rem", borderRadius: "0.375rem" }}>
                <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text, #1b2430)" }}>
                  💰 4. Socio-Economic Profile & Assistance
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <Field label="Monthly Income Band">
                    <select
                      className="cbms-select"
                      value={form.monthlyIncomeBand}
                      onChange={(e) => setForm((prev) => ({ ...prev, monthlyIncomeBand: e.target.value }))}
                    >
                      <option value="under_10k">Under ₱10,000 (Low / Poor)</option>
                      <option value="10k_to_20k">₱10,000 – ₱20,000 (Low-Middle)</option>
                      <option value="20k_to_50k">₱20,000 – ₱50,000 (Middle Class)</option>
                      <option value="50k_to_100k">₱50,000 – ₱100,000 (Upper-Middle)</option>
                      <option value="above_100k">Above ₱100,000 (High Income)</option>
                    </select>
                  </Field>

                  <Field label="Primary Source of Income">
                    <select
                      className="cbms-select"
                      value={form.primaryIncomeSource}
                      onChange={(e) => setForm((prev) => ({ ...prev, primaryIncomeSource: e.target.value }))}
                    >
                      <option value="employment">Wage / Salaried Employment</option>
                      <option value="business_enterprise">Sari-Sari / Small Enterprise</option>
                      <option value="remittances_ofw">OFW / Domestic Remittances</option>
                      <option value="agriculture_fishery">Agriculture / Fishery</option>
                      <option value="gig_informal">Informal / Daily Wage / Gig Work</option>
                    </select>
                  </Field>
                </div>

                <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--color-border, #e2e8f0)" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.is4Ps}
                      onChange={(e) => setForm((prev) => ({ ...prev, is4Ps: e.target.checked }))}
                    />
                    4Ps Beneficiary
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.isIndigent}
                      onChange={(e) => setForm((prev) => ({ ...prev, isIndigent: e.target.checked }))}
                    />
                    Indigent Family (DSWD Listahanan)
                  </label>
                </div>
              </div>

              {/* 5. Remarks */}
              <Field label="Field Enumerator Observations / Remarks">
                <textarea
                  className="cbms-input"
                  style={{ minHeight: "60px" }}
                  placeholder="Special social worker notes, health conditions, or assistance priority..."
                  value={form.remarks}
                  onChange={(e) => setForm((prev) => ({ ...prev, remarks: e.target.value }))}
                />
              </Field>

              <div style={{ marginTop: "auto", display: "flex", gap: "0.75rem", paddingTop: "1rem" }}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setOpenDrawer(false)}
                  className="cbms-btn"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="cbms-btn cbms-btn--primary"
                  style={{ flex: 1 }}
                >
                  {busy ? "Saving..." : "Save Household"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
