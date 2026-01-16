// ===========================================
// FILE: src/components/dashboard/ScheduleCalendar.tsx
// PURPOSE: Calendar view for scheduled visits
// PRD REFERENCE: PRD Section 8 - Visit Scheduling
// USED BY: Schedule page
// ===========================================

'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ScheduledVisit {
  id: string;
  scheduledDate: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  site: {
    id: string;
    name: string;
    organization?: {
      id: string;
      name: string;
    };
  };
  notes?: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  completedVisitLog?: {
    id: string;
    visitDate: string;
  } | null;
}

interface ScheduleCalendarProps {
  schedules: ScheduledVisit[];
  onDateClick?: (date: Date) => void;
  onScheduleClick?: (schedule: ScheduledVisit) => void;
  className?: string;
}

/**
 * ScheduleCalendar Component
 *
 * WHY: Visual calendar view of scheduled visits.
 * Helps users see visit distribution across the month.
 *
 * FEATURES:
 * - Month navigation
 * - Day cells with visit indicators
 * - Status color coding
 * - Click to view/add visits
 *
 * @param schedules - Array of scheduled visits
 * @param onDateClick - Handler for clicking a date
 * @param onScheduleClick - Handler for clicking a schedule
 */
export function ScheduleCalendar({
  schedules,
  onDateClick,
  onScheduleClick,
  className,
}: ScheduleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get first and last day of current month view
  const { firstDay, lastDay, days } = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get the day of week the month starts (0 = Sunday)
    const startDayOfWeek = firstDay.getDay();

    // Generate array of days to display
    const days: (Date | null)[] = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add empty cells to complete the last week
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 0; i < remainingDays; i++) {
        days.push(null);
      }
    }

    return { firstDay, lastDay, days };
  }, [currentMonth]);

  // Group schedules by date
  const schedulesByDate = useMemo(() => {
    const map = new Map<string, ScheduledVisit[]>();

    for (const schedule of schedules) {
      const dateKey = new Date(schedule.scheduledDate).toISOString().split('T')[0];
      const existing = map.get(dateKey) || [];
      existing.push(schedule);
      map.set(dateKey, existing);
    }

    return map;
  }, [schedules]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((current) => {
      const newDate = new Date(current);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={cn('w-full', className)}>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-bg-tertiary rounded-md transition-colors"
        >
          <svg
            className="w-5 h-5 text-text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h3 className="text-lg font-semibold text-text-primary">
          {currentMonth.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </h3>

        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-bg-tertiary rounded-md transition-colors"
        >
          <svg
            className="w-5 h-5 text-text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 bg-bg-tertiary">
          {weekDays.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-sm font-medium text-text-secondary"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7">
          {days.map((date, index) => {
            if (!date) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-[80px] sm:min-h-[100px] border-t border-l border-border bg-bg-tertiary/30"
                />
              );
            }

            const dateKey = date.toISOString().split('T')[0];
            const daySchedules = schedulesByDate.get(dateKey) || [];
            const isToday = date.getTime() === today.getTime();
            const isPast = date < today;

            return (
              <div
                key={dateKey}
                onClick={() => onDateClick?.(date)}
                className={cn(
                  'min-h-[80px] sm:min-h-[100px] border-t border-l border-border p-1 cursor-pointer transition-colors',
                  'hover:bg-bg-tertiary/50',
                  isToday && 'bg-primary/5',
                  isPast && 'opacity-75'
                )}
              >
                {/* Day Number */}
                <div
                  className={cn(
                    'w-7 h-7 flex items-center justify-center rounded-full text-sm',
                    isToday
                      ? 'bg-primary text-text-inverse font-semibold'
                      : 'text-text-primary'
                  )}
                >
                  {date.getDate()}
                </div>

                {/* Schedule Indicators */}
                <div className="mt-1 space-y-1">
                  {daySchedules.slice(0, 3).map((schedule) => (
                    <div
                      key={schedule.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onScheduleClick?.(schedule);
                      }}
                      className={cn(
                        'text-xs px-1 py-0.5 rounded truncate cursor-pointer',
                        schedule.status === 'SCHEDULED' &&
                          'bg-primary/20 text-primary hover:bg-primary/30',
                        schedule.status === 'COMPLETED' &&
                          'bg-success/20 text-success hover:bg-success/30',
                        schedule.status === 'CANCELLED' &&
                          'bg-error/20 text-error line-through hover:bg-error/30'
                      )}
                    >
                      {schedule.site.name}
                    </div>
                  ))}
                  {daySchedules.length > 3 && (
                    <div className="text-xs text-text-tertiary px-1">
                      +{daySchedules.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary/20" />
          <span className="text-text-secondary">Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-success/20" />
          <span className="text-text-secondary">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-error/20" />
          <span className="text-text-secondary">Cancelled</span>
        </div>
      </div>
    </div>
  );
}
