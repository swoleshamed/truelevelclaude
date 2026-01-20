// ===========================================
// FILE: src/app/(dashboard)/dashboard/settings/page.tsx
// PURPOSE: Settings page for organization dashboard
// PRD REFERENCE: PRD Section 6 - Dashboards
// ===========================================

import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PageContainer, PageHeader } from '@/components/layout';
import { Card } from '@/components/ui';

/**
 * Organization Settings Page
 *
 * WHY: Shows organization settings and configuration options.
 * This is a placeholder that will be populated with real content.
 *
 * PLANNED FEATURES:
 * - Organization profile settings
 * - User management for organization
 * - Notification preferences
 * - Billing and subscription info
 * - Site management settings
 */
export default async function SettingsPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <PageContainer>
      <PageHeader
        title="Organization Settings"
        subtitle="Manage your organization configuration and preferences"
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Organization Settings
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              This page will allow you to manage your organization settings including
              profile information, user access, notification preferences, and site
              configurations.
            </p>
          </div>
        </Card>

        {/* Settings sections placeholder */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Settings Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                name: 'Organization Profile',
                description: 'Update your organization name, logo, and contact info',
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                ),
              },
              {
                name: 'User Management',
                description: 'Manage team members and their access permissions',
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                ),
              },
              {
                name: 'Notifications',
                description: 'Configure email and push notification preferences',
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                ),
              },
              {
                name: 'Site Management',
                description: 'View and manage all sites under your organization',
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                ),
              },
            ].map((setting) => (
              <Card key={setting.name} className="hover:border-primary cursor-pointer transition-colors">
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-bg-tertiary flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-text-tertiary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {setting.icon}
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-text-primary mb-1">
                        {setting.name}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {setting.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Subscription info placeholder */}
        <Card>
          <div className="p-4">
            <h3 className="font-semibold text-text-primary mb-4">
              Subscription & Billing
            </h3>
            <div className="flex items-center justify-between p-4 bg-bg-tertiary rounded-lg">
              <div>
                <p className="font-medium text-text-primary">Current Plan</p>
                <p className="text-sm text-text-secondary">Subscription details will appear here</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-text-tertiary">--</p>
                <p className="text-sm text-text-tertiary">/ month</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
