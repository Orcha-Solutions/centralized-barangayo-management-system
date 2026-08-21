import type { ReactNode } from "react";
import { Shell } from "@/components/Shell";

export default function HubLayout({ children }: { children: ReactNode }) {
  return <Shell>{children}</Shell>;
}
