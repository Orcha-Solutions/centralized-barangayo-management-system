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
  age,
  fullName,
  pesoAmount,
} from "@cbms/ui";
import { ActionResult, Async, EmptyNote } from "../../../../components/common";
import type { Bag, CertificateRequest, CertificateType, Inhabitant, Paged } from "../../../../lib/types";

export default function NewCertificatePage() {
  const router = useRouter();
  const types = useApi<Bag<CertificateType>>("/certificate-types");

  const [typeId, setTypeId] = React.useState("");
  const [purpose, setPurpose] = React.useState("");
  const [q, setQ] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [picked, setPicked] = React.useState<Inhabitant | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const results = useApi<Paged<Inhabitant>>(
    search ? `/inhabitants${qs({ q: search, pageSize: 8 })}` : null,
    [search],
  );

  const selected = (types.data?.items ?? []).find((t) => t.id === typeId) ?? null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!picked || !typeId) return;
    setBusy(true);
    setError(null);
    try {
      const created = await post<CertificateRequest>("/certificates", {
        typeId,
        inhabitantId: picked.id,
        purpose: purpose.trim(),
      });
      router.push(`/certificates/${created.id}`);
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not create the request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title="New certificate request"
        subtitle="Intake for walk-in requests. Paid certificates move to 'awaiting payment'; free ones go straight to the approval queue."
        breadcrumb="Services / Certificates"
        parity="BCIS"
        actions={
          <button type="button" className="cbms-btn" onClick={() => router.push("/certificates")}>
            Cancel
          </button>
        }
      />

      <ActionResult error={error} />

      <form onSubmit={submit}>
        <div className="cbms-grid-2">
          <Panel title="1 · Certificate type">
            <Async loading={types.loading} error={types.error}>
              <Field label="Type">
                <select
                  className="cbms-select"
                  value={typeId}
                  onChange={(e) => setTypeId(e.target.value)}
                  required
                >
                  <option value="">— Select a certificate —</option>
                  {(types.data?.items ?? []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({Number(t.fee) === 0 ? "free" : pesoAmount(t.fee)})
                    </option>
                  ))}
                </select>
              </Field>

              {selected && (
                <div style={{ marginTop: 6 }}>
                  <div className="adm-row">
                    <Chip tone={Number(selected.fee) === 0 ? "green" : "gold"}>
                      Fee: {Number(selected.fee) === 0 ? "Free" : pesoAmount(selected.fee)}
                    </Chip>
                    <Chip tone="navy">Valid {selected.validityDays} days</Chip>
                    <Chip tone="gray">{selected.code}</Chip>
                  </div>
                  {selected.description && (
                    <p className="adm-muted" style={{ marginTop: 10 }}>
                      {selected.description}
                    </p>
                  )}
                  <div className="cbms-label" style={{ marginTop: 12 }}>
                    Requirements
                  </div>
                  {selected.requirements?.length ? (
                    <ul style={{ margin: "4px 0 0", paddingLeft: 20, fontSize: 13.5 }}>
                      {selected.requirements.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="adm-muted">No documentary requirements on file.</div>
                  )}
                  {selected.exemptNote && (
                    <Alert tone="info">
                      <span>{selected.exemptNote}</span>
                    </Alert>
                  )}
                </div>
              )}
            </Async>
          </Panel>

          <Panel title="2 · Resident">
            {picked ? (
              <div>
                <div className="adm-row" style={{ marginBottom: 10 }}>
                  <strong className="adm-strong">{fullName(picked)}</strong>
                  <Chip tone="gray">{age(picked.birthDate) ?? "—"} yrs</Chip>
                  {picked.household?.purok && <Chip tone="navy">Purok {picked.household.purok}</Chip>}
                </div>
                <div className="adm-muted">{picked.household?.addressLine ?? "No address on file"}</div>
                <Button
                  size="sm"
                  style={{ marginTop: 12 }}
                  onClick={() => {
                    setPicked(null);
                    setSearch("");
                    setQ("");
                  }}
                >
                  Change resident
                </Button>
              </div>
            ) : (
              <>
                <div className="adm-row" style={{ marginBottom: 10 }}>
                  <input
                    className="cbms-input cbms-input--search"
                    placeholder="Search by name or PhilSys…"
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
                </div>
                {!search ? (
                  <EmptyNote>Search for the requesting resident.</EmptyNote>
                ) : (
                  <Async loading={results.loading} error={results.error}>
                    <div className="adm-scroll">
                      <DataTable
                        columns={[
                          { key: "name", header: "Name", render: (r) => fullName(r) },
                          {
                            key: "purok",
                            header: "Purok",
                            render: (r) => r.household?.purok ?? "—",
                          },
                          { key: "age", header: "Age", render: (r) => String(age(r.birthDate) ?? "—") },
                        ]}
                        rows={results.data?.items ?? []}
                        empty="No resident matched."
                        onRowClick={(r) => setPicked(r)}
                      />
                    </div>
                  </Async>
                )}
              </>
            )}
          </Panel>
        </div>

        <div style={{ height: 16 }} />

        <Panel title="3 · Purpose">
          <Field
            label="Stated purpose"
            hint="Printed on the certificate — e.g. 'Employment requirement', 'Scholarship application'."
          >
            <input
              className="cbms-input"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              minLength={3}
              required
            />
          </Field>
          <div className="adm-row">
            <Button
              type="submit"
              variant="primary"
              disabled={busy || !picked || !typeId || purpose.trim().length < 3}
            >
              {busy ? "Creating…" : "Create request"}
            </Button>
            {!picked && <span className="adm-muted">Select a resident to continue.</span>}
          </div>
        </Panel>
      </form>
    </>
  );
}
