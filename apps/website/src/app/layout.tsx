import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@cbms/ui/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Barangay Public Portal — CBMS",
    template: "%s — Barangay Public Portal",
  },
  description:
    "Public barangay websites, transparency board and certificate verification. A companion to the DILG-mandated LGUSS-BIMS.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="site-skip" href="#main">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
