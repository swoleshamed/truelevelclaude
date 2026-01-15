// ===========================================
// FILE: src/contexts/LocationContext.tsx
// PURPOSE: Global location context for dashboard navigation
// PRD REFERENCE: PRD Section 5 - Navigation Architecture
// USED BY: All dashboard pages, LocationSwitcher component
// ===========================================

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { LocationContext as LocationContextType } from '@/types';

interface LocationContextValue {
  location: LocationContextType;
  setLocation: (location: LocationContextType) => void;
  isLoading: boolean;
}

const LocationContext = createContext<LocationContextValue | undefined>(
  undefined
);

/**
 * Location Context Provider
 *
 * WHY: Maintains the current location context (All/Org/Site) across the dashboard.
 * This drives what data is displayed and which actions are available.
 *
 * BUSINESS LOGIC (PRD Section 5):
 * - Distributors: Can view ALL, specific ORG, or specific SITE
 * - Org Admins: Can view ORG (all sites) or specific SITE
 * - Site Users: Only see their assigned SITE
 *
 * PERSISTENCE:
 * - Location is stored in localStorage
 * - Restored on page reload
 * - Falls back to user's default context if invalid
 *
 * EXAMPLE:
 * ```tsx
 * const { location, setLocation } = useLocation();
 *
 * // View all clients (distributor only)
 * setLocation({ type: 'ALL' });
 *
 * // View specific organization
 * setLocation({ type: 'ORG', organizationId: 'org-123', organizationName: 'ABC Car Wash' });
 *
 * // View specific site
 * setLocation({
 *   type: 'SITE',
 *   siteId: 'site-456',
 *   siteName: 'Main Street Location',
 *   organizationId: 'org-123',
 *   organizationName: 'ABC Car Wash'
 * });
 * ```
 */
export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<LocationContextType>({
    type: 'ALL',
  });
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load saved location from localStorage on mount
   * WHY: Preserve user's last selected location across sessions
   */
  useEffect(() => {
    const savedLocation = localStorage.getItem('truelevel-location');
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        setLocationState(parsed);
      } catch (error) {
        console.error('Failed to parse saved location:', error);
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * Update location and persist to localStorage
   * WHY: Save user preference for next session
   */
  const setLocation = (newLocation: LocationContextType) => {
    setLocationState(newLocation);
    localStorage.setItem('truelevel-location', JSON.stringify(newLocation));
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, isLoading }}>
      {children}
    </LocationContext.Provider>
  );
}

/**
 * Hook to access location context
 * WHY: Provides type-safe access to location state
 */
export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
