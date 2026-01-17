// ===========================================
// FILE: src/app/(dashboard)/dashboard/o/[orgSlug]/products/page.tsx
// PURPOSE: Organization-scoped products catalog
// ===========================================

import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PageContainer, PageHeader } from '@/components/layout';
import { Card } from '@/components/ui';

interface OrgProductsPageProps {
  params: Promise<{
    orgSlug: string;
  }>;
}

/**
 * Organization Products Page
 *
 * WHY: Shows products/chemicals configured for a specific organization.
 * URL: /dashboard/o/[orgSlug]/products
 */
export default async function OrgProductsPage({ params }: OrgProductsPageProps) {
  const session = await auth();
  const { orgSlug } = await params;

  if (!session) {
    redirect('/login');
  }

  // TODO Phase 5: Fetch organization and product data
  const mockOrgName = 'ABC Car Wash'; // Will be fetched from DB

  return (
    <PageContainer>
      <PageHeader
        title="Products"
        subtitle={`Chemical catalog for ${mockOrgName}`}
      />

      <Card>
        <div className="p-6 text-center">
          <p className="text-text-secondary">
            Product catalog for organization: <strong>{orgSlug}</strong>
          </p>
          <p className="text-sm text-text-tertiary mt-2">
            Phase 5 will implement full product management.
          </p>
        </div>
      </Card>
    </PageContainer>
  );
}
