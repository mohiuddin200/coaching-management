import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/permissions/server";
import { isSuperAdmin } from "@/lib/permissions/utils";

// GET /api/admin/organizations/[id]/users - Get all users in organization
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await requireAuth();

    // Only Super Admins can access this endpoint
    if (!isSuperAdmin(context.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const users = await prisma.userOrganization.findMany({
      where: {
        organizationId: params.id,
      },
      include: {
        user: {
          select: {
            email: true,
            teacherProfile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching organization users:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization users" },
      { status: 500 }
    );
  }
}
