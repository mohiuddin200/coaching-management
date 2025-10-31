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
    
    console.log('Inviting teacher:', {
      teacherId: teacher.id,
      email: teacher.email,
      name: `${teacher.firstName} ${teacher.lastName}`
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

    if (inviteError) {
      console.error("Error inviting teacher:", inviteError);
      return NextResponse.json(
        { error: inviteError.message },
        { status: 500 }
      );
    }

    console.log('Teacher invited successfully:', {
      userId: data?.user?.id,
      email: data?.user?.email,
    });

    // Note: The teacher record will be linked to the user during onboarding
    // when they complete the setup process

    return NextResponse.json({
      message: `Portal invitation sent to ${teacher.email}`,
      userId: data?.user?.id
    });
  } catch (e) {
    console.error("Unexpected error inviting teacher:", e);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
