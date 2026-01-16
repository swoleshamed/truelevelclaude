// ===========================================
// FILE: src/app/(dashboard)/dashboard/SiteDashboard.tsx
// PURPOSE: Dashboard view for site-level users and site-specific view
// PRD REFERENCE: PRD Section 6.3 - Site Dashboard
// USED BY: Main dashboard page, organization/distributor dashboards
// ===========================================

'use client';

import React from 'react';
import { Card, Tabs, StatusBadge } from '@/components/ui';
import {
  PageContainer,
  PageHeader,
  PageSection,
} from '@/components/layout';
import {
  TankVisualization,
  TankGrid,
  CostPerCarChart,
} from '@/components/dashboard';
import { useFABAction } from '@/components/layout/FAB';

interface SiteDashboardProps {
  user: {
    firstName: string;
    lastName: string;
    role: string;
  };
  siteId: string;
  siteName: string;
  organizationName?: string;
}

/**
 * Site Dashboard Component
 *
 * WHY: Site-level users and managers need detailed visibility into chemical
 * inventory, usage analytics, and operational metrics for a specific location.
 *
 * FEATURES (PRD Section 6.3):
 * - Tank visualization grid with real-time status
 * - Cost-per-car analytics chart
 * - Visit history and upcoming visits
 * - Quick actions: Log visit, update inventory, change equipment
 *
 * TABS:
 * - Overview: Tanks + analytics + reminders
 * - Chemicals: Full chemical catalog and configurations
 * - Visits: Visit history and scheduling
 * - Analytics: Detailed cost and usage reports
 *
 * EXAMPLE DATA SHOWN:
 * - All chemical tanks with current levels
 * - 30-day cost-per-car trend
 * - Next scheduled visit
 * - Recent visit logs
 */
