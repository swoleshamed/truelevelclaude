// ===========================================
// FILE: src/app/(auth)/register/page.tsx
// PURPOSE: 2-step registration flow for new users
// PRD REFERENCE: PRD Section 4 - Authentication System
// ===========================================

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { registrationSchema, type RegistrationInput } from '@/lib/validations/auth';

type AccountType = 'DISTRIBUTOR' | 'ORGANIZATION';

/**
 * Registration Page Component
 *
 * WHY: Self-service signup for both distributors and car wash operators.
 * 2-step process: account type selection → company/user details.
 *
 * STEP 1: Account Type Selection
 * - Choose: Distributor (chemical supplier) or Organization (car wash operator)
 * - Determines user role and company structure
 *
 * STEP 2: Company & User Details
 * - Company name
 * - User information (name, email, password)
 * - Optional phone number
 *
 * BUSINESS LOGIC (PRD Section 4):
 * - Distributor signup → Creates Distributor + User (DISTRIBUTOR_ADMIN)
 * - Organization signup → Creates Organization + User (ORG_ADMIN)
 * - First user gets admin privileges automatically
 *
 * POST-REGISTRATION:
 * - Redirects to login page
 * - User must sign in with new credentials
 * - No automatic login (security best practice)
 */
export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form setup with React Hook Form + Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
  });

  // Watch confirmPassword for real-time match validation
  const password = watch('password');

  /**
   * Step 1: Handle account type selection
   */
  const handleAccountTypeSelect = (type: AccountType) => {
    setAccountType(type);
    setValue('accountType', type);
    setStep(2);
  };

  /**
   * Step 2: Handle registration form submission
   */
  const onSubmit = async (data: RegistrationInput) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Registration failed
        setError(result.error || 'Registration failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Success - redirect to login with success message
      router.push('/login?registered=true');
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Step 1: Account Type Selection */}
      {step === 1 && (
        <>
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold font-heading text-text-primary mb-2">
              Create Your Account
            </h1>
            <p className="text-sm text-text-secondary">
              Choose your account type to get started
            </p>
          </div>

          {/* Account type cards */}
          <div className="space-y-4">
            {/* Distributor option */}
            <button
              onClick={() => handleAccountTypeSelect('DISTRIBUTOR')}
              className="w-full p-6 text-left border-2 border-border-medium rounded-lg hover:border-primary hover:bg-bg-tertiary transition-all duration-150 group"
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-primary bg-opacity-10 rounded-lg group-hover:bg-opacity-20 transition-colors">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    Chemical Distributor
                  </h3>
                  <p className="text-sm text-text-secondary">
                    I supply chemicals to car wash operators and want to manage client relationships
                  </p>
                </div>
              </div>
            </button>

            {/* Organization option */}
            <button
              onClick={() => handleAccountTypeSelect('ORGANIZATION')}
              className="w-full p-6 text-left border-2 border-border-medium rounded-lg hover:border-primary hover:bg-bg-tertiary transition-all duration-150 group"
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-primary bg-opacity-10 rounded-lg group-hover:bg-opacity-20 transition-colors">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    Car Wash Operator
                  </h3>
                  <p className="text-sm text-text-secondary">
                    I own or manage car wash locations and want to track chemical inventory
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Back to login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary hover:text-primary-hover font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </>
      )}

      {/* Step 2: Company & User Details */}
      {step === 2 && accountType && (
        <>
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors mb-4"
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
              Back
            </button>
            <h1 className="text-2xl font-bold font-heading text-text-primary mb-2">
              {accountType === 'DISTRIBUTOR'
                ? 'Distributor Information'
                : 'Organization Information'}
            </h1>
            <p className="text-sm text-text-secondary">
              Enter your company and personal details
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Registration form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Company name */}
            <Input
              label="Company Name"
              placeholder="Your company name"
              error={errors.companyName?.message}
              {...register('companyName')}
            />

            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            {/* Phone (optional) */}
            <Input
              label="Phone Number (Optional)"
              type="tel"
              placeholder="+1 (555) 000-0000"
              autoComplete="tel"
              error={errors.phone?.message}
              {...register('phone')}
            />

            {/* Password */}
            <Input
              label="Password"
              type="password"
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              helperText="Must contain at least one uppercase letter and one number"
              error={errors.password?.message}
              {...register('password')}
            />

            {/* Confirm password */}
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {/* Submit button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-text-tertiary">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </>
      )}
    </div>
  );
}
