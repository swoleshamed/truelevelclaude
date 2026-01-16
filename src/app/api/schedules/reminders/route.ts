// ===========================================
// FILE: src/app/api/schedules/reminders/route.ts
// PURPOSE: API endpoint for visit reminders and overdue alerts
// PRD REFERENCE: PRD Section 8.3 - Visit Reminders
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { reminderQuerySchema } from '@/lib/validations';
import { z } from 'zod';

/**
 * GET /api/schedules/reminders
 *
 * Get sites needing visits based on reminder days configuration
 *
 * WHY: Provide proactive alerts for sites that need visits.
 * Uses each site's visitReminderDays setting to determine when
 * to show reminders.
 *
 * QUERY PARAMS:
 * - daysAhead: How many days ahead to look (default 7)
 * - includeOverdue: Include sites past due for visits (default true)
 *
 * RETURNS: Sites grouped by urgency (overdue, due soon, upcoming)
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
      daysAhead: searchParams.get('daysAhead') || '7',
      includeOverdue: searchParams.get('includeOverdue') || 'true',
    };

    const validatedQuery = reminderQuerySchema.parse(queryParams);

    // Build site filter based on role
    const siteFilter = await buildSiteFilter(session);
    if (!siteFilter) {
      return NextResponse.json(
        { error: 'Forbidden: No access to sites' },
        { status: 403 }
      );
    }

    // Get all sites with their last visit date and reminder settings
    const sites = await prisma.site.findMany({
      where: {
        ...siteFilter,
        isActive: true,
      },
      include: {
        organization: {
          select: { id: true, name: true },
        },
        visitLogs: {
          orderBy: { visitDate: 'desc' },
          take: 1,
          select: {
            id: true,
            visitDate: true,
          },
        },
        scheduledVisits: {
          where: {
            status: 'SCHEDULED',
          },
          orderBy: { scheduledDate: 'asc' },
          take: 1,
          select: {
            id: true,
            scheduledDate: true,
          },
        },
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue: any[] = [];
    const dueSoon: any[] = [];
    const upcoming: any[] = [];
    const scheduled: any[] = [];

    for (const site of sites) {
      const lastVisit = site.visitLogs[0];
      const nextScheduled = site.scheduledVisits[0];
      const reminderDays = site.visitReminderDays;

      // Calculate days since last visit
      let daysSinceLastVisit: number | null = null;
      if (lastVisit) {
        const lastVisitDate = new Date(lastVisit.visitDate);
        lastVisitDate.setHours(0, 0, 0, 0);
        daysSinceLastVisit = Math.floor(
          (today.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      // Calculate next due date based on reminder days
      let nextDueDate: Date | null = null;
      if (lastVisit) {
        nextDueDate = new Date(lastVisit.visitDate);
        nextDueDate.setDate(nextDueDate.getDate() + reminderDays);
        nextDueDate.setHours(0, 0, 0, 0);
      }

      const siteInfo = {
        id: site.id,
        name: site.name,
        organizationName: site.organization.name,
        address: site.address,
        reminderDays,
        lastVisitDate: lastVisit?.visitDate || null,
        lastVisitId: lastVisit?.id || null,
        daysSinceLastVisit,
        nextDueDate: nextDueDate?.toISOString() || null,
        nextScheduledDate: nextScheduled?.scheduledDate || null,
        nextScheduledId: nextScheduled?.id || null,
      };

      // If site has an upcoming scheduled visit, add to scheduled
      if (nextScheduled) {
        const scheduledDate = new Date(nextScheduled.scheduledDate);
        scheduledDate.setHours(0, 0, 0, 0);
        const daysUntilScheduled = Math.floor(
          (scheduledDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilScheduled <= validatedQuery.daysAhead) {
          scheduled.push({
            ...siteInfo,
            daysUntilScheduled,
            urgency: daysUntilScheduled < 0 ? 'overdue' : daysUntilScheduled <= 2 ? 'soon' : 'upcoming',
          });
        }
        continue;
      }

      // Site has no scheduled visit, check based on last visit
      if (!lastVisit) {
        // Never visited - add to overdue
        if (validatedQuery.includeOverdue) {
          overdue.push({
            ...siteInfo,
            reason: 'never_visited',
          });
        }
        continue;
      }

      // Check if overdue
      if (nextDueDate && today > nextDueDate) {
        const daysOverdue = Math.floor(
          (today.getTime() - nextDueDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (validatedQuery.includeOverdue) {
          overdue.push({
            ...siteInfo,
            daysOverdue,
            reason: 'past_due',
          });
        }
      } else if (nextDueDate) {
        // Calculate days until due
        const daysUntilDue = Math.floor(
          (nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilDue <= 2) {
          dueSoon.push({
            ...siteInfo,
            daysUntilDue,
          });
        } else if (daysUntilDue <= validatedQuery.daysAhead) {
          upcoming.push({
            ...siteInfo,
            daysUntilDue,
          });
        }
      }
    }

    // Sort by urgency
    overdue.sort((a, b) => (b.daysOverdue || 999) - (a.daysOverdue || 999));
    dueSoon.sort((a, b) => (a.daysUntilDue || 0) - (b.daysUntilDue || 0));
    upcoming.sort((a, b) => (a.daysUntilDue || 0) - (b.daysUntilDue || 0));
    scheduled.sort((a, b) => (a.daysUntilScheduled || 0) - (b.daysUntilScheduled || 0));

    return NextResponse.json({
      summary: {
        overdueCount: overdue.length,
        dueSoonCount: dueSoon.length,
        upcomingCount: upcoming.length,
        scheduledCount: scheduled.length,
        totalSites: sites.length,
      },
      overdue,
      dueSoon,
      upcoming,
      scheduled,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Build site filter based on user role
 */
async function buildSiteFilter(session: any): Promise<any | null> {
  if (session.user.role === 'DISTRIBUTOR_ADMIN' || session.user.role === 'DISTRIBUTOR_USER') {
    return {
      organization: {
        distributorId: session.user.distributorId,
      },
    };
  }

  if (session.user.role === 'ORG_ADMIN') {
    return {
      organizationId: session.user.organizationId,
    };
  }

  if (session.user.role === 'SITE_MANAGER' || session.user.role === 'SITE_USER') {
    const siteAccess = await prisma.userSiteAccess.findMany({
      where: { userId: session.user.id },
      select: { siteId: true },
    });
    const siteIds = siteAccess.map((sa) => sa.siteId);

    return {
      id: { in: siteIds },
    };
  }

  return null;
}
