"use client";

import * as React from "react";
import Link from "next/link";
import { initials } from "@cbms/ui";
import type { PublicBarangay } from "../data";

export function BarangayDirectory({ items }: { items: PublicBarangay[] }) {
  const [q, setQ] = React.useState("");

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(
      (b) =>
        b.name.toLowerCase().includes(needle) ||
        b.psgcCode.toLowerCase().includes(needle) ||
        b.city.name.toLowerCase().includes(needle),
    );
  }, [items, q]);

  return (
    <div>
      <div style={{ marginBottom: 18, maxWidth: 420 }}>
        <label className="site-visually-hidden" htmlFor="brgy-filter">
          Search barangays by name, city or PSGC code
        </label>
        <input
          id="brgy-filter"
          className="cbms-input cbms-input--search"
          style={{ width: "100%", height: 42 }}
          placeholder="Search by barangay, city or PSGC code…"
          value={q}
          autoComplete="off"
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <p
        aria-live="polite"
        style={{ fontSize: 12.5, color: "var(--site-muted)", margin: "0 0 14px" }}
      >
        Showing <strong>{filtered.length}</strong> of {items.length}{" "}
        {items.length === 1 ? "barangay" : "barangays"}
      </p>

      {filtered.length === 0 ? (
        <div className="site-empty">
          No barangay matches “{q}”. Try a different name, city or PSGC code.
        </div>
      ) : (
        <div className="site-cards">
          {filtered.map((b) => (
            <Link key={b.id} className="site-card" href={`/portal/b/${b.psgcCode}`}>
              <div className="site-card__top">
                <span
                  className="site-seal"
                  aria-hidden="true"
                  style={{
                    background: b.brandPrimary || "#0A2463",
                    borderColor: b.brandAccent || "#FDB913",
                  }}
                >
                  {initials(b.name)}
                </span>
                <div style={{ minWidth: 0 }}>
                  <p className="site-card__name">Barangay {b.name}</p>
                  <p className="site-card__city">{b.city.name}</p>
                </div>
              </div>
              <div className="site-card__foot">
                <span>PSGC {b.psgcCode}</span>
                <span className="site-card__go">Open portal →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
