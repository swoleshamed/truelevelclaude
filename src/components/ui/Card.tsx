// ===========================================
// FILE: src/components/ui/Card.tsx
// PURPOSE: Reusable card container component
// PRD REFERENCE: UI Spec - Components
// USED BY: Dashboard site cards, package cards, tank displays, etc.
// ===========================================

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

/**
 * Card Component
 *
 * WHY: Consistent card styling throughout the app. Cards are the primary
 * container for grouped content (site monitoring cards, package cards, etc.).
 * Follows the warm, grounded design aesthetic from UI Spec.
 *
 * FEATURES:
 * - Subtle shadow (not flat, not harsh)
 * - Rounded corners (8-12px radius)
 * - Warm white background
 * - Optional hover effect for clickable cards
 * - Configurable padding
 *
 * EXAMPLE:
 * ```tsx
 * <Card hoverable onClick={handleClick}>
 *   <h3>Site Name</h3>
 *   <p>Status information</p>
 * </Card>
 * ```
 *
 * @param padding - Internal padding size (none, sm, md, lg)
 * @param hoverable - Add hover effect for interactive cards
 * @param children - Card content
 */
export function Card({
  children,
  padding = 'md',
  hoverable = false,
  className,
  ...props
}: CardProps) {
  // Base card styles from design system
  // WHY: Subtle shadow and border for depth without harshness
  const baseStyles = 'bg-bg-secondary border border-border-light rounded-lg shadow-md transition-shadow duration-150';

  // Padding variants
  const paddingStyles: Record<NonNullable<CardProps['padding']>, string> = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  // Hover effect for clickable cards
  const hoverStyles = hoverable ? 'hover:shadow-lg cursor-pointer' : '';

  return (
    <div
      className={cn(
        baseStyles,
        paddingStyles[padding],
        hoverStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * CardHeader Component
 *
 * WHY: Consistent header styling for cards with optional actions.
 * Commonly used for card titles with buttons/icons on the right.
 *
 * EXAMPLE:
 * ```tsx
 * <Card>
 *   <CardHeader
 *     title="Downtown Car Wash"
 *     action={<Button size="sm">Edit</Button>}
 *   />
 *   <CardContent>...</CardContent>
 * </Card>
 * ```
 */
export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between mb-4', className)}>
      <div className="flex-1">
        {typeof title === 'string' ? (
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        ) : (
          title
        )}
        {subtitle && (
          <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
}

/**
 * CardContent Component
 *
 * WHY: Standardized spacing for card body content.
 */
export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('', className)}>{children}</div>;
}

/**
 * CardFooter Component
 *
 * WHY: Consistent footer styling for cards with actions or metadata.
 * Often used for action buttons or timestamps.
 */
export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mt-4 pt-4 border-t border-border-light flex items-center justify-between',
        className
      )}
    >
      {children}
    </div>
  );
}
