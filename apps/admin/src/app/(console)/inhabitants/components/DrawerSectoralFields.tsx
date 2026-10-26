"use client";

import * as React from "react";
import type { InhabitantFormState } from "../types";

interface DrawerSectoralFieldsProps {
  form: InhabitantFormState;
  setForm: React.Dispatch<React.SetStateAction<InhabitantFormState>>;
  disabled?: boolean;
}

export function DrawerSectoralFields({
  form,
  setForm,
  disabled,
}: DrawerSectoralFieldsProps) {
  return (
    <div
      style={{
        borderTop: "1px solid var(--color-border, #e2e8f0)",
        paddingTop: "1rem",
      }}
    >
      <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", fontWeight: "bold" }}>
        Sectoral Classifications
      </h4>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.85rem",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={form.isSenior}
            disabled={disabled}
            onChange={(e) => setForm((prev) => ({ ...prev, isSenior: e.target.checked }))}
          />
          Senior Citizen
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.85rem",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={form.isPwd}
            disabled={disabled}
            onChange={(e) => setForm((prev) => ({ ...prev, isPwd: e.target.checked }))}
          />
          PWD
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.85rem",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={form.isSoloParent}
            disabled={disabled}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, isSoloParent: e.target.checked }))
            }
          />
          Solo Parent
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.85rem",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={form.is4Ps}
            disabled={disabled}
            onChange={(e) => setForm((prev) => ({ ...prev, is4Ps: e.target.checked }))}
          />
          4Ps Beneficiary
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.85rem",
            cursor: disabled ? "not-allowed" : "pointer",
            gridColumn: "span 2",
          }}
        >
          <input
            type="checkbox"
            checked={form.isDeceased}
            disabled={disabled}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, isDeceased: e.target.checked }))
            }
          />
          Deceased
        </label>
      </div>
    </div>
  );
}
