"use client";

import * as React from "react";
import { StatCard, StatGrid, num } from "@cbms/ui";
import { useInhabitantStatsQuery } from "../../../../lib/inhabitants-queries";

interface InhabitantsStatsProps {
  totalCount?: number;
}

export function InhabitantsStats({ totalCount }: InhabitantsStatsProps) {
  const { data: stats, isLoading } = useInhabitantStatsQuery();

  const total = stats?.totalInhabitants ?? totalCount ?? 0;
  const seniors = stats?.totalSeniors ?? 0;
  const pwd = stats?.totalPwd ?? 0;
  const fourPs = stats?.total4Ps ?? 0;

  return (
    <div id="tour-inhabitants-stats">
      <StatGrid>
        <StatCard
          label="Total inhabitants"
          value={isLoading && !total ? "…" : num(total)}
          icon="👥"
        />
        <StatCard
          label="Senior citizens"
          value={isLoading && !seniors ? "…" : num(seniors)}
          icon="🧓"
          tone="green"
        />
        <StatCard
          label="PWD"
          value={isLoading && !pwd ? "…" : num(pwd)}
          icon="♿"
          tone="navy"
        />
        <StatCard
          label="4Ps beneficiaries"
          value={isLoading && !fourPs ? "…" : num(fourPs)}
          icon="🤝"
          tone="gold"
        />
      </StatGrid>
    </div>
  );
}
