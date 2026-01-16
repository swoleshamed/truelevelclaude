// ===========================================
// FILE: src/app/(dashboard)/analytics/SiteAnalyticsDashboard.tsx
// PURPOSE: Site-level analytics dashboard
// PRD REFERENCE: PRD Section 7 - Analytics & Reporting
// USED BY: Analytics page for site managers
// ===========================================

'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader } from '@/components/layout';
import { Card, Select } from '@/components/ui';
import { CostPerCarChart } from '@/components/dashboard/CostPerCarChart';
import { UsageTrendChart } from '@/components/dashboard/UsageTrendChart';
import { AnalyticsSummaryCards } from '@/components/dashboard/AnalyticsSummaryCards';

interface Site {
  id: string;
  name: string;
}

interface SiteAnalyticsDashboardProps {
  sites: Site[];
  defaultSiteId?: string;
}

interface SummaryData {
  metrics: {
    visits: { current: number; change: number; trend: 'up' | 'down' };
    cost: { current: number; change: number; trend: 'up' | 'down' };
    usage: { currentGallons: number; change: number; trend: 'up' | 'down' };
    chemicals: { activeCount: number; lowInventoryCount: number };
  };
  lowInventoryAlerts: Array<{
    chemicalName: string;
    currentOnHand: number;
    daysRemaining: number;
  }>;
}

interface CostData {
  summary: {
    totalChemicalCost: number;
    costPerCar: number;
    visitCount: number;
  };
  chemicalBreakdown?: Array<{
    chemicalName: string;
    totalCost: number;
    gallonsUsed: number;
  }>;
}

interface UsageData {
  chemicals: Array<{
    chemicalId: string;
    chemicalName: string;
    totalUsage: number;
    averageDailyUsage: number;
    daysUntilEmpty: number;
    trend: Array<{
      periodStart: string;
      totalUsage: number;
    }>;
  }>;
}

/**
 * SiteAnalyticsDashboard Component
 *
 * WHY: Site-level analytics view for site managers and staff.
 * Shows cost per car, usage trends, and inventory alerts.
 *
 * FEATURES:
 * - Site selector (if multiple sites)
 * - Summary metrics with trends
 * - Cost per car chart
 * - Usage trend chart
 * - Low inventory alerts
 * - Chemical breakdown table
 */
