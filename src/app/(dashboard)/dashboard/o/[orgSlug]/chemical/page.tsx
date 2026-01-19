// ===========================================
// FILE: src/app/(dashboard)/dashboard/o/[orgSlug]/chemical/page.tsx
// PURPOSE: Organization-scoped chemical catalog
// ===========================================

import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PageContainer, PageHeader } from '@/components/layout';
import { Card } from '@/components/ui';

interface OrgChemicalPageProps {
  params: Promise<{
    orgSlug: string;
  }>;
}

/**
 * Organization Chemical List Page
 *
 * WHY: Shows chemicals configured for a specific organization.
 * URL: /dashboard/o/[orgSlug]/chemical
 */
export default async function OrgChemicalListPage({ params }: OrgChemicalPageProps) {
  const session = await auth();
  const { orgSlug } = await params;

  if (!session) {
    redirect('/login');
  }

  // TODO Phase 5: Fetch organization and chemical data
  const mockOrgName = 'ABC Car Wash'; // Will be fetched from DB

  return (
    <PageContainer>
      <PageHeader
        title="Chemical List"
        subtitle={`Chemical catalog for ${mockOrgName}`}
      />

      <Card>
        <div className="p-6 text-center">
          <p className="text-text-secondary">
            Chemical catalog for organization: <strong>{orgSlug}</strong>
          </p>
          <p className="text-sm text-text-tertiary mt-2">
            Phase 5 will implement full chemical management.
          </p>
        </div>
      </Card>
    </PageContainer>
  );
}
