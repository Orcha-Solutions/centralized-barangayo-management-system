"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DataTable, Panel, age, fullName, titleize } from "@cbms/ui";
import { SectorChips } from "../../../../../components/common";
import type { Inhabitant } from "../../../../../lib/types";

export interface HouseholdMembersTableProps {
  members: Inhabitant[];
  loading?: boolean;
}

export function HouseholdMembersTable({ members, loading }: HouseholdMembersTableProps) {
  const router = useRouter();

  return (
    <Panel
      title={`Household Members (${members?.length ?? 0})`}
      padded={false}
    >
      <DataTable
        columns={[
          {
            key: "name",
            header: "Citizen / PhilSys",
            width: "32%",
            render: (m: Inhabitant) => {
              const initials = `${m.firstName?.[0] || ""}${m.lastName?.[0] || ""}`.toUpperCase();
              const isHead = m.relationToHead?.toLowerCase() === "head";
              return (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      backgroundColor: isHead ? "#dbeafe" : "#f1f5f9",
                      color: isHead ? "#1e40af" : "#475569",
                      fontWeight: 700,
                      fontSize: "12px",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    {initials || "👤"}
                  </div>
                  <div>
                    <div className="cbms-table__primary" style={{ fontWeight: 600 }}>
                      {fullName(m)}
                    </div>
                    <div className="cbms-table__muted" style={{ fontSize: "11px" }}>
                      {m.philsysNo ? `PCN ${m.philsysNo}` : "No PhilSys PCN"}
                    </div>
                  </div>
                </div>
              );
            },
          },
          {
            key: "relation",
            header: "Family Role",
            width: "18%",
            render: (m: Inhabitant) => {
              const isHead = m.relationToHead?.toLowerCase() === "head";
              return (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "3px 8px",
                    borderRadius: 6,
                    backgroundColor: isHead ? "#eff6ff" : "#f8fafc",
                    border: `1px solid ${isHead ? "#bfdbfe" : "#e2e8f0"}`,
                    color: isHead ? "#1d4ed8" : "#334155",
                    fontWeight: isHead ? 700 : 500,
                    fontSize: "11.5px",
                  }}
                >
                  {isHead && "👑 "}
                  {titleize(m.relationToHead || "Member")}
                </span>
              );
            },
          },
          {
            key: "ageSex",
            header: "Sex / Age",
            width: "16%",
            render: (m: Inhabitant) =>
              `${m.sex === "male" ? "Male" : "Female"} · ${age(m.birthDate) ?? "—"} y/o`,
          },
          {
            key: "civil",
            header: "Civil Status",
            width: "12%",
            render: (m: Inhabitant) => (
              <span style={{ textTransform: "capitalize", fontSize: "12px" }}>
                {m.civilStatus ? titleize(m.civilStatus) : "—"}
              </span>
            ),
          },
          {
            key: "sectoral",
            header: "Sectoral Classification",
            width: "22%",
            render: (m: Inhabitant) => <SectorChips row={m} />,
          },
        ]}
        rows={members ?? []}
        loading={loading}
        skeletonRows={5}
        empty={loading ? "Loading household members..." : "No resident members currently registered under this household."}
        onRowClick={(m) => router.push(`/inhabitants/${m.id}`)}
      />
    </Panel>
  );
}
