"use client";

import * as React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Public site render error:", error);
  }, [error]);

  return (
    <div className="site-page">
      <main id="main" className="site-body">
        <section className="site-hero">
          <div className="site-wrap">
            <span className="site-hero__eyebrow">Something went wrong</span>
            <h1 className="site-hero__title">This page could not be displayed.</h1>
            <p className="site-hero__sub">
              An unexpected error occurred while loading this page. Nothing you did caused it, and
              no data was changed. Please try again.
            </p>
            <p style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="site-verify__btn" type="button" onClick={() => reset()}>
                Try again
              </button>
              <a className="site-nav__link site-nav__link--cta" href="/">
                Back to the barangay directory
              </a>
            </p>
            {error.digest && (
              <p style={{ marginTop: 16, fontSize: 12, color: "#b9c7e6" }}>
                Reference: {error.digest}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
