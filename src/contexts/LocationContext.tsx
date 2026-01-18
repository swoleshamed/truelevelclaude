// ===========================================
// FILE: src/contexts/LocationContext.tsx
// PURPOSE: Global location context for dashboard navigation
// PRD REFERENCE: PRD Section 5 - Navigation Architecture
// USED BY: All dashboard pages, LocationSwitcher component
// ===========================================

'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import type { LocationContext as LocationContextType } from '@/types';

interface LocationContextValue {
  location: LocationContextType;
  isLoading: boolean;
}

const LocationContext = createContext<LocationContextValue | undefined>(
  undefined
);

/**
 * Parse URL path to extract location context
 *
 * URL PATTERNS:
 * - /dashboard → ALL
 * - /dashboard/o/[orgSlug] → ORG
 * - /dashboard/o/[orgSlug]/s/[siteSlug] → SITE
 */
function parsePathToLocation(pathname: string): LocationContextType {
  // Match organization pattern: /dashboard/o/[orgSlug]...
  const orgMatch = pathname.match(/^\/dashboard\/o\/([^/]+)/);

  if (!orgMatch) {
    return { type: 'ALL' };
  }

  const orgSlug = orgMatch[1];

  // Match site pattern: /dashboard/o/[orgSlug]/s/[siteSlug]...
  const siteMatch = pathname.match(/^\/dashboard\/o\/([^/]+)\/s\/([^/]+)/);

  if (siteMatch) {
    const siteSlug = siteMatch[2];

    // TODO Phase 5: Fetch actual org/site data from API
    // For now, use slugs as placeholders for names/ids
    return {
      type: 'SITE',
      siteId: siteSlug, // Will be fetched from DB
      siteName: siteSlug, // Will be fetched from DB
      siteSlug,
      organizationId: orgSlug, // Will be fetched from DB
      organizationName: orgSlug, // Will be fetched from DB
      organizationSlug: orgSlug,
    };
  }

  // Organization level
  return {
    type: 'ORG',
    organizationId: orgSlug, // Will be fetched from DB
    organizationName: orgSlug, // Will be fetched from DB
    organizationSlug: orgSlug,
  };
}

/**
 * Location Context Provider
 *
 * WHY: Derives the current location context from the URL path.
 * This enables bookmarkable, shareable URLs for dashboard views.
 *
 * BUSINESS LOGIC (PRD Section 5):
 * - Distributors: Can view ALL, specific ORG, or specific SITE
 * - Org Admins: Can view ORG (all sites) or specific SITE
 * - Site Users: Only see their assigned SITE
 *
 * URL STRUCTURE:
 * - /dashboard → ALL (view all orgs/sites)
 * - /dashboard/o/[orgSlug] → ORG (view specific organization)
 * - /dashboard/o/[orgSlug]/s/[siteSlug] → SITE (view specific site)
 *
 * EXAMPLE USAGE:
 * ```tsx
 * const { location } = useLocation();
 *
 * // Check current view level
 * if (location.type === 'ALL') {
 *   // Show all clients view
 * } else if (location.type === 'ORG') {
 *   // Show organization view
 *   console.log(location.organizationSlug);
 * } else if (location.type === 'SITE') {
 *   // Show site view
 *   console.log(location.siteSlug);
 * }
 * ```
 */
export function LocationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const location = useMemo(() => parsePathToLocation(pathname), [pathname]);

  return (
    <LocationContext.Provider value={{ location, isLoading: false }}>
      {children}
    </LocationContext.Provider>
  );
}

/**
 * Hook to access location context
 * WHY: Provides type-safe access to location state derived from URL
 */
export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

/**
 * Get the current tab page from pathname
 * WHY: Helps determine which tab is active
 *
 * @returns The current tab page or undefined for overview
 */
export function useCurrentPage(): 'activity' | 'chemicals' | 'wash-packages' | 'analytics' | undefined {
  const pathname = usePathname();

  if (pathname.endsWith('/activity')) return 'activity';
  if (pathname.endsWith('/chemicals')) return 'chemicals';
  if (pathname.endsWith('/wash-packages')) return 'wash-packages';
  if (pathname.endsWith('/analytics')) return 'analytics';

  return undefined;
}
