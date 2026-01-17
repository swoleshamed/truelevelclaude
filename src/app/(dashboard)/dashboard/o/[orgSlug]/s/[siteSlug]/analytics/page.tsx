// ===========================================
// FILE: src/app/(dashboard)/dashboard/o/[orgSlug]/s/[siteSlug]/analytics/page.tsx
// PURPOSE: Site-scoped analytics dashboard
// ===========================================

import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PageContainer, PageHeader } from '@/components/layout';
import { Card } from '@/components/ui';

interface SiteAnalyticsPageProps {
  params: Promise<{
    orgSlug: string;
    siteSlug: string;
  }>;
}

/**
 * Site Analytics Page
 *
 * WHY: Shows analytics scoped to a specific site.
 * URL: /dashboard/o/[orgSlug]/s/[siteSlug]/analytics
 */
export default async function SiteAnalyticsPage({ params }: SiteAnalyticsPageProps) {
  const session = await auth();
  const { orgSlug, siteSlug } = await params;

  if (!session) {
    redirect('/login');
  }

  // TODO Phase 5: Fetch site and analytics data
  const mockSiteName = 'Main Street Location'; // Will be fetched from DB

  return (
    <PageContainer>
      <PageHeader
        title="Analytics"
        subtitle={`Performance metrics for ${mockSiteName}`}
      />

      <Card>
        <div className="p-6 text-center">
          <p className="text-text-secondary">
            Analytics dashboard for site: <strong>{siteSlug}</strong> in <strong>{orgSlug}</strong>
          </p>
          <p className="text-sm text-text-tertiary mt-2">
            Phase 5 will implement full analytics with charts.
          </p>
        </div>
      </Card>
    </PageContainer>
  );
}
