// ===========================================
// FILE: src/app/(dashboard)/DistributorTabMenu.tsx
// PURPOSE: Tab menu configuration for distributor-level view (ALL locations)
// PRD REFERENCE: PRD Section 5 - Navigation Architecture
// USED BY: Dashboard layout when location.type === 'ALL'
// ===========================================

'use client';

import React from 'react';
import { TabMenu, TabMenuIcons, useFAB } from '@/components/layout';
import { useLocation, useCurrentPage } from '@/contexts/LocationContext';
import { buildDashboardUrl } from '@/types';

/**
 * DistributorTabMenu Component
 *
 * WHY: Provides the tab navigation for distributor-level view (ALL locations).
 * Shows: Overview, Activity, Chemicals, Analytics
 * Also includes context-aware action button on the far right.
 *
 * LOCATION-BASED: Only renders when location.type === 'ALL'
 * This represents the distributor's view of all their clients/sites.
 *
 * VISIBLE: Only on tablet (md) and desktop (lg+) breakpoints
 * HIDDEN: On mobile where BottomNav is used
 */
export function DistributorTabMenu() {
  const { action } = useFAB();
  const { location } = useLocation();
  const currentPage = useCurrentPage();

  // Only render for distributor-level view (ALL locations)
  if (location.type !== 'ALL') {
    return null;
  }

  const distributorTabs = [
    {
      id: 'overview',
      label: 'Overview',
      href: buildDashboardUrl(location),
      icon: TabMenuIcons.Overview,
      active: currentPage === undefined,
    },
    {
      id: 'activity',
      label: 'Activity',
      href: buildDashboardUrl(location, 'activity'),
      icon: TabMenuIcons.Activity,
      active: currentPage === 'activity',
    },
    {
      id: 'chemicals',
      label: 'Chemicals',
      href: buildDashboardUrl(location, 'chemicals'),
      icon: TabMenuIcons.Chemicals,
      active: currentPage === 'chemicals',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: buildDashboardUrl(location, 'analytics'),
      icon: TabMenuIcons.Analytics,
      active: currentPage === 'analytics',
    },
  ];

  return <TabMenu items={distributorTabs} action={action} />;
}
