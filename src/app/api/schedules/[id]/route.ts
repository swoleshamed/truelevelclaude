// ===========================================
// FILE: src/app/api/schedules/[id]/route.ts
// PURPOSE: API endpoints for single scheduled visit operations
// PRD REFERENCE: PRD Section 8 - Visit Scheduling
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateScheduledVisitSchema } from '@/lib/validations';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/schedules/[id]
 *
 * Fetch a single scheduled visit by ID
 *
 * WHY: Get full details of a specific scheduled visit
 * including site info and completion status.
 *
 * RETURNS: ScheduledVisit with relations
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch schedule
    const schedule = await prisma.scheduledVisit.findUnique({
      where: { id },
      include: {
        site: {
          include: {
            organization: {
              select: { id: true, name: true, distributorId: true },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
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

    if (!schedule) {
      return NextResponse.json(
        { error: 'Scheduled visit not found' },
        { status: 404 }
      );
    }

    // Verify access
    const hasAccess = await verifyScheduleAccess(session, schedule);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden: No access to this scheduled visit' },
        { status: 403 }
      );
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error fetching scheduled visit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/schedules/[id]
 *
 * Update a scheduled visit
 *
 * WHY: Allow rescheduling or updating notes/status.
 *
 * BODY: UpdateScheduledVisitInput
 * RETURNS: Updated ScheduledVisit
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
        { error: 'Forbidden: No access to update this scheduled visit' },
        { status: 403 }
      );
    }

    // Only allow updates to SCHEDULED visits
    if (existingSchedule.status !== 'SCHEDULED') {
      return NextResponse.json(
        { error: 'Cannot update a completed or cancelled visit' },
        { status: 400 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const validatedData = updateScheduledVisitSchema.parse(body);

    // Update schedule
    const updatedSchedule = await prisma.scheduledVisit.update({
      where: { id },
      data: {
        ...(validatedData.scheduledDate && {
          scheduledDate: new Date(validatedData.scheduledDate),
        }),
        ...(validatedData.notes !== undefined && { notes: validatedData.notes }),
        ...(validatedData.status && { status: validatedData.status }),
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

    return NextResponse.json(updatedSchedule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating scheduled visit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/schedules/[id]
 *
 * Delete (cancel) a scheduled visit
 *
 * WHY: Allow removal of scheduled visits.
 * Sets status to CANCELLED rather than hard delete.
 *
 * RETURNS: Success message
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
        { error: 'Forbidden: No access to delete this scheduled visit' },
        { status: 403 }
      );
    }

    // Only allow deletion of SCHEDULED visits
    if (existingSchedule.status !== 'SCHEDULED') {
      return NextResponse.json(
        { error: 'Cannot delete a completed visit' },
        { status: 400 }
      );
    }

    // Soft delete by setting status to CANCELLED
    await prisma.scheduledVisit.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json({ message: 'Scheduled visit cancelled' });
  } catch (error) {
    console.error('Error deleting scheduled visit:', error);
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
