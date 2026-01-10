import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/permissions/server";
import { isSuperAdmin } from "@/lib/permissions/utils";

// PATCH /api/admin/organizations/[id]/users/[userId]/invite-permission - Toggle invite permission
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const context = await requireAuth();

    // Only Super Admins can update invite permissions
    if (!isSuperAdmin(context.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { canInvite } = body;

    if (typeof canInvite !== "boolean") {
      return NextResponse.json(
        { error: "canInvite must be a boolean" },
        { status: 400 }
      );
    }

    const userOrg = await prisma.userOrganization.update({
      where: {
        id: params.userId,
      },
      data: {
        canInvite,
      },
    });

    return NextResponse.json(userOrg);
  } catch (error) {
    console.error("Error updating invite permission:", error);
    return NextResponse.json(
      { error: "Failed to update invite permission" },
      { status: 500 }
    );
  }
}
