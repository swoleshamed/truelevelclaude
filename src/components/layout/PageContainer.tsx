// ===========================================
// FILE: src/components/layout/PageContainer.tsx
// PURPOSE: Standard page container with consistent padding and max-width
// PRD REFERENCE: UI Spec - Page Layouts
// USED BY: All dashboard pages
// ===========================================

import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/**
 * PageContainer Component
 *
 * WHY: Consistent page layout with proper padding and max-width.
 * Ensures content doesn't stretch too wide on large screens and
 * has proper spacing on mobile.
 *
 * RESPONSIVE BEHAVIOR:
 * - Mobile: Full width with side padding
 * - Tablet/Desktop: Centered with max-width constraint
 * - Bottom padding accounts for mobile bottom nav
 *
 * EXAMPLE:
 * ```tsx
 * <PageContainer maxWidth="lg">
 *   <PageHeader title="Dashboard" />
 *   {content}
 * </PageContainer>
 * ```
 *
 * @param children - Page content
 * @param maxWidth - Maximum width constraint
 * @param className - Additional classes
 */
export function PageContainer({
  children,
  maxWidth = 'xl',
  className,
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        'w-full mx-auto px-4 sm:px-6 lg:px-8',
        // Bottom padding for mobile nav (16 * 4px = 64px nav height)
        'pb-20 lg:pb-8',
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  backButton?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * PageHeader Component
 *
 * WHY: Consistent page header styling with optional subtitle,
 * action button, and back navigation.
 *
 * DESIGN (UI Spec):
 * ```
 * ┌─────────────────────────────────────────────────────────────┐
 * │ PAGE TITLE                                 [+ Action Button]│
 * │ Optional subtitle text                                      │
 * └─────────────────────────────────────────────────────────────┘
 * ```
 *
 * EXAMPLE:
 * ```tsx
 * <PageHeader
 *   title="Dashboard"
 *   subtitle="Welcome back, John"
 *   action={<Button>+ Add Site</Button>}
 * />
 *
 * // With back button
 * <PageHeader
 *   title="Site Details"
 *   backButton={{
 *     label: 'Back to sites',
 *     onClick: () => router.back()
 *   }}
 * />
 * ```
 *
 * @param title - Page title
 * @param subtitle - Optional subtitle
 * @param action - Optional action button/element (hidden on mobile if FAB exists)
 * @param backButton - Optional back navigation
 */
export function PageHeader({
  title,
  subtitle,
  action,
  backButton,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('py-6 border-b border-border-light', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Back button */}
          {backButton && (
            <button
              onClick={backButton.onClick}
              className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors duration-150 mb-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {backButton.label}
            </button>
          )}

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
          )}
        </div>

        {/* Action - hidden on mobile (use FAB instead) */}
        {action && (
          <div className="hidden lg:block ml-4 flex-shrink-0">{action}</div>
        )}
      </div>
    </div>
  );
}

/**
 * PageSection Component
 *
 * WHY: Consistent spacing between major page sections.
 *
 * EXAMPLE:
 * ```tsx
 * <PageContainer>
 *   <PageSection>
 *     <SectionHeader />
 *     <SectionContent />
 *   </PageSection>
 *   <PageSection>
 *     <AnotherSection />
 *   </PageSection>
 * </PageContainer>
 * ```
 */
export function PageSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={cn('py-6', className)}>{children}</section>;
}
