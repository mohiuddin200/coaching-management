// /app/api/auth/check-super-admin/route.ts

import { createClient } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/super-admin';
import { NextResponse } from 'next/server';

/**
 * GET /api/auth/check-super-admin
 * 
 * Check if the current authenticated user is a super admin
 * 
 * Returns:
 *   { isSuperAdmin: boolean, userId: string }
 */
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { isSuperAdmin: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user is super admin
    const isSuper = await isSuperAdmin(user.id);

    return NextResponse.json({
      isSuperAdmin: isSuper,
      userId: user.id,
      email: user.email,
    });
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return NextResponse.json(
      { isSuperAdmin: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
