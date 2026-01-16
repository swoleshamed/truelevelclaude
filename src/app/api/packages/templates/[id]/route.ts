// ===========================================
// FILE: src/app/api/packages/templates/[id]/route.ts
// PURPOSE: API endpoints for single WashPackageTemplate operations
// PRD REFERENCE: PRD Section 5.1 - Package Templates
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateWashPackageTemplateSchema } from '@/lib/validations';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/packages/templates/[id]
 *
 * Fetch a single wash package template with items
 *
 * WHY: View template details including all package items and their chemicals
 *
 * RETURNS: WashPackageTemplate with items and chemicals
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch template with items
    const template = await prisma.washPackageTemplate.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { displayOrder: 'asc' },
          include: {
            chemicals: {
              include: {
                chemicalOrgConfig: {
                  include: {
                    chemicalMaster: true,
                  },
                },
              },
              orderBy: { applicationOrder: 'asc' },
            },
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            distributorId: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    /**
     * Permission check
     * WHY: Only org users and their distributor can view templates
     */
    const isOrgUser = session.user.organizationId === template.organizationId;
    const isDistributor =
      (session.user.role === 'DISTRIBUTOR_ADMIN' ||
        session.user.role === 'DISTRIBUTOR_USER') &&
      template.organization.distributorId === session.user.distributorId;

    if (!isOrgUser && !isDistributor) {
      return NextResponse.json(
        { error: 'Forbidden: Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/packages/templates/[id]
 *
 * Update a wash package template
 *
 * WHY: Org admins need to modify template names and default status
 *
 * BODY: UpdateWashPackageTemplateInput
 * RETURNS: Updated WashPackageTemplate
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    /**
     * Permission check
     * WHY: Only org admins can update templates
     */
    if (session.user.role !== 'ORG_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only organization admins can update templates' },
        { status: 403 }
      );
    }

    // Check template exists and user owns it
    const existingTemplate = await prisma.washPackageTemplate.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (existingTemplate.organizationId !== session.user.organizationId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot update templates for other organizations' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateWashPackageTemplateSchema.parse(body);

    /**
     * Handle isDefault logic
     * WHY: Only one template can be default per organization
     */
    if (validatedData.isDefault) {
      // Unset any existing default (except this one)
      await prisma.washPackageTemplate.updateMany({
        where: {
          organizationId: existingTemplate.organizationId,
          isDefault: true,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    // Update template
    const template = await prisma.washPackageTemplate.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/packages/templates/[id]
 *
 * Delete a wash package template
 *
 * WHY: Org admins may need to remove outdated templates
 *
 * BUSINESS LOGIC:
 * - Cascade deletes template items and their chemical assignments
 * - Does NOT affect site packages that were created from this template
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    /**
     * Permission check
     * WHY: Only org admins can delete templates
     */
    if (session.user.role !== 'ORG_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only organization admins can delete templates' },
        { status: 403 }
      );
    }

    // Check template exists and user owns it
    const existingTemplate = await prisma.washPackageTemplate.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (existingTemplate.organizationId !== session.user.organizationId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot delete templates for other organizations' },
        { status: 403 }
      );
    }

    // Delete template (cascades to items and chemicals)
    await prisma.washPackageTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
