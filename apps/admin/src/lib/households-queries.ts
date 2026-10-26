"use client";

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, api, del } from "@cbms/api-client";
import type { Household } from "./types";

export interface HouseholdsQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  purok?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface HouseholdsPaginatedResponse {
  data: Household[];
  total: number;
  limit: number;
  offset: number;
}

export const HOUSEHOLDS_QUERY_KEYS = {
  all: ["households"] as const,
  list: (params: HouseholdsQueryParams) => {
    const validSearch = (params.search?.trim().length ?? 0) >= 3 ? params.search!.trim() : "";
    return [
      "households",
      "list",
      {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        search: validSearch,
        purok: params.purok ?? "all",
        sortBy: params.sortBy ?? "householdNo",
        sortOrder: params.sortOrder ?? "asc",
      },
    ] as const;
  },
  infinite: (params: InfiniteHouseholdsParams) => {
    const validSearch = (params.search?.trim().length ?? 0) >= 3 ? params.search!.trim() : "";
    return [
      "households",
      "infinite",
      {
        pageSize: params.pageSize ?? 20,
        search: validSearch,
        purok: params.purok ?? "all",
        sortBy: params.sortBy ?? "householdNo",
        sortOrder: params.sortOrder ?? "asc",
      },
    ] as const;
  },
  detail: (id: string) => ["households", "detail", id] as const,
};

export interface InfiniteHouseholdsParams {
  pageSize?: number;
  search?: string;
  purok?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Server-side infinite scrolling & lazy loading query for households (BIMS Form A1).
 * Loads records in batches with a minimum of 20 records per request.
 * Search queries trigger ONLY when at least 3 characters are inputted.
 */
export function useInfiniteHouseholdsQuery(params: InfiniteHouseholdsParams) {
  const pageSize = Math.max(20, params.pageSize ?? 20);
  const rawSearch = params.search?.trim() ?? "";
  const activeSearch = rawSearch.length >= 3 ? rawSearch : "";
  const purok = params.purok ?? "all";
  const sortBy = params.sortBy ?? "householdNo";
  const sortOrder = params.sortOrder ?? "asc";

  return useInfiniteQuery<HouseholdsPaginatedResponse>({
    queryKey: HOUSEHOLDS_QUERY_KEYS.infinite({
      pageSize,
      search: activeSearch,
      purok,
      sortBy,
      sortOrder,
    }),
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const offset = typeof pageParam === "number" ? pageParam : 0;
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
      if (sortBy) {
        searchParams.set("sortBy", sortBy);
        searchParams.set("sortOrder", sortOrder);
      }

      const res = await get<HouseholdsPaginatedResponse>(`/households?${searchParams.toString()}`);
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
 * Standard paginated households query.
 */
export function useHouseholdsQuery(params: HouseholdsQueryParams) {
  const page = params.page ?? 1;
  const pageSize = Math.max(20, params.pageSize ?? 20);
  const rawSearch = params.search?.trim() ?? "";
  const activeSearch = rawSearch.length >= 3 ? rawSearch : "";
  const purok = params.purok ?? "all";
  const sortBy = params.sortBy ?? "householdNo";
  const sortOrder = params.sortOrder ?? "asc";

  return useQuery<HouseholdsPaginatedResponse>({
    queryKey: HOUSEHOLDS_QUERY_KEYS.list({ page, pageSize, search: activeSearch, purok, sortBy, sortOrder }),
    queryFn: async () => {
      const offset = (page - 1) * pageSize;
      const searchParams = new URLSearchParams();
      searchParams.set("paginated", "true");
      searchParams.set("limit", String(pageSize));
      searchParams.set("offset", String(offset));

      if (activeSearch) searchParams.set("search", activeSearch);
      if (purok && purok !== "all") searchParams.set("purok", purok);
      if (sortBy) {
        searchParams.set("sortBy", sortBy);
        searchParams.set("sortOrder", sortOrder);
      }

      const res = await get<HouseholdsPaginatedResponse>(`/households?${searchParams.toString()}`);
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

/**
 * Single household detail query.
 */
export function useHouseholdDetailQuery(id?: string | null) {
  return useQuery<Household>({
    queryKey: HOUSEHOLDS_QUERY_KEYS.detail(id ?? ""),
    queryFn: async () => {
      if (!id) throw new Error("Household ID required");
      return get<Household>(`/households/${id}`);
    },
    enabled: !!id,
  });
}

/**
 * Mutation for single household creation.
 */
export function useCreateHouseholdMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Household>) => {
      return post<Household>("/households", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOUSEHOLDS_QUERY_KEYS.all });
    },
  });
}

/**
 * Mutation for bulk household creation.
 */
export function useBulkCreateHouseholdsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Household>[]) => {
      return post<{ message: string; count: number; data: Household[] }>("/households/bulk", {
        households: payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOUSEHOLDS_QUERY_KEYS.all });
    },
  });
}

/**
 * Mutation for updating a household.
 */
export function useUpdateHouseholdMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Household> }) => {
      return api<Household>(`/households/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: HOUSEHOLDS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: HOUSEHOLDS_QUERY_KEYS.detail(vars.id) });
    },
  });
}

/**
 * Mutation for single household deletion.
 */
export function useDeleteHouseholdMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return del(`/households/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOUSEHOLDS_QUERY_KEYS.all });
    },
  });
}

/**
 * Mutation for bulk household deletion.
 */
export function useBulkDeleteHouseholdsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      return api<{ message: string; count: number }>("/households/bulk", {
        method: "DELETE",
        body: JSON.stringify({ ids }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOUSEHOLDS_QUERY_KEYS.all });
    },
  });
}
