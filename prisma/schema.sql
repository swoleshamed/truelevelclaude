-- ===========================================
-- TrueLevel V0 Database Schema
-- Generated from Prisma schema
-- ===========================================

-- Create ENUMS
CREATE TYPE "UserRole" AS ENUM (
  'DISTRIBUTOR_ADMIN',
  'DISTRIBUTOR_USER',
  'ORG_ADMIN',
  'SITE_MANAGER',
  'SITE_USER'
);

CREATE TYPE "ChemicalType" AS ENUM (
  'PREP_SOAP',
  'HIGH_PH_PRESOAK',
  'LOW_PH_PRESOAK',
  'TIRE_CLEANER',
  'WHEEL_CLEANER',
  'TRIPLE_FOAM',
  'TRIPLE_FOAM_POLISH',
  'CLEARCOAT_PROTECTANT',
  'CERAMIC_SEALANT',
  'TIRE_SHINE',
  'SPOT_FREE_RINSE',
  'DRYER_AGENT',
  'BUG_PREP',
  'WHEEL_MAGIC',
  'RAIN_X',
  'OTHER'
);

CREATE TYPE "ContainerType" AS ENUM (
  'DRUM_5_GAL',
  'DRUM_15_GAL',
  'DRUM_30_GAL',
  'DRUM_55_GAL',
  'BULK_TANK'
);

CREATE TYPE "WashType" AS ENUM (
  'TOUCHLESS',
  'FRICTION',
  'BOTH'
);

CREATE TYPE "InjectorSystem" AS ENUM (
  'HYDROFLEX',
  'HYDROMINDER'
);

-- ===========================================
-- TABLES
-- ===========================================

-- Distributors
CREATE TABLE "Distributor" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "contactEmail" TEXT NOT NULL,
  "contactPhone" TEXT,
  "address" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Distributor_pkey" PRIMARY KEY ("id")
);

-- Organizations
CREATE TABLE "Organization" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "contactEmail" TEXT NOT NULL,
  "contactPhone" TEXT,
  "address" TEXT,
  "distributorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- Sites
CREATE TABLE "Site" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "washType" "WashType" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- Users
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "phone" TEXT,
  "role" "UserRole" NOT NULL,
  "distributorId" TEXT,
  "organizationId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastLoginAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Site Users (junction table)
CREATE TABLE "SiteUser" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SiteUser_pkey" PRIMARY KEY ("id")
);

-- Chemical Master (Distributor catalog)
CREATE TABLE "ChemicalMaster" (
  "id" TEXT NOT NULL,
  "distributorId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "ChemicalType" NOT NULL,
  "manufacturer" TEXT,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ChemicalMaster_pkey" PRIMARY KEY ("id")
);

-- Chemical Org Config
CREATE TABLE "ChemicalOrgConfig" (
  "id" TEXT NOT NULL,
  "chemicalMasterId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "containerType" "ContainerType" NOT NULL,
  "containerCost" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ChemicalOrgConfig_pkey" PRIMARY KEY ("id")
);

-- Chemical Site Config
CREATE TABLE "ChemicalSiteConfig" (
  "id" TEXT NOT NULL,
  "chemicalOrgConfigId" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "alertThresholdGallons" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ChemicalSiteConfig_pkey" PRIMARY KEY ("id")
);

-- Injector Types
CREATE TABLE "InjectorType" (
  "id" TEXT NOT NULL,
  "system" "InjectorSystem" NOT NULL,
  "name" TEXT NOT NULL,
  "gpm" DOUBLE PRECISION NOT NULL,

  CONSTRAINT "InjectorType_pkey" PRIMARY KEY ("id")
);

-- Tip Types
CREATE TABLE "TipType" (
  "id" TEXT NOT NULL,
  "system" "InjectorSystem" NOT NULL,
  "name" TEXT NOT NULL,
  "dilutionRatio" TEXT NOT NULL,

  CONSTRAINT "TipType_pkey" PRIMARY KEY ("id")
);

-- Chemical Site Application
CREATE TABLE "ChemicalSiteApplication" (
  "id" TEXT NOT NULL,
  "chemicalSiteConfigId" TEXT NOT NULL,
  "tankId" TEXT NOT NULL,
  "injectorTypeId" TEXT NOT NULL,
  "tipTypeId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ChemicalSiteApplication_pkey" PRIMARY KEY ("id")
);

-- Wash Package Templates
CREATE TABLE "WashPackageTemplate" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WashPackageTemplate_pkey" PRIMARY KEY ("id")
);

-- Wash Package Template Chemicals
CREATE TABLE "WashPackageTemplateChemical" (
  "id" TEXT NOT NULL,
  "washPackageTemplateId" TEXT NOT NULL,
  "chemicalOrgConfigId" TEXT NOT NULL,

  CONSTRAINT "WashPackageTemplateChemical_pkey" PRIMARY KEY ("id")
);

