/**
 * Utility functions for Super Admin management
 */

import { createClient } from '@supabase/supabase-js';
import { PrismaClient, SystemRole, UserRole } from '@/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';

export interface CreateSuperAdminInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SuperAdminResult {
  success: boolean;
  userId?: string;
  email?: string;
  error?: string;
}

/**
 * Create a Super Admin user programmatically
 * 
 * @param input - Super admin details
 * @returns Result with userId or error
 */
export async function createSuperAdminUser(
  input: CreateSuperAdminInput
): Promise<SuperAdminResult> {
  const { email, password, firstName, lastName } = input;

  // Validate input
  if (!email || !password || !firstName || !lastName) {
    return { success: false, error: 'All fields are required' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Invalid email format' };
  }

  // Initialize clients
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      success: false,
      error: 'Missing Supabase configuration. Check environment variables.',
    };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser?.users?.some((u) => u.email === email);

    if (userExists) {
      return { success: false, error: `User with email ${email} already exists` };
    }

    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        role: 'SuperAdmin',
        onboarded: true,
      },
    });

    if (authError || !authUser.user) {
      return {
        success: false,
        error: `Failed to create auth user: ${authError?.message}`,
      };
    }

    // Create user in User table
    const user = await prisma.user.create({
      data: {
        id: authUser.user.id,
        email,
        role: UserRole.Admin,
      },
    });

    // Try to create UserOrganization record for system
    try {
      await prisma.userOrganization.create({
        data: {
          userId: user.id,
          organizationId: 'system',
          role: SystemRole.SuperAdmin,
          canInvite: true,
          isActive: true,
        },
      });
    } catch {
      // If system org doesn't exist, that's okay
      // Super admin role is set in User table
    }

    await prisma.$disconnect();

    return {
      success: true,
      userId: user.id,
      email: user.email,
    };
  } catch (error) {
    await prisma.$disconnect();
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Check if a user is a super admin
 * 
 * @param userId - The user ID to check
 * @returns True if user is super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  const prisma = new PrismaClient({ adapter });

  try {

    // Check UserOrganization for SystemRole
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        userId,
        role: SystemRole.SuperAdmin,
        isActive: true,
      },
    });

    await prisma.$disconnect();
    return !!userOrg;
  } catch (error) {
    await prisma.$disconnect();
    console.error('Error checking super admin status:', error);
    return false;
  }
}

/**
 * Get all super admins
 * 
 * @returns Array of super admin users
 */
export async function getAllSuperAdmins() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    const superAdmins = await prisma.user.findMany({
      where: {
        organizations: {
          some: {
            role: SystemRole.SuperAdmin,
            isActive: true,
          },
        },
      },
      include: {
        organizations: {
          where: {
            role: SystemRole.SuperAdmin,
          },
        },
      },
    });

    await prisma.$disconnect();
    return superAdmins;
  } catch (error) {
    await prisma.$disconnect();
    throw error;
  }
}

/**
 * Revoke super admin privileges
 * 
 * @param userId - User ID to revoke
 * @returns Success status
 */
export async function revokeSuperAdmin(userId: string): Promise<boolean> {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    // Update User table
    await prisma.user.update({
      where: { id: userId },
      data: { role: UserRole.Teacher },
    });

    // Deactivate all SuperAdmin UserOrganization records
    await prisma.userOrganization.updateMany({
      where: {
        userId,
        role: SystemRole.SuperAdmin,
      },
      data: { isActive: false },
    });

    await prisma.$disconnect();
    return true;
  } catch (error) {
    await prisma.$disconnect();
    console.error('Error revoking super admin:', error);
    return false;
  }
}
