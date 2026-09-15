"use client";

import * as React from "react";
import { ApiError, del, patch, post, qs, useApi } from "@cbms/api-client";
import {
  Button,
  Chip,
  DataTable,
  Field,
  PageHead,
  Pagination,
  Panel,
  StatCard,
  StatGrid,
  StatusChip,
  Toolbar,
  date,
  dateTime,
  num,
  pesoAmount,
  relative,
  titleize,
} from "@cbms/ui";
import { ActionResult, Async, SourceChip } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import { PROPERTY_STATUSES, PROPERTY_TYPES } from "../../../lib/labels";
import { downloadText, toCsv } from "../../../lib/download";
import type { Material, Paged, Property } from "../../../lib/types";
import { AssetsTourGuide, AssetsGuideToggle } from "./AssetsTourGuide";

/** DILG governance areas an asset is booked against (mirrors the BAMS category list). */
const GOVERNANCE_AREAS = [
  "Good Fiscal or Financial Administration or Fiscal Sustainability",
  "Disaster Preparedness",
  "Social Protection and Sensitivity Program",
  "Health Compliance and Responsiveness",
  "Peace and Order",
  "Environmental Management",
];

interface PropertyForm {
  name: string;
  type: string;
  status: string;
  category: string;
  capacity: string;
  custodian: string;
  addressLine: string;
  description: string;
  isEvacuationCenter: boolean;
  acquisitionCost: string;
  acquiredAt: string;
}

const EMPTY_FORM: PropertyForm = {
  name: "",
  type: "infrastructure",
  status: "operational",
  category: GOVERNANCE_AREAS[0],
  capacity: "0",
  custodian: "",
  addressLine: "",
  description: "",
  isEvacuationCenter: false,
  acquisitionCost: "",
  acquiredAt: new Date().toISOString().slice(0, 10),
};

function toForm(p: Property): PropertyForm {
  return {
    name: p.name,
    type: p.type,
    status: p.status,
    category: p.category,
    capacity: String(p.capacity ?? 0),
    custodian: p.custodian ?? "",
    addressLine: p.addressLine ?? "",
    description: p.description ?? "",
    isEvacuationCenter: Boolean(p.isEvacuationCenter),
    acquisitionCost: p.acquisitionCost ? String(p.acquisitionCost) : "",
    acquiredAt: p.acquiredAt ? p.acquiredAt.slice(0, 10) : "",
  };
}

/** Category options always include the row's own value, even if it is a legacy string. */
function categoryOptions(current: string): string[] {
  return GOVERNANCE_AREAS.includes(current) || !current
    ? GOVERNANCE_AREAS
    : [current, ...GOVERNANCE_AREAS];
}

interface MaterialForm {
  name: string;
  unit: string;
  quantity: string;
  reorderLevel: string;
  location: string;
}

const EMPTY_MATERIAL_FORM: MaterialForm = {
  name: "",
  unit: "units",
  quantity: "0",
  reorderLevel: "10",
  location: "Barangay Stockroom",
};

