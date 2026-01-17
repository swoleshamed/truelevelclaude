// ===========================================
// FILE: src/app/(dashboard)/dashboard/o/[orgSlug]/page.tsx
// PURPOSE: Organization-scoped dashboard overview
// ===========================================

import React from 'react';
import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { DistributorDashboard } from '../../DistributorDashboard';
import { OrganizationDashboard } from '../../OrganizationDashboard';

interface OrgDashboardPageProps {
  params: Promise<{
    orgSlug: string;
  }>;
}

/**
 * Organization Dashboard Page
 *
 * WHY: Shows dashboard scoped to a specific organization.
 * URL: /dashboard/o/[orgSlug]
 *
 * BEHAVIOR:
 * - Distributors see org overview with site list
 * - Org users see their organization dashboard
 */
export default async function OrgDashboardPage({ params }: OrgDashboardPageProps) {
  const session = await auth();
  const { orgSlug } = await params;

  if (!session) {
    redirect('/login');
  }

  const { firstName, lastName, role } = session.user;

  // TODO Phase 5: Fetch organization by slug from database
  // const organization = await prisma.organization.findUnique({
  //   where: { slug: orgSlug },
  //   include: { sites: true }
  // });
  // if (!organization) notFound();

  // Mock organization data for now
  const mockOrganization = {
    id: 'mock-org-1',
    name: 'ABC Car Wash',
    slug: orgSlug,
  };

  // DISTRIBUTOR ROLES: Show org-scoped distributor view
  if (role === 'DISTRIBUTOR_ADMIN' || role === 'DISTRIBUTOR_USER') {
    return (
      <DistributorDashboard
        user={{ firstName, lastName, role }}
        organizationSlug={orgSlug}
      />
    );
  }

  // ORGANIZATION ROLES: Show organization dashboard
  if (role === 'ORG_ADMIN') {
    return (
      <OrganizationDashboard
        user={{ firstName, lastName, role }}
        organizationId={mockOrganization.id}
        organizationName={mockOrganization.name}
      />
    );
  }

  // Fallback
  return notFound();
}
