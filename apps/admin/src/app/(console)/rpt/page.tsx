"use client";

import * as React from "react";
import Link from "next/link";
import { ApiError, post, patch, del, useApi } from "@cbms/api-client";
import {
  Alert,
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
  dateTime,
  pesoAmount,
  titleize,
} from "@cbms/ui";
import { Async, ActionResult } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import type { Inhabitant, Paged } from "../../../lib/types";

type PropertyType = "residential" | "commercial" | "industrial" | "agricultural" | "special";

interface RptProperty {
  id: string;
  barangayId: string;
  taxDeclarationNo: string;
  ownerInhabitantId?: string | null;
  ownerName: string;
  propertyType: PropertyType;
  assessedValue: number;
  marketValue: number;
  addressLine: string;
  purok?: string;
  lotNo?: string;
  blockNo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RptTaxDue {
  id: string;
  rptPropertyId: string;
  taxYear: number;
  basicTaxAmount: number;
  sefTaxAmount: number;
  penaltyAmount: number;
  totalAmount: number;
  paymentStatus: "unpaid" | "partially_paid" | "fully_paid" | "exempt";
  paidAt?: string | null;
  orNumber?: string | null;
  discountAmount?: number;
  isActive: boolean;
  createdAt?: string;
}

const ASSESSMENT_LEVELS: Record<string, number> = {
  residential: 0.20,
  commercial: 0.50,
  industrial: 0.50,
  agricultural: 0.40,
  special: 0.10,
};

const PUROKS = [
  "Purok 1",
  "Purok 2",
  "Purok 3",
  "Purok 4",
  "Purok 5",
  "Purok 6",
  "Purok 7",
];

export default function RptPage() {
  const { can } = useConsole();
  const mayEncode = can("finance:view");

  const [search, setSearch] = React.useState("");
  const [q, setQ] = React.useState("");
  const [filterType, setFilterType] = React.useState("all");
  const [filterStatus, setFilterStatus] = React.useState("all");

  const list = useApi<RptProperty[]>("/rpt");
  const duesList = useApi<RptTaxDue[]>("/rpt/dues");
  const inhabitantsList = useApi<Paged<Inhabitant>>("/inhabitants?pageSize=100");

  // Drawer states
  const [declareDrawerOpen, setDeclareDrawerOpen] = React.useState(false);
  const [selectedProperty, setSelectedProperty] = React.useState<RptProperty | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);

  // Operations state
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  // Payment confirmation in drawer
  const [collectingPayment, setCollectingPayment] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<"cash" | "check" | "gcash" | "maya">("cash");

  // Declaration form state
  const [form, setForm] = React.useState({
    taxDeclarationNo: "",
    ownerInhabitantId: "",
    ownerName: "",
    propertyType: "residential" as PropertyType,
    marketValue: "1500000",
    assessedValue: "300000",
    addressLine: "",
    purok: "Purok 1",
    lotNo: "",
    blockNo: "",
  });

  // Edit form state
  const [editForm, setEditForm] = React.useState({
    ownerName: "",
    propertyType: "residential" as PropertyType,
    marketValue: "0",
    assessedValue: "0",
    addressLine: "",
    purok: "Purok 1",
    lotNo: "",
    blockNo: "",
  });

  const properties = list.data || [];
  const dues = duesList.data || [];
  const citizens = inhabitantsList.data?.items || [];

  // When opening edit mode, populate edit form from selected property
  React.useEffect(() => {
    if (selectedProperty && isEditing) {
      setEditForm({
        ownerName: selectedProperty.ownerName || "",
        propertyType: selectedProperty.propertyType || "residential",
        marketValue: String(selectedProperty.marketValue || 0),
        assessedValue: String(selectedProperty.assessedValue || 0),
        addressLine: selectedProperty.addressLine || "",
        purok: selectedProperty.purok || "Purok 1",
        lotNo: selectedProperty.lotNo || "",
        blockNo: selectedProperty.blockNo || "",
      });
    }
  }, [selectedProperty, isEditing]);

