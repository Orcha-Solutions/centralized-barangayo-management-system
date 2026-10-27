"use client";

import * as React from "react";
import { Chip, KeyValue, Panel, StatusChip, age, date, fullName, peso, titleize } from "@cbms/ui";
import { SourceChip } from "../../../../../components/common";
import type { InhabitantDetail } from "../../../../../lib/types";

export interface InhabitantInfoCardsProps {
  inhabitant: InhabitantDetail;
}

export function InhabitantInfoCards({ inhabitant: p }: InhabitantInfoCardsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Card 1: Identity & Demographics (Form A2 Parts 1 & 3) */}
      <Panel title="📋 Identity & Demographics (BIMS Form A2)">
        <KeyValue
          items={[
            ["Full Name", <strong key="name" style={{ color: "var(--cbms-navy, #0a2463)" }}>{fullName(p)}</strong>],
            ["PhilSys Card (PCN)", p.philsysNo ? <Chip key="pcn" tone="green">{p.philsysNo}</Chip> : <span key="nopcn" style={{ color: "#94a3b8" }}>Not captured</span>],
            ["Resident Type", titleize(p.residentType ?? "Non-migrant")],
            ["Sex / Gender", `${titleize(p.sex)} · Gender: ${titleize(p.gender ?? p.sex)}`],
            ["Age / Birth Date", `${age(p.birthDate) ?? "—"} years old (${date(p.birthDate)})`],
            ["Place of Birth", p.birthPlace ?? "—"],
            ["Mother's Residence at Birth", p.residenceMotherAtBirth ?? "—"],
            ["Civil Status", titleize(p.civilStatus ?? "Single")],
            ["Blood Type", p.bloodType ?? "—"],
            ["Height / Weight", `${p.height ? `${p.height} m` : "—"} · ${p.weight ? `${p.weight} kg` : "—"}`],
            ["Complexion", titleize(p.complexion ?? "Medium")],
            ["Nationality", titleize(p.nationality ?? "Filipino")],
            ["Ethnicity (Form 1.A)", p.ethnicity ?? "Tagalog"],
            ["Religion", p.religion ?? "Roman Catholic"],
            ["Mother's Maiden Name", `${p.mothersMaidenFirstName ?? ""} ${p.mothersMaidenMiddleName ?? ""} ${p.mothersMaidenLastName ?? ""}`.trim() || "—"],
            ["Record Source", <SourceChip key="src" source={p.source} />],
          ]}
        />
      </Panel>

      {/* Card 2: Occupation, Socio-Economics & E-Wallet */}
      <Panel title="💼 Occupation, Education & E-Wallet">
        <KeyValue
          items={[
            ["Occupation", p.occupation ?? "—"],
            ["Education Level", p.educationLevel ?? "—"],
            ["Monthly Income", p.monthlyIncome ? peso(p.monthlyIncome * 100) : "—"],
            ["COMELEC Registered Voter", p.isRegisteredVoter ? `Yes (Last voted: ${p.lastVotedYear ?? "2025"})` : "No"],
            ["Barangay Resident Voter", p.isResidentVoter ? "Yes" : "No"],
            [
              "Barangay Digital Wallet",
              p.wallet ? (
                <div key="wallet" style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                  <strong>{peso(p.wallet.balanceCentavos)}</strong>
                  <StatusChip status={p.wallet.status} />
                  <StatusChip status={p.wallet.kycTier} />
                </div>
              ) : (
                <span key="nowallet" style={{ color: "#64748b" }}>No wallet on file (OTC release fallback)</span>
              ),
            ],
          ]}
        />
      </Panel>
    </div>
  );
}
