// ===========================================
// FILE: src/components/ui/Button.tsx
// PURPOSE: Reusable button component with variants
// PRD REFERENCE: UI Spec - Buttons
// USED BY: Forms, modals, and action triggers throughout the app
// ===========================================

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Button component variants
 * WHY: Different visual hierarchies for different actions
 * - primary: Main call-to-action (green)
 * - secondary: Less prominent actions (white with border)
 * - destructive: Dangerous actions like delete (red)
 * - ghost: Minimal style for tertiary actions
 */
type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';

/**
 * Button component sizes
 * WHY: Flexibility for different UI contexts
 */
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

/**
 * Button Component
 *
 * WHY: Consistent button styling across the entire application.
 * Follows the design system from UI Spec with proper hover states,
 * disabled states, and loading indicators.
 *
 * EXAMPLE:
 * ```tsx
 * <Button variant="primary" onClick={handleSubmit}>
 *   Save Changes
 * </Button>
 * ```
 *
 * @param variant - Visual style (primary, secondary, destructive, ghost)
 * @param size - Button size (sm, md, lg)
 * @param loading - Show loading state
 * @param disabled - Disable button interaction
 * @param children - Button content
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}: ButtonProps) {
  // Base styles for all buttons
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant-specific styles
  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-text-inverse hover:bg-primary-hover active:bg-primary-active',
    secondary: 'bg-bg-secondary text-text-primary border border-border-medium hover:bg-bg-tertiary',
    destructive: 'bg-error text-white hover:bg-red-600 active:bg-red-700',
    ghost: 'text-text-primary hover:bg-bg-tertiary active:bg-border-light',
  };

  // Size-specific styles
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
