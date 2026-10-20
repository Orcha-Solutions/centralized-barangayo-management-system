"use client";

import * as React from "react";
import { Button, Field, Panel } from "@cbms/ui";
import { ROLE_LABELS } from "../../../../../lib/labels";
import type { LeadershipMode } from "../types";

interface Step2LeadershipProps {
  leadershipMode: LeadershipMode;
  setLeadershipMode: (m: LeadershipMode) => void;
  execName: string;
  setExecName: (val: string) => void;
  execEmail: string;
  setExecEmail: (val: string) => void;
  execRole: string;
  setExecRole: (val: string) => void;
  execPhone: string;
  setExecPhone: (val: string) => void;
  execPassword: string;
  setExecPassword: (val: string) => void;
  inviteEmail: string;
  setInviteEmail: (val: string) => void;
  inviteRole: string;
  setInviteRole: (val: string) => void;
  onBack: () => void;
  onNext: () => void;
}

const STRATEGIES = [
  {
    id: "both" as const,
    label: "Executive Account + Staff Invite Token",
    desc: "Direct Punong Barangay credentials + single-use invite link for Secretary",
  },
  {
    id: "direct" as const,
    label: "Direct Executive Account Only",
    desc: "Pre-create credentials for Punong Barangay to hand over",
  },
  {
    id: "invite" as const,
    label: "Token Invite Only (No Pre-Set Password)",
    desc: "Send a 7-day secure claim link via email / SMS",
  },
];

export function Step2Leadership(props: Step2LeadershipProps) {
  return (
    <Panel title="Step 2 — Initial Executive Leadership & Official Provisioning">
      <div style={{ marginBottom: 16 }}>
        <label className="cbms-label" style={{ marginBottom: 6, display: "block" }}>
          Initial Onboarding Strategy
        </label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {STRATEGIES.map((opt) => (
            <label
              key={opt.id}
              style={{
                flex: "1 1 200px",
                border:
                  props.leadershipMode === opt.id ? "2px solid #2563eb" : "1px solid #cbd5e1",
                background: props.leadershipMode === opt.id ? "#eff6ff" : "#ffffff",
                borderRadius: 8,
                padding: "10px 12px",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="leadershipMode"
                value={opt.id}
                checked={props.leadershipMode === opt.id}
                onChange={() => props.setLeadershipMode(opt.id)}
                style={{ marginRight: 6 }}
              />
              <strong>{opt.label}</strong>
              <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>
                {opt.desc}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="cbms-grid-2" style={{ gap: 14 }}>
        <Field
          label="Primary Official Full Name"
          hint="e.g., Hon. Juan Dela Cruz (Punong Barangay)."
        >
          <input
            className="cbms-input"
            placeholder="Hon. Juan Dela Cruz"
            value={props.execName}
            onChange={(e) => props.setExecName(e.target.value)}
            required
          />
        </Field>

        <Field
          label="Official Gov/Barangay Email"
          hint="Will serve as primary login identifier."
        >
          <input
            className="cbms-input"
            type="email"
            placeholder="kapitan@sanisidro.gov.ph"
            value={props.execEmail}
            onChange={(e) => props.setExecEmail(e.target.value)}
            required
          />
        </Field>

        <Field label="Assigned Statutory Role (DILG MC 2025-104)">
          <select
            className="cbms-select"
            value={props.execRole}
            onChange={(e) => props.setExecRole(e.target.value)}
          >
            {Object.entries(ROLE_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label} ({k})
              </option>
            ))}
          </select>
        </Field>

        <Field label="Official Contact Number">
          <input
            className="cbms-input"
            value={props.execPhone}
            onChange={(e) => props.setExecPhone(e.target.value)}
          />
        </Field>

        {props.leadershipMode !== "invite" && (
          <Field
            label="Initial Temporary Password"
            hint="The official can rotate this password upon first sign-in."
          >
            <input
              className="cbms-input"
              value={props.execPassword}
              onChange={(e) => props.setExecPassword(e.target.value)}
            />
          </Field>
        )}

        {props.leadershipMode === "both" && (
          <>
            <Field
              label="Secondary Official Invite Email (7-Day Token)"
              hint="Generates a shareable /login?invite=<token> onboarding link."
            >
              <input
                className="cbms-input"
                type="email"
                placeholder="secretary@sanisidro.gov.ph"
                value={props.inviteEmail}
                onChange={(e) => props.setInviteEmail(e.target.value)}
              />
            </Field>
            <Field label="Secondary Invite Pre-Assigned Role">
              <select
                className="cbms-select"
                value={props.inviteRole}
                onChange={(e) => props.setInviteRole(e.target.value)}
              >
                {Object.entries(ROLE_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label} ({k})
                  </option>
                ))}
              </select>
            </Field>
          </>
        )}
      </div>

      <div
        style={{
          marginTop: 18,
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <Button type="button" onClick={props.onBack}>
          ← Back: Identity
        </Button>
        <Button type="button" variant="primary" onClick={props.onNext}>
          Next: Statutory Defaults →
        </Button>
      </div>
    </Panel>
  );
}
