"use client";

import * as React from "react";
import { KeyValue, Panel } from "@cbms/ui";
import type { BarangaySettings } from "../types";

interface BarangayOperationsCardProps {
  settings: BarangaySettings;
}

export function BarangayOperationsCard({ settings }: BarangayOperationsCardProps) {
  const fees = settings.statutoryFees || {};

  return (
    <Panel title="📋 Operations & Statutory Framework">
      <div className="cbms-grid-2" style={{ gap: 16 }}>
        <div>
          <h4 style={{ margin: "0 0 12px", color: "#0f172a", fontSize: 15 }}>
            🏛️ Headquarters & Emergency Hotlines
          </h4>
          <KeyValue
            items={[
              [
                "Barangay Hall Address",
                settings.hallAddress || (
                  <span style={{ color: "#94a3b8" }}>Standard Barangay Hall</span>
                ),
              ],
              [
                "Hall Telephone",
                settings.hallPhone || (
                  <span style={{ color: "#94a3b8" }}>(02) 8942-0100</span>
                ),
              ],
              [
                "Emergency Hotline",
                settings.emergencyHotline ? (
                  <strong style={{ color: "#dc2626" }}>{settings.emergencyHotline}</strong>
                ) : (
                  <span style={{ color: "#94a3b8" }}>911 / 161 (Marikina Rescue)</span>
                ),
              ],
              [
                "Timezone",
                <code>{settings.timezone || "Asia/Manila"}</code>,
              ],
            ]}
          />
        </div>

        <div>
          <h4 style={{ margin: "0 0 12px", color: "#0f172a", fontSize: 15 }}>
            ⚖️ Jurisdiction & Statutory Fees
          </h4>
          <KeyValue
            items={[
              [
                "Territorial Puroks",
                <strong>{settings.purokCount ?? 7} Puroks</strong>,
              ],
              [
                "Barangay Clearance Fee",
                <strong>₱{fees.clearance ?? 50}.00</strong>,
              ],
              [
                "Certificate of Residency",
                <strong>₱{fees.residency ?? 50}.00</strong>,
              ],
              [
                "Business Clearance Fee",
                <strong>₱{fees.businessClearance ?? 500}.00</strong>,
              ],
            ]}
          />
        </div>
      </div>
    </Panel>
  );
}
