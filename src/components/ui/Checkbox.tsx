// ===========================================
// FILE: src/components/ui/Checkbox.tsx
// PURPOSE: Reusable checkbox component with label support
// PRD REFERENCE: UI Spec - Form Elements
// USED BY: Visit logs (delivery received, equipment changed), settings, filters
// ===========================================

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
}

/**
 * Checkbox Component
 *
 * WHY: Consistent checkbox styling for boolean inputs throughout the app.
 * Used in visit logs for "Delivery received" and "Equipment changed" toggles,
 * as well as settings and filters.
 *
 * FEATURES:
 * - Label with optional description
 * - Error state styling
 * - Custom checkmark icon
 * - Proper accessibility support
 * - Integrates with React Hook Form
 *
 * EXAMPLE:
 * ```tsx
 * <Checkbox
 *   label="Delivery received"
 *   description="Check if chemical was delivered during this visit"
 *   {...register('deliveryReceived')}
 * />
 * ```
 *
 * @param label - Checkbox label text
 * @param description - Optional description displayed below label
 * @param error - Error message
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className, id, ...props }, ref) => {
    // Generate unique ID if not provided
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    // Base checkbox styles
    // WHY: Custom styling to match design system instead of browser defaults
    const baseStyles =
      'h-5 w-5 rounded border-border-medium text-primary focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

    const errorStyles = error ? 'border-error' : '';

    return (
      <div className="w-full">
        <div className="flex items-start">
          {/* Checkbox input */}
          <div className="flex items-center h-5">
            <input
              id={checkboxId}
              type="checkbox"
              ref={ref}
              className={cn(baseStyles, errorStyles, className)}
              {...props}
            />
          </div>

          {/* Label and description */}
          {(label || description) && (
            <div className="ml-3 text-sm">
              {label && (
                <label
                  htmlFor={checkboxId}
                  className="font-medium text-text-primary cursor-pointer"
                >
                  {label}
                </label>
              )}
              {description && (
                <p className="text-text-secondary mt-0.5">{description}</p>
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-1.5 text-sm text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
