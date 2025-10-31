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
    // First, get all users and find the one with matching email
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    console.log("Supabase listUsers data:", usersData);
    console.log("Supabase listUsers error:", usersError);

    if (usersError || !usersData?.users) {
      console.error("Error fetching users:", usersError);
      return NextResponse.json({ error: "Error fetching users." }, { status: 500 });
    }

    // Find the user by email
    const user = usersData.users.find(u => u.email === email);

    if (!user) {
      console.error("User not found with email:", email);
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Update the user's metadata to include the 'Admin' role
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
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
