// ===========================================
// FILE: src/app/(dashboard)/layout.tsx
// PURPOSE: Layout for authenticated dashboard pages
// PRD REFERENCE: PRD Section 5 - Navigation Architecture
// ===========================================

import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout';

/**
 * Dashboard Layout Component
 *
 * WHY: Provides consistent structure for all authenticated pages.
 * Includes header, ensures authentication, and will include navigation later.
 *
 * FEATURES:
 * - Session check (server-side)
 * - Global header with user menu
 * - Bottom navigation (mobile) - to be added
 * - FAB provider for context-aware actions - to be added
 *
 * FUTURE:
 * - Location switcher integration
 * - Tab-based navigation
 * - Bottom nav for mobile
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side session check
  // WHY: Ensure user is authenticated before rendering dashboard
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Global header */}
      <Header
        user={{
          firstName: session.user.firstName,
          lastName: session.user.lastName,
          email: session.user.email || '',
          role: session.user.role,
        }}
        onSignOut={async () => {
          'use server';
          // Sign out handled by client component in Header
        }}
      />

      {/* Main content */}
      <main className="pb-16 lg:pb-8">
        {children}
      </main>

      {/* Bottom navigation for mobile - Phase 4 */}
      {/* FAB for context-aware actions - Phase 4 */}
    </div>
  );
}
