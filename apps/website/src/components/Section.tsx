import type { ReactNode } from "react";
import { ParityBadge } from "@cbms/ui";

/**
 * A titled section of the public barangay site.
 *
 * `parity` / `exclusive` surface the product's core claim: Group A modules
 * mirror a DILG LGUSS-BIMS sub-system, Group B are CBMS-exclusive.
 */
export function Section({
  id,
  title,
  lead,
  parity,
  exclusive,
  tint,
  aside,
  children,
}: {
  id?: string;
  title: string;
  lead?: ReactNode;
  parity?: string;
  exclusive?: boolean;
  tint?: boolean;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`site-section${tint ? " site-section--tint" : ""}`}>
      <div className="site-wrap">
        <div className="site-section__head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="site-section__title">{title}</h2>
            <div className="site-section__rule" />
          </div>
          {(parity || exclusive) && (
            <div style={{ paddingTop: 4 }}>
              <ParityBadge bims={parity} />
            </div>
          )}
          {aside}
        </div>
        {lead && <p className="site-section__lead">{lead}</p>}
        {children}
      </div>
    </section>
  );
}
