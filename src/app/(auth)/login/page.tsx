// ===========================================
// FILE: src/app/(auth)/login/page.tsx
// PURPOSE: Login page for email/password authentication
// PRD REFERENCE: PRD Section 4.1 - Primary Authentication
// ===========================================

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button, Input, Checkbox } from '@/components/ui';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';

/**
 * Login Page Component
 *
 * WHY: Primary authentication entry point for all users.
 * Handles email/password login for distributors and organizations.
 *
 * FEATURES (PRD Section 4.1):
 * - Email/password authentication
 * - "Remember me" option (7 day session)
 * - Error handling and display
 * - Link to registration
 * - Link to password reset (future)
 *
 * BUSINESS LOGIC:
 * - After successful login, redirect to dashboard
 * - Session managed by NextAuth (JWT tokens)
 * - Last login timestamp updated automatically
 *
 * SECURITY:
 * - Password never sent to client
 * - CSRF protection via NextAuth
 * - Secure HTTP-only cookies
 */
export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form setup with React Hook Form + Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  /**
   * Handle login form submission
   * WHY: Authenticate user and redirect to dashboard
   */
  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call NextAuth signIn
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        // Authentication failed
        setError('Invalid email or password');
        setIsLoading(false);
        return;
      }

      // Success - redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold font-heading text-text-primary mb-2">
          Sign In
        </h1>
        <p className="text-sm text-text-secondary">
          Welcome back! Please sign in to continue.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Login form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email field */}
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        {/* Password field */}
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between">
          <Checkbox
            label="Remember me"
            {...register('rememberMe')}
          />

          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:text-primary-hover transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-light" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-bg-secondary text-text-secondary">
            New to TrueLevel?
          </span>
        </div>
      </div>

      {/* Sign up link */}
      <div className="text-center">
        <Link href="/register">
          <Button variant="secondary" className="w-full">
            Create an Account
          </Button>
        </Link>
      </div>

      {/* Footer note */}
      <p className="mt-6 text-center text-xs text-text-tertiary">
        By signing in, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
