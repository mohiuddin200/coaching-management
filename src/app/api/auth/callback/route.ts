import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/dashboard';
  const error = searchParams.get('error');
  const error_code = searchParams.get('error_code');
  const error_description = searchParams.get('error_description');

  // Handle errors from Supabase
  if (error) {
    console.error('Auth callback error:', { error, error_code, error_description });
    let errorMessage = 'Authentication failed';
    
    if (error_code === 'otp_expired') {
      errorMessage = 'Email link has expired. Please request a new invitation.';
    } else if (error === 'access_denied') {
      errorMessage = 'Access denied. The link may be invalid or expired.';
    } else if (error_description) {
      errorMessage = decodeURIComponent(error_description.replace(/\+/g, ' '));
    }
    
    return NextResponse.redirect(new URL(`/signin?message=${encodeURIComponent(errorMessage)}`, origin));
  }

  // Create a supabase client
  const supabase = await createClient();

  if (code) {
    // Handle authorization code flow (for regular sign-ins)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(new URL(`/signin?message=${encodeURIComponent('Authentication failed')}`, origin));
    }

    // Check if the user has completed onboarding
    if (data.user) {
      const isOnboarded = data.user.user_metadata.onboarded;
      
      if (!isOnboarded) {
        // New user from invitation - redirect to onboarding
        return NextResponse.redirect(new URL('/auth/onboarding', origin));
      }
    }

    return NextResponse.redirect(new URL(next, origin));
  }

  if (token_hash && type) {
    // Handle email verification (for invitations and password resets)
    let verificationResult;
    
    if (type === 'recovery') {
      verificationResult = await supabase.auth.verifyOtp({
        type: 'recovery',
        token_hash,
      });
    } else if (type === 'invite') {
      verificationResult = await supabase.auth.verifyOtp({
        type: 'invite',
        token_hash,
      });
    } else {
      // Handle other email OTP types
      verificationResult = await supabase.auth.verifyOtp({
        type: type as 'email' | 'email_change',
        token_hash,
      });
    }

    const { data, error } = verificationResult;

    if (error) {
      console.error('Email verification error:', error);
      return NextResponse.redirect(new URL(`/signin?message=${encodeURIComponent('Email link is invalid or has expired')}`, origin));
    }

    // Verification successful - user is now authenticated
    if (data.user) {
      const isOnboarded = data.user.user_metadata.onboarded;
      
      if (!isOnboarded) {
        // New user from invitation or user needs to set password - redirect to onboarding
        return NextResponse.redirect(new URL('/auth/onboarding', origin));
      }
    }

    return NextResponse.redirect(new URL('/dashboard', origin));
  }

  // No code or token - redirect to signin
  return NextResponse.redirect(new URL('/signin', origin));
}