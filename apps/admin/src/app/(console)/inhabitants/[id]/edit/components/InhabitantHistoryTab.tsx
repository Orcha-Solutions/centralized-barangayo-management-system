"use client";

import * as React from "react";
import { DataTable, Panel, StatusChip, date, peso } from "@cbms/ui";
import { Async } from "../../../../../../components/common";

export interface TimelineTransaction {
  id: string;
  type: string;
  description: string;
  amount: number;
  status: string;
  date: string;
}

interface InhabitantHistoryTabProps {
  loading: boolean;
  error?: any;
  transactions: TimelineTransaction[];
}

export function InhabitantHistoryTab({
  loading,
  error,
  transactions,
}: InhabitantHistoryTabProps) {
  return (
    <div style={{ marginTop: "1rem" }}>
      <Panel title="Citizen Transaction Ledger">
        <Async loading={loading} error={error}>
          <DataTable
            columns={[
              {
                key: "date",
                header: "Date/Time",
                render: (r: TimelineTransaction) => (
                  <>
                    <div className="cbms-table__primary">{date(r.date)}</div>
                    <div className="cbms-table__muted">
                      {new Date(r.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </>
                ),
              },
              {
                key: "description",
                header: "Transaction Description",
                render: (r: TimelineTransaction) => (
                  <>
                    <div className="cbms-table__primary">{r.description}</div>
                    <div className="cbms-table__muted">Reference: {r.id}</div>
                  </>
                ),
              },
              {
                key: "amount",
                header: "Amount (PHP)",
                align: "right",
                render: (r: TimelineTransaction) =>
                  r.amount === 0 ? "Free" : peso(r.amount),
              },
              {
                key: "status",
                header: "Status",
                render: (r: TimelineTransaction) => <StatusChip status={r.status} />,
              },
            ]}
            rows={transactions}
            empty="No transactions on file for this inhabitant."
          />
        </Async>
      </Panel>
    </div>
  );
}
