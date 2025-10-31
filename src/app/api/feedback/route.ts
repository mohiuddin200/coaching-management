import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { type, subject, message, email, userName } = body;

    // Validation
    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    // Create feedback entry
    const feedback = await prisma.feedback.create({
      data: {
        userId: user?.id,
        userName: userName || user?.email || 'Anonymous',
        email: email || user?.email,
        type: type || 'General',
        subject,
        message,
        status: 'Open',
        priority: 'Medium',
      },
    });

    return NextResponse.json(
      { 
        message: 'Feedback submitted successfully',
        feedback 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user role
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    // Only admins can view all feedback
    let feedbacks;
    if (dbUser?.role === 'Admin') {
      feedbacks = await prisma.feedback.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Regular users can only see their own feedback
      feedbacks = await prisma.feedback.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ feedbacks }, { status: 200 });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
