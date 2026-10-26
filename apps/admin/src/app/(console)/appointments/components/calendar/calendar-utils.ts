import type { Appointment } from "../../../../../lib/types";

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  dateString: string; // "YYYY-MM-DD"
}

export function toDateString(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isDateToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

/**
 * Builds a 6-week (42 days) calendar grid for a given year and month.
 * Month is 0-indexed (0 = Jan, 11 = Dec).
 */
export function getMonthMatrix(year: number, month: number, selectedDate: Date): CalendarDay[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  // Start date for the 42-day matrix
  const startDate = new Date(year, month, 1 - startDayOfWeek);
  const matrix: CalendarDay[] = [];

  for (let i = 0; i < 42; i++) {
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
    matrix.push({
      date: current,
      isCurrentMonth: current.getMonth() === month,
      isToday: isDateToday(current),
      isSelected: isSameDay(current, selectedDate),
      dateString: toDateString(current),
    });
  }

  return matrix;
}

export function getWeekDays(centerDate: Date, selectedDate: Date): CalendarDay[] {
  const dayOfWeek = centerDate.getDay();
  const startOfWeek = new Date(centerDate.getFullYear(), centerDate.getMonth(), centerDate.getDate() - dayOfWeek);
  const days: CalendarDay[] = [];

  for (let i = 0; i < 7; i++) {
    const current = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i);
    days.push({
      date: current,
      isCurrentMonth: current.getMonth() === centerDate.getMonth(),
      isToday: isDateToday(current),
      isSelected: isSameDay(current, selectedDate),
      dateString: toDateString(current),
    });
  }

  return days;
}

export function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

export function formatDateHeading(d: Date): string {
  return d.toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function getMonthName(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });
}

export function getStatusStyle(status: string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case "booked":
      return { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6" };
    case "checked_in":
      return { bg: "#eef2ff", text: "#4338ca", border: "#c7d2fe", dot: "#6366f1" };
    case "serving":
      return { bg: "#fffbeb", text: "#b45309", border: "#fde68a", dot: "#f59e0b" };
    case "completed":
      return { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", dot: "#22c55e" };
    case "no_show":
      return { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca", dot: "#ef4444" };
    case "cancelled":
    default:
      return { bg: "#f8fafc", text: "#475569", border: "#e2e8f0", dot: "#94a3b8" };
  }
}

export function groupAppointmentsByDate(appointments: Appointment[]): Record<string, Appointment[]> {
  const map: Record<string, Appointment[]> = {};
  for (const a of appointments) {
    if (!a.scheduledAt) continue;
    try {
      const d = new Date(a.scheduledAt);
      const ds = toDateString(d);
      if (!map[ds]) map[ds] = [];
      map[ds].push(a);
    } catch {}
  }
  return map;
}
