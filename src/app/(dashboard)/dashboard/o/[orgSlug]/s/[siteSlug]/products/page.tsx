// ===========================================
// FILE: src/app/(dashboard)/dashboard/o/[orgSlug]/s/[siteSlug]/products/page.tsx
// PURPOSE: Site-scoped products catalog
// ===========================================

import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PageContainer, PageHeader } from '@/components/layout';
import { Card } from '@/components/ui';

interface SiteProductsPageProps {
  params: Promise<{
    orgSlug: string;
    siteSlug: string;
  }>;
}

/**
 * Site Products Page
 *
 * WHY: Shows products/chemicals configured for a specific site.
 * URL: /dashboard/o/[orgSlug]/s/[siteSlug]/products
 */
export default async function SiteProductsPage({ params }: SiteProductsPageProps) {
  const session = await auth();
  const { orgSlug, siteSlug } = await params;

  if (!session) {
    redirect('/login');
  }

  // TODO Phase 5: Fetch site and product data
  const mockSiteName = 'Main Street Location'; // Will be fetched from DB

  return (
    <PageContainer>
      <PageHeader
        title="Products"
        subtitle={`Chemical setup for ${mockSiteName}`}
      />

      <Card>
        <div className="p-6 text-center">
          <p className="text-text-secondary">
            Product configuration for site: <strong>{siteSlug}</strong> in <strong>{orgSlug}</strong>
          </p>
          <p className="text-sm text-text-tertiary mt-2">
            Phase 5 will implement full product management.
          </p>
        </div>
      </Card>
    </PageContainer>
  );
}
