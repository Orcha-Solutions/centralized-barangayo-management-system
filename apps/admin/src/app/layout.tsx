import type { Metadata, Viewport } from "next";
import "@cbms/ui/styles.css";
import "./admin.css";
import { PwaRegister } from "../components/PwaRegister";

export const metadata: Metadata = {
  title: "Barangay Console — CBMS",
  description:
    "Centralized Barangay Management System — the barangay staff console. A companion to DILG LGUSS-BIMS (MC 2025-104).",
  manifest: "/manifest.json",
  applicationName: "CBMS Admin",
  appleWebApp: {
    capable: true,
    title: "CBMS Admin",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0A2463",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
