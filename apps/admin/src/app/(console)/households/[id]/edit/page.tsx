"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useHouseholdStore } from "../../../../../store/householdStore";
import { useApi, post, ApiError } from "@cbms/api-client";
import {
  Alert,
  Button,
  Chip,
  DataTable,
  Field,
  PageHead,
  Panel,
  StatusChip,
  age,
  date,
  fullName,
  peso,
  titleize,
} from "@cbms/ui";
import { Async, ActionResult, Tabs, SectorChips } from "../../../../../components/common";
import { useConsole } from "../../../../../components/Shell";
import { CONSENT_PURPOSES, CONSENT_PURPOSE_HINTS } from "../../../../../lib/labels";
import type { Household, Inhabitant } from "../../../../../lib/types";

type TabKey = "edit" | "history";

interface TimelineTransaction {
  id: string;
  type: string;
  description: string;
  amount: number;
  status: string;
  date: string;
}

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

export default function EditHouseholdPage() {
  const params = useParams();
  const router = useRouter();
  const { can } = useConsole();
  const id = String((params as Record<string, string | string[]>)?.id ?? "");

  const { households, updateHousehold, deleteHousehold, fetchHouseholds } = useHouseholdStore();
  
  // Timeline transactions
  const history = useApi<TimelineTransaction[]>(id ? `/households/${id}/transactions` : null);

  const [tab, setTab] = React.useState<TabKey>("edit");
  const [showActionsDropdown, setShowActionsDropdown] = React.useState(false);
  const [showDeletePopup, setShowDeletePopup] = React.useState(false);

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

  // Consent form state
  const [purpose, setPurpose] = React.useState<string>(CONSENT_PURPOSES[0]);
  const [grantedBy, setGrantedBy] = React.useState("");
  const [consentNotes, setConsentNotes] = React.useState("");
  const [consentOk, setConsentOk] = React.useState<string | null>(null);

  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const currentHousehold = React.useMemo(() => {
    return households.find((h) => h.id === id);
  }, [households, id]);

  React.useEffect(() => {
    async function loadData() {
      if (households.length === 0) {
        await fetchHouseholds();
      }
    }
    loadData();
  }, []);

  React.useEffect(() => {
    if (currentHousehold) {
      setForm({
        householdNo: currentHousehold.householdNo || "",
        houseNo: currentHousehold.houseNo || "",
        blockNo: currentHousehold.blockNo || "",
        lotNo: currentHousehold.lotNo || "",
        street: currentHousehold.street || "",
        subdivision: currentHousehold.subdivision || "",
        buildingName: currentHousehold.buildingName || "",
        purok: currentHousehold.purok || "Purok 1",
        sitio: currentHousehold.sitio || "",
        latitude: currentHousehold.latitude != null ? String(currentHousehold.latitude) : "",
        longitude: currentHousehold.longitude != null ? String(currentHousehold.longitude) : "",
        squareMeters: currentHousehold.squareMeters != null ? String(currentHousehold.squareMeters) : "",
        hasGarage: !!currentHousehold.hasGarage,
        hazardZoneRisk: currentHousehold.hazardZoneRisk || "low_risk",
        dwellingType: currentHousehold.dwellingType || "single_house",
        roofMaterial: currentHousehold.roofMaterial || "galvanized_iron",
        wallMaterial: currentHousehold.wallMaterial || "concrete_brick",
        tenureStatus: currentHousehold.tenureStatus || "owner",
        landTenure: currentHousehold.landTenure || "owned",
        waterSource: currentHousehold.waterSource || "piped",
        toiletFacility: currentHousehold.toiletFacility || "flush_exclusive",
        electricitySource: currentHousehold.electricitySource || "grid",
        cookingFuel: currentHousehold.cookingFuel || "lpg",
        wasteDisposal: currentHousehold.wasteDisposal || "barangay_truck",
        internetAccess: currentHousehold.internetAccess || "fiber_broadband",
        monthlyIncomeBand: currentHousehold.monthlyIncomeBand || "10k_to_20k",
        primaryIncomeSource: currentHousehold.primaryIncomeSource || "employment",
        is4Ps: !!currentHousehold.is4Ps,
        isIndigent: !!currentHousehold.isIndigent,
        remarks: currentHousehold.remarks || "",
      });
      setLoading(false);
    }
  }, [currentHousehold]);

  function set<K extends keyof typeof form>(key: K, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const computedAddress = buildAddressLine(form);
      await updateHousehold(id, {
        ...form,
        householdNo: form.householdNo.trim(),
        addressLine: computedAddress,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        squareMeters: form.squareMeters ? parseFloat(form.squareMeters) : null,
        hasGarage: form.hasGarage,
      });
      router.push(`/households`);
    } catch (err: any) {
      setError(err.message || "Could not save the changes.");
    } finally {
      setBusy(false);
    }
  }

  async function recordConsent(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setConsentOk(null);
    try {
      await post(`/households/${id}/consent`, {
        purpose,
        grantedBy: grantedBy.trim(),
        ...(consentNotes.trim() ? { notes: consentNotes.trim() } : {}),
      });
      setConsentOk(`Consent for ${titleize(purpose)} recorded successfully.`);
      setGrantedBy("");
      setConsentNotes("");
      await fetchHouseholds();
    } catch (err: any) {
      setError(err.message || "Could not record the consent.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    setBusy(true);
    setError(null);
    try {
      await deleteHousehold(id);
      setShowDeletePopup(false);
      router.push("/households");
    } catch (err: any) {
      setError(err.message || "Failed to delete household.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading household details...</div>;
  }

  return (
    <>
      <PageHead
        title={`Edit Household: ${form.householdNo}`}
        subtitle={`Folder address · ${buildAddressLine(form)}`}
        breadcrumb="Residents / Households"
        parity="BIPS"
        actions={
          <div style={{ display: "flex", gap: "0.5rem", position: "relative" }}>
            <button type="button" className="cbms-btn" onClick={() => router.push("/households")}>
              Cancel
            </button>
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                className="cbms-btn cbms-btn--primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: "0.5rem 1rem",
                  fontSize: "0.875rem",
                  cursor: "pointer"
                }}
              >
                ⚙️ Actions ▾
              </button>
              {showActionsDropdown && (
                <>
                  <div 
                    style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }} 
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
                      zIndex: 110,
                      minWidth: "180px",
                      display: "flex",
                      flexDirection: "column",
                      padding: "0.25rem 0"
                    }}
                  >
                    <button
                      type="submit"
                      form="edit-household-form"
                      onClick={() => setShowActionsDropdown(false)}
                      disabled={busy}
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
                        width: "100%"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      💾 Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowActionsDropdown(false);
                        setShowDeletePopup(true);
                      }}
                      disabled={busy}
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
                        color: "var(--cbms-red, #ce1126)",
                        width: "100%"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      🗑️ Delete Household
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        }
      />

      <ActionResult error={error} success={consentOk} />

      <Tabs<TabKey>
        tabs={[
          { value: "edit", label: "View/Edit Profile" },
          { value: "history", label: `Members & History (${currentHousehold?.members?.length ?? 0})` },
        ]}
        value={tab}
        onChange={(t) => {
          setTab(t);
          if (t === "history") {
            history.reload();
          }
        }}
      />

      <div style={{ display: tab === "edit" ? "block" : "none" }}>
        <form onSubmit={save} id="edit-household-form">
          <div className="adm-stack" style={{ marginTop: "1rem" }}>
            {/* Section 1: Location & Granular Address */}
            <Panel title="📍 1. Household ID, Address & GIS Coordinates">
              <div className="adm-form-grid">
                <Field label="Household Number">
                  <input
                    className="cbms-input"
                    value={form.householdNo}
                    onChange={(e) => set("householdNo", e.target.value)}
                    required
                  />
                </Field>

                <Field label="House / Unit No.">
                  <input
                    className="cbms-input"
                    placeholder="e.g. 239, Unit 4B"
                    value={form.houseNo}
                    onChange={(e) => set("houseNo", e.target.value)}
                  />
                </Field>

                <Field label="Block No. (Blk)">
                  <input
                    className="cbms-input"
                    placeholder="e.g. 12"
                    value={form.blockNo}
                    onChange={(e) => set("blockNo", e.target.value)}
                  />
                </Field>

                <Field label="Lot No.">
                  <input
                    className="cbms-input"
                    placeholder="e.g. 5"
                    value={form.lotNo}
                    onChange={(e) => set("lotNo", e.target.value)}
                  />
                </Field>
              </div>

              <div className="adm-form-grid" style={{ marginTop: "0.75rem" }}>
                <Field label="Street Name">
                  <input
                    className="cbms-input"
                    placeholder="e.g. Katipunan St., J.P. Rizal Ave."
                    value={form.street}
                    onChange={(e) => set("street", e.target.value)}
                    required
                  />
                </Field>

                <Field label="Subdivision / Village">
                  <input
                    className="cbms-input"
                    placeholder="e.g. Sunrise Village"
                    value={form.subdivision}
                    onChange={(e) => set("subdivision", e.target.value)}
                  />
                </Field>

                <Field label="Building / Compound">
                  <input
                    className="cbms-input"
                    placeholder="e.g. Tower 1, Cruz Compound"
                    value={form.buildingName}
                    onChange={(e) => set("buildingName", e.target.value)}
                  />
                </Field>

                <Field label="Purok">
                  <select
                    className="cbms-select"
                    value={form.purok}
                    onChange={(e) => set("purok", e.target.value)}
                  >
                    {["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginTop: "0.75rem" }}>
                <Field label="Sitio / Zone">
                  <input
                    className="cbms-input"
                    placeholder="e.g. Riverside, Ilaya"
                    value={form.sitio}
                    onChange={(e) => set("sitio", e.target.value)}
                  />
                </Field>

                <Field label="Latitude (GIS Coordinate)">
                  <input
                    type="number"
                    step="any"
                    className="cbms-input"
                    placeholder="e.g. 14.651010"
                    value={form.latitude}
                    onChange={(e) => set("latitude", e.target.value)}
                  />
                </Field>

                <Field label="Longitude (GIS Coordinate)">
                  <input
                    type="number"
                    step="any"
                    className="cbms-input"
                    placeholder="e.g. 121.105536"
                    value={form.longitude}
                    onChange={(e) => set("longitude", e.target.value)}
                  />
                </Field>
              </div>

              <div style={{ marginTop: "0.75rem" }}>
                <Field label="DRRM Disaster Hazard Risk Area">
                  <select
                    className="cbms-select"
                    value={form.hazardZoneRisk}
                    onChange={(e) => set("hazardZoneRisk", e.target.value)}
                  >
                    <option value="low_risk">Low Risk / Safe Zone</option>
                    <option value="flood_prone">Flood Prone / Low-Lying Area</option>
                    <option value="landslide_prone">Landslide / Slope Hazard</option>
                    <option value="fire_hazard">Dense Fire-Hazard Area</option>
                    <option value="coastal_surge">Coastal / Riverbank Surge Area</option>
                  </select>
                </Field>
              </div>

              <div style={{ marginTop: "0.75rem", background: "var(--color-bg-hover, #f8fafc)", padding: "0.6rem 0.75rem", borderRadius: "0.375rem", fontSize: "0.8rem", color: "var(--cbms-muted, #64748b)" }}>
                <strong>Assembled Complete Address Line:</strong> {buildAddressLine(form)}
              </div>
            </Panel>

            {/* Section 2: Housing & Materials */}
            <Panel title="🏗️ 2. Dwelling Structure, Area & Construction Materials">
              <div className="adm-form-grid">
                <Field label="Dwelling Structure">
                  <select
                    className="cbms-select"
                    value={form.dwellingType}
                    onChange={(e) => set("dwellingType", e.target.value)}
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
                    onChange={(e) => set("squareMeters", e.target.value)}
                  />
                </Field>

                <Field label="Building Tenure Status">
                  <select
                    className="cbms-select"
                    value={form.tenureStatus}
                    onChange={(e) => set("tenureStatus", e.target.value)}
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
                    onChange={(e) => set("landTenure", e.target.value)}
                  >
                    <option value="owned">Owner of Land / Titled</option>
                    <option value="rented">Tenant / Land Rent Paid</option>
                    <option value="government_public">Government / Public Land</option>
                    <option value="informal">Informal Settlement</option>
                  </select>
                </Field>
              </div>

              <div className="adm-form-grid" style={{ marginTop: "0.75rem" }}>
                <Field label="Roof Construction Material">
                  <select
                    className="cbms-select"
                    value={form.roofMaterial}
                    onChange={(e) => set("roofMaterial", e.target.value)}
                  >
                    <option value="galvanized_iron">Galvanized Iron / Aluminum</option>
                    <option value="concrete_tile">Concrete / Clay Tiles</option>
                    <option value="wood_bamboo">Wood / Bamboo / Nipa</option>
                    <option value="makeshift_salvaged">Makeshift / Salvaged Materials</option>
                  </select>
                </Field>

                <Field label="Outer Wall Construction Material">
                  <select
                    className="cbms-select"
                    value={form.wallMaterial}
                    onChange={(e) => set("wallMaterial", e.target.value)}
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
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={form.hasGarage}
                    onChange={(e) => set("hasGarage", e.target.checked)}
                  />
                  Has Dedicated Garage / Private Vehicle Parking Space
                </label>
              </div>
            </Panel>

            {/* Section 3: Utilities & Sanitation */}
            <Panel title="🚰 3. Utilities, Sanitation & Waste Management">
              <div className="adm-form-grid">
                <Field label="Main Water Source">
                  <select
                    className="cbms-select"
                    value={form.waterSource}
                    onChange={(e) => set("waterSource", e.target.value)}
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
                    onChange={(e) => set("toiletFacility", e.target.value)}
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
                    onChange={(e) => set("electricitySource", e.target.value)}
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
                    onChange={(e) => set("cookingFuel", e.target.value)}
                  >
                    <option value="lpg">LPG (Liquefied Petroleum Gas)</option>
                    <option value="electric">Electricity / Induction Cooker</option>
                    <option value="kerosene">Kerosene / Gaas</option>
                    <option value="charcoal_firewood">Charcoal / Firewood</option>
                  </select>
                </Field>

                <Field label="Garbage Disposal System">
                  <select
                    className="cbms-select"
                    value={form.wasteDisposal}
                    onChange={(e) => set("wasteDisposal", e.target.value)}
                  >
                    <option value="barangay_truck">Barangay Garbage Truck Collection</option>
                    <option value="composting">Composting & Segregation</option>
                    <option value="burning">Open Burning (Siga)</option>
                    <option value="open_dumping">Open Dumping</option>
                  </select>
                </Field>

                <Field label="Internet / Connectivity">
                  <select
                    className="cbms-select"
                    value={form.internetAccess}
                    onChange={(e) => set("internetAccess", e.target.value)}
                  >
                    <option value="fiber_broadband">Fixed Fiber / Broadband</option>
                    <option value="mobile_data">Mobile Prepaid/Postpaid Data</option>
                    <option value="community_wifi">Piso / Community Wi-Fi</option>
                    <option value="none">No Internet Access</option>
                  </select>
                </Field>
              </div>
            </Panel>

            {/* Section 4: Socio-Economic Profile */}
            <Panel title="💰 4. Socio-Economic Profile & Vulnerability Registry">
              <div className="adm-form-grid">
                <Field label="Monthly Household Income Band">
                  <select
                    className="cbms-select"
                    value={form.monthlyIncomeBand}
                    onChange={(e) => set("monthlyIncomeBand", e.target.value)}
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
                    onChange={(e) => set("primaryIncomeSource", e.target.value)}
                  >
                    <option value="employment">Wage / Salaried Employment</option>
                    <option value="business_enterprise">Sari-Sari / Small Enterprise</option>
                    <option value="remittances_ofw">OFW / Domestic Remittances</option>
                    <option value="agriculture_fishery">Agriculture / Fishery</option>
                    <option value="gig_informal">Informal / Daily Wage / Gig Work</option>
                  </select>
                </Field>
              </div>

              <div style={{ display: "flex", gap: "2rem", marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--color-border, #e2e8f0)" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={form.is4Ps}
                    onChange={(e) => set("is4Ps", e.target.checked)}
                  />
                  4Ps (Pantawid Pamilyang Pilipino Program) Beneficiary
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={form.isIndigent}
                    onChange={(e) => set("isIndigent", e.target.checked)}
                  />
                  Indigent Family (DSWD Listahanan Verified)
                </label>
              </div>

              <div style={{ marginTop: "1rem" }}>
                <Field label="Field Enumerator Observations / Remarks">
                  <textarea
                    className="cbms-input"
                    style={{ minHeight: "70px" }}
                    placeholder="Social worker assessment, priority ayuda status, or notes..."
                    value={form.remarks}
                    onChange={(e) => set("remarks", e.target.value)}
                  />
                </Field>
              </div>
            </Panel>

            {/* Data Privacy Consents Sub-Panel */}
            <Panel title="🛡️ 5. Standing Data-Privacy Consents (RA 10173)">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div>
                  <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem" }}>Standing Consents on File</h4>
                  {(currentHousehold?.consents?.length ?? 0) === 0 ? (
                    <div style={{ padding: "0.75rem", background: "var(--color-bg-hover, #f8fafc)", borderRadius: "0.375rem", fontSize: "0.85rem", color: "var(--cbms-muted, #64748b)" }}>
                      No standing consents recorded for this household.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {(currentHousehold?.consents ?? []).map((c, i) => (
                        <div key={i} style={{ padding: "0.5rem 0.75rem", border: "1px solid var(--color-border, #e2e8f0)", borderRadius: "0.375rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{titleize(c.purpose)}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--cbms-muted, #64748b)" }}>Signed by: {c.grantedBy} · {date(c.grantedAt)}</div>
                          </div>
                          <Chip tone="green">Active</Chip>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <h4 style={{ margin: 0, fontSize: "0.9rem" }}>Add New Consent</h4>
                  <Field label="Purpose" hint={CONSENT_PURPOSE_HINTS[purpose]}>
                    <select
                      className="cbms-select"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                    >
                      {CONSENT_PURPOSES.map((p) => (
                        <option key={p} value={p}>
                          {titleize(p)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Signed by">
                    <input
                      className="cbms-input"
                      placeholder="Name of signing household member"
                      value={grantedBy}
                      onChange={(e) => setGrantedBy(e.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Notes (Optional)">
                    <input
                      className="cbms-input"
                      value={consentNotes}
                      onChange={(e) => setConsentNotes(e.target.value)}
                    />
                  </Field>
                  <button
                    type="button"
                    onClick={recordConsent}
                    disabled={busy}
                    className="cbms-btn"
                    style={{ alignSelf: "flex-start", marginTop: "0.5rem" }}
                  >
                    Record Consent
                  </button>
                </div>
              </div>
            </Panel>
          </div>
        </form>
      </div>

      <div style={{ display: tab === "history" ? "block" : "none" }}>
        <div className="adm-stack" style={{ marginTop: "1rem" }}>
          {/* Members Roster Panel */}
          <Panel title={`Household Members (${currentHousehold?.members?.length ?? 0})`}>
            <DataTable
              columns={[
                {
                  key: "name",
                  header: "Name",
                  render: (r: Inhabitant) => (
                    <>
                      <div className="cbms-table__primary">{fullName(r)}</div>
                      <div className="cbms-table__muted">
                        {r.philsysNo ? `PCN ${r.philsysNo}` : "No PhilSys on file"}
                      </div>
                    </>
                  ),
                },
                {
                  key: "relation",
                  header: "Relation to Head",
                  render: (r: Inhabitant) => titleize(r.relationToHead ?? "Member"),
                },
                {
                  key: "age",
                  header: "Age / Sex",
                  render: (r: Inhabitant) => `${age(r.birthDate) ?? "—"} · ${r.sex === "male" ? "M" : "F"}`,
                },
                {
                  key: "sectors",
                  header: "Sectoral Registry",
                  render: (r: Inhabitant) => <SectorChips row={r} />,
                },
              ]}
              rows={currentHousehold?.members ?? []}
              empty="No inhabitants are linked to this household yet."
              onRowClick={(r: Inhabitant) => router.push(`/inhabitants/${r.id}/edit`)}
            />
          </Panel>

          {/* Citizen & Household Transaction Ledger */}
          <Panel title="Household Assistance & Clearance Ledger">
            <Async loading={history.loading} error={history.error}>
              <DataTable
                columns={[
                  {
                    key: "date",
                    header: "Date/Time",
                    render: (r: TimelineTransaction) => (
                      <>
                        <div className="cbms-table__primary">{date(r.date)}</div>
                        <div className="cbms-table__muted">
                          {new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </>
                    )
                  },
                  {
                    key: "description",
                    header: "Transaction Description",
                    render: (r: TimelineTransaction) => (
                      <>
                        <div className="cbms-table__primary">{r.description}</div>
                        <div className="cbms-table__muted">Reference: {r.id}</div>
                      </>
                    )
                  },
                  {
                    key: "amount",
                    header: "Amount (PHP)",
                    align: "right",
                    render: (r: TimelineTransaction) => r.amount === 0 ? "Free" : peso(r.amount)
                  },
                  {
                    key: "status",
                    header: "Status",
                    render: (r: TimelineTransaction) => <StatusChip status={r.status} />
                  }
                ]}
                rows={history.data || []}
                empty="No transactions on file for this household."
              />
            </Async>
          </Panel>
        </div>
      </div>

      {/* Delete Popup Confirmation Dialog */}
      {showDeletePopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 2000,
            display: "grid",
            placeItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--color-bg-card, #ffffff)",
              border: "1px solid var(--color-border, #e2e8f0)",
              borderRadius: "0.5rem",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "400px",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: "bold", color: "var(--cbms-red, #ce1126)" }}>
                ⚠️ Delete Household Profile
              </h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--cbms-muted, #64748b)", lineHeight: "1.4" }}>
                Are you sure you want to delete this household record? Any linked inhabitants will become unattached from this folder. This action is irreversible.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button
                type="button"
                disabled={busy}
                onClick={() => setShowDeletePopup(false)}
                className="cbms-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={confirmDelete}
                className="cbms-btn"
                style={{ backgroundColor: "var(--cbms-red, #ce1126)", color: "#fff", border: "none" }}
              >
                {busy ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
