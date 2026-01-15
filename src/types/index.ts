// ===========================================
// FILE: src/types/index.ts
// PURPOSE: Shared TypeScript type definitions
// WHY: Centralized types for consistency across the app
// ===========================================

import { UserRole, ChemicalType, ContainerType, WashType } from '@prisma/client';

// Re-export Prisma enums for convenience
export { UserRole, ChemicalType, ContainerType, WashType };

// ===========================================
// USER & AUTH TYPES
// ===========================================

/**
 * User session data
 * WHY: Type-safe session management with NextAuth
 */
export interface UserSession {
  id: string;
  email: string | null;
  role: UserRole;
  firstName: string;
  lastName: string;
  distributorId: string | null;
  organizationId: string | null;
}

/**
 * Registration form data
 * PRD REFERENCE: PRD Section 4 - Authentication System
 */
export interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  accountType: 'DISTRIBUTOR' | 'ORGANIZATION';
  companyName: string;
}

// ===========================================
// CHEMICAL TYPES
// ===========================================

/**
 * Tank status for visual indicators
 * PRD REFERENCE: Technical Spec - Tank Status Logic
 */
export type TankStatus = 'NORMAL' | 'LOW_STOCK' | 'CRITICAL';

/**
 * Chemical entry method for visit logs
 * WHY: Users can enter level as gallons or inches
 */
export type EntryMethod = 'GALLONS' | 'INCHES';

/**
 * Inch-to-gallon conversion point
 * WHY: Used for interpolation calculations
 */
export interface ConversionPoint {
  inches: number;
  gallons: number;
}

// ===========================================
// VISIT LOG TYPES
// ===========================================

/**
 * Chemical inventory entry data for visit log
 * PRD REFERENCE: PRD Section 7 - Visit Logging
 */
export interface ChemicalEntryData {
  chemicalSiteConfigId: string;
  entryMethod: EntryMethod;
  levelGallons?: number;
  levelInches?: number;
  backstockCount: number;
  deliveryReceived: boolean;
  deliveryCount?: number;
  notes?: string;
}

/**
 * Service log entry data for visit log
 * PRD REFERENCE: PRD Section 7 - Visit Logging
 */
export interface ServiceEntryData {
  chemicalSiteApplicationId: string;
  equipmentChanged: boolean;
  newInjectorTypeId?: string;
  newTipTypeId?: string;
  notes?: string;
}

/**
 * Complete visit log submission
 * PRD REFERENCE: PRD Section 7 - Visit Logging
 */
export interface VisitLogSubmission {
  visitDate: string;
  chemicalEntries: ChemicalEntryData[];
  serviceEntries: ServiceEntryData[];
  publicNotes?: string;
  privateNotes?: string;
  serviceNotes?: string;
  privateServiceNotes?: string;
}

// ===========================================
// ANALYTICS TYPES
// ===========================================

/**
 * Car count entry for cost per car report
 * PRD REFERENCE: PRD Section 4 - Cost Per Car Reporting
 *
 * WHY: Users can enter counts by package or just total
 */
export interface CarCountEntry {
  byPackage?: Record<string, number>; // packageId -> car count
  totalOnly?: number; // If package breakdown unavailable
}

/**
 * Cost per car report results
 * PRD REFERENCE: Technical Spec - Cost Per Car Analytics
 */
export interface CostPerCarReport {
  period: {
    startDate: string;
    endDate: string;
    basedOnVisits: {
      start: string;
      end: string;
    };
  };
  summary: {
    totalCars: number;
    totalChemicalCost: number;
    overallCostPerCar: number;
  };
  byPackage: PackageCostBreakdown[];
  byChemical: ChemicalCostBreakdown[];
}

/**
 * Package cost breakdown
 */
export interface PackageCostBreakdown {
  packageId: string;
  packageName: string;
  cars: number;
  totalCost: number;
  costPerCar: number;
  percentOfTotal: number;
}

/**
 * Chemical cost breakdown
 */
export interface ChemicalCostBreakdown {
  chemicalId: string;
  chemicalName: string;
  totalUsageGallons: number;
  totalCost: number;
  costPerCar: number;
  byPackage: {
    packageName: string;
    usageGallons: number;
    costPerCar: number;
  }[];
}

// ===========================================
// LOCATION CONTEXT TYPES
// ===========================================

/**
 * Current location context for navigation
 * WHY: Tab-based navigation changes based on location level
 * PRD REFERENCE: PRD Section 5 - Navigation Architecture
 */
export type LocationLevel = 'all' | 'organization' | 'site';

export interface LocationContext {
  level: LocationLevel;
  organizationId?: string;
  siteId?: string;
}
