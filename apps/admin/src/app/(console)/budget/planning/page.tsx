"use client";

import * as React from "react";
import { PageHead, Alert, StatGrid, StatCard, pesoAmount } from "@cbms/ui";
import { useConsole } from "../../../../components/Shell";
import { Toast } from "../../../../components/Toast";
import { PlanningToolbar } from "./components/PlanningToolbar";
import { PlanningTable, type PlannedItem } from "./components/PlanningTable";
import { AddPlanItemModal } from "./components/AddPlanItemModal";
import { EnactBudgetModal } from "./components/EnactBudgetModal";
import { useCreateBudgetSector } from "../../../../lib/budget-queries";

const INITIAL_PLANNED_ITEMS: PlannedItem[] = [];

export default function BudgetPlanningPage() {
  const { can } = useConsole();
  const mayPlan = can("finance:view") || true;

  // 1. Planning State
  const [items, setItems] = React.useState<PlannedItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("cbms.budget_planning_items");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return INITIAL_PLANNED_ITEMS;
  });

  const [isEnacted, setIsEnacted] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("cbms.budget_planning_enacted") === "true";
      } catch {}
    }
    return false;
  });

  const [search, setSearch] = React.useState("");
  const [sectorFilter, setSectorFilter] = React.useState("all");
  const [expenseClassFilter, setExpenseClassFilter] = React.useState("all");

  // Modals & Drawers
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openEnact, setOpenEnact] = React.useState(false);
  const [busyEnact, setBusyEnact] = React.useState(false);

  // Toast
  const [toast, setToast] = React.useState<{
    open: boolean;
    message: string;
    description?: string;
    tone: "success" | "danger" | "info";
  }>({
    open: false,
    message: "",
    description: "",
    tone: "success",
  });

  const saveItems = (newItems: PlannedItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem("cbms.budget_planning_items", JSON.stringify(newItems));
    } catch {}
  };

  // Calculations
  const totalAnnualBudget = 18450000;
  const statutoryFloorsTotal = 7380000; // 20% BDF (3.69M) + 5% BDRRMF (922.5k) + 10% SK (1.845M) + 5% GAD (922.5k)
  const totalPlannedAmount = items.reduce((acc, i) => acc + i.proposedAmount, 0);
  const unallocatedPlanningReserve = Math.max(0, totalAnnualBudget - totalPlannedAmount);

  // Filtering
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      if (sectorFilter !== "all" && item.sector !== sectorFilter) return false;
      if (expenseClassFilter !== "all" && item.expenseClass !== expenseClassFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.ppaCode.toLowerCase().includes(q) ||
          item.particulars.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, sectorFilter, expenseClassFilter, search]);

  const handleAddItem = (newItem: Omit<PlannedItem, "id">) => {
    const itemWithId: PlannedItem = {
      ...newItem,
      id: `plan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    const next = [...items, itemWithId];
    saveItems(next);
    setToast({
      open: true,
      message: "Planned Program Added",
      description: `Added "${newItem.title}" (${pesoAmount(newItem.proposedAmount)}) to draft budget plan.`,
      tone: "success",
    });
  };

  const handleDeleteItem = (itemToDelete: PlannedItem) => {
    const next = items.filter((i) => i.id !== itemToDelete.id);
    saveItems(next);
    setToast({
      open: true,
      message: "Planned Item Removed",
      description: `Removed "${itemToDelete.title}" from budget plan.`,
      tone: "info",
    });
  };

  // Document Export (DILG/DBM LBP Forms 1 & 2)
  const handleExportDocument = () => {
    const lines = [
      "LOCAL BUDGET PREPARATION FORM NO. 2",
      "PROGRAMMED APPROPRIATIONS BY PPA AND EXPENSE CLASS",
      "Barangay Barangka, City of Mandaluyong",
      `Fiscal Year: 2026 | Date Generated: ${new Date().toLocaleDateString()}`,
      "",
      "PPA Code,Program / Project Title,Target Sector,Expense Class,Priority,Proposed Amount (PHP)",
      ...items.map(
        (i) =>
          `"${i.ppaCode}","${i.title.replace(/"/g, '""')}","${i.sector.toUpperCase()}","${i.expenseClass}","${i.priority}",${i.proposedAmount}`,
      ),
      "",
      `TOTAL PROPOSED PROGRAMMED APPROPRIATIONS: ${totalPlannedAmount}`,
      `ANNUAL GENERAL APPROPRIATIONS CEILING: ${totalAnnualBudget}`,
      `REMAINING UNALLOCATED PLANNING BALANCE: ${unallocatedPlanningReserve}`,
      "",
      "Prepared By:,Barangay Treasurer",
      "Attested By:,Barangay Secretary",
      "Submitted By:,Punong Barangay",
      "Approved By:,Sangguniang Barangay (Committee on Appropriations)",
    ];

    const csvContent = lines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Executive-Budget-Proposal-FY2026-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setToast({
      open: true,
      message: "Executive Budget Exported",
      description: "Downloaded DILG LBP Form 2 Proposal document for Sanggunian submission.",
      tone: "success",
    });
  };

  // Enactment into Statutory Budget
  const createSectorMutation = useCreateBudgetSector();

  const handleConfirmEnact = async (ordinanceNo: string, dateEnacted: string) => {
    setBusyEnact(true);
    try {
      // Group items by sector and calculate total per sector
      const sectorMap: Record<string, { code: string; name: string; amount: number; minPct: number; icon: string }> = {
        bdf: { code: "BDF-2000", name: "20% Barangay Development Fund (BDF)", amount: 0, minPct: 20, icon: "🏗️" },
        bdrrmf: { code: "BDRRMF-5000", name: "5% Disaster Risk Reduction & Management", amount: 0, minPct: 5, icon: "🚨" },
        sk: { code: "SK-7000", name: "10% Sangguniang Kabataan (SK) Fund", amount: 0, minPct: 10, icon: "🏀" },
        gad: { code: "GAD-8000", name: "5% Gender and Development (GAD)", amount: 0, minPct: 5, icon: "⚖️" },
        senior: { code: "SCPWD-9100", name: "1% Senior Citizens & PWDs Fund", amount: 0, minPct: 1, icon: "👴" },
        general: { code: "GPS-1000", name: "General Public Services & Administration", amount: 0, minPct: 0, icon: "🏛️" },
      };

      for (const item of items) {
        if (sectorMap[item.sector]) {
          sectorMap[item.sector].amount += item.proposedAmount;
        }
      }

      // If any sector has 0 from items, ensure statutory minimums are established if planned
      for (const [secKey, sec] of Object.entries(sectorMap)) {
        if (sec.amount > 0 || items.some((i) => i.sector === secKey)) {
          const finalAmount = Math.max(sec.amount, (totalAnnualBudget * sec.minPct) / 100);
          await createSectorMutation.mutateAsync({
            budgetId: "budget-2026",
            code: sec.code,
            name: sec.name,
            category: sec.minPct > 0 ? "mandatory_statutory" : "discretionary_local",
            statutoryMinPct: sec.minPct > 0 ? sec.minPct : null,
            appropriatedCentavos: Math.round(finalAmount * 100),
            legalBasis: `Appropriation Ordinance No. ${ordinanceNo} (${dateEnacted})`,
            icon: sec.icon,
          });
        }
      }

      setIsEnacted(true);
      try {
        localStorage.setItem("cbms.budget_planning_enacted", "true");
      } catch {}

      setToast({
        open: true,
        message: "Budget Successfully Enacted!",
        description: `Enacted under Ordinance ${ordinanceNo}. Sectors have been inserted into Statutory Budget.`,
        tone: "success",
      });
    } catch (err: any) {
      setToast({
        open: true,
        message: "Enactment Failed",
        description: err?.message || "Could not push to statutory budget.",
        tone: "danger",
      });
    } finally {
      setBusyEnact(false);
    }
  };

  return (
    <>
      <PageHead
        title="Annual Budget Planning & Formulation"
        subtitle="Formulation of the Annual Barangay Executive Budget proposal under RA 7160 §318 (LBP Form 1 & 2) and Sanggunian enactment."
        breadcrumb="Financial Administration"
        parity="BBOM / BFMS"
      />

      {isEnacted && (
        <Alert tone="success">
          <strong>✓ Budget Enacted:</strong> The Annual General Appropriations Ordinance for FY 2026 has been approved by the Sanggunian and enacted into the <strong>Statutory Budget</strong>.
        </Alert>
      )}

      {/* Top 4 Planning StatCards */}
      <StatGrid>
        <StatCard
          label="Annual Budget Revenue Target"
          value={pesoAmount(totalAnnualBudget)}
          hint="Certified NTA + Local Collections"
          icon="🏦"
          tone="navy"
        />
        <StatCard
          label="Mandatory Statutory Minimums"
          value={pesoAmount(statutoryFloorsTotal)}
          hint="40% Combined Statutory Floors"
          icon="⚖️"
          tone="gold"
        />
        <StatCard
          label="Proposed Program Allocations"
          value={pesoAmount(totalPlannedAmount)}
          hint={`${items.length} proposed items in plan`}
          icon="📋"
          tone="navy"
        />
        <StatCard
          label="Unallocated Planning Reserve"
          value={pesoAmount(unallocatedPlanningReserve)}
          hint="Available for discretionary PPAs"
          icon="🛡️"
          tone="green"
        />
      </StatGrid>

      {/* Toolbar */}
      <PlanningToolbar
        search={search}
        onSearchChange={setSearch}
        sectorFilter={sectorFilter}
        onSectorFilterChange={setSectorFilter}
        expenseClassFilter={expenseClassFilter}
        onExpenseClassFilterChange={setExpenseClassFilter}
        onOpenAddModal={() => setOpenAdd(true)}
        onExportDocument={handleExportDocument}
        onOpenEnactModal={() => setOpenEnact(true)}
        totalPlannedCount={items.length}
        isEnacted={isEnacted}
      />

      {/* Planned PPAs Table */}
      <PlanningTable
        items={filteredItems}
        onDeleteItem={handleDeleteItem}
        isEnacted={isEnacted}
      />

      {/* Modals */}
      <AddPlanItemModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onAdd={handleAddItem}
      />

      <EnactBudgetModal
        open={openEnact}
        onClose={() => setOpenEnact(false)}
        plannedItems={items}
        totalPlannedAmount={totalPlannedAmount}
        totalAnnualBudget={totalAnnualBudget}
        onConfirmEnact={handleConfirmEnact}
        busy={busyEnact}
      />

      <Toast
        open={toast.open}
        message={toast.message}
        description={toast.description}
        tone={toast.tone}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}
