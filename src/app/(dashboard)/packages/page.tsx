// ===========================================
// FILE: src/app/(dashboard)/packages/page.tsx
// PURPOSE: Wash packages page - role-specific views
// PRD REFERENCE: PRD Section 5 - Wash Package Management
// ===========================================

import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { OrganizationPackageCatalog } from './OrganizationPackageCatalog';
import { SitePackageCatalog } from './SitePackageCatalog';

/**
 * Packages Page
 *
 * WHY: Wash package management works differently for each role.
 * Routes to appropriate view based on user's role and permissions.
 *
 * ROUTING LOGIC (PRD Section 5):
 * - ORG_ADMIN: Manage package templates (org-wide)
 * - SITE_MANAGER/SITE_USER: Manage site packages
 *
 * DATA HIERARCHY:
 * 1. WashPackageTemplate (org creates)
 * 2. WashPackageTemplateItem (packages within template)
 * 3. WashPackage (site-specific, from template or custom)
 * 4. WashPackageChemical (chemicals in each package)
 */
export default async function PackagesPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const { role } = session.user;

  /**
   * Route to appropriate catalog based on role
   * WHY: Each role has different package management capabilities
   */

  // DISTRIBUTOR ROLES: View client packages (read-only)
  if (role === 'DISTRIBUTOR_ADMIN' || role === 'DISTRIBUTOR_USER') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            Client Package Management
          </h2>
          <p className="text-blue-700">
            Select a client organization from the dashboard to view their wash
            packages. Package management is done by organization admins.
          </p>
        </div>
      </div>
    );
  }

  // ORGANIZATION ADMIN: Manage package templates
  if (role === 'ORG_ADMIN') {
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
      <OrganizationPackageCatalog
        organizationId={organizationId}
        canEdit={true}
      />
    );
  }

  // SITE ROLES: Manage site packages
  if (role === 'SITE_MANAGER' || role === 'SITE_USER') {
    // TODO: Fetch site assignment from UserSiteAccess
    // For now, show placeholder
    const siteId = 'mock-site-1';
    const siteName = 'Main Street Location';
    const organizationId = 'mock-org-1';

    return (
      <SitePackageCatalog
        siteId={siteId}
        siteName={siteName}
        organizationId={organizationId}
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
