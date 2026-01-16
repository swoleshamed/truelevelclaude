// ===========================================
// FILE: src/app/(dashboard)/analytics/page.tsx
// PURPOSE: Analytics page with role-based views
// PRD REFERENCE: PRD Section 7 - Analytics & Reporting
// ===========================================

'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { SiteAnalyticsDashboard } from './SiteAnalyticsDashboard';

interface Site {
  id: string;
  name: string;
}

interface Organization {
  id: string;
  name: string;
  sites: Site[];
}

/**
 * Analytics Page
 *
 * WHY: Central analytics hub with role-appropriate views.
 *
 * ROLE-BASED VIEWS:
 * - DISTRIBUTOR_ADMIN/DISTRIBUTOR_USER: Portfolio analytics across all client orgs
 * - ORG_ADMIN: Organization-wide analytics with site comparison
 * - SITE_MANAGER/SITE_USER: Single site analytics
 *
 * ROUTING:
 * - Distributors see organization selector
 * - Org admins see site comparison or site selector
 * - Site users see their assigned sites
 */
export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const [sites, setSites] = useState<Site[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch accessible sites/organizations based on role
   */
  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { role } = session!.user;

      if (role === 'DISTRIBUTOR_ADMIN' || role === 'DISTRIBUTOR_USER') {
        // Fetch organizations for distributor
        const response = await fetch('/api/organizations');
        if (response.ok) {
          const data = await response.json();
          setOrganizations(data.organizations || data || []);

          // Flatten sites from all organizations
          const allSites = (data.organizations || data || []).flatMap(
            (org: Organization) => org.sites || []
          );
          setSites(allSites);
        }
      } else if (role === 'ORG_ADMIN') {
        // Fetch sites for organization admin
        const response = await fetch('/api/sites');
        if (response.ok) {
          const data = await response.json();
          setSites(data.sites || data || []);
        }
      } else {
        // Fetch assigned sites for site users
        const response = await fetch('/api/sites?assigned=true');
        if (response.ok) {
          const data = await response.json();
          setSites(data.sites || data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-text-secondary">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            Authentication Required
          </h2>
          <p className="text-yellow-700">
            Please sign in to access analytics.
          </p>
        </div>
      </div>
    );
  }

  const { role } = session.user;

  /**
   * Render view based on role
   */
  if (role === 'DISTRIBUTOR_ADMIN' || role === 'DISTRIBUTOR_USER') {
    // Distributor view - show portfolio analytics
    return (
      <DistributorAnalyticsDashboard
        organizations={organizations}
        sites={sites}
      />
    );
  }

  if (role === 'ORG_ADMIN') {
    // Organization admin view - site comparison
    return <SiteAnalyticsDashboard sites={sites} />;
  }

  // Site manager/user view - single or multi-site
  return <SiteAnalyticsDashboard sites={sites} />;
}

/**
 * Distributor Analytics Dashboard
 *
 * WHY: Distributors need portfolio-level view across all client organizations.
 */
interface DistributorAnalyticsDashboardProps {
  organizations: Organization[];
  sites: Site[];
}

function DistributorAnalyticsDashboard({
  organizations,
  sites,
}: DistributorAnalyticsDashboardProps) {
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [filteredSites, setFilteredSites] = useState<Site[]>(sites);

  useEffect(() => {
    if (selectedOrgId) {
      const org = organizations.find((o) => o.id === selectedOrgId);
      setFilteredSites(org?.sites || []);
    } else {
      setFilteredSites(sites);
    }
  }, [selectedOrgId, organizations, sites]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Portfolio Analytics
        </h1>
        <p className="text-text-secondary">
          View analytics across your client organizations
        </p>
      </div>

      {/* Organization Filter */}
      <div className="mb-6">
        <select
          value={selectedOrgId}
          onChange={(e) => setSelectedOrgId(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 border border-border rounded-md bg-bg-secondary text-text-primary"
        >
          <option value="">All Organizations</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      {/* Site Analytics */}
      <SiteAnalyticsDashboard sites={filteredSites} />
    </div>
  );
}