export default function PropertiesPage() {
  const { can } = useConsole();
  const mayEncode = can("property:encode");

  const [q, setQ] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [type, setType] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 25;

  const list = useApi<Paged<Property>>(
    `/properties${qs({ q: search, type, status, page, pageSize })}`,
  );
  const materials = useApi<Paged<Material>>("/materials?pageSize=100");

  // Content Drawers State
  const [selectedProperty, setSelectedProperty] = React.useState<Property | null>(null);
  const [propertyDrawerMode, setPropertyDrawerMode] = React.useState<"view" | "edit">("view");
  const [showNewPropertyDrawer, setShowNewPropertyDrawer] = React.useState(false);

  // Guide State (defaults to true on first visit, persisted in localStorage)
  const [tourEnabled, setTourEnabled] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("cbms.assets_guide_enabled");
      if (stored === null) {
        setTourEnabled(true);
      } else {
        setTourEnabled(stored === "true");
      }
    } catch {
      setTourEnabled(true);
    }
  }, []);

  const handleToggleTour = (next: boolean) => {
    setTourEnabled(next);
    try {
      localStorage.setItem("cbms.assets_guide_enabled", String(next));
    } catch {
      // ignore
    }
  };

  const [selectedMaterial, setSelectedMaterial] = React.useState<Material | null>(null);
  const [showNewMaterialDrawer, setShowNewMaterialDrawer] = React.useState(false);

  // Forms
  const [form, setForm] = React.useState<PropertyForm>(EMPTY_FORM);
  const [edit, setEdit] = React.useState<PropertyForm>(EMPTY_FORM);
  const [materialForm, setMaterialForm] = React.useState<MaterialForm>(EMPTY_MATERIAL_FORM);
  const [editMaterial, setEditMaterial] = React.useState<{ quantity: string; reorderLevel: string; location: string }>({
    quantity: "0",
    reorderLevel: "0",
    location: "",
  });

  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const rows = list.data?.items ?? [];
  const infrastructures = rows.filter((p) => p.type === "infrastructure").length;
  const nonInfrastructures = rows.filter((p) => p.type === "non_infrastructure").length;
  const operational = rows.filter((p) => p.status === "operational").length;

  const stock = materials.data?.items ?? [];
  const lowStock = stock.filter((m) => m.quantity <= m.reorderLevel).length;

  function openView(p: Property) {
    setSelectedProperty(p);
    setPropertyDrawerMode("view");
    setEdit(toForm(p));
    setError(null);
    setOk(null);
  }

  function openEdit(p: Property) {
    setSelectedProperty(p);
    setPropertyDrawerMode("edit");
    setEdit(toForm(p));
    setError(null);
    setOk(null);
  }

  function openMaterial(m: Material) {
    setSelectedMaterial(m);
    setEditMaterial({
      quantity: String(m.quantity),
      reorderLevel: String(m.reorderLevel),
      location: m.location ?? "",
    });
    setError(null);
    setOk(null);
  }

  async function createProperty(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const created = await post<Property>("/properties", {
        name: form.name.trim(),
        type: form.type,
        status: form.status,
        category: form.category,
        capacity: Number(form.capacity) || 0,
        isEvacuationCenter: form.isEvacuationCenter,
        acquisitionCost: form.acquisitionCost ? Number(form.acquisitionCost) : null,
        acquiredAt: form.acquiredAt ? new Date(form.acquiredAt).toISOString() : new Date().toISOString(),
        ...(form.custodian.trim() ? { custodian: form.custodian.trim() } : {}),
        ...(form.addressLine.trim() ? { addressLine: form.addressLine.trim() } : {}),
        ...(form.description.trim() ? { description: form.description.trim() } : {}),
      });
      setOk(`“${created.name}” added to the barangay property inventory.`);
      setForm(EMPTY_FORM);
      setShowNewPropertyDrawer(false);
      list.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not save the property.");
    } finally {
      setBusy(false);
    }
  }

  async function saveProperty(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProperty) return;
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const updated = await patch<Property>(`/properties/${selectedProperty.id}`, {
        name: edit.name.trim(),
        type: edit.type,
        status: edit.status,
        category: edit.category,
        capacity: Number(edit.capacity) || 0,
        custodian: edit.custodian.trim(),
        addressLine: edit.addressLine.trim(),
        description: edit.description.trim(),
        isEvacuationCenter: edit.isEvacuationCenter,
        acquisitionCost: edit.acquisitionCost ? Number(edit.acquisitionCost) : null,
        acquiredAt: edit.acquiredAt ? new Date(edit.acquiredAt).toISOString() : selectedProperty.acquiredAt,
      });
      setOk(`“${updated.name || edit.name.trim()}” updated successfully.`);
      setSelectedProperty(updated);
      setPropertyDrawerMode("view");
      list.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not update the property.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteProperty(id: string) {
    if (!window.confirm("Are you sure you want to decommission / delete this asset from the inventory?")) {
      return;
    }
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await del(`/properties/${id}`);
      setOk("Asset removed from the barangay property inventory.");
      setSelectedProperty(null);
      list.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not delete property.");
    } finally {
      setBusy(false);
    }
  }

  async function createMaterial(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const created = await post<Material>("/materials", {
        name: materialForm.name.trim(),
        unit: materialForm.unit.trim(),
        quantity: Number(materialForm.quantity) || 0,
        reorderLevel: Number(materialForm.reorderLevel) || 0,
        location: materialForm.location.trim() || "Barangay Stockroom",
      });
      setOk(`“${created.name}” added to materials and supplies.`);
      setMaterialForm(EMPTY_MATERIAL_FORM);
      setShowNewMaterialDrawer(false);
      materials.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not save material.");
    } finally {
      setBusy(false);
    }
  }

  async function saveMaterial(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMaterial) return;
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const updated = await patch<Material>(`/materials/${selectedMaterial.id}`, {
        quantity: Number(editMaterial.quantity) || 0,
        reorderLevel: Number(editMaterial.reorderLevel) || 0,
        location: editMaterial.location.trim(),
      });
      setOk(`Stock for “${selectedMaterial.name}” updated to ${num(updated.quantity)} ${updated.unit}.`);
      setSelectedMaterial(updated);
      materials.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not update material stock.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteMaterial(id: string) {
    if (!window.confirm("Are you sure you want to remove this supply item from inventory?")) {
      return;
    }
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await del(`/materials/${id}`);
      setOk("Material item removed from inventory.");
      setSelectedMaterial(null);
      materials.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not delete material.");
    } finally {
      setBusy(false);
    }
  }

  function exportCsv() {
    downloadText(
      toCsv(
        [
          "Property",
          "Type",
          "Status",
          "Governance area",
          "Capacity",
          "Custodian",
          "Acquisition Cost",
          "Evacuation Center",
          "Address",
          "Source",
          "Last updated",
        ],
        rows.map((p) => [
          p.name,
          titleize(p.type),
          titleize(p.status),
          p.category,
          p.capacity,
          p.custodian ?? "",
          p.acquisitionCost ? pesoAmount(p.acquisitionCost) : "",
          p.isEvacuationCenter ? "Yes" : "No",
          p.addressLine ?? "",
          p.source ?? "CBMS",
          p.updatedAt,
        ]),
      ),
      `properties-${new Date().toISOString().slice(0, 10)}.csv`,
      "text/csv;charset=utf-8;",
    );
  }

  return (
    <>
      <PageHead
        title="Barangay Assets"
        subtitle="Inventory of barangay real and personal property. Every asset carries a named custodian — the accountability record required by Local Government Code §375."
        breadcrumb="Assets & DRRM"
        parity="BAMS"
      />

      <ActionResult error={error} success={ok} />

      <div id="tour-assets-stats">
        <StatGrid>
          <StatCard
            label="Total properties"
            value={num(list.data?.total)}
            hint="Across every page of this filter"
            icon="🏢"
          />
          <StatCard
            label="Infrastructures"
            value={num(infrastructures)}
            hint="On this page — halls, courts, roads, facilities"
            icon="🏗"
          />
          <StatCard
            label="Non-infrastructures"
            value={num(nonInfrastructures)}
            hint="On this page — equipment, vehicles, furniture"
            icon="📦"
            tone="gold"
          />
          <StatCard
            label="Available / operational"
            value={num(operational)}
            hint="On this page — serviceable and in use"
            icon="✅"
            tone={operational > 0 ? "green" : "gold"}
          />
        </StatGrid>
      </div>

      <Panel padded={false}>
        <div id="tour-assets-toolbar">
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
                placeholder="Search name, governance area or custodian…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Button type="submit">Search</Button>
            </form>
            <select
              className="cbms-select"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All types</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {titleize(t)}
                </option>
              ))}
            </select>
            <select
              className="cbms-select"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All statuses</option>
              {PROPERTY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {titleize(s)}
                </option>
              ))}
            </select>
            <div className="cbms-toolbar__spacer" />
            <span className="adm-muted">{num(list.data?.total)} propert(ies)</span>
            <Button id="tour-assets-export-btn" onClick={exportCsv} disabled={rows.length === 0}>
              ⬇ Export CSV
            </Button>
            {mayEncode && (
              <Button
                id="tour-assets-new-btn"
                variant="primary"
                onClick={() => {
                  setShowNewPropertyDrawer(true);
                  setSelectedProperty(null);
                  setForm(EMPTY_FORM);
                }}
              >
                + New property
              </Button>
            )}
          </Toolbar>
        </div>

        <div id="tour-assets-table">
          <Async loading={list.loading} error={list.error}>
            <DataTable
              onRowClick={(p) => openView(p)}
            columns={[
              {
                key: "name",
                header: "Property",
                render: (p) => (
                  <>
                    <span className="adm-chiprow">
                      <span className="cbms-table__primary" style={{ fontWeight: 600 }}>{p.name}</span>
                      <SourceChip source={p.source} />
                      {p.isEvacuationCenter && <Chip tone="blue">Evacuation centre</Chip>}
                    </span>
                    {p.addressLine && <div className="cbms-table__muted">{p.addressLine}</div>}
                  </>
                ),
              },
              {
                key: "type",
                header: "Type",
                render: (p) => (
                  <Chip tone={p.type === "infrastructure" ? "navy" : "gray"}>
                    {titleize(p.type)}
                  </Chip>
                ),
              },
              { key: "status", header: "Status", render: (p) => <StatusChip status={p.status} /> },
              {
                key: "category",
                header: "Governance area",
                render: (p) => <span className="cbms-table__muted">{p.category}</span>,
              },
              {
                key: "capacity",
                header: "Capacity",
                align: "right",
                render: (p) =>
                  p.capacity > 0 ? (
                    num(p.capacity)
                  ) : (
                    <span className="cbms-table__muted">—</span>
                  ),
              },
              {
                key: "custodian",
                header: "Custodian",
                render: (p) =>
                  p.custodian ? (
                    <span style={{ fontWeight: 500 }}>{p.custodian}</span>
                  ) : (
                    <span className="cbms-table__muted">Unassigned</span>
                  ),
              },
              {
                key: "updatedAt",
                header: "Updated",
                render: (p) => <span title={dateTime(p.updatedAt)}>{relative(p.updatedAt)}</span>,
              },
              {
                key: "action",
                header: "Action",
                render: (p) => (
                  <div style={{ display: "flex", gap: 6 }}>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openView(p);
                      }}
                    >
                      View
                    </Button>
                    {mayEncode && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(p);
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
            rows={rows}
            empty="No properties match this filter."
          />
        </Async>

          <Pagination page={page} pageSize={pageSize} total={list.data?.total ?? 0} onPage={setPage} />
        </div>
      </Panel>

      <div style={{ height: 16 }} />

      <div id="tour-assets-materials">
        <Panel
          title="Materials & supplies"
          padded={false}
          actions={
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Chip tone={lowStock > 0 ? "red" : "green"}>
                {lowStock > 0 ? `${num(lowStock)} at or below reorder level` : "Stock levels healthy"}
              </Chip>
              {mayEncode && (
                <Button size="sm" onClick={() => setShowNewMaterialDrawer(true)}>
                  + New supply item
                </Button>
              )}
            </div>
          }
        >
          <Async loading={materials.loading} error={materials.error}>
            <DataTable
              onRowClick={(m) => openMaterial(m)}
              columns={[
                {
                  key: "name",
                  header: "Item",
                  render: (m) => (
                    <span className="adm-chiprow">
                      <span className="cbms-table__primary" style={{ fontWeight: 600 }}>{m.name}</span>
                      {m.quantity <= m.reorderLevel && <Chip tone="red">Reorder</Chip>}
                    </span>
                  ),
                },
                { key: "unit", header: "Unit" },
                {
                  key: "quantity",
                  header: "On hand",
                  align: "right",
                  render: (m) => (
                    <strong style={{ color: m.quantity <= m.reorderLevel ? "var(--cbms-red)" : undefined }}>
                      {num(m.quantity)}
                    </strong>
                  ),
                },
                {
                  key: "reorderLevel",
                  header: "Reorder level",
                  align: "right",
                  render: (m) => num(m.reorderLevel),
                },
                {
                  key: "location",
                  header: "Storage location",
                  render: (m) => m.location ?? <span className="cbms-table__muted">—</span>,
                },
                {
                  key: "updatedAt",
                  header: "Updated",
                  render: (m) => <span title={dateTime(m.updatedAt)}>{relative(m.updatedAt)}</span>,
                },
                {
                  key: "action",
                  header: "Action",
                  render: (m) => (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openMaterial(m);
                      }}
                    >
                      Adjust
                    </Button>
                  ),
                },
              ]}
              rows={stock}
              empty="No supplies recorded yet."
            />
          </Async>
        </Panel>
      </div>

      {/* ========================================================================= */}
      {/* 1. CONTENT DRAWER: VIEW / INSPECT BARANGAY ASSET (APPEARING ON THE RIGHT) */}
      {/* ========================================================================= */}
      {selectedProperty && propertyDrawerMode === "view" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            zIndex: 1500,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setSelectedProperty(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "580px",
              backgroundColor: "var(--cbms-surface, #ffffff)",
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
                padding: "16px 20px",
                borderBottom: "1px solid var(--cbms-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.02)",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--cbms-navy)" }}>
                  🏢 {selectedProperty.name}
                </h3>
                <span style={{ fontSize: "0.8rem", color: "var(--cbms-muted)" }}>
                  Asset ID: {selectedProperty.id.toUpperCase()} · {titleize(selectedProperty.type)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProperty(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "var(--cbms-muted)",
                  padding: "4px 8px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Badges Row */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <StatusChip status={selectedProperty.status} />
                <Chip tone={selectedProperty.type === "infrastructure" ? "navy" : "gray"}>
                  {titleize(selectedProperty.type)}
                </Chip>
                {selectedProperty.isEvacuationCenter && (
                  <Chip tone="blue">🛡️ Designated Evacuation Sanctuary</Chip>
                )}
                <SourceChip source={selectedProperty.source} />
              </div>

              {/* Custodian Accountability Card (LGC §375) */}
              <div
                style={{
                  border: "1px solid var(--cbms-border)",
                  borderRadius: "8px",
                  padding: "14px 16px",
                  backgroundColor: "rgba(10, 37, 64, 0.03)",
                }}
              >
                <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--cbms-navy)", fontWeight: 700, marginBottom: 6 }}>
                  ⚖️ Accountable Officer (Local Government Code §375)
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--cbms-navy)", marginBottom: 4 }}>
                  {selectedProperty.custodian || "Unassigned Accountable Custodian"}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--cbms-muted)", lineHeight: 1.4 }}>
                  Pursuant to RA 7160 (LGC §375), the named custodian has primary physical custody and accountability for this barangay property, and is responsible for inventory integrity and turnover compliance.
                </div>
              </div>

              {/* Valuation & Acquisition */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  padding: "14px",
                  backgroundColor: "var(--cbms-bg, #f8f9fa)",
                  borderRadius: "8px",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--cbms-muted)" }}>Acquisition Valuation</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--cbms-green, #107e3e)" }}>
                    {selectedProperty.acquisitionCost ? pesoAmount(selectedProperty.acquisitionCost) : "₱0.00"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--cbms-muted)" }}>Acquired On</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                    {selectedProperty.acquiredAt ? date(selectedProperty.acquiredAt) : "—"}
                  </div>
                </div>
              </div>

              {/* Governance Area & Capacity */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--cbms-muted)", marginBottom: 2 }}>Governance Area (SGLGB)</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{selectedProperty.category}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--cbms-muted)", marginBottom: 2 }}>Capacity</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    {selectedProperty.capacity > 0 ? `${num(selectedProperty.capacity)} persons` : "N/A (Equipment / Non-personnel)"}
                  </div>
                </div>
              </div>

              {/* Address / Location */}
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--cbms-muted)", marginBottom: 2 }}>Physical Location / Address</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                  {selectedProperty.addressLine || "Barangay Hall Complex / Compound"}
                </div>
              </div>

              {/* Description */}
              {selectedProperty.description && (
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--cbms-muted)", marginBottom: 2 }}>Condition & Technical Description</div>
                  <div style={{ fontSize: "0.85rem", lineHeight: 1.5, color: "var(--cbms-fg)", backgroundColor: "rgba(0,0,0,0.02)", padding: "10px 12px", borderRadius: 6, border: "1px solid var(--cbms-border)" }}>
                    {selectedProperty.description}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div style={{ fontSize: "0.75rem", color: "var(--cbms-muted)", marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--cbms-border)" }}>
                Created {dateTime(selectedProperty.createdAt)} · Last updated {dateTime(selectedProperty.updatedAt)}
              </div>
            </div>

            {/* Footer Actions */}
            <div
              style={{
                padding: "16px 20px",
                borderTop: "1px solid var(--cbms-border)",
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                backgroundColor: "rgba(0,0,0,0.02)",
              }}
            >
              {mayEncode ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <Button variant="primary" onClick={() => setPropertyDrawerMode("edit")}>
                    ✏️ Edit Asset
                  </Button>
                  <Button variant="danger" onClick={() => deleteProperty(selectedProperty.id)} disabled={busy}>
                    🗑️ Decommission
                  </Button>
                </div>
              ) : (
                <div />
              )}
              <Button onClick={() => setSelectedProperty(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CONTENT DRAWER: EDIT BARANGAY ASSET (APPEARING ON THE RIGHT) */}
      {/* ========================================================================= */}
      {selectedProperty && propertyDrawerMode === "edit" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            zIndex: 1500,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setPropertyDrawerMode("view")}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "580px",
              backgroundColor: "var(--cbms-surface, #ffffff)",
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
                padding: "16px 20px",
                borderBottom: "1px solid var(--cbms-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.02)",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--cbms-navy)" }}>
                  ✏️ Edit Property — {selectedProperty.name}
                </h3>
                <span style={{ fontSize: "0.8rem", color: "var(--cbms-muted)" }}>
                  Asset ID: {selectedProperty.id.toUpperCase()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPropertyDrawerMode("view")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "var(--cbms-muted)",
                  padding: "4px 8px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={saveProperty} style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "auto" }}>
              <div style={{ padding: "20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                <Field label="Property name">
                  <input
                    className="cbms-input"
                    value={edit.name}
                    onChange={(e) => setEdit((f) => ({ ...f, name: e.target.value }))}
                    minLength={2}
                    required
                  />
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Type">
                    <select
                      className="cbms-select"
                      value={edit.type}
                      onChange={(e) => setEdit((f) => ({ ...f, type: e.target.value }))}
                    >
                      {PROPERTY_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {titleize(t)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Status">
                    <select
                      className="cbms-select"
                      value={edit.status}
                      onChange={(e) => setEdit((f) => ({ ...f, status: e.target.value }))}
                    >
                      {PROPERTY_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {titleize(s)}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Custodian (Accountable Officer LGC §375)" hint="Turnover of custody is an auditable inventory change.">
                  <input
                    className="cbms-input"
                    value={edit.custodian}
                    onChange={(e) => setEdit((f) => ({ ...f, custodian: e.target.value }))}
                    placeholder="Full name of accountable officer"
                  />
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Acquisition Cost (₱)" hint="Valuation in Pesos">
                    <input
                      className="cbms-input"
                      type="number"
                      min={0}
                      value={edit.acquisitionCost}
                      onChange={(e) => setEdit((f) => ({ ...f, acquisitionCost: e.target.value }))}
                      placeholder="e.g. 1500000"
                    />
                  </Field>
                  <Field label="Acquisition Date">
                    <input
                      className="cbms-input"
                      type="date"
                      value={edit.acquiredAt}
                      onChange={(e) => setEdit((f) => ({ ...f, acquiredAt: e.target.value }))}
                    />
                  </Field>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Capacity" hint="Persons served or seating">
                    <input
                      className="cbms-input"
                      type="number"
                      min={0}
                      value={edit.capacity}
                      onChange={(e) => setEdit((f) => ({ ...f, capacity: e.target.value }))}
                    />
                  </Field>
                  <Field label="Evacuation Center?">
                    <label style={{ display: "flex", alignItems: "center", gap: 8, height: 38, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={edit.isEvacuationCenter}
                        onChange={(e) => setEdit((f) => ({ ...f, isEvacuationCenter: e.target.checked }))}
                      />
                      <span style={{ fontSize: "0.875rem" }}>Designated Evacuation Facility</span>
                    </label>
                  </Field>
                </div>

                <Field label="Governance Area (SGLGB)">
                  <select
                    className="cbms-select"
                    value={edit.category}
                    onChange={(e) => setEdit((f) => ({ ...f, category: e.target.value }))}
                  >
                    {categoryOptions(edit.category).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Address / Storage Location">
                  <input
                    className="cbms-input"
                    value={edit.addressLine}
                    onChange={(e) => setEdit((f) => ({ ...f, addressLine: e.target.value }))}
                    placeholder="Specific room, compound or street"
                  />
                </Field>

                <Field label="Condition & Description">
                  <textarea
                    className="cbms-textarea"
                    rows={3}
                    value={edit.description}
                    onChange={(e) => setEdit((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Equipment specs, condition notes, coverage…"
                  />
                </Field>
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: "16px 20px",
                  borderTop: "1px solid var(--cbms-border)",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  backgroundColor: "rgba(0,0,0,0.02)",
                }}
              >
                <Button type="button" onClick={() => setPropertyDrawerMode("view")} disabled={busy}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={busy}>
                  {busy ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CONTENT DRAWER: NEW BARANGAY ASSET (APPEARING ON THE RIGHT) */}
      {/* ========================================================================= */}
      {showNewPropertyDrawer && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            zIndex: 1500,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setShowNewPropertyDrawer(false)}
        >
          <div
            id="tour-assets-new-drawer"
            style={{
              width: "100%",
              maxWidth: "580px",
              backgroundColor: "var(--cbms-surface, #ffffff)",
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
                padding: "16px 20px",
                borderBottom: "1px solid var(--cbms-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.02)",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--cbms-navy)" }}>
                  + Register New Barangay Asset
                </h3>
                <span style={{ fontSize: "0.8rem", color: "var(--cbms-muted)" }}>
                  Local Government Code §375 Property & Equipment Record
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowNewPropertyDrawer(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "var(--cbms-muted)",
                  padding: "4px 8px",
                }}
              >
                ✕
              </button>
            </div>

            {/* New Property Form */}
            <form onSubmit={createProperty} style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "auto" }}>
              <div style={{ padding: "20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                <Field label="Property name">
                  <input
                    className="cbms-input"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. BARANGAY MULTI-PURPOSE VEHICLE"
                    minLength={2}
                    required
                  />
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Type">
                    <select
                      className="cbms-select"
                      value={form.type}
                      onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    >
                      {PROPERTY_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {titleize(t)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Status">
                    <select
                      className="cbms-select"
                      value={form.status}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    >
                      {PROPERTY_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {titleize(s)}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Custodian (Accountable Officer LGC §375)" hint="The named officer held accountable under statutory law.">
                  <input
                    className="cbms-input"
                    value={form.custodian}
                    onChange={(e) => setForm((f) => ({ ...f, custodian: e.target.value }))}
                    placeholder="Full name of the accountable officer"
                  />
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Acquisition Cost (₱)" hint="Valuation in Pesos">
                    <input
                      className="cbms-input"
                      type="number"
                      min={0}
                      value={form.acquisitionCost}
                      onChange={(e) => setForm((f) => ({ ...f, acquisitionCost: e.target.value }))}
                      placeholder="e.g. 2500000"
                    />
                  </Field>
                  <Field label="Acquisition Date">
                    <input
                      className="cbms-input"
                      type="date"
                      value={form.acquiredAt}
                      onChange={(e) => setForm((f) => ({ ...f, acquiredAt: e.target.value }))}
                    />
                  </Field>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Capacity" hint="Persons served or seating capacity">
                    <input
                      className="cbms-input"
                      type="number"
                      min={0}
                      value={form.capacity}
                      onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                    />
                  </Field>
                  <Field label="Evacuation Center?">
                    <label style={{ display: "flex", alignItems: "center", gap: 8, height: 38, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={form.isEvacuationCenter}
                        onChange={(e) => setForm((f) => ({ ...f, isEvacuationCenter: e.target.checked }))}
                      />
                      <span style={{ fontSize: "0.875rem" }}>Designated Evacuation Sanctuary</span>
                    </label>
                  </Field>
                </div>

                <Field label="Governance Area (SGLGB)" hint="The SGLGB governance pillar this asset is booked against.">
                  <select
                    className="cbms-select"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    {GOVERNANCE_AREAS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Address / Storage Location">
                  <input
                    className="cbms-input"
                    value={form.addressLine}
                    onChange={(e) => setForm((f) => ({ ...f, addressLine: e.target.value }))}
                    placeholder="Specific hall room, motorpool bay, or road"
                  />
                </Field>

                <Field label="Description & Technical Details">
                  <textarea
                    className="cbms-textarea"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Physical condition, make/model, serial number, coverage…"
                  />
                </Field>
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: "16px 20px",
                  borderTop: "1px solid var(--cbms-border)",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  backgroundColor: "rgba(0,0,0,0.02)",
                }}
              >
                <Button type="button" onClick={() => setShowNewPropertyDrawer(false)} disabled={busy}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={busy}>
                  {busy ? "Saving…" : "Register Asset"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CONTENT DRAWER: MATERIAL & SUPPLY ITEM / STOCK ADJUST (RIGHT DRAWER)   */}
      {/* ========================================================================= */}
      {selectedMaterial && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            zIndex: 1500,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setSelectedMaterial(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "540px",
              backgroundColor: "var(--cbms-surface, #ffffff)",
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
                padding: "16px 20px",
                borderBottom: "1px solid var(--cbms-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.02)",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--cbms-navy)" }}>
                  📦 {selectedMaterial.name}
                </h3>
                <span style={{ fontSize: "0.8rem", color: "var(--cbms-muted)" }}>
                  Item ID: {selectedMaterial.id.toUpperCase()} · Material & Supplies
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMaterial(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "var(--cbms-muted)",
                  padding: "4px 8px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <form onSubmit={saveMaterial} style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "auto" }}>
              <div style={{ padding: "20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Stock Summary Card */}
                <div
                  style={{
                    border: "1px solid var(--cbms-border)",
                    borderRadius: 8,
                    padding: 16,
                    backgroundColor: selectedMaterial.quantity <= selectedMaterial.reorderLevel ? "rgba(239, 68, 68, 0.06)" : "rgba(16, 126, 62, 0.05)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--cbms-muted)" }}>Current Inventory Level</span>
                    {selectedMaterial.quantity <= selectedMaterial.reorderLevel ? (
                      <Chip tone="red">⚠️ Reorder Warning</Chip>
                    ) : (
                      <Chip tone="green">✅ Adequate Supply</Chip>
                    )}
                  </div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: selectedMaterial.quantity <= selectedMaterial.reorderLevel ? "var(--cbms-red)" : "var(--cbms-green)" }}>
                    {num(selectedMaterial.quantity)} <span style={{ fontSize: "1rem", fontWeight: 500 }}>{selectedMaterial.unit}</span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--cbms-muted)", marginTop: 4 }}>
                    Reorder Threshold: <strong>{num(selectedMaterial.reorderLevel)} {selectedMaterial.unit}</strong>
                  </div>
                </div>

                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--cbms-navy)", marginTop: 6 }}>
                  Adjust Stock Count & Location
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label={`On Hand Count (${selectedMaterial.unit})`}>
                    <input
                      className="cbms-input"
                      type="number"
                      min={0}
                      value={editMaterial.quantity}
                      onChange={(e) => setEditMaterial((m) => ({ ...m, quantity: e.target.value }))}
                      required
                    />
                  </Field>
                  <Field label={`Reorder Level (${selectedMaterial.unit})`}>
                    <input
                      className="cbms-input"
                      type="number"
                      min={0}
                      value={editMaterial.reorderLevel}
                      onChange={(e) => setEditMaterial((m) => ({ ...m, reorderLevel: e.target.value }))}
                      required
                    />
                  </Field>
                </div>

                <Field label="Storage Location / Bay">
                  <input
                    className="cbms-input"
                    value={editMaterial.location}
                    onChange={(e) => setEditMaterial((m) => ({ ...m, location: e.target.value }))}
                    placeholder="e.g. Relief Warehouse Shelf 3"
                  />
                </Field>

                <div style={{ fontSize: "0.75rem", color: "var(--cbms-muted)", marginTop: "auto" }}>
                  Last verified & adjusted: {dateTime(selectedMaterial.updatedAt)}
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: "16px 20px",
                  borderTop: "1px solid var(--cbms-border)",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  backgroundColor: "rgba(0,0,0,0.02)",
                }}
              >
                {mayEncode ? (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => deleteMaterial(selectedMaterial.id)}
                    disabled={busy}
                  >
                    🗑️ Remove Item
                  </Button>
                ) : (
                  <div />
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <Button type="button" onClick={() => setSelectedMaterial(null)} disabled={busy}>
                    Close
                  </Button>
                  {mayEncode && (
                    <Button type="submit" variant="primary" disabled={busy}>
                      {busy ? "Saving…" : "Update Stock"}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CONTENT DRAWER: NEW MATERIAL / SUPPLY RECORD (RIGHT DRAWER)             */}
      {/* ========================================================================= */}
      {showNewMaterialDrawer && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            zIndex: 1500,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setShowNewMaterialDrawer(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "540px",
              backgroundColor: "var(--cbms-surface, #ffffff)",
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
                padding: "16px 20px",
                borderBottom: "1px solid var(--cbms-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.02)",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--cbms-navy)" }}>
                  + Register Supply / Material
                </h3>
                <span style={{ fontSize: "0.8rem", color: "var(--cbms-muted)" }}>
                  Add emergency relief, office, or health supplies to inventory
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowNewMaterialDrawer(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "var(--cbms-muted)",
                  padding: "4px 8px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={createMaterial} style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "auto" }}>
              <div style={{ padding: "20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                <Field label="Item description / Name">
                  <input
                    className="cbms-input"
                    value={materialForm.name}
                    onChange={(e) => setMaterialForm((m) => ({ ...m, name: e.target.value }))}
                    placeholder="e.g. Adult Life Vests with Whistle"
                    minLength={2}
                    required
                  />
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Unit of Measure">
                    <input
                      className="cbms-input"
                      value={materialForm.unit}
                      onChange={(e) => setMaterialForm((m) => ({ ...m, unit: e.target.value }))}
                      placeholder="e.g. boxes, pcs, kits, drums"
                      required
                    />
                  </Field>
                  <Field label="Initial Quantity">
                    <input
                      className="cbms-input"
                      type="number"
                      min={0}
                      value={materialForm.quantity}
                      onChange={(e) => setMaterialForm((m) => ({ ...m, quantity: e.target.value }))}
                      required
                    />
                  </Field>
                </div>

                <Field label="Reorder Threshold" hint="Triggers warning badge when on-hand stock reaches or drops below this count.">
                  <input
                    className="cbms-input"
                    type="number"
                    min={0}
                    value={materialForm.reorderLevel}
                    onChange={(e) => setMaterialForm((m) => ({ ...m, reorderLevel: e.target.value }))}
                    required
                  />
                </Field>

                <Field label="Storage Location">
                  <input
                    className="cbms-input"
                    value={materialForm.location}
                    onChange={(e) => setMaterialForm((m) => ({ ...m, location: e.target.value }))}
                    placeholder="e.g. Disaster Operations Storage Bay B"
                  />
                </Field>
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: "16px 20px",
                  borderTop: "1px solid var(--cbms-border)",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  backgroundColor: "rgba(0,0,0,0.02)",
                }}
              >
                <Button type="button" onClick={() => setShowNewMaterialDrawer(false)} disabled={busy}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={busy}>
                  {busy ? "Saving…" : "Add to Inventory"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Tour Guide & Static Floating Toggle */}
      <AssetsTourGuide
        enabled={tourEnabled}
        onToggle={handleToggleTour}
        onOpenNew={() => {
          setShowNewPropertyDrawer(true);
          setSelectedProperty(null);
          setForm(EMPTY_FORM);
        }}
        onCloseNew={() => setShowNewPropertyDrawer(false)}
        isNewOpen={showNewPropertyDrawer}
      />
      <AssetsGuideToggle
        enabled={tourEnabled}
        onToggle={handleToggleTour}
      />
    </>
  );
}
