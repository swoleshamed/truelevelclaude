// ===========================================
// FILE: src/lib/validations/analytics.ts
// PURPOSE: Zod validation schemas for analytics queries
// PRD REFERENCE: PRD Section 7 - Analytics & Reporting
// USED BY: Analytics API routes, dashboard components
// ===========================================

import { z } from 'zod';

/**
 * Aggregation period enum
 * WHY: Define time periods for grouping analytics data
 */
export const aggregationPeriodEnum = z.enum(['day', 'week', 'month']);

/**
 * Date range schema
 * WHY: Common date range filter for analytics queries
 */
export const dateRangeSchema = z.object({
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start date format',
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid end date format',
  }),
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
  message: 'Start date must be before or equal to end date',
});

/**
 * Cost per car query schema
 * WHY: Filter cost analysis by site, date range, and aggregation
 * PRD REFERENCE: PRD Section 7.1 - Cost Per Car Analysis
 *
 * PARAMETERS:
 * - siteId: Filter to specific site (required for site-level analysis)
 * - startDate/endDate: Date range for analysis
 * - period: Aggregation period for trend data
 * - includeBreakdown: Include chemical-level breakdown
 */
export const costPerCarQuerySchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start date format',
  }).optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid end date format',
  }).optional(),
  period: aggregationPeriodEnum.default('month'),
  includeBreakdown: z.coerce.boolean().default(false),
});

export type CostPerCarQueryInput = z.infer<typeof costPerCarQuerySchema>;

/**
 * Usage query schema
 * WHY: Filter chemical usage data
 * PRD REFERENCE: PRD Section 7.2 - Usage Trends
 *
 * PARAMETERS:
 * - siteId: Filter to specific site
 * - chemicalId: Filter to specific chemical (optional)
 * - startDate/endDate: Date range for analysis
 * - period: Aggregation period for trend data
 */
export const usageQuerySchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  chemicalId: z.string().uuid('Invalid chemical ID').optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start date format',
  }).optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid end date format',
  }).optional(),
  period: aggregationPeriodEnum.default('week'),
});

export type UsageQueryInput = z.infer<typeof usageQuerySchema>;

/**
 * Summary query schema
 * WHY: Get dashboard summary metrics
 * PRD REFERENCE: PRD Section 7.3 - Dashboard Summary
 *
 * PARAMETERS:
 * - siteId: Filter to specific site (optional for org-level)
 * - organizationId: Filter to specific organization (for distributor view)
 * - period: Time period for metrics (last 7, 30, or 90 days)
 */
export const summaryQuerySchema = z.object({
  siteId: z.string().uuid('Invalid site ID').optional(),
  organizationId: z.string().uuid('Invalid organization ID').optional(),
  period: z.enum(['7', '30', '90']).default('30'),
});

export type SummaryQueryInput = z.infer<typeof summaryQuerySchema>;

/**
 * Comparison query schema
 * WHY: Compare metrics between two periods
 * PRD REFERENCE: PRD Section 7.4 - Period Comparison
 */
export const comparisonQuerySchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  currentStart: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid current start date format',
  }),
  currentEnd: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid current end date format',
  }),
  previousStart: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid previous start date format',
  }),
  previousEnd: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid previous end date format',
  }),
});

export type ComparisonQueryInput = z.infer<typeof comparisonQuerySchema>;

/**
 * Package cost query schema
 * WHY: Analyze costs by wash package
 * PRD REFERENCE: PRD Section 7.5 - Package Analysis
 */
export const packageCostQuerySchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  packageId: z.string().uuid('Invalid package ID').optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start date format',
  }).optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid end date format',
  }).optional(),
});

export type PackageCostQueryInput = z.infer<typeof packageCostQuerySchema>;

/**
 * Low inventory query schema
 * WHY: Find chemicals running low
 * PRD REFERENCE: PRD Section 7.6 - Inventory Alerts
 */
export const lowInventoryQuerySchema = z.object({
  siteId: z.string().uuid('Invalid site ID').optional(),
  organizationId: z.string().uuid('Invalid organization ID').optional(),
  thresholdDays: z.coerce.number().int().min(1).max(30).default(7),
});

export type LowInventoryQueryInput = z.infer<typeof lowInventoryQuerySchema>;

/**
 * Export query schema
 * WHY: Export analytics data to different formats
 */
export const exportQuerySchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start date format',
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid end date format',
  }),
  format: z.enum(['csv', 'json', 'pdf']).default('csv'),
  includeChemicals: z.coerce.boolean().default(true),
  includePackages: z.coerce.boolean().default(true),
  includeUsage: z.coerce.boolean().default(true),
});

export type ExportQueryInput = z.infer<typeof exportQuerySchema>;