-- Wash Packages
CREATE TABLE "WashPackage" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "washPackageTemplateId" TEXT,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WashPackage_pkey" PRIMARY KEY ("id")
);

-- Wash Package Chemicals
CREATE TABLE "WashPackageChemical" (
  "id" TEXT NOT NULL,
  "washPackageId" TEXT NOT NULL,
  "chemicalSiteApplicationId" TEXT NOT NULL,

  CONSTRAINT "WashPackageChemical_pkey" PRIMARY KEY ("id")
);

-- Inch-Gallon Conversions
CREATE TABLE "InchGallonConversion" (
  "id" TEXT NOT NULL,
  "containerType" "ContainerType" NOT NULL,
  "inches" DOUBLE PRECISION NOT NULL,
  "gallons" DOUBLE PRECISION NOT NULL,

  CONSTRAINT "InchGallonConversion_pkey" PRIMARY KEY ("id")
);

-- Visit Logs
CREATE TABLE "VisitLog" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "visitDate" TIMESTAMP(3) NOT NULL,
  "publicNotes" TEXT,
  "privateNotes" TEXT,
  "serviceNotes" TEXT,
  "privateServiceNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "VisitLog_pkey" PRIMARY KEY ("id")
);

-- Visit Log Chemical Entries
CREATE TABLE "VisitLogChemicalEntry" (
  "id" TEXT NOT NULL,
  "visitLogId" TEXT NOT NULL,
  "chemicalSiteConfigId" TEXT NOT NULL,
  "levelGallons" DOUBLE PRECISION NOT NULL,
  "levelInches" DOUBLE PRECISION,
  "backstockCount" INTEGER NOT NULL,
  "deliveryReceived" BOOLEAN NOT NULL DEFAULT false,
  "deliveryCount" INTEGER,
  "notes" TEXT,

  CONSTRAINT "VisitLogChemicalEntry_pkey" PRIMARY KEY ("id")
);

-- Visit Log Service Entries
CREATE TABLE "VisitLogServiceEntry" (
  "id" TEXT NOT NULL,
  "visitLogId" TEXT NOT NULL,
  "chemicalSiteApplicationId" TEXT NOT NULL,
  "equipmentChanged" BOOLEAN NOT NULL DEFAULT false,
  "newInjectorTypeId" TEXT,
  "newTipTypeId" TEXT,
  "notes" TEXT,

  CONSTRAINT "VisitLogServiceEntry_pkey" PRIMARY KEY ("id")
);

-- Car Count Logs
CREATE TABLE "CarCountLog" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "logDate" DATE NOT NULL,
  "totalCars" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CarCountLog_pkey" PRIMARY KEY ("id")
);

-- Car Count by Package
CREATE TABLE "CarCountByPackage" (
  "id" TEXT NOT NULL,
  "carCountLogId" TEXT NOT NULL,
  "washPackageId" TEXT NOT NULL,
  "carCount" INTEGER NOT NULL,

  CONSTRAINT "CarCountByPackage_pkey" PRIMARY KEY ("id")
);

-- Scheduled Visits
CREATE TABLE "ScheduledVisit" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "scheduledDate" DATE NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "visitLogId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ScheduledVisit_pkey" PRIMARY KEY ("id")
);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "SiteUser_userId_siteId_key" ON "SiteUser"("userId", "siteId");
CREATE UNIQUE INDEX "ChemicalOrgConfig_chemicalMasterId_organizationId_containerType_key" ON "ChemicalOrgConfig"("chemicalMasterId", "organizationId", "containerType");
CREATE UNIQUE INDEX "ChemicalSiteConfig_chemicalOrgConfigId_siteId_key" ON "ChemicalSiteConfig"("chemicalOrgConfigId", "siteId");
CREATE UNIQUE INDEX "ChemicalSiteApplication_chemicalSiteConfigId_tankId_key" ON "ChemicalSiteApplication"("chemicalSiteConfigId", "tankId");
CREATE INDEX "VisitLog_siteId_visitDate_idx" ON "VisitLog"("siteId", "visitDate");
CREATE UNIQUE INDEX "CarCountLog_siteId_logDate_key" ON "CarCountLog"("siteId", "logDate");
CREATE UNIQUE INDEX "ScheduledVisit_siteId_scheduledDate_key" ON "ScheduledVisit"("siteId", "scheduledDate");

-- ===========================================
-- FOREIGN KEYS
-- ===========================================

