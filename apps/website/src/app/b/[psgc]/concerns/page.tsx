import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Alert, Chip, StatusChip, num } from "@cbms/ui";
import { fetchBarangaySite, fetchConcernsMap } from "@/lib/api";
import { brandVars, humanize } from "@/lib/brand";
import { Section } from "@/components/Section";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type { ConcernMapRow } from "@/lib/types";

/** Always rendered on demand — the build must never call the API. */
export const dynamic = "force-dynamic";

type Params = { psgc: string };

export const metadata: Metadata = {
  title: "Community concerns map",
  description:
    "A privacy-safe view of what residents are reporting, aggregated by purok and category. No personal data is shown.",
};

const UNSPECIFIED = "Not specified";

/** Pale navy -> gold ramp. Intensity is relative to the busiest cell. */
function heatStyle(count: number, max: number): { background: string; color: string } {
  if (count <= 0) return { background: "#f7f9fd", color: "#9aa6bd" };
  const t = max <= 1 ? 1 : count / max;
  if (t <= 0.2) return { background: "#e9f0fb", color: "#1e2f57" };
  if (t <= 0.4) return { background: "#d3e0f6", color: "#15294f" };
  if (t <= 0.6) return { background: "#fdeec2", color: "#6d4a00" };
  if (t <= 0.8) return { background: "#fbd97e", color: "#5a3c00" };
  return { background: "#f4b81f", color: "#3d2800" };
}

