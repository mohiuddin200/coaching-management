import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireInvitePermission } from "@/lib/permissions/server";
import { SystemRole } from "@/lib/permissions/config";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabaseAdmin = await createAdminClient();

  // Check if user has permission to invite
  try {
    const userContext = await requireInvitePermission();
    
    const { id } = await params;
    const body = await request.json();
    const { role } = body as { role?: SystemRole };

    // Default to AcademicCoordinator if no role specified
    const assignedRole: SystemRole = role || "AcademicCoordinator";

    // Validate role
    const validRoles: SystemRole[] = ["OrganizationAdmin", "FinanceManager", "AcademicCoordinator"];
    if (!validRoles.includes(assignedRole)) {
      return NextResponse.json(
        { error: "Invalid role. Must be OrganizationAdmin, FinanceManager, or AcademicCoordinator" },
        { status: 400 }
      );
    }

    // Get teacher details from database
    const teacher = await prisma.teacher.findUnique({
      where: { 
        id,
        organizationId: userContext.organizationId // Ensure teacher belongs to same org
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userId: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
          }
        }
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found or does not belong to your organization" },
        { status: 404 }
      );
    }

    if (teacher.userId) {
      return NextResponse.json(
        { error: "Teacher already has a portal account" },
        { status: 400 }
      );
    }

    if (!teacher.email) {
      return NextResponse.json(
        { error: "Teacher does not have an email address" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    console.log('Invitation API: Processing teacher invitation', {
      teacherId: teacher.id,
      email: teacher.email,
      name: `${teacher.firstName} ${teacher.lastName}`,
      role: assignedRole,
      organizationId: teacher.organizationId,
      organizationName: teacher.organization.name,
      invitedBy: userContext.userId,
      baseUrl: baseUrl
    });

    // Use Supabase's built-in invite user functionality
    const { data, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      teacher.email,
      {
        data: {
          role: "Teacher", // Legacy field (keep for backward compatibility)
          systemRole: assignedRole, // NEW: System role for RBAC
          organizationId: teacher.organizationId, // NEW: Organization context
          organizationName: teacher.organization.name, // NEW: For display
          canInvite: assignedRole === "OrganizationAdmin", // NEW: Only org admins can invite
          onboarded: false,
          teacherId: teacher.id,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
        },
        redirectTo: `${baseUrl}/api/auth/callback`
      }
    );

    // Log external API service response status
    console.log('External Invitation Service Status:', {
      success: !inviteError,
      error: inviteError?.message || null,
      hasUser: !!data?.user
    });

    if (inviteError) {
      console.error('Invitation API Error: Supabase invite failed', {
        teacherId: teacher.id,
        email: teacher.email,
        error: inviteError,
        errorDetails: {
          message: inviteError.message,
          status: inviteError.status
        }
      });
      return NextResponse.json(
        { error: "Failed to send invitation. Check server logs for details." },
        { status: 500 }
      );
    }

    console.log('Invitation API: Teacher invited successfully', {
      userId: data?.user?.id,
      email: data?.user?.email,
      teacherId: teacher.id,
      role: assignedRole
    });

    // Note: The UserOrganization record will be created during onboarding
    // when they complete the setup process

    return NextResponse.json({
      message: `Portal invitation sent to ${teacher.email} as ${assignedRole}`,
      userId: data?.user?.id,
      role: assignedRole
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    console.error('Invitation API Error: Unexpected error occurred', {
      error: error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { error: "Failed to send invitation. Check server logs for details." },
      { status: 500 }
    );
  }
}