"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ApiError, post, qs, useApi } from "@cbms/api-client";
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
  fullName,
  num,
  pesoAmount,
} from "@cbms/ui";
import { ActionResult, Async, EmptyNote } from "../../../../../components/common";
import { BATCH_KINDS, FUNDS } from "../../../../../lib/labels";
import type { DisbursementBatch, Inhabitant, Paged } from "../../../../../lib/types";

interface Line {
  key: string;
  inhabitantId?: string;
  payeeName: string;
  amountPeso: string;
}

export default function NewBatchPage() {
  const router = useRouter();

  const [kind, setKind] = React.useState<string>(BATCH_KINDS[0].value);
  const [title, setTitle] = React.useState("");
  const [fund, setFund] = React.useState<string>("general");
  const [sourceNote, setSourceNote] = React.useState("");
  const [lines, setLines] = React.useState<Line[]>([]);
  const [defaultAmount, setDefaultAmount] = React.useState("1000");

  const [q, setQ] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const results = useApi<Paged<Inhabitant>>(
    search ? `/inhabitants${qs({ q: search, pageSize: 8 })}` : null,
    [search],
  );

  const total = lines.reduce((s, l) => s + (Number(l.amountPeso) || 0), 0);
  const valid =
    title.trim().length >= 3 &&
    lines.length > 0 &&
    lines.every((l) => l.payeeName.trim() && Number(l.amountPeso) > 0);

  function addResident(p: Inhabitant) {
    if (lines.some((l) => l.inhabitantId === p.id)) return;
    setLines((ls) => [
      ...ls,
      {
        key: `${p.id}-${Date.now()}`,
        inhabitantId: p.id,
        payeeName: fullName(p),
        amountPeso: defaultAmount,
      },
    ]);
  }

  function addManual() {
    setLines((ls) => [
      ...ls,
      { key: `manual-${Date.now()}-${ls.length}`, payeeName: "", amountPeso: defaultAmount },
    ]);
  }

  function update(key: string, patch: Partial<Line>) {
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  function remove(key: string) {
    setLines((ls) => ls.filter((l) => l.key !== key));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const created = await post<DisbursementBatch>("/wallet/batches", {
        kind,
        title: title.trim(),
        fund,
        ...(sourceNote.trim() ? { sourceNote: sourceNote.trim() } : {}),
        items: lines.map((l) => ({
          ...(l.inhabitantId ? { inhabitantId: l.inhabitantId } : {}),
          payeeName: l.payeeName.trim(),
          amountPeso: Number(l.amountPeso),
        })),
      });
      router.push(`/wallet/batches/${created.id}`);
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not create the batch.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title="Prepare a disbursement batch"
        subtitle="You prepare, someone else approves. Ayuda batches additionally require a DISBURSEMENT consent on file for the beneficiaries' households (RA 10173)."
        breadcrumb="Finance / Disbursements"
        exclusive
        actions={
          <button
            type="button"
            className="cbms-btn"
            onClick={() => router.push("/wallet/batches")}
          >
            Cancel
          </button>
        }
      />

      <ActionResult error={error} />

      <StatGrid>
        <StatCard label="Payees" value={num(lines.length)} icon="👥" />
        <StatCard label="Running total" value={pesoAmount(total)} icon="🏦" tone="gold" />
        <StatCard
          label="Linked to a resident"
          value={num(lines.filter((l) => l.inhabitantId).length)}
          icon="🔗"
          hint="Unlinked payees are released over the counter"
        />
      </StatGrid>

      <form onSubmit={submit}>
        <div className="cbms-grid-2">
          <Panel title="1 · Batch header">
            <div className="adm-form-grid">
              <Field label="Kind">
                <select
                  className="cbms-select"
                  value={kind}
                  onChange={(e) => setKind(e.target.value)}
                >
                  {BATCH_KINDS.map((k) => (
                    <option key={k.value} value={k.value}>
                      {k.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Fund">
                <select
                  className="cbms-select"
                  value={fund}
                  onChange={(e) => setFund(e.target.value)}
                >
                  {FUNDS.map((f) => (
                    <option key={f} value={f}>
                      {f.toUpperCase()}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Title" hint="Appears on the disbursement voucher and the ledger entry.">
              <input
                className="cbms-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                minLength={3}
                required
              />
            </Field>
            <Field label="Source note">
              <input
                className="cbms-input"
                value={sourceNote}
                onChange={(e) => setSourceNote(e.target.value)}
                placeholder="Appropriation ordinance, SB resolution, …"
              />
            </Field>
            {kind === "ayuda_social" && (
              <Alert tone="warn">
                Ayuda batches are rejected by the API unless at least one beneficiary household has
                a granted <strong>DISBURSEMENT</strong> consent.
              </Alert>
            )}
          </Panel>

          <Panel title="2 · Add payees">
            <Field label="Default amount per payee (₱)">
              <input
                className="cbms-input"
                type="number"
                min="1"
                step="0.01"
                value={defaultAmount}
                onChange={(e) => setDefaultAmount(e.target.value)}
              />
            </Field>
            <div className="adm-row" style={{ marginBottom: 10 }}>
              <input
                className="cbms-input cbms-input--search"
                placeholder="Search residents…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setSearch(q.trim());
                  }
                }}
              />
              <Button type="button" onClick={() => setSearch(q.trim())}>
                Search
              </Button>
              <Button type="button" onClick={addManual}>
                + Manual payee
              </Button>
            </div>
            {!search ? (
              <EmptyNote>Search residents to add them as payees.</EmptyNote>
            ) : (
              <Async loading={results.loading} error={results.error}>
                <div className="adm-scroll">
                  <DataTable
                    columns={[
                      { key: "name", header: "Resident", render: (r) => fullName(r) },
                      { key: "purok", header: "Purok", render: (r) => r.household?.purok ?? "—" },
                      {
                        key: "add",
                        header: "",
                        align: "right",
                        render: (r) =>
                          lines.some((l) => l.inhabitantId === r.id) ? (
                            <Chip tone="green">Added</Chip>
                          ) : (
                            <Button size="sm" type="button" onClick={() => addResident(r)}>
                              Add
                            </Button>
                          ),
                      },
                    ]}
                    rows={results.data?.items ?? []}
                    empty="No resident matched."
                  />
                </div>
              </Async>
            )}
          </Panel>
        </div>

        <div style={{ height: 16 }} />

        <Panel
          title={`3 · Payee list — ${num(lines.length)} payee(s), ${pesoAmount(total)}`}
          padded={false}
        >
          {lines.length === 0 ? (
            <EmptyNote>No payees yet. Add at least one to submit the batch.</EmptyNote>
          ) : (
            <div className="cbms-table-wrap">
              <table className="cbms-table">
                <thead>
                  <tr>
                    <th>Payee</th>
                    <th style={{ width: 170 }}>Amount (₱)</th>
                    <th style={{ width: 150 }}>Channel</th>
                    <th style={{ width: 90 }} />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => (
                    <tr key={l.key}>
                      <td>
                        <input
                          className="cbms-input"
                          style={{ width: "100%" }}
                          value={l.payeeName}
                          placeholder="Payee name"
                          onChange={(e) => update(l.key, { payeeName: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          className="cbms-input"
                          type="number"
                          min="0.01"
                          step="0.01"
                          style={{ width: "100%" }}
                          value={l.amountPeso}
                          onChange={(e) => update(l.key, { amountPeso: e.target.value })}
                        />
                      </td>
                      <td>
                        {l.inhabitantId ? (
                          <Chip tone="green">E-wallet if enrolled</Chip>
                        ) : (
                          <Chip tone="gold">Over the counter</Chip>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Button size="sm" variant="danger" type="button" onClick={() => remove(l.key)}>
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td style={{ fontWeight: 700 }}>Total</td>
                    <td style={{ fontWeight: 700 }}>{pesoAmount(total)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </Panel>

        <div className="adm-row" style={{ marginTop: 16 }}>
          <Button type="submit" variant="primary" disabled={busy || !valid}>
            {busy ? "Submitting…" : "Submit for approval"}
          </Button>
          <span className="adm-muted">
            The batch is created as <strong>for approval</strong>; you will not be able to approve it
            yourself.
          </span>
        </div>
      </form>
    </>
  );
}
