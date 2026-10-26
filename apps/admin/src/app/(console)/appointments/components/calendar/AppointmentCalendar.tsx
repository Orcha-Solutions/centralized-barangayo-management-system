"use client";

import * as React from "react";
import type { Appointment } from "../../../../../lib/types";
import {
  getMonthMatrix,
  getWeekDays,
  getMonthName,
  groupAppointmentsByDate,
  toDateString,
} from "./calendar-utils";
import { AppointmentCalendarDayCell } from "./AppointmentCalendarDayCell";
import { AppointmentDayAgenda } from "./AppointmentDayAgenda";

export interface AppointmentCalendarProps {
  appointments: Appointment[];
  isLoading: boolean;
  canManage: boolean;
  transactingId: string | null;
  onSelectAppointment: (a: Appointment) => void;
  onEdit: (a: Appointment) => void;
  onDelete: (a: Appointment) => void;
  onMoveStatus: (a: Appointment, nextStatus: string) => void;
  onBookDate: (d: Date) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AppointmentCalendar({
  appointments,
  isLoading,
  canManage,
  transactingId,
  onSelectAppointment,
  onEdit,
  onDelete,
  onMoveStatus,
  onBookDate,
}: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = React.useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date>(() => new Date());
  const [calendarMode, setCalendarMode] = React.useState<"month" | "week">("month");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrev = () => {
    if (calendarMode === "month") {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    if (calendarMode === "month") {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Group appointments by "YYYY-MM-DD"
  const grouped = React.useMemo(() => {
    return groupAppointmentsByDate(appointments);
  }, [appointments]);

  // Days to display depending on mode
  const days = React.useMemo(() => {
    if (calendarMode === "month") {
      return getMonthMatrix(year, month, selectedDate);
    }
    return getWeekDays(currentDate, selectedDate);
  }, [calendarMode, year, month, currentDate, selectedDate]);

  // Appointments on selected date for the Agenda
  const selectedDateStr = toDateString(selectedDate);
  const selectedDateAppointments = grouped[selectedDateStr] || [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        backgroundColor: "var(--color-bg-subtle, #f8fafc)",
        border: "1px solid var(--color-border, #e2e8f0)",
        borderRadius: "0.5rem",
        padding: "1rem",
      }}
    >
      {/* Calendar Header: Navigation, Title & Controls */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          paddingBottom: "0.75rem",
          borderBottom: "1px solid var(--cbms-line, #e2e8f0)",
        }}
      >
        {/* Navigation & Current Month Display */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <button
              type="button"
              className="cbms-btn cbms-btn--subtle"
              onClick={handlePrev}
              title="Previous"
              style={{ padding: "4px 10px", fontSize: "0.9rem" }}
            >
              ◀
            </button>
            <button
              type="button"
              className="cbms-btn cbms-btn--secondary"
              onClick={handleToday}
              style={{ padding: "4px 10px", fontSize: "0.8rem", fontWeight: 600 }}
            >
              Today
            </button>
            <button
              type="button"
              className="cbms-btn cbms-btn--subtle"
              onClick={handleNext}
              title="Next"
              style={{ padding: "4px 10px", fontSize: "0.9rem" }}
            >
              ▶
            </button>
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "var(--cbms-navy, #0a2463)",
              marginLeft: "0.5rem",
            }}
          >
            {getMonthName(year, month)}
          </h2>
        </div>

        {/* Legend & View Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Status color legend */}
          <div style={{ display: "none", alignItems: "center", gap: "0.75rem", fontSize: "0.75rem" }} className="cbms-legend-bar">
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#3b82f6" }} /> Booked
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#f59e0b" }} /> Serving
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#22c55e" }} /> Completed
            </span>
          </div>

          {/* Month / Week Switcher */}
          <div
            style={{
              display: "flex",
              backgroundColor: "var(--color-bg-card, #ffffff)",
              border: "1px solid var(--cbms-line, #e2e8f0)",
              borderRadius: "0.375rem",
              padding: "2px",
            }}
          >
            <button
              type="button"
              onClick={() => setCalendarMode("month")}
              style={{
                border: "none",
                background: calendarMode === "month" ? "var(--cbms-navy, #0a2463)" : "transparent",
                color: calendarMode === "month" ? "#ffffff" : "var(--cbms-ink, #1b2430)",
                padding: "4px 10px",
                borderRadius: "4px",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setCalendarMode("week")}
              style={{
                border: "none",
                background: calendarMode === "week" ? "var(--cbms-navy, #0a2463)" : "transparent",
                color: calendarMode === "week" ? "#ffffff" : "var(--cbms-ink, #1b2430)",
                padding: "4px 10px",
                borderRadius: "4px",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Calendar Grid (Left) + Day Agenda (Right) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 340px",
          gap: "1rem",
          alignItems: "stretch",
          minHeight: 580,
        }}
      >
        {/* Left: The 7-column Calendar Grid */}
        <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
          {/* Day of week headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: "4px",
              marginBottom: "4px",
              textAlign: "center",
            }}
          >
            {WEEKDAYS.map((w, idx) => (
              <div
                key={w}
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: idx === 0 || idx === 6 ? "#94a3b8" : "var(--cbms-navy, #0a2463)",
                  padding: "4px 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {w}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: "4px",
              flex: 1,
            }}
          >
            {days.map((day) => (
              <AppointmentCalendarDayCell
                key={day.dateString}
                day={day}
                appointments={grouped[day.dateString] || []}
                canManage={canManage}
                onSelectDate={(d) => setSelectedDate(d)}
                onSelectAppointment={onSelectAppointment}
                onBookDate={onBookDate}
              />
            ))}
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(255, 255, 255, 0.65)",
                backdropFilter: "blur(2px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "0.375rem",
                zIndex: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backgroundColor: "var(--cbms-navy, #0a2463)",
                  color: "#ffffff",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                <span className="cbms-spinner" style={{ width: 14, height: 14 }} />
                <span>Loading calendar schedule...</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Selected Day Agenda */}
        <div style={{ height: "100%" }}>
          <AppointmentDayAgenda
            selectedDate={selectedDate}
            appointments={selectedDateAppointments}
            canManage={canManage}
            transactingId={transactingId}
            onBookDate={onBookDate}
            onEdit={onEdit}
            onDelete={onDelete}
            onMoveStatus={onMoveStatus}
          />
        </div>
      </div>
    </div>
  );
}
