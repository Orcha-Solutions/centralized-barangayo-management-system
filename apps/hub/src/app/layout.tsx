import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@cbms/ui/styles.css";

export const metadata: Metadata = {
  title: "CBMS — LGU / DILG Hub",
  description:
    "City-wide oversight of the Centralized Barangay Management System — a companion to the DILG LGUSS-BIMS.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
