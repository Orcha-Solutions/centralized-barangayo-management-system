import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DevelopmentPlan, DevProject } from "../lib/types";

export interface DevPlanState {
  plans: DevelopmentPlan[];
  projects: DevProject[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchPlans: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  addProject: (project: Omit<DevProject, "id" | "progressPct" | "status">) => Promise<DevProject>;
  updateProject: (id: string, updates: Partial<DevProject>) => Promise<void>;
  updateProjectProgress: (id: string, progressPct: number) => Promise<void>;
  updateProjectStatus: (id: string, status: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  toggleLockProject: (id: string) => Promise<void>;
  toggleLockPlan: (id: string) => Promise<void>;
  addPlan: (plan: Omit<DevelopmentPlan, "id" | "projects">) => Promise<DevelopmentPlan>;
}

const INITIAL_PLANS: DevelopmentPlan[] = [
  {
    id: "plan-bdp-2026",
    title: "Barangay Executive-Legislative Development Plan (BDP 2026–2028)",
    vision: "A resilient, digitally-empowered, and socially inclusive Barangay Barangka with sustainable green infrastructure and poverty-free households.",
    startYear: 2026,
    endYear: 2028,
    status: "active",
    isLocked: false,
  },
  {
    id: "plan-aip-2026",
    title: "Annual Investment Program (AIP FY 2026)",
    vision: "Targeted capital outlay, DRRM 5% fund utilization, and priority basic services.",
    startYear: 2026,
    endYear: 2026,
    status: "active",
    isLocked: false,
  },
];

const INITIAL_PROJECTS: DevProject[] = [
  {
    id: "proj-001",
    planId: "plan-bdp-2026",
    title: "Solar-Powered Streetlighting & Smart CCTV Grid (Phase 2)",
    sector: "infrastructure",
    budget: 1250000,
    fundingSource: "NTA",
    status: "ongoing",
    targetYear: 2026,
    progressPct: 75,
    isLocked: false,
  },
  {
    id: "proj-002",
    planId: "plan-bdp-2026",
    title: "Purok 3 Riverbank Drainage Outfall & Slope Protection",
    sector: "infrastructure",
    budget: 850000,
    fundingSource: "LGU",
    status: "ongoing",
    targetYear: 2026,
    progressPct: 45,
    isLocked: false,
  },
  {
    id: "proj-003",
    planId: "plan-bdp-2026",
    title: "Multi-Purpose Evacuation Hall Roof Solarization & Retrofit",
    sector: "infrastructure",
    budget: 2100000,
    fundingSource: "national",
    status: "proposed",
    targetYear: 2027,
    progressPct: 10,
    isLocked: false,
  },
  {
    id: "proj-004",
    planId: "plan-bdp-2026",
    title: "BHW Mobile Telehealth Tablet Kit & Diagnostic Backpacks",
    sector: "health",
    budget: 320000,
    fundingSource: "NTA",
    status: "completed",
    targetYear: 2026,
    progressPct: 100,
    isLocked: true,
  },
  {
    id: "proj-005",
    planId: "plan-bdp-2026",
    title: "First 1,000 Days Maternal & Infant Nutrition Supplementary Program",
    sector: "health",
    budget: 450000,
    fundingSource: "grant",
    status: "ongoing",
    targetYear: 2026,
    progressPct: 60,
    isLocked: false,
  },
  {
    id: "proj-006",
    planId: "plan-bdp-2026",
    title: "Community Hydroponics & Urban Rooftop Farming Livelihood Hub",
    sector: "livelihood",
    budget: 600000,
    fundingSource: "trust",
    status: "ongoing",
    targetYear: 2026,
    progressPct: 35,
    isLocked: false,
  },
  {
    id: "proj-007",
    planId: "plan-bdp-2026",
    title: "Digital Freelancing & IT Skill Training for Out-of-School Youth (OSY)",
    sector: "education",
    budget: 280000,
    fundingSource: "LGU",
    status: "ongoing",
    targetYear: 2026,
    progressPct: 90,
    isLocked: false,
  },
  {
    id: "proj-008",
    planId: "plan-bdp-2026",
    title: "Barangay Materials Recovery Facility (MRF) Upgrades & Composting Unit",
    sector: "environment",
    budget: 540000,
    fundingSource: "NTA",
    status: "completed",
    targetYear: 2026,
    progressPct: 100,
    isLocked: false,
  },
  {
    id: "proj-009",
    planId: "plan-bdp-2026",
    title: "Integrated Peace & Order Patrol Bike Fleet & Tanod Radio Network",
    sector: "peace_order",
    budget: 390000,
    fundingSource: "NTA",
    status: "ongoing",
    targetYear: 2026,
    progressPct: 80,
    isLocked: false,
  },
];

export const useDevPlanStore = create<DevPlanState>()(
  persist(
    (set, get) => ({
      plans: INITIAL_PLANS,
      projects: INITIAL_PROJECTS,
      loading: false,
      error: null,

      fetchPlans: async () => {
        set({ loading: true, error: null });
        try {
          if (get().plans.length === 0) {
            set({ plans: INITIAL_PLANS });
          }
          set({ loading: false });
        } catch (err: any) {
          set({ error: err?.message ?? "Failed to fetch development plans", loading: false });
        }
      },

      fetchProjects: async () => {
        set({ loading: true, error: null });
        try {
          if (get().projects.length === 0) {
            set({ projects: INITIAL_PROJECTS });
          }
          set({ loading: false });
        } catch (err: any) {
          set({ error: err?.message ?? "Failed to fetch development projects", loading: false });
        }
      },

      addProject: async (input) => {
        const newProject: DevProject = {
          ...input,
          id: `proj-${Date.now().toString(36)}`,
          status: "proposed",
          progressPct: 0,
          isLocked: false,
        };
        set((state) => ({
          projects: [newProject, ...state.projects],
        }));
        return newProject;
      },

      updateProject: async (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== id || p.isLocked) return p;
            return { ...p, ...updates };
          }),
        }));
      },

      updateProjectProgress: async (id, progressPct) => {
        const safeValue = Math.max(0, Math.min(100, Math.round(progressPct)));
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== id || p.isLocked) return p;
            const updatedStatus = safeValue === 100 ? "completed" : safeValue > 0 ? "ongoing" : p.status;
            return { ...p, progressPct: safeValue, status: updatedStatus };
          }),
        }));
      },

      updateProjectStatus: async (id, status) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== id || p.isLocked) return p;
            const progress = status === "completed" ? 100 : p.progressPct;
            return { ...p, status, progressPct: progress };
          }),
        }));
      },

      deleteProject: async (id) => {
        const target = get().projects.find((p) => p.id === id);
        if (target?.isLocked) {
          throw new Error("Cannot delete a locked project. Unlock it first.");
        }
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }));
      },

      toggleLockProject: async (id) => {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, isLocked: !p.isLocked } : p)),
        }));
      },

      toggleLockPlan: async (id) => {
        set((state) => ({
          plans: state.plans.map((p) => (p.id === id ? { ...p, isLocked: !p.isLocked } : p)),
        }));
      },

      addPlan: async (input) => {
        const newPlan: DevelopmentPlan = {
          ...input,
          id: `plan-${Date.now().toString(36)}`,
          isLocked: false,
        };
        set((state) => ({
          plans: [...state.plans, newPlan],
        }));
        return newPlan;
      },
    }),
    {
      name: "cbms-devplan-store",
    }
  )
);
