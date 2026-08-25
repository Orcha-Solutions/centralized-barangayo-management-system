import { create } from "zustand";
import { get, post, patch, del } from "@cbms/api-client";
import type { Inhabitant } from "../lib/types";

export interface LguDocRequest {
  id: string;
  barangayId: string;
  inhabitantId: string;
  docType: string;
  purpose: string;
  status: string;
  referenceNo: string;
  fee: number;
  paidAt?: string | null;
  orNumber?: string | null;
  remarks?: string | null;
  attachmentName?: string | null;
  attachmentUrl?: string | null;
  approvedAt?: string | null;
  releasedAt?: string | null;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  inhabitant?: Inhabitant | null;
}

interface LguDocState {
  lguRequests: LguDocRequest[];
  loading: boolean;
  error: string | null;
  fetchLguRequests: () => Promise<void>;
  addLguRequest: (data: Partial<LguDocRequest>) => Promise<LguDocRequest>;
  updateLguRequest: (id: string, data: Partial<LguDocRequest>) => Promise<LguDocRequest>;
  deleteLguRequest: (id: string) => Promise<void>;
}

export const useLguDocStore = create<LguDocState>((set, getStore) => ({
  lguRequests: [],
  loading: false,
  error: null,
  fetchLguRequests: async () => {
    set({ loading: true, error: null });
    try {
      const data = await get<LguDocRequest[]>("/lgu-requests");
      set({ lguRequests: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch LGU document requests", loading: false });
    }
  },
  addLguRequest: async (data) => {
    set({ loading: true, error: null });
    try {
      const created = await post<LguDocRequest>("/lgu-requests", data);
      await getStore().fetchLguRequests();
      set({ loading: false });
      return created;
    } catch (err: any) {
      set({ error: err.message || "Failed to create LGU request", loading: false });
      throw err;
    }
  },
  updateLguRequest: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updated = await patch<LguDocRequest>(`/lgu-requests/${id}`, data);
      await getStore().fetchLguRequests();
      set({ loading: false });
      return updated;
    } catch (err: any) {
      set({ error: err.message || "Failed to update LGU request", loading: false });
      throw err;
    }
  },
  deleteLguRequest: async (id) => {
    set({ loading: true, error: null });
    try {
      await del(`/lgu-requests/${id}`);
      await getStore().fetchLguRequests();
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to delete LGU request", loading: false });
      throw err;
    }
  },
}));
