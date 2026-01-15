// ===========================================
// FILE: src/app/(dashboard)/dashboard/page.tsx
// PURPOSE: Main dashboard page (placeholder for Phase 4)
// PRD REFERENCE: PRD Section 6 - Dashboards
// ===========================================

import React from 'react';
import { auth } from '@/lib/auth';
import { PageContainer, PageHeader } from '@/components/layout';
import { Card } from '@/components/ui';

/**
 * Dashboard Page
 *
 * WHY: Main landing page after login. Shows different content based on user role.
 *
 * PLACEHOLDER (Phase 3): This is a minimal placeholder page that will be
 * fully implemented in Phase 4 with:
 * - Location switcher
 * - Tab-based navigation
 * - Role-specific dashboards (Distributor, Org, Site)
 * - Charts, monitoring cards, activity feeds
 *
 * BUSINESS LOGIC (PRD Section 6):
 * - Distributor: Calendar, reminders, portfolio chart, site monitoring
 * - Organization: Site comparison chart, site cards
 * - Site: Performance chart, inventory tanks
 */
export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    return null; // Should not happen due to layout auth check
  }

  const { firstName, role } = session.user;

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome back, ${firstName}!`}
        subtitle={`You're logged in as ${role.replace(/_/g, ' ')}`}
      />

      <div className="py-8 space-y-6">
        {/* Phase status card */}
        <Card>
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary bg-opacity-10 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold font-heading text-text-primary mb-2">
              Phase 3 Complete! 🎉
            </h2>
            <p className="text-text-secondary mb-6">
              Authentication system is fully functional.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-success bg-opacity-10 rounded-lg">
              <span className="text-sm font-medium text-success">
                ✓ User registration
              </span>
              <span className="text-sm font-medium text-success">
                ✓ Email/password login
              </span>
              <span className="text-sm font-medium text-success">
                ✓ Protected routes
              </span>
            </div>
          </div>
        </Card>

        {/* Coming soon card */}
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Coming in Phase 4: Dashboard Implementation
          </h3>
          <ul className="space-y-2 text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Location switcher (All Locations / Organization / Site)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Tab-based navigation (changes based on location context)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Dashboard views (Distributor, Organization, Site)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Cost per car charts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Tank visualizations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Visit reminders and calendar</span>
            </li>
          </ul>
        </Card>

        {/* User info card */}
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Your Account Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Name:</span>
              <span className="text-text-primary font-medium">
                {session.user.firstName} {session.user.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Email:</span>
              <span className="text-text-primary font-medium">
                {session.user.email}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Role:</span>
              <span className="text-text-primary font-medium">
                {session.user.role.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">User ID:</span>
              <span className="text-text-primary font-mono text-xs">
                {session.user.id}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
