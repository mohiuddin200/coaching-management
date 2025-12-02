import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { restoreTeacher } from '@/lib/soft-delete';
import { logDeletionAttempt } from '@/lib/soft-delete-utils';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated and is an admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.user_metadata.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Only Admin users can restore teachers.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    logDeletionAttempt('teacher', id, 'attempt', { action: 'restore', userId: user.id });

    const result = await restoreTeacher(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    logDeletionAttempt('teacher', id, 'success', { action: 'restore', userId: user.id });
    return NextResponse.json({ message: result.message });

  } catch (error) {
    const { id } = await params;
    
    logDeletionAttempt('teacher', id, 'error', { 
      action: 'restore',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return NextResponse.json(
      { error: 'Failed to restore teacher' },
      { status: 500 }
    );
  }
}