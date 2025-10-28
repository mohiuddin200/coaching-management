import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  
  if (!token || !type) {
    return NextResponse.redirect(new URL('/signin?message=Invalid verification link', origin));
  }

  const supabase = await createClient();

  try {
    let verificationResult;
    
    if (type === 'invite') {
      verificationResult = await supabase.auth.verifyOtp({
        type: 'invite',
        token_hash: token,
      });
    } else {
      // Handle other types like recovery, email confirmation, etc.
      verificationResult = await supabase.auth.verifyOtp({
        type: type as 'email' | 'recovery' | 'email_change',
        token_hash: token,
      });
    }

    const { data, error } = verificationResult;

    if (error) {
      console.error('Verification error:', error);
      let errorMessage = 'Verification failed';
      
      if (error.message.includes('expired')) {
        errorMessage = 'Email link has expired';
      } else if (error.message.includes('invalid')) {
        errorMessage = 'Email link is invalid';
      }
      
      return NextResponse.redirect(new URL(`/signin?message=${encodeURIComponent(errorMessage)}`, origin));
    }

    // Verification successful
    if (data.user) {
      const isOnboarded = data.user.user_metadata.onboarded;
      
      if (!isOnboarded && type === 'invite') {
        // New user from invitation - redirect to onboarding
        return NextResponse.redirect(new URL('/auth/onboarding', origin));
      } else {
        // Existing user or completed onboarding - redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', origin));
      }
    }

    return NextResponse.redirect(new URL('/dashboard', origin));
  } catch (error) {
    console.error('Unexpected verification error:', error);
    return NextResponse.redirect(new URL('/signin?message=Verification failed', origin));
  }
}