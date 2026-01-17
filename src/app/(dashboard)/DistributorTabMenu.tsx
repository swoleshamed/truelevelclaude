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
 * VISIBLE: Only on tablet (md) and desktop (lg+) breakpoints
 * HIDDEN: On mobile where BottomNav is used
 */
export function DistributorTabMenu() {
  const { action } = useFAB();

  const distributorTabs = [
    {
      id: 'overview',
      label: 'Overview',
      href: '/dashboard',
      icon: TabMenuIcons.Overview,
    },
    {
      id: 'activity',
      label: 'Activity',
      href: '/dashboard/activity',
      icon: TabMenuIcons.Activity,
    },
    {
      id: 'products',
      label: 'Products',
      href: '/dashboard/products',
      icon: TabMenuIcons.Products,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: '/dashboard/analytics',
      icon: TabMenuIcons.Analytics,
    },
  ];

  return <TabMenu items={distributorTabs} action={action} />;
}
