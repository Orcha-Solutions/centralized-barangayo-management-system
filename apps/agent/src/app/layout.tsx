import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@cbms/ui/styles.css";
import "./agent.css";
import { AgentShell } from "../components/AgentShell";

export const metadata: Metadata = {
  title: "CBMS Agent — Cash-in / Cash-out",
  description:
    "Cash-out, float and transaction terminal for CBMS e-wallet agents and sari-sari merchants.",
  manifest: "/manifest.json",
  applicationName: "CBMS Agent",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "CBMS Agent" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0A2463",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AgentShell>{children}</AgentShell>
      </body>
    </html>
  );
}
