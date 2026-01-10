import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/permissions/server";
import { isSuperAdmin } from "@/lib/permissions/utils";

// GET /api/admin/organizations/[id]/details - Get organization details
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

    const organization = await prisma.organization.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Error fetching organization details:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization details" },
      { status: 500 }
    );
  }
}
