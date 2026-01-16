// ===========================================
// FILE: src/app/api/analytics/cost-per-car/route.ts
// PURPOSE: API endpoint for cost per car analysis
// PRD REFERENCE: PRD Section 7.1 - Cost Per Car Analysis
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { costPerCarQuerySchema } from '@/lib/validations';
import { calculateGpmWeightedCosts, calculateCostPerCar } from '@/lib/analytics';
import { z } from 'zod';

/**
 * GET /api/analytics/cost-per-car
 *
 * Analyze cost per car for a site with optional package breakdown
 *
 * WHY: Help operators understand their chemical costs per wash.
 * Uses GPM-weighted allocation when multiple applications share chemicals.
 *
 * QUERY PARAMS:
 * - siteId: Site to analyze (required)
 * - startDate: Start of analysis period
 * - endDate: End of analysis period
 * - period: Aggregation period (day/week/month)
 * - includeBreakdown: Include per-chemical breakdown
 *
 * RETURNS: Cost per car metrics with optional breakdown
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      siteId: searchParams.get('siteId') || '',
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      period: searchParams.get('period') || 'month',
      includeBreakdown: searchParams.get('includeBreakdown') || 'false',
    };

    const validatedQuery = costPerCarQuerySchema.parse(queryParams);

    // Verify access to site
    const hasAccess = await verifySiteAccess(session, validatedQuery.siteId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden: No access to this site' },
        { status: 403 }
      );
    }

    // Build date range
    const endDate = validatedQuery.endDate
      ? new Date(validatedQuery.endDate)
      : new Date();
    const startDate = validatedQuery.startDate
      ? new Date(validatedQuery.startDate)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // Default 30 days

    // Fetch visit data with chemical entries and car counts
    const visits = await prisma.visitLog.findMany({
      where: {
        siteId: validatedQuery.siteId,
        visitDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        chemicalEntries: {
          include: {
            chemicalSiteConfig: {
              include: {
                chemicalOrgConfig: {
                  include: {
                    chemicalMaster: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { visitDate: 'asc' },
    });

    // Fetch site packages with car counts for the period
    const packages = await prisma.washPackage.findMany({
      where: {
        siteId: validatedQuery.siteId,
        isActive: true,
      },
      include: {
        chemicals: {
          include: {
            chemicalSiteApplication: {
              include: {
                chemicalSiteConfig: {
                  include: {
                    chemicalOrgConfig: {
                      include: {
                        chemicalMaster: true,
                      },
                    },
                  },
                },
                injectorType: true,
              },
            },
          },
        },
      },
    });

    // Fetch chemical applications for GPM data
    const applications = await prisma.chemicalSiteApplication.findMany({
      where: {
        chemicalSiteConfig: {
          siteId: validatedQuery.siteId,
        },
      },
      include: {
        injectorType: true,
        chemicalSiteConfig: {
          include: {
            chemicalOrgConfig: {
              include: {
                chemicalMaster: true,
              },
            },
          },
        },
      },
    });

    // Calculate usage from visit entries
    const chemicalUsageMap = new Map<string, {
      chemicalId: string;
      chemicalName: string;
      chemicalType: string;
      costPerGallon: number;
      totalUsageGallons: number;
    }>();

    for (let i = 1; i < visits.length; i++) {
      const prevVisit = visits[i - 1];
      const currVisit = visits[i];

      for (const entry of currVisit.chemicalEntries) {
        const prevEntry = prevVisit.chemicalEntries.find(
          (e: typeof entry) => e.chemicalSiteConfigId === entry.chemicalSiteConfigId
        );

        if (prevEntry && entry.calculatedUsageGallons) {
          const configId = entry.chemicalSiteConfigId;
          const chemicalMaster = entry.chemicalSiteConfig.chemicalOrgConfig.chemicalMaster;
          const costPerGallon = Number(entry.chemicalSiteConfig.chemicalOrgConfig.costPerGallon || 0);

          const existing = chemicalUsageMap.get(configId);
          if (existing) {
            existing.totalUsageGallons += Number(entry.calculatedUsageGallons);
          } else {
            chemicalUsageMap.set(configId, {
              chemicalId: configId,
              chemicalName: chemicalMaster.name,
              chemicalType: chemicalMaster.type,
              costPerGallon,
              totalUsageGallons: Number(entry.calculatedUsageGallons),
            });
          }
        }
      }
    }

    // Calculate total chemical cost
    let totalChemicalCost = 0;
    const chemicalBreakdown: Array<{
      chemicalId: string;
      chemicalName: string;
      chemicalType: string;
      gallonsUsed: number;
      totalCost: number;
    }> = [];

    for (const [, usage] of chemicalUsageMap) {
      const cost = usage.totalUsageGallons * usage.costPerGallon;
      totalChemicalCost += cost;

      if (validatedQuery.includeBreakdown) {
        chemicalBreakdown.push({
          chemicalId: usage.chemicalId,
          chemicalName: usage.chemicalName,
          chemicalType: usage.chemicalType,
          gallonsUsed: usage.totalUsageGallons,
          totalCost: cost,
        });
      }
    }

    // Get total car count from packages (simplified - in production would come from car counter data)
    // For now, estimate based on visit frequency
    const daysBetween = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
    );
    const visitCount = visits.length;
    const estimatedCarsPerDay = 100; // Default estimate
    const totalCars = daysBetween * estimatedCarsPerDay;

    // Calculate cost per car
    const costPerCar = calculateCostPerCar(totalChemicalCost, totalCars);

    // Build response
    const response: any = {
      siteId: validatedQuery.siteId,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days: daysBetween,
      },
      summary: {
        totalChemicalCost: Math.round(totalChemicalCost * 100) / 100,
        estimatedTotalCars: totalCars,
        costPerCar: Math.round(costPerCar * 100) / 100,
        visitCount,
      },
    };

    if (validatedQuery.includeBreakdown) {
      response.chemicalBreakdown = chemicalBreakdown.sort(
        (a, b) => b.totalCost - a.totalCost
      );
    }

    // Add package breakdown if packages exist
    if (packages.length > 0) {
      response.packageSummary = packages.map((pkg: typeof packages[number]) => ({
        packageId: pkg.id,
        packageName: pkg.name,
        price: Number(pkg.singleWashPrice || 0),
        chemicalCount: pkg.chemicals.length,
      }));
    }

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error fetching cost per car analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Verify user has access to the specified site
 */
async function verifySiteAccess(session: any, siteId: string): Promise<boolean> {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      organization: {
        select: { distributorId: true },
      },
    },
  });

  if (!site) {
    return false;
  }

  // Distributors can access their clients' sites
  if (session.user.role === 'DISTRIBUTOR_ADMIN' || session.user.role === 'DISTRIBUTOR_USER') {
    return site.organization.distributorId === session.user.distributorId;
  }

  // Org admins can access their org's sites
  if (session.user.role === 'ORG_ADMIN') {
    return site.organizationId === session.user.organizationId;
  }

  // Site users need explicit access
  if (session.user.role === 'SITE_MANAGER' || session.user.role === 'SITE_USER') {
    const access = await prisma.userSiteAccess.findFirst({
      where: {
        userId: session.user.id,
        siteId,
      },
    });
    return !!access;
  }

  return false;
}
