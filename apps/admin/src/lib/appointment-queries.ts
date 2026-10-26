"use client";

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, api, del } from "@cbms/api-client";
import type { Appointment } from "./types";

export interface AppointmentsQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  service?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AppointmentsPaginatedResponse {
  data: Appointment[];
  total: number;
  limit: number;
  offset: number;
  page?: number;
}

export interface InfiniteAppointmentsParams {
  pageSize?: number;
  search?: string;
  service?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const APPOINTMENT_QUERY_KEYS = {
  all: ["appointments"] as const,
  infinite: (params: InfiniteAppointmentsParams) => {
    const validSearch = (params.search?.trim().length ?? 0) >= 3 ? params.search!.trim() : "";
    return [
      "appointments",
      "infinite",
      {
        pageSize: params.pageSize ?? 20,
        search: validSearch,
        service: params.service ?? "all",
        status: params.status ?? "all",
        sortBy: params.sortBy ?? "scheduledAt",
        sortOrder: params.sortOrder ?? "desc",
      },
    ] as const;
  },
  detail: (id: string) => ["appointments", "detail", id] as const,
};

/**
 * Server-side infinite scrolling & lazy loading query for Appointments.
 * Loads records with a minimum of 20 records per request.
 * Search queries trigger ONLY when at least 3 characters are inputted.
 */
export function useInfiniteAppointmentsQuery(params: InfiniteAppointmentsParams) {
  const pageSize = Math.max(20, params.pageSize ?? 20);
  const rawSearch = params.search?.trim() ?? "";
  const activeSearch = rawSearch.length >= 3 ? rawSearch : "";
  const service = params.service ?? "all";
  const status = params.status ?? "all";
  const sortBy = params.sortBy ?? "scheduledAt";
  const sortOrder = params.sortOrder ?? "desc";

  return useInfiniteQuery<AppointmentsPaginatedResponse>({
    queryKey: APPOINTMENT_QUERY_KEYS.infinite({
      pageSize,
      search: activeSearch,
      service,
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
      if (service && service !== "all") {
        searchParams.set("service", service);
      }
      if (status && status !== "all") {
        searchParams.set("status", status);
      }
      if (sortBy) {
        searchParams.set("sortBy", sortBy);
        searchParams.set("sortOrder", sortOrder);
      }

      const res = await get<AppointmentsPaginatedResponse>(`/appointments?${searchParams.toString()}`);
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
 * Standard single appointment detail query.
 */
export function useAppointmentDetailQuery(id?: string | null) {
  return useQuery<Appointment>({
    queryKey: APPOINTMENT_QUERY_KEYS.detail(id ?? ""),
    queryFn: async () => {
      if (!id) throw new Error("Appointment ID required");
      return get<Appointment>(`/appointments/${id}`);
    },
    enabled: !!id,
  });
}

/**
 * Mutation for single appointment booking.
 */
export function useCreateAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      service: string;
      scheduledAt: string;
      inhabitantId?: string;
      queueNumber?: string;
      status?: string;
      notes?: string;
    }) => {
      return post<Appointment>("/appointments", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENT_QUERY_KEYS.all });
    },
  });
}

/**
 * Mutation for updating an appointment.
 */
export function useUpdateAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Appointment>;
    }) => {
      return api<Appointment>(`/appointments/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: APPOINTMENT_QUERY_KEYS.detail(vars.id) });
    },
  });
}

/**
 * Mutation for single appointment deletion.
 */
export function useDeleteAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return del(`/appointments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENT_QUERY_KEYS.all });
    },
  });
}

/**
 * Mutation for bulk appointment creation.
 */
export function useBulkCreateAppointmentsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Appointment>[]) => {
      return post<{ message: string; count: number; data: Appointment[] }>("/appointments/bulk", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENT_QUERY_KEYS.all });
    },
  });
}

/**
 * Mutation for bulk appointment deletion.
 */
export function useBulkDeleteAppointmentsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      return api<{ message: string; count: number }>("/appointments/bulk", {
        method: "DELETE",
        body: JSON.stringify({ ids }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENT_QUERY_KEYS.all });
    },
  });
}
