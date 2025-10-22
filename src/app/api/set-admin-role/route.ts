import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("Received request to set admin role.");
  const supabaseAdmin = await createAdminClient();
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    // First, get the user by email to retrieve their current metadata
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
      filter: `email eq "${email}"`,
    });

    console.log("Supabase listUsers data:", usersData);
    console.log("Supabase listUsers error:", usersError);

    if (usersError || !usersData?.users || usersData.users.length === 0) {
      console.error("Error finding user or user not found:", usersError);
      return NextResponse.json({ error: "User not found or error fetching user." }, { status: 404 });
    }

    const user = usersData.users[0];

    // Update the user's metadata to include the 'Admin' role
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, role: "Admin" },
    });
    if (error) {
      console.error("Error updating user role:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: `User ${email} updated to Admin role.` });
  } catch (e) {
    console.error("Unexpected error setting admin role:", e);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
