"use client";

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, put, del, api } from "@cbms/api-client";
import type { LedgerEntry, OfficialReceipt, LedgerStats } from "./types";

export interface LedgerQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  fund?: string;
  direction?: string;
  refType?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface LedgerPaginatedResponse {
  items: LedgerEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface InfiniteLedgerParams {
  pageSize?: number;
  search?: string;
  year?: string;
  dateFrom?: string;
  dateTo?: string;
  fund?: string;
  direction?: string;
  refType?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateLedgerPayload {
  postedAt?: string;
  fund: string;
  accountCode: string;
  description: string;
  direction: "credit" | "debit";
  amount: number;
  orNumber?: string | null;
  dvNumber?: string | null;
  checkNumber?: string | null;
  refType?: string;
  referenceId?: string | null;
  payorPayee?: string;
}

export interface UpdateLedgerPayload {
  postedAt?: string;
  fund?: string;
  accountCode?: string;
  description?: string;
  direction?: "credit" | "debit";
  amount?: number;
  orNumber?: string | null;
  dvNumber?: string | null;
  checkNumber?: string | null;
  refType?: string;
  payorPayee?: string;
  status?: string;
}

export interface CreateReceiptPayload {
  orNumber: string;
  payorName: string;
  amount: number;
  particulars: string;
  issuedAt?: string;
  refType?: string;
  paymentMethod?: string;
}

export interface ReceiptPaginatedResponse {
  items: OfficialReceipt[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface InfiniteReceiptsParams {
  pageSize?: number;
  search?: string;
  year?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  refType?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const financeQueryKeys = {
  all: ["finance"] as const,
  ledgerList: (params: InfiniteLedgerParams) => ["finance", "ledger", "list", params] as const,
  ledgerStats: () => ["finance", "ledger", "stats"] as const,
  ledgerDetail: (id: string) => ["finance", "ledger", "detail", id] as const,
  receiptsList: (params: InfiniteReceiptsParams) => ["finance", "receipts", "list", params] as const,
  receiptDetail: (id: string) => ["finance", "receipts", "detail", id] as const,
};

// 1. Infinite Scroll Query for Ledger Transactions
export function useInfiniteLedgerQuery(params: InfiniteLedgerParams = {}) {
  const pageSize = params.pageSize || 20;
  // Enforce server-side 3-character threshold:
  const search = (params.search ?? "").trim();
  const effectiveSearch = search.length >= 3 ? search : "";

  return useInfiniteQuery<LedgerPaginatedResponse>({
    queryKey: financeQueryKeys.ledgerList({
      pageSize,
      search: effectiveSearch,
      year: params.year ?? "all",
      dateFrom: params.dateFrom ?? "",
      dateTo: params.dateTo ?? "",
      fund: params.fund ?? "all",
      direction: params.direction ?? "all",
      refType: params.refType ?? "all",
      status: params.status ?? "all",
      sortBy: params.sortBy ?? "postedAt",
      sortOrder: params.sortOrder ?? "desc",
    }),
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const q = new URLSearchParams();
      q.set("page", String(pageParam));
      q.set("pageSize", String(pageSize));
      if (effectiveSearch) q.set("search", effectiveSearch);
      if (params.year && params.year !== "all") q.set("year", params.year);
      if (params.dateFrom) q.set("dateFrom", params.dateFrom);
      if (params.dateTo) q.set("dateTo", params.dateTo);
      if (params.fund && params.fund !== "all") q.set("fund", params.fund);
      if (params.direction && params.direction !== "all") q.set("direction", params.direction);
      if (params.refType && params.refType !== "all") q.set("refType", params.refType);
      if (params.status && params.status !== "all") q.set("status", params.status);
      if (params.sortBy) q.set("sortBy", params.sortBy);
      if (params.sortOrder) q.set("sortOrder", params.sortOrder);

      return await get<LedgerPaginatedResponse>(`/finance/ledger?${q.toString()}`);
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.items) return undefined;
      const currentPage = lastPage.page || 1;
      const totalPages = lastPage.totalPages || 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 30 * 1000,
  });
}

// 2. Financial Overview Stats Query
export function useLedgerStatsQuery() {
  return useQuery<LedgerStats>({
    queryKey: financeQueryKeys.ledgerStats(),
    queryFn: async () => {
      return await get<LedgerStats>("/finance/ledger/stats");
    },
    staleTime: 30 * 1000,
  });
}

// 3. Infinite Scroll Query for Official Receipts
export function useInfiniteReceiptsQuery(params: InfiniteReceiptsParams = {}) {
  const pageSize = params.pageSize || 20;
  const search = (params.search ?? "").trim();
  const effectiveSearch = search.length >= 3 ? search : "";

  return useInfiniteQuery<ReceiptPaginatedResponse>({
    queryKey: financeQueryKeys.receiptsList({
      pageSize,
      search: effectiveSearch,
      year: params.year ?? "all",
      dateFrom: params.dateFrom ?? "",
      dateTo: params.dateTo ?? "",
      status: params.status ?? "all",
      refType: params.refType ?? "all",
      sortBy: params.sortBy ?? "issuedAt",
      sortOrder: params.sortOrder ?? "desc",
    }),
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const q = new URLSearchParams();
      q.set("page", String(pageParam));
      q.set("pageSize", String(pageSize));
      if (effectiveSearch) q.set("search", effectiveSearch);
      if (params.year && params.year !== "all") q.set("year", params.year);
      if (params.dateFrom) q.set("dateFrom", params.dateFrom);
      if (params.dateTo) q.set("dateTo", params.dateTo);
      if (params.status && params.status !== "all") q.set("status", params.status);
      if (params.refType && params.refType !== "all") q.set("refType", params.refType);
      if (params.sortBy) q.set("sortBy", params.sortBy);
      if (params.sortOrder) q.set("sortOrder", params.sortOrder);

      return await get<ReceiptPaginatedResponse>(`/finance/receipts?${q.toString()}`);
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.items) return undefined;
      const currentPage = lastPage.page || 1;
      const totalPages = lastPage.totalPages || 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 30 * 1000,
  });
}

// 4. Mutations: Create, Update, Delete Ledger
export function useCreateLedgerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateLedgerPayload) => {
      return await post<LedgerEntry>("/finance/ledger", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeQueryKeys.all });
    },
  });
}

export function useUpdateLedgerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateLedgerPayload }) => {
      return await put<LedgerEntry>(`/finance/ledger/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeQueryKeys.all });
    },
  });
}

export function useDeleteLedgerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await del<{ message: string; id: string }>(`/finance/ledger/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeQueryKeys.all });
    },
  });
}

export function useBulkDeleteLedgerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      return await api<{ message: string; count: number }>("/finance/ledger/bulk", {
        method: "DELETE",
        body: JSON.stringify({ ids }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeQueryKeys.all });
    },
  });
}

// 5. Mutations: Create and Cancel Official Receipts
export function useCreateReceiptMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateReceiptPayload) => {
      return await post<OfficialReceipt>("/finance/receipts", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeQueryKeys.all });
    },
  });
}

export function useCancelReceiptMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return await post<OfficialReceipt>(`/finance/receipts/${id}/cancel`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeQueryKeys.all });
    },
  });
}
