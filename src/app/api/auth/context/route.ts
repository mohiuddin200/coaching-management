/**
 * User Context API Endpoint
 * Returns the current user's organization, role, and permissions
 */

import { NextResponse } from "next/server";
import { getCurrentUserContext } from "@/lib/permissions/server";

export async function GET() {
  try {
    const context = await getCurrentUserContext();

    if (!context) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json(context);
  } catch (error) {
    console.error("Error getting user context:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
