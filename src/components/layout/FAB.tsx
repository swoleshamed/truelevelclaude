// ===========================================
// FILE: src/components/layout/FAB.tsx
// PURPOSE: Floating Action Button (context-aware)
// PRD REFERENCE: PRD Section 5 - Navigation Architecture, UI Spec - FAB
// USED BY: Dashboard pages for primary actions
// ===========================================

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FABProps {
  onClick: () => void;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * FAB (Floating Action Button) Component
 *
 * WHY: Context-aware primary action button. Changes based on current view.
 * Mobile-first design with large touch target.
 *
 * RESPONSIVE BEHAVIOR (UI Spec):
 * - Mobile (< 1024px): Circular button centered above bottom nav (56px circle)
 * - Desktop (≥ 1024px): Rectangular button in page header
 *
 * CONTEXT-AWARE ACTIONS (PRD Section 5):
 * | Current View              | Action                | Opens                          |
 * |---------------------------|-----------------------|--------------------------------|
 * | All Locations - Overview  | + Log Activity        | Site selector → Visit log      |
 * | All Locations - Chemicals | + Add Chemical        | New chemical template form     |
 * | Org Group - Overview      | + Log Activity        | Site selector → Visit log      |
 * | Org Group - Wash Packages | + Add Package         | New package template form      |
 * | Site - Overview           | + Log Activity        | Visit log modal                |
 * | Site - Wash Packages      | + Add Package         | New package form               |
 * | Site - Chemicals          | + Add Chemical        | Add chemical to site           |
 *
 * DESIGN:
 * - Green primary color
 * - White "+" icon
 * - Elevated shadow
 * - Bottom center on mobile, top right action area on desktop
 *
 * EXAMPLE:
 * ```tsx
 * // Mobile: Circular FAB
 * <FAB
 *   onClick={() => setShowVisitLog(true)}
 *   label="Log Activity"
 * />
 *
 * // Desktop: Rectangular button
 * <FAB
 *   onClick={() => setShowAddChemical(true)}
 *   label="Add Chemical"
 *   icon={<PlusIcon />}
 * />
 * ```
 *
 * @param onClick - Action handler
 * @param label - Button label (desktop: shown, mobile: aria-label)
 * @param icon - Optional custom icon (defaults to +)
 * @param disabled - Disable the button
 */
export function FAB({
  onClick,
  label = 'Add',
  icon,
  disabled = false,
  className,
}: FABProps) {
  const defaultIcon = (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );

  return (
    <>
      {/* Mobile: Circular FAB above bottom nav */}
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={cn(
          // Base styles
          'flex items-center justify-center',
          'bg-primary text-white shadow-lg',
          'transition-all duration-150',
          'focus:outline-none focus:ring-4 focus:ring-primary focus:ring-opacity-50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'hover:bg-primary-hover active:bg-primary-active',
          // Mobile: circular, fixed position
          'fixed bottom-20 left-1/2 -translate-x-1/2 z-30',
          'w-14 h-14 rounded-full',
          // Desktop: hidden (uses rectangular button in header instead)
          'lg:hidden',
          className
        )}
      >
        {icon || defaultIcon}
      </button>

      {/* Desktop: Rectangular button (rendered in page header via context) */}
      {/* This component is just for mobile FAB. Desktop uses Button component in PageHeader */}
    </>
  );
}

/**
 * FABContext Component
 *
 * WHY: Provider for FAB state and action across the app.
 * Allows different pages to set their primary action dynamically.
 *
 * EXAMPLE:
 * ```tsx
 * // In page component
 * const { setFABAction } = useFABContext();
 *
 * useEffect(() => {
 *   setFABAction({
 *     label: 'Log Visit',
 *     icon: <LogIcon />,
 *     onClick: () => setShowVisitLog(true)
 *   });
 * }, []);
 * ```
 */

export interface FABAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

const FABContext = React.createContext<{
  action: FABAction | null;
  setAction: (action: FABAction | null) => void;
} | null>(null);

export function FABProvider({ children }: { children: React.ReactNode }) {
  const [action, setAction] = React.useState<FABAction | null>(null);

  return (
    <FABContext.Provider value={{ action, setAction }}>
      {children}
      {/* FAB is now rendered in TabMenu (desktop/tablet) and BottomNav (mobile) */}
      {/* instead of as a floating button */}
    </FABContext.Provider>
  );
}

export function useFAB() {
  const context = React.useContext(FABContext);
  if (!context) {
    throw new Error('useFAB must be used within FABProvider');
  }
  return context;
}

/**
 * useFABAction Hook
 *
 * WHY: Convenient hook to set FAB action for a page.
 * Automatically clears action on unmount.
 *
 * EXAMPLE:
 * ```tsx
 * function DashboardPage() {
 *   useFABAction({
 *     label: 'Log Activity',
 *     onClick: () => setShowVisitLog(true)
 *   });
 *
 *   return <div>Dashboard content</div>;
 * }
 * ```
 */
export function useFABAction(action: FABAction | null) {
  const { setAction } = useFAB();

  React.useEffect(() => {
    setAction(action);

    // Clear action on unmount
    return () => setAction(null);
  }, [action, setAction]);
}
