import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient(); // For user authentication check
  const supabaseAdmin = await createAdminClient(); // For admin operations

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata.role !== "Admin") {
    return NextResponse.json(
      { error: "Unauthorized: Only Admin users can invite others." },
      { status: 403 }
    );
  }

  const { email, role } = await request.json();

  if (!email || !role) {
    return NextResponse.json(
      { error: "Email and role are required" },
      { status: 400 }
    );
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    console.log('Inviting user with redirect to:', `${baseUrl}/api/auth/callback`);
    
    // Use Supabase's built-in invite user functionality
    const { data, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        role: role,
        onboarded: false, // Mark as not onboarded
      },
      redirectTo: `${baseUrl}/api/auth/callback`
    });

    if (inviteError) {
      console.error("Error inviting user:", inviteError);
      return NextResponse.json({ error: inviteError.message }, { status: 500 });
    }

    console.log('User invited successfully:', {
      userId: data?.user?.id,
      email: data?.user?.email,
      metadata: data?.user?.user_metadata
    });

    return NextResponse.json({
      message: `Invitation sent to ${email} with role ${role}. Check your email for the invitation link.`,
      userId: data?.user?.id
    });
  } catch (e) {
    console.error("Unexpected error inviting user:", e);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
