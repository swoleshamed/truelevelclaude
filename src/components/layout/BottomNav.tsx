// ===========================================
// FILE: src/components/layout/BottomNav.tsx
// PURPOSE: Mobile bottom navigation bar
// PRD REFERENCE: PRD Section 5 - Navigation Architecture, UI Spec - Bottom Navigation
// USED BY: Dashboard layout on mobile devices (< 768px)
// ===========================================

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}

interface BottomNavProps {
  items: NavItem[];
  className?: string;
}

/**
 * BottomNav Component
 *
 * WHY: Mobile-first navigation pattern. Bottom nav bar is easier to reach
 * on mobile devices than top tabs. Hidden on tablet/desktop (≥ 768px).
 *
 * DESIGN (UI Spec):
 * ```
 * ┌─────────────────────────────────────────────────────────────┐
 * │              [+] FAB (floats above)                         │
 * │ [🏠] [📋] [🧪] [📊]                                        │
 * │ Over  Act  Chem  Analytics                                  │
 * └─────────────────────────────────────────────────────────────┘
 * ```
 *
 * RESPONSIVE BEHAVIOR:
 * - Mobile (< 768px): Always visible at bottom
 * - Tablet/Desktop (≥ 768px): Hidden (uses horizontal tabs instead)
 *
 * NAVIGATION ITEMS CHANGE BY LOCATION CONTEXT (PRD Section 5):
 * - All Locations: Overview | Activity | Chemicals | Analytics
 * - Organization: Overview | Activity | Wash Packages | Analytics
 * - Site: Overview | Activity | Wash Packages | Analytics | Settings
 *
 * Note: Site settings is accessible via different means on mobile
 * to keep bottom nav to 4 items max.
 *
 * EXAMPLE:
 * ```tsx
 * <BottomNav
 *   items={[
 *     {
 *       id: 'overview',
 *       label: 'Overview',
 *       icon: <HomeIcon />,
 *       onClick: () => setActiveTab('overview'),
 *       active: activeTab === 'overview'
 *     },
 *     {
 *       id: 'activity',
 *       label: 'Activity',
 *       icon: <ActivityIcon />,
 *       onClick: () => setActiveTab('activity'),
 *       active: activeTab === 'activity'
 *     }
 *   ]}
 * />
 * ```
 *
 * @param items - Array of navigation items
 */
export function BottomNav({ items, className }: BottomNavProps) {
  return (
    <nav
      className={cn(
        // Base styles
        'fixed bottom-0 left-0 right-0 z-20 bg-bg-secondary border-t border-border-light',
        // Padding for safe area (iOS notch, etc.)
        'pb-safe-bottom',
        // Hidden on tablet/desktop (where TabMenu is shown)
        'md:hidden',
        className
      )}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={cn(
              'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-md transition-colors duration-150 min-w-[4rem]',
              item.active
                ? 'text-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
            )}
          >
            {/* Icon */}
            <div className="w-6 h-6">{item.icon}</div>

            {/* Label */}
            <span className="text-xs font-medium truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

/**
 * Common navigation icons
 * WHY: Pre-built icons for standard navigation items
 */
export const NavIcons = {
  Overview: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  ),
  Activity: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      />
    </svg>
  ),
  Chemicals: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
      />
    </svg>
  ),
  WashPackages: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  ),
  Analytics: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  ),
  Settings: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  ),
};
