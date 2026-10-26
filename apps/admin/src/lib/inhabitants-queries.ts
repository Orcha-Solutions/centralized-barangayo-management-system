"use client";

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@cbms/api-client";
import type { Inhabitant } from "./types";

export interface InhabitantsQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  purok?: string;
  sector?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface InhabitantsPaginatedResponse {
  data: Inhabitant[];
  total: number;
  limit: number;
  offset: number;
}

export interface InhabitantStatsResponse {
  barangayId?: string;
  totalInhabitants: number;
  totalHouseholds: number;
  totalSeniors: number;
  totalPwd: number;
  totalSoloParents: number;
  total4Ps: number;
  totalVoters: number;
}

export const INHABITANTS_QUERY_KEYS = {
  all: ["inhabitants"] as const,
  list: (params: InhabitantsQueryParams) => {
    // Only commit search to query key if >= 3 characters (or empty)
    const validSearch = (params.search?.trim().length ?? 0) >= 3 ? params.search!.trim() : "";
    return [
      "inhabitants",
      "list",
      {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 25,
        search: validSearch,
        purok: params.purok ?? "all",
        sector: params.sector ?? "all",
        sortBy: params.sortBy ?? "name",
        sortOrder: params.sortOrder ?? "asc",
      },
    ] as const;
  },
  stats: ["inhabitants", "stats"] as const,
  detail: (id: string) => ["inhabitants", "detail", id] as const,
};

/**
 * Server-side paginated & filtered inhabitants query conforming to Golang backend.
 * Search parameter is only transmitted if at least 3 characters are provided.
 */
export function useInhabitantsQuery(params: InhabitantsQueryParams) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 25;
  const rawSearch = params.search?.trim() ?? "";
  const activeSearch = rawSearch.length >= 3 ? rawSearch : "";
  const purok = params.purok ?? "all";
  const sector = params.sector ?? "all";
  const sortBy = params.sortBy ?? "name";
  const sortOrder = params.sortOrder ?? "asc";

  return useQuery<InhabitantsPaginatedResponse>({
    queryKey: INHABITANTS_QUERY_KEYS.list({ page, pageSize, search: activeSearch, purok, sector, sortBy, sortOrder }),
    queryFn: async () => {
      const offset = (page - 1) * pageSize;
      const searchParams = new URLSearchParams();
      searchParams.set("paginated", "true");
      searchParams.set("limit", String(pageSize));
      searchParams.set("offset", String(offset));

      if (activeSearch) {
        searchParams.set("search", activeSearch);
      }
      if (purok && purok !== "all") {
        searchParams.set("purok", purok);
      }
      if (sector === "senior") {
        searchParams.set("isSenior", "true");
      } else if (sector === "pwd") {
        searchParams.set("isPwd", "true");
      } else if (sector === "solo_parent") {
        searchParams.set("isSoloParent", "true");
      } else if (sector === "4ps") {
        searchParams.set("is4Ps", "true");
      }

      if (sortBy) {
        searchParams.set("sortBy", sortBy);
        searchParams.set("sortOrder", sortOrder);
      }

      const res = await get<InhabitantsPaginatedResponse>(`/inhabitants?${searchParams.toString()}`);
      if (Array.isArray(res)) {
        return {
          data: res,
          total: res.length,
          limit: pageSize,
          offset,
        };
      }
      return {
        data: res?.data ?? [],
        total: res?.total ?? (res?.data ? res.data.length : 0),
        limit: res?.limit ?? pageSize,
        offset: res?.offset ?? offset,
      };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 10_000,
  });
}


