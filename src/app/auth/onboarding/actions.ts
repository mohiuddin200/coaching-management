'use server';

import { prisma } from "@/lib/prisma";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();
  const supabaseAdmin = await createAdminClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Onboarding Error: No user found.", userError);
    return redirect("/auth/login?message=Authentication required. Please log in.");
  }

  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;

  if (!firstName || !lastName) {
    return { error: "First name and last name are required." };
  }

  try {
    // 1. Update Supabase Auth user_metadata
    // We use the admin client to update metadata for a specific user
    const { data: updatedUser, error: adminError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata, // Preserve existing metadata (like role)
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`, // Optional: convenience
          onboarded: true, // This is the crucial flag!
        }
      }
    );

    if (adminError) {
      console.error("Supabase admin update error:", adminError);
      throw new Error(`Failed to update user metadata: ${adminError.message}`);
    }

    // 2. Update your Prisma User table
    // We use upsert to either create the user (if it doesn't exist)
    // or update it (if it somehow already does).
    await prisma.user.upsert({
      where: { id: user.id }, // Assumes your User model's ID matches Supabase user ID
      update: {
        firstName: firstName,
        lastName: lastName,
      },
      create: {
        id: user.id,
        email: user.email!, // Make sure to store the email
        firstName: firstName,
        lastName: lastName,
        role: user.user_metadata.role || 'Student', // Use the role from metadata or default to Student
      }
    });

  } catch (error: unknown) {
    console.error("Onboarding Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { error: `An unexpected error occurred: ${errorMessage}` };
  }

  // Success!
  // Revalidate the root layout to refresh user session data
  revalidatePath('/', 'layout');
  // Redirect to the dashboard
  redirect('/dashboard');
}