// ===========================================
// FILE: src/components/dashboard/VisitReminder.tsx
// PURPOSE: Display upcoming scheduled visits and reminders
// PRD REFERENCE: PRD Section 8 - Visit Scheduling
// USED BY: Dashboard pages, header notifications
// ===========================================

'use client';

import React from 'react';
import { Card, StatusBadge } from '@/components/ui';
import { cn } from '@/lib/utils';

interface Visit {
  id: string;
  date: string;
  siteName: string;
  siteId: string;
  organizationName?: string;
  type: 'SCHEDULED' | 'OVERDUE' | 'TODAY';
  distributor?: string;
  notes?: string;
}

interface VisitReminderProps {
  visits: Visit[];
  onVisitClick?: (visitId: string, siteId: string) => void;
  showOrganization?: boolean;
  className?: string;
}

/**
 * VisitReminder Component
 *
 * WHY: Keep distributors and managers aware of upcoming visits and
 * overdue service calls to maintain inventory and equipment.
 *
 * FEATURES (PRD Section 8):
 * - Displays scheduled visits in chronological order
 * - Highlights overdue visits in red
 * - Shows today's visits prominently
 * - Quick navigation to site details
 *
 * BUSINESS LOGIC:
 * - Overdue visits are critical (past due date, not completed)
 * - Today's visits are high priority (due today)
 * - Scheduled visits are upcoming (future dates)
 *
 * DISPLAY:
 * - Visit date with day of week
 * - Site name and organization (if multi-org view)
 * - Distributor name (for org/site view)
 * - Type badge (SCHEDULED/OVERDUE/TODAY)
 *
 * EXAMPLE:
 * ```tsx
 * <VisitReminder
 *   visits={upcomingVisits}
 *   onVisitClick={(visitId, siteId) => router.push(`/sites/${siteId}`)}
 *   showOrganization={userRole === 'DISTRIBUTOR_ADMIN'}
 * />
 * ```
 */
export function VisitReminder({
  visits,
  onVisitClick,
  showOrganization = false,
  className,
}: VisitReminderProps) {
  /**
   * Format date for display
   * WHY: Show friendly date format with day of week
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }

    // Check if tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }

    // Show date with day of week
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * Get badge status color based on visit type
   */
  const getVisitBadge = (visit: Visit) => {
    switch (visit.type) {
      case 'OVERDUE':
        return (
          <StatusBadge status="CRITICAL" label="OVERDUE" className="text-xs" />
        );
      case 'TODAY':
        return (
          <StatusBadge status="LOW_STOCK" label="TODAY" className="text-xs" />
        );
      case 'SCHEDULED':
        return (
          <StatusBadge status="NORMAL" label="SCHEDULED" className="text-xs" />
        );
    }
  };

  if (visits.length === 0) {
    return (
      <Card className={className}>
        <div className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-bg-tertiary rounded-full mb-3">
            <svg
              className="w-6 h-6 text-text-tertiary"
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
          </div>
          <p className="text-sm text-text-secondary">No upcoming visits</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {visits.map((visit) => (
        <Card
          key={visit.id}
          className={cn(
            'transition-all',
            onVisitClick && 'cursor-pointer hover:border-primary',
            visit.type === 'OVERDUE' && 'border-error'
          )}
          onClick={() => onVisitClick?.(visit.id, visit.siteId)}
        >
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-text-primary">
                    {formatDate(visit.date)}
                  </p>
                  {getVisitBadge(visit)}
                </div>
                <p className="text-base font-medium text-text-primary">
                  {visit.siteName}
                </p>
                {showOrganization && visit.organizationName && (
                  <p className="text-sm text-text-secondary mt-0.5">
                    {visit.organizationName}
                  </p>
                )}
              </div>
            </div>

            {visit.distributor && (
              <p className="text-xs text-text-secondary mt-2">
                Distributor: {visit.distributor}
              </p>
            )}

            {visit.notes && (
              <p className="text-xs text-text-tertiary mt-2 italic">
                {visit.notes}
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

/**
 * Compact VisitReminderList Component
 *
 * WHY: Smaller version for dashboard widgets and header notifications
 */
interface VisitReminderListProps {
  visits: Visit[];
  maxItems?: number;
  onSeeAll?: () => void;
  className?: string;
}

export function VisitReminderList({
  visits,
  maxItems = 5,
  onSeeAll,
  className,
}: VisitReminderListProps) {
  const displayVisits = visits.slice(0, maxItems);
  const hasMore = visits.length > maxItems;

  return (
    <div className={cn('space-y-2', className)}>
      {displayVisits.map((visit) => (
        <div
          key={visit.id}
          className="flex items-center justify-between p-2 rounded-md hover:bg-bg-tertiary transition-colors"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {visit.siteName}
            </p>
            <p className="text-xs text-text-secondary">
              {new Date(visit.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="ml-2">
            {visit.type === 'OVERDUE' && (
              <div className="w-2 h-2 bg-error rounded-full" />
            )}
            {visit.type === 'TODAY' && (
              <div className="w-2 h-2 bg-warning rounded-full" />
            )}
          </div>
        </div>
      ))}

      {hasMore && onSeeAll && (
        <button
          onClick={onSeeAll}
          className="w-full text-sm text-primary hover:text-primary-hover font-medium py-2"
        >
          See all {visits.length} visits →
        </button>
      )}
    </div>
  );
}
