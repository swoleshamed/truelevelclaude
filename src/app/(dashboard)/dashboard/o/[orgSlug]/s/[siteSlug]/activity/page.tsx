// ===========================================
// FILE: src/app/(dashboard)/dashboard/o/[orgSlug]/s/[siteSlug]/activity/page.tsx
// PURPOSE: Site-scoped activity feed
// ===========================================

import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PageContainer, PageHeader } from '@/components/layout';
import { Card } from '@/components/ui';

interface SiteActivityPageProps {
  params: Promise<{
    orgSlug: string;
    siteSlug: string;
  }>;
}

/**
 * Site Activity Page
 *
 * WHY: Shows activity feed scoped to a specific site.
 * URL: /dashboard/o/[orgSlug]/s/[siteSlug]/activity
 */
export default async function SiteActivityPage({ params }: SiteActivityPageProps) {
  const session = await auth();
  const { orgSlug, siteSlug } = await params;

  if (!session) {
    redirect('/login');
  }

  // TODO Phase 5: Fetch site and activity data
  const mockSiteName = 'Main Street Location'; // Will be fetched from DB

  return (
    <PageContainer>
      <PageHeader
        title="Activity Log List"
        subtitle={`Recent activity for ${mockSiteName}`}
      />

      <Card>
        <div className="p-6 text-center">
          <p className="text-text-secondary">
            Activity feed for site: <strong>{siteSlug}</strong> in <strong>{orgSlug}</strong>
          </p>
          <p className="text-sm text-text-tertiary mt-2">
            Phase 5 will implement full activity tracking.
          </p>
        </div>
      </Card>
    </PageContainer>
  );
}
