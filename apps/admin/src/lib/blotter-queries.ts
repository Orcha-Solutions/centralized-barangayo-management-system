"use client";

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, api, del } from "@cbms/api-client";
import type { BlotterEntry, BlotterActionLog } from "./types";

export interface BlottersQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface BlottersPaginatedResponse {
  data: BlotterEntry[];
  total: number;
  limit: number;
  offset: number;
  page?: number;
}

export const BLOTTER_QUERY_KEYS = {
  all: ["blotters"] as const,
  list: (params: BlottersQueryParams) => {
    const validSearch = (params.search?.trim().length ?? 0) >= 3 ? params.search!.trim() : "";
    return [
      "blotters",
      "list",
      {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        search: validSearch,
        category: params.category ?? "all",
        status: params.status ?? "all",
        sortBy: params.sortBy ?? "incidentAt",
        sortOrder: params.sortOrder ?? "desc",
      },
    ] as const;
  },
  infinite: (params: InfiniteBlottersParams) => {
    const validSearch = (params.search?.trim().length ?? 0) >= 3 ? params.search!.trim() : "";
    return [
      "blotters",
      "infinite",
      {
        pageSize: params.pageSize ?? 20,
        search: validSearch,
        category: params.category ?? "all",
        status: params.status ?? "all",
        sortBy: params.sortBy ?? "incidentAt",
        sortOrder: params.sortOrder ?? "desc",
      },
    ] as const;
  },
  detail: (id: string) => ["blotters", "detail", id] as const,
  actions: (blotterId: string) => ["blotters", "detail", blotterId, "actions"] as const,
};

export interface InfiniteBlottersParams {
  pageSize?: number;
  search?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Server-side infinite scrolling & lazy loading query for official incident blotters (KPISBH parity).
 * Loads records in batches with a minimum of 20 records per request.
 * Search queries trigger ONLY when at least 3 characters are inputted.
 */
export function useInfiniteBlottersQuery(params: InfiniteBlottersParams) {
  const pageSize = Math.max(20, params.pageSize ?? 20);
  const rawSearch = params.search?.trim() ?? "";
  const activeSearch = rawSearch.length >= 3 ? rawSearch : "";
  const category = params.category ?? "all";
  const status = params.status ?? "all";
  const sortBy = params.sortBy ?? "incidentAt";
  const sortOrder = params.sortOrder ?? "desc";

  return useInfiniteQuery<BlottersPaginatedResponse>({
    queryKey: BLOTTER_QUERY_KEYS.infinite({
      pageSize,
      search: activeSearch,
      category,
      status,
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
      if (category && category !== "all") {
        searchParams.set("category", category);
      }
      if (status && status !== "all") {
        searchParams.set("status", status);
      }
      if (sortBy) {
        searchParams.set("sortBy", sortBy);
        searchParams.set("sortOrder", sortOrder);
      }

      const res = await get<BlottersPaginatedResponse>(`/blotters?${searchParams.toString()}`);
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
 * Standard single blotter detail query.
 */
export function useBlotterDetailQuery(id?: string | null) {
  return useQuery<BlotterEntry>({
    queryKey: BLOTTER_QUERY_KEYS.detail(id ?? ""),
    queryFn: async () => {
      if (!id) throw new Error("Blotter ID required");
      return get<BlotterEntry>(`/blotters/${id}`);
    },
    enabled: !!id,
  });
}

/**
 * Mutation for single incident blotter creation.
 */
export function useCreateBlotterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<BlotterEntry>) => {
      return post<BlotterEntry>("/blotters", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOTTER_QUERY_KEYS.all });
    },
  });
}

/**
 * Mutation for updating an incident blotter.
 */
export function useUpdateBlotterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BlotterEntry> }) => {
      return api<BlotterEntry>(`/blotters/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: BLOTTER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: BLOTTER_QUERY_KEYS.detail(vars.id) });
    },
  });
}

/**
 * Mutation for single blotter deletion.
 */
export function useDeleteBlotterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return del(`/blotters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOTTER_QUERY_KEYS.all });
    },
  });
}

/**
 * Mutation for bulk blotter creation.
 */
export function useBulkCreateBlottersMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<BlotterEntry>[]) => {
      return post<{ message: string; count: number; data: BlotterEntry[] }>("/blotters/bulk", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOTTER_QUERY_KEYS.all });
    },
  });
}

/**
 * Mutation for bulk blotter deletion.
 */
export function useBulkDeleteBlottersMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      return api<{ message: string; count: number }>("/blotters/bulk", {
        method: "DELETE",
        body: JSON.stringify({ ids }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOTTER_QUERY_KEYS.all });
    },
  });
}

/**
 * Query for retrieving blotter action history timeline.
 */
export function useBlotterActionsQuery(blotterId: string) {
  return useQuery<BlotterActionLog[]>({
    queryKey: BLOTTER_QUERY_KEYS.actions(blotterId),
    queryFn: async () => {
      if (!blotterId) return [];
      return get<BlotterActionLog[]>(`/blotters/${blotterId}/actions`);
    },
    enabled: !!blotterId,
  });
}

/**
 * Mutation for recording a new blotter follow-up action.
 */
export function useCreateBlotterActionMutation(blotterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      actionTaken: string;
      officerName: string;
      officerRole: string;
      statusAfter?: string;
      documentRef?: string;
      notes: string;
      timestamp?: string;
    }) => {
      return post<BlotterActionLog>(`/blotters/${blotterId}/actions`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOTTER_QUERY_KEYS.actions(blotterId) });
      queryClient.invalidateQueries({ queryKey: BLOTTER_QUERY_KEYS.detail(blotterId) });
      queryClient.invalidateQueries({ queryKey: BLOTTER_QUERY_KEYS.all });
    },
  });
}

/**
 * Mutation for updating an existing blotter action record.
 */
export function useUpdateBlotterActionMutation(blotterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      actionId,
      data,
    }: {
      actionId: string;
      data: Partial<BlotterActionLog>;
    }) => {
      return api<BlotterActionLog>(`/blotters/${blotterId}/actions/${actionId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOTTER_QUERY_KEYS.actions(blotterId) });
      queryClient.invalidateQueries({ queryKey: BLOTTER_QUERY_KEYS.detail(blotterId) });
      queryClient.invalidateQueries({ queryKey: BLOTTER_QUERY_KEYS.all });
    },
  });
}

/**
 * Mutation for deleting a blotter action record.
 */
export function useDeleteBlotterActionMutation(blotterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (actionId: string) => {
      return del(`/blotters/${blotterId}/actions/${actionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOTTER_QUERY_KEYS.actions(blotterId) });
      queryClient.invalidateQueries({ queryKey: BLOTTER_QUERY_KEYS.detail(blotterId) });
      queryClient.invalidateQueries({ queryKey: BLOTTER_QUERY_KEYS.all });
    },
  });
}
