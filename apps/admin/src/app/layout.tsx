import type { Metadata } from "next";
import "@cbms/ui/styles.css";
import "./admin.css";

export const metadata: Metadata = {
  title: "Barangay Console — CBMS",
  description:
    "Centralized Barangay Management System — the barangay staff console. A companion to DILG LGUSS-BIMS (MC 2025-104).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
