// ===========================================
// FILE: src/app/(dashboard)/chemicals/page.tsx
// PURPOSE: Chemical catalog page - role-specific views
// PRD REFERENCE: PRD Section 3 - Chemical Management
// ===========================================

import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DistributorChemicalCatalog } from './DistributorChemicalCatalog';
import { OrganizationChemicalCatalog } from './OrganizationChemicalCatalog';
import { SiteChemicalCatalog } from './SiteChemicalCatalog';

/**
 * Chemicals Page
 *
 * WHY: Chemical management works differently for each role.
 * Routes to appropriate view based on user's role and permissions.
 *
 * ROUTING LOGIC (PRD Section 3):
 * - DISTRIBUTOR: Manage chemical master catalog
 * - ORGANIZATION: View available chemicals, configure for sites
 * - SITE: View assigned chemicals, manage applications
 *
 * DATA HIERARCHY:
 * 1. ChemicalMaster (distributor creates)
 * 2. ChemicalOrgConfig (distributor configures pricing/containers for org)
 * 3. ChemicalSiteConfig (org/site configures alert thresholds)
 * 4. ChemicalSiteApplication (site assigns to tanks with injector/tip)
 */
export default async function ChemicalsPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const { id: userId, role } = session.user;

  /**
   * Route to appropriate catalog based on role
   * WHY: Each role has different chemical management capabilities
   */

  // DISTRIBUTOR ROLES: Manage master catalog
  if (role === 'DISTRIBUTOR_ADMIN' || role === 'DISTRIBUTOR_USER') {
    const distributorId = session.user.distributorId;

    if (!distributorId) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">
              No Distributor Assignment
            </h2>
            <p className="text-yellow-700">
              Your account is not associated with a distributor. Please contact
              support.
            </p>
          </div>
        </div>
      );
    }

    return (
      <DistributorChemicalCatalog
        distributorId={distributorId}
        canEdit={role === 'DISTRIBUTOR_ADMIN'}
      />
    );
  }

  // ORGANIZATION ROLES: View org chemicals, configure for sites
  if (role === 'ORG_ADMIN' || role === 'ORG_USER') {
    const organizationId = session.user.organizationId;

    if (!organizationId) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">
              No Organization Assignment
            </h2>
            <p className="text-yellow-700">
              Your account is not associated with an organization. Please
              contact support.
            </p>
          </div>
        </div>
      );
    }

    return (
      <OrganizationChemicalCatalog
        organizationId={organizationId}
        canEdit={role === 'ORG_ADMIN'}
      />
    );
  }

  // SITE ROLES: View site chemicals, manage applications
  if (role === 'SITE_MANAGER' || role === 'SITE_USER') {
    // TODO Phase 5: Fetch site assignment from API
    // For now, show placeholder
    const siteId = 'mock-site-1';
    const siteName = 'Main Street Location';

    return (
      <SiteChemicalCatalog
        siteId={siteId}
        siteName={siteName}
        canEdit={role === 'SITE_MANAGER'}
      />
    );
  }

  // Fallback: Unknown role
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">
          Unknown User Role
        </h2>
        <p className="text-yellow-700">
          Your account role ({role}) is not recognized. Please contact support.
        </p>
      </div>
    </div>
  );
}
