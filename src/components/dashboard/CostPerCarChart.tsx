// ===========================================
// FILE: src/components/dashboard/CostPerCarChart.tsx
// PURPOSE: Line chart for cost per car analytics
// PRD REFERENCE: PRD Section 6 - Dashboards, UI Spec - Charts
// USED BY: Distributor portfolio chart, org site comparison, site performance
// ===========================================

'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { cn, formatCurrency } from '@/lib/utils';

type TimePeriod = '7D' | '30D';

interface DataPoint {
  date: string; // e.g., "Jan 15"
  [key: string]: number | string; // Dynamic keys for different lines
}

interface ChartLine {
  key: string; // Data key
  name: string; // Display name
  color: string; // Line color
}

interface CostPerCarChartProps {
  data: DataPoint[];
  lines: ChartLine[];
  defaultPeriod?: TimePeriod;
  onPeriodChange?: (period: TimePeriod) => void;
  title?: string;
  className?: string;
}

/**
 * CostPerCarChart Component
 *
 * WHY: Visual representation of cost per car trends over time.
 * Three use cases based on location context:
 * 1. Distributor (All Locations): Portfolio comparison across organizations
 * 2. Organization: Site comparison within organization
 * 3. Site: Single site performance over time
 *
 * BUSINESS CONTEXT (PRD Section 6):
 * - Distributor dashboard: Compare average CPC across client organizations
 * - Organization dashboard: Compare CPC across multiple sites
 * - Site dashboard: Track single site CPC trend
 *
 * DESIGN (UI Spec):
 * - Line chart with area fill
 * - Multiple lines for comparisons (different colors per org/site)
 * - Period toggle (7D / 30D)
 * - Tooltip shows exact values on hover
 * - Responsive for mobile and desktop
 *
 * EXAMPLE:
 * ```tsx
 * // Portfolio comparison (distributor)
 * <CostPerCarChart
 *   title="Portfolio Comparison (Avg Cost/Car)"
 *   data={portfolioData}
 *   lines={[
 *     { key: 'org1', name: 'Downtown Group', color: '#34D239' },
 *     { key: 'org2', name: 'Uptown Group', color: '#3B82F6' }
 *   ]}
 *   defaultPeriod="7D"
 * />
 *
 * // Site comparison (organization)
 * <CostPerCarChart
 *   title="Site Comparison (Cost/Car)"
 *   data={siteData}
 *   lines={[
 *     { key: 'site1', name: 'Downtown Car Wash', color: '#34D239' },
 *     { key: 'site2', name: 'Downtown East', color: '#F59E0B' }
 *   ]}
 * />
 *
 * // Single site (site dashboard)
 * <CostPerCarChart
 *   title="Performance (Cost/Car)"
 *   data={performanceData}
 *   lines={[
 *     { key: 'costPerCar', name: 'Cost per Car', color: '#34D239' }
 *   ]}
 * />
 * ```
 *
 * @param data - Array of data points with date and values
 * @param lines - Array of line configurations (key, name, color)
 * @param defaultPeriod - Default time period (7D or 30D)
 * @param onPeriodChange - Callback when period changes
 * @param title - Chart title
 */
export function CostPerCarChart({
  data,
  lines,
  defaultPeriod = '7D',
  onPeriodChange,
  title,
  className,
}: CostPerCarChartProps) {
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
                {formatCurrency(entry.value)}
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
            onClick={() => handlePeriodChange('7D')}
            className={cn(
              'px-3 py-1 rounded-md text-sm font-medium transition-all duration-150',
              period === '7D'
                ? 'bg-primary text-text-inverse'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            7D
          </button>
          <button
            onClick={() => handlePeriodChange('30D')}
            className={cn(
              'px-3 py-1 rounded-md text-sm font-medium transition-all duration-150',
              period === '30D'
                ? 'bg-primary text-text-inverse'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            30D
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-64 sm:h-80">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E2DD" />
              <XAxis
                dataKey="date"
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '14px' }}
                iconType="line"
              />

              {/* Render lines dynamically */}
              {lines.map((line) => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  name={line.name}
                  stroke={line.color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
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
              <p className="text-sm">No data available</p>
              <p className="text-xs mt-1">Log visits to see cost trends</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
