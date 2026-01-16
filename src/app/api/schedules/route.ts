// ===========================================
// FILE: src/app/api/schedules/route.ts
// PURPOSE: API endpoints for scheduled visits list/create
// PRD REFERENCE: PRD Section 8 - Visit Scheduling
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createScheduledVisitSchema, scheduleQuerySchema, bulkScheduleSchema, recurringScheduleSchema } from '@/lib/validations';
import { z } from 'zod';

/**
 * GET /api/schedules
 *
 * Fetch scheduled visits with filtering and pagination
 *
 * WHY: Users need to view upcoming visits for sites they manage.
 * Supports filtering by site, organization, status, and date range.
 *
 * QUERY PARAMS:
 * - siteId: Filter by specific site
 * - organizationId: Filter by organization (for org admins)
 * - status: Filter by status (SCHEDULED, COMPLETED, CANCELLED)
 * - startDate: Filter visits on or after this date
 * - endDate: Filter visits on or before this date
 * - limit: Number of records (default 50, max 100)
 * - offset: Pagination offset
 *
 * RETURNS: Array of ScheduledVisit records
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
      status: searchParams.get('status') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      limit: searchParams.get('limit') || '50',
      offset: searchParams.get('offset') || '0',
    };

    const validatedQuery = scheduleQuerySchema.parse(queryParams);

    /**
     * Build where clause based on role and filters
     * WHY: Users can only see schedules for sites they have access to
     */
    const whereClause: any = {};

    // Site filter
    if (validatedQuery.siteId) {
      whereClause.siteId = validatedQuery.siteId;
    }

    // Status filter
    if (validatedQuery.status) {
      whereClause.status = validatedQuery.status;
    }

    // Date filters
    if (validatedQuery.startDate || validatedQuery.endDate) {
      whereClause.scheduledDate = {};
      if (validatedQuery.startDate) {
        whereClause.scheduledDate.gte = new Date(validatedQuery.startDate);
      }
      if (validatedQuery.endDate) {
        whereClause.scheduledDate.lte = new Date(validatedQuery.endDate);
      }
    }

    /**
     * Role-based filtering
     * WHY: Restrict access based on user's role and assignments
     */
    if (session.user.role === 'DISTRIBUTOR_ADMIN' || session.user.role === 'DISTRIBUTOR_USER') {
      // Distributors see schedules for their client organizations' sites
      whereClause.site = {
        organization: {
          distributorId: session.user.distributorId,
        },
      };

      if (validatedQuery.organizationId) {
        whereClause.site.organizationId = validatedQuery.organizationId;
      }
    } else if (session.user.role === 'ORG_ADMIN') {
      // Org admins see all schedules for their org's sites
      whereClause.site = {
        organizationId: session.user.organizationId,
      };
    } else if (session.user.role === 'SITE_MANAGER' || session.user.role === 'SITE_USER') {
      // Site users see schedules for sites they have access to
      const siteAccess = await prisma.userSiteAccess.findMany({
        where: { userId: session.user.id },
        select: { siteId: true },
      });
      const accessibleSiteIds = siteAccess.map((sa) => sa.siteId);

      if (validatedQuery.siteId && !accessibleSiteIds.includes(validatedQuery.siteId)) {
        return NextResponse.json(
          { error: 'Forbidden: No access to this site' },
          { status: 403 }
        );
      }

      whereClause.siteId = { in: accessibleSiteIds };
    }

    // Fetch schedules with counts
    const [schedules, total] = await Promise.all([
      prisma.scheduledVisit.findMany({
        where: whereClause,
        include: {
          site: {
            select: {
              id: true,
              name: true,
              visitReminderDays: true,
              organization: {
                select: { id: true, name: true },
              },
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          completedVisitLog: {
            select: {
              id: true,
              visitDate: true,
            },
          },
        },
        orderBy: [{ scheduledDate: 'asc' }, { createdAt: 'desc' }],
        take: validatedQuery.limit,
        skip: validatedQuery.offset,
      }),
      prisma.scheduledVisit.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      schedules,
      pagination: {
        total,
        limit: validatedQuery.limit,
        offset: validatedQuery.offset,
        hasMore: validatedQuery.offset + validatedQuery.limit < total,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/schedules
 *
 * Create a new scheduled visit (single, bulk, or recurring)
 *
 * WHY: Schedule site visits for future dates.
 * Supports single, bulk, and recurring schedules.
 *
 * BODY: CreateScheduledVisitInput | BulkScheduleInput | RecurringScheduleInput
 * RETURNS: Created ScheduledVisit record(s)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Check for bulk/recurring schedules
    if (body.dates) {
      return createBulkSchedules(session, body);
    }
    if (body.intervalDays) {
      return createRecurringSchedules(session, body);
    }

    // Single schedule
    return createSingleSchedule(session, body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Create a single scheduled visit
 */
async function createSingleSchedule(session: any, body: any) {
  const validatedData = createScheduledVisitSchema.parse(body);

  // Verify user has access to this site
  const hasAccess = await verifyScheduleAccess(session, validatedData.siteId);
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Forbidden: No access to schedule visits for this site' },
      { status: 403 }
    );
  }

  // Create scheduled visit
  const schedule = await prisma.scheduledVisit.create({
    data: {
      siteId: validatedData.siteId,
      userId: session.user.id,
      scheduledDate: new Date(validatedData.scheduledDate),
      notes: validatedData.notes,
      status: 'SCHEDULED',
    },
    include: {
      site: {
        select: { id: true, name: true },
      },
      user: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  return NextResponse.json(schedule, { status: 201 });
}

/**
 * Create bulk scheduled visits
 */
async function createBulkSchedules(session: any, body: any) {
  const validatedData = bulkScheduleSchema.parse(body);

  // Verify user has access to this site
  const hasAccess = await verifyScheduleAccess(session, validatedData.siteId);
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Forbidden: No access to schedule visits for this site' },
      { status: 403 }
    );
  }

  // Create all schedules in a transaction
  const schedules = await prisma.$transaction(
    validatedData.dates.map((date) =>
      prisma.scheduledVisit.create({
        data: {
          siteId: validatedData.siteId,
          userId: session.user.id,
          scheduledDate: new Date(date),
          notes: validatedData.notes,
          status: 'SCHEDULED',
        },
        include: {
          site: {
            select: { id: true, name: true },
          },
        },
      })
    )
  );

  return NextResponse.json(
    { schedules, count: schedules.length },
    { status: 201 }
  );
}

/**
 * Create recurring scheduled visits
 */
async function createRecurringSchedules(session: any, body: any) {
  const validatedData = recurringScheduleSchema.parse(body);

  // Verify user has access to this site
  const hasAccess = await verifyScheduleAccess(session, validatedData.siteId);
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Forbidden: No access to schedule visits for this site' },
      { status: 403 }
    );
  }

  // Generate dates based on interval
  const dates: Date[] = [];
  let currentDate = new Date(validatedData.startDate);
  const endDate = new Date(validatedData.endDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + validatedData.intervalDays);
  }

  if (dates.length === 0) {
    return NextResponse.json(
      { error: 'No dates generated for the specified range' },
      { status: 400 }
    );
  }

  // Create all schedules in a transaction
  const schedules = await prisma.$transaction(
    dates.map((date) =>
      prisma.scheduledVisit.create({
        data: {
          siteId: validatedData.siteId,
          userId: session.user.id,
          scheduledDate: date,
          notes: validatedData.notes,
          status: 'SCHEDULED',
        },
        include: {
          site: {
            select: { id: true, name: true },
          },
        },
      })
    )
  );

  return NextResponse.json(
    { schedules, count: schedules.length },
    { status: 201 }
  );
}

/**
 * Verify user has permission to schedule visits for a site
 */
async function verifyScheduleAccess(session: any, siteId: string): Promise<boolean> {
  // Fetch site with organization
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

  // Check based on role
  if (session.user.role === 'DISTRIBUTOR_ADMIN' || session.user.role === 'DISTRIBUTOR_USER') {
    return site.organization.distributorId === session.user.distributorId;
  }

  if (session.user.role === 'ORG_ADMIN') {
    return site.organizationId === session.user.organizationId;
  }

  if (session.user.role === 'SITE_MANAGER' || session.user.role === 'SITE_USER') {
    const siteAccess = await prisma.userSiteAccess.findFirst({
      where: {
        userId: session.user.id,
        siteId,
      },
    });
    return !!siteAccess;
  }

  return false;
}
