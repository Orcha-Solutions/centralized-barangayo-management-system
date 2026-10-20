"use client";

import * as React from "react";
import { Alert, Button, Chip, DataTable, Field, Panel } from "@cbms/ui";
import type { TenantInfo, TenantInvitationInfo } from "@cbms/api-client";
import {
  useCreateInvitationMutation,
  useRevokeTenantInvitationMutation,
  useTenantInvitationsQuery,
  useTenantRosterQuery,
} from "../../../../../lib/rbac-queries";
import { ROLE_LABELS } from "../../../../../lib/labels";

interface BarangayStaffRosterProps {
  tenant: TenantInfo;
}

export function BarangayStaffRoster({ tenant }: BarangayStaffRosterProps) {
  const rosterQuery = useTenantRosterQuery(tenant.id);
  const invitationsQuery = useTenantInvitationsQuery(tenant.id);
  const revokeMutation = useRevokeTenantInvitationMutation(tenant.id);
  const createInviteMutation = useCreateInvitationMutation(tenant.id);

  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState("BARANGAY_SECRETARY");
  const [inviteFeedback, setInviteFeedback] = React.useState<{ ok: boolean; message: string } | null>(null);
  const [copiedToken, setCopiedToken] = React.useState<string | null>(null);

  const members = rosterQuery.data?.members || [];
  const invitations = invitationsQuery.data || [];

  function copyInvite(token: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      const url = `http://localhost:4100/login?invite=${encodeURIComponent(token)}`;
      navigator.clipboard.writeText(url);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    }
  }

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteFeedback(null);
    try {
      await createInviteMutation.mutateAsync({
        email: inviteEmail.trim(),
        role: inviteRole,
        expiresDays: 7,
      });
      setInviteFeedback({
        ok: true,
        message: `Invitation successfully dispatched to ${inviteEmail}.`,
      });
      setInviteEmail("");
      setTimeout(() => {
        setInviteOpen(false);
        setInviteFeedback(null);
      }, 1500);
    } catch (err: any) {
      setInviteFeedback({
        ok: false,
        message: err?.message || "Failed to dispatch staff invitation.",
      });
    }
  }

  return (
    <Panel
      title="👥 Official Roster & Appointed Personnel"
      actions={
        <Button
          type="button"
          variant="primary"
          onClick={() => {
            setInviteFeedback(null);
            setInviteOpen((prev) => !prev);
          }}
        >
          {inviteOpen ? "Cancel Invite" : "+ Invite New Official"}
        </Button>
      }
    >
      <p className="cbms-page-sub" style={{ margin: "0 0 14px" }}>
        Active personnel bound to this tenant with DILG MC 2025-104 role-based access control.
      </p>

      {inviteOpen && (
        <div
          style={{
            marginBottom: 20,
            padding: 16,
            background: "#f8fafc",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
          }}
        >
          <h4 style={{ margin: "0 0 12px", color: "#0f172a", fontSize: 15 }}>
            Invite New Official to Barangay
          </h4>
          <form onSubmit={handleSendInvite}>
            {inviteFeedback && (
              <div style={{ marginBottom: 12 }}>
                <Alert tone={inviteFeedback.ok ? "success" : "danger"}>
                  {inviteFeedback.message}
                </Alert>
              </div>
            )}

            <div className="cbms-grid-2" style={{ gap: 14 }}>
              <Field label="Official Email Address">
                <input
                  className="cbms-input"
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInviteEmail(e.target.value)}
                  placeholder="e.g. secretary@barangay.gov.ph"
                />
              </Field>

              <Field label="Assigned Statutory Role">
                <select
                  className="cbms-select"
                  value={inviteRole}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setInviteRole(e.target.value)}
                >
                  {Object.entries(ROLE_LABELS)
                    .filter(([r]) => r !== "SYSTEM_ADMIN" && r !== "LGU_ADMIN")
                    .map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                </select>
              </Field>
            </div>

            <p style={{ margin: "10px 0 14px", fontSize: 13, color: "#64748b" }}>
              The invitee will receive a secure token valid for 7 days to set their credentials and gain access to this barangay tenant.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button type="button" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={createInviteMutation.isPending || !inviteEmail.trim()}
              >
                {createInviteMutation.isPending ? "Generating Invitation…" : "Send Invitation"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {rosterQuery.isLoading ? (
        <div style={{ padding: "20px 0", textAlign: "center", color: "#64748b" }}>
          Loading barangay staff roster…
        </div>
      ) : members.length === 0 ? (
        <div
          style={{
            padding: 24,
            border: "1px dashed #cbd5e1",
            borderRadius: 8,
            textAlign: "center",
            color: "#64748b",
          }}
        >
          No active officials currently recorded. Click <strong>+ Invite New Official</strong> to onboard barangay leadership.
        </div>
      ) : (
        <DataTable
          rows={members}
          rowKey={(m: any) => m.id}
          columns={[
            {
              key: "name",
              header: "Official Name",
              render: (m: any) => (
                <div>
                  <strong>{m.name || m.fullName || "—"}</strong>
                  {m.phoneNumber && (
                    <div style={{ fontSize: 12, color: "#64748b" }}>{m.phoneNumber}</div>
                  )}
                </div>
              ),
            },
            {
              key: "email",
              header: "Email Address",
              render: (m: any) => <code>{m.email || "—"}</code>,
            },
            {
              key: "role",
              header: "Assigned Role",
              render: (m: any) => (
                <Chip tone="blue">
                  {ROLE_LABELS[m.role] || m.role || "Staff"}
                </Chip>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (m: any) =>
                m.isActive !== false && !m.banned ? (
                  <Chip tone="green">Active</Chip>
                ) : (
                  <Chip tone="red">Suspended</Chip>
                ),
            },
          ]}
        />
      )}

      {invitations.length > 0 && (
        <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid #e2e8f0" }}>
          <h4 style={{ margin: "0 0 10px", color: "#0f172a", fontSize: 15 }}>
            ✉️ Pending Onboarding Invitations ({invitations.length})
          </h4>
          <DataTable
            rows={invitations}
            rowKey={(inv: TenantInvitationInfo) => inv.id}
            columns={[
              {
                key: "email",
                header: "Invitee Email",
                render: (inv: TenantInvitationInfo) => <code>{inv.email}</code>,
              },
              {
                key: "role",
                header: "Target Role",
                render: (inv: TenantInvitationInfo) => (
                  <Chip tone="gray">
                    {ROLE_LABELS[inv.role] || inv.role}
                  </Chip>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (inv: TenantInvitationInfo) => (
                  <Chip tone={inv.isValid ? "gold" : "gray"}>
                    {inv.isValid ? "Pending Acceptance" : "Expired"}
                  </Chip>
                ),
              },
              {
                key: "actions",
                header: "Actions",
                render: (inv: TenantInvitationInfo) => (
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button
                      type="button"
                      onClick={() => copyInvite(inv.id)}
                    >
                      {copiedToken === inv.id ? "✓ Copied Link" : "Copy Link"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={revokeMutation.isPending}
                      onClick={async () => {
                        if (window.confirm(`Revoke invitation for ${inv.email}?`)) {
                          await revokeMutation.mutateAsync(inv.id);
                        }
                      }}
                    >
                      Revoke
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}
    </Panel>
  );
}