  // Keep selectedProperty updated when list reloads
  React.useEffect(() => {
    if (selectedProperty) {
      const updated = properties.find((p) => p.id === selectedProperty.id);
      if (updated) {
        setSelectedProperty(updated);
      }
    }
  }, [properties]);

  // Auto-generate next TDN when opening declare drawer
  function openDeclareDrawer() {
    const nextNum = 100 + properties.length + 1;
    setForm({
      taxDeclarationNo: `TD-2026-BAR-00${nextNum}`,
      ownerInhabitantId: "",
      ownerName: "",
      propertyType: "residential",
      marketValue: "1500000",
      assessedValue: "300000",
      addressLine: "",
      purok: "Purok 1",
      lotNo: "",
      blockNo: "",
    });
    setError(null);
    setOk(null);
    setDeclareDrawerOpen(true);
  }

  // Handle market value change and auto-calculate suggested assessed value in declare form
  function handleMarketValueChange(val: string, type: string) {
    const mv = Number(val) || 0;
    const rate = ASSESSMENT_LEVELS[type] ?? 0.20;
    setForm((prev) => ({
      ...prev,
      marketValue: val,
      assessedValue: String(Math.round(mv * rate)),
    }));
  }

  // Handle property type change in declare form
  function handleTypeChange(type: any) {
    const mv = Number(form.marketValue) || 0;
    const rate = ASSESSMENT_LEVELS[type] ?? 0.20;
    setForm((prev) => ({
      ...prev,
      propertyType: type,
      assessedValue: String(Math.round(mv * rate)),
    }));
  }

