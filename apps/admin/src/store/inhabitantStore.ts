import { create } from "zustand";
import { post, patch, del, get } from "@cbms/api-client";
import type { Inhabitant } from "../lib/types";

interface InhabitantState {
  inhabitants: Inhabitant[];
  loading: boolean;
  error: string | null;
  fetchInhabitants: () => Promise<void>;
  addInhabitant: (data: Partial<Inhabitant>) => Promise<void>;
  updateInhabitant: (id: string, data: Partial<Inhabitant>) => Promise<void>;
  deleteInhabitant: (id: string) => Promise<void>;
}

export const useInhabitantStore = create<InhabitantState>((set, getStore) => ({
  inhabitants: [],
  loading: false,
  error: null,
  fetchInhabitants: async () => {
    set({ loading: true, error: null });
    try {
      const data = await get<Inhabitant[]>("/inhabitants");
      set({ inhabitants: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch inhabitants", loading: false });
    }
  },
  addInhabitant: async (data) => {
    set({ loading: true, error: null });
    try {
      await post<Inhabitant>("/inhabitants", data);
      await getStore().fetchInhabitants();
    } catch (err: any) {
      set({ error: err.message || "Failed to add inhabitant", loading: false });
      throw err;
    }
  },
  updateInhabitant: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await patch<Inhabitant>(`/inhabitants/${id}`, data);
      await getStore().fetchInhabitants();
    } catch (err: any) {
      set({ error: err.message || "Failed to update inhabitant", loading: false });
      throw err;
    }
  },
  deleteInhabitant: async (id) => {
    set({ loading: true, error: null });
    try {
      await del(`/inhabitants/${id}`);
      await getStore().fetchInhabitants();
    } catch (err: any) {
      set({ error: err.message || "Failed to delete inhabitant", loading: false });
      throw err;
    }
  }
}));
