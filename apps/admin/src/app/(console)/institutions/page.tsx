"use client";

import * as React from "react";
import { ApiError, get, post, useApi } from "@cbms/api-client";
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
  Toolbar,
  date,
  fullName,
  num,
} from "@cbms/ui";
import { ActionResult, Async, EmptyNote } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import type { Paged } from "../../../lib/types";

/** Local shape: the API returns `minutes[].agenda`, which the shared type omits. */
interface InstitutionMemberRow {
  id: string;
  position: string;
  nameOverride?: string | null;
  termStart?: string | null;
  termEnd?: string | null;
  inhabitant?: {
    firstName?: string | null;
    middleName?: string | null;
    lastName?: string | null;
    suffix?: string | null;
  } | null;
}

interface InstitutionMinuteRow {
  id: string;
  meetingAt?: string | null;
  agenda?: string | null;
  minutes?: string | null;
}

interface InstitutionRow {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  accreditedAt?: string | null;
  isActive: boolean;
  members?: InstitutionMemberRow[];
  minutes?: InstitutionMinuteRow[];
}

/** Which other module each body staffs — the point of the register. */
const FEEDS: Record<string, string> = {
  LUPON: "Feeds Katarungang Pambarangay — these members sit as the Pangkat ng Tagapagkasundo.",
  BDRRMC: "Feeds the Disaster module — these are the responders on the incident roster.",
  BADAC: "Anti-drug abuse council — coordinates with the blotter and peace & order.",
  BCPC: "Council for the protection of children — receives VAC referrals.",
  SK: "Sangguniang Kabataan — its officials are listed on the public website.",
  WOMEN: "Women's group — the implementing arm of the GAD plan.",
  FARMERS: "Farmers' association — consulted for livelihood projects in the BDP.",
  YOUTH: "Youth organisation — consulted for the BDP and SK programmes.",
};

const KNOWN_CODES = ["BDRRMC", "BADAC", "BCPC", "LUPON", "SK", "WOMEN", "FARMERS", "YOUTH"];

/** Chairperson first, then vice, secretary, treasurer, then everyone else. */
function positionRank(position: string): number {
  const p = position.toLowerCase();
  if (p.includes("chairperson") && !p.includes("vice")) return 0;
  if (p.includes("vice")) return 1;
  if (p.includes("secretary")) return 2;
  if (p.includes("treasurer")) return 3;
  return 4;
}

function memberName(m: InstitutionMemberRow): string {
  if (m.inhabitant) return fullName(m.inhabitant);
  return m.nameOverride ?? "—";
}

function sortedMembers(inst: InstitutionRow): InstitutionMemberRow[] {
  return [...(inst.members ?? [])].sort(
    (a, b) => positionRank(a.position) - positionRank(b.position),
  );
}

