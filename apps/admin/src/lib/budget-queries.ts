"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, put } from "@cbms/api-client";

export interface StatutorySectorFund {
  id: string;
  budgetId: string;
  barangayId: string;
  code: string;
  name: string;
  category: "mandatory_statutory" | "discretionary_local";
  statutoryMinPct?: number | null;
  appropriatedCentavos: number;
  obligatedCentavos: number;
  balanceCentavos: number;
  legalBasis?: string;
  icon?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BudgetStats {
  totalAnnualBudgetCentavos: number;
  totalAppropriatedCentavos: number;
  totalObligatedCentavos: number;
  totalBalanceCentavos: number;
  overallBurnRatePercent: number;
  sectorCount: number;
}

export interface BudgetOverview {
  id: string;
  barangayId: string;
  year: number;
  ordinanceNo: string;
  title: string;
  totalAmountCentavos: number;
  isSupplemental: boolean;
  status: string;
  sectors: StatutorySectorFund[];
}

export interface BudgetOverviewResponse {
  budget: BudgetOverview;
  stats: BudgetStats;
}

export interface CreateSectorInput {
  budgetId: string;
  code: string;
  name: string;
  category: string;
  statutoryMinPct?: number | null;
  appropriatedCentavos: number;
  legalBasis?: string;
  icon?: string;
}

export interface UpdateSectorInput {
  name?: string;
  appropriatedCentavos?: number;
  legalBasis?: string;
  icon?: string;
  isActive?: boolean;
}

export interface SectorDisbursementItem {
  ledgerId: string;
  accountCode: string;
  description: string;
  dvNumber: string;
  payee: string;
  amount: number;
  postedAt: string;
}

export function useBudgetOverview(year: number = 2026) {
  return useQuery<BudgetOverviewResponse>({
    queryKey: ["budget", "overview", year],
    queryFn: async () => {
      const res = await get<BudgetOverviewResponse>(`/api/v1/budget/overview?year=${year}`);
      return res;
    },
    staleTime: 60 * 1000,
  });
}

export function useBudgetSectors(year: number = 2026) {
  return useQuery<{ data: StatutorySectorFund[]; total: number }>({
    queryKey: ["budget", "sectors", year],
    queryFn: async () => {
      const res = await get<{ data: StatutorySectorFund[]; total: number }>(`/api/v1/budget/sectors?year=${year}`);
      return res;
    },
    staleTime: 60 * 1000,
  });
}

export function useSectorDisbursements(sectorId: string) {
  return useQuery<{ data: SectorDisbursementItem[]; count: number }>({
    queryKey: ["budget", "disbursements", sectorId],
    queryFn: async () => {
      if (!sectorId) return { data: [], count: 0 };
      const res = await get<{ data: SectorDisbursementItem[]; count: number }>(`/api/v1/budget/sectors/${sectorId}/disbursements`);
      return res;
    },
    enabled: Boolean(sectorId),
  });
}

export function useCreateBudgetSector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateSectorInput) => {
      return await post<StatutorySectorFund>("/api/v1/budget/sectors", input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget"] });
    },
  });
}

export function useUpdateBudgetSector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateSectorInput }) => {
      return await put<StatutorySectorFund>(`/api/v1/budget/sectors/${id}`, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget"] });
    },
  });
}
