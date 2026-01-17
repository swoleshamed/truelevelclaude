// ===========================================
// FILE: src/contexts/DevToolContext.tsx
// PURPOSE: Development tool for simulating different user roles
// NOTE: Only active in development mode (NODE_ENV === 'development')
// ===========================================

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserRole } from '@/types';

interface UserOverride {
  role: UserRole;
  // Optional: add distributorId/organizationId overrides if needed
}

interface DevToolContextValue {
  /** Whether the dev tool is available (only in development) */
  isDevMode: boolean;
  /** The current user override, if any */
  userOverride: UserOverride | null;
  /** Set a user role override */
  setUserOverride: (override: UserOverride | null) => void;
  /** Whether the dev panel is expanded */
  isPanelExpanded: boolean;
  /** Toggle the dev panel */
  togglePanel: () => void;
  /** Get the effective role (override or actual) */
  getEffectiveRole: (actualRole: UserRole) => UserRole;
}

const DevToolContext = createContext<DevToolContextValue | undefined>(undefined);

const STORAGE_KEY = 'truelevel-dev-user-override';
const PANEL_KEY = 'truelevel-dev-panel-expanded';

/**
 * Dev Tool Provider
 *
 * WHY: Allows developers to quickly switch between user roles to test
 * different UI states without logging in as different users.
 *
 * FEATURES:
 * - Only active in development mode
 * - Persists override to localStorage
 * - Provides hook for components to get effective role
 *
 * USAGE:
 * ```tsx
 * const { getEffectiveRole } = useDevTool();
 * const effectiveRole = getEffectiveRole(actualSession.user.role);
 * ```
 */
export function DevToolProvider({ children }: { children: React.ReactNode }) {
  const isDevMode = process.env.NODE_ENV === 'development';

  const [userOverride, setUserOverrideState] = useState<UserOverride | null>(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load persisted state from localStorage after hydration
  useEffect(() => {
    if (!isDevMode) return;

    try {
      const storedOverride = localStorage.getItem(STORAGE_KEY);
      if (storedOverride) {
        setUserOverrideState(JSON.parse(storedOverride));
      }

      const storedPanelState = localStorage.getItem(PANEL_KEY);
      if (storedPanelState) {
        setIsPanelExpanded(JSON.parse(storedPanelState));
      }
    } catch {
      // Ignore localStorage errors
    }

    setIsHydrated(true);
  }, [isDevMode]);

  const setUserOverride = useCallback((override: UserOverride | null) => {
    setUserOverrideState(override);
    try {
      if (override) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(override));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const togglePanel = useCallback(() => {
    setIsPanelExpanded((prev) => {
      const newValue = !prev;
      try {
        localStorage.setItem(PANEL_KEY, JSON.stringify(newValue));
      } catch {
        // Ignore localStorage errors
      }
      return newValue;
    });
  }, []);

  const getEffectiveRole = useCallback(
    (actualRole: UserRole): UserRole => {
      if (!isDevMode || !userOverride) {
        return actualRole;
      }
      return userOverride.role;
    },
    [isDevMode, userOverride]
  );

  // Don't render dev tools in production
  if (!isDevMode) {
    return <>{children}</>;
  }

  return (
    <DevToolContext.Provider
      value={{
        isDevMode,
        userOverride: isHydrated ? userOverride : null,
        setUserOverride,
        isPanelExpanded: isHydrated ? isPanelExpanded : false,
        togglePanel,
        getEffectiveRole,
      }}
    >
      {children}
    </DevToolContext.Provider>
  );
}

/**
 * Hook to access dev tool context
 *
 * WHY: Provides type-safe access to dev tool functionality
 *
 * NOTE: Safe to use in both dev and production - returns safe defaults
 * when not in development mode
 */
export function useDevTool() {
  const context = useContext(DevToolContext);

  // Return safe defaults if not in dev mode or outside provider
  if (!context) {
    return {
      isDevMode: false,
      userOverride: null,
      setUserOverride: () => {},
      isPanelExpanded: false,
      togglePanel: () => {},
      getEffectiveRole: (actualRole: UserRole) => actualRole,
    };
  }

  return context;
}
