import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient(); // For user authentication check
  const supabaseAdmin = await createAdminClient(); // For admin operations

  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata.role !== 'Admin') {
    return NextResponse.json({ error: "Unauthorized: Only Admin users can invite others." }, { status: 403 });
  }

  const { email, role } = await request.json();

  if (!email || !role) {
    return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
  }

  try {
    const redirectToUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`;
    console.log("Redirecting invited user to:", redirectToUrl);

    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { role: role },
      redirectTo: redirectToUrl,
    });

    if (error) {
      console.error("Error inviting user:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: `Invitation sent to ${email} with role ${role}.` });
  } catch (e) {
    console.error("Unexpected error inviting user:", e);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
