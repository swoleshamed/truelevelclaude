// ===========================================
// FILE: src/app/(dashboard)/dashboard/DistributorDashboard.tsx
// PURPOSE: Dashboard view for distributor users
// PRD REFERENCE: PRD Section 6.1 - Distributor Dashboard
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

interface DistributorDashboardProps {
  user: {
    firstName: string;
    lastName: string;
    role: string;
  };
  organizationSlug?: string;
}

/**
 * Distributor Dashboard Component
 *
 * WHY: Distributors need to see all their client organizations and monitor
 * relationships, upcoming visits, and alerts across their entire client base.
 *
 * URL-AWARE VIEWS:
 * - /dashboard (ALL): List of all client organizations with stats
 * - /dashboard/o/[slug] (ORG): Specific organization with site list
 * - /dashboard/o/[slug]/s/[slug] (SITE): Specific site details (delegates to SiteDashboard)
 *
 * FEATURES:
 * - Client organization cards with stats
 * - Upcoming scheduled visits
 * - Critical stock alerts across all clients
 * - Quick actions: Add new client, schedule visit
 *
 * EXAMPLE DATA SHOWN:
 * - Organization name
 * - Number of sites
 * - Next scheduled visit
 * - Critical tanks count
 * - Last visit date
 */
export function DistributorDashboard({ user, organizationSlug }: DistributorDashboardProps) {
  const { location } = useLocation();

  /**
   * Configure FAB action based on current view
   * WHY: Context-aware actions for common distributor tasks
   */
  useFABAction(
    location.type === 'ALL'
      ? {
          label: 'Add Client',
          icon: 'plus',
          onClick: () => {
            // TODO: Open add client modal
            console.log('Add client');
          },
        }
      : location.type === 'ORG'
      ? {
          label: 'Log Visit',
          icon: 'clipboard',
          onClick: () => {
            // TODO: Open visit log modal
            console.log('Log visit');
          },
        }
      : null
  );

  // TODO: Fetch organizations from API
  // This will be replaced with real data in Phase 5
  const mockOrganizations = [
    {
      id: '1',
      name: 'ABC Car Wash',
      slug: 'abc-car-wash',
      siteCount: 3,
      nextVisit: '2026-01-20',
      criticalTanks: 2,
      lastVisit: '2026-01-10',
      sites: [
        { id: 's1', name: 'Main Street Location', slug: 'main-street', organizationId: '1' },
        { id: 's2', name: 'Downtown Branch', slug: 'downtown', organizationId: '1' },
        { id: 's3', name: 'Airport Location', slug: 'airport', organizationId: '1' },
      ],
    },
    {
      id: '2',
      name: 'Quick Clean Express',
      slug: 'quick-clean-express',
      siteCount: 5,
      nextVisit: '2026-01-22',
      criticalTanks: 0,
      lastVisit: '2026-01-12',
      sites: [
        { id: 's4', name: 'North Side', slug: 'north-side', organizationId: '2' },
        { id: 's5', name: 'South Side', slug: 'south-side', organizationId: '2' },
      ],
    },
    {
      id: '3',
      name: 'Premium Wash Co.',
      slug: 'premium-wash-co',
      siteCount: 2,
      nextVisit: '2026-01-25',
      criticalTanks: 1,
      lastVisit: '2026-01-14',
      sites: [
        { id: 's6', name: 'Westgate Plaza', slug: 'westgate-plaza', organizationId: '3' },
        { id: 's7', name: 'Eastside Mall', slug: 'eastside-mall', organizationId: '3' },
      ],
    },
  ];

  // Find current org if viewing a specific organization
  const currentOrg = organizationSlug
    ? mockOrganizations.find((o) => o.slug === organizationSlug)
    : null;

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome back, ${user.firstName}!`}
        subtitle="Here's what's happening with your clients"
        action={
          <LocationSwitcher
            organizations={mockOrganizations.map((org) => ({
              id: org.id,
              name: org.name,
              slug: org.slug,
              sites: org.sites,
            }))}
            currentLocation={location}
            canAddNew={true}
            onAddNew={() => {
              // TODO: Open add client modal
              console.log('Add new client');
            }}
          />
        }
      />

      {/* ALL view: Show all client organizations */}
      {location.type === 'ALL' && (
        <div className="space-y-6">
          {/* Stats overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <div className="p-4">
                <p className="text-sm text-text-secondary mb-1">
                  Total Clients
                </p>
                <p className="text-2xl font-bold text-text-primary">
                  {mockOrganizations.length}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <p className="text-sm text-text-secondary mb-1">Total Sites</p>
                <p className="text-2xl font-bold text-text-primary">
                  {mockOrganizations.reduce(
                    (sum, org) => sum + org.siteCount,
                    0
                  )}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <p className="text-sm text-text-secondary mb-1">
                  Critical Alerts
                </p>
                <p className="text-2xl font-bold text-error">
                  {mockOrganizations.reduce(
                    (sum, org) => sum + org.criticalTanks,
                    0
                  )}
                </p>
              </div>
            </Card>
          </div>

          {/* Client list */}
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Your Clients
            </h2>
            <div className="space-y-3">
              {mockOrganizations.map((org) => (
                <Link
                  key={org.id}
                  href={`/dashboard/o/${org.slug}`}
                  className="block"
                >
                  <Card className="cursor-pointer hover:border-primary transition-colors">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-text-primary mb-1">
                            {org.name}
                          </h3>
                          <p className="text-sm text-text-secondary">
                            {org.siteCount} {org.siteCount === 1 ? 'site' : 'sites'}
                          </p>
                        </div>
                        {org.criticalTanks > 0 && (
                          <StatusBadge
                            status="CRITICAL"
                            label={`${org.criticalTanks} Critical`}
                          />
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-text-tertiary">Next Visit</p>
                          <p className="text-text-primary font-medium">
                            {new Date(org.nextVisit).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-text-tertiary">Last Visit</p>
                          <p className="text-text-secondary">
                            {new Date(org.lastVisit).toLocaleDateString()}
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

      {/* ORG view: Show specific organization details */}
      {location.type === 'ORG' && currentOrg && (
        <div className="space-y-6">
          {/* Org stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <div className="p-4">
                <p className="text-sm text-text-secondary mb-1">Sites</p>
                <p className="text-2xl font-bold text-text-primary">
                  {currentOrg.siteCount}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <p className="text-sm text-text-secondary mb-1">Next Visit</p>
                <p className="text-2xl font-bold text-text-primary">
                  {new Date(currentOrg.nextVisit).toLocaleDateString()}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <p className="text-sm text-text-secondary mb-1">
                  Critical Alerts
                </p>
                <p className={`text-2xl font-bold ${currentOrg.criticalTanks > 0 ? 'text-error' : 'text-success'}`}>
                  {currentOrg.criticalTanks}
                </p>
              </div>
            </Card>
          </div>

          {/* Site list */}
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Sites
            </h2>
            <div className="space-y-3">
              {currentOrg.sites.map((site) => (
                <Link
                  key={site.id}
                  href={`/dashboard/o/${currentOrg.slug}/s/${site.slug}`}
                  className="block"
                >
                  <Card className="cursor-pointer hover:border-primary transition-colors">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-text-primary">
                        {site.name}
                      </h3>
                      <p className="text-sm text-text-secondary mt-1">
                        Click to view site details
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ORG view fallback when org not found */}
      {location.type === 'ORG' && !currentOrg && (
        <Card>
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Organization Not Found
            </h3>
            <p className="text-text-secondary">
              The organization you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
            </p>
            <Link
              href="/dashboard"
              className="inline-block mt-4 text-primary hover:underline"
            >
              Return to Dashboard
            </Link>
          </div>
        </Card>
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
