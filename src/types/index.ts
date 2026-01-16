// ===========================================
// FILE: src/types/index.ts
// PURPOSE: Shared TypeScript type definitions
// WHY: Centralized types for consistency across the app
// ===========================================

// Define Prisma enums locally since they may not be exported by @prisma/client
export type UserRole = 'DISTRIBUTOR_ADMIN' | 'DISTRIBUTOR_USER' | 'ORG_ADMIN' | 'SITE_MANAGER' | 'SITE_USER';

export type ChemicalType =
  | 'PREP_SOAP'
  | 'HIGH_PH_PRESOAK'
  | 'LOW_PH_PRESOAK'
  | 'WHEEL_TIRE_CLEANER'
  | 'FOAM_DETERGENT'
  | 'FRAGRANCE'
  | 'TRI_COLOR'
  | 'PROTECTANT'
  | 'DRY_AGENT'
  | 'TIRE_SHINE'
  | 'OTHER';

export type ContainerType =
  | 'HOLDING_TANK_10GAL'
  | 'HOLDING_TANK_15GAL'
  | 'HOLDING_TANK_20GAL'
  | 'HOLDING_TANK_CUSTOM'
  | 'JUG_1GAL'
  | 'JUG_2_5GAL'
  | 'PAIL_5GAL'
  | 'DRUM_15GAL'
  | 'DRUM_30GAL'
  | 'DRUM_55GAL';

export type WashType = 'EXPRESS' | 'FLEX' | 'FULL_SERVE' | 'SELF_SERVE';

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
 *
 * LOCATION TYPES:
 * - ALL: View all organizations/sites (distributor only)
 * - ORG: View specific organization with all sites
 * - SITE: View specific site details
 */
export type LocationContext =
  | {
      type: 'ALL';
    }
  | {
      type: 'ORG';
      organizationId: string;
      organizationName: string;
    }
  | {
      type: 'SITE';
      siteId: string;
      siteName: string;
      organizationId: string;
      organizationName: string;
    };
