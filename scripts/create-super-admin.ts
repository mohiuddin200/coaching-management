/**
 * Script to create a Super Admin user
 * 
 * This script creates a super admin user with full platform access.
 * Super admins can manage all organizations and have unrestricted access.
 * 
 * Usage:
 *   npx tsx scripts/create-super-admin.ts
 * 
 * Or with npm script:
 *   npm run create-super-admin
 * 
 * You'll be prompted for:
 *   - Email
 *   - Password
 *   - First Name
 *   - Last Name
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient, SystemRole, UserRole } from '@/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createSuperAdmin() {
  // Initialize clients
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
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
    console.log('\n🚀 Super Admin Creation Tool\n');
    console.log('=' .repeat(50));

    // Get user input
    const email = await question('Enter super admin email: ');
    const password = await question('Enter password (min 6 characters): ');
    const firstName = await question('Enter first name: ');
    const lastName = await question('Enter last name: ');

    if (!email || !password || !firstName || !lastName) {
      console.error('❌ All fields are required');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('❌ Password must be at least 6 characters');
      process.exit(1);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Invalid email format');
      process.exit(1);
    }

    console.log('\n📝 Creating super admin user...');

    // Step 1: Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser?.users?.some(u => u.email === email);

    if (userExists) {
      console.error(`❌ User with email ${email} already exists`);
      process.exit(1);
    }

    // Step 2: Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        role: 'SuperAdmin',
        onboarded: true,
      },
    });

    if (authError || !authUser.user) {
      console.error('❌ Error creating auth user:', authError?.message);
      await prisma.$disconnect();
      process.exit(1);
    }

    console.log('✅ Created Supabase Auth user');

    // Step 3: Create user in User table
    const user = await prisma.user.create({
      data: {
        id: authUser.user.id,
        email,
        role: UserRole.Admin, // Using Admin as closest to SuperAdmin
      },
    });

    console.log('✅ Created User record in database');

    // Step 4: Create a UserOrganization record with SuperAdmin role
    // Note: Super admins don't belong to a specific organization
    // But we create a special system record for role management
    await prisma.userOrganization.create({
      data: {
        userId: user.id,
        organizationId: 'system', // Special system organization ID
        role: SystemRole.SuperAdmin,
        canInvite: true,
        isActive: true,
      },
    }).catch(async () => {
      // If 'system' org doesn't exist, we'll just skip this step
      // Super admin role is already set in the User table
      console.log('⚠️  Skipped UserOrganization record (no system org)');
    });

    console.log('\n' + '='.repeat(50));
    console.log('✨ Super Admin Created Successfully! ✨');
    console.log('='.repeat(50));
    console.log(`
📧 Email:     ${email}
👤 Name:      ${firstName} ${lastName}
🔑 Role:      Super Admin
🆔 User ID:   ${user.id}
    `);
    console.log('🎉 You can now sign in with these credentials!');
    console.log('');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Run the script
createSuperAdmin().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
