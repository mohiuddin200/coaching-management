"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "./actions";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Error/Loading state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // --- All your client-side validation is still good ---
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    setLoading(true);

    try {
      // --- PART 1: Create FormData with ALL data ---
      const formData = new FormData();
      formData.append('firstName', firstName.trim());
      formData.append('lastName', lastName.trim());
      // Add the password to the FormData
      formData.append('password', password); 
      
      // --- PART 2: Call the Server Action ---
      // All logic (password + profile) is now in the action
      const actionResponse = await completeOnboarding(formData);

      if (actionResponse?.error) {
        // This error came from our Server Action
        throw new Error(actionResponse.error);
      }

      // The server action will handle the redirect on success.
      // We'll just catch errors here.
    } catch (e: unknown) {
      console.error("Onboarding failed:", e);
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      // Always stop loading, even if the redirect is just about to happen
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-2 text-2xl font-bold text-center">Complete Your Account Setup</h2>
        <p className="mb-6 text-center text-gray-600">Welcome! Please set your password and profile details to continue.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 w-full rounded-md border p-2 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 w-full rounded-md border p-2 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

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
