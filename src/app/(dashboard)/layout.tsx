// ===========================================
// FILE: src/app/(dashboard)/layout.tsx
// PURPOSE: Layout for authenticated dashboard pages
// PRD REFERENCE: PRD Section 5 - Navigation Architecture
// ===========================================

import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout';
import { LocationProvider } from '@/contexts/LocationContext';
import { FABProvider } from '@/components/layout/FAB';
import { DashboardNav } from './DashboardNav';

/**
 * Dashboard Layout Component
 *
 * WHY: Provides consistent structure for all authenticated pages.
 * Includes header, location context, bottom navigation, and FAB.
 *
 * FEATURES:
 * - Session check (server-side)
 * - Global header with user menu
 * - Location context provider for dashboard state
 * - Bottom navigation (mobile)
 * - FAB provider for context-aware actions
 *
 * LAYOUT STRUCTURE:
 * ```
 * ┌─────────────────────────────────┐
 * │ Header (fixed top)              │
 * ├─────────────────────────────────┤
 * │                                 │
 * │ Main Content                    │
 * │ (with padding for bottom nav)   │
 * │                                 │
 * ├─────────────────────────────────┤
 * │ Bottom Nav (mobile, fixed)      │
 * │ + FAB (floating above nav)      │
 * └─────────────────────────────────┘
 * ```
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
    <LocationProvider>
      <FABProvider>
        <div className="min-h-screen bg-bg-primary">
          {/* Global header */}
          <Header
            user={{
              firstName: session.user.firstName,
              lastName: session.user.lastName,
              email: session.user.email || '',
              role: session.user.role,
            }}
          />

          {/* Main content with padding for bottom nav */}
          <main className="pb-16 lg:pb-8">{children}</main>

          {/* Bottom navigation for mobile */}
          <DashboardNav />
        </div>
      </FABProvider>
    </LocationProvider>
  );
}