export default async function ConcernsMapPage({ params }: { params: Promise<Params> }) {
  const { psgc } = await params;
  const [siteRes, mapRes] = await Promise.all([fetchBarangaySite(psgc), fetchConcernsMap(psgc)]);

  if (siteRes.ok === false && siteRes.status === 404) notFound();
  if (mapRes.ok === false && mapRes.status === 404) notFound();

  const b = siteRes.ok ? siteRes.data.barangay : null;
  const theme = brandVars(b?.brandPrimary, b?.brandAccent);
  const rows: ConcernMapRow[] = mapRes.ok ? (mapRes.data.items ?? []) : [];

  // Build the purok x category matrix.
  const puroks: string[] = [];
  const categories: string[] = [];
  const cells = new Map<string, number>();
  const byStatus = new Map<string, number>();
  let total = 0;

  for (const r of rows) {
    const purok = r.purok?.trim() || UNSPECIFIED;
    const category = r.category?.trim() || "other";
    const count = Number(r.count) || 0;

    if (!puroks.includes(purok)) puroks.push(purok);
    if (!categories.includes(category)) categories.push(category);

    cells.set(`${purok}|${category}`, (cells.get(`${purok}|${category}`) ?? 0) + count);
    byStatus.set(r.status, (byStatus.get(r.status) ?? 0) + count);
    total += count;
  }

  // Natural sort so "Purok 10" follows "Purok 9"; UNSPECIFIED always last.
  const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
  puroks.sort((a, z) => {
    if (a === UNSPECIFIED) return 1;
    if (z === UNSPECIFIED) return -1;
    return collator.compare(a, z);
  });
  categories.sort((a, z) => collator.compare(a, z));

  const colTotals = new Map<string, number>();
  const rowTotals = new Map<string, number>();
  let maxCell = 0;
  for (const p of puroks) {
    for (const c of categories) {
      const v = cells.get(`${p}|${c}`) ?? 0;
      if (v > maxCell) maxCell = v;
      colTotals.set(c, (colTotals.get(c) ?? 0) + v);
      rowTotals.set(p, (rowTotals.get(p) ?? 0) + v);
    }
  }

  const busiestPurok = [...rowTotals.entries()].sort((a, z) => z[1] - a[1])[0];
  const busiestCategory = [...colTotals.entries()].sort((a, z) => z[1] - a[1])[0];
  const resolved = byStatus.get("resolved") ?? 0;
  const resolvedPct = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div className="site-page" style={theme}>
      <SiteHeader
        sealText={b?.name ?? "CBMS"}
        title={b ? `Barangay ${b.name}` : "Barangay Public Portal"}
        subtitle={b?.city?.name ? `${b.city.name} · PSGC ${psgc}` : `PSGC ${psgc}`}
        homeHref={`/b/${psgc}`}
      />

      <main id="main" className="site-body">
        <section className="site-hero" style={{ padding: "34px 0 30px" }}>
          <div className="site-wrap">
            <span className="site-hero__eyebrow">Community concerns · 311</span>
            <h1 className="site-hero__title" style={{ fontSize: 31 }}>
              What residents are reporting
            </h1>
            <p className="site-hero__sub">
              Every concern reported to {b ? `Barangay ${b.name}` : "this barangay"}, aggregated by
              purok and category. This page shows <strong>counts only</strong>.
            </p>
            <p style={{ marginTop: 18 }}>
              <Link className="site-nav__link site-nav__link--cta" href={`/b/${psgc}`}>
                ← Back to the barangay site
              </Link>
            </p>
          </div>
        </section>

        <Section
          title="Privacy-safe concern density"
          exclusive
          lead="Darker gold means more reports in that purok for that category. Use it to see where the barangay is being asked to act most often."
        >
          <div className="site-privacy" style={{ marginBottom: 20 }}>
            <span className="site-privacy__icon" aria-hidden="true">
              🔒
            </span>
            <div>
              <strong>No personal data is shown on this page.</strong> These figures are aggregate
              counts produced by the API itself — it never sends names, addresses, contact numbers,
              exact coordinates, photographs or the text of any report to this public site. A cell
              shows only how many reports fall into a purok and category. Reports are the property
              of the residents who filed them and are processed under the Data Privacy Act of 2012
              (RA 10173).
            </div>
          </div>

          {!mapRes.ok ? (
            <Alert tone="danger">
              <div>
                <strong>The concerns map is temporarily unavailable.</strong>
                <div style={{ marginTop: 4, fontSize: 12.5 }}>{mapRes.message}</div>
              </div>
            </Alert>
          ) : total === 0 ? (
            <div className="site-empty">
              No concerns have been reported for this barangay yet.
            </div>
          ) : (
            <>
              <div className="site-figures">
                <div className="site-figure">
                  <div className="site-figure__label">Total reports</div>
                  <div className="site-figure__value">{num(total)}</div>
                  <div className="site-figure__hint">
                    Across {num(puroks.length)} puroks and {num(categories.length)} categories
                  </div>
                </div>
                <div className="site-figure site-figure--muted">
                  <div className="site-figure__label">Most reported category</div>
                  <div className="site-figure__value" style={{ fontSize: 21 }}>
                    {busiestCategory ? humanize(busiestCategory[0]) : "—"}
                  </div>
                  <div className="site-figure__hint">
                    {busiestCategory ? `${num(busiestCategory[1])} reports` : "—"}
                  </div>
                </div>
                <div className="site-figure site-figure--muted">
                  <div className="site-figure__label">Busiest purok</div>
                  <div className="site-figure__value" style={{ fontSize: 21 }}>
                    {busiestPurok ? busiestPurok[0] : "—"}
                  </div>
                  <div className="site-figure__hint">
                    {busiestPurok ? `${num(busiestPurok[1])} reports` : "—"}
                  </div>
                </div>
                <div className="site-figure site-figure--muted">
                  <div className="site-figure__label">Marked resolved</div>
                  <div className="site-figure__value">{resolvedPct}%</div>
                  <div className="site-figure__hint">
                    {num(resolved)} of {num(total)} reports closed out
                  </div>
                </div>
              </div>

              <div className="site-panel" style={{ marginBottom: 18 }}>
                <div className="site-panel__head">
                  Reports by purok and category
                  <span style={{ flex: 1 }} />
                  <Chip tone="navy">Aggregate counts only</Chip>
                </div>
                <div className="site-panel__body">
                  <div className="site-heat-wrap">
                    <table className="site-heat">
                      <caption className="site-visually-hidden">
                        Heat map of reported community concerns. Rows are puroks, columns are
                        concern categories, and each cell is the number of reports.
                      </caption>
                      <thead>
                        <tr>
                          <th scope="col" style={{ textAlign: "left" }}>
                            Purok
                          </th>
                          {categories.map((c) => (
                            <th scope="col" key={c}>
                              {humanize(c)}
                            </th>
                          ))}
                          <th scope="col">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {puroks.map((p) => (
                          <tr key={p}>
                            <th scope="row">{p}</th>
                            {categories.map((c) => {
                              const v = cells.get(`${p}|${c}`) ?? 0;
                              const style = heatStyle(v, maxCell);
                              return (
                                <td
                                  key={c}
                                  style={style}
                                  title={`${p} · ${humanize(c)}: ${v} ${
                                    v === 1 ? "report" : "reports"
                                  }`}
                                >
                                  {v === 0 ? "·" : num(v)}
                                </td>
                              );
                            })}
                            <td className="is-total">{num(rowTotals.get(p) ?? 0)}</td>
                          </tr>
                        ))}
                        <tr className="is-total">
                          <th scope="row">All puroks</th>
                          {categories.map((c) => (
                            <td className="is-total" key={c}>
                              {num(colTotals.get(c) ?? 0)}
                            </td>
                          ))}
                          <td className="is-total">{num(total)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="site-heat-legend">
                    <span>Fewer reports</span>
                    <span
                      className="site-heat-legend__swatch"
                      style={{ background: "#f7f9fd" }}
                      aria-hidden="true"
                    />
                    <span
                      className="site-heat-legend__swatch"
                      style={{ background: "#e9f0fb" }}
                      aria-hidden="true"
                    />
                    <span
                      className="site-heat-legend__swatch"
                      style={{ background: "#d3e0f6" }}
                      aria-hidden="true"
                    />
                    <span
                      className="site-heat-legend__swatch"
                      style={{ background: "#fdeec2" }}
                      aria-hidden="true"
                    />
                    <span
                      className="site-heat-legend__swatch"
                      style={{ background: "#fbd97e" }}
                      aria-hidden="true"
                    />
                    <span
                      className="site-heat-legend__swatch"
                      style={{ background: "#f4b81f" }}
                      aria-hidden="true"
                    />
                    <span>
                      More reports (peak: {num(maxCell)} in one purok &amp; category)
                    </span>
                  </div>
                </div>
              </div>

              <div className="site-panel">
                <div className="site-panel__head">Handling status of all reports</div>
                <div className="site-panel__body">
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {[...byStatus.entries()]
                      .sort((a, z) => z[1] - a[1])
                      .map(([status, count]) => (
                        <span
                          key={status}
                          style={{ display: "inline-flex", alignItems: "center", gap: 7 }}
                        >
                          <StatusChip status={status} />
                          <strong style={{ fontSize: 13.5, color: "var(--site-navy)" }}>
                            {num(count)}
                          </strong>
                        </span>
                      ))}
                  </div>
                  <p style={{ fontSize: 12.5, color: "var(--site-muted)", margin: "14px 0 0" }}>
                    Barangay concerns are subject to the response deadlines in the Ease of Doing
                    Business Act (RA 11032). Residents can file and track their own reports in the
                    CBMS resident app.
                  </p>
                </div>
              </div>
            </>
          )}
        </Section>
      </main>

      <SiteFooter
        notice={siteRes.ok ? siteRes.data.notice : null}
        barangayName={b?.name ?? null}
        cityName={b?.city?.name ?? null}
        addressLine={b?.addressLine ?? null}
        contactPhone={b?.contactPhone ?? null}
        contactEmail={b?.contactEmail ?? null}
        psgc={psgc}
      />
    </div>
  );
}
