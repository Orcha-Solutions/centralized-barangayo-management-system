import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface InstitutionMember {
  id: string;
  position: string;
  nameOverride?: string | null;
  termStart?: string | null;
  termEnd?: string | null;
  inhabitant?: {
    firstName?: string | null;
    middleName?: string | null;
    lastName?: string | null;
    suffix?: string | null;
  } | null;
}

export interface InstitutionMinute {
  id: string;
  meetingAt?: string | null;
  agenda?: string | null;
  minutes?: string | null;
}

export interface Institution {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  accreditedAt?: string | null;
  isActive: boolean;
  members?: InstitutionMember[];
  minutes?: InstitutionMinute[];
}

export interface InstitutionState {
  institutions: Institution[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchInstitutions: () => Promise<void>;
  addInstitution: (inst: Omit<Institution, "id" | "members" | "minutes">) => Promise<Institution>;
  updateInstitution: (id: string, updates: Partial<Institution>) => Promise<void>;
  addMember: (institutionId: string, member: Omit<InstitutionMember, "id">) => Promise<void>;
  removeMember: (institutionId: string, memberId: string) => Promise<void>;
  addMinute: (institutionId: string, minute: Omit<InstitutionMinute, "id">) => Promise<void>;
}

const INITIAL_INSTITUTIONS: Institution[] = [
  {
    id: "inst-bdc",
    code: "BDC",
    name: "Barangay Development Council",
    description: "Formulates long-term, medium-term, and annual socio-economic development plans and investment programs (BDP & AIP).",
    accreditedAt: "2023-11-15",
    isActive: true,
    members: [
      { id: "m-bdc-1", position: "Chairperson", nameOverride: "Punong Barangay Eduardo M. Santos", termStart: "2023-11-01", termEnd: "2026-11-01" },
      { id: "m-bdc-2", position: "Vice Chairperson / Focal", nameOverride: "Engr. Roberto Gomez (BDC Lead)", termStart: "2023-11-01", termEnd: "2026-11-01" },
      { id: "m-bdc-3", position: "Secretary", nameOverride: "Lourdes Bautista", termStart: "2023-11-01", termEnd: "2026-11-01" },
      { id: "m-bdc-4", position: "NGO Representative - Infrastructure", nameOverride: "Arch. Dennis Alcantara", termStart: "2024-01-10", termEnd: "2026-11-01" },
      { id: "m-bdc-5", position: "Business Sector Representative", nameOverride: "Victoria Sy", termStart: "2024-01-10", termEnd: "2026-11-01" },
      { id: "m-bdc-6", position: "Youth Sector Representative", nameOverride: "Mark Angelo Cruz (SK Chair)", termStart: "2023-11-01", termEnd: "2026-11-01" },
    ],
    minutes: [
      { id: "min-bdc-1", meetingAt: "2026-08-15", agenda: "FY 2027 Annual Investment Program (AIP) Project Prioritization", minutes: "Approved 9 priority infrastructure and health initiatives for Sanggunian budget appropriation." },
      { id: "min-bdc-2", meetingAt: "2026-05-10", agenda: "Mid-Term BDP 2026-2028 Implementation Review", minutes: "Evaluated 75% completion of solar streetlights and riverbank slope protection." },
    ],
  },
  {
    id: "inst-lupon",
    code: "LUPON",
    name: "Lupong Tagapamayapa",
    description: "Administers the Katarungang Pambarangay community dispute conciliation and mediation system pursuant to RA 7160.",
    accreditedAt: "2023-11-20",
    isActive: true,
    members: [
      { id: "m-lup-1", position: "Chairperson", nameOverride: "Punong Barangay Eduardo M. Santos", termStart: "2023-11-01", termEnd: "2026-11-01" },
      { id: "m-lup-2", position: "Secretary", nameOverride: "Atty. Fernando Cruz", termStart: "2023-11-01", termEnd: "2026-11-01" },
      { id: "m-lup-3", position: "Mediator / Member", nameOverride: "Ret. Judge Manuel Diaz", termStart: "2023-11-01", termEnd: "2026-11-01" },
      { id: "m-lup-4", position: "Mediator / Member", nameOverride: "Pastor Benjamin Ramos", termStart: "2023-11-01", termEnd: "2026-11-01" },
      { id: "m-lup-5", position: "Mediator / Member", nameOverride: "Prof. Cristina Valenzuela", termStart: "2023-11-01", termEnd: "2026-11-01" },
    ],
    minutes: [
      { id: "min-lup-1", meetingAt: "2026-08-20", agenda: "Monthly KP Docket Audit & Settlement Compliance", minutes: "14 of 16 cases mediated reached amicable settlement without Certificate to File Action." },
    ],
  },
  {
    id: "inst-bdrrmc",
    code: "BDRRMC",
    name: "Barangay Disaster Risk Reduction & Management Committee",
    description: "Sets disaster risk reduction measures, manages the 5% LDRRM fund, emergency sirens, and evacuation center operations.",
    accreditedAt: "2023-11-15",
    isActive: true,
    members: [
      { id: "m-drr-1", position: "Chairperson", nameOverride: "Punong Barangay Eduardo M. Santos", termStart: "2023-11-01", termEnd: "2026-11-01" },
      { id: "m-drr-2", position: "Operations Officer", nameOverride: "Capt. Danilo Cruz", termStart: "2023-11-01", termEnd: "2026-11-01" },
      { id: "m-drr-3", position: "Logistics Lead", nameOverride: "Carmen D. Bautista (Treasurer)", termStart: "2023-11-01", termEnd: "2026-11-01" },
      { id: "m-drr-4", position: "Early Warning Officer", nameOverride: "Executive Officer Rommel Reyes", termStart: "2023-11-01", termEnd: "2026-11-01" },
    ],
    minutes: [
      { id: "min-drr-1", meetingAt: "2026-07-28", agenda: "La Niña Monsoon Contingency Plan & Evacuation Preparedness", minutes: "Stockpiled 500 food relief packs and tested flood water level telemetry sensors at Marikina Riverbanks." },
    ],
  },
  {
    id: "inst-badac",
    code: "BADAC",
    name: "Barangay Anti-Drug Abuse Council",
    description: "Coordinates drug-clearing operations, community-based drug rehabilitation (CBDRP), and preventive education.",
    accreditedAt: "2023-11-15",
    isActive: true,
    members: [
      { id: "m-bad-1", position: "Chairperson", nameOverride: "Punong Barangay Eduardo M. Santos", termStart: "2023-11-01", termEnd: "2026-11-01" },
      { id: "m-bad-2", position: "Focal Person", nameOverride: "Officer Manny Santos", termStart: "2023-11-01", termEnd: "2026-11-01" },
      { id: "m-bad-3", position: "Faith-Based Representative", nameOverride: "Rev. Father Joseph Tan", termStart: "2023-11-01", termEnd: "2026-11-01" },
    ],
    minutes: [
      { id: "min-bad-1", meetingAt: "2026-08-05", agenda: "PDEA Barangay Drug-Free Maintenance Certification", minutes: "Completed drug awareness symposium across 3 public high schools." },
    ],
  },
  {
    id: "inst-bcpc",
    code: "BCPC",
    name: "Barangay Council for the Protection of Children",
    description: "Advocates child survival, development, protection, and participation, managing anti-child abuse interventions.",
    accreditedAt: "2023-12-01",
    isActive: true,
    members: [
      { id: "m-bcp-1", position: "Chairperson", nameOverride: "Punong Barangay Eduardo M. Santos", termStart: "2023-11-01", termEnd: "2026-11-01" },
      { id: "m-bcp-2", position: "Vice Chairperson", nameOverride: "Elena Rivera (VAW Officer)", termStart: "2023-11-01", termEnd: "2026-11-01" },
      { id: "m-bcp-3", position: "Child Development Worker Lead", nameOverride: "Norma Galvez", termStart: "2023-11-01", termEnd: "2026-11-01" },
    ],
    minutes: [
      { id: "min-bcp-1", meetingAt: "2026-06-12", agenda: "Day Care Center Modernization & Feeding Program", minutes: "Allocated supplemental nutrition fund for 120 enrolled toddlers." },
    ],
  },
  {
    id: "inst-sk",
    code: "SK",
    name: "Sangguniang Kabataan",
    description: "Official youth legislative council directing the Comprehensive Barangay Youth Development Plan (CBYDP) and 10% SK budget.",
    accreditedAt: "2023-11-01",
    isActive: true,
    members: [
      { id: "m-sk-1", position: "SK Chairperson", nameOverride: "Mark Angelo Cruz", termStart: "2023-11-01", termEnd: "2026-11-01" },
      { id: "m-sk-2", position: "SK Secretary", nameOverride: "Patricia Ann Domingo", termStart: "2023-11-01", termEnd: "2026-11-01" },
      { id: "m-sk-3", position: "SK Treasurer", nameOverride: "Jerome Paul Aquino", termStart: "2023-11-01", termEnd: "2026-11-01" },
    ],
    minutes: [
      { id: "min-sk-1", meetingAt: "2026-08-12", agenda: "Linggo ng Kabataan 2026 & Digital Upskilling Workshop", minutes: "Approved tournament prizes and e-sports academic bootcamps." },
    ],
  },
];

export const useInstitutionStore = create<InstitutionState>()(
  persist(
    (set, get) => ({
      institutions: INITIAL_INSTITUTIONS,
      loading: false,
      error: null,

      fetchInstitutions: async () => {
        set({ loading: true, error: null });
        try {
          if (get().institutions.length === 0) {
            set({ institutions: INITIAL_INSTITUTIONS });
          }
          set({ loading: false });
        } catch (err: any) {
          set({ error: err?.message ?? "Failed to fetch institutions", loading: false });
        }
      },

      addInstitution: async (input) => {
        const newInst: Institution = {
          ...input,
          id: `inst-${Date.now().toString(36)}`,
          members: [],
          minutes: [],
        };
        set((state) => ({
          institutions: [...state.institutions, newInst],
        }));
        return newInst;
      },

      updateInstitution: async (id, updates) => {
        set((state) => ({
          institutions: state.institutions.map((inst) =>
            inst.id === id ? { ...inst, ...updates } : inst
          ),
        }));
      },

      addMember: async (institutionId, member) => {
        const newMember: InstitutionMember = {
          ...member,
          id: `m-${Date.now().toString(36)}`,
        };
        set((state) => ({
          institutions: state.institutions.map((inst) =>
            inst.id === institutionId
              ? { ...inst, members: [...(inst.members ?? []), newMember] }
              : inst
          ),
        }));
      },

      removeMember: async (institutionId, memberId) => {
        set((state) => ({
          institutions: state.institutions.map((inst) =>
            inst.id === institutionId
              ? { ...inst, members: (inst.members ?? []).filter((m) => m.id !== memberId) }
              : inst
          ),
        }));
      },

      addMinute: async (institutionId, minute) => {
        const newMinute: InstitutionMinute = {
          ...minute,
          id: `min-${Date.now().toString(36)}`,
        };
        set((state) => ({
          institutions: state.institutions.map((inst) =>
            inst.id === institutionId
              ? { ...inst, minutes: [newMinute, ...(inst.minutes ?? [])] }
              : inst
          ),
        }));
      },
    }),
    {
      name: "cbms-institutions-store",
    }
  )
);
