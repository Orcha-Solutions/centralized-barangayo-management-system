"use client";

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, api, del } from "@cbms/api-client";
import type { CertificateRequest, CertificateStats, CertificateType } from "./types";

export interface CertificateQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  typeId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CertificatePaginatedResponse {
  data: CertificateRequest[];
  items?: CertificateRequest[];
  total: number;
  limit: number;
  offset: number;
  page?: number;
}

export interface InfiniteCertificatesParams {
  pageSize?: number;
  search?: string;
  status?: string;
  typeId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const CERTIFICATE_QUERY_KEYS = {
  all: ["certificates"] as const,
  infinite: (params: InfiniteCertificatesParams) => {
    const validSearch = (params.search?.trim().length ?? 0) >= 3 ? params.search!.trim() : "";
    return [
      "certificates",
      "infinite",
      {
        pageSize: params.pageSize ?? 20,
        search: validSearch,
        status: params.status ?? "all",
        typeId: params.typeId ?? "all",
        sortBy: params.sortBy ?? "createdAt",
        sortOrder: params.sortOrder ?? "desc",
      },
    ] as const;
  },
  stats: () => ["certificates", "stats"] as const,
  types: () => ["certificates", "types"] as const,
  detail: (id: string) => ["certificates", "detail", id] as const,
};

/**
 * Server-side infinite scrolling & lazy loading query for Document Requests / Certificates.
 * Loads records with a minimum of 20 records per batch.
 * Search queries trigger ONLY when at least 3 characters are inputted.
 */
export function useInfiniteCertificatesQuery(params: InfiniteCertificatesParams) {
  const pageSize = Math.max(20, params.pageSize ?? 20);
  const rawSearch = params.search?.trim() ?? "";
  const activeSearch = rawSearch.length >= 3 ? rawSearch : "";
  const status = params.status ?? "all";
  const typeId = params.typeId ?? "all";
  const sortBy = params.sortBy ?? "createdAt";
  const sortOrder = params.sortOrder ?? "desc";

  return useInfiniteQuery<CertificatePaginatedResponse>({
    queryKey: CERTIFICATE_QUERY_KEYS.infinite({
      pageSize,
      search: activeSearch,
      status,
      typeId,
      sortBy,
      sortOrder,
    }),
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const offset = typeof pageParam === "number" ? pageParam : 0;
      const searchParams = new URLSearchParams();
      searchParams.set("limit", String(pageSize));
      searchParams.set("offset", String(offset));

      if (activeSearch) {
        searchParams.set("search", activeSearch);
      }
      if (status && status !== "all") {
        searchParams.set("status", status);
      }
      if (typeId && typeId !== "all") {
        searchParams.set("typeId", typeId);
      }
      if (sortBy) {
        searchParams.set("sortBy", sortBy);
        searchParams.set("sortOrder", sortOrder);
      }

      const res = await get<CertificatePaginatedResponse>(`/certificates?${searchParams.toString()}`);
      if (Array.isArray(res)) {
        return {
          data: res as CertificateRequest[],
          items: res as CertificateRequest[],
          total: (res as CertificateRequest[]).length,
          limit: pageSize,
          offset,
        };
      }

      return {
        data: res.data ?? res.items ?? [],
        items: res.items ?? res.data ?? [],
        total: Number(res.total ?? 0),
        limit: Number(res.limit ?? pageSize),
        offset: Number(res.offset ?? offset),
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((acc, curr) => acc + (curr.data?.length ?? 0), 0);
      if (loaded < lastPage.total) {
        return loaded;
      }
      return undefined;
    },
    staleTime: 1000 * 30, // 30s
  });
}

/**
 * KPI Statistics query for Document Requests (approvals, releases, SLA compliance).
 */
export function useCertificateStatsQuery() {
  return useQuery<CertificateStats>({
    queryKey: CERTIFICATE_QUERY_KEYS.stats(),
    queryFn: async () => {
      return get<CertificateStats>("/certificates/stats");
    },
    staleTime: 1000 * 60,
  });
}

/**
 * Statutory certificate and clearance templates catalog query.
 */
export function useCertificateTypesQuery() {
  return useQuery<CertificateType[]>({
    queryKey: CERTIFICATE_QUERY_KEYS.types(),
    queryFn: async () => {
      return get<CertificateType[]>("/certificate-types");
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Mutation for single certificate request creation.
 */
export function useCreateCertificateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      typeId: string;
      inhabitantId?: string | null;
      purpose: string;
      fee?: number;
      paymentMethod?: string;
      orNumber?: string | null;
      remarks?: string | null;
    }) => {
      return post<CertificateRequest>("/certificates", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CERTIFICATE_QUERY_KEYS.all });
    },
  });
}

/**
 * Mutation for single certificate request update.
 */
export function useUpdateCertificateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CertificateRequest>;
    }) => {
      return api<CertificateRequest>(`/certificates/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: CERTIFICATE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CERTIFICATE_QUERY_KEYS.detail(vars.id) });
    },
  });
}

/**
 * Mutation for single certificate request deletion.
 */
export function useDeleteCertificateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return del(`/certificates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CERTIFICATE_QUERY_KEYS.all });
    },
  });
}

/**
 * Mutation for approving a certificate request.
 */
export function useApproveCertificateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      remarks,
    }: {
      id: string;
      remarks?: string;
    }) => {
      return post<CertificateRequest>(`/certificates/${id}/approve`, { remarks });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: CERTIFICATE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CERTIFICATE_QUERY_KEYS.detail(vars.id) });
    },
  });
}

/**
 * Mutation for rejecting a certificate request.
 */
export function useRejectCertificateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      reason,
    }: {
      id: string;
      reason: string;
    }) => {
      return post<CertificateRequest>(`/certificates/${id}/reject`, { reason });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: CERTIFICATE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CERTIFICATE_QUERY_KEYS.detail(vars.id) });
    },
  });
}

/**
 * Mutation for bulk certificate request deletion.
 */
export function useBulkDeleteCertificatesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      return api<{ message: string; count: number }>("/certificates/bulk", {
        method: "DELETE",
        body: JSON.stringify({ ids }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CERTIFICATE_QUERY_KEYS.all });
    },
  });
}
