import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/permissions/server";
import { isSuperAdmin } from "@/lib/permissions/utils";

// PATCH /api/admin/organizations/[id]/toggle-active - Toggle organization active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await requireAuth();

    // Only Super Admins can toggle organization status
    if (!isSuperAdmin(context.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.update({
      where: { id: params.id },
      data: { isActive },
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Error toggling organization status:", error);
    return NextResponse.json(
      { error: "Failed to update organization status" },
      { status: 500 }
    );
  }
}
