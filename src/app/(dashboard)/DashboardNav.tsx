// ===========================================
// FILE: src/app/(dashboard)/DashboardNav.tsx
// PURPOSE: Client component for dashboard bottom navigation
// PRD REFERENCE: PRD Section 5 - Navigation Architecture
// USED BY: Dashboard layout
// ===========================================

'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BottomNav } from '@/components/layout';

/**
 * DashboardNav Component
 *
 * WHY: Provides consistent bottom navigation across all dashboard pages.
 * Wraps BottomNav component with route-aware navigation items.
 *
 * NAVIGATION ITEMS (PRD Section 5):
 * - Dashboard: Main overview page
 * - Chemicals: Chemical catalog and inventory
 * - Visits: Visit logging and history
 * - Calendar: Schedule and upcoming visits
 *
 * FUTURE: Navigation items could be customized based on user role
 */
export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();

  /**
   * Navigation items configuration
   * WHY: Centralized nav configuration with icons and routing
   */
  const navItems = [
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
      active: pathname === '/dashboard',
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
      active: pathname.startsWith('/chemicals'),
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
      active: pathname.startsWith('/visits'),
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
      active: pathname.startsWith('/calendar'),
    },
  ];

  return <BottomNav items={navItems} />;
}
