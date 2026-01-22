// ===========================================
// FILE: src/app/(dashboard)/dashboard/o/[orgSlug]/s/[siteSlug]/chemical/page.tsx
// PURPOSE: Site-scoped chemical catalog
// ===========================================

import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PageContainer, PageHeader } from '@/components/layout';
import { Card } from '@/components/ui';

interface SiteChemicalPageProps {
  params: Promise<{
    orgSlug: string;
    siteSlug: string;
  }>;
}

/**
 * Site Chemical List Page
 *
 * WHY: Shows chemicals configured for a specific site.
 * URL: /dashboard/o/[orgSlug]/s/[siteSlug]/chemical
 */
export default async function SiteChemicalListPage({ params }: SiteChemicalPageProps) {
  const session = await auth();
  const { orgSlug, siteSlug } = await params;

  if (!session) {
    redirect('/login');
  }

  // TODO Phase 5: Fetch site and chemical data
  const mockSiteName = 'Main Street Location'; // Will be fetched from DB

  return (
    <PageContainer>
      <PageHeader
        title="Chemical List"
        subtitle={`Chemical setup for ${mockSiteName}`}
      />

      <Card>
        <div className="p-6 text-center">
          <p className="text-text-secondary">
            Chemical configuration for site: <strong>{siteSlug}</strong> in <strong>{orgSlug}</strong>
          </p>
          <p className="text-sm text-text-tertiary mt-2">
            Phase 5 will implement full chemical management.
          </p>
        </div>
      </Card>
    </PageContainer>
  );
}
