"use client";

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, put, del } from "@cbms/api-client";

export type RptPropertyType = "residential" | "commercial" | "industrial" | "agricultural" | "special";
export type RptPaymentStatus = "unpaid" | "partially_paid" | "fully_paid" | "exempt";

export interface RptPropertyItem {
  id: string;
  barangayId: string;
  taxDeclarationNo: string;
  ownerName: string;
  inhabitantId?: string | null;
  propertyType: RptPropertyType;
  addressLine: string;
  purok: string;
  assessedValueCentavos: number;
  marketValueCentavos: number;
  assessedValue: number; // Pesos convenience field
  marketValue: number;   // Pesos convenience field
  lotNo?: string | null;
  blockNo?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RptTaxDueItem {
  id: string;
  rptPropertyId: string;
  barangayId: string;
  taxYear: number;
  basicTaxCentavos: number;
  sefTaxCentavos: number;
  barangayShareCentavos: number;
  totalDueCentavos: number;
  penaltyCentavos: number;
  discountCentavos: number;
  netPayableCentavos: number;
  basicTaxAmount: number;    // Pesos convenience field
  sefTaxAmount: number;      // Pesos convenience field
  barangayShareAmount: number; // Pesos convenience field
  penaltyAmount: number;     // Pesos convenience field
  discountAmount: number;    // Pesos convenience field
  totalAmount: number;       // Pesos convenience field
  paymentStatus: RptPaymentStatus;
  paidAt?: string | null;
  orNumber?: string | null;
  createdAt?: string;
}

export interface RptStatsResponse {
  barangayId: string;
  totalProperties: number;
  totalAssessedValueCentavos: number;
  totalMarketValueCentavos: number;
  totalBarangayShareCentavos: number;
  collectedShareCentavos: number;
  delinquentShareCentavos: number;
  collectionEfficiencyPercent: number;
  byPropertyType: Record<string, number>;
  byPaymentStatus: Record<string, number>;
}

export interface RptPaginatedResponse {
  items: RptPropertyItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface InfiniteRptParams {
  pageSize?: number;
  search?: string;
  year?: string;
  dateFrom?: string;
  dateTo?: string;
  propertyType?: string;
  paymentStatus?: string;
  purok?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateRptPropertyPayload {
  taxDeclarationNo: string;
  ownerName: string;
  inhabitantId?: string | null;
  propertyType: RptPropertyType;
  addressLine: string;
  purok: string;
  assessedValueCentavos: number;
  marketValueCentavos: number;
  lotNo?: string | null;
  blockNo?: string | null;
  taxYear?: number;
}

export interface UpdateRptPropertyPayload {
  taxDeclarationNo?: string;
  ownerName?: string;
  inhabitantId?: string | null;
  propertyType?: RptPropertyType;
  addressLine?: string;
  purok?: string;
  assessedValueCentavos?: number;
  marketValueCentavos?: number;
  lotNo?: string | null;
  blockNo?: string | null;
}

export interface PayRptTaxPayload {
  taxYear?: number;
  paymentMethod?: string;
  orNumber?: string;
  paidBy?: string;
}

export function normalizeRptProperty(raw: any): RptPropertyItem {
  const avCentavos =
    typeof raw.assessedValueCentavos === "number"
      ? raw.assessedValueCentavos
      : Math.round((Number(raw.assessedValue) || 0) * 100);
  const mvCentavos =
    typeof raw.marketValueCentavos === "number"
      ? raw.marketValueCentavos
      : Math.round((Number(raw.marketValue) || 0) * 100);

  return {
    id: raw.id,
    barangayId: raw.barangayId || "brgy-barangka",
    taxDeclarationNo: raw.taxDeclarationNo || "",
    ownerName: raw.ownerName || "",
    inhabitantId: raw.inhabitantId || raw.ownerInhabitantId || null,
    propertyType: (raw.propertyType || "residential") as RptPropertyType,
    addressLine: raw.addressLine || "",
    purok: raw.purok || "Purok 1",
    assessedValueCentavos: avCentavos,
    marketValueCentavos: mvCentavos,
    assessedValue: Math.round(avCentavos / 100),
    marketValue: Math.round(mvCentavos / 100),
    lotNo: raw.lotNo || null,
    blockNo: raw.blockNo || null,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.createdAt || new Date().toISOString(),
  };
}

export function normalizeRptDue(raw: any): RptTaxDueItem {
  const basicCentavos =
    typeof raw.basicTaxCentavos === "number"
      ? raw.basicTaxCentavos
      : Math.round((Number(raw.basicTaxAmount) || 0) * 100);
  const sefCentavos =
    typeof raw.sefTaxCentavos === "number"
      ? raw.sefTaxCentavos
      : Math.round((Number(raw.sefTaxAmount) || 0) * 100);
  const brgyCentavos =
    typeof raw.barangayShareCentavos === "number"
      ? raw.barangayShareCentavos
      : Math.round(basicCentavos * 0.25);
  const penaltyCentavos =
    typeof raw.penaltyCentavos === "number"
      ? raw.penaltyCentavos
      : Math.round((Number(raw.penaltyAmount) || 0) * 100);
  const discountCentavos =
    typeof raw.discountCentavos === "number"
      ? raw.discountCentavos
      : Math.round((Number(raw.discountAmount) || 0) * 100);
  const netCentavos =
    typeof raw.netPayableCentavos === "number"
      ? raw.netPayableCentavos
      : typeof raw.totalDueCentavos === "number"
        ? raw.totalDueCentavos
        : Math.round((Number(raw.totalAmount) || 0) * 100);

  return {
    id: raw.id,
    rptPropertyId: raw.rptPropertyId,
    barangayId: raw.barangayId || "brgy-barangka",
    taxYear: Number(raw.taxYear) || new Date().getFullYear(),
    basicTaxCentavos: basicCentavos,
    sefTaxCentavos: sefCentavos,
    barangayShareCentavos: brgyCentavos,
    totalDueCentavos: Number(raw.totalDueCentavos ?? netCentavos),
    penaltyCentavos,
    discountCentavos,
    netPayableCentavos: netCentavos,
    basicTaxAmount: basicCentavos / 100,
    sefTaxAmount: sefCentavos / 100,
    barangayShareAmount: brgyCentavos / 100,
    penaltyAmount: penaltyCentavos / 100,
    discountAmount: discountCentavos / 100,
    totalAmount: netCentavos / 100,
    paymentStatus: (raw.paymentStatus || "unpaid") as RptPaymentStatus,
    paidAt: raw.paidAt || null,
    orNumber: raw.orNumber || null,
    createdAt: raw.createdAt,
  };
}

export const rptQueryKeys = {
  all: ["rpt"] as const,
  list: (params: InfiniteRptParams) => ["rpt", "list", params] as const,
  stats: (params?: InfiniteRptParams) => ["rpt", "stats", params ?? {}] as const,
  dues: () => ["rpt", "dues"] as const,
};

// 1. Infinite Scroll Query for RPT Properties (minimum 20 records per page + 3-char server search)
export function useInfiniteRptPropertiesQuery(params: InfiniteRptParams = {}) {
  const pageSize = Math.max(20, params.pageSize || 20);
  const search = (params.search ?? "").trim();
  const effectiveSearch = search.length >= 3 ? search : "";

  return useInfiniteQuery<RptPaginatedResponse>({
    queryKey: rptQueryKeys.list({
      pageSize,
      search: effectiveSearch,
      year: params.year ?? "all",
      dateFrom: params.dateFrom ?? "",
      dateTo: params.dateTo ?? "",
      propertyType: params.propertyType ?? "all",
      paymentStatus: params.paymentStatus ?? "all",
      purok: params.purok ?? "all",
      sortBy: params.sortBy ?? "taxDeclarationNo",
      sortOrder: params.sortOrder ?? "asc",
    }),
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const q = new URLSearchParams();
      q.set("page", String(pageParam));
      q.set("pageSize", String(pageSize));
      if (effectiveSearch) q.set("search", effectiveSearch);
      if (params.year && params.year !== "all") q.set("taxYear", params.year);
      if (params.dateFrom) q.set("dateFrom", params.dateFrom);
      if (params.dateTo) q.set("dateTo", params.dateTo);
      if (params.propertyType && params.propertyType !== "all") q.set("propertyType", params.propertyType);
      if (params.paymentStatus && params.paymentStatus !== "all") q.set("paymentStatus", params.paymentStatus);
      if (params.purok && params.purok !== "all") q.set("purok", params.purok);
      if (params.sortBy) q.set("sortBy", params.sortBy);
      if (params.sortOrder) q.set("sortOrder", params.sortOrder);

      const res = await get<any>(`/rpt?${q.toString()}`);
      const rawItems = Array.isArray(res) ? res : res?.items ?? res?.data ?? [];
      const items = rawItems.map(normalizeRptProperty);
      const total = typeof res?.total === "number" ? res.total : items.length;
      const totalPages = typeof res?.totalPages === "number" ? res.totalPages : Math.max(1, Math.ceil(total / pageSize));
      return {
        items,
        total,
        page: Number(pageParam),
        pageSize,
        totalPages,
      };
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.items) return undefined;
      return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined;
    },
    staleTime: 30 * 1000,
  });
}

// 2. RPT Overview Statistics Query (reactive to active search & filters)
export function useRptStatsQuery(params: InfiniteRptParams = {}) {
  const search = (params.search ?? "").trim();
  const effectiveSearch = search.length >= 3 ? search : "";
  const filterParams: InfiniteRptParams = {
    search: effectiveSearch,
    year: params.year ?? "all",
    dateFrom: params.dateFrom ?? "",
    dateTo: params.dateTo ?? "",
    propertyType: params.propertyType ?? "all",
    paymentStatus: params.paymentStatus ?? "all",
    purok: params.purok ?? "all",
  };

  return useQuery<RptStatsResponse>({
    queryKey: rptQueryKeys.stats(filterParams),
    queryFn: async () => {
      const q = new URLSearchParams();
      if (effectiveSearch) q.set("search", effectiveSearch);
      if (filterParams.year && filterParams.year !== "all") q.set("taxYear", filterParams.year);
      if (filterParams.dateFrom) q.set("dateFrom", filterParams.dateFrom);
      if (filterParams.dateTo) q.set("dateTo", filterParams.dateTo);
      if (filterParams.propertyType && filterParams.propertyType !== "all") {
        q.set("propertyType", filterParams.propertyType);
      }
      if (filterParams.paymentStatus && filterParams.paymentStatus !== "all") {
        q.set("paymentStatus", filterParams.paymentStatus);
      }
      if (filterParams.purok && filterParams.purok !== "all") {
        q.set("purok", filterParams.purok);
      }
      const qs = q.toString();
      return await get<RptStatsResponse>(qs ? `/rpt/stats?${qs}` : "/rpt/stats");
    },
    staleTime: 30 * 1000,
  });
}

// 3. RPT Tax Dues Query
export function useRptDuesQuery() {
  return useQuery<RptTaxDueItem[]>({
    queryKey: rptQueryKeys.dues(),
    queryFn: async () => {
      const res = await get<any>("/rpt/dues?page=1&pageSize=200");
      const rawItems = Array.isArray(res) ? res : res?.items ?? res?.data ?? [];
      return rawItems.map(normalizeRptDue);
    },
    staleTime: 30 * 1000,
  });
}

// 4. Mutations: Create, Update, Delete, and Pay Tax
export function useCreateRptPropertyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateRptPropertyPayload) => {
      const res = await post<any>("/rpt", payload);
      return normalizeRptProperty(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rptQueryKeys.all });
    },
  });
}

export function useUpdateRptPropertyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateRptPropertyPayload }) => {
      const res = await put<any>(`/rpt/${id}`, payload);
      return normalizeRptProperty(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rptQueryKeys.all });
    },
  });
}

export function useDeleteRptPropertyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await del<{ message?: string }>(`/rpt/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rptQueryKeys.all });
    },
  });
}

export function usePayRptTaxMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ propertyId, payload }: { propertyId: string; payload: PayRptTaxPayload }) => {
      return await post<{ success: boolean; orNumber: string; due: any; receipt?: any }>(
        `/rpt/${propertyId}/pay`,
        payload
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rptQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}
