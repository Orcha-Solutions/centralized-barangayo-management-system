"use client";

import { create } from "zustand";
import type { RptPropertyItem } from "../lib/rpt-queries";

export interface RptFilterState {
  year: string;
  dateFrom: string;
  dateTo: string;
  propertyType: string;
  paymentStatus: string;
  purok: string;
}

export interface RptStoreState extends RptFilterState {
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  declareOpen: boolean;
  editingProperty: RptPropertyItem | null;
  selectedProperty: RptPropertyItem | null;
  deleteTarget: RptPropertyItem | null;

  setSearch: (search: string) => void;
  setYear: (year: string) => void;
  setDateFrom: (dateFrom: string) => void;
  setDateTo: (dateTo: string) => void;
  setPropertyType: (propertyType: string) => void;
  setPaymentStatus: (paymentStatus: string) => void;
  setPurok: (purok: string) => void;
  setFilters: (filters: RptFilterState) => void;
  resetFilters: () => void;
  toggleSort: (columnKey: string) => void;
  setDeclareOpen: (open: boolean) => void;
  setEditingProperty: (prop: RptPropertyItem | null) => void;
  setSelectedProperty: (prop: RptPropertyItem | null) => void;
  setDeleteTarget: (prop: RptPropertyItem | null) => void;
}

const initialFilters: RptFilterState = {
  year: "all",
  dateFrom: "",
  dateTo: "",
  propertyType: "all",
  paymentStatus: "all",
  purok: "all",
};

export const useRptStore = create<RptStoreState>((set) => ({
  ...initialFilters,
  search: "",
  sortBy: "taxDeclarationNo",
  sortOrder: "asc",
  declareOpen: false,
  editingProperty: null,
  selectedProperty: null,
  deleteTarget: null,

  setSearch: (search) => set({ search }),
  setYear: (year) => set({ year }),
  setDateFrom: (dateFrom) => set({ dateFrom }),
  setDateTo: (dateTo) => set({ dateTo }),
  setPropertyType: (propertyType) => set({ propertyType }),
  setPaymentStatus: (paymentStatus) => set({ paymentStatus }),
  setPurok: (purok) => set({ purok }),
  setFilters: (filters) => set({ ...filters }),
  resetFilters: () => set({ ...initialFilters }),
  toggleSort: (columnKey) =>
    set((state) => {
      if (state.sortBy === columnKey) {
        return { sortOrder: state.sortOrder === "asc" ? "desc" : "asc" };
      }
      return { sortBy: columnKey, sortOrder: columnKey === "createdAt" ? "desc" : "asc" };
    }),
  setDeclareOpen: (declareOpen) => set({ declareOpen }),
  setEditingProperty: (editingProperty) => set({ editingProperty }),
  setSelectedProperty: (selectedProperty) => set({ selectedProperty }),
  setDeleteTarget: (deleteTarget) => set({ deleteTarget }),
}));
