// ===========================================
// FILE: src/components/dev/DevToolPanel.tsx
// PURPOSE: Floating dev panel for switching user roles during development
// NOTE: Only renders in development mode (NODE_ENV === 'development')
// ===========================================

'use client';

import React from 'react';
import { useDevTool } from '@/contexts/DevToolContext';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';

const USER_ROLES: { value: UserRole; label: string; description: string }[] = [
  {
    value: 'DISTRIBUTOR_ADMIN',
    label: 'Distributor Admin',
    description: 'Full access to all clients and features',
  },
  {
    value: 'DISTRIBUTOR_USER',
    label: 'Distributor User',
    description: 'Distributor staff with limited permissions',
  },
  {
    value: 'ORG_ADMIN',
    label: 'Org Admin',
    description: 'Car wash organization administrator',
  },
  {
    value: 'SITE_MANAGER',
    label: 'Site Manager',
    description: 'Manages a specific site location',
  },
  {
    value: 'SITE_USER',
    label: 'Site User',
    description: 'Staff member at a site location',
  },
];

/**
 * Dev Tool Panel Component
 *
 * WHY: Allows quick switching between user roles during development
 * to test role-based UI without changing sessions.
 *
 * FEATURES:
 * - Floating panel in bottom-right corner
 * - Collapsible to minimize distraction
 * - Persists selection to localStorage
 * - Only visible in development mode
 *
 * PLACEMENT:
 * - Positioned above the mobile bottom nav (pb-20)
 * - Right-aligned for easy access
 * - z-index above most content but below modals
 */
export function DevToolPanel() {
  const { isDevMode, userOverride, setUserOverride, isPanelExpanded, togglePanel } =
    useDevTool();

  // Don't render in production
  if (!isDevMode) {
    return null;
  }

  const selectedRole = userOverride?.role;

  const handleRoleChange = (role: UserRole | null) => {
    if (role) {
      setUserOverride({ role });
    } else {
      setUserOverride(null);
    }
  };

  return (
    <div
      className={cn(
        'fixed bottom-20 right-4 z-40 lg:bottom-4',
        'transition-all duration-200 ease-in-out'
      )}
    >
      {/* Collapsed state - just a button */}
      {!isPanelExpanded && (
        <button
          onClick={togglePanel}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg',
            'bg-amber-500 text-white font-medium text-sm',
            'hover:bg-amber-600 transition-colors',
            'border-2 border-amber-600'
          )}
          title="Open Dev Tools"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          DEV
          {selectedRole && (
            <span className="px-1.5 py-0.5 bg-amber-600 rounded text-xs">
              {selectedRole.split('_')[0]}
            </span>
          )}
        </button>
      )}

      {/* Expanded state - full panel */}
      {isPanelExpanded && (
        <div
          className={cn(
            'w-72 rounded-lg shadow-xl overflow-hidden',
            'bg-bg-secondary border-2 border-amber-500'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-amber-500 text-white">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
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
              <span className="font-semibold text-sm">Dev Tools</span>
            </div>
            <button
              onClick={togglePanel}
              className="p-1 hover:bg-amber-600 rounded transition-colors"
              title="Close Dev Tools"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-3">
            <div className="mb-2">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                Simulate User Role
              </label>
            </div>

            {/* Role options */}
            <div className="space-y-1">
              {/* None option - use actual role */}
              <button
                onClick={() => handleRoleChange(null)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                  !selectedRole
                    ? 'bg-primary/10 text-primary border border-primary'
                    : 'hover:bg-bg-tertiary text-text-primary border border-transparent'
                )}
              >
                <div className="font-medium">None (Use Actual)</div>
                <div className="text-xs text-text-secondary">
                  Use your real session role
                </div>
              </button>

              {USER_ROLES.map((role) => (
                <button
                  key={role.value}
                  onClick={() => handleRoleChange(role.value)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                    selectedRole === role.value
                      ? 'bg-primary/10 text-primary border border-primary'
                      : 'hover:bg-bg-tertiary text-text-primary border border-transparent'
                  )}
                >
                  <div className="font-medium">{role.label}</div>
                  <div className="text-xs text-text-secondary">{role.description}</div>
                </button>
              ))}
            </div>

            {/* Info note */}
            <div className="mt-3 p-2 bg-amber-50 rounded-md border border-amber-200">
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> This only affects UI rendering. API calls still use
                your actual session permissions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
