"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ApiError, post, useApi } from "@cbms/api-client";
import {
  Button,
  DataTable,
  Field,
  KeyValue,
  PageHead,
  Panel,
  StatusChip,
  age,
  date,
  fullName,
  titleize,
} from "@cbms/ui";
import { ActionResult, Async, EmptyNote, SectorChips } from "../../../../components/common";
import { useConsole } from "../../../../components/Shell";
import { CONSENT_PURPOSES, CONSENT_PURPOSE_HINTS } from "../../../../lib/labels";
import type { Household } from "../../../../lib/types";

export default function HouseholdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { can } = useConsole();
  const id = String((params as Record<string, string | string[]>)?.id ?? "");

  const hh = useApi<Household>(id ? `/households/${id}` : null);
  const h = hh.data;

  const [purpose, setPurpose] = React.useState<string>(CONSENT_PURPOSES[0]);
  const [grantedBy, setGrantedBy] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const mayEncode = can("inhabitants:encode");

  async function grant(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await post(`/households/${id}/consent`, {
        purpose,
        grantedBy: grantedBy.trim(),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
      setOk(`Consent for ${titleize(purpose)} recorded.`);
      setGrantedBy("");
      setNotes("");
      hh.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not record the consent.");
    } finally {
      setBusy(false);
    }
  }

  async function withdraw(consentId: string) {
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await post(`/consent/${consentId}/withdraw`);
      setOk("Consent withdrawn. Downstream processing must stop for that purpose.");
      hh.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not withdraw the consent.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title={h ? `Household ${h.householdNo}` : "Household"}
        subtitle={h?.addressLine}
        breadcrumb="Residents / Households"
        parity="BIPS"
        actions={
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="button" className="cbms-btn" onClick={() => router.push("/households")}>
              ← Back to list
            </button>
            {mayEncode && (
              <button 
                type="button" 
                className="cbms-btn cbms-btn--primary" 
                onClick={() => router.push(`/households/${id}/edit`)}
              >
                ✏️ Edit household
              </button>
            )}
          </div>
        }
      />

      <ActionResult error={error} success={ok} />

      <Async loading={hh.loading} error={hh.error}>
        {!h ? (
          <EmptyNote>Household not found.</EmptyNote>
        ) : (
          <div className="adm-stack">
            <div className="cbms-grid-2">
              <Panel title="Household folder">
                <KeyValue
                  items={[
                    ["Household no.", h.householdNo],
                    ["Purok / Sitio", `${h.purok ?? "—"}${h.sitio ? ` · ${h.sitio}` : ""}`],
                    ["Address", h.addressLine],
                    ["Members", String(h.members?.length ?? h._count?.members ?? 0)],
                    ["Dwelling type", titleize(h.dwellingType ?? "")],
                    ["Tenure", titleize(h.tenureStatus ?? "")],
                    ["Water source", titleize(h.waterSource ?? "")],
                    ["Toilet facility", titleize(h.toiletFacility ?? "")],
                    ["Electricity", titleize(h.electricitySource ?? "")],
                    ["Income band", h.monthlyIncomeBand ?? "—"],
                    ["4Ps household", h.is4Ps ? "Yes" : "No"],
                  ]}
                />
              </Panel>

              <Panel title="Record consent (RA 10173)">
                {!mayEncode ? (
                  <EmptyNote>
                    Your role can view consents but not record them.
                  </EmptyNote>
                ) : (
                  <form onSubmit={grant}>
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
                    <Field
                      label="Signed by"
                      hint="Name of the household member who signed the consent form."
                    >
                      <input
                        className="cbms-input"
                        value={grantedBy}
                        onChange={(e) => setGrantedBy(e.target.value)}
                        required
                      />
                    </Field>
                    <Field label="Notes">
                      <textarea
                        className="cbms-textarea"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Reference to the scanned signed form, witnesses, …"
                      />
                    </Field>
                    <Button type="submit" variant="primary" disabled={busy}>
                      {busy ? "Saving…" : "Grant consent"}
                    </Button>
                  </form>
                )}
              </Panel>
            </div>

            <Panel title="Consent register" padded={false}>
              <DataTable
                columns={[
                  { key: "purpose", header: "Purpose", render: (c) => titleize(c.purpose) },
                  { key: "status", header: "Status", render: (c) => <StatusChip status={c.status} /> },
                  { key: "grantedBy", header: "Signed by" },
                  { key: "grantedAt", header: "Granted", render: (c) => date(c.grantedAt) },
                  {
                    key: "withdrawnAt",
                    header: "Withdrawn",
                    render: (c) => (c.withdrawnAt ? date(c.withdrawnAt) : "—"),
                  },
                  {
                    key: "act",
                    header: "",
                    align: "right",
                    render: (c) =>
                      c.status === "granted" && mayEncode ? (
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={busy}
                          onClick={() => void withdraw(c.id)}
                        >
                          Withdraw
                        </Button>
                      ) : null,
                  },
                ]}
                rows={h.consents ?? []}
                empty="No consent has been recorded for this household."
              />
            </Panel>

            <Panel title="Members" padded={false}>
              <DataTable
                columns={[
                  { key: "name", header: "Name", render: (m) => fullName(m) },
                  {
                    key: "rel",
                    header: "Relation",
                    render: (m) => titleize(m.relationToHead ?? ""),
                  },
                  {
                    key: "age",
                    header: "Age / Sex",
                    render: (m) => `${age(m.birthDate) ?? "—"} · ${m.sex === "male" ? "M" : "F"}`,
                  },
                  { key: "sect", header: "Sectoral", render: (m) => <SectorChips row={m} /> },
                ]}
                rows={h.members ?? []}
                empty="No members recorded."
                onRowClick={(m) => router.push(`/inhabitants/${m.id}`)}
              />
            </Panel>
          </div>
        )}
      </Async>
    </>
  );
}
