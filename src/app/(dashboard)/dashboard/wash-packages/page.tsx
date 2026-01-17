// ===========================================
// FILE: src/app/(dashboard)/dashboard/wash-packages/page.tsx
// PURPOSE: Wash Packages page for organization dashboard
// PRD REFERENCE: PRD Section 6 - Dashboards
// ===========================================

import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PageContainer, PageHeader } from '@/components/layout';
import { Card } from '@/components/ui';

/**
 * Wash Packages Page
 *
 * WHY: Shows wash package configurations for organization users.
 * This is a placeholder that will be populated with real content.
 *
 * PLANNED FEATURES:
 * - Wash package tiers (Basic, Deluxe, Premium, etc.)
 * - Chemical configurations per package
 * - Pricing and cost analysis
 * - Package performance metrics
 */
export default async function WashPackagesPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <PageContainer>
      <PageHeader
        title="Wash Packages"
        subtitle="Manage wash package configurations and pricing"
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
              Wash Package Configuration
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              This page will display your wash package configurations including
              chemical recipes, pricing tiers, and performance analytics for each
              package level.
            </p>
          </div>
        </Card>

        {/* Sample package grid for layout reference */}
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Package Tiers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Basic', price: '$8' },
              { name: 'Deluxe', price: '$12' },
              { name: 'Premium', price: '$16' },
              { name: 'Ultimate', price: '$20' },
            ].map((pkg) => (
              <Card key={pkg.name} className="hover:border-primary cursor-pointer transition-colors">
                <div className="p-4">
                  <div className="w-12 h-12 rounded-lg bg-bg-tertiary mb-3 flex items-center justify-center">
                    <span className="text-lg font-bold text-text-tertiary">
                      {pkg.name[0]}
                    </span>
                  </div>
                  <h3 className="font-medium text-text-primary mb-1">
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {pkg.price} / wash
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Metrics placeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Packages', value: '--' },
            { label: 'Avg. Package Price', value: '$--' },
            { label: 'Most Popular', value: '--' },
          ].map((metric) => (
            <Card key={metric.label}>
              <div className="p-4">
                <p className="text-sm text-text-secondary mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-text-primary">
                  {metric.value}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
