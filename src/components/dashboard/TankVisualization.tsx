// ===========================================
// FILE: src/components/dashboard/TankVisualization.tsx
// PURPOSE: Visual representation of chemical tank levels
// PRD REFERENCE: UI Spec - Tank Visualization, PRD Section 6 - Dashboards
// USED BY: Site dashboard, site monitoring cards, inventory views
// ===========================================

import React from 'react';
import { cn, getTankStatus, formatNumber } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { TankStatus } from '@/types';

interface TankVisualizationProps {
  chemicalName: string;
  currentGallons: number;
  totalGallons: number;
  tankId?: string;
  alertThreshold?: number;
  className?: string;
  onClick?: () => void;
}

/**
 * TankVisualization Component
 *
 * WHY: Core visual component for chemical inventory management.
 * Provides at-a-glance status of chemical levels across the site.
 *
 * BUSINESS LOGIC (Implementation Guide - Tank Status Logic):
 * If custom alert threshold is set:
 *   - Above 2x threshold = NORMAL (green)
 *   - Above 1x threshold = LOW_STOCK (yellow)
 *   - Below threshold = CRITICAL (red)
 * If no threshold (percentage-based):
 *   - Above 50% = NORMAL
 *   - 25-50% = LOW_STOCK
 *   - Below 25% = CRITICAL
 *
 * VISUAL DESIGN (UI Spec):
 * - SVG-based tank graphic with dynamic fill
 * - Fill color matches status (green/yellow/red)
 * - Fill height based on percentage
 * - Shows current gallons and total capacity
 * - Tank ID displayed (e.g., "TK-01")
 *
 * EXAMPLE:
 * ```tsx
 * <TankVisualization
 *   chemicalName="Pre-Soak Alkaline"
 *   currentGallons={46.7}
 *   totalGallons={55}
 *   tankId="TK-01"
 *   alertThreshold={20}
 *   onClick={() => handleTankClick()}
 * />
 * ```
 *
 * @param chemicalName - Name of the chemical
 * @param currentGallons - Current level in gallons
 * @param totalGallons - Total tank capacity in gallons
 * @param tankId - Tank identifier (e.g., "TK-01")
 * @param alertThreshold - Custom alert threshold in gallons
 * @param onClick - Optional click handler (makes tank interactive)
 */
export function TankVisualization({
  chemicalName,
  currentGallons,
  totalGallons,
  tankId,
  alertThreshold,
  className,
  onClick,
}: TankVisualizationProps) {
  // Calculate status and fill percentage
  const status = getTankStatus(currentGallons, totalGallons, alertThreshold);
  const fillPercentage = (currentGallons / totalGallons) * 100;

  // Status-specific colors for tank fill
  const fillColors: Record<TankStatus, string> = {
    NORMAL: '#34D239', // tank-green
    LOW_STOCK: '#F59E0B', // tank-yellow
    CRITICAL: '#EF4444', // tank-red
  };

  const fillColor = fillColors[status];

  // Make clickable if onClick is provided
  const isClickable = !!onClick;

  return (
    <div
      className={cn(
        'flex flex-col items-center p-4 rounded-lg bg-bg-secondary border border-border-light',
        isClickable && 'cursor-pointer hover:shadow-md transition-shadow duration-150',
        className
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {/* Tank ID */}
      {tankId && (
        <div className="text-xs font-medium text-text-secondary mb-1">
          {tankId}
        </div>
      )}

      {/* Chemical name */}
      <div className="text-sm font-semibold text-text-primary text-center mb-2 line-clamp-2">
        {chemicalName}
      </div>

      {/* Tank SVG visualization */}
      <div className="relative w-24 h-32 mb-3">
        <svg
          viewBox="0 0 100 140"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Tank outline */}
          <rect
            x="10"
            y="10"
            width="80"
            height="120"
            rx="4"
            fill="none"
            stroke="#D1CCC4"
            strokeWidth="2"
          />

          {/* Fill level - calculated from bottom up */}
          <rect
            x="12"
            y={130 - (fillPercentage * 120) / 100}
            width="76"
            height={(fillPercentage * 120) / 100}
            rx="3"
            fill={fillColor}
            opacity="0.9"
          />

          {/* Empty space indicator if tank is not full */}
          {fillPercentage < 100 && (
            <rect
              x="12"
              y="12"
              width="76"
              height={((100 - fillPercentage) * 120) / 100}
              rx="3"
              fill="#E5E7EB"
              opacity="0.3"
            />
          )}
        </svg>

        {/* Percentage overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-text-primary bg-bg-secondary bg-opacity-80 px-2 py-0.5 rounded">
            {formatNumber(fillPercentage, 0)}%
          </span>
        </div>
      </div>

      {/* Current level / Total capacity */}
      <div className="text-sm font-medium text-text-primary mb-2">
        {formatNumber(currentGallons, 1)} / {formatNumber(totalGallons, 1)} gal
      </div>

      {/* Status badge */}
      <StatusBadge status={status} size="sm" />
    </div>
  );
}

/**
 * TankGrid Component
 *
 * WHY: Display multiple tanks in a responsive grid layout.
 * Used on site dashboards to show all chemical tanks at once.
 *
 * EXAMPLE:
 * ```tsx
 * <TankGrid>
 *   {chemicals.map(chem => (
 *     <TankVisualization key={chem.id} {...chem} />
 *   ))}
 * </TankGrid>
 * ```
 */
export function TankGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4',
        className
      )}
    >
      {children}
    </div>
  );
}
