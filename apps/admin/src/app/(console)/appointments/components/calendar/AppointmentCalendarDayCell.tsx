"use client";

import * as React from "react";
import type { Appointment } from "../../../../../lib/types";
import { type CalendarDay, formatTime, getStatusStyle } from "./calendar-utils";

export interface AppointmentCalendarDayCellProps {
  day: CalendarDay;
  appointments: Appointment[];
  canManage: boolean;
  onSelectDate: (d: Date) => void;
  onSelectAppointment: (a: Appointment) => void;
  onBookDate: (d: Date) => void;
}

export function AppointmentCalendarDayCell({
  day,
  appointments = [],
  canManage,
  onSelectDate,
  onSelectAppointment,
  onBookDate,
}: AppointmentCalendarDayCellProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const maxVisible = 3;
  const visibleAppointments = appointments.slice(0, maxVisible);
  const extraCount = Math.max(0, appointments.length - maxVisible);

  return (
    <div
      onClick={() => onSelectDate(day.date)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        minHeight: 110,
        backgroundColor: day.isSelected
          ? "rgba(10, 36, 99, 0.04)"
          : day.isCurrentMonth
          ? "var(--cbms-white, #ffffff)"
          : "rgba(241, 245, 249, 0.5)",
        border: day.isSelected
          ? "2px solid var(--cbms-navy, #0a2463)"
          : "1px solid var(--cbms-line, #e2e8f0)",
        borderRadius: "0.375rem",
        padding: "0.35rem 0.45rem",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        position: "relative",
        opacity: day.isCurrentMonth ? 1 : 0.45,
        transition: "background-color 0.15s, border-color 0.15s, box-shadow 0.15s",
        boxShadow: day.isSelected
          ? "0 0 0 1px var(--cbms-navy, #0a2463)"
          : isHovered
          ? "0 2px 6px rgba(0,0,0,0.06)"
          : "none",
      }}
    >
      {/* Day Header: Date number & Quick Add action */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.3rem",
        }}
      >
        <div
          style={{
            fontSize: "0.82rem",
            fontWeight: day.isToday || day.isSelected ? 700 : 500,
            color: day.isToday
              ? "#ffffff"
              : day.isSelected
              ? "var(--cbms-navy, #0a2463)"
              : "var(--cbms-ink, #1b2430)",
            backgroundColor: day.isToday ? "var(--cbms-navy, #0a2463)" : "transparent",
            width: day.isToday ? 24 : "auto",
            height: day.isToday ? 24 : "auto",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: day.isToday ? 0 : "2px",
          }}
        >
          {day.date.getDate()}
        </div>

        {/* Hover "+ Add" quick button */}
        {canManage && isHovered && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBookDate(day.date);
            }}
            title={`Schedule appointment for ${day.date.toLocaleDateString()}`}
            style={{
              background: "var(--cbms-navy, #0a2463)",
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
              padding: "1px 6px",
              fontSize: "0.68rem",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            + Add
          </button>
        )}
      </div>

      {/* Appointment Pills List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.22rem", flex: 1, minHeight: 0 }}>
        {visibleAppointments.map((appt) => {
          const style = getStatusStyle(appt.status);
          const timeLabel = formatTime(appt.scheduledAt);
          const displayLabel = appt.queueNumber || appt.service;

          return (
            <div
              key={appt.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectAppointment(appt);
              }}
              title={`${appt.queueNumber ? `${appt.queueNumber} • ` : ""}${appt.service} (${timeLabel})`}
              style={{
                backgroundColor: style.bg,
                color: style.text,
                border: `1px solid ${style.border}`,
                borderRadius: "3px",
                padding: "2px 5px",
                fontSize: "0.7rem",
                lineHeight: "1.2",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                cursor: "pointer",
                fontWeight: 500,
                transition: "filter 0.15s",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  backgroundColor: style.dot,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontWeight: 600, fontSize: "0.68rem" }}>{timeLabel}</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{displayLabel}</span>
            </div>
          );
        })}

        {extraCount > 0 && (
          <div
            style={{
              fontSize: "0.68rem",
              fontWeight: 600,
              color: "var(--cbms-navy, #0a2463)",
              padding: "1px 4px",
            }}
          >
            +{extraCount} more
          </div>
        )}
      </div>
    </div>
  );
}
