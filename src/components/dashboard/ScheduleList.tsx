// ===========================================
// FILE: src/components/dashboard/ScheduleList.tsx
// PURPOSE: List view of scheduled visits with filters
// PRD REFERENCE: PRD Section 8 - Visit Scheduling
// USED BY: Schedule page
// ===========================================

'use client';

import React, { useState } from 'react';
import { Card, Select, Button, StatusBadge } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ScheduledVisit {
  id: string;
  scheduledDate: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string | null;
  site: {
    id: string;
    name: string;
    organization?: {
      id: string;
      name: string;
    };
  };
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

interface ScheduleListProps {
  schedules: ScheduledVisit[];
  onScheduleClick: (schedule: ScheduledVisit) => void;
  onComplete?: (schedule: ScheduledVisit) => void;
  onCancel?: (schedule: ScheduledVisit) => void;
  onReschedule?: (schedule: ScheduledVisit) => void;
  showSiteColumn?: boolean;
  className?: string;
}

/**
 * ScheduleList Component
 *
 * WHY: List view of scheduled visits with filtering and actions.
 * Provides quick access to schedule management.
 *
 * FEATURES:
 * - Status filtering
 * - Date range filtering
 * - Quick actions (complete, cancel, reschedule)
 * - Status badges
 * - Mobile-responsive
 *
 * @param schedules - Array of scheduled visits
 * @param onScheduleClick - Click handler for schedule item
 * @param onComplete - Handler for marking complete
 * @param onCancel - Handler for cancelling
 * @param onReschedule - Handler for rescheduling
 * @param showSiteColumn - Show site name column
 */
export function ScheduleList({
  schedules,
  onScheduleClick,
  onComplete,
  onCancel,
  onReschedule,
  showSiteColumn = true,
  className,
}: ScheduleListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter schedules
  const filteredSchedules = schedules.filter((schedule) => {
    if (statusFilter === 'all') return true;
    return schedule.status === statusFilter;
  });

  // Group by date for better organization
  const groupedSchedules = filteredSchedules.reduce((groups, schedule) => {
    const date = new Date(schedule.scheduledDate).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(schedule);
    return groups;
  }, {} as Record<string, ScheduledVisit[]>);

  const sortedDates = Object.keys(groupedSchedules).sort();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusLabel = (
    status: string
  ): 'NORMAL' | 'LOW_STOCK' | 'CRITICAL' => {
    switch (status) {
      case 'COMPLETED':
        return 'NORMAL';
      case 'CANCELLED':
        return 'CRITICAL';
      default:
        return 'LOW_STOCK';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        >
          <option value="all">All Statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>

        <span className="text-sm text-text-secondary">
          {filteredSchedules.length} visit{filteredSchedules.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Schedule List */}
      {sortedDates.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-text-secondary">
            <svg
              className="w-12 h-12 mx-auto mb-2 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p>No scheduled visits found</p>
            <p className="text-sm mt-1">
              {statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Schedule a visit to get started'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateKey) => {
            const daySchedules = groupedSchedules[dateKey];
            const date = new Date(dateKey);
            date.setHours(0, 0, 0, 0);
            const isPast = date < today;

            return (
              <div key={dateKey}>
                {/* Date Header */}
                <div
                  className={cn(
                    'text-sm font-medium mb-2 px-2',
                    isPast ? 'text-text-tertiary' : 'text-text-primary'
                  )}
                >
                  {formatDate(dateKey)}
                </div>

                {/* Schedules for this date */}
                <div className="space-y-2">
                  {daySchedules.map((schedule) => (
                    <Card
                      key={schedule.id}
                      className={cn(
                        'p-4 cursor-pointer transition-all',
                        'hover:shadow-md hover:border-primary/30',
                        schedule.status === 'CANCELLED' && 'opacity-60'
                      )}
                      onClick={() => onScheduleClick(schedule)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Site Name */}
                          {showSiteColumn && (
                            <h4 className="font-medium text-text-primary truncate">
                              {schedule.site.name}
                            </h4>
                          )}

                          {/* Organization (if available) */}
                          {schedule.site.organization && (
                            <p className="text-sm text-text-secondary">
                              {schedule.site.organization.name}
                            </p>
                          )}

                          {/* Notes preview */}
                          {schedule.notes && (
                            <p className="text-sm text-text-tertiary mt-1 truncate">
                              {schedule.notes}
                            </p>
                          )}

                          {/* Assigned user */}
                          <p className="text-xs text-text-tertiary mt-2">
                            Assigned to: {schedule.user.firstName} {schedule.user.lastName}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {/* Status Badge */}
                          <StatusBadge
                            status={getStatusLabel(schedule.status)}
                            label={
                              schedule.status === 'SCHEDULED'
                                ? 'Scheduled'
                                : schedule.status === 'COMPLETED'
                                ? 'Completed'
                                : 'Cancelled'
                            }
                          />

                          {/* Quick Actions */}
                          {schedule.status === 'SCHEDULED' && (
                            <div className="flex gap-1">
                              {onComplete && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onComplete(schedule);
                                  }}
                                  className="text-success hover:bg-success/10"
                                >
                                  Complete
                                </Button>
                              )}
                              {onReschedule && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onReschedule(schedule);
                                  }}
                                >
                                  Reschedule
                                </Button>
                              )}
                              {onCancel && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onCancel(schedule);
                                  }}
                                  className="text-error hover:bg-error/10"
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Completed link */}
                      {schedule.completedVisitLog && (
                        <div className="mt-2 pt-2 border-t border-border-light">
                          <span className="text-xs text-success">
                            Visit completed on{' '}
                            {new Date(
                              schedule.completedVisitLog.visitDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
