// /app/onboarding/actions.ts

'use server';

import { prisma } from "@/lib/prisma";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function completeOnboarding(formData: FormData) {
  // Use the standard server client (not admin) to get/update the user
  const supabase = await createClient(); 

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Onboarding Error: No user found.", userError);
    return { error: "Authentication session missing. Please try the invite link again." };
  }

  // --- Get ALL form data ---
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const password = formData.get('password') as string; // Get the password

  // --- Server-side validation ---
  if (!firstName || !lastName) {
    return { error: "First name and last name are required." };
  }
  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  try {
    // --- STEP 1: Set the Password ---
    // This uses the authenticated server client
    const { error: passwordError } = await supabase.auth.updateUser({
      password: password,
    });

    if (passwordError) {
      console.error("Supabase password update error:", passwordError);
      throw new Error(`Failed to set password: ${passwordError.message}`);
    }

    // --- STEP 2: Update Metadata (Admin) ---
    // You still need the admin client for this part
    const supabaseAdmin = await createAdminClient();
    const { error: adminError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
          onboarded: true,
        }
      }
    );

    if (adminError) {
      console.error("Supabase admin update error:", adminError);
      throw new Error(`Failed to update user metadata: ${adminError.message}`);
    }

    // --- STEP 3: Update your Prisma User table ---
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        firstName: firstName,
        lastName: lastName,
      },
      create: {
        id: user.id,
        email: user.email!,
        firstName: firstName,
        lastName: lastName,
        role: user.user_metadata.role || 'Student',
      }
    });

  } catch (error: unknown) {
    console.error("Onboarding Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { error: `An unexpected error occurred: ${errorMessage}` };
  }

  // Success!
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}