  // Filter properties
  const filtered = properties.filter((p) => {
    const matchesType = filterType === "all" || p.propertyType === filterType;
    const due = dues.find((d) => d.rptPropertyId === p.id);
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "fully_paid" && due?.paymentStatus === "fully_paid") ||
      (filterStatus === "unpaid" && (!due || due.paymentStatus === "unpaid" || due.paymentStatus === "partially_paid")) ||
      (filterStatus === "exempt" && due?.paymentStatus === "exempt");

    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      p.taxDeclarationNo.toLowerCase().includes(query) ||
      p.ownerName.toLowerCase().includes(query) ||
      (p.addressLine && p.addressLine.toLowerCase().includes(query)) ||
      (p.purok && p.purok.toLowerCase().includes(query));

    return matchesType && matchesStatus && matchesSearch;
  });

  const totalAssessed = properties.reduce((acc, curr) => acc + (curr.assessedValue || 0), 0);
  const totalMarket = properties.reduce((acc, curr) => acc + (curr.marketValue || 0), 0);
  const fullyPaidCount = dues.filter((d) => d.paymentStatus === "fully_paid").length;
  const delinquentCount = dues.filter((d) => d.paymentStatus === "unpaid" || d.paymentStatus === "partially_paid").length;

  // CRUD: 1. CREATE PROPERTY
  async function declareProperty(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const created = await post<RptProperty>("/rpt", {
        ...form,
        assessedValue: Number(form.assessedValue) || 0,
        marketValue: Number(form.marketValue) || 0,
      });
      setOk(`Real property declared successfully under TDN #${created.taxDeclarationNo}.`);
      setDeclareDrawerOpen(false);
      list.reload();
      duesList.reload();
      // Select the newly declared property to show its drawer
      setSelectedProperty(created);
    } catch (err) {
      setError((err as ApiError)?.message || "Failed to declare real property.");
    } finally {
      setBusy(false);
    }
  }

  // CRUD: 2. UPDATE PROPERTY
  async function updateProperty(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProperty) return;
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const updated = await patch<RptProperty>(`/rpt/${selectedProperty.id}`, {
        ...editForm,
        assessedValue: Number(editForm.assessedValue) || 0,
        marketValue: Number(editForm.marketValue) || 0,
      });
      setOk(`Assessment details updated for TDN #${selectedProperty.taxDeclarationNo}.`);
      setIsEditing(false);
      setSelectedProperty(updated);
      list.reload();
      duesList.reload();
    } catch (err) {
      setError((err as ApiError)?.message || "Failed to update property assessment.");
    } finally {
      setBusy(false);
    }
  }

  // CRUD: 3. DELETE / ARCHIVE PROPERTY
  async function deleteProperty() {
    if (!selectedProperty) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete or archive declaration TDN #${selectedProperty.taxDeclarationNo}? This action cannot be undone.`
    );
    if (!confirmed) return;

    setBusy(true);
    setError(null);
    try {
      await del(`/rpt/${selectedProperty.id}`);
      setOk(`Property declaration TDN #${selectedProperty.taxDeclarationNo} was removed.`);
      setSelectedProperty(null);
      setIsEditing(false);
      list.reload();
      duesList.reload();
    } catch (err) {
      setError((err as ApiError)?.message || "Failed to delete property declaration.");
    } finally {
      setBusy(false);
    }
  }

  // CRUD: 4. COLLECT RPT TAX PAYMENT
  async function handleCollectPayment(propertyId: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await post<{ success: boolean; orNumber: string }>(`/rpt/${propertyId}/pay`, {
        paymentMethod,
      });
      setOk(`Real Property Tax payment collected! Official Receipt #${res.orNumber} issued and posted to General Ledger.`);
      setCollectingPayment(false);
      list.reload();
      duesList.reload();
    } catch (err) {
      setError((err as ApiError)?.message || "Failed to process RPT payment.");
    } finally {
      setBusy(false);
    }
  }

  // Find tax due for currently selected property
  const selectedDue = selectedProperty ? dues.find((d) => d.rptPropertyId === selectedProperty.id) : null;

  return (
    <>
      <PageHead
        title="Real Property Tax (RPT)"
        subtitle="Barangay real property valuations registry, assessment roll, and annual tax payment collection tracking."
        breadcrumb="Finance"
        parity="BAMS"
        actions={
          mayEncode ? (
            <Button
              type="button"
              variant="primary"
              onClick={openDeclareDrawer}
            >
              + Declare Property
            </Button>
          ) : undefined
        }
      />

      <ActionResult error={error} success={ok} />

      <StatGrid>
        <StatCard
          label="Declared Properties"
          value={properties.length}
          icon="🏡"
          hint="Registered real estate parcels"
        />
        <StatCard
          label="Total Assessed Value"
          value={pesoAmount(totalAssessed)}
          icon="📊"
          tone="navy"
          hint={`Market: ${pesoAmount(totalMarket)}`}
        />
        <StatCard
          label="Fully Paid Dues (2026)"
          value={fullyPaidCount}
          icon="✅"
          tone="green"
          hint={dues.length ? `${Math.round((fullyPaidCount / dues.length) * 100)}% collection rate` : "0%"}
        />
        <StatCard
          label="Delinquent Dues"
          value={delinquentCount}
          icon="⚠️"
          tone="red"
          hint="Requires treasurer notice"
        />
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
              placeholder="Search TDN, owner, address, or purok…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ minWidth: 280 }}
            />
            <Button type="submit">Search</Button>
          </form>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              className="cbms-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Classifications</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
              <option value="agricultural">Agricultural</option>
              <option value="special">Special</option>
            </select>

            <select
              className="cbms-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Tax Statuses</option>
              <option value="fully_paid">Fully Paid</option>
              <option value="unpaid">Unpaid / Delinquent</option>
              <option value="exempt">Exempt</option>
            </select>
          </div>
        </Toolbar>

        <Async loading={list.loading} error={list.error}>
          <DataTable
            columns={[
              {
                key: "taxDeclarationNo",
                header: "Tax Dec No (TDN)",
                render: (r: RptProperty) => (
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--cbms-navy)" }}>{r.taxDeclarationNo}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--cbms-muted)" }}>
                      Declared {date(r.createdAt)}
                    </div>
                  </div>
                ),
              },
              {
                key: "propertyType",
                header: "Classification",
                render: (r: RptProperty) => (
                  <Chip tone={r.propertyType === "residential" ? "navy" : r.propertyType === "commercial" ? "gold" : "gray"}>
                    {titleize(r.propertyType)}
                  </Chip>
                ),
              },
              {
                key: "ownerName",
                header: "Owner & Location",
                render: (r: RptProperty) => (
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.ownerName}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--cbms-muted)" }}>
                      {r.purok ? `${r.purok} · ` : ""}{r.addressLine}
                    </div>
                  </div>
                ),
              },
              {
                key: "marketValue",
                header: "Market Value",
                align: "right",
                render: (r: RptProperty) => pesoAmount(r.marketValue),
              },
              {
                key: "assessedValue",
                header: "Assessed Value",
                align: "right",
                render: (r: RptProperty) => (
                  <strong style={{ color: "var(--cbms-navy)" }}>{pesoAmount(r.assessedValue)}</strong>
                ),
              },
              {
                key: "paymentStatus",
                header: "2026 Tax Due",
                render: (r: RptProperty) => {
                  const due = dues.find((d) => d.rptPropertyId === r.id);
                  const status = due?.paymentStatus || "unpaid";
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <StatusChip status={status === "fully_paid" ? "released" : "pending"} />
                      {status === "fully_paid" ? (
                        <span style={{ fontSize: "0.75rem", color: "var(--cbms-green)", fontWeight: 600 }}>
                          {due?.orNumber || "Paid"}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProperty(r);
                            setCollectingPayment(true);
                          }}
                          className="cbms-btn cbms-btn--sm cbms-btn--gold"
                        >
                          💰 Collect
                        </button>
                      )}
                    </div>
                  );
                },
              },
            ]}
            rows={filtered}
            rowKey={(r: RptProperty) => r.id}
            onRowClick={(r: RptProperty) => {
              setSelectedProperty(r);
              setIsEditing(false);
              setCollectingPayment(false);
            }}
            empty="No declared properties found matching criteria."
          />
        </Async>
      </Panel>

      {/* ========================================================================= */}
      {/* 1. CONTENT DRAWER: VIEW PROPERTY & TAX DUE (APPEARING ON THE RIGHT) */}
      {/* ========================================================================= */}
      {selectedProperty && (
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
          onClick={() => {
            setSelectedProperty(null);
            setIsEditing(false);
            setCollectingPayment(false);
          }}
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
            {/* Drawer Header */}
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
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--cbms-navy)" }}>
                    🏡 {selectedProperty.taxDeclarationNo}
                  </h3>
                  <Chip tone="navy">{titleize(selectedProperty.propertyType)}</Chip>
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--cbms-muted)" }}>
                  Real Property Declaration & Tax Assessment · Barangka Assessor Roll
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedProperty(null);
                  setIsEditing(false);
                  setCollectingPayment(false);
                }}
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

            {/* Quick Action Toolbar */}
            <div
              style={{
                padding: "10px 20px",
                backgroundColor: "var(--cbms-bg)",
                borderBottom: "1px solid var(--cbms-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  size="sm"
                  variant={isEditing ? "primary" : "default"}
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setCollectingPayment(false);
                  }}
                >
                  {isEditing ? "👁️ View Mode" : "✏️ Edit Assessment"}
                </Button>
                {selectedDue?.orNumber && (
                  <Link
                    href={`/finance/receipts/${selectedDue.orNumber}`}
                    className="cbms-btn cbms-btn--sm"
                    style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    🧾 View Form 51 OR
                  </Link>
                )}
              </div>
              <Button
                size="sm"
                variant="danger"
                onClick={deleteProperty}
                disabled={busy}
              >
                🗑️ Delete
              </Button>
            </div>

            {/* Drawer Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
              {isEditing ? (
                /* IN-DRAWER EDIT MODE FORM */
                <form onSubmit={updateProperty} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--cbms-navy)", borderBottom: "1px solid var(--cbms-border)", paddingBottom: 6 }}>
                    ✏️ Edit Property Assessment
                  </div>

                  <Field label="Owner Name (Individual or Entity)">
                    <input
                      className="cbms-input"
                      value={editForm.ownerName}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, ownerName: e.target.value }))}
                      required
                    />
                  </Field>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Classification">
                      <select
                        className="cbms-select"
                        value={editForm.propertyType}
                        onChange={(e) => {
                          const type = e.target.value as any;
                          const mv = Number(editForm.marketValue) || 0;
                          const rate = ASSESSMENT_LEVELS[type] ?? 0.20;
                          setEditForm((prev) => ({
                            ...prev,
                            propertyType: type,
                            assessedValue: String(Math.round(mv * rate)),
                          }));
                        }}
                      >
                        <option value="residential">Residential (20%)</option>
                        <option value="commercial">Commercial (50%)</option>
                        <option value="industrial">Industrial (50%)</option>
                        <option value="agricultural">Agricultural (40%)</option>
                        <option value="special">Special (10%)</option>
                      </select>
                    </Field>

                    <Field label="Purok">
                      <select
                        className="cbms-select"
                        value={editForm.purok}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, purok: e.target.value }))}
                      >
                        {PUROKS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label="Street / Sitio Address">
                    <input
                      className="cbms-input"
                      value={editForm.addressLine}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, addressLine: e.target.value }))}
                      required
                    />
                  </Field>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Lot Number">
                      <input
                        className="cbms-input"
                        placeholder="e.g. Lot 4-B"
                        value={editForm.lotNo}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, lotNo: e.target.value }))}
                      />
                    </Field>
                    <Field label="Block Number">
                      <input
                        className="cbms-input"
                        placeholder="e.g. Block 12"
                        value={editForm.blockNo}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, blockNo: e.target.value }))}
                      />
                    </Field>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Market Value (PHP)">
                      <input
                        className="cbms-input"
                        type="number"
                        min="0"
                        value={editForm.marketValue}
                        onChange={(e) => {
                          const val = e.target.value;
                          const mv = Number(val) || 0;
                          const rate = ASSESSMENT_LEVELS[editForm.propertyType] ?? 0.20;
                          setEditForm((prev) => ({
                            ...prev,
                            marketValue: val,
                            assessedValue: String(Math.round(mv * rate)),
                          }));
                        }}
                        required
                      />
                    </Field>
                    <Field label="Assessed Value (PHP)">
                      <input
                        className="cbms-input"
                        type="number"
                        min="0"
                        value={editForm.assessedValue}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, assessedValue: e.target.value }))}
                        required
                      />
                    </Field>
                  </div>

                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
                    <Button type="button" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={busy}>
                      {busy ? "Saving…" : "Save Assessment"}
                    </Button>
                  </div>
                </form>
              ) : (
                /* VIEW PROPERTY DETAILS & TAX DUE */
                <>
                  {/* Property Overview Card */}
                  <div
                    style={{
                      border: "1px solid var(--cbms-border)",
                      borderRadius: 8,
                      padding: 16,
                      background: "var(--cbms-bg)",
                    }}
                  >
                    <div style={{ fontSize: 11, color: "var(--cbms-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                      PROPERTY IDENTIFICATION & OWNERSHIP
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--cbms-muted)" }}>Declared Owner</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--cbms-navy)" }}>
                          {selectedProperty.ownerName}
                        </div>
                        {selectedProperty.ownerInhabitantId && (
                          <div style={{ fontSize: 11, color: "var(--cbms-green)", marginTop: 2 }}>
                            ✓ Registered Resident Inhabitant
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--cbms-muted)" }}>Classification</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>
                          {titleize(selectedProperty.propertyType)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--cbms-muted)" }}>Location / Address</div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>
                          {selectedProperty.addressLine}
                        </div>
                        {selectedProperty.purok && (
                          <div style={{ fontSize: 11, color: "var(--cbms-muted)" }}>
                            {selectedProperty.purok}
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--cbms-muted)" }}>Cadastral Coordinates</div>
                        <div style={{ fontSize: 13 }}>
                          {selectedProperty.lotNo || "—"} · {selectedProperty.blockNo || "—"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Valuation Breakdown Card */}
                  <div
                    style={{
                      border: "1px solid var(--cbms-border)",
                      borderRadius: 8,
                      padding: 16,
                      background: "var(--cbms-surface)",
                    }}
                  >
                    <div style={{ fontSize: 11, color: "var(--cbms-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                      VALUATION & ASSESSMENT LEVEL
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, textAlign: "center" }}>
                      <div style={{ padding: 10, background: "rgba(0,0,0,0.02)", borderRadius: 6 }}>
                        <div style={{ fontSize: 11, color: "var(--cbms-muted)" }}>Market Value</div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>
                          {pesoAmount(selectedProperty.marketValue)}
                        </div>
                      </div>
                      <div style={{ padding: 10, background: "rgba(0,0,0,0.02)", borderRadius: 6 }}>
                        <div style={{ fontSize: 11, color: "var(--cbms-muted)" }}>Assessed Value</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--cbms-navy)" }}>
                          {pesoAmount(selectedProperty.assessedValue)}
                        </div>
                      </div>
                      <div style={{ padding: 10, background: "rgba(0,0,0,0.02)", borderRadius: 6 }}>
                        <div style={{ fontSize: 11, color: "var(--cbms-muted)" }}>Assessment Level</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--cbms-gold)" }}>
                          {selectedProperty.marketValue
                            ? `${Math.round((selectedProperty.assessedValue / selectedProperty.marketValue) * 100)}%`
                            : "0%"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tax Due Card */}
                  <div
                    style={{
                      border: "2px solid " + (selectedDue?.paymentStatus === "fully_paid" ? "var(--cbms-green)" : "var(--cbms-gold)"),
                      borderRadius: 8,
                      padding: 16,
                      background: selectedDue?.paymentStatus === "fully_paid" ? "rgba(16, 185, 129, 0.04)" : "rgba(245, 158, 11, 0.04)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--cbms-muted)", textTransform: "uppercase", letterSpacing: 1 }}>
                          TAX YEAR {selectedDue?.taxYear || 2026} LEVY
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "var(--cbms-navy)" }}>
                          Real Property Tax Assessment
                        </div>
                      </div>
                      <StatusChip status={selectedDue?.paymentStatus === "fully_paid" ? "released" : "pending"} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--cbms-muted)" }}>Basic Real Property Tax (1%):</span>
                        <span style={{ fontWeight: 600 }}>{pesoAmount(selectedDue?.basicTaxAmount || Math.round(selectedProperty.assessedValue * 0.01))}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--cbms-muted)" }}>Special Education Fund (SEF 1%):</span>
                        <span style={{ fontWeight: 600 }}>{pesoAmount(selectedDue?.sefTaxAmount || Math.round(selectedProperty.assessedValue * 0.005))}</span>
                      </div>
                      {selectedDue?.penaltyAmount ? (
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--cbms-red)" }}>
                          <span>Penalties & Surcharges (2%/mo):</span>
                          <span style={{ fontWeight: 600 }}>+{pesoAmount(selectedDue.penaltyAmount)}</span>
                        </div>
                      ) : null}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          borderTop: "1px dashed var(--cbms-border)",
                          paddingTop: 8,
                          fontSize: 15,
                          fontWeight: 800,
                          color: "var(--cbms-navy)",
                        }}
                      >
                        <span>Total RPT Due:</span>
                        <span>{pesoAmount(selectedDue?.totalAmount || Math.round(selectedProperty.assessedValue * 0.015))}</span>
                      </div>
                    </div>

                    {/* Payment Status Details or Collection Form */}
                    {selectedDue?.paymentStatus === "fully_paid" ? (
                      <div style={{ marginTop: 14, padding: 12, background: "rgba(16, 185, 129, 0.1)", borderRadius: 6 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--cbms-green)", display: "flex", alignItems: "center", gap: 6 }}>
                          ✓ Fully Paid and Settled
                        </div>
                        <div style={{ fontSize: 12, color: "var(--cbms-text)", marginTop: 4 }}>
                          Official Receipt: <strong>{selectedDue.orNumber}</strong>
                        </div>
                        {selectedDue.paidAt && (
                          <div style={{ fontSize: 11, color: "var(--cbms-muted)", marginTop: 2 }}>
                            Paid on: {dateTime(selectedDue.paidAt)}
                          </div>
                        )}
                        <div style={{ marginTop: 8 }}>
                          <Link
                            href={`/finance/receipts/${selectedDue.orNumber}`}
                            className="cbms-btn cbms-btn--sm cbms-btn--gold"
                            style={{ textDecoration: "none", display: "inline-block" }}
                          >
                            Print Form 51 Official Receipt
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginTop: 16 }}>
                        {collectingPayment ? (
                          <div style={{ padding: 12, background: "var(--cbms-surface)", border: "1px solid var(--cbms-border)", borderRadius: 6 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--cbms-navy)", marginBottom: 8 }}>
                              Record Real Property Tax Collection
                            </div>
                            <Field label="Payment Channel">
                              <select
                                className="cbms-select"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value as any)}
                              >
                                <option value="cash">Cash (Over-the-Counter Form 51)</option>
                                <option value="check">Manager / Cashier Check</option>
                                <option value="gcash">GCash E-Wallet</option>
                                <option value="maya">Maya Digital Wallet</option>
                              </select>
                            </Field>
                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                              <Button size="sm" type="button" onClick={() => setCollectingPayment(false)}>
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                variant="gold"
                                type="button"
                                disabled={busy}
                                onClick={() => handleCollectPayment(selectedProperty.id)}
                              >
                                {busy ? "Issuing OR…" : `Confirm Collection (${pesoAmount(selectedDue?.totalAmount || 0)})`}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="gold"
                            type="button"
                            onClick={() => setCollectingPayment(true)}
                            style={{ width: "100%", justifyContent: "center" }}
                          >
                            💰 Collect Payment ({pesoAmount(selectedDue?.totalAmount || Math.round(selectedProperty.assessedValue * 0.015))})
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CONTENT DRAWER: DECLARE REAL PROPERTY (SLIDE-OVER FROM RIGHT) */}
      {/* ========================================================================= */}
      {declareDrawerOpen && (
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
          onClick={() => setDeclareDrawerOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "560px",
              backgroundColor: "var(--cbms-surface, #ffffff)",
              height: "100%",
              boxShadow: "-6px 0 25px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
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
                  🏡 Declare Real Property
                </h3>
                <span style={{ fontSize: "0.8rem", color: "var(--cbms-muted)" }}>
                  New parcel assessment registration · Republic Act 7160 Sec. 198
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDeclareDrawerOpen(false)}
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

            {/* Drawer Form Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              <form onSubmit={declareProperty} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Field label="Tax Declaration Number (TDN)" hint="Official provincial/city assessor roll code">
                  <input
                    className="cbms-input"
                    value={form.taxDeclarationNo}
                    onChange={(e) => setForm((prev) => ({ ...prev, taxDeclarationNo: e.target.value }))}
                    placeholder="TD-2026-BAR-00113"
                    required
                  />
                </Field>

                <Field label="Resident Inhabitant Owner (Optional Search)" hint="Select if property owner is a registered inhabitant">
                  <select
                    className="cbms-select"
                    value={form.ownerInhabitantId}
                    onChange={(e) => {
                      const citizen = citizens.find((c) => c.id === e.target.value);
                      setForm((prev) => ({
                        ...prev,
                        ownerInhabitantId: e.target.value,
                        ownerName: citizen ? `${citizen.firstName} ${citizen.lastName}` : prev.ownerName,
                        addressLine: citizen?.household?.addressLine || prev.addressLine,
                        purok: citizen?.household?.purok || prev.purok,
                      }));
                    }}
                  >
                    <option value="">Choose resident inhabitant...</option>
                    {citizens.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName} ({c.household?.purok || "Barangka"})
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Owner Name (Declared Title Holder or Business)" hint="Full name or company name on property title">
                  <input
                    className="cbms-input"
                    value={form.ownerName}
                    onChange={(e) => setForm((prev) => ({ ...prev, ownerName: e.target.value }))}
                    placeholder="e.g. Maria Clara Santos or Horizon Bakery Corp."
                    required
                  />
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Classification">
                    <select
                      className="cbms-select"
                      value={form.propertyType}
                      onChange={(e) => handleTypeChange(e.target.value)}
                      required
                    >
                      <option value="residential">Residential (20%)</option>
                      <option value="commercial">Commercial (50%)</option>
                      <option value="industrial">Industrial (50%)</option>
                      <option value="agricultural">Agricultural (40%)</option>
                      <option value="special">Special (10%)</option>
                    </select>
                  </Field>

                  <Field label="Purok">
                    <select
                      className="cbms-select"
                      value={form.purok}
                      onChange={(e) => setForm((prev) => ({ ...prev, purok: e.target.value }))}
                    >
                      {PUROKS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Street / Sitio Address">
                  <input
                    className="cbms-input"
                    value={form.addressLine}
                    onChange={(e) => setForm((prev) => ({ ...prev, addressLine: e.target.value }))}
                    placeholder="e.g. 14 Dela Paz St."
                    required
                  />
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Lot Number">
                    <input
                      className="cbms-input"
                      placeholder="e.g. Lot 4"
                      value={form.lotNo}
                      onChange={(e) => setForm((prev) => ({ ...prev, lotNo: e.target.value }))}
                    />
                  </Field>
                  <Field label="Block Number">
                    <input
                      className="cbms-input"
                      placeholder="e.g. Block 12"
                      value={form.blockNo}
                      onChange={(e) => setForm((prev) => ({ ...prev, blockNo: e.target.value }))}
                    />
                  </Field>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Market Value (PHP)" hint="Current appraised fair market value">
                    <input
                      className="cbms-input"
                      type="number"
                      min="0"
                      value={form.marketValue}
                      onChange={(e) => handleMarketValueChange(e.target.value, form.propertyType)}
                      required
                    />
                  </Field>
                  <Field label="Assessed Value (PHP)" hint="Auto-computed from classification rate">
                    <input
                      className="cbms-input"
                      type="number"
                      min="0"
                      value={form.assessedValue}
                      onChange={(e) => setForm((prev) => ({ ...prev, assessedValue: e.target.value }))}
                      required
                    />
                  </Field>
                </div>

                <div
                  style={{
                    padding: 12,
                    background: "rgba(0,0,0,0.02)",
                    borderRadius: 6,
                    border: "1px solid var(--cbms-border)",
                    fontSize: 12,
                    color: "var(--cbms-muted)",
                  }}
                >
                  💡 <strong>Estimated 2026 Tax Due:</strong>{" "}
                  {pesoAmount(Math.round((Number(form.assessedValue) || 0) * 0.015))} (Basic 1% + SEF 0.5%)
                </div>

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                  <Button type="button" onClick={() => setDeclareDrawerOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={busy}>
                    {busy ? "Declaring…" : "Submit Declaration"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
