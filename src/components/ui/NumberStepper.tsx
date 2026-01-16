// ===========================================
// FILE: src/components/ui/NumberStepper.tsx
// PURPOSE: Number input with increment/decrement buttons
// PRD REFERENCE: PRD Section 7 - Visit Logging (backstock and delivery counts)
// USED BY: Visit log modal for entering container counts
// ===========================================

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * NumberStepper Component
 *
 * WHY: User-friendly way to enter counts in the visit log. Used for:
 * - Backstock count (number of full drums/pails in storage)
 * - Delivery count (number of containers delivered)
 *
 * DESIGN:
 * - Minus button | Value display | Plus button layout
 * - Large touch targets for mobile use in car wash environment
 * - Clear visual feedback on interaction
 *
 * BUSINESS CONTEXT (PRD Section 7):
 * Visit logs track chemical inventory. Backstock and delivery counts
 * are whole numbers (you can't have 2.5 drums). This stepper makes
 * it easy to adjust counts without typing.
 *
 * EXAMPLE:
 * ```tsx
 * <NumberStepper
 *   label="Backstock Count"
 *   value={backstockCount}
 *   onChange={setBackstockCount}
 *   min={0}
 *   max={50}
 * />
 * ```
 *
 * @param value - Current number value
 * @param onChange - Callback when value changes
 * @param min - Minimum allowed value (default: 0)
 * @param max - Maximum allowed value (default: 999)
 * @param step - Increment/decrement step (default: 1)
 * @param label - Optional label displayed above stepper
 * @param disabled - Disable all interactions
 */
export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  label,
  disabled = false,
  className,
}: NumberStepperProps) {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue)) {
      onChange(Math.max(min, Math.min(max, newValue)));
    } else if (e.target.value === '') {
      onChange(min);
    }
  };

  // Button styles
  const buttonStyles =
    'flex items-center justify-center w-10 h-10 rounded-md bg-bg-tertiary text-text-primary hover:bg-border-light active:bg-border-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1';

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
        </label>
      )}

      {/* Stepper controls */}
      <div className="inline-flex items-center gap-2">
        {/* Decrement button */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className={buttonStyles}
          aria-label="Decrease value"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        </button>

        {/* Value display/input */}
        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={cn(
            'w-16 h-10 px-2 text-center text-lg font-semibold',
            'border border-border-medium rounded-md bg-bg-secondary',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            // Hide spinner arrows
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
          )}
        />

        {/* Increment button */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className={buttonStyles}
          aria-label="Increase value"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
