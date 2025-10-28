import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "./sign-out-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="rounded-lg bg-white p-8 shadow-md max-w-md w-full">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-lg text-gray-600">Welcome, {user.user_metadata.first_name || user.email}!</p>
          </div>
          <SignOutButton />
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="font-semibold mb-2">Your Profile</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">Role:</span> {user.user_metadata.role || 'Student'}</p>
            <p><span className="font-medium">Name:</span> {user.user_metadata.first_name} {user.user_metadata.last_name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
