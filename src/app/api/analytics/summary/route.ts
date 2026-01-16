// ===========================================
// FILE: src/app/api/analytics/summary/route.ts
// PURPOSE: API endpoint for dashboard summary metrics
// PRD REFERENCE: PRD Section 7.3 - Dashboard Summary
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { summaryQuerySchema } from '@/lib/validations';
import { calculatePercentageChange } from '@/lib/analytics';
import { z } from 'zod';

/**
 * GET /api/analytics/summary
 *
 * Get dashboard summary metrics for quick overview
 *
 * WHY: Provide at-a-glance metrics for the dashboard.
 * Shows key indicators with period-over-period comparison.
 *
 * QUERY PARAMS:
 * - siteId: Specific site (optional)
 * - organizationId: Filter by organization (for distributor view)
 * - period: Time period (7, 30, or 90 days)
 *
 * RETURNS: Summary metrics with trend indicators
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
      siteId: searchParams.get('siteId') || undefined,
      organizationId: searchParams.get('organizationId') || undefined,
      period: searchParams.get('period') || '30',
    };

    const validatedQuery = summaryQuerySchema.parse(queryParams);

    // Build site filter based on role and query
    const siteFilter = await buildSiteFilter(session, validatedQuery);
    if (siteFilter === null) {
      return NextResponse.json(
        { error: 'Forbidden: No access to requested data' },
        { status: 403 }
      );
    }

    // Calculate date ranges
    const periodDays = parseInt(validatedQuery.period);
    const now = new Date();
    const currentStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const previousStart = new Date(currentStart.getTime() - periodDays * 24 * 60 * 60 * 1000);

    // Fetch current period visits
    const currentVisits = await prisma.visitLog.findMany({
      where: {
        ...siteFilter,
        visitDate: {
          gte: currentStart,
          lte: now,
        },
      },
      include: {
        chemicalEntries: {
          include: {
            chemicalSiteConfig: {
              include: {
                chemicalOrgConfig: true,
              },
            },
          },
        },
        site: {
          select: { id: true, name: true },
        },
      },
    });

    // Fetch previous period visits for comparison
    const previousVisits = await prisma.visitLog.findMany({
      where: {
        ...siteFilter,
        visitDate: {
          gte: previousStart,
          lt: currentStart,
        },
      },
      include: {
        chemicalEntries: {
          include: {
            chemicalSiteConfig: {
              include: {
                chemicalOrgConfig: true,
              },
            },
          },
        },
      },
    });

    // Calculate current period metrics
    const currentMetrics = calculatePeriodMetrics(currentVisits);
    const previousMetrics = calculatePeriodMetrics(previousVisits);

    // Fetch sites count
    const sitesCount = await prisma.site.count({
      where: siteFilter,
    });

    // Fetch active chemicals count
    const chemicalsCount = await prisma.chemicalSiteConfig.count({
      where: {
        site: siteFilter,
        isActive: true,
      },
    });

    // Find low inventory chemicals
    const latestEntries = await getLatestChemicalEntries(siteFilter);
    const lowInventoryCount = latestEntries.filter((entry) => {
      const dailyUsage = entry.avgDailyUsage;
      if (dailyUsage <= 0) return false;
      const daysRemaining = entry.totalOnHand / dailyUsage;
      return daysRemaining <= 7;
    }).length;

    // Calculate percentage changes
    const visitChange = calculatePercentageChange(
      previousMetrics.visitCount,
      currentMetrics.visitCount
    );
    const costChange = calculatePercentageChange(
      previousMetrics.totalCost,
      currentMetrics.totalCost
    );
    const usageChange = calculatePercentageChange(
      previousMetrics.totalUsage,
      currentMetrics.totalUsage
    );

    return NextResponse.json({
      period: {
        days: periodDays,
        currentStart: currentStart.toISOString(),
        currentEnd: now.toISOString(),
        previousStart: previousStart.toISOString(),
        previousEnd: currentStart.toISOString(),
      },
      metrics: {
        sites: {
          count: sitesCount,
        },
        chemicals: {
          activeCount: chemicalsCount,
          lowInventoryCount,
        },
        visits: {
          current: currentMetrics.visitCount,
          previous: previousMetrics.visitCount,
          change: Math.round(visitChange * 10) / 10,
          trend: visitChange >= 0 ? 'up' : 'down',
        },
        cost: {
          current: Math.round(currentMetrics.totalCost * 100) / 100,
          previous: Math.round(previousMetrics.totalCost * 100) / 100,
          change: Math.round(costChange * 10) / 10,
          trend: costChange >= 0 ? 'up' : 'down',
        },
        usage: {
          currentGallons: Math.round(currentMetrics.totalUsage * 100) / 100,
          previousGallons: Math.round(previousMetrics.totalUsage * 100) / 100,
          change: Math.round(usageChange * 10) / 10,
          trend: usageChange >= 0 ? 'up' : 'down',
        },
      },
      recentActivity: currentVisits.slice(0, 5).map((visit: typeof currentVisits[number]) => ({
        id: visit.id,
        date: visit.visitDate,
        siteName: visit.site.name,
        chemicalEntryCount: visit.chemicalEntries.length,
      })),
      lowInventoryAlerts: latestEntries
        .filter((entry) => {
          const dailyUsage = entry.avgDailyUsage;
          if (dailyUsage <= 0) return false;
          const daysRemaining = entry.totalOnHand / dailyUsage;
          return daysRemaining <= 7;
        })
        .slice(0, 5)
        .map((entry) => ({
          siteId: entry.siteId,
          siteName: entry.siteName,
          chemicalName: entry.chemicalName,
          currentOnHand: Math.round(entry.totalOnHand * 100) / 100,
          daysRemaining: Math.floor(entry.totalOnHand / entry.avgDailyUsage),
        })),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error fetching analytics summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Build site filter based on user role and query parameters
 */
