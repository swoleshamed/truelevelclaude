// ===========================================
// FILE: src/app/(dashboard)/dashboard/page.tsx
// PURPOSE: Main dashboard page - routes to role-specific dashboards
// PRD REFERENCE: PRD Section 6 - Dashboards
// ===========================================

import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DistributorDashboard } from './DistributorDashboard';
import { OrganizationDashboard } from './OrganizationDashboard';
import { SiteDashboard } from './SiteDashboard';

/**
 * Dashboard Page
 *
 * WHY: Main landing page after login. Routes to role-specific dashboard views
 * based on user's role and permissions.
 *
 * ROUTING LOGIC (PRD Section 6):
 * - DISTRIBUTOR_ADMIN → DistributorDashboard (can view all clients)
 * - DISTRIBUTOR_USER → DistributorDashboard (limited to assigned orgs)
 * - ORG_ADMIN → OrganizationDashboard (can view all org sites)
 * - ORG_USER → OrganizationDashboard (limited to assigned sites)
 * - SITE_USER → SiteDashboard (single site only)
 *
 * DATA FETCHING:
 * - Server-side: Fetch user's org/distributor/site associations
 * - Pass to client components for rendering
 * - Client components handle location context changes
 *
 * EXAMPLE:
 * - Distributor sees: List of all client organizations
 * - Org admin sees: List of all sites in their organization
 * - Site user sees: Single site dashboard (tanks, analytics)
 */
export default async function DashboardPage() {
  // Get authenticated session
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const { id: userId, firstName, lastName, role } = session.user;

  /**
   * Route to appropriate dashboard based on role
   * WHY: Each role has different data needs and UI requirements
   */

  // DISTRIBUTOR ROLES: Show client portfolio
  if (role === 'DISTRIBUTOR_ADMIN' || role === 'DISTRIBUTOR_USER') {
    // TODO Phase 5: Fetch distributor data from API
    // const distributor = await prisma.distributor.findFirst({
    //   where: { users: { some: { id: userId } } }
    // });

    return (
      <DistributorDashboard
        user={{ firstName, lastName, role }}
      />
    );
  }

  // ORGANIZATION ROLES: Show sites overview
  if (role === 'ORG_ADMIN' || role === 'ORG_USER') {
    // TODO Phase 5: Fetch organization data from API
    // const organization = await prisma.organization.findFirst({
    //   where: { users: { some: { id: userId } } },
    //   include: { sites: true }
    // });

    // Mock data for now
    const organizationId = 'mock-org-1';
    const organizationName = 'ABC Car Wash';

    return (
      <OrganizationDashboard
        user={{ firstName, lastName, role }}
        organizationId={organizationId}
        organizationName={organizationName}
      />
    );
  }

  // SITE ROLE: Show single site dashboard
  if (role === 'SITE_USER') {
    // TODO Phase 5: Fetch site assignment from API
    // const siteAssignment = await prisma.siteUser.findFirst({
    //   where: { userId },
    //   include: {
    //     site: {
    //       include: { organization: true }
    //     }
    //   }
    // });

    // Mock data for now
    const siteId = 'mock-site-1';
    const siteName = 'Main Street Location';
    const organizationName = 'ABC Car Wash';

    return (
      <SiteDashboard
        user={{ firstName, lastName, role }}
        siteId={siteId}
        siteName={siteName}
        organizationName={organizationName}
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
