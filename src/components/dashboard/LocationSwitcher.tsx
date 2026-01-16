// ===========================================
// FILE: src/components/dashboard/LocationSwitcher.tsx
// PURPOSE: Dropdown for switching between locations (All/Org/Site)
// PRD REFERENCE: PRD Section 5 - Navigation Architecture, UI Spec - Location Switcher
// USED BY: Dashboard header, determines which tabs are displayed
// ===========================================

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { LocationContext } from '@/types';

interface Organization {
  id: string;
  name: string;
  sites: Site[];
}

interface Site {
  id: string;
  name: string;
  organizationId: string;
}

interface LocationSwitcherProps {
  organizations: Organization[];
  currentLocation: LocationContext;
  onLocationChange: (location: LocationContext) => void;
  canAddNew?: boolean;
  onAddNew?: () => void;
  className?: string;
}

/**
 * LocationSwitcher Component
 *
 * WHY: Core navigation pattern for TrueLevel. The selected location determines
 * which tabs are displayed (PRD Section 5 - Navigation Architecture).
 *
 * BUSINESS LOGIC:
 * - Level 1 (All Locations): Shows all client orgs and sites (distributor view)
 * - Level 2 (Organization): Shows all sites within one organization
 * - Level 3 (Site): Shows single site details
 *
 * DESIGN (UI Spec):
 * - Dropdown with search field at top
 * - "All Locations" option with HQ badge
 * - Organizations grouped with nested sites
 * - "+ Add New Group or Site" at bottom (if permission)
 * - Search filters by org and site names
 *
 * TAB CHANGES BY LEVEL:
 * - All: OVERVIEW | ACTIVITY | CHEMICALS | ANALYTICS
 * - Org: OVERVIEW | ACTIVITY | WASH PACKAGES | ANALYTICS
 * - Site: OVERVIEW | ACTIVITY | WASH PACKAGES | ANALYTICS | LOCATION SETTINGS
 *
 * EXAMPLE:
 * ```tsx
 * <LocationSwitcher
 *   organizations={organizations}
 *   currentLocation={currentLocation}
 *   onLocationChange={handleLocationChange}
 *   canAddNew={user.role === 'DISTRIBUTOR_ADMIN'}
 *   onAddNew={() => setShowAddModal(true)}
 * />
 * ```
 *
 * @param organizations - Array of organizations with nested sites
 * @param currentLocation - Currently selected location
 * @param onLocationChange - Callback when location changes
 * @param canAddNew - Show "+ Add New" option (permission check)
 * @param onAddNew - Callback for adding new org/site
 */
export function LocationSwitcher({
  organizations,
  currentLocation,
  onLocationChange,
  canAddNew = false,
  onAddNew,
  className,
}: LocationSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Get current location display name
  const getCurrentLocationName = (): string => {
    if (currentLocation.level === 'all') {
      return 'All Locations';
    }

    if (currentLocation.level === 'organization') {
      const org = organizations.find((o) => o.id === currentLocation.organizationId);
      return org?.name || 'Organization';
    }

    if (currentLocation.level === 'site') {
      const org = organizations.find((o) =>
        o.sites.some((s) => s.id === currentLocation.siteId)
      );
      const site = org?.sites.find((s) => s.id === currentLocation.siteId);
      return site?.name || 'Site';
    }

    return 'Select Location';
  };

  // Filter organizations and sites by search query
  const filteredOrganizations = organizations
    .map((org) => ({
      ...org,
      sites: org.sites.filter((site) =>
        site.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(
      (org) =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.sites.length > 0
    );

  // Handle location selection
  const handleSelectAll = () => {
    onLocationChange({ level: 'all' });
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleSelectOrganization = (orgId: string) => {
    onLocationChange({ level: 'organization', organizationId: orgId });
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleSelectSite = (siteId: string, orgId: string) => {
    onLocationChange({ level: 'site', siteId, organizationId: orgId });
    setIsOpen(false);
    setSearchQuery('');
  };

  const isCurrentSite = (siteId: string) =>
    currentLocation.level === 'site' && currentLocation.siteId === siteId;

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-md',
          'bg-bg-secondary border border-border-medium',
          'hover:bg-bg-tertiary transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1'
        )}
      >
        <svg
          className="w-5 h-5 text-text-secondary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span className="font-medium text-text-primary">
          {getCurrentLocationName()}
        </span>
        <svg
          className={cn(
            'w-4 h-4 text-text-secondary transition-transform duration-150',
            isOpen && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-bg-secondary border border-border-light rounded-lg shadow-lg z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Search input */}
          <div className="p-3 border-b border-border-light">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search company or site..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="flex-1 overflow-y-auto py-2">
            {/* All Locations option */}
            <button
              onClick={handleSelectAll}
              className={cn(
                'w-full px-4 py-2 text-left hover:bg-bg-tertiary transition-colors duration-150 flex items-center justify-between',
                currentLocation.level === 'all' && 'bg-bg-tertiary'
              )}
            >
              <span className="font-medium text-text-primary">
                All Locations
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-primary text-white">
                HQ
              </span>
            </button>

            <div className="my-2 border-t border-border-light" />

            {/* Organizations and sites */}
            {filteredOrganizations.map((org) => (
              <div key={org.id} className="mb-2">
                {/* Organization name */}
                <button
                  onClick={() => handleSelectOrganization(org.id)}
                  className={cn(
                    'w-full px-4 py-2 text-left hover:bg-bg-tertiary transition-colors duration-150 font-medium text-text-primary text-sm',
                    currentLocation.level === 'organization' &&
                      currentLocation.organizationId === org.id &&
                      'bg-bg-tertiary'
                  )}
                >
                  {org.name.toUpperCase()}
                </button>

                {/* Sites within organization */}
                {org.sites.map((site) => (
                  <button
                    key={site.id}
                    onClick={() => handleSelectSite(site.id, org.id)}
                    className={cn(
                      'w-full pl-8 pr-4 py-2 text-left hover:bg-bg-tertiary transition-colors duration-150 text-text-primary text-sm flex items-center',
                      isCurrentSite(site.id) && 'bg-bg-tertiary'
                    )}
                  >
                    {isCurrentSite(site.id) && (
                      <svg
                        className="w-4 h-4 mr-2 text-primary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <span>{site.name}</span>
                  </button>
                ))}
              </div>
            ))}

            {/* No results */}
            {filteredOrganizations.length === 0 && (
              <div className="px-4 py-6 text-center text-text-secondary text-sm">
                No locations found
              </div>
            )}
          </div>

          {/* Add new option */}
          {canAddNew && onAddNew && (
            <>
              <div className="border-t border-border-light" />
              <button
                onClick={() => {
                  onAddNew();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-bg-tertiary transition-colors duration-150 flex items-center gap-2 text-primary font-medium text-sm"
              >
                <svg
                  className="w-5 h-5"
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
                Add New Group or Site
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
