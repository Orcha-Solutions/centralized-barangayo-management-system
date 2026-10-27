"use client";

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, put, api, del } from "@cbms/api-client";
import type { KpCase, KpAtRisk, KpHearing } from "./types";

export interface KpCasesQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  stage?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface KpCasesPaginatedResponse {
  data: KpCase[];
  items?: KpCase[];
  total: number;
  limit: number;
  offset: number;
  page?: number;
}

export interface InfiniteKpCasesParams {
  pageSize?: number;
  search?: string;
  stage?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface KpDeadlinesResponse {
  items: KpAtRisk[];
  total: number;
  breached: number;
  nearWarning: number;
}

export const KP_QUERY_KEYS = {
  all: ["kp"] as const,
  infinite: (params: InfiniteKpCasesParams) => {
    const validSearch = (params.search?.trim().length ?? 0) >= 3 ? params.search!.trim() : "";
    return [
      "kp",
      "infinite",
      {
        pageSize: params.pageSize ?? 20,
        search: validSearch,
        stage: params.stage ?? "all",
        sortBy: params.sortBy ?? "filedAt",
        sortOrder: params.sortOrder ?? "desc",
      },
    ] as const;
  },
  detail: (id: string) => ["kp", "detail", id] as const,
  deadlines: () => ["kp", "deadlines"] as const,
};

/**
 * Server-side infinite scrolling & lazy loading query for KP Cases.
 * Loads cases with a minimum of 20 records per request.
 * Search queries trigger ONLY when at least 3 characters are inputted.
 */
export function useInfiniteKpCasesQuery(params: InfiniteKpCasesParams) {
  const pageSize = Math.max(20, params.pageSize ?? 20);
  const rawSearch = params.search?.trim() ?? "";
  const activeSearch = rawSearch.length >= 3 ? rawSearch : "";
  const stage = params.stage ?? "all";
  const sortBy = params.sortBy ?? "filedAt";
  const sortOrder = params.sortOrder ?? "desc";

  return useInfiniteQuery<KpCasesPaginatedResponse>({
    queryKey: KP_QUERY_KEYS.infinite({
      pageSize,
      search: activeSearch,
      stage,
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
      if (stage && stage !== "all") {
        searchParams.set("stage", stage);
      }
      if (sortBy) {
        searchParams.set("sortBy", sortBy);
        searchParams.set("sortOrder", sortOrder);
      }

      const res = await get<KpCasesPaginatedResponse>(`/kp/cases?${searchParams.toString()}`);
      if (Array.isArray(res)) {
        return {
          data: res,
          items: res,
          total: res.length,
          limit: pageSize,
          offset,
        };
      }
      const dataList = res?.data ?? res?.items ?? [];
      return {
        data: dataList,
        items: dataList,
        total: res?.total ?? dataList.length,
        limit: res?.limit ?? pageSize,
        offset: res?.offset ?? offset,
        page: res?.page,
      };
    },
    getNextPageParam: (lastPage) => {
      const currentLoaded = (lastPage.offset ?? 0) + (lastPage.data?.length ?? 0);
      if (currentLoaded < lastPage.total) {
        return currentLoaded;
      }
      return undefined;
    },
    staleTime: 1000 * 60, // 1 minute fresh cache
  });
}

/**
 * Hook to retrieve a single KP case detail by UUID.
 */
export function useKpCaseDetailQuery(id: string) {
  return useQuery<KpCase>({
    queryKey: KP_QUERY_KEYS.detail(id),
    queryFn: async () => {
      return get<KpCase>(`/kp/cases/${id}`);
    },
    enabled: Boolean(id),
    staleTime: 1000 * 60,
  });
}

/**
 * Hook to retrieve statutory deadlines and at-risk dispute metrics.
 */
export function useKpDeadlinesQuery() {
  return useQuery<KpDeadlinesResponse>({
    queryKey: KP_QUERY_KEYS.deadlines(),
    queryFn: async () => {
      return get<KpDeadlinesResponse>("/kp/deadlines");
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Mutation for filing a new KP Case.
 */
export function useCreateKpCaseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      subject: string;
      description: string;
      respondentName?: string;
      complainantName?: string;
      isConfidential?: boolean;
    }) => {
      return post<KpCase>("/kp/cases", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KP_QUERY_KEYS.all });
    },
  });
}

/**
 * Mutation for updating an existing KP case.
 */
export function useUpdateKpCaseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<KpCase>;
    }) => {
      return api<KpCase>(`/kp/cases/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: KP_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: KP_QUERY_KEYS.detail(vars.id) });
    },
  });
}

/**
 * Mutation for locking or unlocking a KP case docket.
 */
export function useToggleKpCaseLockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isLocked }: { id: string; isLocked?: boolean }) => {
      return put<KpCase>(`/kp/cases/${id}/lock`, isLocked !== undefined ? { isLocked } : {});
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: KP_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: KP_QUERY_KEYS.detail(vars.id) });
    },
  });
}

/**
 * Mutation for advancing case statutory stage (e.g. conciliation, settled, cfa_issued).
 */
export function useAdvanceKpStageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      stage,
      settlementTerms,
      cfaReason,
      pangkatMembers,
      extendDays,
    }: {
      id: string;
      stage: string;
      settlementTerms?: string;
      cfaReason?: string;
      pangkatMembers?: string[];
      extendDays?: number;
    }) => {
      return post<KpCase>(`/kp/cases/${id}/advance`, {
        stage,
        settlementTerms,
        cfaReason,
        pangkatMembers,
        extendDays,
      });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: KP_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: KP_QUERY_KEYS.detail(vars.id) });
    },
  });
}

/**
 * Mutation for scheduling a mediation or conciliation hearing.
 */
export function useScheduleKpHearingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      scheduledAt,
      stage,
      minutes,
      outcome,
    }: {
      id: string;
      scheduledAt: string;
      stage: string;
      minutes?: string;
      outcome?: string;
    }) => {
      return post<KpHearing>(`/kp/cases/${id}/hearings`, {
        scheduledAt,
        stage,
        minutes,
        outcome,
      });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: KP_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: KP_QUERY_KEYS.detail(vars.id) });
    },
  });
}

/**
 * Mutation for single KP case deletion.
 */
export function useDeleteKpCaseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return del(`/kp/cases/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KP_QUERY_KEYS.all });
    },
  });
}

/**
 * Mutation for bulk KP cases deletion.
 */
export function useBulkDeleteKpCasesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      return api<{ message: string; count: number }>("/kp/cases/bulk", {
        method: "DELETE",
        body: JSON.stringify({ ids }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KP_QUERY_KEYS.all });
    },
  });
}
