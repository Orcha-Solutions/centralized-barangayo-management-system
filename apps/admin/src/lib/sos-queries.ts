"use client";

import * as React from "react";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del, API_URL, getToken, getStoredTenant, getStoredUser } from "@cbms/api-client";
import type { SosAlert, SosStats, SosDispatchHistory } from "./types";

export interface SosQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  kind?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SosHistoryQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  alertId?: string;
  action?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SosHistoryPaginatedResponse {
  data: SosDispatchHistory[];
  items?: SosDispatchHistory[];
  total: number;
  limit: number;
  offset: number;
  page?: number;
  pageSize?: number;
}

export interface InfiniteSosHistoryParams {
  pageSize?: number;
  search?: string;
  alertId?: string;
  action?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SosPaginatedResponse {
  data: SosAlert[];
  items?: SosAlert[];
  total: number;
  limit: number;
  offset: number;
  page?: number;
  pageSize?: number;
}

export interface InfiniteSosParams {
  pageSize?: number;
  search?: string;
  status?: string;
  kind?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateSosPayload {
  inhabitantId?: string | null;
  kind: string;
  latitude?: number | null;
  longitude?: number | null;
  note: string;
  isTest?: boolean;
}

export interface UpdateSosPayload {
  status?: string;
  kind?: string;
  note?: string;
  latitude?: number | null;
  longitude?: number | null;
  respondedById?: string;
  responseNote?: string;
}

export const SOS_QUERY_KEYS = {
  all: ["sos-alerts"] as const,
  list: (params: SosQueryParams) => {
    const validSearch = (params.search?.trim().length ?? 0) >= 3 ? params.search!.trim() : "";
    return [
      "sos-alerts",
      "list",
      {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        search: validSearch,
        status: params.status ?? "all",
        kind: params.kind ?? "all",
        sortBy: params.sortBy ?? "createdAt",
        sortOrder: params.sortOrder ?? "desc",
      },
    ] as const;
  },
  infinite: (params: InfiniteSosParams) => {
    const validSearch = (params.search?.trim().length ?? 0) >= 3 ? params.search!.trim() : "";
    return [
      "sos-alerts",
      "infinite",
      {
        pageSize: params.pageSize ?? 20,
        search: validSearch,
        status: params.status ?? "all",
        kind: params.kind ?? "all",
        sortBy: params.sortBy ?? "createdAt",
        sortOrder: params.sortOrder ?? "desc",
      },
    ] as const;
  },
  stats: () => ["sos-stats"] as const,
  detail: (id: string) => ["sos-alerts", "detail", id] as const,
  history: (params: InfiniteSosHistoryParams) => {
    const validSearch = (params.search?.trim().length ?? 0) >= 3 ? params.search!.trim() : "";
    return [
      "sos-history",
      "infinite",
      {
        pageSize: params.pageSize ?? 20,
        search: validSearch,
        alertId: params.alertId ?? "all",
        action: params.action ?? "all",
        sortBy: params.sortBy ?? "createdAt",
        sortOrder: params.sortOrder ?? "desc",
      },
    ] as const;
  },
  alertHistory: (alertId: string) => ["sos-history", "alert", alertId] as const,
};

/**
 * Server-side infinite scroll & lazy loading query for emergency SOS alerts.
 * Minimum batch: 20 records.
 * Search threshold: Triggers only when >= 3 characters are entered.
 */
export function useInfiniteSosAlertsQuery(params: InfiniteSosParams) {
  const pageSize = Math.max(20, params.pageSize ?? 20);
  const rawSearch = params.search?.trim() ?? "";
  const activeSearch = rawSearch.length >= 3 ? rawSearch : "";
  const status = params.status ?? "all";
  const kind = params.kind ?? "all";
  const sortBy = params.sortBy ?? "createdAt";
  const sortOrder = params.sortOrder ?? "desc";

  return useInfiniteQuery<SosPaginatedResponse>({
    queryKey: SOS_QUERY_KEYS.infinite({
      pageSize,
      search: activeSearch,
      status,
      kind,
      sortBy,
      sortOrder,
    }),
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const page = typeof pageParam === "number" ? pageParam : 1;
      const searchParams = new URLSearchParams();
      searchParams.set("page", String(page));
      searchParams.set("pageSize", String(pageSize));

      if (activeSearch) {
        searchParams.set("search", activeSearch);
      }
      if (status && status !== "all") {
        searchParams.set("status", status);
      }
      if (kind && kind !== "all") {
        searchParams.set("kind", kind);
      }
      if (sortBy) {
        searchParams.set("sortBy", sortBy);
        searchParams.set("sortOrder", sortOrder);
      }

      const res = await get<SosPaginatedResponse>(`/sos?${searchParams.toString()}`);
      if (Array.isArray(res)) {
        return {
          data: res,
          items: res,
          total: res.length,
          limit: pageSize,
          offset: (page - 1) * pageSize,
          page,
          pageSize,
        };
      }
      const dataRows = res?.data ?? res?.items ?? [];
      return {
        data: dataRows,
        items: dataRows,
        total: Number(res?.total ?? dataRows.length),
        limit: res?.limit ?? pageSize,
        offset: res?.offset ?? (page - 1) * pageSize,
        page: res?.page ?? page,
        pageSize: res?.pageSize ?? pageSize,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const currentRows = lastPage?.data ?? lastPage?.items ?? [];
      if (currentRows.length === 0) return undefined;

      const loadedCount = allPages.reduce((acc, p) => acc + (p.data?.length ?? p.items?.length ?? 0), 0);
      const total = Number(lastPage?.total ?? 0);
      if (loadedCount < total) {
        return allPages.length + 1;
      }
      return undefined;
    },
    staleTime: 5_000,
  });
}

/**
 * Hook to retrieve emergency dispatch metrics & KPIs
 */
export function useSosStatsQuery() {
  return useQuery<SosStats>({
    queryKey: SOS_QUERY_KEYS.stats(),
    queryFn: async () => {
      return await get<SosStats>("/sos/stats");
    },
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to retrieve single SOS alert details
 */
export function useSosDetailQuery(id?: string | null) {
  return useQuery<SosAlert>({
    queryKey: SOS_QUERY_KEYS.detail(id ?? ""),
    queryFn: async () => {
      if (!id) throw new Error("Alert ID is required");
      return await get<SosAlert>(`/sos/${id}`);
    },
    enabled: !!id,
    staleTime: 10_000,
  });
}

/**
 * Server-side infinite scroll & lazy loading query for SOS dispatch history & audit logs.
 */
export function useInfiniteSosHistoryQuery(params: InfiniteSosHistoryParams) {
  const pageSize = Math.max(20, params.pageSize ?? 20);
  const rawSearch = params.search?.trim() ?? "";
  const activeSearch = rawSearch.length >= 3 ? rawSearch : "";
  const alertId = params.alertId ?? "all";
  const action = params.action ?? "all";
  const sortBy = params.sortBy ?? "createdAt";
  const sortOrder = params.sortOrder ?? "desc";

  return useInfiniteQuery<SosHistoryPaginatedResponse>({
    queryKey: SOS_QUERY_KEYS.history({
      pageSize,
      search: activeSearch,
      alertId,
      action,
      sortBy,
      sortOrder,
    }),
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const page = typeof pageParam === "number" ? pageParam : 1;
      const searchParams = new URLSearchParams();
      searchParams.set("page", String(page));
      searchParams.set("pageSize", String(pageSize));

      if (activeSearch) {
        searchParams.set("search", activeSearch);
      }
      if (alertId && alertId !== "all") {
        searchParams.set("alertId", alertId);
      }
      if (action && action !== "all") {
        searchParams.set("action", action);
      }
      if (sortBy) {
        searchParams.set("sortBy", sortBy);
        searchParams.set("sortOrder", sortOrder);
      }

      const res = await get<SosHistoryPaginatedResponse>(`/sos/history?${searchParams.toString()}`);
      if (Array.isArray(res)) {
        return {
          data: res,
          items: res,
          total: res.length,
          limit: pageSize,
          offset: (page - 1) * pageSize,
          page,
          pageSize,
        };
      }
      const dataRows = res?.data ?? res?.items ?? [];
      return {
        data: dataRows,
        items: dataRows,
        total: Number(res?.total ?? dataRows.length),
        limit: res?.limit ?? pageSize,
        offset: res?.offset ?? (page - 1) * pageSize,
        page: res?.page ?? page,
        pageSize: res?.pageSize ?? pageSize,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const currentRows = lastPage?.data ?? lastPage?.items ?? [];
      if (currentRows.length === 0) return undefined;

      const loadedCount = allPages.reduce((acc, p) => acc + (p.data?.length ?? p.items?.length ?? 0), 0);
      const total = Number(lastPage?.total ?? 0);
      if (loadedCount < total) {
        return allPages.length + 1;
      }
      return undefined;
    },
    staleTime: 5_000,
  });
}

/**
 * Hook to retrieve full sequential timeline for a single alert from backend API
 */
export function useAlertHistoryQuery(alertId?: string | null) {
  return useQuery<SosDispatchHistory[]>({
    queryKey: SOS_QUERY_KEYS.alertHistory(alertId ?? ""),
    queryFn: async () => {
      if (!alertId) return [];
      return await get<SosDispatchHistory[]>(`/sos/${alertId}/history`);
    },
    enabled: !!alertId,
    staleTime: 5_000,
  });
}

/**
 * Mutation for triggering a new emergency SOS alert
 */
export function useCreateSosMutation() {
  const qc = useQueryClient();
  return useMutation<SosAlert, Error, CreateSosPayload>({
    mutationFn: async (payload) => {
      return await post<SosAlert>("/sos", payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SOS_QUERY_KEYS.all });
      qc.invalidateQueries({ queryKey: SOS_QUERY_KEYS.stats() });
      qc.invalidateQueries({ queryKey: ["sos-history"] });
    },
  });
}

/**
 * Mutation for bulk triggering emergency alerts (e.g. disaster simulations)
 */
export function useBulkCreateSosMutation() {
  const qc = useQueryClient();
  return useMutation<SosAlert[], Error, CreateSosPayload[]>({
    mutationFn: async (alerts) => {
      return await post<SosAlert[]>("/sos/bulk", { alerts });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SOS_QUERY_KEYS.all });
      qc.invalidateQueries({ queryKey: SOS_QUERY_KEYS.stats() });
      qc.invalidateQueries({ queryKey: ["sos-history"] });
    },
  });
}

/**
 * Mutation for updating alert status, dispatching responders, or resolving
 */
export function useUpdateSosMutation() {
  const qc = useQueryClient();
  return useMutation<SosAlert, Error, { id: string; data: UpdateSosPayload }>({
    mutationFn: async ({ id, data }) => {
      return await patch<SosAlert>(`/sos/${id}`, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SOS_QUERY_KEYS.all });
      qc.invalidateQueries({ queryKey: SOS_QUERY_KEYS.stats() });
      qc.invalidateQueries({ queryKey: ["sos-history"] });
    },
  });
}

/**
 * Mutation for deleting / dismissing an SOS alert
 */
export function useDeleteSosMutation() {
  const qc = useQueryClient();
  return useMutation<{ message: string; id: string }, Error, string>({
    mutationFn: async (id) => {
      return await del<{ message: string; id: string }>(`/sos/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SOS_QUERY_KEYS.all });
      qc.invalidateQueries({ queryKey: SOS_QUERY_KEYS.stats() });
      qc.invalidateQueries({ queryKey: ["sos-history"] });
    },
  });
}

/**
 * Mutation for bulk deleting SOS alerts
 */
export function useBulkDeleteSosMutation() {
  const qc = useQueryClient();
  return useMutation<{ message: string; count: number }, Error, string[]>({
    mutationFn: async (ids) => {
      return await post<{ message: string; count: number }>("/sos/bulk-delete", { ids });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SOS_QUERY_KEYS.all });
      qc.invalidateQueries({ queryKey: SOS_QUERY_KEYS.stats() });
      qc.invalidateQueries({ queryKey: ["sos-history"] });
    },
  });
}

/**
 * Realtime hook powered by native EventSource (SSE).
 * Automatically invalidates SOS alerts and stats on server events without external libraries.
 */
export function useSosRealtimeStream() {
  const qc = useQueryClient();
  const [connected, setConnected] = React.useState(false);
  const [lastEventAt, setLastEventAt] = React.useState<Date | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof EventSource === "undefined") {
      return;
    }

    const tenant = getStoredTenant()?.id || "tnt-barangka";
    const user = getStoredUser();
    const barangayId = (user as any)?.barangayId || tenant || "brgy-barangka";
    const token = getToken();

    const baseUrl = API_URL || "";
    const streamUrl = `${baseUrl}/api/v1/sos/stream?tenant=${encodeURIComponent(tenant)}&barangayId=${encodeURIComponent(barangayId)}${token ? `&token=${encodeURIComponent(token)}` : ""}`;

    let es: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      try {
        es = new EventSource(streamUrl);

        es.onopen = () => {
          setConnected(true);
        };

        es.onmessage = (e) => {
          setLastEventAt(new Date());
          qc.invalidateQueries({ queryKey: SOS_QUERY_KEYS.all });
          qc.invalidateQueries({ queryKey: SOS_QUERY_KEYS.stats() });
          qc.invalidateQueries({ queryKey: ["sos-history"] });
        };

        // Specific event listeners dispatched by Redis Pub/Sub backend
        const handleEvent = () => {
          setLastEventAt(new Date());
          qc.invalidateQueries({ queryKey: SOS_QUERY_KEYS.all });
          qc.invalidateQueries({ queryKey: SOS_QUERY_KEYS.stats() });
          qc.invalidateQueries({ queryKey: ["sos-history"] });
        };

        es.addEventListener("SOS_ALERT_CREATED", handleEvent);
        es.addEventListener("SOS_ALERT_UPDATED", handleEvent);
        es.addEventListener("SOS_ALERT_RESOLVED", handleEvent);
        es.addEventListener("SOS_ALERT_DELETED", handleEvent);

        es.onerror = () => {
          setConnected(false);
          es?.close();
          // Schedule reconnect attempt in 5 seconds
          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch {
        setConnected(false);
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (es) {
        es.close();
      }
    };
  }, [qc]);

  return { connected, lastEventAt };
}
