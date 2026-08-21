import "@cbms/ui/styles.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "CBMS Resident",
  description:
    "Barangay services for residents — certificates, concerns, SOS, e-wallet and participatory budgeting. A companion to the DILG LGUSS-BIMS.",
  manifest: "/manifest.json",
  applicationName: "CBMS Resident",
  appleWebApp: {
    capable: true,
    title: "CBMS Resident",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0A2463",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
