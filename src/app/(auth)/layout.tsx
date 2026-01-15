// ===========================================
// FILE: src/app/(auth)/layout.tsx
// PURPOSE: Layout for authentication pages (login, register)
// PRD REFERENCE: UI Spec - Authentication Pages
// ===========================================

import React from 'react';

/**
 * Auth Layout Component
 *
 * WHY: Centered, minimal layout for login and registration pages.
 * No navigation or header - just the form content.
 *
 * DESIGN:
 * - Centered card on background
 * - Logo at top of card
 * - Warm, welcoming aesthetic
 * - Mobile-responsive
 *
 * EXAMPLE USE:
 * - /login - Login page
 * - /register - Registration flow
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            {/* Lightning bolt icon */}
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg">
              <svg
                className="w-7 h-7 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            {/* Wordmark */}
            <span className="text-3xl font-heading font-bold text-text-primary tracking-tight">
              TRUELEVEL
            </span>
          </div>
        </div>

        {/* Auth form content */}
        <div className="bg-bg-secondary border border-border-light rounded-lg shadow-lg p-6 sm:p-8">
          {children}
        </div>

        {/* Footer text */}
        <p className="mt-6 text-center text-sm text-text-secondary">
          Chemical inventory management for car washes
        </p>
      </div>
    </div>
  );
}
