// ===========================================
// FILE: src/app/(dashboard)/dashboard/o/[orgSlug]/activity/page.tsx
// PURPOSE: Organization-scoped activity feed
// ===========================================

import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PageContainer, PageHeader } from '@/components/layout';
import { Card } from '@/components/ui';

interface OrgActivityPageProps {
  params: Promise<{
    orgSlug: string;
  }>;
}

/**
 * Organization Activity Page
 *
 * WHY: Shows activity feed scoped to a specific organization.
 * URL: /dashboard/o/[orgSlug]/activity
 */
export default async function OrgActivityPage({ params }: OrgActivityPageProps) {
  const session = await auth();
  const { orgSlug } = await params;

  if (!session) {
    redirect('/login');
  }

  // TODO Phase 5: Fetch organization and activity data
  const mockOrgName = 'ABC Car Wash'; // Will be fetched from DB

  return (
    <PageContainer>
      <PageHeader
        title="Activity Log List"
        subtitle={`Recent activity for ${mockOrgName}`}
      />

      <Card>
        <div className="p-6 text-center">
          <p className="text-text-secondary">
            Activity feed for organization: <strong>{orgSlug}</strong>
          </p>
          <p className="text-sm text-text-tertiary mt-2">
            Phase 5 will implement full activity tracking.
          </p>
        </div>
      </Card>
    </PageContainer>
  );
}
