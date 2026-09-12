"use client";

import * as React from "react";
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
import { ActionResult } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import {
  useInstitutionStore,
  type Institution,
  type InstitutionMember,
} from "../../../store/institutionStore";

/** Which other module each body staffs — the point of the register. */
const FEEDS: Record<string, string> = {
  BDC: "Barangay Development Council — formulates the 3-year BDP & Annual Investment Program (AIP).",
  LUPON: "Feeds Katarungang Pambarangay — these members sit as the Pangkat ng Tagapagkasundo.",
  BDRRMC: "Feeds the Disaster module — these are the responders on the incident roster and evacuation operations.",
  BADAC: "Anti-drug abuse council — coordinates with the blotter, PNP, and community rehabilitation.",
  BCPC: "Council for the protection of children — receives VAC referrals and runs child protection programs.",
  SK: "Sangguniang Kabataan — its youth officials direct youth development and the 10% SK budget.",
  WOMEN: "Women's group — the implementing arm of the GAD plan and VAW Desk.",
  FARMERS: "Farmers' association — consulted for livelihood projects in the BDP.",
  YOUTH: "Youth organisation — consulted for the BDP and SK programmes.",
};

const KNOWN_CODES = ["BDC", "BDRRMC", "BADAC", "BCPC", "LUPON", "SK", "WOMEN", "FARMERS", "YOUTH"];

/** Chairperson first, then vice, secretary, treasurer, then everyone else. */
function positionRank(position: string): number {
  const p = position.toLowerCase();
  if (p.includes("chairperson") && !p.includes("vice")) return 0;
  if (p.includes("vice")) return 1;
  if (p.includes("secretary")) return 2;
  if (p.includes("treasurer")) return 3;
  return 4;
}

function memberName(m: InstitutionMember): string {
  if (m.inhabitant) return fullName(m.inhabitant);
  return m.nameOverride ?? "—";
}

function sortedMembers(inst: Institution): InstitutionMember[] {
  return [...(inst.members ?? [])].sort(
    (a, b) => positionRank(a.position) - positionRank(b.position),
  );
}