export default function InstitutionsPage() {
  const { can } = useConsole();
  const mayEncode = can("institutions:encode");

  const list = useApi<Paged<InstitutionRow>>("/institutions?pageSize=100");
  const ids = (list.data?.items ?? []).map((i) => i.id).join(",");

  // The list endpoint does not expand members/minutes — pull each detail record.
  const [details, setDetails] = React.useState<Record<string, InstitutionRow>>({});
  const [detailError, setDetailError] = React.useState<string | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);

  React.useEffect(() => {
    if (!ids) {
      setDetails({});
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    setDetailError(null);
    Promise.all(ids.split(",").map((id) => get<InstitutionRow>(`/institutions/${id}`)))
      .then((rows) => {
        if (cancelled) return;
        setDetails(Object.fromEntries(rows.map((r) => [r.id, r])));
      })
      .catch((err) => {
        if (!cancelled) {
          setDetailError((err as ApiError)?.message ?? "Could not load the rosters.");
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ids]);

  const [openId, setOpenId] = React.useState<string | null>(null);
  const [showNew, setShowNew] = React.useState(false);
  const [form, setForm] = React.useState({ code: "", name: "", description: "" });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const rows = (list.data?.items ?? []).map((i) => details[i.id] ?? i);
  const active = rows.filter((i) => i.isActive).length;
  const memberTotal = rows.reduce((sum, i) => sum + (i.members?.length ?? 0), 0);
  const minutesTotal = rows.reduce((sum, i) => sum + (i.minutes?.length ?? 0), 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const created = await post<InstitutionRow>("/institutions", {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        ...(form.description.trim() ? { description: form.description.trim() } : {}),
      });
      setOk(`${created.code} — ${created.name} registered.`);
      setForm({ code: "", name: "", description: "" });
      setShowNew(false);
      list.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not register the institution.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title="Barangay-Based Institutions"
        subtitle="The register of accredited barangay bodies and their rosters. These are the people who staff the other modules — the Lupon feeds Katarungang Pambarangay, the BDRRMC feeds Disaster."
        breadcrumb="Governance"
        parity="BBI"
        actions={
          mayEncode ? (
            <Button variant="primary" onClick={() => setShowNew((v) => !v)}>
              {showNew ? "Close" : "+ Register institution"}
            </Button>
          ) : undefined
        }
      />

      <ActionResult error={error} success={ok} />

      <StatGrid>
        <StatCard
          label="Registered bodies"
          value={num(list.data?.total)}
          icon="🏛️"
          hint="Councils, committees and accredited organisations"
        />
        <StatCard
          label="Active"
          value={num(active)}
          icon="✅"
          tone={active === rows.length && rows.length > 0 ? "green" : "gold"}
          hint="Currently accredited and functioning"
        />
        <StatCard
          label="Members on the rosters"
          value={num(memberTotal)}
          icon="👥"
          hint="Across every body"
        />
        <StatCard
          label="Meetings minuted"
          value={num(minutesTotal)}
          icon="🗒️"
          hint="Recorded proceedings on file"
        />
      </StatGrid>

      {showNew && mayEncode && (
        <>
          <Panel title="Register an institution">
            <form onSubmit={submit}>
              <div className="adm-form-grid">
                <Field label="Code" hint="Short code, e.g. BDRRMC, LUPON, BCPC.">
                  <input
                    className="cbms-input"
                    list="cbms-institution-codes"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                    placeholder="BDRRMC"
                    required
                  />
                  <datalist id="cbms-institution-codes">
                    {KNOWN_CODES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </Field>
                <Field label="Name">
                  <input
                    className="cbms-input"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Barangay Disaster Risk Reduction and Management Committee"
                    required
                  />
                </Field>
              </div>
              <Field label="Description (optional)" hint="Mandate, enabling ordinance or EO.">
                <textarea
                  className="cbms-textarea"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </Field>
              <Alert tone="info">
                Members and meeting minutes are added to a body after it is registered.
              </Alert>
              <Button type="submit" variant="primary" disabled={busy}>
                {busy ? "Saving…" : "Register"}
              </Button>
            </form>
          </Panel>
          <div style={{ height: 16 }} />
        </>
      )}

      {detailError && <Alert tone="warn">{detailError}</Alert>}

      <Panel padded={false}>
        <Toolbar>
          <strong style={{ fontSize: 13.5, color: "var(--cbms-navy)" }}>
            Accredited bodies
          </strong>
          <div className="cbms-toolbar__spacer" />
          <span className="adm-muted">
            {num(list.data?.total)} bod(ies)
            {detailLoading ? " · loading rosters…" : ""}
          </span>
        </Toolbar>

        <div style={{ padding: 16 }}>
          <Async loading={list.loading} error={list.error}>
            {rows.length === 0 ? (
              <EmptyNote>No barangay-based institutions have been registered yet.</EmptyNote>
            ) : (
              <div className="cbms-grid-2">
                {rows.map((inst) => {
                  const members = sortedMembers(inst);
                  const expanded = openId === inst.id;
                  return (
                    <div
                      key={inst.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setOpenId(expanded ? null : inst.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setOpenId(expanded ? null : inst.id);
                        }
                      }}
                      style={{
                        border: `1px solid ${expanded ? "var(--cbms-ice)" : "var(--cbms-line)"}`,
                        borderRadius: "var(--cbms-radius)",
                        background: "var(--cbms-white)",
                        padding: 14,
                        cursor: "pointer",
                        boxShadow: expanded ? "var(--cbms-shadow)" : undefined,
                      }}
                    >
                      <div className="adm-row">
                        <Chip tone="navy">{inst.code}</Chip>
                        <Chip tone={inst.isActive ? "green" : "gray"}>
                          {inst.isActive ? "Active" : "Inactive"}
                        </Chip>
                        <div className="adm-spacer" />
                        <span className="adm-muted">{expanded ? "▲ Close" : "▼ Open"}</span>
                      </div>

                      <div
                        style={{
                          fontWeight: 600,
                          color: "var(--cbms-navy)",
                          marginTop: 8,
                          fontSize: 14,
                        }}
                      >
                        {inst.name}
                      </div>

                      <div className="adm-muted" style={{ marginTop: 4 }}>
                        Accredited {date(inst.accreditedAt)} · {num(members.length)} member(s) ·{" "}
                        {num(inst.minutes?.length ?? 0) } meeting(s) minuted
                      </div>

                      {FEEDS[inst.code] && (
                        <div className="adm-kpi-note">{FEEDS[inst.code]}</div>
                      )}

                      {inst.description && (
                        <p style={{ fontSize: 13, margin: "8px 0 0", lineHeight: 1.6 }}>
                          {inst.description}
                        </p>
                      )}

                      {!expanded && (
                        <div style={{ marginTop: 10 }}>
                          {members.slice(0, 3).map((m) => (
                            <div
                              key={m.id}
                              style={{
                                display: "flex",
                                gap: 8,
                                fontSize: 13,
                                padding: "3px 0",
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>{memberName(m)}</span>
                              <span className="cbms-table__muted">{m.position}</span>
                            </div>
                          ))}
                          {members.length > 3 && (
                            <div className="adm-muted" style={{ marginTop: 4 }}>
                              +{members.length - 3} more — click to see the full roster.
                            </div>
                          )}
                          {members.length === 0 && (
                            <div className="adm-muted">No members on the roster yet.</div>
                          )}
                        </div>
                      )}

                      {expanded && (
                        <div style={{ marginTop: 12 }} onClick={(e) => e.stopPropagation()}>
                          <div className="cbms-label">Roster</div>
                          <DataTable
                            columns={[
                              {
                                key: "name",
                                header: "Member",
                                render: (m) => (
                                  <span className="cbms-table__primary">{memberName(m)}</span>
                                ),
                              },
                              { key: "position", header: "Position" },
                              {
                                key: "term",
                                header: "Term",
                                render: (m) =>
                                  m.termStart || m.termEnd ? (
                                    `${date(m.termStart)} – ${date(m.termEnd)}`
                                  ) : (
                                    <span className="cbms-table__muted">—</span>
                                  ),
                              },
                            ]}
                            rows={members}
                            empty="No members on the roster yet."
                          />

                          <div className="cbms-label" style={{ marginTop: 14 }}>
                            Meeting minutes
                          </div>
                          <DataTable
                            columns={[
                              {
                                key: "meetingAt",
                                header: "Meeting",
                                render: (m) => (
                                  <span className="cbms-table__primary">{date(m.meetingAt)}</span>
                                ),
                              },
                              {
                                key: "agenda",
                                header: "Agenda",
                                render: (m) =>
                                  m.agenda ?? <span className="cbms-table__muted">—</span>,
                              },
                            ]}
                            rows={inst.minutes ?? []}
                            empty="No minutes have been filed for this body."
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Async>
        </div>
      </Panel>
    </>
  );
}
