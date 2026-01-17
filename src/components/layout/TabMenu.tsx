// ===========================================
// FILE: src/components/layout/TabMenu.tsx
// PURPOSE: Horizontal tab navigation for desktop/tablet views
// PRD REFERENCE: PRD Section 5 - Navigation Architecture
// USED BY: Dashboard layout for desktop/tablet breakpoints
// ===========================================

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface TabMenuItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface TabMenuProps {
  items: TabMenuItem[];
  className?: string;
}

/**
 * TabMenu Component
 *
 * WHY: Primary navigation for desktop and tablet views. Provides horizontal
 * tab-based navigation below the header. Hidden on mobile where BottomNav is used.
 *
 * DESIGN:
 * - Horizontal tabs with pill-style active state
 * - Active tab has primary (green) background
 * - Visible on md+ breakpoints (768px and above)
 * - Hidden on mobile (< 768px) where BottomNav takes over
 *
 * RESPONSIVE BEHAVIOR:
 * - Mobile (< 768px): Hidden (uses BottomNav instead)
 * - Tablet (768px - 1023px): Visible, centered tabs
 * - Desktop (1024px+): Visible, with more spacing
 */
export function TabMenu({ items, className }: TabMenuProps) {
  const pathname = usePathname();

  // Determine active tab based on current pathname
  const isActive = (href: string) => {
    // Exact match for dashboard root
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    // Prefix match for sub-routes
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={cn(
        // Base styles
        'w-full bg-bg-secondary border-b border-border-light',
        // Hidden on mobile, visible on tablet and desktop
        'hidden md:block',
        className
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start gap-1 py-2">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  // Base styles
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-150',
                  // Focus states
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
                  // Active vs inactive states
                  active
                    ? 'bg-primary text-text-inverse shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                )}
              >
                {item.icon && <span className="w-5 h-5">{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

/**
 * Tab menu icons for common navigation items
 */
export const TabMenuIcons = {
  Overview: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
      />
    </svg>
  ),
  Activity: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      />
    </svg>
  ),
  Products: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  ),
  Analytics: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  ),
};