export default function InstitutionsPage() {
  const { can } = useConsole();
  const mayEncode = can("institutions:encode") || can("institutions:create") || can("institutions:edit");

  const {
    institutions,
    loading,
    error: storeError,
    fetchInstitutions,
    addInstitution,
    addMember,
    addMinute,
  } = useInstitutionStore();

  React.useEffect(() => {
    fetchInstitutions();
  }, [fetchInstitutions]);

  const [openId, setOpenId] = React.useState<string | null>(null);
  const [showNew, setShowNew] = React.useState(false);
  const [form, setForm] = React.useState({ code: "", name: "", description: "" });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  // Quick Member Add Form State
  const [memberFormInstId, setMemberFormInstId] = React.useState<string | null>(null);
  const [memberPos, setMemberPos] = React.useState("");
  const [memberNameInput, setMemberNameInput] = React.useState("");

  // Quick Minute Add Form State
  const [minuteFormInstId, setMinuteFormInstId] = React.useState<string | null>(null);
  const [minuteAgenda, setMinuteAgenda] = React.useState("");
  const [minuteDate, setMinuteDate] = React.useState(new Date().toISOString().split("T")[0]);

  const active = institutions.filter((i) => i.isActive).length;
  const memberTotal = institutions.reduce((sum, i) => sum + (i.members?.length ?? 0), 0);
  const minutesTotal = institutions.reduce((sum, i) => sum + (i.minutes?.length ?? 0), 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const created = await addInstitution({
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        accreditedAt: new Date().toISOString().split("T")[0],
        isActive: true,
      });
      setOk(`${created.code} — ${created.name} successfully registered.`);
      setForm({ code: "", name: "", description: "" });
      setShowNew(false);
    } catch (err: any) {
      setError(err?.message ?? "Could not register the institution.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAddMember(instId: string) {
    if (!memberPos.trim() || !memberNameInput.trim()) return;
    try {
      await addMember(instId, {
        position: memberPos.trim(),
        nameOverride: memberNameInput.trim(),
        termStart: "2023-11-01",
        termEnd: "2026-11-01",
      });
      setOk(`Added ${memberNameInput.trim()} to the roster.`);
      setMemberPos("");
      setMemberNameInput("");
      setMemberFormInstId(null);
    } catch (err: any) {
      setError(err?.message ?? "Could not add member.");
    }
  }

  async function handleAddMinute(instId: string) {
    if (!minuteAgenda.trim()) return;
    try {
      await addMinute(instId, {
        agenda: minuteAgenda.trim(),
        meetingAt: minuteDate,
      });
      setOk(`Meeting recorded for ${minuteDate}.`);
      setMinuteAgenda("");
      setMinuteFormInstId(null);
    } catch (err: any) {
      setError(err?.message ?? "Could not record meeting.");
    }
  }

  return (
    <>
      <PageHead
        title="Barangay-Based Institutions (BBIs)"
        subtitle="Register of accredited barangay councils, committees, and functionary rosters. BDC directs planning, Lupon directs justice, and BDRRMC directs disaster resilience."
        breadcrumb="Governance / Institutions"
        parity="BBI Subsystem"
        actions={
          mayEncode ? (
            <Button variant="primary" onClick={() => setShowNew((v) => !v)}>
              {showNew ? "Close Form" : "+ Register Institution"}
            </Button>
          ) : undefined
        }
      />

      <ActionResult error={error || storeError} success={ok} />

      <StatGrid>
        <StatCard
          label="Registered Bodies (BBIs)"
          value={num(institutions.length)}
          icon="🏛️"
          hint="Mandated councils and committees"
        />
        <StatCard
          label="Active Councils"
          value={num(active)}
          icon="✅"
          tone={active === institutions.length && institutions.length > 0 ? "green" : "gold"}
          hint="Currently functioning & accredited"
        />
        <StatCard
          label="Appointed Members"
          value={num(memberTotal)}
          icon="👥"
          hint="Total roster across all bodies"
        />
        <StatCard
          label="Minuted Proceedings"
          value={num(minutesTotal)}
          icon="🗒️"
          hint="Official meeting records on file"
        />
      </StatGrid>

      {showNew && mayEncode && (
        <>
          <div style={{ height: 16 }} />
          <Panel title="Register an Institution or Barangay Council">
            <form onSubmit={submit}>
              <div className="adm-form-grid">
                <Field label="Council / Body Code" hint="e.g. BDC, BDRRMC, LUPON, BADAC, BCPC.">
                  <input
                    className="cbms-input"
                    list="cbms-institution-codes"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                    placeholder="BDC"
                    required
                  />
                  <datalist id="cbms-institution-codes">
                    {KNOWN_CODES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </Field>
                <Field label="Official Council Name">
                  <input
                    className="cbms-input"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Barangay Development Council"
                    required
                  />
                </Field>
              </div>
              <Field label="Mandate & Description" hint="Enabling ordinance, Executive Order, or DILG policy reference.">
                <textarea
                  className="cbms-textarea"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Mandated under Section 106 of RA 7160 to formulate comprehensive multi-sectoral development plans."
                />
              </Field>
              <div style={{ marginTop: 12 }}>
                <Button type="submit" variant="primary" disabled={busy}>
                  {busy ? "Registering…" : "Register Institution"}
                </Button>
              </div>
            </form>
          </Panel>
        </>
      )}

      <div style={{ height: 16 }} />

      <Panel padded={false}>
        <Toolbar>
          <strong style={{ fontSize: 13.5, color: "var(--cbms-navy)" }}>
            Accredited Barangay-Based Institutions (BBIs)
          </strong>
          <div className="cbms-toolbar__spacer" />
          <span className="adm-muted">{num(institutions.length)} council(s) on record</span>
        </Toolbar>

        <div style={{ padding: 16 }}>
          {institutions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
              No barangay-based institutions have been registered yet.
            </div>
          ) : (
            <div className="cbms-grid-2">
              {institutions.map((inst) => {
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
                      <span className="adm-muted">{expanded ? "▲ Close Details" : "▼ Open Roster & Minutes"}</span>
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

                    <div className="adm-muted" style={{ marginTop: 4, fontSize: "0.8rem" }}>
                      Accredited {date(inst.accreditedAt)} · {num(members.length)} member(s) ·{" "}
                      {num(inst.minutes?.length ?? 0)} meeting(s) minuted
                    </div>

                    {FEEDS[inst.code] && (
                      <div className="adm-kpi-note" style={{ marginTop: 6, fontSize: "0.8rem" }}>
                        {FEEDS[inst.code]}
                      </div>
                    )}

                    {inst.description && (
                      <p style={{ fontSize: 13, margin: "8px 0 0", lineHeight: 1.6, color: "#475569" }}>
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
                            <span className="cbms-table__muted">({m.position})</span>
                          </div>
                        ))}
                        {members.length > 3 && (
                          <div className="adm-muted" style={{ marginTop: 4, fontSize: "0.75rem" }}>
                            +{members.length - 3} more members — click to view full roster
                          </div>
                        )}
                        {members.length === 0 && (
                          <div className="adm-muted" style={{ fontSize: "0.8rem" }}>
                            No members on the roster yet.
                          </div>
                        )}
                      </div>
                    )}

                    {expanded && (
                      <div style={{ marginTop: 14 }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <div className="cbms-label">Official Committee Roster</div>
                          {mayEncode && (
                            <button
                              type="button"
                              className="cbms-btn cbms-btn--sm"
                              onClick={() => setMemberFormInstId(memberFormInstId === inst.id ? null : inst.id)}
                            >
                              {memberFormInstId === inst.id ? "Cancel" : "➕ Add Member"}
                            </button>
                          )}
                        </div>

                        {memberFormInstId === inst.id && (
                          <div style={{ padding: "0.75rem", background: "var(--color-bg-subtle, #f8fafc)", borderRadius: 6, marginBottom: 10 }}>
                            <div style={{ display: "flex", gap: 8 }}>
                              <input
                                className="cbms-input cbms-input--sm"
                                placeholder="Position (e.g. Secretary)"
                                value={memberPos}
                                onChange={(e) => setMemberPos(e.target.value)}
                              />
                              <input
                                className="cbms-input cbms-input--sm"
                                placeholder="Full Name"
                                value={memberNameInput}
                                onChange={(e) => setMemberNameInput(e.target.value)}
                              />
                              <Button size="sm" onClick={() => handleAddMember(inst.id)}>Save</Button>
                            </div>
                          </div>
                        )}

                        <DataTable
                          columns={[
                            {
                              key: "name",
                              header: "Member Name",
                              render: (m) => (
                                <span className="cbms-table__primary" style={{ fontWeight: 600 }}>
                                  {memberName(m)}
                                </span>
                              ),
                            },
                            { key: "position", header: "Position" },
                            {
                              key: "term",
                              header: "Term of Office",
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

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 6 }}>
                          <div className="cbms-label">Recorded Proceedings & Minutes</div>
                          {mayEncode && (
                            <button
                              type="button"
                              className="cbms-btn cbms-btn--sm"
                              onClick={() => setMinuteFormInstId(minuteFormInstId === inst.id ? null : inst.id)}
                            >
                              {minuteFormInstId === inst.id ? "Cancel" : "➕ File Meeting"}
                            </button>
                          )}
                        </div>

                        {minuteFormInstId === inst.id && (
                          <div style={{ padding: "0.75rem", background: "var(--color-bg-subtle, #f8fafc)", borderRadius: 6, marginBottom: 10 }}>
                            <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                              <input
                                className="cbms-input cbms-input--sm"
                                type="date"
                                value={minuteDate}
                                onChange={(e) => setMinuteDate(e.target.value)}
                              />
                              <input
                                className="cbms-input cbms-input--sm"
                                placeholder="Meeting Agenda & Summary of Resolutions"
                                value={minuteAgenda}
                                onChange={(e) => setMinuteAgenda(e.target.value)}
                              />
                              <div style={{ alignSelf: "flex-end" }}>
                                <Button size="sm" onClick={() => handleAddMinute(inst.id)}>Record Meeting</Button>
                              </div>
                            </div>
                          </div>
                        )}

                        <DataTable
                          columns={[
                            {
                              key: "meetingAt",
                              header: "Date of Meeting",
                              render: (m) => (
                                <span className="cbms-table__primary">{date(m.meetingAt)}</span>
                              ),
                            },
                            {
                              key: "agenda",
                              header: "Agenda / Highlights",
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
        </div>
      </Panel>
    </>
  );
}
