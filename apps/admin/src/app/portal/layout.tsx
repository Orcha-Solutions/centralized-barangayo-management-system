import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./portal.css";

export const metadata: Metadata = {
  title: {
    default: "Barangay Public Portal — CBMS",
    template: "%s — Barangay Public Portal",
  },
  description:
    "Public barangay websites, transparency board and certificate verification. A companion to the DILG-mandated LGUSS-BIMS.",
};

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site-page" style={{ minHeight: "100vh", background: "var(--site-bg, #f4f7fc)" }}>
      <a className="site-skip" href="#main">
        Skip to main content
      </a>
      {children}
    </div>
  );
}
