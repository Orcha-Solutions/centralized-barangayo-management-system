"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chip, DataTable, KeyValue, Panel, StatusChip, age, fullName, titleize } from "@cbms/ui";
import { EmptyNote, Progress, SectorChips } from "../../../../../components/common";
import { formatPhilippineMobile } from "../../../../../lib/validation";
import type { Household, InhabitantDetail } from "../../../../../lib/types";

export interface InhabitantFamilyCardProps {
  inhabitant: InhabitantDetail;
  household: Household | null;
  householdLoading: boolean;
}

export function InhabitantFamilyCard({
  inhabitant: p,
  household,
  householdLoading,
}: InhabitantFamilyCardProps) {
  const router = useRouter();
  const completeness = p.completeness ?? 0;
  const tone = completeness >= 80 ? "green" : completeness >= 50 ? "gold" : "red";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Card 1: Contact & Communication Channels */}
      <Panel title="📱 Contact & Communication Channels">
        <KeyValue
          items={[
            [
              "Mobile Number",
              p.contactPhone ? (
                <div key="phone" style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <a
                    href={`tel:${p.contactPhone.replace(/[^0-9+]/g, "")}`}
                    style={{
                      color: "var(--cbms-navy, #0a2463)",
                      textDecoration: "underline",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                    title="Click to call mobile number"
                  >
                    📱 {formatPhilippineMobile(p.contactPhone)}
                  </a>
                  <a
                    href={`sms:${p.contactPhone.replace(/[^0-9+]/g, "")}`}
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      textDecoration: "none",
                      cursor: "pointer",
                      backgroundColor: "#eff6ff",
                      color: "#1d4ed8",
                      border: "1px solid #bfdbfe",
                      borderRadius: 12,
                      fontWeight: 600,
                    }}
                    title="Click to send SMS message"
                  >
                    💬 SMS
                  </a>
                </div>
              ) : (
                <span key="nophone" style={{ color: "#94a3b8" }}>Not provided</span>
              ),
            ],
            [
              "Email Address",
              p.contactEmail ? (
                <a
                  key="email"
                  href={`mailto:${p.contactEmail}`}
                  style={{
                    color: "var(--cbms-navy, #0a2463)",
                    textDecoration: "underline",
                    fontWeight: 600,
                  }}
                  title="Click to send email"
                >
                  ✉️ {p.contactEmail}
                </a>
              ) : (
                <span key="noemail" style={{ color: "#94a3b8" }}>Not provided</span>
              ),
            ],
            [
              "Landline Telephone",
              p.telephoneNumber ? (
                <a
                  key="tel"
                  href={`tel:${p.telephoneNumber.replace(/[^0-9+]/g, "")}`}
                  style={{ color: "var(--cbms-navy, #0a2463)", textDecoration: "underline" }}
                >
                  ☎️ {p.telephoneNumber}
                </a>
              ) : (
                <span key="notel" style={{ color: "#94a3b8" }}>Not provided</span>
              ),
            ],
          ]}
        />
      </Panel>

      {/* Card 2: Sectoral Flags & Registry Completeness */}
      <Panel title="🏛️ Sectoral Profile & Assistance (Form A2 Part 4)">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <Progress
            value={completeness}
            tone={tone}
            label={`${completeness}% of statutory DILG Form A2 fields captured`}
          />

          <div>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>
              Sectoral Identifiers
            </div>
            <SectorChips row={p} />
            {p.govAssistance && (
              <div style={{ marginTop: 8 }}>
                <Chip tone="gold">🏛️ Beneficiary: {p.govAssistance}</Chip>
              </div>
            )}
          </div>
        </div>
      </Panel>

      {/* Card 3: Household Affiliation & Family Members */}
      <Panel title="🏠 Household Affiliation (BIMS Form A1)" padded={false}>
        {!p.householdId ? (
          <div style={{ padding: "1.2rem" }}>
            <EmptyNote>This resident is not attached to a household folder.</EmptyNote>
          </div>
        ) : (
          <div>
            <div style={{ padding: "12px 16px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <Link
                href={`/households/${p.householdId}`}
                style={{ fontWeight: 700, color: "var(--cbms-navy, #0a2463)", textDecoration: "none" }}
              >
                Household #{household?.householdNo ?? p.household?.householdNo ?? "Record"} ↗
              </Link>
              <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 2 }}>
                {household?.householdName ?? "Domestic Family"} · Purok {household?.purok ?? p.household?.purok ?? "—"} · {household?.addressLine ?? p.household?.addressLine ?? ""}
              </div>
            </div>

            <DataTable
              columns={[
                { key: "name", header: "Member", render: (m) => fullName(m) },
                {
                  key: "rel",
                  header: "Relation Code",
                  render: (m) => `Code ${m.relationToHead ?? "1"} · ${titleize(m.relationToHead ?? "")}`,
                },
                {
                  key: "age",
                  header: "Age / Sex",
                  render: (m) => `${age(m.birthDate) ?? "—"} · ${m.sex === "male" ? "M" : "F"}`,
                },
                { key: "sect", header: "Sectoral", render: (m) => <SectorChips row={m} /> },
              ]}
              rows={household?.members ?? []}
              empty="No other family members recorded."
              onRowClick={(m) => router.push(`/inhabitants/${m.id}`)}
            />
          </div>
        )}
      </Panel>
    </div>
  );
}
