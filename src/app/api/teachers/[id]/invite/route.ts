import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const supabaseAdmin = await createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata.role !== "Admin") {
    return NextResponse.json(
      { error: "Unauthorized: Only Admin users can send invites." },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    // Get teacher details from database
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userId: true,
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
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
      baseUrl: baseUrl
    });

    // Verify production environment variables are loaded
    console.log('Invitation API: Environment check', {
      hasBaseUrl: !!baseUrl,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });

    // Use Supabase's built-in invite user functionality
    const { data, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      teacher.email,
      {
        data: {
          role: "Teacher",
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
      teacherId: teacher.id
    });

    // Note: The teacher record will be linked to the user during onboarding
    // when they complete the setup process

    return NextResponse.json({
      message: `Portal invitation sent to ${teacher.email}`,
      userId: data?.user?.id
    });
  } catch (error) {
    console.error('Invitation API Error: Unexpected error occurred', {
      teacherId: id,
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
