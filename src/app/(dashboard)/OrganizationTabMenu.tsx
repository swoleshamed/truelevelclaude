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

// Settings icon
const SettingsIcon = (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
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
    {
      id: 'settings',
      label: 'Settings',
      href: '/dashboard/settings',
      icon: SettingsIcon,
    },
  ];

  return <TabMenu items={organizationTabs} action={action} />;
}