export function SiteDashboard({
  user,
  siteId,
  siteName,
  organizationName,
}: SiteDashboardProps) {
  /**
   * Configure FAB for site actions
   * WHY: Quick access to common site operations
   */
  useFABAction({
    label: 'Log Visit',
    icon: 'clipboard',
    onClick: () => {
      // TODO: Open visit log modal
      console.log('Log visit for site:', siteId);
    },
  });

  // TODO: Fetch site data from API
  // This will be replaced with real data in Phase 5
  const mockChemicals = [
    {
      id: '1',
      name: 'Pre-Soak',
      currentGallons: 12.5,
      totalGallons: 55,
      alertThreshold: 15,
      tankId: 'TANK-01',
    },
    {
      id: '2',
      name: 'Triple Foam',
      currentGallons: 42.0,
      totalGallons: 55,
      alertThreshold: 15,
      tankId: 'TANK-02',
    },
    {
      id: '3',
      name: 'Wax',
      currentGallons: 8.2,
      totalGallons: 30,
      alertThreshold: 10,
      tankId: 'TANK-03',
    },
    {
      id: '4',
      name: 'Tire Shine',
      currentGallons: 18.5,
      totalGallons: 30,
      alertThreshold: 10,
      tankId: 'TANK-04',
    },
    {
      id: '5',
      name: 'Spot-Free Rinse',
      currentGallons: 25.0,
      totalGallons: 55,
      alertThreshold: 15,
      tankId: 'TANK-05',
    },
    {
      id: '6',
      name: 'Clearcoat',
      currentGallons: 3.5,
      totalGallons: 15,
      alertThreshold: 5,
      tankId: 'TANK-06',
    },
  ];

  const mockCostData = [
    { date: 'Jan 1', siteCost: 0.42 },
    { date: 'Jan 5', siteCost: 0.45 },
    { date: 'Jan 10', siteCost: 0.38 },
    { date: 'Jan 15', siteCost: 0.41 },
  ];

  const mockCostLines = [
    {
      key: 'siteCost',
      name: siteName,
      color: '#34D239', // primary color
    },
  ];

  const mockUpcomingVisits = [
    {
      id: '1',
      date: '2026-01-20',
      type: 'SCHEDULED',
      distributor: 'ABC Chemical Supply',
    },
    {
      id: '2',
      date: '2026-01-27',
      type: 'SCHEDULED',
      distributor: 'ABC Chemical Supply',
    },
  ];

  // Calculate critical alerts
  const criticalCount = mockChemicals.filter(
    (c) => c.currentGallons <= c.alertThreshold
  ).length;

  return (
    <PageContainer>
      <PageHeader
        title={siteName}
        subtitle={organizationName || 'Site Dashboard'}
        action={
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <StatusBadge
                status="CRITICAL"
                label={`${criticalCount} Critical`}
              />
            )}
            <StatusBadge status="NORMAL" label="Site Active" />
          </div>
        }
      />

      {/* Tabs for different views */}
      <Tabs
        defaultTab="overview"
        tabs={[
          {
            id: 'overview',
            label: 'Overview',
            content: (
              <div className="space-y-6">
                {/* Quick stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Card>
                    <div className="p-4">
                      <p className="text-sm text-text-secondary mb-1">
                        Active Tanks
                      </p>
                      <p className="text-2xl font-bold text-text-primary">
                        {mockChemicals.length}
                      </p>
                    </div>
                  </Card>
                  <Card>
                    <div className="p-4">
                      <p className="text-sm text-text-secondary mb-1">
                        Critical
                      </p>
                      <p className="text-2xl font-bold text-error">
                        {criticalCount}
                      </p>
                    </div>
                  </Card>
                  <Card>
                    <div className="p-4">
                      <p className="text-sm text-text-secondary mb-1">
                        Cost/Car
                      </p>
                      <p className="text-2xl font-bold text-text-primary">
                        $0.41
                      </p>
                    </div>
                  </Card>
                  <Card>
                    <div className="p-4">
                      <p className="text-sm text-text-secondary mb-1">
                        Next Visit
                      </p>
                      <p className="text-base font-bold text-text-primary">
                        Jan 20
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Tank grid */}
                <PageSection>
                  <h2 className="text-lg font-semibold text-text-primary mb-4">
                    Chemical Inventory
                  </h2>
                  <TankGrid>
                    {mockChemicals.map((chemical) => (
                      <TankVisualization
                        key={chemical.id}
                        chemicalName={chemical.name}
                        currentGallons={chemical.currentGallons}
                        totalGallons={chemical.totalGallons}
                        tankId={chemical.tankId}
                        alertThreshold={chemical.alertThreshold}
                      />
                    ))}
                  </TankGrid>
                </PageSection>

                {/* Cost-per-car chart */}
                <PageSection>
                  <h2 className="text-lg font-semibold text-text-primary mb-4">
                    Cost Per Car Trend
                  </h2>
                  <Card>
                    <div className="p-6">
                      <CostPerCarChart
                        data={mockCostData}
                        lines={mockCostLines}
                      />
                    </div>
                  </Card>
                </PageSection>

                {/* Upcoming visits */}
                <PageSection>
                  <h2 className="text-lg font-semibold text-text-primary mb-4">
                    Upcoming Visits
                  </h2>
                  <div className="space-y-3">
                    {mockUpcomingVisits.map((visit) => (
                      <Card key={visit.id}>
                        <div className="p-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              {new Date(visit.date).toLocaleDateString(
                                'en-US',
                                {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                }
                              )}
                            </p>
                            <p className="text-sm text-text-secondary mt-1">
                              {visit.distributor}
                            </p>
                          </div>
                          <StatusBadge status="NORMAL" label={visit.type} />
                        </div>
                      </Card>
                    ))}
                  </div>
                </PageSection>
              </div>
            ),
          },
          {
            id: 'chemicals',
            label: 'Chemicals',
            content: (
              <Card>
                <div className="p-6 text-center">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Chemical Management
                  </h3>
                  <p className="text-text-secondary">
                    Full chemical catalog, configurations, and equipment
                    settings will be available in Phase 5.
                  </p>
                </div>
              </Card>
            ),
          },
          {
            id: 'visits',
            label: 'Visits',
            content: (
              <Card>
                <div className="p-6 text-center">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Visit History
                  </h3>
                  <p className="text-text-secondary">
                    Complete visit logs, scheduling, and history will be
                    available in Phase 7.
                  </p>
                </div>
              </Card>
            ),
          },
          {
            id: 'analytics',
            label: 'Analytics',
            content: (
              <Card>
                <div className="p-6 text-center">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Advanced Analytics
                  </h3>
                  <p className="text-text-secondary">
                    Detailed cost reports, usage trends, and optimization
                    recommendations will be available in Phase 8.
                  </p>
                </div>
              </Card>
            ),
          },
        ]}
      />
    </PageContainer>
  );
}
