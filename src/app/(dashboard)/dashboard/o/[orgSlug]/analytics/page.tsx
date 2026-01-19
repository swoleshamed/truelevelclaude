// ===========================================
// FILE: src/app/(dashboard)/dashboard/o/[orgSlug]/analytics/page.tsx
// PURPOSE: Organization-scoped analytics dashboard
// ===========================================

import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PageContainer, PageHeader } from '@/components/layout';
import { Card } from '@/components/ui';

interface OrgAnalyticsPageProps {
  params: Promise<{
    orgSlug: string;
  }>;
}

/**
 * Organization Analytics Page
 *
 * WHY: Shows analytics scoped to a specific organization.
 * URL: /dashboard/o/[orgSlug]/analytics
 */
export default async function OrgAnalyticsPage({ params }: OrgAnalyticsPageProps) {
  const session = await auth();
  const { orgSlug } = await params;

  if (!session) {
    redirect('/login');
  }

  // TODO Phase 5: Fetch organization and analytics data
  const mockOrgName = 'ABC Car Wash'; // Will be fetched from DB

  return (
    <PageContainer>
      <PageHeader
        title="Analytics Reports"
        subtitle={`Performance metrics for ${mockOrgName}`}
      />

      <Card>
        <div className="p-6 text-center">
          <p className="text-text-secondary">
            Analytics dashboard for organization: <strong>{orgSlug}</strong>
          </p>
          <p className="text-sm text-text-tertiary mt-2">
            Phase 5 will implement full analytics with charts.
          </p>
        </div>
      </Card>
    </PageContainer>
  );
}
