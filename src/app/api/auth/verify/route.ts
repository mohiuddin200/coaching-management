import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const redirect_to = searchParams.get('redirect_to');
  
  console.log('Verification called with params:', { 
    token_hash, 
    token, 
    type, 
    redirect_to,
    allParams: Object.fromEntries(searchParams.entries())
  });
  
  // Use token_hash if available, otherwise fall back to token
  const actualToken = token_hash || token;
  
  if (!actualToken || !type) {
    console.error('Missing required parameters:', { token: actualToken, type });
    return NextResponse.redirect(new URL('/signin?message=Invalid verification link', origin));
  }

  const supabase = await createClient();

  try {
    if (type === 'invite') {
      // For invite links, verify the token hash
      console.log('Attempting invite verification with token:', actualToken.substring(0, 10) + '...');
      
      const { data, error } = await supabase.auth.verifyOtp({
        type: 'invite',
        token_hash: actualToken,
      });

      if (error) {
        console.error('Invite verification error:', error);
        return NextResponse.redirect(
          new URL(`/signin?message=${encodeURIComponent('Invalid or expired invitation link. Please request a new invitation.')}`, origin)
        );
      }

      if (data.user) {
        console.log('Invite verification successful for user:', data.user.id);
        console.log('User metadata:', data.user.user_metadata);
        
        // Check if user has completed onboarding
        const isOnboarded = data.user.user_metadata?.onboarded;
        
        // Create response with proper redirect
        const redirectUrl = isOnboarded ? '/dashboard' : '/auth/onboarding';
        console.log('Redirecting to:', redirectUrl);
        
        const response = NextResponse.redirect(new URL(redirectUrl, origin));
        
        return response;
      }
      
      console.error('No user data returned from verification');
      return NextResponse.redirect(
        new URL(`/signin?message=${encodeURIComponent('Verification failed - no user data')}`, origin)
      );
    } else {
      // Handle other verification types (email, recovery, etc.)
      const { data, error } = await supabase.auth.verifyOtp({
        type: type as 'email' | 'recovery' | 'email_change',
        token_hash: actualToken,
      });

      if (error) {
        console.error('Verification error:', error);
        return NextResponse.redirect(
          new URL(`/signin?message=${encodeURIComponent('Verification failed')}`, origin)
        );
      }

      if (data.user) {
        const response = NextResponse.redirect(new URL(redirect_to || '/dashboard', origin));
        return response;
      }
    }

    // If we get here, something went wrong
    return NextResponse.redirect(
      new URL(`/signin?message=${encodeURIComponent('Email link is invalid or has expired')}`, origin)
    );

  } catch (error) {
    console.error('Unexpected verification error:', error);
    return NextResponse.redirect(new URL('/signin?message=Verification failed', origin));
  }
}