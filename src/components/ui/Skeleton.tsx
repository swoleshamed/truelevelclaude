// ===========================================
// FILE: src/components/ui/Skeleton.tsx
// PURPOSE: Loading skeleton components for better UX
// PRD REFERENCE: PRD Section 10 - UI Polish
// USED BY: Dashboard, lists, cards during loading states
// ===========================================

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

/**
 * Base Skeleton Component
 *
 * WHY: Provide visual feedback during loading states.
 * Animated pulse effect indicates content is loading.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-bg-tertiary',
        className
      )}
    />
  );
}

/**
 * Skeleton Text - Single line of text
 */
export function SkeletonText({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-4 w-full', className)} />;
}

/**
 * Skeleton Title - Heading text
 */
export function SkeletonTitle({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-6 w-3/4', className)} />;
}

/**
 * Skeleton Avatar - Circular avatar placeholder
 */
export function SkeletonAvatar({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-10 w-10 rounded-full', className)} />;
}

/**
 * Skeleton Button - Button placeholder
 */
export function SkeletonButton({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-10 w-24 rounded-lg', className)} />;
}

/**
 * Skeleton Card - Full card placeholder
 */
export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('p-4 rounded-lg border border-border bg-bg-secondary', className)}>
      <div className="space-y-3">
        <SkeletonTitle />
        <SkeletonText className="w-full" />
        <SkeletonText className="w-2/3" />
      </div>
    </div>
  );
}

/**
 * Skeleton List Item - List row placeholder
 */
export function SkeletonListItem({ className }: SkeletonProps) {
  return (
    <div className={cn('flex items-center gap-4 p-4', className)}>
      <SkeletonAvatar />
      <div className="flex-1 space-y-2">
        <SkeletonTitle className="w-1/2" />
        <SkeletonText className="w-3/4" />
      </div>
    </div>
  );
}

/**
 * Skeleton Table - Table rows placeholder
 */
interface SkeletonTableProps extends SkeletonProps {
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ rows = 5, columns = 4, className }: SkeletonTableProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="flex gap-4 p-3 bg-bg-tertiary rounded-t-lg">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-3 border-b border-border-light">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton Dashboard - Dashboard layout placeholder
 */
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <SkeletonTitle className="w-48" />
          <SkeletonText className="w-32" />
        </div>
        <SkeletonButton />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Skeleton Chemical Card - Chemical item placeholder
 */
export function SkeletonChemicalCard({ className }: SkeletonProps) {
  return (
    <div className={cn('p-4 rounded-lg border border-border bg-bg-secondary', className)}>
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-16 rounded-lg" />
        <div className="flex-1 space-y-2">
          <SkeletonTitle className="w-2/3" />
          <SkeletonText className="w-1/2" />
          <div className="flex gap-2 mt-3">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton Schedule Item - Schedule row placeholder
 */
export function SkeletonScheduleItem({ className }: SkeletonProps) {
  return (
    <div className={cn('p-4 rounded-lg border border-border bg-bg-secondary', className)}>
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <SkeletonTitle className="w-40" />
          <SkeletonText className="w-28" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}