export function SiteAnalyticsDashboard({
  sites,
  defaultSiteId,
}: SiteAnalyticsDashboardProps) {
  const [selectedSiteId, setSelectedSiteId] = useState(
    defaultSiteId || (sites.length > 0 ? sites[0].id : '')
  );
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [costData, setCostData] = useState<CostData | null>(null);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch analytics data when site or period changes
   */
  useEffect(() => {
    if (selectedSiteId) {
      fetchAnalytics();
    }
  }, [selectedSiteId, period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch all analytics data in parallel
      const [summaryRes, costRes, usageRes] = await Promise.all([
        fetch(`/api/analytics/summary?siteId=${selectedSiteId}&period=${period}`),
        fetch(`/api/analytics/cost-per-car?siteId=${selectedSiteId}&includeBreakdown=true`),
        fetch(`/api/analytics/usage?siteId=${selectedSiteId}&period=week`),
      ]);

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummaryData(data);
      }

      if (costRes.ok) {
        const data = await costRes.json();
        setCostData(data);
      }

      if (usageRes.ok) {
        const data = await usageRes.json();
        setUsageData(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get selected site name
   */
  const selectedSite = sites.find((s) => s.id === selectedSiteId);

  /**
   * Format cost chart data
   */
  const costChartData =
    usageData?.chemicals
      .filter((c) => c.trend.length > 0)
      .slice(0, 1)
      .flatMap((c) =>
        c.trend.map((t) => ({
          date: new Date(t.periodStart).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          costPerCar: costData?.summary.costPerCar || 0,
        }))
      ) || [];

  /**
   * Format usage chart data
   */
  const usageChartData =
    usageData?.chemicals
      .filter((c) => c.trend.length > 0)
      .slice(0, 1)
      .flatMap((c) =>
        c.trend.map((t) => ({
          period: new Date(t.periodStart).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          usage: t.totalUsage,
        }))
      ) || [];

  /**
   * Build summary metrics
   */
  const summaryMetrics = summaryData
    ? [
        {
          label: 'Total Cost',
          value: summaryData.metrics.cost.current,
          change: summaryData.metrics.cost.change,
          trend: summaryData.metrics.cost.trend,
          format: 'currency' as const,
          icon: 'dollar' as const,
        },
        {
          label: 'Cost Per Car',
          value: costData?.summary.costPerCar || 0,
          format: 'currency' as const,
          icon: 'chart' as const,
        },
        {
          label: 'Total Usage',
          value: `${summaryData.metrics.usage.currentGallons.toFixed(0)} gal`,
          change: summaryData.metrics.usage.change,
          trend: summaryData.metrics.usage.trend,
          icon: 'flask' as const,
        },
        {
          label: 'Low Inventory',
          value: summaryData.metrics.chemicals.lowInventoryCount,
          icon: 'alert' as const,
        },
      ]
    : [];

  if (!selectedSiteId && sites.length === 0) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center h-64">
          <div className="text-center text-text-secondary">
            <p>No sites available</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Site Analytics"
        subtitle={selectedSite?.name || 'Select a site'}
      />

      {/* Site and Period Selectors */}
      <div className="flex flex-wrap gap-4 mb-6">
        {sites.length > 1 && (
          <Select
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="w-full sm:w-auto"
          >
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </Select>
        )}

        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value as '7' | '30' | '90')}
          className="w-full sm:w-auto"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-text-secondary">Loading analytics...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          {summaryMetrics.length > 0 && (
            <AnalyticsSummaryCards metrics={summaryMetrics} />
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Per Car Chart */}
            <Card className="p-4">
              <CostPerCarChart
                title="Cost Per Car Trend"
                data={costChartData.length > 0 ? costChartData : []}
                lines={[
                  { key: 'costPerCar', name: 'Cost/Car', color: '#34D239' },
                ]}
              />
            </Card>

            {/* Usage Trend Chart */}
            <Card className="p-4">
              <UsageTrendChart
                title="Chemical Usage"
                data={usageChartData}
                showCost={false}
              />
            </Card>
          </div>

          {/* Low Inventory Alerts */}
          {summaryData &&
            summaryData.lowInventoryAlerts &&
            summaryData.lowInventoryAlerts.length > 0 && (
              <Card className="p-4">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Low Inventory Alerts
                </h3>
                <div className="space-y-3">
                  {summaryData.lowInventoryAlerts.map((alert, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-warning/10 border border-warning/30 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-text-primary">
                          {alert.chemicalName}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {alert.currentOnHand.toFixed(1)} gallons remaining
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning">
                          {alert.daysRemaining} days left
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

          {/* Chemical Breakdown Table */}
          {costData?.chemicalBreakdown && costData.chemicalBreakdown.length > 0 && (
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Chemical Cost Breakdown
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-text-secondary font-medium">
                        Chemical
                      </th>
                      <th className="text-right py-2 px-3 text-text-secondary font-medium">
                        Usage (gal)
                      </th>
                      <th className="text-right py-2 px-3 text-text-secondary font-medium">
                        Total Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {costData.chemicalBreakdown.map((chem, index) => (
                      <tr key={index} className="border-b border-border-light">
                        <td className="py-2 px-3 text-text-primary">
                          {chem.chemicalName}
                        </td>
                        <td className="py-2 px-3 text-text-primary text-right">
                          {chem.gallonsUsed.toFixed(1)}
                        </td>
                        <td className="py-2 px-3 text-text-primary text-right font-medium">
                          ${chem.totalCost.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-bg-tertiary">
                      <td className="py-2 px-3 font-semibold text-text-primary">
                        Total
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-text-primary">
                        {costData.chemicalBreakdown
                          .reduce((sum, c) => sum + c.gallonsUsed, 0)
                          .toFixed(1)}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-text-primary">
                        ${costData.summary.totalChemicalCost.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </PageContainer>
  );
}
