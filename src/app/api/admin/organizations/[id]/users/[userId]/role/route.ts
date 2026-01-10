import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/permissions/server";
import { isSuperAdmin } from "@/lib/permissions/utils";

// PATCH /api/admin/organizations/[id]/users/[userId]/role - Update user role
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const context = await requireAuth();

    // Only Super Admins can update user roles
    if (!isSuperAdmin(context.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !["OrganizationAdmin", "FinanceManager", "AcademicCoordinator"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const userOrg = await prisma.userOrganization.update({
      where: {
        id: params.userId,
      },
      data: {
        role,
        // OrganizationAdmin gets canInvite by default
        canInvite: role === "OrganizationAdmin" ? true : undefined,
      },
    });

    return NextResponse.json(userOrg);
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
