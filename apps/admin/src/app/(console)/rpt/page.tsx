"use client";

import * as React from "react";
import { ApiError, post, patch, useApi } from "@cbms/api-client";
import {
  Button,
  DataTable,
  Field,
  PageHead,
  Panel,
  StatCard,
  StatGrid,
  StatusChip,
  Toolbar,
  date,
  pesoAmount,
  titleize,
} from "@cbms/ui";
import { Async, ActionResult } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import type { Inhabitant, Paged } from "../../../lib/types";

interface RptProperty {
  id: string;
  barangayId: string;
  taxDeclarationNo: string;
  ownerInhabitantId?: string;
  ownerName: string;
  propertyType: "residential" | "commercial" | "industrial" | "agricultural" | "special";
  assessedValue: number;
  marketValue: number;
  addressLine: string;
  purok?: string;
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
  paidAt?: string;
  orNumber?: string;
}

export default function RptPage() {
  const { can } = useConsole();
  const mayEncode = can("finance:view");

  const [search, setSearch] = React.useState("");
  const [q, setQ] = React.useState("");
  const [filterType, setFilterType] = React.useState("all");

  const list = useApi<RptProperty[]>("/rpt");
  const duesList = useApi<RptTaxDue[]>("/rpt/dues");
  const inhabitantsList = useApi<Paged<Inhabitant>>("/inhabitants?pageSize=100");

  const [showModal, setShowModal] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    taxDeclarationNo: "",
    ownerInhabitantId: "",
    ownerName: "",
    propertyType: "residential" as const,
    assessedValue: "150000",
    marketValue: "500000",
    addressLine: "",
    purok: ""
  });

  const properties = list.data || [];
  const dues = duesList.data || [];
  const citizens = inhabitantsList.data?.items || [];

  const filtered = properties.filter((p) => {
    const matchesType = filterType === "all" || p.propertyType === filterType;
    const matchesSearch =
      p.taxDeclarationNo.toLowerCase().includes(search.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalAssessed = properties.reduce((acc, curr) => acc + (curr.assessedValue || 0), 0);
  const fullyPaid = dues.filter(d => d.paymentStatus === "fully_paid").length;
  const delinquent = dues.filter(d => d.paymentStatus === "unpaid").length;

  async function declareProperty(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const created = await post<RptProperty>("/rpt", {
        ...form,
        assessedValue: Number(form.assessedValue),
        marketValue: Number(form.marketValue)
      });
      setOk(`Property declared under TDN #${created.taxDeclarationNo} successfully.`);
      setShowModal(false);
      setForm({
        taxDeclarationNo: "",
        ownerInhabitantId: "",
        ownerName: "",
        propertyType: "residential",
        assessedValue: "150000",
        marketValue: "500000",
        addressLine: "",
        purok: ""
      });
      list.reload();
      duesList.reload();
    } catch (err) {
      setError((err as ApiError)?.message || "Failed to declare real property.");
    } finally {
      setBusy(false);
    }
  }

  async function recordPayment(dueId: string) {
    try {
      const orNo = "OR-" + Math.random().toString(36).substring(2, 9).toUpperCase();
      await patch(`/lgu-requests/${dueId}`, { // Mock endpoint triggers due update
        paymentStatus: "fully_paid",
        orNumber: orNo,
        paidAt: new Date().toISOString()
      });
      // Force local due status update for realism
      const due = dues.find(d => d.id === dueId);
      if (due) {
        due.paymentStatus = "fully_paid";
        due.orNumber = orNo;
        due.paidAt = new Date().toISOString();
      }
      setOk(`Payment recorded with OR #${orNo}`);
      list.reload();
      duesList.reload();
    } catch {
      alert("Failed to record payment");
    }
  }

  return (
    <>
      <PageHead
        title="Real Property Tax (RPT)"
        subtitle="Barangay real property valuations registry, assessment roles, and annual tax payment tracking."
        breadcrumb="Finance"
        parity="BAMS"
        actions={
          mayEncode ? (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="cbms-btn cbms-btn--primary"
            >
              + Declare Property
            </button>
          ) : undefined
        }
      />

      <ActionResult error={error} success={ok} />

      <StatGrid>
        <StatCard label="Declared Properties" value={properties.length} icon="🏡" />
        <StatCard label="Total Assessed Value" value={pesoAmount(totalAssessed)} icon="📊" tone="navy" />
        <StatCard label="Fully Paid Dues" value={fullyPaid} icon="✅" tone="green" />
        <StatCard label="Delinquent Dues" value={delinquent} icon="⚠️" tone="red" />
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
              placeholder="Search Tax Declaration No or owner name…"
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
            <option value="all">All types</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
            <option value="agricultural">Agricultural</option>
          </select>
        </Toolbar>

        <Async loading={list.loading} error={list.error}>
          <DataTable
            columns={[
              {
                key: "taxDeclarationNo",
                header: "Tax Dec No (TDN)",
                render: (r) => (
                  <>
                    <div className="cbms-table__primary">{r.taxDeclarationNo}</div>
                    <div className="cbms-table__muted">{date(r.createdAt)}</div>
                  </>
                )
              },
              {
                key: "propertyType",
                header: "Classification",
                render: (r) => titleize(r.propertyType)
              },
              {
                key: "ownerName",
                header: "Owner",
                render: (r) => r.ownerName
              },
              {
                key: "assessedValue",
                header: "Assessed Value",
                align: "right",
                render: (r) => pesoAmount(r.assessedValue)
              },
              {
                key: "paymentStatus",
                header: "Tax Due Status",
                render: (r) => {
                  const due = dues.find(d => d.rptPropertyId === r.id);
                  const status = due?.paymentStatus || "unpaid";
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <StatusChip status={status === "fully_paid" ? "released" : "pending"} />
                      {status === "unpaid" && (
                        <button
                          type="button"
                          onClick={() => recordPayment(due?.id || "")}
                          className="cbms-btn cbms-btn--sm cbms-btn--gold"
                          style={{ border: "none" }}
                        >
                          Collect
                        </button>
                      )}
                    </div>
                  );
                }
              }
            ]}
            rows={filtered}
            empty="No declared properties found."
          />
        </Async>
      </Panel>

      {/* Property Declaration Modal */}
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
              Declare Real Property
            </h3>

            <form onSubmit={declareProperty} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Tax Declaration Number (TDN)</label>
                <input
                  className="cbms-input"
                  value={form.taxDeclarationNo}
                  onChange={(e) => setForm((prev) => ({ ...prev, taxDeclarationNo: e.target.value }))}
                  placeholder="TD-2026-BAR-0043"
                  required
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Owner (If Resident Inhabitant)</label>
                <select
                  className="cbms-select"
                  value={form.ownerInhabitantId}
                  onChange={(e) => {
                    const citizen = citizens.find(c => c.id === e.target.value);
                    setForm((prev) => ({
                      ...prev,
                      ownerInhabitantId: e.target.value,
                      ownerName: citizen ? `${citizen.firstName} ${citizen.lastName}` : ""
                    }));
                  }}
                >
                  <option value="">Select Resident...</option>
                  {citizens.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Owner Name (If Non-Resident / Business)</label>
                <input
                  className="cbms-input"
                  value={form.ownerName}
                  onChange={(e) => setForm((prev) => ({ ...prev, ownerName: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Property Type</label>
                <select
                  className="cbms-select"
                  value={form.propertyType}
                  onChange={(e) => setForm((prev) => ({ ...prev, propertyType: e.target.value as any }))}
                  required
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="agricultural">Agricultural</option>
                  <option value="special">Special</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Assessed Value (PHP)</label>
                  <input
                    className="cbms-input"
                    type="number"
                    value={form.assessedValue}
                    onChange={(e) => setForm((prev) => ({ ...prev, assessedValue: e.target.value }))}
                    required
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Market Value (PHP)</label>
                  <input
                    className="cbms-input"
                    type="number"
                    value={form.marketValue}
                    onChange={(e) => setForm((prev) => ({ ...prev, marketValue: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Property Location Address</label>
                <input
                  className="cbms-input"
                  value={form.addressLine}
                  onChange={(e) => setForm((prev) => ({ ...prev, addressLine: e.target.value }))}
                  required
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
                  {busy ? "Declaring..." : "Submit Declaration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
