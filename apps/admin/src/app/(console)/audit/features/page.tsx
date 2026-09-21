"use client";

import * as React from "react";
import Link from "next/link";
import {
  Alert,
  Button,
  Chip,
  PageHead,
  Panel,
  StatCard,
  StatGrid,
  num,
  relative,
} from "@cbms/ui";
import { ActionResult } from "../../../../components/common";
import { useConsole } from "../../../../components/Shell";
import {
  DASHBOARD_WIDGETS,
  useFeatureToggleStore,
} from "../../../../store/featureToggleStore";
import { FeatureToggleSwitch } from "../../../../components/FeatureToggleSwitch";

export default function DashboardFeatureTogglesPage() {
  const { user: currentUser } = useConsole();
  const isItOrAdmin =
    currentUser?.roles?.some(
      (r) => r === "IT_OFFICER" || r === "SYSTEM_ADMIN" || r === "LGU_ADMIN"
    ) ||
    currentUser?.email?.toLowerCase().includes("it") ||
    false;

  const [widgetCategoryFilter, setWidgetCategoryFilter] = React.useState<string>("all");
  const [widgetSearch, setWidgetSearch] = React.useState("");
  const [actionResult, setActionResult] = React.useState<{ ok: boolean; message: string } | null>(null);

  const {
    widgetVisibility,
    toggleWidget,
    enableAllWidgets,
    disableAllWidgets,
    resetToDefaults,
    isWidgetVisible,
    lastUpdated,
    lastUpdatedBy,
  } = useFeatureToggleStore();

  const enabledWidgetCount = DASHBOARD_WIDGETS.filter((w) => isWidgetVisible(w.id)).length;
  const totalWidgetCount = DASHBOARD_WIDGETS.length;

  const filteredWidgets = DASHBOARD_WIDGETS.filter((w) => {
    if (widgetCategoryFilter !== "all" && w.category !== widgetCategoryFilter) return false;
    if (!widgetSearch.trim()) return true;
    const needle = widgetSearch.trim().toLowerCase();
    return (
      w.name.toLowerCase().includes(needle) ||
      w.description.toLowerCase().includes(needle) ||
      w.categoryLabel.toLowerCase().includes(needle)
    );
  });

  return (
    <>
      <PageHead
        title="Dashboard UI Feature Toggles"
        subtitle="IT Role Feature Controls: Turn on or off the visibility of specific dashboard widgets across the console. Disabling a widget removes it from the operational dashboard for all functionaries."
        breadcrumb="Application Management"
      />

      <ActionResult
        error={actionResult && !actionResult.ok ? actionResult.message : undefined}
        success={actionResult && actionResult.ok ? actionResult.message : undefined}
      />

      <StatGrid>
        <StatCard
          label="Total Registered Widgets"
          value={num(totalWidgetCount)}
          hint="Modular dashboard components"
          icon="🎛️"
        />
        <StatCard
          label="Visible on Dashboard"
          value={num(enabledWidgetCount)}
          hint="Active for console users"
          icon="🟢"
          tone="green"
        />
        <StatCard
          label="Hidden by IT Policy"
          value={num(totalWidgetCount - enabledWidgetCount)}
          hint="Concealed from console view"
          icon="⚪"
          tone="navy"
        />
        <StatCard
          label="Policy Configuration"
          value={lastUpdated ? relative(lastUpdated) : "Active"}
          hint={lastUpdatedBy ? `Last configured by ${lastUpdatedBy}` : "System defaults applied"}
          icon="🛡️"
          tone={enabledWidgetCount < totalWidgetCount ? "gold" : "navy"}
        />
      </StatGrid>

      <Panel title="Dashboard Widget Visibility & Feature Toggle Matrix">
        <p className="cbms-page-sub" style={{ marginBottom: "1rem" }}>
          Simple on/off switches to configure which widgets and operational panels appear on the console dashboard for barangay functionaries (Punong Barangay, Secretary, Treasurer, Tanod, etc.).
        </p>

        {!isItOrAdmin && (
          <div style={{ marginBottom: "1rem" }}>
            <Alert tone="warn">
              You are viewing feature toggles in read-only mode. Only <strong>IT Officers</strong> and <strong>Administrators</strong> can change global widget visibility.
            </Alert>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "1.25rem",
            padding: "0.75rem",
            backgroundColor: "var(--color-bg-subtle, #f8fafc)",
            borderRadius: "0.5rem",
            border: "1px solid var(--color-border, #e2e8f0)",
          }}
        >
          <input
            className="cbms-input"
            placeholder="Search widgets by name or description…"
            value={widgetSearch}
            onChange={(e) => setWidgetSearch(e.target.value)}
            style={{ maxWidth: 280, fontSize: "0.85rem" }}
          />

          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
              Filter:
            </span>
            {(["all", "demographics", "action_queue", "services", "finance", "justice", "safety"] as const).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setWidgetCategoryFilter(cat)}
                  style={{
                    padding: "3px 9px",
                    borderRadius: "9999px",
                    fontSize: "0.74rem",
                    fontWeight: 600,
                    border: widgetCategoryFilter === cat ? "1px solid #2563eb" : "1px solid #cbd5e1",
                    backgroundColor: widgetCategoryFilter === cat ? "#eff6ff" : "#ffffff",
                    color: widgetCategoryFilter === cat ? "#1d4ed8" : "#475569",
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {cat === "all" ? "All Categories" : cat.replace("_", " ")}
                </button>
              )
            )}
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Button
              size="sm"
              variant="secondary"
              disabled={!isItOrAdmin}
              onClick={() => {
                enableAllWidgets(currentUser?.fullName);
                setActionResult({ ok: true, message: "All dashboard widgets have been enabled." });
              }}
              title="Make all widgets visible"
            >
              ✓ Enable All
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={!isItOrAdmin}
              onClick={() => {
                disableAllWidgets(currentUser?.fullName);
                setActionResult({ ok: true, message: "All dashboard widgets have been hidden." });
              }}
              title="Conceal all widgets"
            >
              ✕ Disable All
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={!isItOrAdmin}
              onClick={() => {
                resetToDefaults(currentUser?.fullName);
                setActionResult({ ok: true, message: "Dashboard widgets reset to default settings." });
              }}
              title="Reset to default visibility"
            >
              🔄 Reset Defaults
            </Button>
            <Link href="/dashboard" className="cbms-btn cbms-btn--sm cbms-btn--primary">
              ↗ Live Dashboard
            </Link>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filteredWidgets.map((w) => {
            const visible = isWidgetVisible(w.id);
            return (
              <div
                key={w.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1.25rem",
                  padding: "0.9rem 1.15rem",
                  backgroundColor: visible ? "#ffffff" : "#f8fafc",
                  borderRadius: "0.5rem",
                  border: visible ? "1px solid #cbd5e1" : "1px dashed #94a3b8",
                  boxShadow: visible ? "0 1px 2px rgba(0,0,0,0.03)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem", flex: 1 }}>
                  <div
                    style={{
                      fontSize: "1.6rem",
                      lineHeight: 1,
                      padding: "0.45rem",
                      backgroundColor: visible ? "#eff6ff" : "#f1f5f9",
                      borderRadius: "0.5rem",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {w.icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.95rem", color: visible ? "#0f172a" : "#64748b" }}>
                        {w.name}
                      </span>
                      <Chip tone={visible ? "navy" : "gray"}>{w.categoryLabel}</Chip>
                      <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontFamily: "monospace" }}>
                        {w.id}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.82rem", color: "#475569", lineHeight: 1.5 }}>
                      {w.description}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
                  <FeatureToggleSwitch
                    id={`toggle-${w.id}`}
                    checked={visible}
                    disabled={!isItOrAdmin}
                    onChange={(next) => {
                      toggleWidget(w.id, currentUser?.fullName);
                      setActionResult({
                        ok: true,
                        message: `Successfully updated visibility of '${w.name}' to ${next ? "VISIBLE" : "HIDDEN"}.`,
                      });
                    }}
                    size="md"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: "1.25rem",
            padding: "0.75rem 1rem",
            backgroundColor: "#eff6ff",
            borderRadius: "0.375rem",
            border: "1px solid #bfdbfe",
            fontSize: "0.8rem",
            color: "#1e40af",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span>💡</span>
          <span>
            <strong>System Note:</strong> Changes made here take effect immediately in the dashboard across all active browser sessions without requiring a server reboot.
          </span>
        </div>
      </Panel>
    </>
  );
}
