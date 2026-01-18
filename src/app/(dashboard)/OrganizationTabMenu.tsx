// ===========================================
// FILE: src/app/(dashboard)/OrganizationTabMenu.tsx
// PURPOSE: Tab menu configuration for organization-level view (ORG location)
// PRD REFERENCE: PRD Section 5 - Navigation Architecture
// USED BY: Dashboard layout when location.type === 'ORG'
// ===========================================

'use client';

import React from 'react';
import { TabMenu, TabMenuIcons, useFAB } from '@/components/layout';
import { useLocation, useCurrentPage } from '@/contexts/LocationContext';
import { buildDashboardUrl } from '@/types';

/**
 * OrganizationTabMenu Component
 *
 * WHY: Provides the tab navigation for organization-level view.
 * Shows: Overview, Activity, Wash Packages, Analytics
 * Also includes context-aware action button on the far right.
 *
 * LOCATION-BASED: Only renders when location.type === 'ORG'
 * This represents viewing a specific organization's sites.
 *
 * URL-AWARE: Tab hrefs dynamically adjust based on current organization:
 * /dashboard/o/[orgSlug], /dashboard/o/[orgSlug]/activity, etc.
 *
 * VISIBLE: Only on tablet (md) and desktop (lg+) breakpoints
 * HIDDEN: On mobile where BottomNav is used
 */
export function OrganizationTabMenu() {
  const { action } = useFAB();
  const { location } = useLocation();
  const currentPage = useCurrentPage();

  // Only render for organization-level view
  if (location.type !== 'ORG') {
    return null;
  }

  const organizationTabs = [
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
      id: 'wash-packages',
      label: 'Wash Packages',
      href: buildDashboardUrl(location, 'wash-packages'),
      icon: TabMenuIcons.WashPackages,
      active: currentPage === 'wash-packages',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: buildDashboardUrl(location, 'analytics'),
      icon: TabMenuIcons.Analytics,
      active: currentPage === 'analytics',
    },
  ];

  return <TabMenu items={organizationTabs} action={action} />;
}
