import { NextResponse } from 'next/server';
import { getTeacherRelatedRecords } from '@/lib/soft-delete-utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const relatedRecords = await getTeacherRelatedRecords(id);
    
    // Convert to array format for the frontend
    const recordsArray = Object.entries(relatedRecords).map(([type, count]) => ({
      type,
      count
    }));

    return NextResponse.json({ records: recordsArray });
  } catch (error) {
    console.error('Error fetching related records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related records' },
      { status: 500 }
    );
  }
}