import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePageAccess } from '@/lib/permissions/server';

// GET /api/levels - Get all levels
export async function GET() {
  try {
    // Require authentication and check page access
    const userContext = await requirePageAccess('/levels');
    
    const levels = await prisma.level.findMany({
      where: {
        organizationId: userContext.organizationId, // Filter by organization
      },
      orderBy: { levelNumber: 'asc' },
      include: {
        _count: {
          select: {
            subjects: true,
            students: true,
          },
        },
      },
    });

    return NextResponse.json(levels);
  } catch (error) {
    // Handle permission errors
    if (error instanceof Error && (error.message.includes("Forbidden") || error.message.includes("Unauthorized"))) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes("Forbidden") ? 403 : 401 }
      );
    }
    
    console.error('Error fetching levels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch levels' },
      { status: 500 }
    );
  }
}

// POST /api/levels - Create a new level
export async function POST(request: NextRequest) {
  try {
    // Require authentication and check page access
    const userContext = await requirePageAccess('/levels');
    
    const body = await request.json();
    const { name, levelNumber, description, status } = body;

    if (!name || !levelNumber) {
      return NextResponse.json(
        { error: 'Name and level number are required' },
        { status: 400 }
      );
    }

    // Check if level number already exists in this organization
    const existingLevel = await prisma.level.findFirst({
      where: { 
        levelNumber: parseInt(levelNumber),
        organizationId: userContext.organizationId,
      },
    });

    if (existingLevel) {
      return NextResponse.json(
        { error: 'A level with this number already exists in your organization' },
        { status: 400 }
      );
    }

    const level = await prisma.level.create({
      data: {
        name,
        levelNumber: parseInt(levelNumber),
        description: description || null,
        status: status || 'Active',
        organizationId: userContext.organizationId, // NEW: Link to organization
      },
    });

    return NextResponse.json(level, { status: 201 });
  } catch (error) {
    // Handle permission errors
    if (error instanceof Error && (error.message.includes("Forbidden") || error.message.includes("Unauthorized"))) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes("Forbidden") ? 403 : 401 }
      );
    }
    
    console.error('Error creating level:', error);
    return NextResponse.json(
      { error: 'Failed to create level' },
      { status: 500 }
    );
  }
}

// PUT /api/levels - Update a level
export async function PUT(request: NextRequest) {
  try {
    // Require authentication and check page access
    const userContext = await requirePageAccess('/levels');
    
    const body = await request.json();
    const { id, name, levelNumber, description, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Level ID is required' },
        { status: 400 }
      );
    }

    if (!name || !levelNumber) {
      return NextResponse.json(
        { error: 'Name and level number are required' },
        { status: 400 }
      );
    }

    // Check if level number already exists in this organization (excluding current level)
    const existingLevel = await prisma.level.findFirst({
      where: {
        levelNumber: parseInt(levelNumber),
        organizationId: userContext.organizationId,
        NOT: { id },
      },
    });

    if (existingLevel) {
      return NextResponse.json(
        { error: 'A level with this number already exists in your organization' },
        { status: 400 }
      );
    }

    // Update only if level belongs to user's organization
    const level = await prisma.level.update({
      where: { 
        id,
        organizationId: userContext.organizationId, // Ensure it belongs to their org
      },
      data: {
        name,
        levelNumber: parseInt(levelNumber),
        description: description || null,
        status: status || 'Active',
      },
    });

    return NextResponse.json(level);
  } catch (error) {
    // Handle permission errors
    if (error instanceof Error && (error.message.includes("Forbidden") || error.message.includes("Unauthorized"))) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes("Forbidden") ? 403 : 401 }
      );
    }
    
    console.error('Error updating level:', error);
    return NextResponse.json(
      { error: 'Failed to update level' },
      { status: 500 }
    );
  }
}
