// ===========================================
// FILE: src/app/(dashboard)/DistributorTabMenu.tsx
// PURPOSE: Tab menu configuration for distributor users
// PRD REFERENCE: PRD Section 5 - Navigation Architecture
// USED BY: Dashboard layout for distributor roles
// ===========================================

'use client';

import React from 'react';
import { TabMenu, TabMenuIcons, useFAB } from '@/components/layout';

/**
 * DistributorTabMenu Component
 *
 * WHY: Provides the tab navigation configuration specific to distributor users.
 * Distributors have access to: Overview, Activity, Products, Analytics
 * Also includes context-aware action button on the far right.
 *
 * URL-AWARE: Tab hrefs dynamically adjust based on current location context:
 * - ALL: /dashboard, /dashboard/activity, etc.
 * - ORG: /dashboard/o/[slug], /dashboard/o/[slug]/activity, etc.
 * - SITE: /dashboard/o/[slug]/s/[slug], /dashboard/o/[slug]/s/[slug]/activity, etc.
 *
 * VISIBLE: Only on tablet (md) and desktop (lg+) breakpoints
 * HIDDEN: On mobile where BottomNav is used
 */
export function DistributorTabMenu() {
  const { action } = useFAB();

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
      id: 'products',
      label: 'Products',
      href: buildDashboardUrl(location, 'products'),
      icon: TabMenuIcons.Products,
      active: currentPage === 'products',
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
