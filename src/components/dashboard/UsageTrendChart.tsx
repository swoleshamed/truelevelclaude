// ===========================================
// FILE: src/components/dashboard/UsageTrendChart.tsx
// PURPOSE: Bar/line chart for chemical usage trends
// PRD REFERENCE: PRD Section 7.2 - Usage Trends
// USED BY: Site analytics dashboard, chemical detail pages
// ===========================================

'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from 'recharts';
import { cn } from '@/lib/utils';

type TimePeriod = 'week' | 'month';

interface DataPoint {
  period: string; // e.g., "Jan 1-7"
  usage: number; // Gallons used
  cost?: number; // Optional cost
}

interface UsageTrendChartProps {
  data: DataPoint[];
  defaultPeriod?: TimePeriod;
  onPeriodChange?: (period: TimePeriod) => void;
  title?: string;
  showCost?: boolean;
  className?: string;
}

/**
 * UsageTrendChart Component
 *
 * WHY: Visualize chemical usage patterns over time.
 * Helps identify trends, seasonal patterns, and anomalies.
 *
 * FEATURES:
 * - Bar chart for usage (gallons)
 * - Optional line overlay for cost
 * - Period toggle (weekly/monthly)
 * - Responsive design
 *
 * @param data - Array of usage data points
 * @param defaultPeriod - Default aggregation period
 * @param onPeriodChange - Callback when period changes
 * @param title - Chart title
 * @param showCost - Show cost overlay line
 */
export function UsageTrendChart({
  data,
  defaultPeriod = 'week',
  onPeriodChange,
  title,
  showCost = false,
  className,
}: UsageTrendChartProps) {
  const [period, setPeriod] = useState<TimePeriod>(defaultPeriod);

  const handlePeriodChange = (newPeriod: TimePeriod) => {
    setPeriod(newPeriod);
    onPeriodChange?.(newPeriod);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-secondary border border-border-light rounded-lg shadow-md p-3">
          <p className="text-sm font-medium text-text-primary mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-text-secondary">{entry.name}:</span>
              <span className="font-semibold text-text-primary">
                {entry.name === 'Usage'
                  ? `${entry.value.toFixed(1)} gal`
                  : `$${entry.value.toFixed(2)}`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Header with title and period toggle */}
      <div className="flex items-center justify-between mb-4">
        {title && (
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        )}

        {/* Period toggle */}
        <div className="inline-flex bg-bg-tertiary rounded-lg p-1 gap-1">
          <button
            onClick={() => handlePeriodChange('week')}
            className={cn(
              'px-3 py-1 rounded-md text-sm font-medium transition-all duration-150',
              period === 'week'
                ? 'bg-primary text-text-inverse'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            Weekly
          </button>
          <button
            onClick={() => handlePeriodChange('month')}
            className={cn(
              'px-3 py-1 rounded-md text-sm font-medium transition-all duration-150',
              period === 'month'
                ? 'bg-primary text-text-inverse'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-64 sm:h-80">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {showCost ? (
              <ComposedChart
                data={data}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E2DD" />
                <XAxis
                  dataKey="period"
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `${value}g`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                <Bar
                  yAxisId="left"
                  dataKey="usage"
                  name="Usage"
                  fill="#34D239"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cost"
                  name="Cost"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            ) : (
              <BarChart
                data={data}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E2DD" />
                <XAxis
                  dataKey="period"
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `${value}g`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                <Bar
                  dataKey="usage"
                  name="Usage"
                  fill="#34D239"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-text-secondary">
            <div className="text-center">
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p className="text-sm">No usage data available</p>
              <p className="text-xs mt-1">Log visits to see usage trends</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
