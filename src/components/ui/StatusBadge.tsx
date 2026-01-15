// ===========================================
// FILE: src/components/ui/StatusBadge.tsx
// PURPOSE: Status badge component for tank and site status indicators
// PRD REFERENCE: UI Spec - Status Badges, Implementation Guide - Tank Status Logic
// USED BY: Tank visualizations, site monitoring cards, inventory displays
// ===========================================

import React from 'react';
import { cn } from '@/lib/utils';
import type { TankStatus } from '@/types';

interface StatusBadgeProps {
  status: TankStatus | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * StatusBadge Component
 *
 * WHY: Visual status indicators throughout the app. Primary use is for
 * tank status (NORMAL/LOW_STOCK/CRITICAL) but also used for visit status.
 *
 * BUSINESS LOGIC (Implementation Guide - Tank Status Logic):
 * - NORMAL (green): Tank level is healthy
 * - LOW_STOCK (yellow): Tank is running low, order soon
 * - CRITICAL (red): Tank is very low, urgent reorder needed
 *
 * DESIGN (UI Spec):
 * - NORMAL: Green background, white text
 * - LOW_STOCK: Amber/yellow background, dark text
 * - CRITICAL: Red background, white text
 *
 * EXAMPLE:
 * ```tsx
 * <StatusBadge status="NORMAL" label="In Stock" />
 * <StatusBadge status="CRITICAL" label="Urgent" size="lg" />
 * ```
 *
 * @param status - Status type (NORMAL, LOW_STOCK, CRITICAL, etc.)
 * @param label - Optional custom label (defaults to status name)
 * @param size - Badge size (sm, md, lg)
 * @param className - Additional classes
 */
export function StatusBadge({
  status,
  label,
  size = 'md',
  className,
}: StatusBadgeProps) {
  // Default labels for each status
  const defaultLabels: Record<string, string> = {
    NORMAL: 'Normal',
    LOW_STOCK: 'Low Stock',
    CRITICAL: 'Critical',
    SCHEDULED: 'Scheduled',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };

  // Status-specific styles
  const statusStyles: Record<string, string> = {
    NORMAL: 'bg-success text-white',
    LOW_STOCK: 'bg-warning text-text-primary',
    CRITICAL: 'bg-error text-white',
    SCHEDULED: 'bg-info text-white',
    COMPLETED: 'bg-success text-white',
    CANCELLED: 'bg-text-secondary text-white',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const displayLabel = label || defaultLabels[status] || status;

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded',
        statusStyles[status],
        sizeStyles[size],
        className
      )}
    >
      {displayLabel}
    </span>
  );
}

/**
 * StatusDot Component
 *
 * WHY: Compact status indicator for use in lists, calendar views, etc.
 * Used in calendar to show logged (●) vs scheduled (○) visits.
 *
 * PRD REFERENCE: PRD Section 5 - Visit Scheduling
 *
 * EXAMPLE:
 * ```tsx
 * <StatusDot status="NORMAL" /> Tank is normal
 * <StatusDot status="CRITICAL" size="lg" /> Urgent attention needed
 * ```
 */
export function StatusDot({
  status,
  size = 'md',
  filled = true,
  className,
}: {
  status: TankStatus | 'SCHEDULED' | 'COMPLETED';
  size?: 'sm' | 'md' | 'lg';
  filled?: boolean;
  className?: string;
}) {
  // Color mapping
  const colorStyles: Record<string, string> = {
    NORMAL: filled ? 'bg-success' : 'border-2 border-success',
    LOW_STOCK: filled ? 'bg-warning' : 'border-2 border-warning',
    CRITICAL: filled ? 'bg-error' : 'border-2 border-error',
    SCHEDULED: filled ? 'bg-info' : 'border-2 border-info',
    COMPLETED: filled ? 'bg-success' : 'border-2 border-success',
  };

  // Size mapping
  const sizeStyles = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={cn(
        'inline-block rounded-full',
        colorStyles[status],
        sizeStyles[size],
        className
      )}
      aria-label={`Status: ${status}`}
    />
  );
}
