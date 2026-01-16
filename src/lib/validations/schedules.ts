// ===========================================
// FILE: src/lib/validations/schedules.ts
// PURPOSE: Zod validation schemas for visit scheduling
// PRD REFERENCE: PRD Section 8 - Visit Scheduling
// USED BY: Schedule forms, API routes
// ===========================================

import { z } from 'zod';

/**
 * Scheduled visit status enum
 * WHY: Match database enum for type safety
 */
export const scheduledVisitStatusEnum = z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']);

/**
 * Create scheduled visit schema
 * WHY: Schedule a future site visit
 * PRD REFERENCE: PRD Section 8.1 - Visit Scheduling
 *
 * FIELDS:
 * - siteId: Site to visit
 * - scheduledDate: Date of planned visit
 * - notes: Optional notes for the visit
 */
export const createScheduledVisitSchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  scheduledDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  notes: z.string().optional().nullable(),
});

export type CreateScheduledVisitInput = z.infer<typeof createScheduledVisitSchema>;

/**
 * Update scheduled visit schema
 * WHY: Modify an existing scheduled visit
 */
export const updateScheduledVisitSchema = z.object({
  scheduledDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }).optional(),
  notes: z.string().optional().nullable(),
  status: scheduledVisitStatusEnum.optional(),
});

export type UpdateScheduledVisitInput = z.infer<typeof updateScheduledVisitSchema>;

/**
 * Complete scheduled visit schema
 * WHY: Link a scheduled visit to an actual visit log
 * PRD REFERENCE: PRD Section 8.2 - Visit Completion
 */
export const completeScheduledVisitSchema = z.object({
  visitLogId: z.string().uuid('Invalid visit log ID').optional(),
  createNewVisit: z.boolean().default(false),
});

export type CompleteScheduledVisitInput = z.infer<typeof completeScheduledVisitSchema>;

/**
 * Schedule query parameters schema
 * WHY: Filter and paginate scheduled visits
 */
export const scheduleQuerySchema = z.object({
  siteId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
  status: scheduledVisitStatusEnum.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ScheduleQueryInput = z.infer<typeof scheduleQuerySchema>;

/**
 * Reminder query schema
 * WHY: Get sites needing visits based on reminder days
 * PRD REFERENCE: PRD Section 8.3 - Visit Reminders
 */
export const reminderQuerySchema = z.object({
  daysAhead: z.coerce.number().int().min(0).max(30).default(7),
  includeOverdue: z.coerce.boolean().default(true),
});

export type ReminderQueryInput = z.infer<typeof reminderQuerySchema>;

/**
 * Bulk schedule schema
 * WHY: Schedule multiple visits at once (e.g., recurring)
 */
export const bulkScheduleSchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  dates: z.array(
    z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    })
  ).min(1, 'At least one date is required'),
  notes: z.string().optional().nullable(),
});

export type BulkScheduleInput = z.infer<typeof bulkScheduleSchema>;

/**
 * Recurring schedule schema
 * WHY: Create recurring visit schedules
 */
export const recurringScheduleSchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start date format',
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid end date format',
  }),
  intervalDays: z.number().int().min(1).max(90).default(14),
  notes: z.string().optional().nullable(),
});

export type RecurringScheduleInput = z.infer<typeof recurringScheduleSchema>;
