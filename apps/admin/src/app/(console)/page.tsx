"use client";

import * as React from "react";
import Link from "next/link";
import { useApi } from "@cbms/api-client";
import {
  Alert,
  Chip,
  DataTable,
  PageHead,
  Panel,
  StatCard,
  StatGrid,
  StatusChip,
  date,
  num,
  peso,
} from "@cbms/ui";
import { useConsole } from "../../components/Shell";
import { Async, DeadlineCell, EmptyNote } from "../../components/common";
import type {
  Bag,
  Concern,
  DisbursementBatch,
  Paged,
  SosAlert,
} from "../../lib/types";

export default function DashboardPage() {
  const { dashboard, can, user } = useConsole();

  const concerns = useApi<Paged<Concern>>(
    can("concerns:view") ? "/concerns?status=submitted&pageSize=5" : null,
  );
  const sos = useApi<Bag<SosAlert>>(can("sos:view") ? "/sos" : null);
  const batches = useApi<Bag<DisbursementBatch>>(can("wallet:view") ? "/wallet/batches" : null);

  const q = dashboard?.actionQueue;
  const forApproval = (batches.data?.items ?? []).filter((b) => b.status === "for_approval");
  const activeSos = (sos.data?.items ?? []).filter((s) => s.status !== "test");

  return (
    <>
      <PageHead
        title="Dashboard"
        subtitle={
          user?.barangay?.name
            ? `Operational picture for Barangay ${user.barangay.name}.`
            : "Operational picture for your assigned scope."
        }
        breadcrumb="Overview"
        actions={
          <Link href="/reports" className="cbms-btn">
            📊 Reports
          </Link>
        }
      />

      {!dashboard && <Alert tone="info">Loading live counters from the API…</Alert>}

      <StatGrid>
        <StatCard
          label="Inhabitants"
          value={num(dashboard?.population.inhabitants)}
          hint="Living residents on the RBI"
          icon="👥"
        />
        <StatCard
          label="Households"
          value={num(dashboard?.population.households)}
          hint="Registered household folders"
          icon="🏠"
        />
        <StatCard
          label="Senior citizens"
          value={num(dashboard?.population.seniors)}
          hint="Sectoral registry"
          icon="🧓"
          tone="gold"
        />
        <StatCard
          label="Persons with disability"
          value={num(dashboard?.population.pwd)}
          hint="Sectoral registry"
          icon="♿"
          tone="green"
        />
      </StatGrid>

      <StatGrid>
        <StatCard
          label="Certificates for approval"
          value={num(q?.certificatesForApproval)}
          hint="Awaiting the Punong Barangay"
          icon="📄"
          tone={q?.certificatesForApproval ? "red" : "navy"}
        />
        <StatCard
          label="Open concerns (311)"
          value={num(q?.openConcerns)}
          hint="RA 11032 clock is running"
          icon="📣"
          tone={q?.openConcerns ? "gold" : "navy"}
        />
        <StatCard
          label="Active SOS"
          value={num(q?.activeSosAlerts)}
          hint="Live panic alerts"
          icon="🚨"
          tone={q?.activeSosAlerts ? "red" : "navy"}
        />
        <StatCard
          label="KP near deadline"
          value={num(q?.kpCasesNearDeadline)}
          hint={`${num(q?.kpCasesBreached)} already breached (RA 7160 §410)`}
          icon="⚖️"
          tone={q?.kpCasesBreached ? "red" : "gold"}
        />
        <StatCard
          label="Batches for approval"
          value={num(q?.disbursementBatchesForApproval)}
          hint="Maker–checker pending"
          icon="💸"
          tone={q?.disbursementBatchesForApproval ? "gold" : "navy"}
        />
      </StatGrid>

      <div className="cbms-grid-2">
        <Panel title="Needs your action" padded={false}>
          <div style={{ padding: "6px 0" }}>
            <ActionRow
              href="/certificates?status=for_approval"
              icon="📄"
              label="Certificates awaiting approval"
              count={q?.certificatesForApproval ?? 0}
              show={can("issuance:view")}
            />
            <ActionRow
              href="/kp"
              icon="⚖️"
              label="KP cases inside the statutory window"
              count={q?.kpCasesNearDeadline ?? 0}
              show={can("kp:view")}
            />
            <ActionRow
              href="/concerns"
              icon="📣"
              label="Open 311 concerns"
              count={q?.openConcerns ?? 0}
              show={can("concerns:view")}
            />
            <ActionRow
              href="/sos"
              icon="🚨"
              label="Active SOS alerts"
              count={q?.activeSosAlerts ?? 0}
              show={can("sos:view")}
            />
            <ActionRow
              href="/wallet/batches"
              icon="💸"
              label="Disbursement batches for approval"
              count={q?.disbursementBatchesForApproval ?? 0}
              show={can("wallet:view")}
            />
          </div>
        </Panel>

        <Panel title="E-wallet & satisfaction">
          <div className="cbms-kv">
            <div className="cbms-kv__k">Registered resident wallets</div>
            <div className="cbms-kv__v">{num(dashboard?.wallet.registeredWallets)}</div>
            <div className="cbms-kv__k">Transactions (30 days)</div>
            <div className="cbms-kv__v">{num(dashboard?.wallet.transactions30d)}</div>
            <div className="cbms-kv__k">Volume (30 days)</div>
            <div className="cbms-kv__v">{peso(dashboard?.wallet.volume30dCentavos ?? "0")}</div>
            <div className="cbms-kv__k">CSM responses (30 days)</div>
            <div className="cbms-kv__v">{num(dashboard?.satisfaction.responses30d)}</div>
            <div className="cbms-kv__k">Average rating</div>
            <div className="cbms-kv__v">
              {(dashboard?.satisfaction.averageRating ?? 0).toFixed(2)} / 5.00
            </div>
          </div>
          <div className="adm-kpi-note">
            E-wallet and the resident self-service suite are <strong>CBMS-exclusive</strong> —
            they have no LGUSS-BIMS counterpart.
          </div>
        </Panel>
      </div>

      <div style={{ height: 16 }} />

      <Panel title="KP cases approaching the RA 7160 §410 deadline" padded={false}>
        {dashboard && dashboard.kpAtRisk.length === 0 ? (
          <EmptyNote>No case is within five days of its statutory deadline.</EmptyNote>
        ) : (
          <DataTable
            columns={[
              {
                key: "caseNo",
                header: "Case",
                render: (r) => <span className="cbms-table__primary">{r.caseNo}</span>,
              },
              { key: "stage", header: "Stage", render: (r) => <StatusChip status={r.stage} /> },
              { key: "filedAt", header: "Filed", render: (r) => date(r.filedAt) },
              {
                key: "deadline",
                header: "Deadline",
                render: (r) => (
                  <DeadlineCell
                    dueAt={r.dueAt}
                    daysRemaining={r.daysRemaining}
                    breached={r.breached}
                  />
                ),
              },
            ]}
            rows={dashboard?.kpAtRisk ?? []}
            empty="No case is within five days of its statutory deadline."
            onRowClick={(r) => {
              window.location.href = `/kp/${r.id}`;
            }}
          />
        )}
      </Panel>

      <div style={{ height: 16 }} />

      <div className="cbms-grid-2">
        {can("concerns:view") && (
          <Panel title="Newest 311 concerns" padded={false}>
            <Async loading={concerns.loading} error={concerns.error}>
              <DataTable
                columns={[
                  { key: "referenceNo", header: "Ref." },
                  { key: "category", header: "Category" },
                  {
                    key: "status",
                    header: "Status",
                    render: (r) => (
                      <span className="adm-chiprow">
                        <StatusChip status={r.status} />
                        {r.slaBreached && <Chip tone="red">SLA breached</Chip>}
                      </span>
                    ),
                  },
                  { key: "createdAt", header: "Filed", render: (r) => date(r.createdAt) },
                ]}
                rows={concerns.data?.items ?? []}
                empty="No unacknowledged concerns."
              />
            </Async>
          </Panel>
        )}

        {can("sos:view") && (
          <Panel title="Live SOS board" padded={false}>
            <Async loading={sos.loading} error={sos.error}>
              <DataTable
                columns={[
                  { key: "kind", header: "Kind", render: (r) => <StatusChip status={r.kind} /> },
                  {
                    key: "inhabitant",
                    header: "Resident",
                    render: (r) =>
                      r.inhabitant ? `${r.inhabitant.firstName} ${r.inhabitant.lastName}` : "Anonymous",
                  },
                  { key: "status", header: "Status", render: (r) => <StatusChip status={r.status} /> },
                  {
                    key: "createdAt",
                    header: "Raised",
                    render: (r) => new Date(r.createdAt).toLocaleTimeString("en-PH"),
                  },
                ]}
                rows={activeSos}
                empty="No active alerts. All quiet."
              />
            </Async>
          </Panel>
        )}
      </div>

      {can("wallet:view") && forApproval.length > 0 && (
        <>
          <div style={{ height: 16 }} />
          <Panel title="Disbursement batches waiting for a checker" padded={false}>
            <DataTable
              columns={[
                { key: "batchNo", header: "Batch" },
                { key: "title", header: "Title" },
                { key: "kind", header: "Kind", render: (r) => <StatusChip status={r.kind} /> },
                { key: "itemCount", header: "Payees", align: "right" },
                {
                  key: "totalCentavos",
                  header: "Total",
                  align: "right",
                  render: (r) => peso(r.totalCentavos),
                },
              ]}
              rows={forApproval}
              onRowClick={(r) => {
                window.location.href = `/wallet/batches/${r.id}`;
              }}
            />
          </Panel>
        </>
      )}
    </>
  );
}

function ActionRow(props: {
  href: string;
  icon: string;
  label: string;
  count: number;
  show: boolean;
}) {
  if (!props.show) return null;
  return (
    <Link
      href={props.href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 18px",
        borderBottom: "1px solid #f1f5f9",
        fontSize: 13.5,
      }}
    >
      <span style={{ fontSize: 18 }}>{props.icon}</span>
      <span style={{ flex: 1 }}>{props.label}</span>
      <Chip tone={props.count > 0 ? "red" : "gray"}>{props.count}</Chip>
    </Link>
  );
}
