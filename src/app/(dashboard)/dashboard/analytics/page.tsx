// ===========================================
// FILE: src/app/(dashboard)/dashboard/analytics/page.tsx
// PURPOSE: Analytics page for distributor dashboard
// PRD REFERENCE: PRD Section 6 - Dashboards
// ===========================================

import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PageContainer, PageHeader } from '@/components/layout';
import { Card } from '@/components/ui';

/**
 * Analytics Page
 *
 * WHY: Shows analytics and insights for distributor users.
 * This is a placeholder that will be populated with real content.
 *
 * PLANNED FEATURES:
 * - Client performance metrics
 * - Chemical usage trends
 * - Revenue analytics
 * - Visit frequency reports
 * - Cost analysis
 */
export default async function AnalyticsPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <PageContainer>
      <PageHeader
        title="Analytics"
        subtitle="Performance insights and reporting"
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Analytics Dashboard
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              This page will show comprehensive analytics including client
              performance, chemical usage trends, revenue metrics, and actionable
              insights for your distribution business.
            </p>
          </div>
        </Card>

        {/* Sample metrics for layout reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Clients', value: '--' },
            { label: 'Monthly Revenue', value: '$--' },
            { label: 'Avg. Visit Frequency', value: '-- days' },
            { label: 'Chemical Orders', value: '--' },
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

        {/* Chart placeholder */}
        <Card>
          <div className="p-4">
            <h3 className="font-semibold text-text-primary mb-4">
              Revenue Trend
            </h3>
            <div className="h-64 bg-bg-tertiary rounded-lg flex items-center justify-center">
              <p className="text-text-tertiary">Chart will be displayed here</p>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