ALTER TABLE "Organization" ADD CONSTRAINT "Organization_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "Distributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Site" ADD CONSTRAINT "Site_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "Distributor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SiteUser" ADD CONSTRAINT "SiteUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SiteUser" ADD CONSTRAINT "SiteUser_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChemicalMaster" ADD CONSTRAINT "ChemicalMaster_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "Distributor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChemicalOrgConfig" ADD CONSTRAINT "ChemicalOrgConfig_chemicalMasterId_fkey" FOREIGN KEY ("chemicalMasterId") REFERENCES "ChemicalMaster"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChemicalOrgConfig" ADD CONSTRAINT "ChemicalOrgConfig_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChemicalSiteConfig" ADD CONSTRAINT "ChemicalSiteConfig_chemicalOrgConfigId_fkey" FOREIGN KEY ("chemicalOrgConfigId") REFERENCES "ChemicalOrgConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChemicalSiteConfig" ADD CONSTRAINT "ChemicalSiteConfig_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChemicalSiteApplication" ADD CONSTRAINT "ChemicalSiteApplication_chemicalSiteConfigId_fkey" FOREIGN KEY ("chemicalSiteConfigId") REFERENCES "ChemicalSiteConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChemicalSiteApplication" ADD CONSTRAINT "ChemicalSiteApplication_injectorTypeId_fkey" FOREIGN KEY ("injectorTypeId") REFERENCES "InjectorType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ChemicalSiteApplication" ADD CONSTRAINT "ChemicalSiteApplication_tipTypeId_fkey" FOREIGN KEY ("tipTypeId") REFERENCES "TipType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WashPackageTemplate" ADD CONSTRAINT "WashPackageTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WashPackageTemplateChemical" ADD CONSTRAINT "WashPackageTemplateChemical_washPackageTemplateId_fkey" FOREIGN KEY ("washPackageTemplateId") REFERENCES "WashPackageTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WashPackageTemplateChemical" ADD CONSTRAINT "WashPackageTemplateChemical_chemicalOrgConfigId_fkey" FOREIGN KEY ("chemicalOrgConfigId") REFERENCES "ChemicalOrgConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WashPackage" ADD CONSTRAINT "WashPackage_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WashPackage" ADD CONSTRAINT "WashPackage_washPackageTemplateId_fkey" FOREIGN KEY ("washPackageTemplateId") REFERENCES "WashPackageTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WashPackageChemical" ADD CONSTRAINT "WashPackageChemical_washPackageId_fkey" FOREIGN KEY ("washPackageId") REFERENCES "WashPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WashPackageChemical" ADD CONSTRAINT "WashPackageChemical_chemicalSiteApplicationId_fkey" FOREIGN KEY ("chemicalSiteApplicationId") REFERENCES "ChemicalSiteApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VisitLog" ADD CONSTRAINT "VisitLog_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VisitLog" ADD CONSTRAINT "VisitLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VisitLogChemicalEntry" ADD CONSTRAINT "VisitLogChemicalEntry_visitLogId_fkey" FOREIGN KEY ("visitLogId") REFERENCES "VisitLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VisitLogChemicalEntry" ADD CONSTRAINT "VisitLogChemicalEntry_chemicalSiteConfigId_fkey" FOREIGN KEY ("chemicalSiteConfigId") REFERENCES "ChemicalSiteConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VisitLogServiceEntry" ADD CONSTRAINT "VisitLogServiceEntry_visitLogId_fkey" FOREIGN KEY ("visitLogId") REFERENCES "VisitLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VisitLogServiceEntry" ADD CONSTRAINT "VisitLogServiceEntry_chemicalSiteApplicationId_fkey" FOREIGN KEY ("chemicalSiteApplicationId") REFERENCES "ChemicalSiteApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VisitLogServiceEntry" ADD CONSTRAINT "VisitLogServiceEntry_newInjectorTypeId_fkey" FOREIGN KEY ("newInjectorTypeId") REFERENCES "InjectorType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VisitLogServiceEntry" ADD CONSTRAINT "VisitLogServiceEntry_newTipTypeId_fkey" FOREIGN KEY ("newTipTypeId") REFERENCES "TipType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CarCountLog" ADD CONSTRAINT "CarCountLog_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CarCountByPackage" ADD CONSTRAINT "CarCountByPackage_carCountLogId_fkey" FOREIGN KEY ("carCountLogId") REFERENCES "CarCountLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CarCountByPackage" ADD CONSTRAINT "CarCountByPackage_washPackageId_fkey" FOREIGN KEY ("washPackageId") REFERENCES "WashPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScheduledVisit" ADD CONSTRAINT "ScheduledVisit_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScheduledVisit" ADD CONSTRAINT "ScheduledVisit_visitLogId_fkey" FOREIGN KEY ("visitLogId") REFERENCES "VisitLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
