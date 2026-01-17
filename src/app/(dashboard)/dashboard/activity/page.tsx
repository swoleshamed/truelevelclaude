// ===========================================
// FILE: src/app/(dashboard)/dashboard/activity/page.tsx
// PURPOSE: Activity page for distributor dashboard
// PRD REFERENCE: PRD Section 6 - Dashboards
// ===========================================

import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PageContainer, PageHeader } from '@/components/layout';
import { Card } from '@/components/ui';

/**
 * Activity Page
 *
 * WHY: Shows activity log and recent actions for distributor users.
 * This is a placeholder that will be populated with real content.
 *
 * PLANNED FEATURES:
 * - Recent visit logs
 * - Chemical delivery history
 * - User activity timeline
 * - Notifications and alerts history
 */
export default async function ActivityPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <PageContainer>
      <PageHeader
        title="Activity"
        subtitle="Recent activity and logs across all clients"
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Activity Feed
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              This page will show a timeline of all activity including visit logs,
              chemical deliveries, and important notifications across your client
              portfolio.
            </p>
          </div>
        </Card>

        {/* Sample activity items for layout reference */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-text-primary">
            Recent Activity
          </h2>
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-bg-tertiary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-bg-tertiary rounded w-3/4 mb-2" />
                  <div className="h-3 bg-bg-tertiary rounded w-1/2" />
                </div>
                <div className="text-sm text-text-tertiary">
                  {i}h ago
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
