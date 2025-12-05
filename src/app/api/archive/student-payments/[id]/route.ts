import { NextRequest, NextResponse } from "next/server";
import { restoreStudentPayment, permanentDeleteStudentPayment } from "@/lib/payment-soft-delete";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST - Restore archived student payment
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check if user is authenticated and is an admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!user.user_metadata?.role || user.user_metadata.role !== "Admin") {
      return NextResponse.json(
        { error: "Unauthorized: Only Admin users can restore payments" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const result = await restoreStudentPayment(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: result.message
    });
  } catch (error) {
    console.error("Error restoring student payment:", error);
    return NextResponse.json(
      { error: "Failed to restore student payment" },
      { status: 500 }
    );
  }
}

// DELETE - Permanently delete archived student payment
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check if user is authenticated and is an admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!user.user_metadata?.role || user.user_metadata.role !== "Admin") {
      return NextResponse.json(
        { error: "Unauthorized: Only Admin users can permanently delete payments" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const result = await permanentDeleteStudentPayment(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: result.message
    });
  } catch (error) {
    console.error("Error permanently deleting student payment:", error);
    return NextResponse.json(
      { error: "Failed to permanently delete student payment" },
      { status: 500 }
    );
  }
}