// ===========================================
// FILE: src/lib/validations/packages.ts
// PURPOSE: Zod validation schemas for wash packages
// PRD REFERENCE: PRD Section 5 - Wash Package Management
// USED BY: Package forms, API routes
// ===========================================

import { z } from 'zod';

/**
 * Wash Package Template validation schema
 * WHY: Organizations create templates to standardize packages across sites
 * PRD REFERENCE: PRD Section 5.1 - Package Templates
 */
export const washPackageTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  isDefault: z.boolean().optional().default(false),
  organizationId: z.string().uuid('Invalid organization ID'),
});

export type WashPackageTemplateInput = z.infer<typeof washPackageTemplateSchema>;

/**
 * Update template schema (organizationId not required)
 */
export const updateWashPackageTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').optional(),
  isDefault: z.boolean().optional(),
});

export type UpdateWashPackageTemplateInput = z.infer<typeof updateWashPackageTemplateSchema>;

/**
 * Wash Package Template Item validation schema
 * WHY: Template items represent individual wash packages (Basic, Premium, etc.)
 * PRD REFERENCE: PRD Section 5.1 - Package Templates
 */
export const washPackageTemplateItemSchema = z.object({
  templateId: z.string().uuid('Invalid template ID'),
  name: z.string().min(1, 'Package name is required'),
  displayOrder: z.number().int().min(1, 'Display order must be at least 1'),
  singleWashPrice: z.number().min(0, 'Price cannot be negative').optional().nullable(),
  membershipPrice: z.number().min(0, 'Price cannot be negative').optional().nullable(),
  description: z.string().optional().nullable(),
});

export type WashPackageTemplateItemInput = z.infer<typeof washPackageTemplateItemSchema>;

/**
 * Update template item schema
 */
export const updateWashPackageTemplateItemSchema = z.object({
  name: z.string().min(1, 'Package name is required').optional(),
  displayOrder: z.number().int().min(1).optional(),
  singleWashPrice: z.number().min(0).optional().nullable(),
  membershipPrice: z.number().min(0).optional().nullable(),
  description: z.string().optional().nullable(),
});

export type UpdateWashPackageTemplateItemInput = z.infer<typeof updateWashPackageTemplateItemSchema>;

/**
 * Template Chemical assignment validation schema
 * WHY: Assign chemicals to template items for consistent package setup
 * PRD REFERENCE: PRD Section 5.1 - Package Templates
 */
export const washPackageTemplateChemicalSchema = z.object({
  templateItemId: z.string().uuid('Invalid template item ID'),
  chemicalOrgConfigId: z.string().uuid('Invalid chemical config ID'),
  applicationOrder: z.number().int().min(1, 'Application order must be at least 1'),
});

export type WashPackageTemplateChemicalInput = z.infer<typeof washPackageTemplateChemicalSchema>;

/**
 * Site Wash Package validation schema
 * WHY: Sites have their own packages, either from templates or custom
 * PRD REFERENCE: PRD Section 5.2 - Site Packages
 */
export const washPackageSchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  templateItemId: z.string().uuid('Invalid template item ID').optional().nullable(),
  name: z.string().min(1, 'Package name is required'),
  displayOrder: z.number().int().min(1, 'Display order must be at least 1'),
  singleWashPrice: z.number().min(0, 'Price cannot be negative').optional().nullable(),
  membershipPrice: z.number().min(0, 'Price cannot be negative').optional().nullable(),
  description: z.string().optional().nullable(),
  isFromTemplate: z.boolean().optional().default(false),
});

export type WashPackageInput = z.infer<typeof washPackageSchema>;

/**
 * Update wash package schema
 */
export const updateWashPackageSchema = z.object({
  name: z.string().min(1, 'Package name is required').optional(),
  displayOrder: z.number().int().min(1).optional(),
  singleWashPrice: z.number().min(0).optional().nullable(),
  membershipPrice: z.number().min(0).optional().nullable(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export type UpdateWashPackageInput = z.infer<typeof updateWashPackageSchema>;

/**
 * Package Chemical assignment validation schema
 * WHY: Assign site-specific chemical applications to packages
 * PRD REFERENCE: PRD Section 5.2 - Site Packages
 */
export const washPackageChemicalSchema = z.object({
  washPackageId: z.string().uuid('Invalid package ID'),
  chemicalSiteApplicationId: z.string().uuid('Invalid application ID'),
  applicationOrder: z.number().int().min(1, 'Application order must be at least 1'),
});

export type WashPackageChemicalInput = z.infer<typeof washPackageChemicalSchema>;

/**
 * Bulk chemical assignment schema
 * WHY: Allow assigning multiple chemicals at once
 */
export const bulkWashPackageChemicalSchema = z.object({
  washPackageId: z.string().uuid('Invalid package ID'),
  chemicals: z.array(z.object({
    chemicalSiteApplicationId: z.string().uuid('Invalid application ID'),
    applicationOrder: z.number().int().min(1),
  })).min(1, 'At least one chemical is required'),
});

export type BulkWashPackageChemicalInput = z.infer<typeof bulkWashPackageChemicalSchema>;

/**
 * Apply template to site schema
 * WHY: Allow sites to quickly apply org templates
 */
export const applyTemplateSchema = z.object({
  templateId: z.string().uuid('Invalid template ID'),
  siteId: z.string().uuid('Invalid site ID'),
});

export type ApplyTemplateInput = z.infer<typeof applyTemplateSchema>;
