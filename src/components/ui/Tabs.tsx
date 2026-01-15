// ===========================================
// FILE: src/components/ui/Tabs.tsx
// PURPOSE: Reusable tabs component for navigation
// PRD REFERENCE: PRD Section 5 - Navigation Architecture, UI Spec - Tabs
// USED BY: Dashboard navigation (changes based on location level)
// ===========================================

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  content?: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  value?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

/**
 * Tabs Component
 *
 * WHY: Core navigation pattern for TrueLevel. Tabs change based on the
 * current location context (All Locations, Organization, Site).
 *
 * BUSINESS LOGIC (PRD Section 5):
 * - Level 1 (All Locations): OVERVIEW | ACTIVITY | CHEMICALS | ANALYTICS
 * - Level 2 (Organization): OVERVIEW | ACTIVITY | WASH PACKAGES | ANALYTICS
 * - Level 3 (Site): OVERVIEW | ACTIVITY | WASH PACKAGES | ANALYTICS | LOCATION SETTINGS
 *
 * DESIGN:
 * - Horizontal pill-style tabs (UI Spec)
 * - Active tab has green background
 * - Rounded container with warm tertiary background
 *
 * EXAMPLE:
 * ```tsx
 * <Tabs
 *   tabs={[
 *     { id: 'overview', label: 'OVERVIEW', content: <OverviewTab /> },
 *     { id: 'activity', label: 'ACTIVITY', content: <ActivityTab /> },
 *     { id: 'chemicals', label: 'CHEMICALS', content: <ChemicalsTab /> },
 *   ]}
 *   defaultTab="overview"
 * />
 * ```
 *
 * @param tabs - Array of tab objects
 * @param defaultTab - Initially active tab ID
 * @param value - Controlled active tab ID
 * @param onChange - Callback when tab changes (for controlled mode)
 * @param className - Additional classes
 */
export function Tabs({
  tabs,
  defaultTab,
  value,
  onChange,
  className,
}: TabsProps) {
  // Controlled vs uncontrolled state
  const [internalValue, setInternalValue] = useState(
    defaultTab || tabs[0]?.id
  );

  const activeTab = value !== undefined ? value : internalValue;

  const handleTabChange = (tabId: string) => {
    if (value === undefined) {
      setInternalValue(tabId);
    }
    onChange?.(tabId);
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={cn('w-full', className)}>
      {/* Tab buttons */}
      <div className="bg-bg-tertiary rounded-lg p-1 inline-flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              'px-4 py-2 rounded-md font-medium text-sm transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              activeTab === tab.id
                ? 'bg-primary text-text-inverse shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTabContent && (
        <div className="mt-6">{activeTabContent}</div>
      )}
    </div>
  );
}

/**
 * TabPanel Component
 *
 * WHY: Wrapper for tab content with consistent styling and accessibility.
 * Use when building custom tab layouts.
 *
 * EXAMPLE:
 * ```tsx
 * <TabPanel id="overview" activeTab={activeTab}>
 *   <OverviewContent />
 * </TabPanel>
 * ```
 */
export function TabPanel({
  id,
  activeTab,
  children,
  className,
}: {
  id: string;
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (id !== activeTab) return null;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${id}`}
      aria-labelledby={`tab-${id}`}
      className={className}
    >
      {children}
    </div>
  );
}
