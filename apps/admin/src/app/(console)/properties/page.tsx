"use client";

import * as React from "react";
import { ApiError, patch, post, qs, useApi } from "@cbms/api-client";
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
  dateTime,
  num,
  relative,
  titleize,
} from "@cbms/ui";
import { ActionResult, Async, SourceChip } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import { PROPERTY_STATUSES, PROPERTY_TYPES } from "../../../lib/labels";
import { downloadText, toCsv } from "../../../lib/download";
import type { Material, Paged, Property } from "../../../lib/types";

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
  };
}

/** Category options always include the row's own value, even if it is a legacy string. */
function categoryOptions(current: string): string[] {
  return GOVERNANCE_AREAS.includes(current) || !current
    ? GOVERNANCE_AREAS
    : [current, ...GOVERNANCE_AREAS];
}

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

  const [showNew, setShowNew] = React.useState(false);
  const [form, setForm] = React.useState<PropertyForm>(EMPTY_FORM);
  const [editing, setEditing] = React.useState<Property | null>(null);
  const [edit, setEdit] = React.useState<PropertyForm>(EMPTY_FORM);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const rows = list.data?.items ?? [];
  const infrastructures = rows.filter((p) => p.type === "infrastructure").length;
  const nonInfrastructures = rows.filter((p) => p.type === "non_infrastructure").length;
  const operational = rows.filter((p) => p.status === "operational").length;

  const stock = materials.data?.items ?? [];
  const lowStock = stock.filter((m) => m.quantity <= m.reorderLevel).length;

  function startEdit(p: Property) {
    setEditing(p);
    setEdit(toForm(p));
    setShowNew(false);
    setError(null);
    setOk(null);
  }

  async function create(e: React.FormEvent) {
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
        ...(form.custodian.trim() ? { custodian: form.custodian.trim() } : {}),
        ...(form.addressLine.trim() ? { addressLine: form.addressLine.trim() } : {}),
        ...(form.description.trim() ? { description: form.description.trim() } : {}),
      });
      setOk(`“${created.name}” added to the barangay property inventory.`);
      setForm(EMPTY_FORM);
      setShowNew(false);
      list.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not save the property.");
    } finally {
      setBusy(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await patch(`/properties/${editing.id}`, {
        name: edit.name.trim(),
        type: edit.type,
        status: edit.status,
        category: edit.category,
        capacity: Number(edit.capacity) || 0,
        custodian: edit.custodian.trim(),
        addressLine: edit.addressLine.trim(),
        description: edit.description.trim(),
      });
      setOk(`“${edit.name.trim()}” updated.`);
      setEditing(null);
      list.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not update the property.");
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
        title="Properties"
        subtitle="Inventory of barangay real and personal property. Every asset carries a named custodian — the accountability record required by Local Government Code §375."
        breadcrumb="Assets & DRRM"
        parity="BAMS"
      />

      <ActionResult error={error} success={ok} />

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

      {showNew && mayEncode && (
        <>
          <Panel title="New property">
            <form onSubmit={create}>
              <div className="adm-form-grid">
                <Field label="Property name">
                  <input
                    className="cbms-input"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="BARANGAY HALL"
                    minLength={2}
                    required
                  />
                </Field>
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
                <Field label="Capacity" hint="Persons served or seating capacity. 0 if not applicable.">
                  <input
                    className="cbms-input"
                    type="number"
                    min={0}
                    value={form.capacity}
                    onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                  />
                </Field>
                <Field
                  label="Custodian"
                  hint="The accountable officer under LGC §375."
                >
                  <input
                    className="cbms-input"
                    value={form.custodian}
                    onChange={(e) => setForm((f) => ({ ...f, custodian: e.target.value }))}
                    placeholder="Full name of the accountable officer"
                  />
                </Field>
                <Field label="Address / location">
                  <input
                    className="cbms-input"
                    value={form.addressLine}
                    onChange={(e) => setForm((f) => ({ ...f, addressLine: e.target.value }))}
                  />
                </Field>
              </div>
              <Field label="Governance area" hint="The SGLGB area this asset is booked against.">
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
              <Field label="Description">
                <textarea
                  className="cbms-textarea"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Condition, coverage, remarks…"
                />
              </Field>
              <div style={{ display: "flex", gap: 8 }}>
                <Button type="submit" variant="primary" disabled={busy}>
                  {busy ? "Saving…" : "Add property"}
                </Button>
                <Button type="button" onClick={() => setShowNew(false)} disabled={busy}>
                  Cancel
                </Button>
              </div>
            </form>
          </Panel>
          <div style={{ height: 16 }} />
        </>
      )}

      {editing && mayEncode && (
        <>
          <Panel
            title={`Edit — ${editing.name}`}
            actions={<SourceChip source={editing.source} />}
          >
            <form onSubmit={save}>
              <div className="adm-form-grid">
                <Field label="Property name">
                  <input
                    className="cbms-input"
                    value={edit.name}
                    onChange={(e) => setEdit((f) => ({ ...f, name: e.target.value }))}
                    minLength={2}
                    required
                  />
                </Field>
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
                <Field label="Capacity">
                  <input
                    className="cbms-input"
                    type="number"
                    min={0}
                    value={edit.capacity}
                    onChange={(e) => setEdit((f) => ({ ...f, capacity: e.target.value }))}
                  />
                </Field>
                <Field label="Custodian" hint="Turnover of custody is an auditable change.">
                  <input
                    className="cbms-input"
                    value={edit.custodian}
                    onChange={(e) => setEdit((f) => ({ ...f, custodian: e.target.value }))}
                  />
                </Field>
                <Field label="Address / location">
                  <input
                    className="cbms-input"
                    value={edit.addressLine}
                    onChange={(e) => setEdit((f) => ({ ...f, addressLine: e.target.value }))}
                  />
                </Field>
              </div>
              <Field label="Governance area">
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
              <Field label="Description">
                <textarea
                  className="cbms-textarea"
                  value={edit.description}
                  onChange={(e) => setEdit((f) => ({ ...f, description: e.target.value }))}
                />
              </Field>
              <div style={{ display: "flex", gap: 8 }}>
                <Button type="submit" variant="primary" disabled={busy}>
                  {busy ? "Saving…" : "Save changes"}
                </Button>
                <Button type="button" onClick={() => setEditing(null)} disabled={busy}>
                  Cancel
                </Button>
              </div>
            </form>
          </Panel>
          <div style={{ height: 16 }} />
        </>
      )}

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
          <Button onClick={exportCsv} disabled={rows.length === 0}>
            ⬇ Export CSV
          </Button>
          {mayEncode && (
            <Button
              variant="primary"
              onClick={() => {
                setEditing(null);
                setShowNew((v) => !v);
              }}
            >
              {showNew ? "Close" : "+ New property"}
            </Button>
          )}
        </Toolbar>

        <Async loading={list.loading} error={list.error}>
          <DataTable
            columns={[
              {
                key: "name",
                header: "Property",
                render: (p) => (
                  <>
                    <span className="adm-chiprow">
                      <span className="cbms-table__primary">{p.name}</span>
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
                  p.custodian ?? <span className="cbms-table__muted">Unassigned</span>,
              },
              {
                key: "updatedAt",
                header: "Updated",
                render: (p) => <span title={dateTime(p.updatedAt)}>{relative(p.updatedAt)}</span>,
              },
              {
                key: "action",
                header: "Action",
                render: (p) =>
                  mayEncode ? (
                    <Button
                      size="sm"
                      onClick={() => (editing?.id === p.id ? setEditing(null) : startEdit(p))}
                    >
                      {editing?.id === p.id ? "Close" : "Edit"}
                    </Button>
                  ) : (
                    <span className="cbms-table__muted">—</span>
                  ),
              },
            ]}
            rows={rows}
            empty="No properties match this filter."
          />
        </Async>

        <Pagination page={page} pageSize={pageSize} total={list.data?.total ?? 0} onPage={setPage} />
      </Panel>

      <div style={{ height: 16 }} />

      <Panel
        title="Materials & supplies"
        padded={false}
        actions={
          <Chip tone={lowStock > 0 ? "red" : "green"}>
            {lowStock > 0 ? `${num(lowStock)} at or below reorder level` : "Stock levels healthy"}
          </Chip>
        }
      >
        <Async loading={materials.loading} error={materials.error}>
          <DataTable
            columns={[
              {
                key: "name",
                header: "Item",
                render: (m) => (
                  <span className="adm-chiprow">
                    <span className="cbms-table__primary">{m.name}</span>
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
            ]}
            rows={stock}
            empty="No supplies recorded yet."
          />
        </Async>
      </Panel>
    </>
  );
}
