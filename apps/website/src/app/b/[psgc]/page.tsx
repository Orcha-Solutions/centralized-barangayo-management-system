import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Alert, Chip, StatusChip, date, initials, num, pesoAmount } from "@cbms/ui";
import { fetchBarangaySite } from "@/lib/api";
import { brandVars, humanize } from "@/lib/brand";
import { ProgressBar } from "@/components/ProgressBar";
import { Section } from "@/components/Section";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type { PublicBudgetLine } from "@/lib/types";

/** Always rendered on demand — the build must never call the API. */
export const dynamic = "force-dynamic";

type Params = { psgc: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { psgc } = await params;
  const res = await fetchBarangaySite(psgc);
  if (!res.ok) return { title: "Barangay" };
  const b = res.data.barangay;
  return {
    title: `Barangay ${b.name}`,
    description: `Official website of Barangay ${b.name}${
      b.city?.name ? `, ${b.city.name}` : ""
    } — announcements, fees and requirements, budget, projects, ordinances and officials.`,
  };
}

function n(v: string | number | null | undefined): number {
  const parsed = Number(v ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

const EXPENSE_CLASS_LABEL: Record<string, string> = {
  PS: "Personnel Services (PS)",
  MOOE: "Maintenance & Other Operating Expenses (MOOE)",
  CO: "Capital Outlay (CO)",
};

export default async function BarangaySitePage({ params }: { params: Promise<Params> }) {
  const { psgc } = await params;
  const res = await fetchBarangaySite(psgc);

  if (!res.ok && res.status === 404) notFound();

  if (!res.ok) {
    return (
      <div className="site-page">
        <SiteHeader />
        <main id="main" className="site-body">
          <div className="site-wrap" style={{ padding: "44px 20px" }}>
            <Alert tone="danger">
              <div>
                <strong>This barangay site is temporarily unavailable.</strong>
                <div style={{ marginTop: 4, fontSize: 12.5 }}>{res.message}</div>
              </div>
            </Alert>
            <Link className="site-nav__link site-nav__link--cta" href="/">
              ← Back to the barangay directory
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const { barangay: b, pages, posts, ordinances, officials, transparency, notice } = res.data;
  const fees = transparency?.fees ?? [];
  const projects = transparency?.projects ?? [];
  const budget = transparency?.budget ?? null;
  const theme = brandVars(b.brandPrimary, b.brandAccent);

  // Group budget lines by COA expense class for the summary strip.
  const byClass = new Map<string, number>();
  for (const line of (budget?.lines ?? []) as PublicBudgetLine[]) {
    byClass.set(line.expenseClass, (byClass.get(line.expenseClass) ?? 0) + n(line.amount));
  }

  const projectBudgetTotal = projects.reduce((sum, p) => sum + n(p.budget), 0);
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const freeServices = fees.filter((f) => n(f.fee) === 0).length;

  return (
    <div className="site-page" style={theme}>
      <SiteHeader
        sealText={initials(b.name)}
        title={`Barangay ${b.name}`}
        subtitle={b.city?.name ? `${b.city.name} · PSGC ${b.psgcCode}` : `PSGC ${b.psgcCode}`}
        homeHref={`/b/${b.psgcCode}`}
      />

      <main id="main" className="site-body">
        {/* ---------------- Hero ---------------- */}
        <section className="site-hero">
          <div className="site-wrap">
            <span className="site-hero__eyebrow">
              Official website · {b.mode === "standalone" ? "Standalone" : "LGUSS-BIMS companion"}
            </span>
            <h1 className="site-hero__title">Barangay {b.name}</h1>
            <p className="site-hero__sub">
              {b.city?.name ? `${b.city.name}, Philippines` : "Philippines"} · PSGC {b.psgcCode}
            </p>

            <div className="site-hero__meta">
              {b.addressLine && <span>📍 {b.addressLine}</span>}
              {b.contactPhone && (
                <span>
                  ☎️ <a href={`tel:${b.contactPhone.replace(/[^\d+]/g, "")}`}>{b.contactPhone}</a>
                </span>
              )}
              {b.contactEmail && (
                <span>
                  ✉️ <a href={`mailto:${b.contactEmail}`}>{b.contactEmail}</a>
                </span>
              )}
            </div>

            {b.hotline && (
              <div className="site-hotline">
                <span aria-hidden="true">🚨</span>
                <span>
                  <small>Emergency hotline</small>
                  <a href={`tel:${b.hotline.replace(/[^\d+]/g, "")}`}>{b.hotline}</a>
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ---------------- Section nav ---------------- */}
        <nav className="site-subnav" aria-label="Sections of this barangay site">
          <div className="site-subnav__inner">
            <a className="site-subnav__link" href="#news">
              Announcements
            </a>
            <a className="site-subnav__link" href="#services">
              Services &amp; requirements
            </a>
            <a className="site-subnav__link" href="#transparency">
              Transparency board
            </a>
            <a className="site-subnav__link" href="#legislation">
              Ordinances &amp; resolutions
            </a>
            <a className="site-subnav__link" href="#officials">
              Officials
            </a>
            <a className="site-subnav__link" href="#about">
              About
            </a>
            <Link className="site-subnav__link" href={`/b/${b.psgcCode}/concerns`}>
              Concerns map
            </Link>
            <Link className="site-subnav__link" href="/verify">
              Verify a certificate
            </Link>
          </div>
        </nav>

        {/* ---------------- Announcements ---------------- */}
        <Section
          id="news"
          title="Announcements & news"
          lead="Official advisories published by the barangay."
        >
          {posts.length === 0 ? (
            <div className="site-empty">No announcements have been published yet.</div>
          ) : (
            <div className="site-news">
              {posts.map((post) => (
                <article key={post.id} className="site-news__item">
                  <p className="site-news__date">{date(post.publishedAt ?? post.createdAt)}</p>
                  <h3 className="site-news__title">{post.title}</h3>
                  {post.excerpt && <p className="site-news__excerpt">{post.excerpt}</p>}
                  {post.body && post.body !== post.excerpt && (
                    <p className="site-news__body">{post.body}</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </Section>

        {/* ---------------- Services & requirements (anti-fixer) ---------------- */}
        <Section
          id="services"
          title="Services & requirements"
          parity="BCIS"
          tint
          lead={
            <>
              These are the <strong>only</strong> fees this barangay may collect, and the{" "}
              <strong>only</strong> documents it may ask you for. Publishing them is an anti-fixer
              measure: if anyone asks for a higher amount, an extra requirement or an
              &ldquo;expediting fee&rdquo;, you are being scammed — report it to the barangay hall
              or the city government. Every released certificate carries a QR and a verification
              code you can check on this site.
            </>
          }
        >
          <div className="site-figures">
            <div className="site-figure site-figure--muted">
              <div className="site-figure__label">Published services</div>
              <div className="site-figure__value">{num(fees.length)}</div>
              <div className="site-figure__hint">Certificate types currently offered</div>
            </div>
            <div className="site-figure site-figure--muted">
              <div className="site-figure__label">Free of charge</div>
              <div className="site-figure__value">{num(freeServices)}</div>
              <div className="site-figure__hint">Services with no fee at all</div>
            </div>
            <div className="site-figure site-figure--muted">
              <div className="site-figure__label">Legal basis</div>
              <div className="site-figure__value" style={{ fontSize: 19 }}>
                RA 11032
              </div>
              <div className="site-figure__hint">Ease of Doing Business &amp; Efficient Government Service Delivery Act</div>
            </div>
          </div>

          {fees.length === 0 ? (
            <div className="site-empty">This barangay has not published a fee schedule yet.</div>
          ) : (
            <div className="site-fees">
              {fees.map((f, i) => {
                const amount = n(f.fee);
                return (
                  <div className="site-fee" key={`${f.name}-${i}`}>
                    <div className="site-fee__head">
                      <h3 className="site-fee__name">{f.name}</h3>
                      <div style={{ textAlign: "right" }}>
                        <div
                          className={`site-fee__price${amount === 0 ? " site-fee__price--free" : ""}`}
                        >
                          {amount === 0 ? "FREE" : pesoAmount(amount)}
                        </div>
                        {f.validityDays ? (
                          <div className="site-fee__validity">
                            Valid for {num(f.validityDays)} days
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {f.requirements && f.requirements.length > 0 ? (
                      <>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: ".07em",
                            textTransform: "uppercase",
                            color: "var(--site-muted)",
                            marginTop: 12,
                          }}
                        >
                          What to bring
                        </div>
                        <ul className="site-fee__reqs">
                          {f.requirements.map((r, ri) => (
                            <li key={ri}>{r}</li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p className="site-fee__validity" style={{ marginTop: 10 }}>
                        No documentary requirements published.
                      </p>
                    )}

                    {f.exemptNote && (
                      <div className="site-fee__exempt">⚖️ Exemption: {f.exemptNote}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* ---------------- Transparency board ---------------- */}
        <Section
          id="transparency"
          title="Transparency board"
          parity="BFMS"
          lead={
            <>
              The enacted annual budget and the barangay development projects, published under the
              DILG Full Disclosure Policy. Amounts are as appropriated in the barangay
              appropriation ordinance.
            </>
          }
        >
          {budget ? (
            <>
              <div className="site-figures">
                <div className="site-figure">
                  <div className="site-figure__label">Annual budget · {budget.year}</div>
                  <div className="site-figure__value">{pesoAmount(n(budget.totalAmount))}</div>
                  <div className="site-figure__hint">
                    Status: {humanize(budget.status)} · {num(budget.lines?.length ?? 0)} line items
                  </div>
                </div>
                <div className="site-figure site-figure--muted">
                  <div className="site-figure__label">Sangguniang Kabataan fund</div>
                  <div className="site-figure__value">{pesoAmount(n(budget.skFundAmount))}</div>
                  <div className="site-figure__hint">
                    10% of the general fund, mandated by RA 10742
                  </div>
                </div>
                <div className="site-figure site-figure--muted">
                  <div className="site-figure__label">Development projects</div>
                  <div className="site-figure__value">{pesoAmount(projectBudgetTotal)}</div>
                  <div className="site-figure__hint">
                    {num(projects.length)} projects · {num(completedProjects)} completed
                  </div>
                </div>
              </div>

              {byClass.size > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                  {[...byClass.entries()].map(([cls, amount]) => (
                    <span className="site-tag" key={cls}>
                      {EXPENSE_CLASS_LABEL[cls] ?? cls}: {pesoAmount(amount)}
                    </span>
                  ))}
                </div>
              )}

              <div className="site-panel" style={{ marginBottom: 20 }}>
                <div className="site-panel__head">
                  Appropriation detail — {budget.year}
                  <span style={{ flex: 1 }} />
                  <Chip tone="navy">Full Disclosure Policy</Chip>
                </div>
                <div className="cbms-table-wrap">
                  <table className="cbms-table">
                    <caption className="site-visually-hidden">
                      Budget line items for {budget.year}, showing expense class, account code,
                      description and appropriated amount.
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Class</th>
                        <th scope="col">Account code</th>
                        <th scope="col">Description</th>
                        <th scope="col" style={{ textAlign: "right" }}>
                          Appropriation
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(budget.lines ?? []).length === 0 ? (
                        <tr>
                          <td className="cbms-table__empty" colSpan={4}>
                            No line items published.
                          </td>
                        </tr>
                      ) : (
                        (budget.lines ?? []).map((line) => (
                          <tr key={line.id}>
                            <td>
                              <Chip tone={line.expenseClass === "CO" ? "gold" : "gray"}>
                                {line.expenseClass}
                              </Chip>
                            </td>
                            <td className="cbms-table__muted">{line.accountCode}</td>
                            <td className="cbms-table__primary">{line.description}</td>
                            <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                              {pesoAmount(n(line.amount))}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {(budget.lines ?? []).length > 0 && (
                      <tfoot>
                        <tr>
                          <th scope="row" colSpan={3} style={{ textAlign: "right" }}>
                            Total appropriation
                          </th>
                          <td
                            style={{
                              textAlign: "right",
                              fontWeight: 800,
                              color: "var(--site-navy)",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {pesoAmount(n(budget.totalAmount))}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="site-empty" style={{ marginBottom: 20 }}>
              No enacted budget has been published yet.
            </div>
          )}

          <div className="site-section__head">
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 className="site-section__title" style={{ fontSize: 17 }}>
                Development projects
              </h3>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="site-empty">No development projects have been published yet.</div>
          ) : (
            <div className="site-projects">
              {projects.map((p, i) => (
                <div className="site-project" key={`${p.title}-${i}`}>
                  <div className="site-project__head">
                    <h4 className="site-project__title">{p.title}</h4>
                    <StatusChip status={p.status} />
                  </div>
                  <div className="site-project__meta">
                    <span>🏷️ {humanize(p.sector)}</span>
                    <span>📅 Target year {p.targetYear}</span>
                    <span>💰 {pesoAmount(n(p.budget))}</span>
                  </div>
                  <ProgressBar pct={p.progressPct} status={p.status} />
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ---------------- Legislation ---------------- */}
        <Section
          id="legislation"
          title="Ordinances & resolutions"
          parity="BORIS"
          tint
          lead="Measures enacted by the Sangguniang Barangay and published for public reference."
        >
          {ordinances.length === 0 ? (
            <div className="site-empty">No enacted measures have been published yet.</div>
          ) : (
            <div className="site-laws">
              {ordinances.map((o, i) => (
                <article className="site-law" key={`${o.kind}-${o.number}-${o.series}-${i}`}>
                  <span className="site-law__no">
                    {humanize(o.kind)} No. {o.number}, s. {o.series}
                  </span>
                  <h3 className="site-law__title">{o.title}</h3>
                  <span className="site-law__date">Enacted {date(o.enactedAt)}</span>
                </article>
              ))}
            </div>
          )}
        </Section>

        {/* ---------------- Officials ---------------- */}
        <Section
          id="officials"
          title="Barangay officials"
          lead="Elected and appointed officials serving this barangay."
        >
          {officials.length === 0 ? (
            <div className="site-empty">The roster of officials has not been published yet.</div>
          ) : (
            <div className="site-officials">
              {officials.map((o, i) => (
                <div className="site-official" key={`${o.position}-${i}`}>
                  <span className="site-official__avatar" aria-hidden="true">
                    {initials(o.name)}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div className="site-official__name">{o.name ?? "Vacant"}</div>
                    <div className="site-official__pos">{o.position}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ---------------- Static pages ---------------- */}
        <Section
          id="about"
          title="About this barangay"
          tint
          lead="Information pages maintained by the barangay. Select a heading to expand it."
        >
          {pages.length === 0 ? (
            <div className="site-empty">No information pages have been published yet.</div>
          ) : (
            <div>
              {pages.map((p, i) => (
                <details className="site-details" key={p.id} open={i === 0}>
                  <summary>{p.title}</summary>
                  <div className="site-details__body">
                    {p.body}
                    {p.updatedAt && (
                      <div className="site-details__meta">Last updated {date(p.updatedAt)}</div>
                    )}
                  </div>
                </details>
              ))}
            </div>
          )}
        </Section>

        {/* ---------------- Cross-links ---------------- */}
        <Section
          title="Also on this site"
          exclusive
          lead="Services the CBMS adds on top of the DILG LGUSS-BIMS record system."
        >
          <div className="site-cards">
            <Link className="site-card" href={`/b/${b.psgcCode}/concerns`}>
              <p className="site-card__name">📍 Community concerns map</p>
              <p className="site-card__city" style={{ marginTop: 8 }}>
                What residents are reporting, by purok and category. Counts only — no names, no
                addresses, no photos.
              </p>
              <div className="site-card__foot">
                <span>Privacy-safe</span>
                <span className="site-card__go">Open map →</span>
              </div>
            </Link>
            <Link className="site-card" href="/verify">
              <p className="site-card__name">✅ Verify a certificate</p>
              <p className="site-card__city" style={{ marginTop: 8 }}>
                Check that a barangay clearance or certificate is genuine and still valid, using
                the code printed beneath its QR.
              </p>
              <div className="site-card__foot">
                <span>No login required</span>
                <span className="site-card__go">Verify now →</span>
              </div>
            </Link>
          </div>
        </Section>
      </main>

      <SiteFooter
        notice={notice}
        barangayName={b.name}
        cityName={b.city?.name ?? null}
        addressLine={b.addressLine}
        contactPhone={b.contactPhone}
        contactEmail={b.contactEmail}
        psgc={b.psgcCode}
      />
    </div>
  );
}
