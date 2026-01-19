// ===========================================
// FILE: src/app/(dashboard)/dashboard/chemical/page.tsx
// PURPOSE: Chemical List page for distributor dashboard
// PRD REFERENCE: PRD Section 6 - Dashboards
// ===========================================

import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PageContainer, PageHeader } from '@/components/layout';
import { Card } from '@/components/ui';

/**
 * Chemical List Page
 *
 * WHY: Shows chemical catalog and inventory for distributor users.
 * This is a placeholder that will be populated with real content.
 *
 * PLANNED FEATURES:
 * - Chemical catalog
 * - Inventory levels
 * - Chemical categories
 * - Pricing information
 * - Quick order actions
 */
export default async function ChemicalListPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <PageContainer>
      <PageHeader
        title="Chemical List"
        subtitle="Manage your chemical products and inventory"
      />

      <div className="space-y-6">
        {/* Placeholder content */}
        <Card>
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-tertiary flex items-center justify-center">
              <svg
                className="w-8 h-8 text-text-tertiary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Chemical Catalog
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              This page will display your complete chemical catalog including
              pricing and inventory levels. You&apos;ll be able to manage
              chemicals and create orders.
            </p>
          </div>
        </Card>

        {/* Sample chemical grid for layout reference */}
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Chemical Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {['Pre-Soak', 'Foam', 'Rinse Aid', 'Tire Cleaner', 'Wax', 'Drying Agent'].map(
              (category) => (
                <Card key={category} className="hover:border-primary cursor-pointer transition-colors">
                  <div className="p-4">
                    <div className="w-12 h-12 rounded-lg bg-bg-tertiary mb-3" />
                    <h3 className="font-medium text-text-primary mb-1">
                      {category}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      -- chemicals
                    </p>
                  </div>
                </Card>
              )
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
