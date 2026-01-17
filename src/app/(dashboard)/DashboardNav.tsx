// ===========================================
// FILE: src/app/(dashboard)/DashboardNav.tsx
// PURPOSE: Client component for dashboard bottom navigation
// PRD REFERENCE: PRD Section 5 - Navigation Architecture
// USED BY: Dashboard layout
// ===========================================

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/layout';
import { useLocation, useCurrentPage } from '@/contexts/LocationContext';
import { buildDashboardUrl } from '@/types';

interface DashboardNavProps {
  userRole: string;
}

/**
 * DashboardNav Component
 *
 * WHY: Provides consistent bottom navigation across all dashboard pages.
 * Wraps BottomNav component with route-aware navigation items.
 *
 * URL-AWARE: Navigation hrefs dynamically adjust based on current location context.
 *
 * NAVIGATION ITEMS BY ROLE:
 * - Distributors: Overview, Activity, Products, Analytics
 * - Others: Dashboard, Chemicals, Visits, Calendar
 */
export function DashboardNav({ userRole }: DashboardNavProps) {
  const router = useRouter();
  const { location } = useLocation();
  const currentPage = useCurrentPage();

  const isDistributor =
    userRole === 'DISTRIBUTOR_ADMIN' || userRole === 'DISTRIBUTOR_USER';

  /**
   * Distributor navigation items
   * WHY: Distributors have different navigation needs focused on their clients
   */
  const distributorNavItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: (
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
            d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
          />
        </svg>
      ),
      onClick: () => router.push(buildDashboardUrl(location)),
      active: currentPage === undefined,
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: (
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
      onClick: () => router.push(buildDashboardUrl(location, 'activity')),
      active: currentPage === 'activity',
    },
    {
      id: 'products',
      label: 'Products',
      icon: (
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
      ),
      onClick: () => router.push(buildDashboardUrl(location, 'products')),
      active: currentPage === 'products',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: (
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
      ),
      onClick: () => router.push(buildDashboardUrl(location, 'analytics')),
      active: currentPage === 'analytics',
    },
  ];

  /**
   * Default navigation items (for non-distributor roles)
   * WHY: Different user roles have different navigation needs
   */
  const defaultNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
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
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      onClick: () => router.push('/dashboard'),
      active: currentPage === undefined,
    },
    {
      id: 'chemicals',
      label: 'Chemicals',
      icon: (
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
      ),
      onClick: () => router.push('/chemicals'),
      active: false, // TODO: Update when chemicals routes are scoped
    },
    {
      id: 'visits',
      label: 'Visits',
      icon: (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      onClick: () => router.push('/visits'),
      active: false, // TODO: Update when visits routes are scoped
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: (
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
      ),
      onClick: () => router.push('/calendar'),
      active: false, // TODO: Update when calendar routes are scoped
    },
  ];

  const navItems = isDistributor ? distributorNavItems : defaultNavItems;

  return <BottomNav items={navItems} />;
}
