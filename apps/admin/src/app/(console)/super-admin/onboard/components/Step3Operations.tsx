"use client";

import * as React from "react";
import { Button, Field, Panel } from "@cbms/ui";

interface Step3OperationsProps {
  hallAddress: string;
  setHallAddress: (val: string) => void;
  hallPhone: string;
  setHallPhone: (val: string) => void;
  emergencyHotline: string;
  setEmergencyHotline: (val: string) => void;
  purokCount: number;
  setPurokCount: (val: number) => void;
  clearanceFee: number;
  setClearanceFee: (val: number) => void;
  residencyFee: number;
  setResidencyFee: (val: number) => void;
  businessClearanceFee: number;
  setBusinessClearanceFee: (val: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export function Step3Operations(props: Step3OperationsProps) {
  return (
    <Panel title="Step 3 — Workspace Initialization & DILG Statutory Defaults">
      <div className="cbms-grid-2" style={{ gap: 14 }}>
        <Field label="Barangay Hall Official Address">
          <input
            className="cbms-input"
            value={props.hallAddress}
            onChange={(e) => props.setHallAddress(e.target.value)}
          />
        </Field>

        <Field label="Barangay Hall Landline / Desk Telephone">
          <input
            className="cbms-input"
            value={props.hallPhone}
            onChange={(e) => props.setHallPhone(e.target.value)}
          />
        </Field>

        <Field label="24/7 DRRM & Tanod Emergency Dispatch Hotline">
          <input
            className="cbms-input"
            value={props.emergencyHotline}
            onChange={(e) => props.setEmergencyHotline(e.target.value)}
          />
        </Field>

        <Field label="Number of Territorial Puroks / Zones">
          <input
            className="cbms-input"
            type="number"
            min={1}
            max={50}
            value={props.purokCount}
            onChange={(e) => props.setPurokCount(Number(e.target.value) || 7)}
          />
        </Field>

        <Field label="Barangay Clearance Fee (₱)">
          <input
            className="cbms-input"
            type="number"
            min={0}
            value={props.clearanceFee}
            onChange={(e) => props.setClearanceFee(Number(e.target.value) || 0)}
          />
        </Field>

        <Field label="Certificate of Residency Fee (₱)">
          <input
            className="cbms-input"
            type="number"
            min={0}
            value={props.residencyFee}
            onChange={(e) => props.setResidencyFee(Number(e.target.value) || 0)}
          />
        </Field>

        <Field label="Business Permit Barangay Clearance Fee (₱)">
          <input
            className="cbms-input"
            type="number"
            min={0}
            value={props.businessClearanceFee}
            onChange={(e) => props.setBusinessClearanceFee(Number(e.target.value) || 0)}
          />
        </Field>

        <Field label="Certificate of Indigency & RA 11261 First-Time Jobseeker">
          <input
            className="cbms-input"
            value="₱0.00 (Statutorily Exempt / Free)"
            disabled
          />
        </Field>
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
          ← Back: Leadership
        </Button>
        <Button type="button" variant="primary" onClick={props.onNext}>
          Next: Review & Provision →
        </Button>
      </div>
    </Panel>
  );
}
