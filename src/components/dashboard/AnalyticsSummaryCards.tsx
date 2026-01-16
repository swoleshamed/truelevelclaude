// ===========================================
// FILE: src/components/dashboard/AnalyticsSummaryCards.tsx
// PURPOSE: Summary metric cards for analytics dashboard
// PRD REFERENCE: PRD Section 7.3 - Dashboard Summary
// USED BY: Analytics dashboard, site overview
// ===========================================

'use client';

import React from 'react';
import { Card } from '@/components/ui';
import { cn, formatCurrency } from '@/lib/utils';

interface MetricCard {
  label: string;
  value: string | number;
  change?: number; // Percentage change
  trend?: 'up' | 'down' | 'neutral';
  format?: 'number' | 'currency' | 'percent';
  icon?: 'dollar' | 'chart' | 'package' | 'alert' | 'calendar' | 'flask';
}

interface AnalyticsSummaryCardsProps {
  metrics: MetricCard[];
  className?: string;
}

/**
 * AnalyticsSummaryCards Component
 *
 * WHY: At-a-glance metrics for quick dashboard overview.
 * Shows key performance indicators with trend indicators.
 *
 * FEATURES:
 * - Grid of metric cards
 * - Percentage change indicators
 * - Trend arrows (up/down)
 * - Icon support for visual context
 * - Responsive grid layout
 *
 * @param metrics - Array of metric cards to display
 */
export function AnalyticsSummaryCards({
  metrics,
  className,
}: AnalyticsSummaryCardsProps) {
  const formatValue = (
    value: string | number,
    format?: 'number' | 'currency' | 'percent'
  ): string => {
    if (typeof value === 'string') return value;

    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percent':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  const getIcon = (icon?: MetricCard['icon']) => {
    switch (icon) {
      case 'dollar':
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'chart':
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        );
      case 'package':
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        );
      case 'alert':
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      case 'calendar':
        return (
          <svg
            className="w-6 h-6"
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
        );
      case 'flask':
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') {
      return (
        <svg
          className="w-4 h-4 text-success"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      );
    }
    if (trend === 'down') {
      return (
        <svg
          className="w-4 h-4 text-error"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      );
    }
    return null;
  };

  return (
    <div
      className={cn(
        'grid grid-cols-2 lg:grid-cols-4 gap-4',
        className
      )}
    >
      {metrics.map((metric, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-text-secondary mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-text-primary">
                {formatValue(metric.value, metric.format)}
              </p>
              {metric.change !== undefined && (
                <div className="flex items-center gap-1 mt-2">
                  {getTrendIcon(metric.trend)}
                  <span
                    className={cn(
                      'text-sm font-medium',
                      metric.trend === 'up' && 'text-success',
                      metric.trend === 'down' && 'text-error',
                      metric.trend === 'neutral' && 'text-text-secondary'
                    )}
                  >
                    {metric.change > 0 ? '+' : ''}
                    {metric.change.toFixed(1)}%
                  </span>
                  <span className="text-xs text-text-tertiary">vs prev</span>
                </div>
              )}
            </div>
            {metric.icon && (
              <div className="p-2 bg-bg-tertiary rounded-lg text-text-secondary">
                {getIcon(metric.icon)}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

/**
 * Single stat card for standalone use
 */
interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  format?: 'number' | 'currency' | 'percent';
  icon?: MetricCard['icon'];
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  trend,
  format,
  icon,
  className,
}: StatCardProps) {
  return (
    <AnalyticsSummaryCards
      metrics={[{ label, value, change, trend, format, icon }]}
      className={cn('grid-cols-1', className)}
    />
  );
}
