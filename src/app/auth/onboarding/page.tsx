"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "./actions";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  // Form state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userName, setUserName] = useState("");

  // Error/Loading state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error('No authenticated user found:', error);
          router.push('/signin?message=Please use your invitation link to access this page');
          return;
        }
        
        // Check if already onboarded
        if (user.user_metadata?.onboarded) {
          router.push('/dashboard');
          return;
        }
        
        // Set the user's name from metadata
        const firstName = user.user_metadata?.firstName || '';
        const lastName = user.user_metadata?.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim() || user.email?.split('@')[0] || 'User';
        setUserName(fullName);
        
        setChecking(false);
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/signin?message=Authentication error');
      }
    };

    checkAuth();
  }, [supabase, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // Client-side validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // Create FormData with password only
      const formData = new FormData();
      formData.append('password', password); 
      
      // Call the Server Action
      const actionResponse = await completeOnboarding(formData);

      if (actionResponse?.error) {
        throw new Error(actionResponse.error);
      }

      // The server action will handle the redirect on success
    } catch (e: unknown) {
      console.error("Onboarding failed:", e);
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-2 text-2xl font-bold text-center">Complete Your Account Setup</h2>
        <p className="mb-2 text-center text-gray-600">Welcome, <span className="font-semibold">{userName}</span>!</p>
        <p className="mb-6 text-center text-gray-600 text-sm">Please set your password to continue.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="mt-1 w-full rounded-md border p-2 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="mt-1 w-full rounded-md border p-2 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Setting up your account..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
