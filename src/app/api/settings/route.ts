import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch user settings
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to find user settings in database
    // For now, we'll store settings in a JSON field or separate table
    // Let's check if user table exists with settings field
    const userSettings = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        // Add settings fields if they exist in your schema
      },
    }).catch(() => null);

    // Return default settings or stored settings
    return NextResponse.json({
      smsEnabled: false,
      biometricAttendance: false,
      emailNotifications: true,
      attendanceReminders: true,
      paymentNotifications: true,
      // Merge with any stored settings
      ...userSettings,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT - Update profile (name)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    // Update Supabase user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
      },
    });

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // If user is a teacher, update teacher profile as well
    const userRole = user.user_metadata.role;
    if (userRole === 'Teacher') {
      try {
        await prisma.teacher.updateMany({
          where: { userId: user.id },
          data: {
            firstName,
            lastName,
          },
        });
      } catch (error) {
        console.error('Error updating teacher profile:', error);
        // Don't fail the request if teacher update fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// PATCH - Update individual settings (toggles)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // For now, we'll store settings in user metadata
    // In production, you might want a separate settings table
    const currentMetadata = user.user_metadata || {};
    const settings = currentMetadata.settings || {};

    // Update the specific setting
    const updatedSettings = {
      ...settings,
      ...body,
    };

    // Update user metadata with new settings
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        ...currentMetadata,
        settings: updatedSettings,
      },
    });

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // If biometric attendance is being toggled, you might want to
    // update related system configurations here

    // If SMS is being toggled, you might want to update
    // SMS provider configurations here

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
