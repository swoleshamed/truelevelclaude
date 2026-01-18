// ===========================================
// FILE: src/app/(dashboard)/SiteTabMenu.tsx
// PURPOSE: Tab menu configuration for individual site-level view (SITE location)
// PRD REFERENCE: PRD Section 5 - Navigation Architecture
// USED BY: Dashboard layout when location.type === 'SITE'
// ===========================================

'use client';

import React from 'react';
import { TabMenu, TabMenuIcons, useFAB } from '@/components/layout';
import { useLocation, useCurrentPage } from '@/contexts/LocationContext';
import { buildDashboardUrl } from '@/types';

/**
 * SiteTabMenu Component
 *
 * WHY: Provides the tab navigation for individual site-level view.
 * Shows: Overview, Activity (simplified navigation for site-level)
 * Also includes context-aware action button on the far right.
 *
 * LOCATION-BASED: Only renders when location.type === 'SITE'
 * This represents viewing a specific site's details.
 *
 * URL-AWARE: Tab hrefs dynamically adjust based on current site:
 * /dashboard/o/[orgSlug]/s/[siteSlug], /dashboard/o/[orgSlug]/s/[siteSlug]/activity
 *
 * VISIBLE: Only on tablet (md) and desktop (lg+) breakpoints
 * HIDDEN: On mobile where BottomNav is used
 */
export function SiteTabMenu() {
  const { action } = useFAB();
  const { location } = useLocation();
  const currentPage = useCurrentPage();

  // Only render for site-level view
  if (location.type !== 'SITE') {
    return null;
  }

  const siteTabs = [
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
  ];

  return <TabMenu items={siteTabs} action={action} />;
}
