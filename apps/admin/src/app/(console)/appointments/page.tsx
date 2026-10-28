"use client";

import * as React from "react";
import { Alert, PageHead } from "@cbms/ui";
import { useConsole } from "../../../components/Shell";
import { Toast } from "../../../components/Toast";
import {
  useInfiniteAppointmentsQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
} from "../../../lib/appointment-queries";
import { AppointmentToolbar } from "./components/AppointmentToolbar";
import { AppointmentTable } from "./components/AppointmentTable";
import { AppointmentCalendar } from "./components/calendar/AppointmentCalendar";
import { AppointmentDrawer, type AppointmentDrawerFormData } from "./components/AppointmentDrawer";
import { DeleteAppointmentModal } from "./components/DeleteAppointmentModal";
import type { Appointment } from "../../../lib/types";

export default function AppointmentsPage() {
  const { can } = useConsole();

  // Auth / RBAC permission validation
  const mayBook =
    can("appointments:book") ||
    can("appointments:write") ||
    can("appointments:manage") ||
    can("appointments:encode");
  const mayManage =
    can("appointments:manage") ||
    can("appointments:write") ||
    can("appointments:encode");

  // Filter & Sorting state
  const [viewMode, setViewMode] = React.useState<"table" | "calendar">("table");
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [service, setService] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("scheduledAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  // Modal / Drawer states
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [editingAppointment, setEditingAppointment] = React.useState<Appointment | null>(null);
  const [bookInitialDate, setBookInitialDate] = React.useState<Date | null>(null);
  const [deletingAppointment, setDeletingAppointment] = React.useState<Appointment | null>(null);
  const [transactingId, setTransactingId] = React.useState<string | null>(null);

  // Toast notification state
  const [toast, setToast] = React.useState<{
    open: boolean;
    message: string;
    description?: string;
    tone: "success" | "danger" | "info";
  }>({
    open: false,
    message: "",
    description: "",
    tone: "success",
  });

  const showToast = (message: string, description?: string, tone: "success" | "danger" | "info" = "success") => {
    setToast({ open: true, message, description, tone });
  };

  // React Query infinite query (min 20 records per batch in table view, 100 in calendar view)
  const pageSize = viewMode === "calendar" ? 100 : 20;
  const {
    data: infiniteData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error: queryError,
  } = useInfiniteAppointmentsQuery({
    pageSize,
    search,
    status,
    service,
    sortBy,
    sortOrder,
  });

  const createMutation = useCreateAppointmentMutation();
  const updateMutation = useUpdateAppointmentMutation();
  const deleteMutation = useDeleteAppointmentMutation();

  // Deduplicate and flatten loaded appointment pages
  const appointments = React.useMemo(() => {
    if (!infiniteData?.pages) return [];
    const list: Appointment[] = [];
    const seen = new Set<string>();
    for (const page of infiniteData.pages) {
      for (const row of page.data ?? []) {
        if (!row.id) {
          list.push(row);
        } else if (!seen.has(row.id)) {
          seen.add(row.id);
          list.push(row);
        }
      }
    }
    return list;
  }, [infiniteData]);

  const totalAppointments = infiniteData?.pages?.[0]?.total ?? appointments.length;

  // Header Sort Handler
  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(columnKey);
      setSortOrder("desc");
    }
  };

  // Submit Booking / Edit
  const handleDrawerSubmit = async (formData: AppointmentDrawerFormData) => {
    if (editingAppointment) {
      await updateMutation.mutateAsync({
        id: editingAppointment.id,
        data: {
          service: formData.service,
          scheduledAt: formData.scheduledAt,
          inhabitantId: formData.inhabitantId || null,
          queueNumber: formData.queueNumber || null,
          status: formData.status || "booked",
          notes: formData.notes || "",
        },
      });
      showToast(
        "Appointment Updated",
        `Ticket ${formData.queueNumber || editingAppointment.queueNumber || "record"} updated successfully.`,
        "success"
      );
    } else {
      const created = await createMutation.mutateAsync({
        service: formData.service,
        scheduledAt: formData.scheduledAt,
        inhabitantId: formData.inhabitantId,
        queueNumber: formData.queueNumber,
        status: formData.status || "booked",
        notes: formData.notes,
      });
      showToast(
        "Appointment Booked",
        `Queue ticket ${created.queueNumber || "scheduled"} created for ${created.service}.`,
        "success"
      );
    }
    setOpenDrawer(false);
    setEditingAppointment(null);
  };

  // Quick Status Transition (Check in, Start serving, Complete, No show)
  const handleMoveStatus = async (appointment: Appointment, newStatus: string) => {
    setTransactingId(appointment.id);
    try {
      await updateMutation.mutateAsync({
        id: appointment.id,
        data: { status: newStatus },
      });
      showToast(
        "Status Updated",
        `Ticket ${appointment.queueNumber || appointment.service} moved to "${newStatus.replace("_", " ")}".`,
        "success"
      );
    } catch (err: any) {
      showToast("Update Failed", err?.message || "Failed to update appointment status.", "danger");
    } finally {
      setTransactingId(null);
    }
  };

  // Typed Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingAppointment) return;
    setTransactingId(deletingAppointment.id);
    try {
      await deleteMutation.mutateAsync(deletingAppointment.id);
      showToast(
        "Appointment Deleted",
        `Ticket ${deletingAppointment.queueNumber || deletingAppointment.service} permanently deleted.`,
        "success"
      );
      setDeletingAppointment(null);
    } catch (err: any) {
      showToast("Delete Failed", err?.message || "Failed to delete appointment.", "danger");
    } finally {
      setTransactingId(null);
    }
  };

  return (
    <>
      <PageHead
        title="Citizen Appointments & Queue Management"
        subtitle="Scheduled citizen transactions at the barangay hall conforming to Republic Act 11032 Citizen's Charter and Anti-Red Tape Authority (ARTA) service clock standards."
        breadcrumb="Services"
        exclusive
      />

      {queryError && (
        <div style={{ marginBottom: "1rem" }}>
          <Alert tone="danger">
            Failed to load appointments: {(queryError as Error)?.message || "Network error"}
          </Alert>
        </div>
      )}

      {/* Toolbar: Search (>=3 chars), Status Filter, Service Filter, View Mode, Book Button */}
      <AppointmentToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        service={service}
        onServiceChange={setService}
        totalAppointments={totalAppointments}
        canBook={mayBook}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenBook={() => {
          setEditingAppointment(null);
          setBookInitialDate(null);
          setOpenDrawer(true);
        }}
      />

      {/* View Switcher: Table List View vs Interactive Calendar View */}
      {viewMode === "table" ? (
        <AppointmentTable
          appointments={appointments}
          total={totalAppointments}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          canManage={mayManage}
          onEdit={(a) => {
            setEditingAppointment(a);
            setBookInitialDate(null);
            setOpenDrawer(true);
          }}
          onDelete={(a) => setDeletingAppointment(a)}
          onMoveStatus={handleMoveStatus}
          transactingId={transactingId}
        />
      ) : (
        <AppointmentCalendar
          appointments={appointments}
          isLoading={isLoading}
          canManage={mayManage}
          transactingId={transactingId}
          onSelectAppointment={(a) => {
            setEditingAppointment(a);
            setBookInitialDate(null);
            setOpenDrawer(true);
          }}
          onEdit={(a) => {
            setEditingAppointment(a);
            setBookInitialDate(null);
            setOpenDrawer(true);
          }}
          onDelete={(a) => setDeletingAppointment(a)}
          onMoveStatus={handleMoveStatus}
          onBookDate={(d) => {
            setEditingAppointment(null);
            setBookInitialDate(d);
            setOpenDrawer(true);
          }}
        />
      )}

      {/* Slide-over Content Drawer for Booking / Editing */}
      <AppointmentDrawer
        open={openDrawer}
        editingAppointment={editingAppointment}
        initialDate={bookInitialDate}
        busy={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setOpenDrawer(false);
          setEditingAppointment(null);
          setBookInitialDate(null);
        }}
        onSubmit={handleDrawerSubmit}
      />

      {/* Typed Delete Confirmation Modal */}
      <DeleteAppointmentModal
        open={Boolean(deletingAppointment)}
        appointment={deletingAppointment}
        busy={deleteMutation.isPending}
        onCancel={() => setDeletingAppointment(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Post-transaction Toast Feedback */}
      <Toast
        open={toast.open}
        message={toast.message}
        description={toast.description}
        tone={toast.tone}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}