export interface InfiniteInhabitantsParams {
  pageSize?: number;
  search?: string;
  purok?: string;
  sector?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Server-side infinite scrolling & lazy loading query for inhabitants.
 * Loads records in batches with a minimum of 20 records per request.
 */
export function useInfiniteInhabitantsQuery(params: InfiniteInhabitantsParams) {
  const pageSize = Math.max(20, params.pageSize ?? 20);
  const rawSearch = params.search?.trim() ?? "";
  const activeSearch = rawSearch.length >= 3 ? rawSearch : "";
  const purok = params.purok ?? "all";
  const sector = params.sector ?? "all";
  const sortBy = params.sortBy ?? "name";
  const sortOrder = params.sortOrder ?? "asc";

  return useInfiniteQuery<InhabitantsPaginatedResponse>({
    queryKey: [
      "inhabitants",
      "infinite",
      {
        pageSize,
        search: activeSearch,
        purok,
        sector,
        sortBy,
        sortOrder,
      },
    ] as const,
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const offset = typeof pageParam === "number" ? pageParam : 0;
      const searchParams = new URLSearchParams();
      searchParams.set("paginated", "true");
      searchParams.set("limit", String(pageSize));
      searchParams.set("offset", String(offset));

      if (activeSearch) searchParams.set("search", activeSearch);
      if (purok && purok !== "all") searchParams.set("purok", purok);
      if (sector === "senior") searchParams.set("isSenior", "true");
      else if (sector === "pwd") searchParams.set("isPwd", "true");
      else if (sector === "solo_parent") searchParams.set("isSoloParent", "true");
      else if (sector === "4ps") searchParams.set("is4Ps", "true");

      if (sortBy) {
        searchParams.set("sortBy", sortBy);
        searchParams.set("sortOrder", sortOrder);
      }

      const res = await get<InhabitantsPaginatedResponse>(`/inhabitants?${searchParams.toString()}`);
      if (Array.isArray(res)) {
        return {
          data: res,
          total: res.length,
          limit: pageSize,
          offset,
        };
      }
      return {
        data: res?.data ?? [],
        total: res?.total ?? (res?.data ? res.data.length : 0),
        limit: res?.limit ?? pageSize,
        offset: res?.offset ?? offset,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage?.data || lastPage.data.length === 0) {
        return undefined;
      }
      const loadedCount = allPages.reduce((acc, p) => acc + (p.data?.length ?? 0), 0);
      const total = lastPage?.total ?? 0;
      if (loadedCount < total) {
        return loadedCount;
      }
      return undefined;
    },
    staleTime: 10_000,
  });
}

/**
 * Demographic stats query from `/api/inhabitants/stats` (Golang backend).
 */
export function useInhabitantStatsQuery() {
  return useQuery<InhabitantStatsResponse>({
    queryKey: INHABITANTS_QUERY_KEYS.stats,
    queryFn: async () => {
      return get<InhabitantStatsResponse>("/inhabitants/stats");
    },
    staleTime: 30_000,
  });
}

/**
 * Single inhabitant detail query.
 */
export function useInhabitantDetailQuery(id?: string | null) {
  return useQuery<Inhabitant>({
    queryKey: INHABITANTS_QUERY_KEYS.detail(id ?? ""),
    queryFn: async () => {
      if (!id) throw new Error("Inhabitant ID required");
      return get<Inhabitant>(`/inhabitants/${id}`);
    },
    enabled: !!id,
  });
}

/**
 * Mutation for creating a new inhabitant via Golang backend (`POST /api/inhabitants`).
 */
export function useCreateInhabitantMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Inhabitant>) => {
      return post<Inhabitant>("/inhabitants", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INHABITANTS_QUERY_KEYS.all });
    },
  });
}

/**
 * Mutation for bulk registering inhabitants via Golang backend (`POST /api/inhabitants/bulk`).
 * Executes a single multi-row batch insert in PostgreSQL without N+1 queries.
 */
export function useBulkCreateInhabitantsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Inhabitant>[]) => {
      return post<{ message: string; count: number; data: Inhabitant[] }>("/inhabitants/bulk", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INHABITANTS_QUERY_KEYS.all });
    },
  });
}

/**
 * Mutation for updating an inhabitant via Golang backend (`PATCH /api/inhabitants/:id`).
 */
export function useUpdateInhabitantMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Inhabitant> }) => {
      return patch<Inhabitant>(`/inhabitants/${id}`, data);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: INHABITANTS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: INHABITANTS_QUERY_KEYS.detail(vars.id) });
    },
  });
}

/**
 * Mutation for deleting an inhabitant via Golang backend (`DELETE /api/inhabitants/:id`).
 */
export function useDeleteInhabitantMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return del(`/inhabitants/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INHABITANTS_QUERY_KEYS.all });
    },
  });
}
