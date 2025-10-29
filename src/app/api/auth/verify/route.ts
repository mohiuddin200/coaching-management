import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const redirect_to = searchParams.get('redirect_to');
  
  console.log('Verification called with params:', { token, type, redirect_to });
  
  if (!token || !type) {
    return NextResponse.redirect(new URL('/signin?message=Invalid verification link', origin));
  }

  const supabase = await createClient();

  try {
    if (type === 'invite') {
      // For invite links, we need to verify using the token directly
      // First try as token_hash (newer format)
      const verificationResult = await supabase.auth.verifyOtp({
        type: 'invite',
        token_hash: token,
      });

      // If that fails, the token might be in the older format
      if (verificationResult.error) {
        console.log('Token hash verification failed, trying direct API call');
        
        // Try direct verification via Supabase API
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            },
            body: JSON.stringify({
              type: 'invite',
              token: token,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            
            // Set the session in our Supabase client
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: result.access_token,
              refresh_token: result.refresh_token,
            });

            if (!sessionError) {
              console.log('Direct verification successful');
              return NextResponse.redirect(new URL('/auth/onboarding', origin));
            } else {
              console.error('Session setting error:', sessionError);
            }
          } else {
            console.error('Direct verification failed:', await response.text());
          }
        } catch (directError) {
          console.error('Direct verification error:', directError);
        }
      } else {
        // Token hash verification succeeded
        console.log('Token hash verification successful');
        const { data } = verificationResult;

        if (data.user) {
          const isOnboarded = data.user.user_metadata.onboarded;
          
          if (!isOnboarded) {
            return NextResponse.redirect(new URL('/auth/onboarding', origin));
          } else {
            return NextResponse.redirect(new URL('/dashboard', origin));
          }
        }
      }
    } else {
      // Handle other verification types
      const verificationResult = await supabase.auth.verifyOtp({
        type: type as 'email' | 'recovery' | 'email_change',
        token_hash: token,
      });

      const { data, error } = verificationResult;

      if (error) {
        console.error('Verification error:', error);
        return NextResponse.redirect(new URL(`/signin?message=${encodeURIComponent('Verification failed')}`, origin));
      }

      if (data.user) {
        return NextResponse.redirect(new URL('/dashboard', origin));
      }
    }

    // If we get here, something went wrong
    return NextResponse.redirect(new URL(`/signin?message=${encodeURIComponent('Email link is invalid or has expired')}`, origin));

  } catch (error) {
    console.error('Unexpected verification error:', error);
    return NextResponse.redirect(new URL('/signin?message=Verification failed', origin));
  }
}