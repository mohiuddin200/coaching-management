import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSoftDeletedTeachers } from '@/lib/soft-delete';

export async function GET(request: Request) {
  try {
    // Check if user is authenticated and is an admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.user_metadata.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Only Admin users can view archived teachers.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await getSoftDeletedTeachers(page, limit);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching archived teachers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch archived teachers' },
      { status: 500 }
    );
  }
}