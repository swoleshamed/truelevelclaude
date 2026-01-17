// ===========================================
// FILE: src/app/(dashboard)/OrganizationTabMenu.tsx
// PURPOSE: Tab menu configuration for organization admin users
// PRD REFERENCE: PRD Section 5 - Navigation Architecture
// USED BY: Dashboard layout for ORG_ADMIN role
// ===========================================

'use client';

import React from 'react';
import { TabMenu, TabMenuIcons, useFAB } from '@/components/layout';

// Wash Packages icon
const WashPackagesIcon = (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);

/**
 * OrganizationTabMenu Component
 *
 * WHY: Provides the tab navigation configuration specific to organization admin users.
 * Organization admins have access to: Overview, Activity, Wash Packages, Analytics
 * Also includes context-aware action button on the far right.
 *
 * VISIBLE: Only on tablet (md) and desktop (lg+) breakpoints
 * HIDDEN: On mobile where BottomNav is used
 */
export function OrganizationTabMenu() {
  const { action } = useFAB();

  const organizationTabs = [
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
      id: 'wash-packages',
      label: 'Wash Packages',
      href: '/dashboard/wash-packages',
      icon: WashPackagesIcon,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: '/dashboard/analytics',
      icon: TabMenuIcons.Analytics,
    },
  ];

  return <TabMenu items={organizationTabs} action={action} />;
}
