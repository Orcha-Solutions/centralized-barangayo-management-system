import { create } from "zustand";
import { post, patch, del, get } from "@cbms/api-client";
import type { Household } from "../lib/types";

interface HouseholdState {
  households: Household[];
  loading: boolean;
  error: string | null;
  fetchHouseholds: () => Promise<void>;
  addHousehold: (data: Partial<Household>) => Promise<Household>;
  updateHousehold: (id: string, data: Partial<Household>) => Promise<Household>;
  deleteHousehold: (id: string) => Promise<void>;
}

export const useHouseholdStore = create<HouseholdState>((set, getStore) => ({
  households: [],
  loading: false,
  error: null,
  fetchHouseholds: async () => {
    set({ loading: true, error: null });
    try {
      const data = await get<Household[]>("/households");
      set({ households: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch households", loading: false });
    }
  },
  addHousehold: async (data) => {
    set({ loading: true, error: null });
    try {
      const created = await post<Household>("/households", data);
      await getStore().fetchHouseholds();
      set({ loading: false });
      return created;
    } catch (err: any) {
      set({ error: err.message || "Failed to add household", loading: false });
      throw err;
    }
  },
  updateHousehold: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updated = await patch<Household>(`/households/${id}`, data);
      await getStore().fetchHouseholds();
      set({ loading: false });
      return updated;
    } catch (err: any) {
      set({ error: err.message || "Failed to update household", loading: false });
      throw err;
    }
  },
  deleteHousehold: async (id) => {
    set({ loading: true, error: null });
    try {
      await del(`/households/${id}`);
      await getStore().fetchHouseholds();
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to delete household", loading: false });
      throw err;
    }
  }
}));
