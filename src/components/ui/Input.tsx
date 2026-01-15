// ===========================================
// FILE: src/components/ui/Input.tsx
// PURPOSE: Reusable text input component with validation states
// PRD REFERENCE: UI Spec - Form Elements
// USED BY: All forms throughout the application
// ===========================================

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Input Component
 *
 * WHY: Consistent input field styling with built-in label, error,
 * and helper text support. Integrates with React Hook Form via forwardRef.
 *
 * FEATURES:
 * - Label with proper association
 * - Error state styling
 * - Helper text for guidance
 * - Focus ring matching design system
 * - Full accessibility support
 *
 * EXAMPLE:
 * ```tsx
 * <Input
 *   label="Email Address"
 *   type="email"
 *   error={errors.email?.message}
 *   helperText="We'll never share your email"
 *   {...register('email')}
 * />
 * ```
 *
 * @param label - Field label displayed above input
 * @param error - Error message (shows red border and error text)
 * @param helperText - Helper text displayed below input
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    // Generate unique ID if not provided (for label association)
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Base input styles from design system
    const baseStyles = 'w-full px-3 py-2 border rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

    // Border color based on error state
    const borderStyles = error
      ? 'border-error focus:border-error focus:ring-error'
      : 'border-border-medium focus:border-primary';

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            {label}
          </label>
        )}

        {/* Input field */}
        <input
          id={inputId}
          ref={ref}
          className={cn(baseStyles, borderStyles, className)}
          {...props}
        />

        {/* Error message */}
        {error && (
          <p className="mt-1.5 text-sm text-error" role="alert">
            {error}
          </p>
        )}

        {/* Helper text (only shown if no error) */}
        {!error && helperText && (
          <p className="mt-1.5 text-sm text-text-secondary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
