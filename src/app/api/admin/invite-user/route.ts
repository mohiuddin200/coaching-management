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
    // First, create the user directly
    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        role: role,
        onboarded: false, // Mark as not onboarded
      }
    });

    if (createError) {
      console.error("Error creating user:", createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    // Generate a password reset link that we'll use as an invitation link
    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`
      }
    });

    if (resetError) {
      console.error("Error generating reset link:", resetError);
      return NextResponse.json({ error: resetError.message }, { status: 500 });
    }

    // In a real application, you would send this link via email
    // For now, we'll return it in the response
    console.log("Generated invitation link:", resetData.properties?.action_link);

    return NextResponse.json({
      message: `User created and invitation generated for ${email} with role ${role}.`,
      invitationLink: resetData.properties?.action_link, // Remove this in production
    });
  } catch (e) {
    console.error("Unexpected error inviting user:", e);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
