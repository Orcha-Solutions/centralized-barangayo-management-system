"use client";

import * as React from "react";
import { KeyValue, Panel, peso, titleize } from "@cbms/ui";
import type { Household } from "../../../../../lib/types";

export interface HouseholdInfoCardsProps {
  household: Household;
}

export function HouseholdInfoCards({ household: h }: HouseholdInfoCardsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Card 1: Socio-Economic & Form A1 Profile */}
      <Panel title="📋 Socio-Economic Profile (BIMS Form A1)">
        <KeyValue
          items={[
            ["Household Control No.", <strong style={{ color: "var(--cbms-navy, #0a2463)" }}>{h.householdNo}</strong>],
            ["Family / Head Name", h.householdName || "—"],
            ["Household Classification", titleize(h.householdType || "Nuclear")],
            ["Tenure Status", titleize(h.tenureStatus || "Owner")],
            ["Housing Unit Type", titleize(h.housingUnit || "Single House")],
            ["Monthly Household Income", h.monthlyIncome ? peso(h.monthlyIncome) : "₱0.00"],
            ["Number of Families", String(h.numFamilies || 1)],
            [
              "4Ps Assistance Status",
              h.is4Ps ? (
                <span style={{ color: "#166534", fontWeight: 700, backgroundColor: "#dcfce7", padding: "1px 8px", borderRadius: 4 }}>
                  Active 4Ps Beneficiary
                </span>
              ) : (
                <span style={{ color: "#64748b" }}>Non-Beneficiary</span>
              ),
            ],
          ]}
        />
      </Panel>

      {/* Card 2: Address & Geographic Location */}
      <Panel title="📍 Dwelling & Geographic Location">
        <KeyValue
          items={[
            ["Purok / Zone", <span style={{ fontWeight: 600 }}>{h.purok || "Unassigned"}</span>],
            ["Sitio / Sub-zone", h.sitio || "—"],
            ["Street Address", h.street || "—"],
            ["Complete Address Line", h.addressLine || "—"],
            ["House / Block / Lot", `${h.houseNo ? `#${h.houseNo} ` : ""}${h.lotNo ? `Lot ${h.lotNo} ` : ""}${h.blockNo ? `Blk ${h.blockNo}` : ""}`.trim() || "—"],
            [
              "GPS Map Coordinates",
              h.latitude && h.longitude ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <code style={{ fontSize: "11px", backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>
                    {h.latitude.toFixed(6)}, {h.longitude.toFixed(6)}
                  </code>
                  <a
                    href={`https://www.google.com/maps?q=${h.latitude},${h.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "11.5px", color: "#2563eb", textDecoration: "none", fontWeight: 600 }}
                  >
                    View Map ↗
                  </a>
                </span>
              ) : (
                <span style={{ color: "#94a3b8" }}>Not pinned on GIS</span>
              ),
            ],
          ]}
        />
      </Panel>

      {/* Card 3: Utilities & Sanitation Facilities */}
      <Panel title="🚰 Utilities & Sanitation Services">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "12px 14px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>WATER SOURCE</div>
            <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#1e293b", marginTop: 4 }}>
              💧 {titleize(h.waterSource || "Piped Water System")}
            </div>
          </div>

          <div style={{ padding: "12px 14px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>TOILET FACILITY</div>
            <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#1e293b", marginTop: 4 }}>
              🚽 {titleize(h.toiletFacility || "Flush (Exclusive)")}
            </div>
          </div>

          <div style={{ padding: "12px 14px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>ELECTRICITY SOURCE</div>
            <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#1e293b", marginTop: 4 }}>
              ⚡ {titleize(h.electricitySource || "Grid Electric")}
            </div>
          </div>

          <div style={{ padding: "12px 14px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>COOKING FUEL</div>
            <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#1e293b", marginTop: 4 }}>
              🍳 {titleize(h.cookingFuel || "LPG")}
            </div>
          </div>

          <div style={{ padding: "12px 14px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>WASTE DISPOSAL</div>
            <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#1e293b", marginTop: 4 }}>
              🚛 {titleize(h.wasteDisposal || "Barangay Collection Truck")}
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
