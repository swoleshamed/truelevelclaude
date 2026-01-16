// ===========================================
// FILE: src/app/api/analytics/usage/route.ts
// PURPOSE: API endpoint for chemical usage trends
// PRD REFERENCE: PRD Section 7.2 - Usage Trends
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { usageQuerySchema } from '@/lib/validations';
import { aggregateUsageByPeriod, calculateDailyUsage, calculateDaysUntilEmpty } from '@/lib/analytics';
import { z } from 'zod';

/**
 * GET /api/analytics/usage
 *
 * Get chemical usage trends over time
 *
 * WHY: Track usage patterns to identify trends, anomalies, and forecast needs.
 *
 * QUERY PARAMS:
 * - siteId: Site to analyze (required)
 * - chemicalId: Specific chemical to analyze (optional)
 * - startDate: Start of analysis period
 * - endDate: End of analysis period
 * - period: Aggregation period (day/week/month)
 *
 * RETURNS: Usage trend data aggregated by period
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
      chemicalId: searchParams.get('chemicalId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      period: searchParams.get('period') || 'week',
    };

    const validatedQuery = usageQuerySchema.parse(queryParams);

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
      : new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000); // Default 90 days

    // Build chemical filter
    const chemicalFilter = validatedQuery.chemicalId
      ? { chemicalSiteConfigId: validatedQuery.chemicalId }
      : {};

    // Fetch visit entries with usage data
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
          where: chemicalFilter,
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

    // Group usage by chemical
    const chemicalUsageData = new Map<string, {
      chemicalId: string;
      chemicalName: string;
      chemicalType: string;
      currentOnHand: number;
      entries: Array<{ date: Date; usage: number }>;
    }>();

    // Process visits to extract usage
    for (const visit of visits) {
      for (const entry of visit.chemicalEntries) {
        const configId = entry.chemicalSiteConfigId;
        const chemicalMaster = entry.chemicalSiteConfig.chemicalOrgConfig.chemicalMaster;

        let chemData = chemicalUsageData.get(configId);
        if (!chemData) {
          chemData = {
            chemicalId: configId,
            chemicalName: chemicalMaster.name,
            chemicalType: chemicalMaster.type,
            currentOnHand: 0,
            entries: [],
          };
          chemicalUsageData.set(configId, chemData);
        }

        // Update current on hand
        chemData.currentOnHand = Number(entry.totalOnHandGallons);

        // Add usage entry if we have calculated usage
        if (entry.calculatedUsageGallons) {
          chemData.entries.push({
            date: visit.visitDate,
            usage: Number(entry.calculatedUsageGallons),
          });
        }
      }
    }

    // Calculate aggregated trends for each chemical
    const chemicals: Array<{
      chemicalId: string;
      chemicalName: string;
      chemicalType: string;
      currentOnHand: number;
      totalUsage: number;
      averageDailyUsage: number;
      daysUntilEmpty: number;
      trend: Array<{
        periodStart: string;
        periodEnd: string;
        totalUsage: number;
      }>;
    }> = [];

    const daysBetween = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
    );

    for (const [, chemData] of chemicalUsageData) {
      // Calculate total usage
      const totalUsage = chemData.entries.reduce((sum, e) => sum + e.usage, 0);

      // Calculate daily average
      const dailyUsage = calculateDailyUsage(totalUsage, daysBetween);

      // Calculate days until empty
      const daysUntilEmpty = calculateDaysUntilEmpty(chemData.currentOnHand, dailyUsage);

      // Aggregate by period
      const aggregated = aggregateUsageByPeriod(
        chemData.entries,
        validatedQuery.period
      );

      chemicals.push({
        chemicalId: chemData.chemicalId,
        chemicalName: chemData.chemicalName,
        chemicalType: chemData.chemicalType,
        currentOnHand: Math.round(chemData.currentOnHand * 100) / 100,
        totalUsage: Math.round(totalUsage * 100) / 100,
        averageDailyUsage: Math.round(dailyUsage * 100) / 100,
        daysUntilEmpty: daysUntilEmpty === Infinity ? -1 : daysUntilEmpty,
        trend: aggregated.map((a) => ({
          periodStart: a.periodStart.toISOString(),
          periodEnd: a.periodEnd.toISOString(),
          totalUsage: Math.round(a.totalUsage * 100) / 100,
        })),
      });
    }

    // Sort by total usage descending
    chemicals.sort((a, b) => b.totalUsage - a.totalUsage);

    // Calculate overall summary
    const totalUsageAll = chemicals.reduce((sum, c) => sum + c.totalUsage, 0);
    const lowInventoryChemicals = chemicals.filter(
      (c) => c.daysUntilEmpty >= 0 && c.daysUntilEmpty <= 7
    );

    return NextResponse.json({
      siteId: validatedQuery.siteId,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days: daysBetween,
        aggregation: validatedQuery.period,
      },
      summary: {
        totalChemicals: chemicals.length,
        totalUsageGallons: Math.round(totalUsageAll * 100) / 100,
        lowInventoryCount: lowInventoryChemicals.length,
        visitCount: visits.length,
      },
      chemicals,
      lowInventoryAlerts: lowInventoryChemicals.map((c) => ({
        chemicalId: c.chemicalId,
        chemicalName: c.chemicalName,
        currentOnHand: c.currentOnHand,
        daysUntilEmpty: c.daysUntilEmpty,
      })),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error fetching usage analytics:', error);
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

  if (session.user.role === 'DISTRIBUTOR_ADMIN' || session.user.role === 'DISTRIBUTOR_USER') {
    return site.organization.distributorId === session.user.distributorId;
  }

  if (session.user.role === 'ORG_ADMIN') {
    return site.organizationId === session.user.organizationId;
  }

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
