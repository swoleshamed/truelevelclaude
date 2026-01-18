// ===========================================
// FILE: src/app/(dashboard)/DashboardNav.tsx
// PURPOSE: Client component for dashboard bottom navigation (mobile)
// PRD REFERENCE: PRD Section 5 - Navigation Architecture
// USED BY: Dashboard layout
// ===========================================

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav, useFAB } from '@/components/layout';
import { useLocation, useCurrentPage } from '@/contexts/LocationContext';
import { buildDashboardUrl } from '@/types';

/**
 * DashboardNav Component
 *
 * WHY: Provides consistent bottom navigation across all dashboard pages (mobile).
 * Wraps BottomNav component with route-aware navigation items.
 *
 * URL-AWARE: Navigation hrefs dynamically adjust based on current location context.
 *
 * NAVIGATION ITEMS BY LOCATION TYPE:
 * - ALL (Distributor): Overview, Activity, [Action], Chemicals, Analytics
 * - ORG (Site Organization): Overview, Activity, [Action], Wash Packages, Analytics
 * - SITE (Individual Site): Overview, [Action], Activity
 */
export function DashboardNav() {
  const router = useRouter();
  const { action } = useFAB();
  const { location } = useLocation();
  const currentPage = useCurrentPage();

  // Common icons for navigation items
  const icons = {
    overview: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      </svg>
    ),
    activity: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
    chemicals: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        />
      </svg>
    ),
    washPackages: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
    analytics: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  };

  /**
   * Distributor-level navigation items (location.type === 'ALL')
   * WHY: Distributors managing all their clients see Chemicals tab
   */
  const distributorNavItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: icons.overview,
      onClick: () => router.push(buildDashboardUrl(location)),
      active: currentPage === undefined,
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: icons.activity,
      onClick: () => router.push(buildDashboardUrl(location, 'activity')),
      active: currentPage === 'activity',
    },
    {
      id: 'chemicals',
      label: 'Chemicals',
      icon: icons.chemicals,
      onClick: () => router.push(buildDashboardUrl(location, 'chemicals')),
      active: currentPage === 'chemicals',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: icons.analytics,
      onClick: () => router.push(buildDashboardUrl(location, 'analytics')),
      active: currentPage === 'analytics',
    },
  ];

  /**
   * Organization-level navigation items (location.type === 'ORG')
   * WHY: Org admins managing their sites see Wash Packages tab
   */
  const organizationNavItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: icons.overview,
      onClick: () => router.push(buildDashboardUrl(location)),
      active: currentPage === undefined,
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: icons.activity,
      onClick: () => router.push(buildDashboardUrl(location, 'activity')),
      active: currentPage === 'activity',
    },
    {
      id: 'wash-packages',
      label: 'Packages',
      icon: icons.washPackages,
      onClick: () => router.push(buildDashboardUrl(location, 'wash-packages')),
      active: currentPage === 'wash-packages',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: icons.analytics,
      onClick: () => router.push(buildDashboardUrl(location, 'analytics')),
      active: currentPage === 'analytics',
    },
  ];

  /**
   * Site-level navigation items (location.type === 'SITE')
   * WHY: Individual site view has simplified navigation
   */
  const siteNavItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: icons.overview,
      onClick: () => router.push(buildDashboardUrl(location)),
      active: currentPage === undefined,
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: icons.activity,
      onClick: () => router.push(buildDashboardUrl(location, 'activity')),
      active: currentPage === 'activity',
    },
  ];

  // Select nav items based on location type
  const getNavItems = () => {
    switch (location.type) {
      case 'ALL':
        return distributorNavItems;
      case 'ORG':
        return organizationNavItems;
      case 'SITE':
        return siteNavItems;
      default:
        return siteNavItems;
    }
  };

  // Determine action button position based on number of items
  // For 4 items: position 2 (middle)
  // For 2 items: position 1 (middle)
  const actionPosition = location.type === 'SITE' ? 1 : 2;

  return (
    <BottomNav
      items={getNavItems()}
      action={action}
      actionPosition={actionPosition}
    />
  );
}
