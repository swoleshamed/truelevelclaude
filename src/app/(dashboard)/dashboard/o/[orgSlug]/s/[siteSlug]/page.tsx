// ===========================================
// FILE: src/app/(dashboard)/dashboard/o/[orgSlug]/s/[siteSlug]/page.tsx
// PURPOSE: Site-scoped dashboard overview
// ===========================================

import React from 'react';
import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { SiteDashboard } from '../../../../SiteDashboard';

interface SiteDashboardPageProps {
  params: Promise<{
    orgSlug: string;
    siteSlug: string;
  }>;
}

/**
 * Site Dashboard Page
 *
 * WHY: Shows dashboard scoped to a specific site within an organization.
 * URL: /dashboard/o/[orgSlug]/s/[siteSlug]
 *
 * BEHAVIOR:
 * - Shows site-specific dashboard with tanks, analytics, visit history
 * - All user roles can view their assigned sites
 */
export default async function SiteDashboardPage({ params }: SiteDashboardPageProps) {
  const session = await auth();
  const { orgSlug, siteSlug } = await params;

  if (!session) {
    redirect('/login');
  }

  const { firstName, lastName, role } = session.user;

  // TODO Phase 5: Fetch site by org slug and site slug from database
  // const site = await prisma.site.findFirst({
  //   where: {
  //     slug: siteSlug,
  //     organization: { slug: orgSlug }
  //   },
  //   include: { organization: true }
  // });
  // if (!site) notFound();

  // Mock site data for now
  const mockSite = {
    id: 'mock-site-1',
    name: 'Main Street Location',
    slug: siteSlug,
  };

  const mockOrganization = {
    id: 'mock-org-1',
    name: 'ABC Car Wash',
    slug: orgSlug,
  };

  return (
    <SiteDashboard
      user={{ firstName, lastName, role }}
      siteId={mockSite.id}
      siteName={mockSite.name}
      organizationName={mockOrganization.name}
    />
  );
}
