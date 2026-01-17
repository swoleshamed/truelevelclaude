// ===========================================
// FILE: src/app/(dashboard)/dashboard/OrganizationDashboard.tsx
// PURPOSE: Dashboard view for organization users
// PRD REFERENCE: PRD Section 6.2 - Organization Dashboard
// USED BY: Main dashboard page
// ===========================================

'use client';

import React from 'react';
import Link from 'next/link';
import { useLocation } from '@/contexts/LocationContext';
import { Card, StatusBadge } from '@/components/ui';
import { PageContainer, PageHeader } from '@/components/layout';
import { LocationSwitcher } from '@/components/dashboard';
import { useFABAction } from '@/components/layout/FAB';

interface OrganizationDashboardProps {
  user: {
    firstName: string;
    lastName: string;
    role: string;
  };
  organizationId: string;
  organizationName: string;
  organizationSlug?: string;
}

/**
 * Organization Dashboard Component
 *
 * WHY: Organization admins need to see all their sites and monitor inventory,
 * costs, and performance across their car wash locations.
 *
 * URL-AWARE VIEWS:
 * - /dashboard/o/[orgSlug] (ORG): Aggregate view of all sites with stats
 * - /dashboard/o/[orgSlug]/s/[siteSlug] (SITE): Specific site details
 *
 * FEATURES:
 * - Site list with status indicators
 * - Aggregate cost-per-car analytics
 * - Critical stock alerts across all sites
 * - Quick actions: Add new site, view reports
 *
 * EXAMPLE DATA SHOWN:
 * - Site name and address
 * - Critical tanks count
 * - Average cost per car
 * - Cars washed today
 * - Last visit date
 */
export function OrganizationDashboard({
  user,
  organizationId,
  organizationName,
  organizationSlug = 'default-org',
}: OrganizationDashboardProps) {
  const { location } = useLocation();

  /**
   * Configure FAB action based on current view
   * WHY: Context-aware actions for common organization tasks
   */
  useFABAction(
    location.type === 'ORG'
      ? {
          label: 'Add Site',
          icon: 'plus',
          onClick: () => {
            // TODO: Open add site modal
            console.log('Add site');
          },
        }
      : null
  );

  // TODO: Fetch sites from API
  // This will be replaced with real data in Phase 5
  const mockSites = [
    {
      id: '1',
      name: 'Main Street Location',
      slug: 'main-street',
      address: '123 Main St',
      criticalTanks: 2,
      avgCostPerCar: 0.42,
      carsToday: 87,
      lastVisit: '2026-01-10',
    },
    {
      id: '2',
      name: 'Highway 101 Location',
      slug: 'highway-101',
      address: '456 Highway 101',
      criticalTanks: 0,
      avgCostPerCar: 0.38,
      carsToday: 124,
      lastVisit: '2026-01-12',
    },
    {
      id: '3',
      name: 'Downtown Location',
      slug: 'downtown',
      address: '789 Downtown Ave',
      criticalTanks: 1,
      avgCostPerCar: 0.45,
      carsToday: 65,
      lastVisit: '2026-01-14',
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome back, ${user.firstName}!`}
        subtitle={`Managing ${organizationName}`}
        action={
          <LocationSwitcher
            organizations={[
              {
                id: organizationId,
                name: organizationName,
                slug: organizationSlug,
                sites: mockSites.map((site) => ({
                  id: site.id,
                  name: site.name,
                  slug: site.slug,
                  organizationId: organizationId,
                })),
              },
            ]}
            currentLocation={location}
            canAddNew={true}
            onAddNew={() => {
              // TODO: Open add site modal
              console.log('Add new site');
            }}
          />
        }
      />

      {/* ORG view: Show all sites */}
      {location.type === 'ORG' && (
        <div className="space-y-6">
          {/* Stats overview */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card>
              <div className="p-4">
                <p className="text-sm text-text-secondary mb-1">Total Sites</p>
                <p className="text-2xl font-bold text-text-primary">
                  {mockSites.length}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <p className="text-sm text-text-secondary mb-1">Cars Today</p>
                <p className="text-2xl font-bold text-text-primary">
                  {mockSites.reduce((sum, site) => sum + site.carsToday, 0)}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <p className="text-sm text-text-secondary mb-1">
                  Avg Cost/Car
                </p>
                <p className="text-2xl font-bold text-text-primary">
                  $
                  {(
                    mockSites.reduce(
                      (sum, site) => sum + site.avgCostPerCar,
                      0
                    ) / mockSites.length
                  ).toFixed(2)}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <p className="text-sm text-text-secondary mb-1">
                  Critical Alerts
                </p>
                <p className="text-2xl font-bold text-error">
                  {mockSites.reduce((sum, site) => sum + site.criticalTanks, 0)}
                </p>
              </div>
            </Card>
          </div>

          {/* Site list */}
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Your Locations
            </h2>
            <div className="space-y-3">
              {mockSites.map((site) => (
                <Link
                  key={site.id}
                  href={`/dashboard/o/${organizationSlug}/s/${site.slug}`}
                  className="block"
                >
                  <Card className="cursor-pointer hover:border-primary transition-colors">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-text-primary mb-1">
                            {site.name}
                          </h3>
                          <p className="text-sm text-text-secondary">
                            {site.address}
                          </p>
                        </div>
                        {site.criticalTanks > 0 && (
                          <StatusBadge
                            status="CRITICAL"
                            label={`${site.criticalTanks} Critical`}
                          />
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-text-tertiary">Cars Today</p>
                          <p className="text-text-primary font-medium">
                            {site.carsToday}
                          </p>
                        </div>
                        <div>
                          <p className="text-text-tertiary">Cost/Car</p>
                          <p className="text-text-primary font-medium">
                            ${site.avgCostPerCar.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-text-tertiary">Last Visit</p>
                          <p className="text-text-secondary">
                            {new Date(site.lastVisit).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SITE view: Delegate to SiteDashboard component */}
      {location.type === 'SITE' && (
        <Card>
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {location.siteName}
            </h3>
            <p className="text-text-secondary">
              Site dashboard with tanks, analytics, and visit history.
            </p>
            <p className="text-sm text-text-tertiary mt-4">
              This will be implemented with SiteDashboard component.
            </p>
          </div>
        </Card>
      )}
    </PageContainer>
  );
}