async function buildSiteFilter(
  session: any,
  query: { siteId?: string; organizationId?: string }
): Promise<any | null> {
  // If specific site requested, verify access
  if (query.siteId) {
    const site = await prisma.site.findUnique({
      where: { id: query.siteId },
      include: {
        organization: {
          select: { distributorId: true },
        },
      },
    });

    if (!site) return null;

    // Verify access based on role
    if (session.user.role === 'DISTRIBUTOR_ADMIN' || session.user.role === 'DISTRIBUTOR_USER') {
      if (site.organization.distributorId !== session.user.distributorId) {
        return null;
      }
    } else if (session.user.role === 'ORG_ADMIN') {
      if (site.organizationId !== session.user.organizationId) {
        return null;
      }
    } else if (session.user.role === 'SITE_MANAGER' || session.user.role === 'SITE_USER') {
      const access = await prisma.userSiteAccess.findFirst({
        where: {
          userId: session.user.id,
          siteId: query.siteId,
        },
      });
      if (!access) return null;
    }

    return { siteId: query.siteId };
  }

  // Build filter based on role
  if (session.user.role === 'DISTRIBUTOR_ADMIN' || session.user.role === 'DISTRIBUTOR_USER') {
    const filter: any = {
      site: {
        organization: {
          distributorId: session.user.distributorId,
        },
      },
    };

    if (query.organizationId) {
      filter.site.organizationId = query.organizationId;
    }

    return filter;
  }

  if (session.user.role === 'ORG_ADMIN') {
    return {
      site: {
        organizationId: session.user.organizationId,
      },
    };
  }

  if (session.user.role === 'SITE_MANAGER' || session.user.role === 'SITE_USER') {
    const siteAccess = await prisma.userSiteAccess.findMany({
      where: { userId: session.user.id },
      select: { siteId: true },
    });
    const siteIds = siteAccess.map((sa: { siteId: string }) => sa.siteId);

    return {
      siteId: { in: siteIds },
    };
  }

  return null;
}

/**
 * Calculate metrics for a period's visits
 */
function calculatePeriodMetrics(visits: any[]): {
  visitCount: number;
  totalCost: number;
  totalUsage: number;
} {
  let totalCost = 0;
  let totalUsage = 0;

  for (const visit of visits) {
    for (const entry of visit.chemicalEntries) {
      const usage = Number(entry.calculatedUsageGallons || 0);
      const costPerGallon = Number(entry.chemicalSiteConfig.chemicalOrgConfig.costPerGallon || 0);

      totalUsage += usage;
      totalCost += usage * costPerGallon;
    }
  }

  return {
    visitCount: visits.length,
    totalCost,
    totalUsage,
  };
}

/**
 * Get latest chemical entries with average daily usage
 */
async function getLatestChemicalEntries(siteFilter: any): Promise<Array<{
  siteId: string;
  siteName: string;
  chemicalName: string;
  totalOnHand: number;
  avgDailyUsage: number;
}>> {
  // Get distinct site/chemical combinations with latest entry
  const latestEntries = await prisma.visitLogChemicalEntry.findMany({
    where: {
      visitLog: siteFilter,
    },
    orderBy: {
      visitLog: {
        visitDate: 'desc',
      },
    },
    distinct: ['chemicalSiteConfigId'],
    include: {
      visitLog: {
        select: {
          visitDate: true,
          site: {
            select: { id: true, name: true },
          },
        },
      },
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

  // Calculate average daily usage for each
  const results: Array<{
    siteId: string;
    siteName: string;
    chemicalName: string;
    totalOnHand: number;
    avgDailyUsage: number;
  }> = [];

  for (const entry of latestEntries) {
    // Get last 30 days of entries for this chemical
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const recentEntries = await prisma.visitLogChemicalEntry.findMany({
      where: {
        chemicalSiteConfigId: entry.chemicalSiteConfigId,
        visitLog: {
          visitDate: {
            gte: thirtyDaysAgo,
          },
        },
      },
      select: {
        calculatedUsageGallons: true,
        visitLog: {
          select: { visitDate: true },
        },
      },
    });

    const totalUsage = recentEntries.reduce(
      (sum: number, e: typeof recentEntries[number]) => sum + Number(e.calculatedUsageGallons || 0),
      0
    );
    const avgDailyUsage = totalUsage / 30;

    results.push({
      siteId: entry.visitLog.site.id,
      siteName: entry.visitLog.site.name,
      chemicalName: entry.chemicalSiteConfig.chemicalOrgConfig.chemicalMaster.name,
      totalOnHand: Number(entry.totalOnHandGallons),
      avgDailyUsage,
    });
  }

  return results;
}
