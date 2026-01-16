// ===========================================
// FILE: src/app/api/packages/templates/[id]/items/route.ts
// PURPOSE: API endpoints for WashPackageTemplateItem management
// PRD REFERENCE: PRD Section 5.1 - Package Templates
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma, PrismaTransactionClient } from '@/lib/prisma';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Schema for creating template items with chemicals
 */
const createTemplateItemSchema = z.object({
  name: z.string().min(1, 'Package name is required'),
  displayOrder: z.number().int().min(1).optional(),
  singleWashPrice: z.number().min(0).optional().nullable(),
  membershipPrice: z.number().min(0).optional().nullable(),
  description: z.string().optional().nullable(),
  chemicals: z.array(z.object({
    chemicalOrgConfigId: z.string().uuid('Invalid chemical config ID'),
    applicationOrder: z.number().int().min(1),
  })).optional(),
});

/**
 * Schema for updating template items
 */
const updateTemplateItemSchema = z.object({
  id: z.string().uuid('Invalid item ID'),
  name: z.string().min(1).optional(),
  displayOrder: z.number().int().min(1).optional(),
  singleWashPrice: z.number().min(0).optional().nullable(),
  membershipPrice: z.number().min(0).optional().nullable(),
  description: z.string().optional().nullable(),
  chemicals: z.array(z.object({
    chemicalOrgConfigId: z.string().uuid('Invalid chemical config ID'),
    applicationOrder: z.number().int().min(1),
  })).optional(),
});

/**
 * GET /api/packages/templates/[id]/items
 *
 * Fetch all items for a template
 *
 * WHY: View all packages within a template
 *
 * RETURNS: Array of WashPackageTemplateItem with chemicals
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: templateId } = await context.params;

    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify template exists and user has access
    const template = await prisma.washPackageTemplate.findUnique({
      where: { id: templateId },
      include: {
        organization: {
          select: { distributorId: true },
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

    // Fetch items
    const items = await prisma.washPackageTemplateItem.findMany({
      where: { templateId },
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
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching template items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/packages/templates/[id]/items
 *
 * Create a new item in the template
 *
 * WHY: Add packages to a template (Basic Wash, Premium, etc.)
 *
 * BODY: CreateTemplateItemInput (with optional chemicals)
 * RETURNS: Created WashPackageTemplateItem
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: templateId } = await context.params;

    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    /**
     * Permission check
     * WHY: Only org admins can add items to templates
     */
    if (session.user.role !== 'ORG_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only organization admins can add template items' },
        { status: 403 }
      );
    }

    // Verify template exists and user owns it
    const template = await prisma.washPackageTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (template.organizationId !== session.user.organizationId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot modify templates for other organizations' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createTemplateItemSchema.parse(body);

    /**
     * Auto-calculate display order if not provided
     * WHY: Convenience - new items go to end by default
     */
    let displayOrder = validatedData.displayOrder;
    if (!displayOrder) {
      const maxOrder = await prisma.washPackageTemplateItem.aggregate({
        where: { templateId },
        _max: { displayOrder: true },
      });
      displayOrder = (maxOrder._max.displayOrder || 0) + 1;
    }

    // Create item with chemicals in a transaction
    const item = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      // Create the item
      const newItem = await tx.washPackageTemplateItem.create({
        data: {
          templateId,
          name: validatedData.name,
          displayOrder,
          singleWashPrice: validatedData.singleWashPrice,
          membershipPrice: validatedData.membershipPrice,
          description: validatedData.description,
        },
      });

      // Add chemicals if provided
      if (validatedData.chemicals && validatedData.chemicals.length > 0) {
        await tx.washPackageTemplateChemical.createMany({
          data: validatedData.chemicals.map((chem) => ({
            templateItemId: newItem.id,
            chemicalOrgConfigId: chem.chemicalOrgConfigId,
            applicationOrder: chem.applicationOrder,
          })),
        });
      }

      // Fetch complete item with chemicals
      return tx.washPackageTemplateItem.findUnique({
        where: { id: newItem.id },
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
      });
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating template item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/packages/templates/[id]/items
 *
 * Update an item in the template
 *
 * WHY: Modify package details or chemicals
 *
 * BODY: UpdateTemplateItemInput (must include item id)
 * RETURNS: Updated WashPackageTemplateItem
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id: templateId } = await context.params;

    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    /**
     * Permission check
     */
    if (session.user.role !== 'ORG_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only organization admins can update template items' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateTemplateItemSchema.parse(body);

    // Verify item exists and belongs to this template
    const existingItem = await prisma.washPackageTemplateItem.findUnique({
      where: { id: validatedData.id },
      include: {
        template: true,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Template item not found' },
        { status: 404 }
      );
    }

    if (existingItem.templateId !== templateId) {
      return NextResponse.json(
        { error: 'Item does not belong to this template' },
        { status: 400 }
      );
    }

    if (existingItem.template.organizationId !== session.user.organizationId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot modify templates for other organizations' },
        { status: 403 }
      );
    }

    // Update item with chemicals in a transaction
    const item = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      // Update the item
      await tx.washPackageTemplateItem.update({
        where: { id: validatedData.id },
        data: {
          name: validatedData.name,
          displayOrder: validatedData.displayOrder,
          singleWashPrice: validatedData.singleWashPrice,
          membershipPrice: validatedData.membershipPrice,
          description: validatedData.description,
        },
      });

      // Update chemicals if provided (replace all)
      if (validatedData.chemicals !== undefined) {
        // Delete existing chemicals
        await tx.washPackageTemplateChemical.deleteMany({
          where: { templateItemId: validatedData.id },
        });

        // Create new chemicals
        if (validatedData.chemicals.length > 0) {
          await tx.washPackageTemplateChemical.createMany({
            data: validatedData.chemicals.map((chem) => ({
              templateItemId: validatedData.id,
              chemicalOrgConfigId: chem.chemicalOrgConfigId,
              applicationOrder: chem.applicationOrder,
            })),
          });
        }
      }

      // Fetch complete item with chemicals
      return tx.washPackageTemplateItem.findUnique({
        where: { id: validatedData.id },
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
      });
    });

    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating template item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/packages/templates/[id]/items
 *
 * Delete an item from the template
 *
 * WHY: Remove packages from a template
 *
 * QUERY: itemId - the item to delete
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id: templateId } = await context.params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { error: 'itemId query parameter is required' },
        { status: 400 }
      );
    }

    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    /**
     * Permission check
     */
    if (session.user.role !== 'ORG_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only organization admins can delete template items' },
        { status: 403 }
      );
    }

    // Verify item exists and belongs to this template
    const existingItem = await prisma.washPackageTemplateItem.findUnique({
      where: { id: itemId },
      include: {
        template: true,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Template item not found' },
        { status: 404 }
      );
    }

    if (existingItem.templateId !== templateId) {
      return NextResponse.json(
        { error: 'Item does not belong to this template' },
        { status: 400 }
      );
    }

    if (existingItem.template.organizationId !== session.user.organizationId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot modify templates for other organizations' },
        { status: 403 }
      );
    }

    // Delete item (cascades to chemicals)
    await prisma.washPackageTemplateItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
