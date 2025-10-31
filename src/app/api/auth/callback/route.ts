import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/';

  console.log('Auth callback called with params:', {
    code: code ? 'present' : 'missing',
    token_hash: token_hash ? 'present' : 'missing',
    type,
    allParams: Object.fromEntries(searchParams.entries())
  });

  const supabase = await createClient();

  // Handle PKCE flow (code exchange)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(new URL('/signin?message=Authentication failed', origin));
    }

    if (data.user) {
      console.log('Session established for user:', data.user.id);
      
      // Check if user needs onboarding
      const isOnboarded = data.user.user_metadata?.onboarded;
      const redirectUrl = isOnboarded ? '/dashboard' : '/auth/onboarding';
      
      console.log('Redirecting to:', redirectUrl);
      return NextResponse.redirect(new URL(redirectUrl, origin));
    }
  }

  // Handle invite link with token_hash (OTP flow)
  if (token_hash && type === 'invite') {
    console.log('Processing invite with token_hash');
    
    const { data, error } = await supabase.auth.verifyOtp({
      type: 'invite',
      token_hash: token_hash,
    });

    if (error) {
      console.error('Invite verification error:', error);
      return NextResponse.redirect(
        new URL(`/signin?message=${encodeURIComponent('Invalid or expired invitation link')}`, origin)
      );
    }

    if (data.user) {
      console.log('Invite verified for user:', data.user.id);
      
      // Check if user needs onboarding
      const isOnboarded = data.user.user_metadata?.onboarded;
      const redirectUrl = isOnboarded ? '/dashboard' : '/auth/onboarding';
      
      console.log('Redirecting to:', redirectUrl);
      return NextResponse.redirect(new URL(redirectUrl, origin));
    }
  }

  // No valid parameters found
  console.log('No valid auth parameters found, redirecting to:', next);
  return NextResponse.redirect(new URL(next, origin));
}
