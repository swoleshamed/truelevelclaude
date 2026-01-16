// ===========================================
// FILE: src/components/ui/Select.tsx
// PURPOSE: Reusable select/dropdown component
// PRD REFERENCE: UI Spec - Form Elements
// USED BY: Forms with predefined option sets (injectors, tips, wash types, etc.)
// ===========================================

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  placeholder?: string;
  children?: React.ReactNode;
}

/**
 * Select Component
 *
 * WHY: Consistent dropdown styling for selecting from predefined options.
 * Used throughout the app for chemical types, injector selection, tip selection,
 * wash types, container types, etc.
 *
 * FEATURES:
 * - Label with proper association
 * - Error state styling
 * - Helper text for guidance
 * - Placeholder option support
 * - Disabled options support
 * - Integrates with React Hook Form
 *
 * EXAMPLE:
 * ```tsx
 * <Select
 *   label="Injector Type"
 *   options={injectorTypes.map(t => ({
 *     value: t.id,
 *     label: `${t.name} (${t.gpm} GPM)`
 *   }))}
 *   placeholder="Select an injector..."
 *   error={errors.injectorTypeId?.message}
 *   {...register('injectorTypeId')}
 * />
 * ```
 *
 * @param label - Field label displayed above select
 * @param error - Error message (shows red border and error text)
 * @param helperText - Helper text displayed below select
 * @param options - Array of option objects
 * @param placeholder - Placeholder text for empty state
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      className,
      id,
      children,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    // Base select styles
    const baseStyles =
      'w-full px-3 py-2 border rounded-md bg-bg-secondary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-no-repeat';

    // Border color based on error state
    const borderStyles = error
      ? 'border-error focus:border-error focus:ring-error'
      : 'border-border-medium focus:border-primary';

    // Custom dropdown arrow styling
    const arrowStyles =
      'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236B7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")] bg-[position:right_0.5rem_center] bg-[size:1.5em_1.5em] pr-10';

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            {label}
          </label>
        )}

        {/* Select field */}
        <select
          id={selectId}
          ref={ref}
          className={cn(baseStyles, borderStyles, arrowStyles, className)}
          {...props}
        >
          {/* Placeholder option */}
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {/* Render options array if provided, otherwise use children */}
          {options
            ? options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))
            : children}
        </select>

        {/* Error message */}
        {error && (
          <p className="mt-1.5 text-sm text-error" role="alert">
            {error}
          </p>
        )}

        {/* Helper text (only shown if no error) */}
        {!error && helperText && (
          <p className="mt-1.5 text-sm text-text-secondary">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
