// ===========================================
// FILE: src/lib/validations/visits.ts
// PURPOSE: Zod validation schemas for visit logging
// PRD REFERENCE: PRD Section 6 - Visit Logging
// USED BY: Visit forms, API routes
// ===========================================

import { z } from 'zod';

/**
 * Entry method enum for chemical entries
 * WHY: Track how inventory was measured
 */
export const entryMethodEnum = z.enum(['GALLONS', 'INCHES', 'ESTIMATED']);

/**
 * Visit Log validation schema
 * WHY: Main visit record that contains chemical and service entries
 * PRD REFERENCE: PRD Section 6.1 - Visit Logs
 */
export const visitLogSchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  visitDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  publicNotes: z.string().optional().nullable(),
  privateNotes: z.string().optional().nullable(),
  serviceNotes: z.string().optional().nullable(),
  privateServiceNotes: z.string().optional().nullable(),
});

export type VisitLogInput = z.infer<typeof visitLogSchema>;

/**
 * Update visit log schema
 */
export const updateVisitLogSchema = z.object({
  visitDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }).optional(),
  publicNotes: z.string().optional().nullable(),
  privateNotes: z.string().optional().nullable(),
  serviceNotes: z.string().optional().nullable(),
  privateServiceNotes: z.string().optional().nullable(),
});

export type UpdateVisitLogInput = z.infer<typeof updateVisitLogSchema>;

/**
 * Chemical entry validation schema
 * WHY: Record inventory levels for each chemical at time of visit
 * PRD REFERENCE: PRD Section 6.2 - Chemical Entries
 *
 * FIELDS:
 * - entryMethod: How measurement was taken (gallons/inches/estimated)
 * - levelGallons/levelInches: Primary tank measurement
 * - backstockCount/backstockGallons: Backup inventory
 * - deliveryReceived: Whether delivery was made during visit
 * - deliveryCount/deliveryGallons: Delivery details
 * - totalOnHandGallons: Calculated total inventory
 * - calculatedUsageGallons: Usage since last visit (calculated)
 */
export const chemicalEntrySchema = z.object({
  chemicalSiteConfigId: z.string().uuid('Invalid chemical config ID'),
  entryMethod: entryMethodEnum,
  levelGallons: z.number().min(0).optional().nullable(),
  levelInches: z.number().min(0).optional().nullable(),
  backstockCount: z.number().int().min(0).default(0),
  backstockGallons: z.number().min(0).default(0),
  deliveryReceived: z.boolean().default(false),
  deliveryCount: z.number().int().min(0).optional().nullable(),
  deliveryGallons: z.number().min(0).optional().nullable(),
  totalOnHandGallons: z.number().min(0),
  calculatedUsageGallons: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type ChemicalEntryInput = z.infer<typeof chemicalEntrySchema>;

/**
 * Bulk chemical entries schema
 * WHY: Submit all chemical entries for a visit at once
 */
export const bulkChemicalEntriesSchema = z.object({
  entries: z.array(chemicalEntrySchema).min(1, 'At least one entry is required'),
});

export type BulkChemicalEntriesInput = z.infer<typeof bulkChemicalEntriesSchema>;

/**
 * Update chemical entry schema
 */
export const updateChemicalEntrySchema = z.object({
  id: z.string().uuid('Invalid entry ID'),
  entryMethod: entryMethodEnum.optional(),
  levelGallons: z.number().min(0).optional().nullable(),
  levelInches: z.number().min(0).optional().nullable(),
  backstockCount: z.number().int().min(0).optional(),
  backstockGallons: z.number().min(0).optional(),
  deliveryReceived: z.boolean().optional(),
  deliveryCount: z.number().int().min(0).optional().nullable(),
  deliveryGallons: z.number().min(0).optional().nullable(),
  totalOnHandGallons: z.number().min(0).optional(),
  calculatedUsageGallons: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type UpdateChemicalEntryInput = z.infer<typeof updateChemicalEntrySchema>;

/**
 * Service entry validation schema
 * WHY: Record equipment changes during visits
 * PRD REFERENCE: PRD Section 6.3 - Service Entries
 *
 * FIELDS:
 * - chemicalSiteApplicationId: Which application was serviced
 * - equipmentChanged: Whether equipment was replaced
 * - previous/new InjectorTypeId: Track injector changes
 * - previous/new TipTypeId: Track tip changes
 */
export const serviceEntrySchema = z.object({
  chemicalSiteApplicationId: z.string().uuid('Invalid application ID'),
  equipmentChanged: z.boolean().default(false),
  previousInjectorTypeId: z.string().uuid().optional().nullable(),
  previousTipTypeId: z.string().uuid().optional().nullable(),
  newInjectorTypeId: z.string().uuid().optional().nullable(),
  newTipTypeId: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type ServiceEntryInput = z.infer<typeof serviceEntrySchema>;

/**
 * Bulk service entries schema
 * WHY: Submit all service entries for a visit at once
 */
export const bulkServiceEntriesSchema = z.object({
  entries: z.array(serviceEntrySchema),
});

export type BulkServiceEntriesInput = z.infer<typeof bulkServiceEntriesSchema>;

/**
 * Update service entry schema
 */
export const updateServiceEntrySchema = z.object({
  id: z.string().uuid('Invalid entry ID'),
  equipmentChanged: z.boolean().optional(),
  previousInjectorTypeId: z.string().uuid().optional().nullable(),
  previousTipTypeId: z.string().uuid().optional().nullable(),
  newInjectorTypeId: z.string().uuid().optional().nullable(),
  newTipTypeId: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type UpdateServiceEntryInput = z.infer<typeof updateServiceEntrySchema>;

/**
 * Complete visit with entries schema
 * WHY: Create a full visit with all entries in one request
 */
export const completeVisitSchema = z.object({
  visit: visitLogSchema,
  chemicalEntries: z.array(chemicalEntrySchema).optional(),
  serviceEntries: z.array(serviceEntrySchema).optional(),
});

export type CompleteVisitInput = z.infer<typeof completeVisitSchema>;

/**
 * Visit query parameters schema
 * WHY: Filter and paginate visit logs
 */
export const visitQuerySchema = z.object({
  siteId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type VisitQueryInput = z.infer<typeof visitQuerySchema>;
