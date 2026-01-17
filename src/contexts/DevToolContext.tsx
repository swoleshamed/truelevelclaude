// ===========================================
// FILE: src/contexts/DevToolContext.tsx
// PURPOSE: Development tool for simulating different user roles
// NOTE: Only active in development mode (NODE_ENV === 'development')
// ===========================================

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import type { UserRole } from '@/types';

interface UserOverride {
  role: UserRole;
  // Optional: add distributorId/organizationId overrides if needed
}

interface DevToolContextValue {
  /** Whether the dev tool is available */
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
const DEV_TOOLS_ENABLED_KEY = 'truelevel-dev-tools-enabled';

/**
 * Check if dev tools should be enabled
 *
 * Enabled when ANY of these are true:
 * 1. NODE_ENV === 'development' (local dev)
 * 2. NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true' (Vercel preview)
 * 3. URL has ?devtools=truelevel (quick access on any deploy)
 * 4. Previously enabled via URL param (persisted to localStorage)
 */
function useDevToolsEnabled(): boolean {
  const searchParams = useSearchParams();
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Check development mode
    const isDev = process.env.NODE_ENV === 'development';

    // Check environment variable (set in Vercel for preview deployments)
    const envEnabled = process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true';

    // Check URL parameter
    const urlParam = searchParams.get('devtools');
    const urlEnabled = urlParam === 'truelevel';

    // Check localStorage (persists URL param activation)
    let storageEnabled = false;
    try {
      storageEnabled = localStorage.getItem(DEV_TOOLS_ENABLED_KEY) === 'true';
    } catch {
      // Ignore localStorage errors
    }

    // If URL param is present, persist to localStorage
    if (urlEnabled) {
      try {
        localStorage.setItem(DEV_TOOLS_ENABLED_KEY, 'true');
      } catch {
        // Ignore localStorage errors
      }
    }

    setIsEnabled(isDev || envEnabled || urlEnabled || storageEnabled);
  }, [searchParams]);

  return isEnabled;
}

/**
 * Dev Tool Provider
 *
 * WHY: Allows developers to quickly switch between user roles to test
 * different UI states without logging in as different users.
 *
 * FEATURES:
 * - Active in development mode, or when enabled via env var/URL param
 * - Persists override to localStorage
 * - Provides hook for components to get effective role
 *
 * ACTIVATION METHODS:
 * 1. Local development (NODE_ENV === 'development')
 * 2. Set NEXT_PUBLIC_ENABLE_DEV_TOOLS=true in Vercel for preview deploys
 * 3. Add ?devtools=truelevel to any URL (persists to localStorage)
 *
 * USAGE:
 * ```tsx
 * const { getEffectiveRole } = useDevTool();
 * const effectiveRole = getEffectiveRole(actualSession.user.role);
 * ```
 */
export function DevToolProvider({ children }: { children: React.ReactNode }) {
  const isDevMode = useDevToolsEnabled();

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
