import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DashboardWidgetConfig {
  id: string;
  name: string;
  description: string;
  category: "demographics" | "action_queue" | "justice" | "finance" | "safety" | "services";
  categoryLabel: string;
  defaultVisible: boolean;
  icon: string;
}

export const DASHBOARD_WIDGETS: DashboardWidgetConfig[] = [
  {
    id: "widget_population_stats",
    name: "Demographic Stat Cards",
    description: "Overview stat cards showing total living inhabitants, registered households, senior citizens, and PWD count from the master RBI.",
    category: "demographics",
    categoryLabel: "Demographics",
    defaultVisible: true,
    icon: "👥",
  },
  {
    id: "widget_action_queue_stats",
    name: "Action Queue Metric Cards",
    description: "Urgent counter cards highlighting certificates awaiting approval, open 311 complaints, active SOS alerts, KP deadlines, and batch releases.",
    category: "action_queue",
    categoryLabel: "Action Queue",
    defaultVisible: true,
    icon: "⚡",
  },
  {
    id: "widget_needs_action",
    name: "Needs Your Action Panel",
    description: "Actionable direct-routing list of pending clearance approvals, KP statutory windows, open 311 concerns, live SOS, and disbursement rolls.",
    category: "services",
    categoryLabel: "Services",
    defaultVisible: true,
    icon: "📋",
  },
  {
    id: "widget_wallet_satisfaction",
    name: "E-Wallet & Citizen Satisfaction",
    description: "Resident e-wallet metrics, 30-day transaction counts and volume, alongside Client Satisfaction Measurement (CSM) rating scores.",
    category: "finance",
    categoryLabel: "Finance",
    defaultVisible: true,
    icon: "💳",
  },
  {
    id: "widget_kp_deadline",
    name: "KP Cases Approaching Deadline",
    description: "Automated tracking table for Katarungang Pambarangay mediation cases approaching or breaching the RA 7160 §410 15-day limit.",
    category: "justice",
    categoryLabel: "Justice & Peace",
    defaultVisible: true,
    icon: "⚖️",
  },
  {
    id: "widget_recent_concerns",
    name: "Newest 311 Citizen Concerns",
    description: "Live citizen issue reporting stream with category classification, filing timestamp, and RA 11032 SLA breach indicator.",
    category: "services",
    categoryLabel: "Services",
    defaultVisible: true,
    icon: "📣",
  },
  {
    id: "widget_live_sos",
    name: "Live Emergency SOS Board",
    description: "Real-time panic dispatch alert board displaying inhabitant identity, medical/PWD tags, and distress alert status.",
    category: "safety",
    categoryLabel: "Public Safety",
    defaultVisible: true,
    icon: "🚨",
  },
  {
    id: "widget_disbursement_batches",
    name: "Disbursement Batches for Approval",
    description: "COA maker-checker authorization table showing disbursement batches prepared by the Treasurer awaiting Punong Barangay approval.",
    category: "finance",
    categoryLabel: "Finance",
    defaultVisible: true,
    icon: "💸",
  },
];

const DEFAULT_VISIBILITY: Record<string, boolean> = DASHBOARD_WIDGETS.reduce(
  (acc, widget) => {
    acc[widget.id] = widget.defaultVisible;
    return acc;
  },
  {} as Record<string, boolean>
);

export interface FeatureToggleState {
  widgetVisibility: Record<string, boolean>;
  lastUpdated: string | null;
  lastUpdatedBy: string | null;

  // Actions
  toggleWidget: (id: string, actorName?: string) => void;
  setWidgetVisibility: (id: string, visible: boolean, actorName?: string) => void;
  enableAllWidgets: (actorName?: string) => void;
  disableAllWidgets: (actorName?: string) => void;
  resetToDefaults: (actorName?: string) => void;
  isWidgetVisible: (id: string) => boolean;
}

export const useFeatureToggleStore = create<FeatureToggleState>()(
  persist(
    (set, get) => ({
      widgetVisibility: DEFAULT_VISIBILITY,
      lastUpdated: null,
      lastUpdatedBy: null,

      toggleWidget: (id: string, actorName?: string) => {
        const current = get().widgetVisibility[id] ?? true;
        const next = !current;
        set((state) => ({
          widgetVisibility: {
            ...state.widgetVisibility,
            [id]: next,
          },
          lastUpdated: new Date().toISOString(),
          lastUpdatedBy: actorName ?? "IT Officer",
        }));
      },

      setWidgetVisibility: (id: string, visible: boolean, actorName?: string) => {
        set((state) => ({
          widgetVisibility: {
            ...state.widgetVisibility,
            [id]: visible,
          },
          lastUpdated: new Date().toISOString(),
          lastUpdatedBy: actorName ?? "IT Officer",
        }));
      },

      enableAllWidgets: (actorName?: string) => {
        const allEnabled = DASHBOARD_WIDGETS.reduce(
          (acc, w) => {
            acc[w.id] = true;
            return acc;
          },
          {} as Record<string, boolean>
        );
        set({
          widgetVisibility: allEnabled,
          lastUpdated: new Date().toISOString(),
          lastUpdatedBy: actorName ?? "IT Officer",
        });
      },

      disableAllWidgets: (actorName?: string) => {
        const allDisabled = DASHBOARD_WIDGETS.reduce(
          (acc, w) => {
            acc[w.id] = false;
            return acc;
          },
          {} as Record<string, boolean>
        );
        set({
          widgetVisibility: allDisabled,
          lastUpdated: new Date().toISOString(),
          lastUpdatedBy: actorName ?? "IT Officer",
        });
      },

      resetToDefaults: (actorName?: string) => {
        set({
          widgetVisibility: DEFAULT_VISIBILITY,
          lastUpdated: new Date().toISOString(),
          lastUpdatedBy: actorName ?? "IT Officer",
        });
      },

      isWidgetVisible: (id: string) => {
        const visibility = get().widgetVisibility;
        return visibility[id] !== undefined ? visibility[id] : true;
      },
    }),
    {
      name: "cbms-feature-toggles",
    }
  )
);
