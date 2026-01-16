// ===========================================
// FILE: src/app/api/schedules/[id]/complete/route.ts
// PURPOSE: API endpoint to mark scheduled visit as completed
// PRD REFERENCE: PRD Section 8.2 - Visit Completion
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { completeScheduledVisitSchema } from '@/lib/validations';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/schedules/[id]/complete
 *
 * Mark a scheduled visit as completed
 *
 * WHY: Link scheduled visits to actual visit logs when completed.
 * Can either link to an existing visit log or create a new one.
 *
 * BODY: CompleteScheduledVisitInput
 * - visitLogId: Link to existing visit log
 * - createNewVisit: Create a new visit log automatically
 *
 * RETURNS: Updated ScheduledVisit with linked visit log
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch existing schedule
    const existingSchedule = await prisma.scheduledVisit.findUnique({
      where: { id },
      include: {
        site: {
          include: {
            organization: {
              select: { distributorId: true },
            },
          },
        },
      },
    });

    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Scheduled visit not found' },
        { status: 404 }
      );
    }

    // Verify access
    const hasAccess = await verifyScheduleAccess(session, existingSchedule);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden: No access to complete this scheduled visit' },
        { status: 403 }
      );
    }

    // Only allow completion of SCHEDULED visits
    if (existingSchedule.status !== 'SCHEDULED') {
      return NextResponse.json(
        { error: 'This visit has already been completed or cancelled' },
        { status: 400 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const validatedData = completeScheduledVisitSchema.parse(body);

    let visitLogId: string | null = validatedData.visitLogId || null;

    // Create new visit log if requested
    if (validatedData.createNewVisit && !visitLogId) {
      const newVisitLog = await prisma.visitLog.create({
        data: {
          siteId: existingSchedule.siteId,
          userId: session.user.id,
          visitDate: existingSchedule.scheduledDate,
          publicNotes: existingSchedule.notes,
        },
      });
      visitLogId = newVisitLog.id;
    }

    // Validate visit log if provided
    if (visitLogId) {
      const visitLog = await prisma.visitLog.findUnique({
        where: { id: visitLogId },
      });

      if (!visitLog) {
        return NextResponse.json(
          { error: 'Visit log not found' },
          { status: 404 }
        );
      }

      // Ensure visit log is for the same site
      if (visitLog.siteId !== existingSchedule.siteId) {
        return NextResponse.json(
          { error: 'Visit log must be for the same site' },
          { status: 400 }
        );
      }
    }

    // Update schedule to completed
    const completedSchedule = await prisma.scheduledVisit.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedVisitLogId: visitLogId,
      },
      include: {
        site: {
          select: { id: true, name: true },
        },
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
        completedVisitLog: {
          select: {
            id: true,
            visitDate: true,
            publicNotes: true,
          },
        },
      },
    });

    return NextResponse.json(completedSchedule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error completing scheduled visit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Verify user has access to a schedule
 */
async function verifyScheduleAccess(session: any, schedule: any): Promise<boolean> {
  // Check based on role
  if (session.user.role === 'DISTRIBUTOR_ADMIN' || session.user.role === 'DISTRIBUTOR_USER') {
    return schedule.site.organization.distributorId === session.user.distributorId;
  }

  if (session.user.role === 'ORG_ADMIN') {
    return schedule.site.organizationId === session.user.organizationId;
  }

  if (session.user.role === 'SITE_MANAGER' || session.user.role === 'SITE_USER') {
    const siteAccess = await prisma.userSiteAccess.findFirst({
      where: {
        userId: session.user.id,
        siteId: schedule.siteId,
      },
    });
    return !!siteAccess;
  }

  return false;
}
