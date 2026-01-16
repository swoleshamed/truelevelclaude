// ===========================================
// FILE: src/components/layout/Header.tsx
// PURPOSE: Global application header with logo, notifications, and user menu
// PRD REFERENCE: PRD Section 5 - Navigation Architecture, UI Spec - Global Header
// USED BY: All authenticated pages via dashboard layout
// ===========================================

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface HeaderProps {
  user?: {
    firstName: string;
    lastName: string;
    email: string | null;
    role: string;
  };
  className?: string;
}

/**
 * Header Component
 *
 * WHY: Global navigation and user actions. Always visible at top of app.
 *
 * DESIGN (UI Spec):
 * ```
 * ┌─────────────────────────────────────────────────────────────┐
 * │ [⚡ TRUELEVEL]                    [🔔] [☀️] [JD ▼]         │
 * └─────────────────────────────────────────────────────────────┘
 * ```
 *
 * COMPONENTS:
 * - Logo: Lightning bolt icon + "TRUELEVEL" wordmark
 * - Notification icon (placeholder for V0.5)
 * - Theme toggle (placeholder for V1 - dark mode)
 * - User menu: Avatar with dropdown
 *
 * USER MENU OPTIONS (PRD Section 5):
 * - Profile
 * - Billing
 * - Company
 * - Team Management
 * - Support
 * - Sign Out
 *
 * EXAMPLE:
 * ```tsx
 * <Header
 *   user={{
 *     firstName: 'John',
 *     lastName: 'Doe',
 *     email: 'john@truelevel.com',
 *     role: 'DISTRIBUTOR_ADMIN'
 *   }}
 *   onSignOut={handleSignOut}
 * />
 * ```
 *
 * @param user - Current user data
 */
export function Header({ user, className }: HeaderProps) {
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  /**
   * Handle user sign out
   * WHY: Sign out user and redirect to login page
   */
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return '?';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  // Format role for display
  const formatRole = (role: string) => {
    return role
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-30 w-full bg-bg-secondary border-b border-border-light',
        className
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            {/* Lightning bolt icon */}
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-md">
              <svg
                className="w-5 h-5 text-white"
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
            <span className="text-xl font-heading font-bold text-text-primary tracking-tight">
              TRUELEVEL
            </span>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Notifications (placeholder for V0.5) */}
            <button
              className="p-2 rounded-md hover:bg-bg-tertiary transition-colors duration-150 relative"
              aria-label="Notifications"
              disabled
            >
              <svg
                className="w-6 h-6 text-text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {/* Notification badge (future) */}
              {/* <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" /> */}
            </button>

            {/* Theme toggle (placeholder for V1) */}
            <button
              className="p-2 rounded-md hover:bg-bg-tertiary transition-colors duration-150"
              aria-label="Toggle theme"
              disabled
            >
              <svg
                className="w-6 h-6 text-text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </button>

            {/* User menu */}
            {user && (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-md hover:bg-bg-tertiary transition-colors duration-150"
                >
                  {/* Avatar */}
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-white font-semibold text-sm rounded-full">
                    {getUserInitials()}
                  </div>
                  {/* Chevron */}
                  <svg
                    className={cn(
                      'w-4 h-4 text-text-secondary transition-transform duration-150',
                      isUserMenuOpen && 'rotate-180'
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-bg-secondary border border-border-light rounded-lg shadow-lg overflow-hidden">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-border-light">
                      <p className="text-sm font-semibold text-text-primary">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {user.email}
                      </p>
                      <p className="text-xs text-text-tertiary mt-1">
                        {formatRole(user.role)}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-2">
                      <button className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary transition-colors duration-150">
                        👤 Profile
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary transition-colors duration-150">
                        💳 Billing
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary transition-colors duration-150">
                        🏢 Company
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary transition-colors duration-150">
                        👥 Team Management
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary transition-colors duration-150">
                        ❓ Support
                      </button>
                    </div>

                    {/* Sign out */}
                    <div className="border-t border-border-light py-2">
                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-2 text-left text-sm text-error hover:bg-bg-tertiary transition-colors duration-150 font-medium"
                      >
                        🚪 SIGN OUT
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
