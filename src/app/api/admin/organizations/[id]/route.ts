import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/permissions/server";
import { isSuperAdmin } from "@/lib/permissions/utils";

// PUT /api/admin/organizations/[id] - Update organization (Super Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await requireAuth();

    // Only Super Admins can update organizations
    if (!isSuperAdmin(context.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, slug, email, phone, address } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug is taken by another organization
    const existing = await prisma.organization.findFirst({
      where: {
        slug,
        NOT: {
          id: params.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An organization with this slug already exists" },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        email: email || null,
        phone: phone || null,
        address: address || null,
      },
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/organizations/[id] - Delete organization (Super Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await requireAuth();

    // Only Super Admins can delete organizations
    if (!isSuperAdmin(context.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Check if organization has users, students, or teachers
    const organization = await prisma.organization.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            users: true,
            students: true,
            teachers: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    if (
      organization._count.users > 0 ||
      organization._count.students > 0 ||
      organization._count.teachers > 0
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot delete organization with existing users, students, or teachers. Please deactivate instead.",
        },
        { status: 400 }
      );
    }

    await prisma.organization.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json(
      { error: "Failed to delete organization" },
      { status: 500 }
    );
  }
}
