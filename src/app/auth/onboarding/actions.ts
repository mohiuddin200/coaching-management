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

  // Get password from form data
  const password = formData.get('password') as string;

  // Server-side validation
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
    // Mark user as onboarded
    const supabaseAdmin = await createAdminClient();
    const { error: adminError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          onboarded: true,
        }
      }
    );

    if (adminError) {
      console.error("Supabase admin update error:", adminError);
      throw new Error(`Failed to update user metadata: ${adminError.message}`);
    }

    // --- STEP 3: Update your Prisma User table (minimal sync) ---
    // Use upsert with email to avoid race conditions or duplicate user creation
    // This handles cases where user might already exist with same email
    await prisma.user.upsert({
      where: { email: user.email! },
      update: {
        // Ensure ID and role are correct
        id: user.id,
        role: user.user_metadata.role || 'Teacher',
      },
      create: {
        id: user.id,
        email: user.email!,
        role: user.user_metadata.role || 'Teacher',
      }
    });

    // --- STEP 4: Link Teacher profile if role is Teacher ---
    if (user.user_metadata.role === 'Teacher') {
      const teacherId = user.user_metadata.teacherId;
      
      if (teacherId) {
        // Update the existing teacher profile with the user ID
        await prisma.teacher.update({
          where: { id: teacherId },
          data: {
            userId: user.id,
          }
        });
      } else {
        // This shouldn't happen - all teachers should be invited from the teacher table
        console.warn('Teacher invited without teacherId in metadata');
      }
    }

  } catch (error: unknown) {
    console.error("Onboarding Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { error: `An unexpected error occurred: ${errorMessage}` };
  }

  // Success!
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}