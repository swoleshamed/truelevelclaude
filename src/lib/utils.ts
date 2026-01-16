// ===========================================
// FILE: src/lib/utils.ts
// PURPOSE: Utility functions for TrueLevel application
// USED BY: Components, API routes, and other utility files
// ===========================================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with proper precedence
 * WHY: Prevents class conflicts when combining conditional classes
 *
 * @example
 * ```tsx
 * <div className={cn("text-red-500", isActive && "text-blue-500")} />
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency (USD)
 * WHY: Consistent currency formatting throughout the app
 *
 * @example
 * ```ts
 * formatCurrency(1234.56) // "$1,234.56"
 * ```
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format a number with fixed decimal places
 * WHY: Consistent number formatting for gallons, GPM, etc.
 *
 * @example
 * ```ts
 * formatNumber(46.7, 1) // "46.7"
 * formatNumber(2, 2) // "2.00"
 * ```
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Convert inches to gallons using linear interpolation
 * WHY: Container measurements are taken in inches but stored/displayed in gallons
 * PRD REFERENCE: Implementation Guide - Section "Inch-to-Gallon Interpolation"
 *
 * @param conversions - Array of conversion points from database
 * @param inches - Measured inches from ground up
 * @returns Interpolated gallons value
 *
 * @example
 * ```ts
 * const conversions = [
 *   { inches: 10.0, gallons: 7 },
 *   { inches: 11.4, gallons: 8 }
 * ];
 * inchesToGallons(conversions, 10.7) // ~7.5 gallons
 * ```
 */
export function inchesToGallons(
  conversions: Array<{ inches: number; gallons: number }>,
  inches: number
): number {
  // Sort by inches ascending
  const sorted = [...conversions].sort((a, b) => a.inches - b.inches);

  // Find the lower bound (largest inches <= target)
  const lower = sorted.filter((c) => c.inches <= inches).pop();

  // Find the upper bound (smallest inches >= target)
  const upper = sorted.find((c) => c.inches >= inches);

  // Error handling
  if (!lower || !upper) {
    throw new Error(
      `Inches value ${inches} is out of range for this container type`
    );
  }

  // If exact match, return the gallons value
  if (lower.inches === upper.inches) {
    return lower.gallons;
  }

  // Linear interpolation
  // Formula: y = y1 + (x - x1) * (y2 - y1) / (x2 - x1)
  const ratio = (inches - lower.inches) / (upper.inches - lower.inches);
  const gallons = lower.gallons + ratio * (upper.gallons - lower.gallons);

  return Math.round(gallons * 10) / 10; // Round to 1 decimal place
}

/**
 * Determine tank status color based on current level
 * WHY: Visual indicators for inventory management
 * PRD REFERENCE: Implementation Guide - Section "Tank Status Logic"
 *
 * @param currentGallons - Current tank level in gallons
 * @param totalGallons - Total tank capacity
 * @param alertThreshold - Optional custom alert threshold in gallons
 * @returns Status: NORMAL (green), LOW_STOCK (yellow), or CRITICAL (red)
 *
 * BUSINESS LOGIC:
 * - If custom threshold set:
 *   - Above 2x threshold = NORMAL
 *   - Above 1x threshold = LOW_STOCK
 *   - Below threshold = CRITICAL
 * - If no threshold (percentage-based):
 *   - Above 50% = NORMAL
 *   - 25-50% = LOW_STOCK
 *   - Below 25% = CRITICAL
 */
export function getTankStatus(
  currentGallons: number,
  totalGallons: number,
  alertThreshold?: number
): 'NORMAL' | 'LOW_STOCK' | 'CRITICAL' {
  if (alertThreshold) {
    // Custom threshold logic
    if (currentGallons > alertThreshold * 2) return 'NORMAL';
    if (currentGallons > alertThreshold) return 'LOW_STOCK';
    return 'CRITICAL';
  } else {
    // Default percentage logic
    const percentage = (currentGallons / totalGallons) * 100;
    if (percentage > 50) return 'NORMAL';
    if (percentage > 25) return 'LOW_STOCK';
    return 'CRITICAL';
  }
}

/**
 * Get status badge color classes
 * WHY: Consistent status badge styling across components
 */
export function getStatusBadgeClass(status: 'NORMAL' | 'LOW_STOCK' | 'CRITICAL'): string {
  switch (status) {
    case 'NORMAL':
      return 'badge-normal';
    case 'LOW_STOCK':
      return 'badge-warning';
    case 'CRITICAL':
      return 'badge-critical';
  }
}

/**
 * Format a date to a readable string
 * WHY: Consistent date formatting throughout the app
 *
 * @example
 * ```ts
 * formatDate(new Date('2026-01-15')) // "Jan 15, 2026"
 * ```
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

/**
 * Calculate days between two dates
 * WHY: Used for visit reminder logic
 * PRD REFERENCE: PRD Section 5 - Visit Scheduling
 *
 * @example
 * ```ts
 * daysBetween(new Date('2026-01-01'), new Date('2026-01-15')) // 14
 * ```
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
